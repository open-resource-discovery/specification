---
sidebar_position: 5
title: Implementing ORD Natively
description: Guidance for developers implementing an ORD Provider API inside an application or service.
---

# Implementing ORD Natively

This page explains how to implement ORD directly inside an application or service.
It is written for developers who need to expose an [ORD Provider API](../index.md#ord-provider-api).

Ideally, ORD support is provided at the framework level so that individual applications get it automatically.
For example, the [CAP ORD plugin](https://github.com/cap-js/ord) adds ORD to any CAP-based application.
When no framework plugin exists, the patterns below show how to implement ORD natively.

This guide is accompanied by the [ORD Reference Application](https://github.com/open-resource-discovery/reference-application), a working Fastify/TypeScript implementation of the patterns described here.

The main implementation task is to transform the metadata your application already knows into:

- an [ORD configuration](../index.md#ord-configuration-endpoint), served from `/.well-known/open-resource-discovery`
- one or more [ORD documents](../index.md#ord-document), served via `GET` endpoints
- the [resource definitions](../index.md#resource-definition) referenced by those ORD documents, for example OpenAPI or AsyncAPI files

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

const ordDocument = require("./ord-document.json"); // your ORD document
const openApiDocument = require("./astronomy-v1.oas3.json"); // a referenced resource definition

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

This is enough when metadata does not change at runtime and does not depend on tenant state.
For a production implementation, still consider:

- validation of ORD documents and referenced resource definitions during build or startup
- [`ETag` support](../index.md#ord-provider-cache-handling), so aggregators can efficiently detect unchanged metadata
- access protection, if the metadata is not public
- using the correct static [perspective](./perspectives.md), usually `system-version` or `system-type`

A static implementation is a good starting point because it proves the transport and schema model.
Most real applications, however, need to generate at least part of the response from application metadata.

## Static and Dynamic Perspectives

An ORD provider can expose both static and dynamic metadata.
The static document describes what a system type or version provides in general — it is fetched once.
The dynamic document describes what a concrete system instance provides at runtime, including tenant-specific state — it is fetched per system instance.
Providers advertise these separately in the ORD configuration so that aggregators can handle them differently.

The `system-version` document should be complete for that version of the application.
It must not require tenant context and should not contain tenant-specific customizations.
It should include `describedSystemVersion.version` when the application has a meaningful version.
If the application is not versioned, consider using `system-type` perspective instead.

```http
GET /open-resource-discovery/v1/documents/system-version HTTP/1.1
```

The `system-instance` document should be complete for the selected system instance.
Even when it is generated from the static baseline, it is not returned as a patch or diff.
If the CRM API is not enabled for tenant `T2`, the tenant-specific document for `T2` should not describe the CRM API.
If tenant `T1` extends the Customer model with additional fields, the tenant-specific resource definition for `T1` should expose those fields.

```http
GET /open-resource-discovery/v1/documents/system-instance HTTP/1.1
Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=
Global-Tenant-Id: c6c80b52-ecc1-47f8-9303-0d55fb67fd41
```

Static and dynamic perspectives can be served by different implementations — for example, a static ORD Provider for the baseline and application code for the `system-instance` endpoint — as long as both use the same ORD IDs for the same resources.

See [Perspectives](./perspectives.md) and [Correct Use of Perspectives](../index.md#correct-use-of-perspectives) for the detailed semantics and aggregator fallback behavior.
The next section shows one way to implement this in code.

## Implementing Tenant-Aware ORD

The tenant-aware implementation has three essential parts:

1. Advertise a static baseline document and a tenant-aware document in the ORD configuration.
2. Resolve the requested tenant in the `system-instance` endpoint.
3. Generate a complete tenant-specific ORD document and tenant-specific resource definitions from the baseline plus tenant state.

The following snippets are simplified from the [ORD Reference Application](https://github.com/open-resource-discovery/reference-application).

```mermaid
flowchart LR
    Shared["Shared application metadata<br/>version, APIs, events,<br/>entities, packages"]
    Baseline["Static ORD baseline<br/>system-version or system-type"]
    TenantState["Tenant state<br/>configuration, entitlements,<br/>extensions, custom model"]
    Projection["Tenant projection"]
    Dynamic["Tenant ORD view<br/>system-instance"]
    Aggregator["ORD Aggregator"]

    Shared --> Baseline
    Baseline --> Projection
    TenantState --> Projection
    Projection --> Dynamic
    Baseline --> Aggregator
    Dynamic --> Aggregator
```

### Advertise both perspectives

The `.well-known` response tells the aggregator that static metadata can be fetched once, while dynamic metadata must be fetched per tenant.
The dynamic endpoint uses the [basic-auth access strategy](../../spec-extensions/access-strategies/basic-auth.md), which also defines the optional tenant headers used below.

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
  const localTenantId =
    headers["local-tenant-id"] ??
    globalToLocalTenantId[headers["global-tenant-id"]];

  if (localTenantId) {
    return localTenantId;
  }
  throw new Error("Missing Global-Tenant-Id or Local-Tenant-Id header.");
}
```

### Project the static baseline into a tenant document

The static document is the baseline for the tenant-aware view.
The tenant projection then applies tenant configuration, entitlements, extensions, or tenant-specific model data.
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

  // Resources that do not exist for this tenant must not be described.
  removeUnavailableResources(tenantDocument, tenantConfig);

  return tenantDocument;
}
```

In this example, tenant `T1` receives the CRM API and `T2` does not.
Other applications may also add tenant-specific resources — for example from a tenant metamodel or end-user-created APIs — on top of the static baseline.

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

The ORD document and the resource definitions it links to must always describe the same tenant.
If a tenant-specific ORD document references an API whose OpenAPI definition varies per tenant, that definition must also be generated for that tenant.
If a resource does not exist for a tenant, omit it from that tenant's ORD document.
Use `disabled` only when the resource exists for the tenant but is currently not available for consumption.

For tenant-aware ORD, make sure the implementation clearly does these things:

- advertise static and dynamic perspectives separately
- resolve the tenant before generating `system-instance` metadata
- map aggregator tenant IDs to local tenant IDs deliberately
- generate a complete tenant-specific ORD document, not a delta
- generate tenant-specific resource definitions with the same tenant context

## Validation and Production Readiness

Before going to production, verify that the provider returns correct ORD and correct resource definitions.
For static metadata, validation can run in CI or at application startup.
For dynamic metadata, test against representative tenant configurations.

- Validate ORD documents against the [ORD Document JSON Schema](https://open-resource-discovery.org/spec-v1/interfaces/Document.schema.json) during build or startup.
- Validate resource definitions (OpenAPI, AsyncAPI) with their respective tooling.
- Test that the configuration endpoint returns all expected document entries.
- Test that each ORD document URL resolves and returns a valid document.
- Test that resource definition URLs referenced in ORD documents resolve.
- For tenant-aware providers, test at least one tenant with enabled resources and one with disabled resources.
- Produce stable, deterministic JSON output — stable ordering makes [`ETag` calculation](../index.md#ord-provider-cache-handling), diffing, and troubleshooting easier.
