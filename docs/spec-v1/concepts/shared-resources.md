---
sidebar_position: 5
description: How to describe resources that are shared across multiple system types using authority namespaces.
---

# Shared Resources Across System Types

## Summary

Different [system types](../index.md#system-type) can be built from the same software components, deployed in different combinations and versions.
When the same resource contract, dependency description, or access grouping (such as an API, event, data product, capability, integration dependency, consumption bundle, or agent) originates from a shared component, it represents the same resource — regardless of which system type exposes it.

ORD supports this through [authority namespaces](../index.md#authority-namespace).
ORD information that is shared across system types uses an authority namespace in its [ORD ID](../index.md#ord-id), rather than a [system namespace](../index.md#system-namespace).
The authority namespace represents the organizational unit that governs the shared contract, dependency description, access grouping, or taxonomy item.

## Motivation

A [system namespace](../index.md#system-namespace) corresponds 1:1 to a [system type](../index.md#system-type).
This works well when a resource is specific to one system type.
But software is often built from reusable components, and different system types may expose the same resource contract because they include the same component.

Consider the example of a storefront system (`example.storefront`) and an order management system (`example.order`).
Both system types can be built from a shared commerce component and therefore expose the same order API.
Without shared ORD IDs, each system type would describe the same contract under a different ORD ID (e.g. `example.storefront:apiResource:Order:v1` vs `example.order:apiResource:Order:v1`).
This creates a false distinction — the contract is the same, only the deployment topology and product differ.
It also complicates [integration dependencies](./integration-dependency.md): a consumer that depends on the Order API would need to list every system-type-specific variant.

## Solution: Authority Namespaces for Shared Resources

The [authority namespace](../index.md#authority-namespace) concept already exists in ORD for cross-system governance, and is used for [Entity Types](./grouping-and-bundling.md#entity-type) that are aligned across applications (e.g. `example.common:entityType:Customer:v1`).

The same mechanism applies to shared API resources, event resources, data products, capabilities, integration dependencies, agents, consumption bundles, and to packages that group such shared resources: when the resource represents the same contract, dependency description, or access grouping across multiple system types, it SHOULD use an authority namespace.

**Example**: If both `example.storefront` and `example.order` system types expose the same Order API originating from a shared commerce component governed under the `example.commerce` authority, the ORD ID would be:

```
example.commerce:apiResource:Order:v1
```

Both system types publish this ORD ID. The [Consumption Bundle](./grouping-and-bundling.md#consumption-bundle) describes access context such as authentication and endpoints. It can use a system namespace when that access setup is system-type-specific, or an authority namespace when the same access grouping is shared and governed across system types.

### When to Use Authority vs System Namespace

| Scenario | Namespace to use |
| --- | --- |
| Resource is specific to a single system type | [System namespace](../index.md#system-namespace) |
| Resource, dependency or access grouping represents a shared contract or definition across multiple system types | [Authority namespace](../index.md#authority-namespace) |
| Entity Type aligned across applications (e.g. a common domain model) | [Authority namespace](../index.md#authority-namespace) |

The choice depends on the **ownership and governance** of the resource contract or dependency description, not on which system happens to deploy it.

## Rules for Publishers

Each system type MUST fully describe itself — including all shared ORD information it exposes or publishes.
This means the same authority-namespaced ORD information will effectively be described multiple times, once by each publishing system type.
Each system type provides a complete, self-contained ORD description; there is no implicit inheritance or delegation between system types.

- ORD information SHOULD use an authority namespace when the same contract, dependency description, or access grouping is published by multiple system types.
- All system types publishing the same authority-namespaced ORD ID with the same `version` MUST describe the shared contract, dependency description, or access grouping consistently (same resource definitions and contract metadata).
  System-type-specific publication context, such as [Consumption Bundle](./grouping-and-bundling.md#consumption-bundle) assignments or product assignments through Package inheritance, MAY differ.
- The authority namespace owner is responsible for ensuring contract consistency across all publishing system types.
- [Packages](./grouping-and-bundling.md#package) that group shared resources SHOULD also use the authority namespace.
- Each system type MUST use `partOfProducts` to associate shared resources with its own [Product](./grouping-and-bundling.md#product).

### Example: Two System Types Publishing Shared Resources

System type `example.storefront` publishes:

```json
{
  "describedSystemType": { "systemNamespace": "example.storefront" },
  "packages": [{
    "ordId": "example.commerce:package:CommerceAPIs:v1",
    "vendor": "example:vendor:ExampleCorp:",
    "partOfProducts": ["example:product:Storefront:"]
  }],
  "apiResources": [{
    "ordId": "example.commerce:apiResource:Order:v1",
    "partOfPackage": "example.commerce:package:CommerceAPIs:v1",
    "partOfConsumptionBundles": [
      { "ordId": "example.storefront:consumptionBundle:storefrontOAuth:v1" }
    ]
  }],
  "consumptionBundles": [{
    "ordId": "example.storefront:consumptionBundle:storefrontOAuth:v1"
  }]
}
```

System type `example.order` publishes the same shared resource, but under its own product and with its own Consumption Bundle:

```json
{
  "describedSystemType": { "systemNamespace": "example.order" },
  "packages": [{
    "ordId": "example.commerce:package:CommerceAPIs:v1",
    "vendor": "example:vendor:ExampleCorp:",
    "partOfProducts": ["example:product:OrderManagement:"]
  }],
  "apiResources": [{
    "ordId": "example.commerce:apiResource:Order:v1",
    "partOfPackage": "example.commerce:package:CommerceAPIs:v1",
    "partOfConsumptionBundles": [
      { "ordId": "example.order:consumptionBundle:orderOAuth:v1" }
    ]
  }],
  "consumptionBundles": [{
    "ordId": "example.order:consumptionBundle:orderOAuth:v1"
  }]
}
```

Note:
- The API resource (`example.commerce:apiResource:Order:v1`) describes the same contract in both system types.
- The Consumption Bundle differs per system type, reflecting different access mechanisms.
- Each system type associates the shared package with its own product via `partOfProducts`.
- Aggregators can either keep these publications scoped per system type/version, or present one combined view while preserving which system types and products published the resource.

## Rules for Aggregators

Since each system type fully describes itself, aggregators will receive the same authority-namespaced ORD information from multiple system types.
This intentional duplication is valid and needs to be handled without losing the system type, system version and product context in which the ORD information was published.

### Resource Handling

ORD information with authority-namespaced ORD IDs follows the existing resource handling rules with the following refinements:

- The uniqueness validation ("MUST NOT be described multiple times") applies **within the same system type scope**, not globally. An authority-namespaced ORD ID appearing in multiple system types is expected and valid.
- The same authority-namespaced ORD information with the same `version` MUST describe the same contract, dependency description, or access grouping across system types. The aggregator MAY deduplicate the shared description and associate it with all products and system types it was published from. Alternatively, the aggregator MAY store it per system type if that is simpler.
- The aggregator SHOULD validate that authority-namespaced ORD information with the same ORD ID and same `version` describes the contract, dependency description, or access grouping consistently across system types. Inconsistencies SHOULD be flagged as validation warnings.
- When asked for a `system-type` perspective, the aggregator SHOULD return the latest version of the resource. If the aggregator keeps a version history (via `system-version` perspective), older versions remain accessible per system version.

### Static Catalogs

For static catalogs (using `system-type` or `system-version` perspectives):

- Authority-namespaced ORD information MAY appear from multiple system types.
- The aggregator has two strategies to handle this:
  1. **Scope per system type**: Store the resource separately per system type. This is the simplest approach and avoids any merging complexity.
  2. **Combine intelligently**: Present the resource once as a shared description and associate it with all system types and products that publish it. The resource then knows which products and system types it has been published under. This is similar to how [Products](./grouping-and-bundling.md#product) already allow multiple product assignments via `partOfProducts`.
- If different system types publish different versions of the same authority-namespaced ORD information, the catalog MUST store them per system type/version, as they represent different states of the shared description.

Example: If `example.storefront` publishes `example.commerce:apiResource:Order:v1` through a package assigned to `example:product:Storefront:`, and `example.order` publishes the same API resource through a package assigned to `example:product:OrderManagement:`, both publications are valid.
An aggregator that stores content per system type keeps two scoped records.
An aggregator that presents a combined catalog view may show the API resource once, but it must preserve that the resource was published by both `example.storefront` and `example.order` and is associated with both product assignments.

## Rules for Consumers

- When looking up an authority-namespaced ORD ID in a static catalog, consumers MUST be prepared to receive either one combined result or multiple scoped results, depending on the aggregator. Since the shared description is the same across system types, a consumer that only needs that description can use any scoped result or the combined result.
- A dependency on an authority-namespaced ORD ID is satisfied by **any** system type that publishes it. This simplifies [Integration Dependencies](./integration-dependency.md): a single reference covers all system types providing that contract.
- To connect to a specific system, the consumer still needs the applicable [Consumption Bundle](./grouping-and-bundling.md#consumption-bundle) and system instance context (entry points, authentication).
- When searching or filtering, consumers can narrow results by system type, system version or product if needed.

## Relation to Other Concepts

### Consumption Bundles

[Consumption Bundles](./grouping-and-bundling.md#consumption-bundle) describe **how to access** resources — authentication mechanisms, credential exchange, entry points.
They SHOULD use a system namespace when that access setup is system-type-specific.
They SHOULD use an authority namespace when the same access grouping and authentication model is shared and governed across system types.

A shared API resource (authority namespace) can be part of different Consumption Bundles on different system types.
It can also be part of the same authority-namespaced Consumption Bundle when the access setup is shared.
This cleanly separates **what the contract is** (authority-namespaced resource) from **how to connect** (Consumption Bundle), while still allowing both to be shared when they are governed by the same shared component.

### Products

[Products](./grouping-and-bundling.md#product) represent the commercial view and are already system-type-independent.
A shared API resource can be assigned to multiple products via `partOfProducts`, either directly or through Package inheritance.
Each system type associates the shared resource with its own product.
In a combined aggregation view, the resource is associated with all products that published it — e.g. both `example:product:Storefront:` and `example:product:OrderManagement:`.

### Integration Dependencies

[Integration Dependencies](./integration-dependency.md) can use authority namespaces in two ways.
They can reference shared target resources, and the Integration Dependency itself can use an authority namespace when the client-side integration behavior is provided by a shared component across system types.

When an aspect references an authority-namespaced ORD ID, the dependency is automatically satisfied by any system type that publishes that contract:

```json
{
  "ordId": "example.commerce:integrationDependency:orderSync:v1",
  "aspects": [{
    "apiResources": [{
      "ordId": "example.commerce:apiResource:Order:v1"
    }]
  }]
}
```

Without authority namespaces, the same dependency would need to enumerate all system-type-specific variants as alternatives.

### Abstract Resources and compatibleWith

Shared resources and [abstract resources with `compatibleWith`](./compatibility.md) address related but distinct scenarios:

- **Shared resources** (this page): Multiple system types expose or publish the **same governed contract or dependency description** — same ORD ID and same contract or dependency description, commonly originating from the same software component. The resource is concrete and applies to each publishing system type, while access setup and product assignment can differ.
- **Abstract + compatibleWith**: An abstract resource defines a **contract specification** that is not directly consumable. Different system types provide their own independent implementations that declare compatibility with that contract via `compatibleWith`. The implementations adhere to the same schema but may return different data or have different behavior.

The key distinction: shared resources guarantee **identity** (the same governed contract or dependency description published by multiple system types), while `compatibleWith` expresses **compatibility** (different things that follow the same contract).

They can also complement each other: an authority-namespaced shared resource could itself declare `compatibleWith` an abstract contract, or an abstract contract could use an authority namespace if it is governed across system types.

### System-Independent Perspective

Shared resources across system types are different from [system-independent](./perspectives.md#system-independent-perspective) content.
Shared resources still describe a system's capabilities and are published per system type, version, or instance.
System-independent content (Vendors, Products, global taxonomy) exists outside the system context entirely.
