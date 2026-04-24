---
sidebar_position: 5
description: How to describe resources that are shared across multiple system types using authority namespaces.
---

# Shared Resources Across System Types

## Summary

Different [system types](../index.md#system-type) can be built from the same software components, deployed in different combinations and versions.
When the same API contract or event definition originates from a shared component, it represents the same resource — regardless of which system type exposes it.

ORD supports this through [authority namespaces](../index.md#authority-namespace).
Resources that are shared across system types use an authority namespace in their [ORD ID](../index.md#ord-id), rather than a [system namespace](../index.md#system-namespace).
The authority namespace represents the organizational unit that governs the shared contract.

## Motivation

A [system namespace](../index.md#system-namespace) corresponds 1:1 to a [system type](../index.md#system-type).
This works well when a resource is specific to one system type.
But software is often built from reusable components, and different system types may expose the same API or event contract because they include the same component.

Without shared ORD IDs, each system type would describe the same contract under a different ORD ID (e.g. `sap.s4:apiResource:SalesOrder:v1` vs `sap.s4cloud:apiResource:SalesOrder:v1`).
This creates a false distinction — the contract is the same, only the deployment topology differs.
It also complicates [integration dependencies](./integration-dependency.md): a consumer that depends on the SalesOrder API would need to list every system-type-specific variant.

## Solution: Authority Namespaces for Shared Resources

The [authority namespace](../index.md#authority-namespace) already exists in ORD for cross-system governance, and is used for [Entity Types](./grouping-and-bundling.md#entity-type) that are aligned across applications (e.g. `sap.odm:entityType:BusinessPartner:v1`).

The same mechanism extends to all ORD resource types: when a resource represents a shared contract across multiple system types, it SHOULD use an authority namespace.

**Example**: If both `sap.s4` and `sap.s4cloud` system types expose the same Sales Order API from a shared component governed by a `sap.sales` authority, the ORD ID would be:

```
sap.sales:apiResource:SalesOrder:v1
```

Both system types publish this ORD ID. The [Consumption Bundle](./grouping-and-bundling.md#consumption-bundle) — which describes system-type-specific access (authentication, endpoints) — remains under the respective system namespace.

### When to Use Authority vs System Namespace

| Scenario | Namespace to use |
| --- | --- |
| Resource is specific to a single system type | [System namespace](../index.md#system-namespace) |
| Resource represents a shared contract across multiple system types | [Authority namespace](../index.md#authority-namespace) |
| Entity Type aligned across applications (e.g. a common domain model) | [Authority namespace](../index.md#authority-namespace) |

The choice depends on the **ownership and governance** of the resource contract, not on which system happens to deploy it.

## Rules for Publishers

- A resource SHOULD use an authority namespace when the same contract is published by multiple system types.
- All system types publishing the same authority-namespaced ORD ID with the same `version` MUST describe the resource identically (same resource definitions, same metadata).
  Minor differences in system-type-specific concerns (like entry points) are acceptable, as those are resolved via [Consumption Bundles](./grouping-and-bundling.md#consumption-bundle) and system instance context.
- The authority namespace owner is responsible for ensuring contract consistency across all publishing system types.
- [Consumption Bundles](./grouping-and-bundling.md#consumption-bundle) SHOULD remain under the [system namespace](../index.md#system-namespace), because they describe system-type-specific access mechanisms (authentication, credential exchange, endpoints).
- [Packages](./grouping-and-bundling.md#package) that group shared resources SHOULD also use the authority namespace.

### Example: Two System Types Publishing Shared Resources

System type `sap.s4` publishes:

```json
{
  "describedSystemType": { "systemNamespace": "sap.s4" },
  "packages": [{
    "ordId": "sap.sales:package:SalesAPIs:v1",
    "vendor": "sap:vendor:SAP:"
  }],
  "apiResources": [{
    "ordId": "sap.sales:apiResource:SalesOrder:v1",
    "partOfPackage": "sap.sales:package:SalesAPIs:v1",
    "partOfConsumptionBundles": [
      { "ordId": "sap.s4:consumptionBundle:defaultAuth:v1" }
    ]
  }],
  "consumptionBundles": [{
    "ordId": "sap.s4:consumptionBundle:defaultAuth:v1"
  }]
}
```

System type `sap.s4cloud` publishes the same API resource, but with its own Consumption Bundle:

```json
{
  "describedSystemType": { "systemNamespace": "sap.s4cloud" },
  "packages": [{
    "ordId": "sap.sales:package:SalesAPIs:v1",
    "vendor": "sap:vendor:SAP:"
  }],
  "apiResources": [{
    "ordId": "sap.sales:apiResource:SalesOrder:v1",
    "partOfPackage": "sap.sales:package:SalesAPIs:v1",
    "partOfConsumptionBundles": [
      { "ordId": "sap.s4cloud:consumptionBundle:oauthAccess:v1" }
    ]
  }],
  "consumptionBundles": [{
    "ordId": "sap.s4cloud:consumptionBundle:oauthAccess:v1"
  }]
}
```

Note how the API resource (`sap.sales:apiResource:SalesOrder:v1`) is identical, but the Consumption Bundle differs per system type.

## Rules for Aggregators

### Taxonomy Merging

[Taxonomy](../index.md#ord-taxonomy) with authority-namespaced ORD IDs (Packages, Entity Types) follows the existing merging rules: same ORD ID = same entity, merged across all sources.

### Resource Merging

Resources with authority-namespaced ORD IDs follow the existing resource merging rules with one refinement:

- The same authority-namespaced ORD ID from **different system instances** (even across system types) MUST NOT be merged into one. Each system instance's resource is stored individually, qualified by the system instance ID.
- The same authority-namespaced ORD ID from the **same system instance** MUST be merged (higher version wins).
- The uniqueness validation ("MUST NOT be described multiple times") applies **within the same system type scope**, not globally. An authority-namespaced ORD ID appearing in multiple system types is expected and valid.
- The aggregator SHOULD validate that authority-namespaced resources with the same ORD ID and same `version` are described consistently across system types. Inconsistencies SHOULD be flagged as validation warnings.

### Static Catalogs

For static catalogs (using `system-type` or `system-version` perspectives):

- Authority-namespaced resources MAY appear from multiple system types.
- The catalog SHOULD present the resource once (as a shared contract) and associate it with all system types that publish it. This is similar to how [Products](./grouping-and-bundling.md#product) already allow multiple product assignments via `partOfProducts`.
- If different system types publish different versions of the same authority-namespaced resource, the catalog MUST store them per system type/version, as they represent different states of the contract.

## Rules for Consumers

- A dependency on an authority-namespaced ORD ID is satisfied by **any** system type that publishes it. This simplifies [Integration Dependencies](./integration-dependency.md): a single reference covers all system types providing that contract.
- To connect to a specific system, the consumer still needs the system-type-specific [Consumption Bundle](./grouping-and-bundling.md#consumption-bundle) and system instance context (entry points, authentication).
- When searching or filtering by ORD ID, authority-namespaced resources can be found regardless of which system type published them. Consumers can additionally filter by system type if needed.

## Relation to Other Concepts

### Consumption Bundles

[Consumption Bundles](./grouping-and-bundling.md#consumption-bundle) describe **how to access** resources — authentication mechanisms, credential exchange, entry points.
These are inherently system-type-specific and remain under the system namespace.

A shared API resource (authority namespace) can be part of different Consumption Bundles on different system types.
This cleanly separates **what the contract is** (authority-namespaced resource) from **how to connect** (system-namespaced Consumption Bundle).

### Products

[Products](./grouping-and-bundling.md#product) represent the commercial view and are already system-type-independent.
A shared API resource can be assigned to multiple products via `partOfProducts`, either directly or through Package inheritance.
This complements the authority namespace approach: the ORD ID identifies the technical contract, while the product assignment provides the commercial context.

### Integration Dependencies

[Integration Dependencies](./integration-dependency.md) benefit most from shared resources.
When an aspect references an authority-namespaced ORD ID, the dependency is automatically satisfied by any system type that publishes that contract:

```json
{
  "ordId": "sap.crm:integrationDependency:salesSync:v1",
  "aspects": [{
    "apiResources": [{
      "ordId": "sap.sales:apiResource:SalesOrder:v1"
    }]
  }]
}
```

Without authority namespaces, the same dependency would need to enumerate all system-type-specific variants as alternatives.

### System-Independent Perspective

Shared resources across system types are different from [system-independent](./perspectives.md#system-independent-perspective) content.
Shared resources still describe a system's capabilities and are published per system type, version, or instance.
System-independent content (Vendors, Products, global taxonomy) exists outside the system context entirely.
