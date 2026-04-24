---
sidebar_position: 3
description: How to group, bundle and package ORD content.
title: Grouping and Bundling
---

# Grouping and Bundling

## Quick Summary

ORD offers multiple ways how resources are grouped or bundled together.
Some of them have a specific intended usage, while others offer the application providers complete freedom.

### Predefined Grouping Concepts

- The [**Product**](#product) is an optional high-level grouping concept for software portfolio structure.
  - Packages and individual resources can be assigned to 0..n Products via `partOfProducts`.
  - Products represent the portfolio and marketing view of a software offering — independent of technical concerns.
  - Products can be arranged hierarchically (a Product can reference a `parent` Product).
- The [**Package**](#package) is the only mandatory bundling concept.
  - Every ORD Resource MUST be assigned to exactly one Package.
  - The concerns of a Package are:
    - What is published together
    - How the published information is presented on a catalog, e.g. in SAPs case the [Business Accelerator Hub](https://api.sap.com/)
- The [**Consumption Bundle**](#consumption-bundle)
  - API or Event Resources MAY be assigned to 0..n Consumption Bundles
  - The concern is technical: What resources can be consumed together with the same set of credentials and auth mechanism
- The [**Entity Type**](#entity-type) may not be perceived as a grouping mechanism, but in practice it is very useful to group APIs, Events and other resources by a shared Business Object / Business Term.
  - API Resources, Event Resources, Capabilities, Data Products and other Entity Types can be assigned to 0..n Entity Types.

### Generic Grouping Concepts

- [**Tags**](#tags) (via the `tags` array property) can be used to freely tag all kinds of ORD resources in [Folksonomy](https://en.wikipedia.org/wiki/Folksonomy) style.
- [**Labels**](#labels) are similar to tags, but they allow to also define the "key" and are mostly useful for simplifying querying / selecting resources on an API level.
- [**Groups**](#groups) allow to define custom **Group Types** that can be published via ORD as well.
  - This concept is very flexible, but still well governed and machine-readable.
  - It works similar to Packages or Consumption Bundles, but allows the ORD Provider to define their own group categories and their semantics.

### Namespaces

While ORD IDs contain [namespaces](../index.md#namespaces) that can include optional [sub-context namespaces](../index.md#sub-context-namespace), these should NOT be used for grouping purposes. Changing sub-context namespaces creates incompatible changes by altering ORD IDs. Use [groups](#groups) for grouping instead.

Sub-context namespaces should only be used if they are expected to be stable and are necessary to ensure conflict-free ORD IDs. A valid use case is enabling sub-teams to work independently with isolated, conflict-free sub-namespaces.

### ORD Documents

ORD Documents are only used to transport ORD information to the aggregator and have no impact on grouping and bundling.
However, there are still some [Considerations on the granularity of ORD Documents](../index.md#considerations-on-the-granularity-of-ord-documents).

## Choosing the Right Concept

The following table summarizes all grouping options and helps decide which one to use:

| Concept | Level | Assignment | Key Question |
|---|---|---|---|
| [Product](#product) | Portfolio | Package / resource → 0..n Products | What named software product or service offering does this belong to? |
| [Package](#package) | Publishing | **Every resource MUST have exactly one** | What is published together and shown in a catalog? |
| [Consumption Bundle](#consumption-bundle) | Technical access | API / Event → 0..n Bundles | What can be consumed with the same auth mechanism and credentials? |
| [Entity Type](#entity-type) | Semantic | API / Event / Data Product → 0..n Entity Types | What business object or domain concept does this relate to? |
| [Group](#groups) | Custom taxonomy | Any resource → 0..n Groups | Custom, governed grouping and taxonomy assignment beyond the predefined ORD concepts |
| [Tags](#tags) | Free tagging | Any resource → 0..n tags | Flexible keyword tagging for search and navigation |
| [Labels](#labels) | Key-value metadata | Any resource → 0..n labels | Structured metadata for programmatic querying and filtering |

## Best Practices and Recommendations

- Avoid using [namespaces](#namespaces) for the purpose of grouping, if possible.
- For end-user-facing taxonomy, use [groups](#groups) rather than tags or labels. Tags and labels lack human-readable labels and are optimized for machine processing.
- Packages are less flexible for grouping than [groups](#groups), so the latter are recommended and can be complementary.
  Use [packages](#package) to group ORD resources published together and for information reuse.

## Detailed Explanations

### Product

A [**Product**](../interfaces/Document#product) in ORD represents a software product or service offering (whether commercial or free).
It is a high-level entity for structuring a software portfolio from a portfolio and software-logistics perspective.
While the **system type** is a technical concept, a **product** covers the portfolio and marketing view — these concerns are intentionally kept separate.

The ORD concept of a Product is deliberately simple:
there is no distinction between products and services, and concepts like product versions or variants are out of scope.
ORD assumes that specialized systems handle those concerns; ORD only provides the means to correlate resources with them.

Products are assigned via the `partOfProducts` property on a [Package](#package) or directly on individual resources.
Product assignments on a Package are inherited by all resources inside that Package.
Products can also be arranged hierarchically using the optional `parent` reference.

Typical use cases:
- Indicate which software product (e.g. *SAP S/4HANA Cloud*) a set of APIs belongs to.
- Express a product hierarchy (e.g. a sub-product that is part of a broader product family).
- Enable catalog tooling to filter, group or attribute resources by product.

> ℹ Products are primarily useful for organizations with a large software portfolio where resources span multiple products. For single-product applications the concept can often be omitted.

### Package

Every ORD Resource MUST be assigned to exactly one [**Package**](../interfaces/Document#package).
The Package is primarily motivated by publishing and API catalog presentation concerns, including human-readable documentation and presentation.
It can also express information about the resource providers, terms of use of the APIs, pricing for the usage of the packages, APIs, Events, etc.

Several Package properties — such as `vendor`, `partOfProducts`, `tags`, `labels` and `policyLevel` — are **inherited** by all resources within the Package. This makes the Package a convenient place to define shared metadata once, rather than repeating it on every resource.

The granularity of Packages is driven by all of the following concerns:

- The resources are created by the same vendor or customer, exposed by the same described system.
- The resources are published together. They share the same publishing ownership.
- The resources share certain aspects/taxonomy that is inherited down to them (e.g. `vendor`).
- If applicable: The resources are meant to be used by only a particular target platform / software.

When a package groups resources that are shared across multiple [system types](../index.md#system-type), the package itself SHOULD also use an [authority namespace](../index.md#authority-namespace).
See [Shared Resources](./shared-resources.md).

All resources that are not created by the described systems vendor MUST be put into separate packages.
This is the case, when:

- The resources are created by the customer (user) of the system.
  All such resources MUST be assigned to a dedicated Package, where `vendor` is set to `customer:vendor:Customer:`.
- The resources are created by partners or third parties.
  All such resources MUST be assigned to a dedicated Package for each partner / third party.
  The `vendor` MUST be set to a registered, matching Vendor ID (implies also a registered namespace).

> ℹ At SAP, the [Business Accelerator Hub](https://api.sap.com/) defines how the Package concept is to be used to fit its publishing flow and Catalog UI/UX.
> See [sap:core:v1 policy level](../../spec-extensions/policy-levels/sap-core-v1.md) for additional SAP specific constraints.

### Consumption Bundle

The [**Consumption Bundle**](../interfaces/Document#consumption-bundle) groups APIs and Events together that can be consumed with the same credentials and auth mechanism.
Ideally it also includes instructions and details on how to request access and credentials for resources.

> **Important:** A Consumption Bundle is a template that describes _how_ to obtain access, not _which_ credentials are already available. It provides instructions, not instances.

API and Event resources MAY be assigned to 0..n Consumption Bundles.
Consumption Bundles are only applicable to APIs and Events where the described application itself manages the access and credentials.

All resources that are part of the same Consumption Bundle MUST theoretically be accessible through the same set of credentials.
In practice however, there are usually more fine-grained access control permissions like RBAC that further restrict access based on user / client identity.
Those are currently not described in ORD and the Consumption Bundle should therefore describe the "maximum possible scope" that is theoretically possible.

In the future, Consumption Bundles may provide more machine-readable information to help understand and automate the steps needed to get access.
For example, how credentials can be programmatically obtained could be described via `credentialExchangeStrategies`.

> 🚧 Please note that the Consumption Bundle concept is still in a rather basic form and may be extended in the future.

### Entity Type

An [**Entity Type**](../interfaces/Document#entity-type) describes an underlying conceptual model (e.g. a business object / domain model).
In special cases, the entity type could just be a term, describing the semantics but without an actual model behind it.

Entity Types are part of the ORD taxonomy and represent an "internal" concept. They should not leak internal implementation details, but can be used to relate external resources and capabilities to "business semantics".

Relationships to entity types can be assigned to API & Event resources, data products and other entity types:

![Entity Type Relations](/img/entity-type-relations.drawio.svg)

Entity Types can serve two roles:

1. **Conceptual models** — they relate to internal application models that usually have structure (properties, behavior).
   Ideally (see DDD), they represent the [ubiquitous language](https://martinfowler.com/bliki/UbiquitousLanguage.html) and have consistent semantics within the domain / bounded context. In other contexts, they might be called conceptual or logical (data) models or just internal models.
   Such models may have a lifecycle, so the ORD ID major version may be of relevance.

2. **Business terms** — they describe domain objects like a glossary of nouns that are consistently used.
   Such entity types usually have no lifecycle, and the ORD ID will have to set `v1` as major version.

The same entity type can be related to one or multiple API and events resources, data products or other entity types.
The entity type does NOT represent a consumer contract, but describes an internal artifact / concept within the described application.
However, it's an important concept for the domain language and structure of the application and can be very useful to put other ORD concepts into relation with it.

> ⚠ Entity Types are not meant to provide a consumer contract!
> To get a clearly defined contract for working with entity types (getting data, triggering behavior), APIs and Events should be used.

### Tags

**Tags** (via the `tags` array property) can be used to freely tag all kinds of ORD resources in [Folksonomy](https://en.wikipedia.org/wiki/Folksonomy) style.
Tags defined on a [Package](#package) are inherited by all resources it contains.

Please be aware that there is no global governance of tags and they also do not have namespaces.
This will inevitably lead to inconsistent usage of tags.
Since they are usually used for enhancing search or navigation, the simplicity of tags is often still a good trade-off.

> For governed, human-readable categorization, prefer [Groups](#groups) over tags.

### Labels

[**Labels**](../interfaces/Document#labels) are similar to [Tags](#tags), but define key-value pairs instead of plain strings.
They are optimized for machine-readability and can be used to query, select and filter resources programmatically (similar to [Kubernetes labels](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/)).
Labels defined on a [Package](#package) are inherited by all resources it contains (duplicate keys are merged).

### Groups

[**Groups**](../interfaces/Document#group) and the corresponding [Group Types](../interfaces/Document#group-type) can be used to define and apply your own taxonomy in a generic, extensible way.

<div style={{"text-align": "left", "margin-top": "12px"}}>
![Group Concept Overview](/img/group-concept-overview.drawio.svg)
</div>

The concept has three parts: The **Group Type** defines the semantics / meaning of a particular type of group assignments.
An example would be to have a Group Type for a "part of a CDS Service" or "part of a Process".

Second, the **Group** itself defines the actual group things can be assigned to.
In the examples before, this would be the "Employee Service" or the "Hire to Retire" Process.

Lastly, we need to state the **partOfGroup** assignment of a particular ORD Resource.
E.g. a particular OData API for Employee Management can be part of both the "Employee Service" group (of type CSN Service) and the "Hire to Retire" group of type "Process".

The Group Type could even be defined globally. If the Group Type is shared across different applications, it should have an [authority namespace](../index.md#authority-namespace).
The Group Instances can potentially be globally defined, too. In this case it works like a global taxonomy with a predefined list of values. It's also possible for the application itself to define and assign its own Group Types and Instances.

> The Group concept is the correct choice when ORD resources need to be grouped by additional concerns, beyond the predefined concepts from ORD (like Package).

### Examples

### Bundling CAP APIs by CSN Service:

```js
{
  // Defines that there is a concept for grouping "CDS Service", owned by the sap.cds authority namespace
  "groupTypes": [{
    "groupTypeId": "sap.cds:service",
    "title": "CAP CDS Service",
    "description": "Description of the CDS Service concept and how its correctly used for grouping..."
   }]
}
```

```js
{
  // Describes the actual CDS Service, as it was created in an application (of namespace "customer.bookshop")
  "groups": [{
     "groupId": "sap.cds:service:customer.bookshop:incidents.IncidentsService",
     "groupTypeId": "sap.cds:service",
     "title": "Incidents Service"
   }]
}
```

```js
{
  "apiResources": [{
      // Assignment of one API to the CSN Service it is derived from
      "partOfGroups": [
        "sap.cds:service:customer.incidents:incidents.IncidentsService"
      ]
  }]
}
```
