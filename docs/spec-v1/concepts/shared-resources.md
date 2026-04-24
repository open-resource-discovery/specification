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

Consider the example of SAP S/4HANA (`sap.s4`) and SAP S/4HANA Private Cloud Edition (`sap.s4pce`).
Both system types are built on the same ABAP-based software components and therefore expose many of the same APIs.
Without shared ORD IDs, each system type would describe the same contract under a different ORD ID (e.g. `sap.s4:apiResource:BillOfMaterial:v1` vs `sap.s4pce:apiResource:BillOfMaterial:v1`).
This creates a false distinction — the contract is the same, only the deployment topology and product differ.
It also complicates [integration dependencies](./integration-dependency.md): a consumer that depends on the Bill of Material API would need to list every system-type-specific variant.

## Solution: Authority Namespaces for Shared Resources

The [authority namespace](../index.md#authority-namespace) already exists in ORD for cross-system governance, and is used for [Entity Types](./grouping-and-bundling.md#entity-type) that are aligned across applications (e.g. `sap.odm:entityType:BusinessPartner:v1`).

The same mechanism extends to all ORD resource types: when a resource represents a shared contract across multiple system types, it SHOULD use an authority namespace.

**Example**: If both `sap.s4` and `sap.s4pce` system types expose the same Bill of Material API originating from a shared ABAP component governed under the `sap.abap` authority, the ORD ID would be:

```
sap.abap:apiResource:BillOfMaterial:v1
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

Each system type MUST fully describe itself — including all shared resources it exposes.
This means the same authority-namespaced resource will effectively be described multiple times, once by each publishing system type.
Each system type provides a complete, self-contained ORD description; there is no implicit inheritance or delegation between system types.

- A resource SHOULD use an authority namespace when the same contract is published by multiple system types.
- All system types publishing the same authority-namespaced ORD ID with the same `version` MUST describe the resource identically (same resource definitions, same metadata).
  Minor differences in system-type-specific concerns (like entry points) are acceptable, as those are resolved via [Consumption Bundles](./grouping-and-bundling.md#consumption-bundle) and system instance context.
- The authority namespace owner is responsible for ensuring contract consistency across all publishing system types.
- [Consumption Bundles](./grouping-and-bundling.md#consumption-bundle) SHOULD remain under the [system namespace](../index.md#system-namespace), because they describe system-type-specific access mechanisms (authentication, credential exchange, endpoints).
- [Packages](./grouping-and-bundling.md#package) that group shared resources SHOULD also use the authority namespace.
- Each system type MUST use `partOfProducts` to associate shared resources with its own [Product](./grouping-and-bundling.md#product).

### Example: Two System Types Publishing Shared Resources

System type `sap.s4` (SAP S/4HANA) publishes:

```json
{
  "describedSystemType": { "systemNamespace": "sap.s4" },
  "packages": [{
    "ordId": "sap.abap:package:ABAPAPIs:v1",
    "vendor": "sap:vendor:SAP:",
    "partOfProducts": ["sap:product:S4HANA:"]
  }],
  "apiResources": [{
    "ordId": "sap.abap:apiResource:BillOfMaterial:v1",
    "partOfPackage": "sap.abap:package:ABAPAPIs:v1",
    "partOfConsumptionBundles": [
      { "ordId": "sap.s4:consumptionBundle:defaultAuth:v1" }
    ]
  }],
  "consumptionBundles": [{
    "ordId": "sap.s4:consumptionBundle:defaultAuth:v1"
  }]
}
```

System type `sap.s4pce` (SAP S/4HANA Private Cloud Edition) publishes the same shared resource, but under its own product and with its own Consumption Bundle:

```json
{
  "describedSystemType": { "systemNamespace": "sap.s4pce" },
  "packages": [{
    "ordId": "sap.abap:package:ABAPAPIs:v1",
    "vendor": "sap:vendor:SAP:",
    "partOfProducts": ["sap:product:S4HANA_PCE:"]
  }],
  "apiResources": [{
    "ordId": "sap.abap:apiResource:BillOfMaterial:v1",
    "partOfPackage": "sap.abap:package:ABAPAPIs:v1",
    "partOfConsumptionBundles": [
      { "ordId": "sap.s4pce:consumptionBundle:cloudAuth:v1" }
    ]
  }],
  "consumptionBundles": [{
    "ordId": "sap.s4pce:consumptionBundle:cloudAuth:v1"
  }]
}
```

Note:
- The API resource (`sap.abap:apiResource:BillOfMaterial:v1`) and its package are described identically by both system types — each provides a complete, self-contained description.
- The Consumption Bundle differs per system type, reflecting different access mechanisms.
- Each system type associates the shared package with its own product via `partOfProducts`.

## Rules for Aggregators

Since each system type fully describes itself, aggregators will receive the same authority-namespaced resources from multiple system types.
To avoid conflicts and present a coherent view, aggregators need to handle this intentional duplication.

### Taxonomy Merging

[Taxonomy](../index.md#ord-taxonomy) with authority-namespaced ORD IDs (Packages, Entity Types) follows the existing merging rules: same ORD ID = same entity, merged across all sources.
When the same package is published by multiple system types with different `partOfProducts`, the aggregator MUST merge the product assignments, so the resulting package is associated with all products.

### Resource Merging

Resources with authority-namespaced ORD IDs follow the existing resource merging rules with the following refinements:

- The uniqueness validation ("MUST NOT be described multiple times") applies **within the same system type scope**, not globally. An authority-namespaced ORD ID appearing in multiple system types is expected and valid.
- The same authority-namespaced resource with the same `describedSystemVersion` MUST be identical across system types. The aggregator MAY deduplicate it and store the resource once, associating it with all products and system types it was published from. Alternatively, the aggregator MAY store it per system type if that is simpler.
- The aggregator SHOULD validate that authority-namespaced resources with the same ORD ID and same `version` are described consistently across system types. Inconsistencies SHOULD be flagged as validation warnings.
- When asked for a `system-type` perspective, the aggregator SHOULD return the latest version of the resource. If the aggregator keeps a version history (via `system-version` perspective), older versions remain accessible per system version.

### Static Catalogs

For static catalogs (using `system-type` or `system-version` perspectives):

- Authority-namespaced resources MAY appear from multiple system types.
- The aggregator has two strategies to handle this:
  1. **Scope per system type**: Store the resource separately per system type. This is the simplest approach and avoids any merging complexity.
  2. **Combine intelligently**: Present the resource once (as a shared contract) and associate it with all system types and products that publish it. The resource then knows which products and system types it has been published under. This is similar to how [Products](./grouping-and-bundling.md#product) already allow multiple product assignments via `partOfProducts`.
- If different system types publish different versions of the same authority-namespaced resource, the catalog MUST store them per system type/version, as they represent different states of the contract.

## Rules for Consumers

- When looking up an authority-namespaced ORD ID in a static catalog, consumers MUST be prepared to receive multiple results — one per system type that publishes the resource. Since the contract is identical across system types, a consumer that only needs the contract definition can pick any result.
- A dependency on an authority-namespaced ORD ID is satisfied by **any** system type that publishes it. This simplifies [Integration Dependencies](./integration-dependency.md): a single reference covers all system types providing that contract.
- To connect to a specific system, the consumer still needs the system-type-specific [Consumption Bundle](./grouping-and-bundling.md#consumption-bundle) and system instance context (entry points, authentication).
- When searching or filtering, consumers can narrow results by system type, system version or product if needed.

## Relation to Other Concepts

### Consumption Bundles

[Consumption Bundles](./grouping-and-bundling.md#consumption-bundle) describe **how to access** resources — authentication mechanisms, credential exchange, entry points.
These are inherently system-type-specific and remain under the system namespace.

A shared API resource (authority namespace) can be part of different Consumption Bundles on different system types.
This cleanly separates **what the contract is** (authority-namespaced resource) from **how to connect** (system-namespaced Consumption Bundle).

### Products

[Products](./grouping-and-bundling.md#product) represent the commercial view and are already system-type-independent.
A shared API resource can be assigned to multiple products via `partOfProducts`, either directly or through Package inheritance.
Each system type associates the shared resource with its own product.
After aggregation, the resource is associated with all products that published it — e.g. both `sap:product:S4HANA:` and `sap:product:S4HANA_PCE:`.

### Integration Dependencies

[Integration Dependencies](./integration-dependency.md) benefit most from shared resources.
When an aspect references an authority-namespaced ORD ID, the dependency is automatically satisfied by any system type that publishes that contract:

```json
{
  "ordId": "sap.crm:integrationDependency:materialSync:v1",
  "aspects": [{
    "apiResources": [{
      "ordId": "sap.abap:apiResource:BillOfMaterial:v1"
    }]
  }]
}
```

Without authority namespaces, the same dependency would need to enumerate all system-type-specific variants as alternatives.

### Abstract Resources and compatibleWith

Shared resources and [abstract resources with `compatibleWith`](./compatibility.md) address related but distinct scenarios:

- **Shared resources** (this page): Multiple system types expose the **exact same** resource — same ORD ID, same contract, same implementation, originating from the same software component. The resource is concrete and directly consumable on each system type. This is the same code running in different deployment contexts.
- **Abstract + compatibleWith**: An abstract resource defines a **contract specification** that is not directly consumable. Different system types provide their own independent implementations that declare compatibility with that contract via `compatibleWith`. The implementations adhere to the same schema but may return different data or have different behavior.

The key distinction: shared resources guarantee **identity** (the same thing deployed in multiple places), while `compatibleWith` expresses **compatibility** (different things that follow the same contract).

They can also complement each other: an authority-namespaced shared resource could itself declare `compatibleWith` an abstract contract, or an abstract contract could use an authority namespace if it is governed across system types.

### System-Independent Perspective

Shared resources across system types are different from [system-independent](./perspectives.md#system-independent-perspective) content.
Shared resources still describe a system's capabilities and are published per system type, version, or instance.
System-independent content (Vendors, Products, global taxonomy) exists outside the system context entirely.
