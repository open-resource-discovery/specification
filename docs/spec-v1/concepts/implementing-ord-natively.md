---
sidebar_position: 5
title: Implementing ORD Natively
description: Guidance for developers implementing an ORD Provider API inside an application or service.
---

# Implementing ORD Natively

This page explains how to implement ORD directly inside an application or service.
It is written for developers who need to expose an [ORD Provider API](../index.md#ord-provider-api).

The main implementation task is to transform the metadata your application already knows into:

- an [ORD configuration](../index.md#ord-configuration-endpoint), served from `/.well-known/open-resource-discovery`
- one or more [ORD documents](../index.md#ord-document), served via `GET` endpoints
- the resource definitions referenced by those ORD documents, for example OpenAPI or AsyncAPI files

## Start Simple: Static ORD

The simplest provider is only a small HTTP API that serves static JSON.
If you only need to publish static metadata documents, the [ORD Provider Server](https://github.com/open-resource-discovery/provider-server) could be used instead of implementing a provider API inside your application.
To understand how this is implemented, the [no-auth implementation example](https://github.com/open-resource-discovery/specification/tree/main/examples/implementation/no-auth) demonstrates:

1. `GET /.well-known/open-resource-discovery` returns an ORD configuration.
2. The configuration lists one ORD document URL.
3. `GET /ord/documents/1.json` returns the ORD document.
4. Resource definitions referenced by the document, for example an OpenAPI file, are served from stable URLs.

The core of such a provider can be very small:

```js
const http = require("node:http");

const ordConfig = {
  openResourceDiscoveryV1: {
    documents: [
      {
        url: "/ord/documents/1.json",
        perspective: "system-version",
        accessStrategies: [{ type: "open" }],
      },
    ],
  },
};

const ordDocument = require("../../documents/document-1.json");
const openApiDocument = require("../nginx-no-auth/metadata/astronomy-v1.oas3.json");

http
  .createServer((req, res) => {
    if (req.method === "GET" && req.url === "/.well-known/open-resource-discovery") {
      return jsonResponse(res, ordConfig);
    }
    if (req.method === "GET" && req.url === "/ord/documents/1.json") {
      return jsonResponse(res, ordDocument);
    }
    if (req.method === "GET" && req.url === "/ord/metadata/astronomy-v1.oas3.json") {
      return jsonResponse(res, openApiDocument);
    }

    res.writeHead(404).end();
  })
  .listen(8080);

function jsonResponse(res, body) {
  res.setHeader("Content-Type", "application/json");
  res.writeHead(200).end(JSON.stringify(body));
}
```

This is enough when the metadata is fully known at design-time or deploy-time and does not depend on a tenant, feature toggle, customization, extension, or runtime configuration.
For a production implementation, still consider:

- validation of ORD documents and referenced resource definitions during build or startup
- `ETag` support, so aggregators can efficiently detect unchanged metadata
- access protection, if the metadata is not public
- using the correct static [perspective](./perspectives.md), usually `system-version` or `system-type`

A static implementation is a good starting point because it proves the transport and schema model.
Most real applications, however, need to generate at least part of the response from application metadata.

## Static and Dynamic Perspectives

An ORD provider can expose both static and dynamic metadata.
The static document describes what a system type or system version provides in general.
The dynamic document describes what one concrete system instance actually provides at runtime.
Providers advertise these documents separately in the ORD configuration, because aggregators can handle them differently.
Static metadata can usually be fetched once per system type or version.
Dynamic metadata must be fetched for the requested system instance.

The `system-version` document should be complete for that version of the application.
It must not require tenant context and should not contain tenant-specific customizations.
It should include `describedSystemVersion.version` when the application has a meaningful version.
If the application is not versioned, consider using `system-type` perspective instead.

```http
GET /open-resource-discovery/v1/documents/system-version HTTP/1.1
```

The `system-instance` document should be complete for the selected system instance.
It is not a patch or diff on top of the static document.
If the CRM API is not enabled for tenant `T2`, the tenant-specific document for `T2` should not describe the CRM API.
If tenant `T1` extends the Customer model with additional fields, the tenant-specific resource definition for `T1` should expose those fields.

```http
GET /open-resource-discovery/v1/documents/system-instance HTTP/1.1
Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=
Global-Tenant-Id: c6c80b52-ecc1-47f8-9303-0d55fb67fd41
```

The static and dynamic perspectives do not have to be served by the same technical implementation.
For example, static metadata can be published through a static ORD Provider or a content publishing pipeline, while the application only implements the tenant-aware `system-instance` endpoint.
This is valid as long as both perspectives use the same ORD IDs for the same resources and do not diverge semantically.

See [Perspectives](./perspectives.md) for the detailed semantics and aggregator fallback behavior.
The next section shows one way to implement this in code.

## Implementing Tenant-Aware ORD

The tenant-aware implementation has three essential parts:

1. Advertise a static document and a tenant-aware document in the ORD configuration.
2. Resolve the requested tenant in the `system-instance` endpoint.
3. Generate a complete tenant-specific ORD document and tenant-specific resource definitions.

The following snippets are simplified from the [ORD Reference Application](https://github.com/open-resource-discovery/reference-application).

### Advertise both perspectives

The `.well-known` response tells the aggregator that static metadata can be fetched once, while dynamic metadata must be fetched per tenant.

```js
const ordConfiguration = {
  openResourceDiscoveryV1: {
    documents: [
      {
        // Static baseline metadata: can be crawled once per system version.
        url: "/open-resource-discovery/v1/documents/system-version",
        perspective: "system-version",
        accessStrategies: [{ type: "open" }],
      },
      {
        // Runtime metadata: must be requested for a concrete tenant/system instance.
        url: "/open-resource-discovery/v1/documents/system-instance",
        perspective: "system-instance",
        accessStrategies: [{ type: "basic-auth" }],
      },
    ],
  },
};
```

### Resolve the tenant in the endpoint

The endpoint should prefer `Global-Tenant-Id`, because this is the tenant identity known by the aggregator.
The provider maps it to its own local tenant ID before generating metadata.

```js
const globalToLocalTenantId = {
  "c6c80b52-ecc1-47f8-9303-0d55fb67fd41": "T1",
  "b82b0c76-f0ff-4262-b2b7-3a0d40197837": "T2",
};

fastify.get("/.well-known/open-resource-discovery", () => {
  // Discovery starts here: the aggregator learns which ORD documents exist.
  return ordConfiguration;
});

fastify.get("/open-resource-discovery/v1/documents/system-version", () => {
  // Static perspective: no tenant context is needed.
  return staticOrdDocument;
});

fastify.get("/open-resource-discovery/v1/documents/system-instance", {
  // In a real implementation, this route is protected according to the
  // basic-auth access strategy advertised in the ORD configuration.
  preHandler: [basicAuth],
}, (request) => {
  // Dynamic perspective: tenant context is required before metadata is generated.
  const localTenantId = resolveLocalTenantId(request.headers);
  return getOrdDocumentForTenant(localTenantId);
});

function resolveLocalTenantId(headers) {
  // [...] Map from headers with either global or local tenant ID to the local tenant ID.
  if (localTenantId) {
    return localTenantId;
  }
  throw new Error("Missing Global-Tenant-Id or Local-Tenant-Id header.");
}
```

### Project the static document into a tenant document

The static document can be used as a baseline if tenants only enable, disable, configure, or extend shared resources.
The `system-instance` response must still be a complete document for the tenant, not a delta.

```js
/** tenant-specific config and extensions */
const tenants = {
  T1: {
    enabledApis: ["crm"],
    fieldExtensions: {
      Customer: {
        customT1Field1: {
          type: "string",
          description: "Custom Field 1",
        },
      },
    },
  },
  T2: {
    enabledApis: [],
  },
};

function getOrdDocumentForTenant(tenantId) {
  // Start from the static baseline, then project it into the tenant context.
  const tenantDocument = structuredClone(staticOrdDocument);
  const tenantConfig = tenants[tenantId];

  // The generated document is now a complete system-instance perspective document.
  tenantDocument.perspective = "system-instance";
  tenantDocument.describedSystemInstance = {
    localId: tenantId,
  };

  // Resources that do not exist for this tenant must be set to `disabled` or not be described.
  removeUnavailableResources(tenantDocument, tenantConfig);

  return tenantDocument;
}
```

In this example, tenant `T1` receives the CRM API resource and tenant `T2` does not.
Other applications may derive the tenant document from a tenant-specific metamodel instead of filtering a static baseline.
Some applications allow the end-user to even create new resources like APIs, which would have to be added on top of the static baseline.

### Generate tenant-specific resource definitions

If a resource definition is tenant-specific, such as an OpenAPI document with custom fields, it needs the same tenant resolution behavior as the ORD document endpoint.
The ORD resource definition should advertise the same access strategy and tenant header convention as the tenant-aware ORD document.
The OpenAPI endpoint then uses the tenant configuration to extend the schema.

```js
fastify.get("/crm/v1/openapi/oas3.json", {
  preHandler: [basicAuth],
}, (request) => {
  // Use the same tenant resolution as the ORD document endpoint.
  const localTenantId = resolveLocalTenantId(request.headers);
  return getCrmOpenApiForTenant(localTenantId);
});

function getCrmOpenApiForTenant(tenantId) {
  // Resource definitions must describe the same tenant-specific contract
  // that the ORD document points to.
  const openApi = structuredClone(staticCrmOpenApi);
  const customerExtensions = tenants[tenantId].fieldExtensions?.Customer ?? {};

  Object.assign(
    openApi.components.schemas.Customer.properties,
    customerExtensions,
  );

  return openApi;
}
```

The important rule is simple: the ORD document and the files it links to must describe the same tenant.
If a tenant-specific ORD document includes an API, and the OpenAPI is different for that tenant, it also must be generated for that tenant.
If a resource is not available for a tenant, leave it out of that tenant's ORD document or set it as `disabled`.

For tenant-aware ORD, make sure the implementation clearly does these things:

- advertise static and dynamic perspectives separately
- resolve the tenant before generating `system-instance` metadata
- map aggregator tenant IDs to local tenant IDs deliberately
- generate a complete tenant-specific ORD document, not a delta
- generate tenant-specific resource definitions with the same tenant context


<!-- TODO: Complete Guide with code snippets how to implement the tenant-aware feature -->

<!-- ## A Practical Native Provider Shape

A native ORD provider typically has four layers.

### 1. Endpoint Layer

The endpoint layer is deliberately small.
It exposes the well-known configuration endpoint, ORD document endpoints, and referenced resource definition endpoints.

For dynamic metadata, this layer also resolves the request context:

- Which tenant or system instance is requested?
- Which external tenant identifier must be mapped to an internal tenant identifier?
- Which user or technical client is allowed to retrieve the metadata?
- Which access strategy from the ORD document is being used?

Keep this layer thin.
It should route requests, validate input, resolve context, and delegate metadata construction.

### 2. Metadata Source Layer

This layer knows where metadata comes from in your application.
Depending on your architecture, the source may be:

- static files maintained by developers
- configuration records stored as data
- tenant configuration, feature toggles, extension registries, or entitlement data
- internal API, event, and domain model registries
- code annotations, decorators, or reflection over classes and interfaces
- generated artifacts from OpenAPI, AsyncAPI, GraphQL, or event catalog tooling

There is no single correct source model.
ORD does not require all applications to store metadata the same way.
The important part is that the provider can produce a coherent ORD document for the requested perspective.

### 3. Mapping Layer

The mapping layer converts application metadata into ORD concepts:

- products, packages, consumption bundles, and groups
- API resources, event resources, data products, and agents
- entity types and other taxonomy
- resource definition links and access strategies
- release status, visibility, versions, lifecycle state, and tombstones

This is where most implementation decisions belong.
For example, an internal service registry entry may become an `apiResource`, a business object model may become an `entityType`, and an entitlement may decide whether a resource appears in a tenant-specific document.

### 4. Validation and Serialization Layer

Before returning metadata, the provider should validate that it produces valid ORD and valid resource definitions.
For static metadata, validation can happen in CI or at application startup.
For dynamic metadata, validation may need to happen in tests against representative tenant configurations, with additional runtime safeguards.

The provider should return stable JSON where possible.
Stable ordering and deterministic generation make `ETag` calculation, diffing, troubleshooting, and aggregator behavior easier.

## Reference Pattern: Static Baseline with Tenant-Specific Projection

The ORD reference application follows a useful implementation pattern:

1. Build a complete static ORD document for the application version.
2. Advertise it with the `system-version` perspective and an open access strategy.
3. Advertise a second endpoint for the `system-instance` perspective.
4. Protect the dynamic endpoint with the `basic-auth` access strategy and select the tenant via `Global-Tenant-Id` or, if agreed, `Local-Tenant-Id`.
5. Generate the tenant-specific document from the static baseline plus tenant configuration.

In this pattern, the static baseline contains resources such as packages, API resources, event resources, entity types, resource definitions, and tombstones.
The dynamic endpoint then projects that baseline into the requested tenant context.

For example:

- Tenant `T1` has the CRM API enabled, so the tenant-specific ORD document includes the CRM API resource.
- Tenant `T2` does not have the CRM API enabled, so the tenant-specific ORD document omits that API resource.
- The CRM OpenAPI definition can also be generated per tenant, so tenant-specific field extensions appear in the resource definition, not only in the ORD document.

This pattern works well when the application has a mostly shared metamodel and tenants only enable, disable, configure, or extend parts of it.
It keeps the static metadata useful for catalogs while still allowing precise runtime discovery for a concrete system instance.

## Other Architecture Patterns

Different applications create metadata in different ways.
That should influence the ORD implementation design.

### Static Metadata as Source

Some services already maintain OpenAPI, AsyncAPI, and ORD-like metadata as files.
In that case, the provider can load the files at startup, validate them, and serve them directly.
This is simple and reliable, but it only works if runtime behavior does not materially differ per tenant.

If small dynamic additions are needed, avoid ad hoc string editing.
Load the metadata as structured data, apply a typed transformation, validate the result, then serialize it.

### Static Baseline plus Tenant Configuration

This is the reference application pattern.
Use it when the application has common resources, but tenants influence availability or shape through entitlements, feature switches, extensions, or configuration.

Typical implementation steps:

1. Generate or maintain the static `system-version` document.
2. Resolve the requested tenant.
3. Load tenant configuration and extension metadata.
4. Filter unavailable resources.
5. Add or adjust tenant-specific resource definitions.
6. Return a complete `system-instance` document.

This pattern is often the best first native implementation for multi-tenant SaaS applications.

### Tenant-Specific Metamodel

Some platforms allow tenants to define most of the model themselves.
For example, tenants may create custom objects, custom APIs, custom events, or tenant-local workflows.
In this case, the `system-instance` document cannot be treated as a small variation of a static baseline.

The provider should instead generate ORD from the tenant's actual metamodel.
The static perspective may still describe the platform capabilities, standard APIs, extension mechanisms, and stable contracts.
The dynamic perspective describes the concrete tenant-created resources.

This model needs stronger lifecycle handling:

- stable ORD IDs for tenant-created resources
- clear versioning rules for generated resources
- tombstones when tenant-created resources are deleted
- validation for user-created metadata
- access checks, because tenant-specific metadata is often sensitive

### Internal Metamodel Derivation

Some applications have a rich internal model: service definitions, domain objects, event catalogs, authorization scopes, lifecycle state, and package assignments.
In this case, ORD should usually be generated from that model rather than maintained separately.

This gives high consistency, but the mapping needs governance.
Not every internal detail should become public ORD metadata.
The provider should intentionally decide which internal concepts are exposed, under which visibility, and with which lifecycle status.

### Code Annotations and Reflection

Framework-based applications may derive metadata from classes, annotations, decorators, routes, or handlers.
This can reduce duplication and keep metadata close to implementation code.

Reflection-based approaches work best when the framework already has strong conventions for:

- endpoint registration
- request and response schemas
- event publishing
- domain models
- authorization and visibility
- versioning and deprecation

If those conventions are weak, reflected metadata may be incomplete.
In that case, combine reflection with explicit metadata annotations or external metadata files.

### Metadata Written as Data

Some applications already store metadata in database tables or configuration services.
This can be a good fit for ORD, especially when the metadata changes at runtime.

The main risk is publishing inconsistent intermediate states.
The ORD provider should read metadata from a consistent snapshot or versioned configuration state.
If administrators can change metadata interactively, consider validation before activation rather than only validating when the ORD endpoint is called.

## Implementation Checklist

- Decide which metadata is useful for consumers, instead of exposing every internal detail.
- Decide which perspectives you support: `system-type`, `system-version`, `system-instance`, or `system-independent`.
- Keep static and dynamic documents separate when both exist.
- Make every ORD document complete for its perspective.
- Use stable ORD IDs and stable URLs for documents and resource definitions.
- Define how tenant or system-instance context is selected for dynamic metadata.
- Map external tenant identifiers to internal tenant identifiers deliberately.
- Ensure referenced resource definitions follow the same perspective as the ORD resource when they are tenant-specific.
- Validate ORD and resource definitions before publishing them.
- Use `ETag` or equivalent caching support.
- Add tests for representative tenants, feature configurations, extensions, disabled resources, and deleted resources.

## Possible Enhancements

After a first native implementation works, consider adding:

- automated generation from your framework or internal metamodel
- CI checks that validate static metadata and common tenant projections
- contract tests that compare ORD resources with actual registered routes and event publishers
- deterministic snapshots for generated documents
- a preview or diagnostics endpoint for administrators
- metrics for aggregator calls, validation failures, tenant resolution failures, and generation latency
- explicit lifecycle handling for resources that are deprecated or removed
- documentation for standard or custom access strategies used to protect metadata and select tenants

Native ORD implementation is less about writing many endpoints and more about deciding how your application's metadata model is exposed.
Start with a static, valid provider; then add dynamic `system-instance` generation only where the runtime system really differs. -->
