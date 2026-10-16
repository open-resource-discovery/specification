---
title: Identifiers
description: How ORD namespaces, ORD IDs, Correlation IDs, Concept IDs, and Specification IDs are constructed and used.
---

import { ConceptIdDiagram, CorrelationIdDiagram, IdentifierTypesDiagram, NamespaceDiagram, OrdIdDiagram, SpecificationIdDiagram } from "@site/src/components/OrdDiagrams";

# Identifiers

ORD uses several identifier types for distinct purposes.
This page defines their normative construction and usage rules.

<IdentifierTypesDiagram />

## Namespaces

ORD makes use of namespaces to ensure we don't have ID collisions between multiple, potentially independent sources of information.

Each namespace is responsible for ensuring uniqueness and consistency within itself, taking sub-namespaces and IDs attached to the namespace into consideration.
Namespaces are hierarchical. The responsibility and ownership can either be delegated or centralized.
How exactly this is ensured and governed is up to the namespace owners, but one possible solution is to maintain a namespace registry.

At SAP, this is ensured via the SAP namespace-registry.

A namespace may consist of multiple fragments, delimited by dots (`.`).

For the formatting of the individual fragments of the namespaces, the following rules apply:

- MUST only consist of lower case ASCII letters (`a-z`) and digits (`0-9`).
- Dot (`.`) is reserved as delimiter and MUST only be used for separating fragments.
- See [namespace constraints](#namespace-constraints)

A complete namespace MUST match the following [regular expression](https://en.wikipedia.org/wiki/Regular_expression):

```regex
^[a-z0-9]+(?:[.][a-z0-9]+)*$
```

> ℹ ORD can already be used outside of the SAP context, but this requires to take care of namespaces.
> It needs to be ensured that namespaces within the company are conflict free and follow the ORD namespace structure and constraints.

### Structure of Namespaces

<NamespaceDiagram />

Namespaces MUST follow the below structure:

```xml
<vendorNamespace> := <vendorId>
    <vendorId> := identifier for the vendor / organization.
    `customer` is a reserved vendor ID for [customer content / systems](#customer-namespace).

<systemNamespace> := <vendorNamespace>.<systemTypeId>
    <systemTypeId> := identifier for the system type (service / application).

<authorityNamespace> := <vendorNamespace>.<authorityId>
    <authorityId> := identifier for the authority.
```

Optionally, sub-contexts can be defined as sub namespaces for system and authority namespaces:

```xml
<namespace> := <systemNamespace/authorityNamespace>[.<subContext>]
    <subContext> := sub-context below application or authority namespace. May consist of multiple fragments.
```

### Namespace Constraints

- A namespace MUST be ensured to be conflict free.
  This falls into the responsibility of the registered namespace owner and assumes a registry of some kind.
- The total length of the `<systemNamespace>` or `<authorityNamespace>` MUST NOT exceed 32 characters
- The total length of the overall `<namespace>` (incl. nested subcontext namespaces) MUST NOT exceed 36 characters
- It is RECOMMENDED to keep namespaces as short as reasonable, as they become part of IDs which have their own length limitations.
  Shorter namespaces leave more room for the overall IDs.

### Vendor Namespace

A **vendor namespace** is a stable and globally unique identifier namespace that corresponds to a vendor / company.
The vendor owns this top-level namespace and is responsible for governing this namespace and all the namespaces within it.

A vendor namespace MUST be constructed according to the following rules:

`<vendorNamespace>` := `<vendorId>`

- `<vendorId>` is a registered ID of a vendor.
  - MUST only consist of lower case ASCII letters (`a-z`) and digits (`0-9`).
  - The organization using ORD MUST ensure that `<vendorId>` is uniquely registered, e.g. in a namespace registry.
  - There are reserved vendor namespaces:
    - `customer`: Used for ORD content whose identity is governed within a customer scope. This avoids requiring each customer to register a vendor namespace.
    - `c`: A shorter alias of `customer`, with identical semantics. Useful when the [namespace length limit](#namespace-constraints) is tight.
    - `ord`: Reserved for ORD specification-defined values in extensible enums that use [Specification IDs](#specification-id) or [Concept IDs](#concept-id). MUST NOT be used by vendors.
- MUST match Regexp: `^[a-z0-9]+$`

**Examples**: For SAP, we chose and registered `sap`.

> 🚧 There is currently no global namespace registry where we can ensure that there are no conflicts across different vendors.

### System Namespace

An <dfn id="def-ord-system-namespace">system namespace</dfn> is a stable and globally unique identifier namespace that corresponds to an ORD [system type](../index.md#system-type) (application or service type).

The system type is the top-level technical, simplified view on an application or service.
There can be hierarchical groupings of them to higher, logical concepts and also to divide them into multiple sub-components.
Here we simplify on purpose and **treat the identity of an application / service type flatly, without hierarchy**.
How this boundary is drawn depends on the technical decisions of the application / service.

To model a more complex application or organizational structure, for instance containing multiple modules / components, further sub-fragments MAY be indicated via [sub-context namespaces](#sub-context-namespace).

System namespaces are sub-namespaces of exactly one vendor namespace.

A system namespace MUST be constructed according to the following rules:

`<systemNamespace> := <vendorNamespace>.<systemTypeId>`

- `<vendorNamespace>` MUST be a valid [vendor namespace](#vendor-namespace)
- `<systemTypeId>` is the identifier of the technical system type (of the application or service).
  - MUST only consist of lower case ASCII letters (`a-z`) and digits (`0-9`).
- MUST match Regexp: `^[a-z0-9]+(?:[.][a-z0-9]+){1}$`

**Examples**: `sap.s4`, `sap.dsc`.

### Authority Namespace

An <dfn id="def-authority-namespace">authority namespace</dfn> is a stable and globally unique identifier namespace that corresponds to an **organizational unit** responsible for cross-alignment and governance.
Authority namespaces are relevant when contracts, interfaces or taxonomy are owned and defined on a level that spans across individual applications or services.
This includes shared API contracts, event definitions, data products, capabilities, integration dependencies, consumption bundles, and agents that are provided by multiple [system types](../index.md#system-type) built from the same software components.
See [Shared Taxonomy, Resources and Contracts](./shared-resources.md) for details on namespace ownership and authority namespaces.

An authority namespace MUST be constructed according to the following rules:

`<authority>` := `<vendorNamespace>.<authorityIdentifier>`

- `<vendorNamespace>` MUST be a valid [vendor namespace](#vendor-namespace)
- `<authorityIdentifier>` is the identifier of the organizational unit.
  - MUST only consist of lower case ASCII letters (`a-z`) and digits (`0-9`).
- MUST match Regexp: `^[a-z0-9]+(?:[.][a-z0-9]+){1}$`

**Examples**: `sap.odm`.

### Sub-Context Namespace

A <dfn id="def-ord-sub-context-namespace">sub-context namespace</dfn> is a stable and globally unique identifier namespace that allows for further namespacing within a [system namespace](#system-namespace) or [authority namespace](#authority-namespace).

A sub-context can be motivated by ownership, ID uniqueness, domain or technical modularity concerns.

- A Sub-Context MUST be directly below an application / service namespace or an authority namespace.
- A Sub-Context MAY contain further sub-namespaces, e.g. `subcontext.subsubcontext`.
- **The Sub-Context MUST NOT be interpreted as identity by services and consumers.**

A sub-context namespace MUST be constructed according to the following rules:

`<subContextNamespace>` := `<systemNamespace|authorityNamespace>.<subContextName>`

- `<systemNamespace|authorityNamespace>` MUST be a valid [system namespace](#system-namespace) or [authority namespace](#authority-namespace).
- `<subContextName>` is the identifier of the application / service.
  - MUST only consist of lower case ASCII letters (`a-z`) and digits (`0-9`) (`^[a-z0-9]+$`).
  - MAY include further sub-context namespaces, separated by `.`.
- MUST match Regexp: `^[a-z0-9]+(?:[.][a-z0-9]+){2,}$`

**Examples**: `sap.billing.sb`, `sap.s4.beh`, `sap.odm.finance.bank`.

It is NOT RECOMMENDED to use sub-context namespaces for grouping purposes only, see [grouping and bundling](./grouping-and-bundling.md#namespaces).

### Customer Namespace

Some systems allow ORD content to be created or governed within a customer scope.
Such content SHOULD use a namespace below the reserved [vendor namespace](#vendor-namespace) `customer` or its shorter alias `c`.
If a provider cannot reliably distinguish customer-created content from the described system's standard content, it MAY publish the customer-created content under the system's regular namespace instead.
These namespaces identify the customer-scoped ID space and MUST NOT be interpreted as vendor ownership, which is defined via `partOfPackage.vendor`.
The reserved authority namespace `customer.ext` can be used for customer in-app extensions.

Customer namespaces MUST NOT be used for content published in a global marketplace or otherwise shared globally unless the platform allocating the ORD IDs guarantees their global uniqueness across customer scopes.
Partner content MAY be developed under a customer namespace while it remains within a customer scope.
It MAY retain those ORD IDs when published globally if such a global uniqueness guarantee exists.
Otherwise, before that content is offered in a global marketplace or otherwise shared globally, it MUST be exported with ORD IDs under the registered vendor namespace of the partner.
This export creates the globally published identity and does not rename the customer-scoped ORD IDs.

The uniqueness scope of a `customer.*` or `c.*` ORD ID is the applicable customer scope.
This scope is often one [system instance / tenant](../index.md#system-instance), but it MAY be a platform-managed customer context spanning multiple system instances / tenants.
The namespace owner MUST ensure conflict-free ID allocation throughout that scope.
Catalogs and consumers MUST retain the customer scope when comparing, resolving, or deduplicating these ORD IDs.
The same ORD ID string in different customer scopes MUST NOT be treated as the same resource solely because the strings match.

For ORD resource types that use `partOfPackage`, the referenced [Package](../interfaces/Document.md#package) `vendor` is authoritative for current ownership attribution.
It MUST NOT be derived from the namespace of the resource ORD IDs.
An ORD ID has the general requirement to be stable, so it MUST NOT be changed solely because its current vendor attribution changes, for example due to a reorganization, acquisition, or other commercial change.

For cases where the [36-character namespace length limit](#namespace-constraints) is tight, a shorter alias `c` is also reserved and is equivalent to `customer`.

## ORD ID

An <dfn id="def-ord-id">ORD ID</dfn> is a stable identifier for [ORD resources](../index.md#ord-resource) and [ORD taxonomies](../index.md#ord-taxonomy).
It is globally unique at design-time unless it uses a `customer.*` or `c.*` namespace, in which case it is unique within the applicable [customer scope](#customer-namespace).

It serves two purposes:

- Use as an identifier for ORD information.
- Refer to an ORD resources/taxonomy.

Except for the customer-scoped case, the ORD ID is a globally unique identifier from a [system type](../index.md#system-type) perspective and is [system-instance-unaware](../index.md#system-instance-unaware).
This means that the ORD ID will not include information about system instances (e.g. tenant IDs) and is therefore only unique at design-time.
Therefore an ORD ID is not unique from a [system instance](../index.md#system-instance) perspective.
The same resource (with the same ORD ID) can be exposed in different variations (e.g. customizations, extensions) by multiple system instances at run-time.

To get a globally unique ID at run-time, a composite key is required.
This can be achieved by either combining it with a system instance ID or a full version, depending on the use cases.

When the same shared ORD information is published or reused by multiple [system types](../index.md#system-type), the ORD ID identifies the shared contract, taxonomy item, definition or governance model, and the system type or system instance provides the additional context for uniqueness.
This commonly uses an [authority namespace](#authority-namespace), but can also use a system namespace when that system type owns the reused definition.

### ORD ID Construction

The ORD ID consists of four fragments, separated by `:`.

<OrdIdDiagram />

It MUST be constructed as defined here:

**`<ordId>`** := `<namespace>:<conceptName>:<resourceName>:[v<majorVersion>]`

- **`<namespace>`** := an [ORD namespace](#namespaces).
  The namespace MUST reflect the owner governing the described ORD information.
  - For `Package`, `ConsumptionBundle`, `APIResource`, `EventResource`, `EntityType`, `Capability`, `IntegrationDependency`, `DataProduct` and `Agent`:
    - MUST be a valid [system namespace](#system-namespace), [authority namespace](#authority-namespace) or [sub-context namespace](#sub-context-namespace) thereof
    - A [system namespace](#system-namespace) SHOULD be used when the resource, resource grouping, access grouping or taxonomy item is specific to a single system type.
    - An [authority namespace](#authority-namespace) SHOULD be used when the resource, resource grouping, access grouping or taxonomy item represents a shared contract, definition or governance model across multiple [system types](../index.md#system-type). See [Shared Taxonomy, Resources and Contracts](./shared-resources.md).
  - For `Vendor` and `Product`:
    - MUST be a valid [vendor namespace](#vendor-namespace) for `Vendor` and `Product`
  - For system-namespaced ORD IDs, the provider is the system hosting the described resource.
    In advanced cases, the provider could be an embedded system / sidecar with its own system namespace.
    This can lead to multiple system namespaces within one system.
    In this case it needs to be taken care that static publishing does not create conflicts, e.g. through moving the publishing responsibility to the embedded system (and not by the parent system).
  - For authority-namespaced ORD IDs, the namespace identifies the organizational unit governing the shared contract, definition, taxonomy item or access grouping.

- **`<conceptName>`** := The ORD concept name of the described resource / taxonomy.
  - Use `product` for `Product`
  - Use `vendor` for `Vendor`
  - Use `package` for `Package`
  - Use `consumptionBundle` for `ConsumptionBundle`
  - Use `apiResource` for `APIResource`
  - Use `eventResource` for `EventResource`
  - Use `capability` for `Capability`
  - Use `entityType` for `EntityType`
  - Use `integrationDependency` for `IntegrationDependency`
  - Use `dataProduct` for `DataProduct`
  - Use `agent` for `Agent`

- **`<resourceName>`** := the technical resource name.
  - MUST only contain ASCII letters (`a-z`, `A-Z`), digits (`0-9`) and the special characters `-`, `_` and `.`.
  - MUST be unique within the `<namespace>`.
  - SHOULD be a (somewhat) human readable and SEO/URL friendly string (avoid UUIDs).
  - SHOULD be kept stable when a new `<majorVersion>` is introduced, so multiple major versions of the same resource share the same `<namespace>:<conceptName>:<resourceName>:` part of the ORD ID.
    - This can help an aggregator to group the semantically same APIs multiple major versions together
    - If this cannot be followed, the relationship to the successor APIs can still be indicated via the `successors` property.

- **`<majorVersion>`** := a version incrementor of the resource that increases on breaking changes.
  - MUST be provided for `Package`, `ConsumptionBundle`, `APIResource`, `EventResource`, `EntityType`, `Capability`, `IntegrationDependency`, `DataProduct` and `Agent`
  - MUST NOT be provided for `Product` and `Vendor`
  - If provided: MUST be an integer and MUST NOT contain leading zeroes.
  - MUST be incremented if the resource introduced an incompatible API change. This correlates with a major version change in [Semantic Versioning](https://semver.org/).
    - If the described resource has a `releaseStatus` of `development` or `beta`, this rule can be ignored. Incompatible changes MAY be introduced in these resources without incrementing `<majorVersion>`, as described in [Versioning and Lifecycle](./versioning-and-lifecycle.md#exception-for-development-and-beta-resources).
  - MUST NOT be incremented if non-breaking changes have been made to the resource; the updated resource should replace the current one.
  - The `<majorVersion>` and the major version of [`version`](./versioning-and-lifecycle.md#relationship-between-version-and-ord-id-majorversion) SHOULD be identical.
  - If the REST API expresses its version in the URL path (e.g. `/v2/`), `<majorVersion>` SHOULD match it.

- The ORD ID MUST be unique within the [scope defined above](#ord-id), including the customer scope for `customer.*` and `c.*` namespaces.

- The ORD ID is immutable and MUST not change after it has been published.

- The ORD ID MUST not exceed 255 characters in total.

- The ORD ID MUST be interpreted case-insensitively when used for comparison, lookups or deduplication.
  - Although `<resourceName>` permits mixed-case letters, two ORD IDs differing only in casing MUST be treated as the same identifier.
  - Case-insensitive comparison is an ORD identifier rule. It does not change the case sensitivity of URL paths that contain an ORD ID.

An ORD ID MUST match the following [regular expression](https://en.wikipedia.org/wiki/Regular_expression):

```regex
^([a-z0-9]+(?:[.][a-z0-9]+)*):(package|consumptionBundle|product|vendor|apiResource|eventResource|capability|entityType|integrationDependency|dataProduct|agent):([a-zA-Z0-9._\-]+):(v0|v[1-9][0-9]*|)$
```

Examples:

- sap.s4:apiResource:CE_APS_COM_CS_A4C_ODATA_0001:v1

### ORD ID Resolving

An ORD ID should contain all of the necessary information to be self-contained and to be successfully resolved.

Resolving an ORD ID can serve multiple purposes, for example, by having an ID we can construct the link to the API Catalog page describing this resource.
Or we can construct the API request to an [ORD aggregator](../index.md#ord-aggregator) where the ORD resource can be accessed.

The rules about how an ORD ID is resolved to the customer's own URLs/APIs SHOULD be provided by the ORD aggregator.

## Correlation ID

A <dfn id="def-correlation-id">Correlation ID</dfn> is a stable and globally unique reference and is conceptually similar to an [ORD ID](#ord-id).
It can be used to correlate [ORD resources](../index.md#ord-resource) and [ORD taxonomy](../index.md#ord-taxonomy) to information that is provided by other systems (especially systems of record).
If the target information is already described via ORD, the relation should be expressed via an [ORD ID](#ord-id) instead.

The correlation ID does not have a version fragment like the ORD ID, because it assumes that versioning is already part of the `<localIdentifier>` (if applicable at all).
It is assumed that the `<localIdentifier>` already considers the problem of versioning if applicable.

### Correlation ID Construction

A Correlation ID consists of three fragments, separated by `:`.
Its first two fragments `<namespace>:<conceptName>` are a [Concept ID](#concept-id).

<CorrelationIdDiagram />

It MUST be constructed as defined here:

**`<correlationId>`** := `<namespace>:<conceptName>:<localIdentifier>`

- **`<namespace>`** := an [ORD namespace](#namespaces).
  - MUST be a valid [namespace](#namespaces).

- **`<conceptName>`**: the name of the target concept (free choice of concept name)
  - MUST only contain alphanumeric characters and the special characters `-`, `_`, `/` and `.`.
  - MUST be unique within the chosen `<namespace>`.
  - MUST be a concept that is understood by the application of the `<namespace>`.
  - SHOULD be (sufficiently) human readable and SEO/URL friendly (avoid UUIDs).
  - SHOULD be registered as a known concept on the level of its `<namespace>`.

- **`<localIdentifier>`** := the local resource ID.
  - MUST only contain alphanumeric characters and the special characters `-`, `_`, `/` and `.`.
  - MUST be unique within the chosen `<namespace>`.
  - SHOULD be (sufficiently) human readable and SEO/URL friendly (avoid UUIDs).

The system of record application / service or responsible org unit is indicated through the [`<namespace>`](#namespaces) and MUST be able to resolve / correlate when given the `<conceptName>` and the `<localIdentifier>`.

A Correlation ID MUST not exceed 255 characters in total.

A Correlation ID MUST match the following [regular expression](https://en.wikipedia.org/wiki/Regular_expression):

```regex
^([a-z0-9]+(?:[.][a-z0-9]+)*):([a-zA-Z0-9._\-\/]+):([a-zA-Z0-9._\-\/]+)$
```

Examples (contrived):

- `sap.s4:communicationScenario:SAP_COM_0008`
- `sap.cld:system:500064231`
- `sap.cld:tenant:741234567`

## Concept ID

A Concept ID identifies a concept within an ORD namespace.

### Concept ID Construction

A Concept ID consists of two fragments, separated by `:`.

<ConceptIdDiagram />

It MUST be constructed as defined here:

**`<conceptId>`** := `<namespace>:<conceptName>`

- **`<namespace>`** := an [ORD namespace](#namespaces).
  - MUST be a valid [namespace](#namespaces).

- **`<conceptName>`**: the name of the target concept (free choice of concept name)
  - MUST only contain alphanumeric characters and the special characters `-`, `_`, `/` and `.`.
  - MUST be unique within the chosen `<namespace>`.
  - MUST be a concept that is understood by the application owning the `<namespace>`.
  - SHOULD be (sufficiently) human readable and SEO/URL friendly (avoid UUIDs).
  - SHOULD be registered as a known concept on the level of its `<namespace>`.

The system of record application / service or responsible org unit is indicated through the [`<namespace>`](#namespaces) and MUST be able to resolve / correlate the concept when given the `<conceptName>`.

A Concept ID MUST not exceed 255 characters in total.

A Concept ID MUST match the following [regular expression](https://en.wikipedia.org/wiki/Regular_expression):

```regex
^([a-z0-9]+(?:[.][a-z0-9]+)*):([a-zA-Z0-9._\-\/]+)$
```

Examples (contrived):

- `sap.cap:service`
- `sap.s4:communicationScenario`
- `sap.cld:system`

## Specification ID

A <dfn id="def-specification-id">Specification ID</dfn> is a stable and globally unique reference to a specification of a standard, procedure or guideline.

It can be used to indicate which strategy to use for certain ORD behaviors ([access strategies](../../spec-extensions/access-strategies/index.mdx), credential exchange strategies, [policy levels](../../spec-extensions/policy-levels/index.mdx)) and can be implemented in multiple ways (see [strategy pattern](https://en.wikipedia.org/wiki/Strategy_pattern)).
In some situations it is also used to refer to certain implementation standards (for example resource definition standards).

### Specification ID Construction

<SpecificationIdDiagram />

**`<specificationId>`** := `<namespace>:<specificationIdentifier>:v<majorVersion>`

- **`<namespace>`** := an [ORD namespace](#namespaces).
  - MUST be a valid [namespace](#namespaces).

  - If the specification is specific only to a single application / service, a [system namespace](#system-namespace) SHOULD be chosen.

- **`<specificationIdentifier>`** a technical Specification Identifier that is unique within `<namespace>`
  - MUST only contain ASCII letters (`a-z`, `A-Z`), digits (`0-9`) and the special characters `-`, `_` and `.`.
  - MUST be unique within `<namespace>`.
  - SHOULD be (sufficiently) human readable (avoid UUIDs).

- **`<majorVersion>`** the major version for the chosen specification
  - MUST be an integer.
  - MUST be incremented if the specification introduced an incompatible change for the implementers of the specification.
    This correlates with a major version change in [Semantic Versioning](https://semver.org/).
  - MUST NOT be incremented if non-breaking changes have been made; the updated specification should replace the current one.

A Specification ID MUST not exceed 255 characters in total.

A Specification ID MUST match the following [regular expression](https://en.wikipedia.org/wiki/Regular_expression):

```regex
^([a-z0-9]+(?:[.][a-z0-9]+)*):([a-zA-Z0-9._\-]+):(v0|v[1-9][0-9]*)$
```
