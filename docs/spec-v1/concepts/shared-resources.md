---
sidebar_position: 5
title: Shared Taxonomy, Resources and Contracts
description: How to describe ORD information that is shared across systems, authorities and system-independent catalogs.
---

# Shared Taxonomy, Resources and Contracts

## Summary

ORD information is not always owned by the [system type](../index.md#system-type) that publishes it.
Applications and services can reuse shared taxonomy, resource contracts, integration contracts, grouping concepts and access descriptions that are governed elsewhere.

This page explains how to model shared ORD information across four related concerns:

- [System-independent perspective](#system-independent-perspective), for global static content such as Vendors, Products and global taxonomy.
- [Namespace ownership](#namespace-ownership), for deciding whether an ORD ID should use a system namespace, authority namespace or another reused namespace.
- [Authority namespaces](#authority-namespaces), the most common model for cross-system governance.
- [Abstract resources and compatibleWith](#abstract-resources-and-compatiblewith), for interface contracts implemented by separate concrete resources.

The central rule is: the [ORD ID](../index.md#ord-id) identifies the governed definition, while the publishing document and perspective identify the context in which that definition is made available.

## What Can Be Shared

The pattern applies to ORD information whose identity is meaningful beyond one local publication:

- Taxonomy: Products, Vendors, Entity Types, Group Types, Groups, labels based on Concept IDs.
- Resources: API Resources, Event Resources, Data Products, Capabilities and Agents.
- Contracts and access groupings: Integration Dependencies, Consumption Bundles and Packages.
- Interface definitions: abstract API Resources, Event Resources and Data Products.

Shared ORD information can still be published by a specific system type.
For example, if two system types expose the same Order API from a reused commerce component, both system types publish the same API Resource ORD ID.
The API contract is shared, but the publication context, product assignment, endpoints and access setup can still differ.

## Three Independent Questions

When modeling shared ORD information, answer these questions separately:

| Question | Decides | Examples |
| --- | --- | --- |
| Who owns the definition? | Namespace in the ORD ID or Concept ID | `example.order`, `example.commerce`, `example` |
| Where is it published? | ORD document, system type/version/instance, perspective | `example.storefront` publishes an API owned by `example.commerce` |
| Is it directly consumable? | Concrete resource vs `abstract: true` and `compatibleWith` | Concrete Order API vs abstract Order API contract |

Do not use the namespace merely to say where something was found.
Use it to identify who governs the definition and is responsible for keeping its semantics stable.

## System-Independent Perspective

Some ORD information is independent of any [system version](../index.md#system-version) or [system instance](../index.md#system-instance).
It has its own lifecycle and is not overridden by system-specific metadata.
Such content SHOULD use the [`system-independent`](./perspectives.md#system-independent-perspective) perspective.

Typical examples are:

- [Vendors](../interfaces/Document.md#vendor) and [Products](./grouping-and-bundling.md#product).
- Globally aligned [Entity Types](./grouping-and-bundling.md#entity-type).
- Centrally defined [Group Types and Groups](./grouping-and-bundling.md#groups) used as global taxonomy.

System-independent content has a singleton quality for an aggregator and SHOULD NOT be republished by every system type.
By contrast, shared resources and contracts are still part of a system's self-description.
Each system type that exposes or relies on them publishes the shared ORD information in its own system-scoped perspective.

## Namespace Ownership

The namespace in an ORD ID or Concept ID expresses ownership of the definition.
Shared ORD information does not always require an [authority namespace](../index.md#authority-namespace), although that is often the best choice.

| Ownership model | When to use it | Example |
| --- | --- | --- |
| Own system namespace | The described system type owns the definition and lifecycle. | `example.storefront:apiResource:Cart:v1` |
| Other system namespace | The definition is owned by another system type and reused as-is. | `example.order:apiResource:Order:v1` published by `example.storefront` |
| Authority namespace | A cross-system authority owns and governs the definition. | `example.commerce:apiResource:Order:v1` |
| Vendor/global namespace with `system-independent` | The information is global portfolio or taxonomy content. | `example:product:CommerceSuite:` |

The correct namespace depends on governance, not on deployment topology.
If a storefront system exposes an API contract that is owned by the order management system, the API can keep the order system namespace even when published by the storefront system.
If neither system owns the contract and both implement or expose a contract governed by a shared commerce team, an authority namespace is the clearer model.

## Authority Namespaces

An [authority namespace](../index.md#authority-namespace) represents an organizational unit responsible for cross-system alignment and governance.
It is the recommended model when shared ORD information is not owned by one concrete system type.

Authority namespaces are especially useful when:

- multiple system types publish the same governed resource contract;
- multiple system types use the same integration dependency definition;
- taxonomy values are aligned across applications;
- access groupings or packages are governed by a shared component or platform team.

**Example:** If `example.storefront` and `example.order` both expose the same Order API from a shared commerce component governed by `example.commerce`, the ORD ID is:

```text
example.commerce:apiResource:Order:v1
```

Both system types publish this ORD ID.
The API Resource describes the same contract in both places.
The [Consumption Bundle](./grouping-and-bundling.md#consumption-bundle) can still use a system namespace when the access setup is specific to one system type, or an authority namespace when the same access grouping is shared as well.

### Namespace Decision Table

| Scenario | Namespace to use |
| --- | --- |
| Resource or taxonomy is specific to one system type | [System namespace](../index.md#system-namespace) |
| Resource or taxonomy is owned by another system type and reused as defined | That other [system namespace](../index.md#system-namespace) |
| Resource, dependency, package, group or access model is governed across system types | [Authority namespace](../index.md#authority-namespace) |
| Product, Vendor or global taxonomy exists independently of system publication | Appropriate global namespace with `system-independent` perspective |

## Publisher Rules

Each system type MUST fully describe itself, including shared ORD information it exposes, publishes or relies on.
There is no implicit inheritance between system types.

- Shared ORD information MAY be published by multiple system types when the ORD ID identifies the same governed definition.
- All publishers of the same ORD ID and same `version` MUST describe the shared definition consistently.
- System-specific publication context MAY differ, such as product assignments, package inheritance, Consumption Bundle assignments, entry points or credentials.
- The namespace owner is responsible for governing the shared definition and coordinating consistency.
- [Packages](./grouping-and-bundling.md#package) that group only shared resources SHOULD normally use the same owning namespace as the grouped resources.
- Each system type MUST use `partOfProducts` where needed to associate shared resources with the relevant [Product](./grouping-and-bundling.md#product).

### Example: Authority-Owned Resource

Authority namespace: `example.commerce`
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

System type `example.order` publishes the same shared resource with its own product and access setup:

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

The API Resource and Package are shared.
The Consumption Bundles are system-specific because the access setup differs.

### Example: System-Owned Resource Reused by Another System

If the Order API contract is owned by the order management system type, the shared ORD ID can remain system-owned:

```text
example.order:apiResource:Order:v1
```

Another system type can publish that ORD ID when it exposes or embeds the same contract.
In that case, the order system namespace remains the owner of the contract, even though the resource appears in another system type's ORD document.

Use this model only when the owning system type is genuinely responsible for the shared definition.
If ownership is cross-system or organizational rather than system-specific, use an authority namespace instead.

## Aggregator Rules

Aggregators can receive the same shared ORD information from multiple system types.
This duplication is valid when it represents the same governed definition, but the aggregator must not lose publication context.

- The uniqueness validation ("MUST NOT be described multiple times") applies within the same system type or system version scope, not globally across all system types.
- The same shared ORD ID with the same `version` MUST describe the same definition across publishers.
- The aggregator SHOULD validate that the shared definition is consistent across publishers and flag unexpected inconsistencies as validation warnings. Differences in publication context (such as product assignments, Consumption Bundles or entry points) are expected and not inconsistencies.
- The aggregator MAY deduplicate the shared definition and associate it with all publishing system types and products.
- The aggregator MAY instead store scoped records per system type/version if that is simpler.
- If different system types publish different versions of the same shared ORD information, the catalog MUST preserve the system type/version context.

For static catalogs using `system-type` or `system-version` perspectives, there are two valid strategies:

1. **Scope per system type:** Store the shared information separately for each publishing system type.
2. **Combine intelligently:** Present the shared information once, while preserving all system types, system versions and products that published it.

## Consumer Rules

- Consumers MUST be prepared to receive either one combined result or multiple scoped results for a shared ORD ID, depending on the aggregator.
- A dependency on a shared ORD ID is satisfied by any system type that publishes that definition, unless the dependency further restricts the provider.
- To connect to a concrete system, the consumer still needs the applicable [Consumption Bundle](./grouping-and-bundling.md#consumption-bundle), system instance context, entry points and authentication details.
- Consumers can narrow search and resolution by system type, system version, system instance or product when they need a specific provider context.

## Relation to Other Concepts

### Consumption Bundles

[Consumption Bundles](./grouping-and-bundling.md#consumption-bundle) describe how to access resources: authentication mechanisms, credential exchange and entry points.

They SHOULD use a system namespace when the access setup is system-type-specific.
They SHOULD use an authority namespace or another reused owning namespace when the same access grouping is shared and governed outside the publishing system type.

This separates what the contract is from how to connect to a concrete provider.

### Products

[Products](./grouping-and-bundling.md#product) represent portfolio and commercial structure and are system-type-independent.
They commonly use the `system-independent` perspective.

A shared resource can be assigned to multiple products through `partOfProducts`, either directly or through Package inheritance.
In a combined aggregation view, the shared resource is associated with all products under which it was published.

### Integration Dependencies

[Integration Dependencies](./integration-dependency.md) can reference shared target resources.
The Integration Dependency itself can also be shared when the client-side integration behavior is provided by a shared component across system types.

When an aspect references a shared ORD ID, the dependency can be satisfied by any system type that publishes that contract:

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

Without a shared ORD ID, the same dependency would need to enumerate all system-type-specific variants as alternatives.

### Abstract Resources and compatibleWith

Shared ORD information and [abstract resources with `compatibleWith`](./compatibility.md) address related but distinct scenarios:

- **Shared ORD ID:** Multiple publishers expose or reference the same governed definition. This is an identity relationship.
- **`abstract: true` with `compatibleWith`:** A resource defines an interface-only contract. Other concrete resources declare that they implement or are compatible with that contract. This is a compatibility relationship.

An abstract resource can itself be system-owned, authority-owned or system-independent.
For example, `example.commerce:apiResource:Order:v1` could be an abstract authority-owned API contract, while `example.storefront:apiResource:StorefrontOrder:v1` and `example.order:apiResource:Order:v1` declare `compatibleWith` it.

Use the shared ORD ID model when the same contract or taxonomy item is being published.
Use `abstract` and `compatibleWith` when different concrete resources implement a common interface contract.
