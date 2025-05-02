---
sidebar_position: 0
title: ORD Specification
---

# Open Resource Discovery Specification 1.10

## Notational Conventions

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in [RFC 2119](https://tools.ietf.org/html/rfc2119).

## Terminology

This specification defines the following terms (for the ORD context):

- <dfn id="def-ord">ORD</dfn> is the abbreviation for Open Resource Discovery.
  It refers to the standard (as defined by the specification) as a whole.

- <dfn id="def-ord-information">ORD information</dfn> is the sum of all information that can be expressed through ORD.

  ORD information can have different scopes or views:

  - <dfn id="def-system-instance-aware">system instance aware</dfn> information describes the state of a specific <a href="#def-system-instance">system instance</a> at run-time, potentially reflecting customizations.
    System instance aware information are allowed to be different between system instances of the same <a href="#def-system-type">system type</a>.

  - <dfn id="def-system-instance-unaware">system instance unaware</dfn> information are identical across all <a href="#def-system-instance">system instance</a> of the described <a href="#def-system-type">system type</a>.

  - <dfn id="def-cross-system">cross-system</dfn> information is shared and reused between multiple <a href="#def-system-type">system types</a>.
    Most notably, this applies to the <a href="#def-ord-taxonomy">ord taxonomy</a>.

  - The <dfn id="def-static-catalog-view">static catalog view</dfn> represents a generic perspective on all potential resources customers / users could use before they actually provision systems.
    The information is usually provided by reference or sandbox systems which describe their capabilities on behalf of their <a href="#def-system-type">system type</a>.
    If the ORD information is <a href="#def-system-instance-unaware">system instance unaware</a> it also reflects the static catalog view.
    An example for this are API Catalogs like [SAP Business Accelerator Hub](https://api.sap.com/) that can be browsed even before actually provisioning any of the described systems.

  - The <dfn id="def-as-is-view">as-is view</dfn> represents a [system instance](#def-system-instance) state at run time and can therefore represent their actual state.
    Depending on how customizable the system is, this can include reflecting customizations and extensions.
    If a resource can be customized, it needs to be described <a href="#def-system-instance-aware">system instance aware</a>.
    If it cannot be customized, <a href="#def-system-instance-unaware">system instance unaware</a> description is sufficient.

  ORD information can be categorized into resources and taxonomies:

  - <dfn id="def-ord-resource">ORD resource</dfn> information describes application and service <a href="#def-resource">resources</a>.
    Currently it covers API resources and Event resources.
    ORD resource information MAY be <a href="#def-system-instance-aware">system instance aware</a>, depending on the implementation of the <a href="#def-system-type">system type</a>.

  - <dfn id="def-ord-taxonomy">ORD taxonomy</dfn> is used to categorize and structure <a href="#def-resource">resources</a>.
    Taxonomies span across <a href="#def-product">products</a> and <a href="#def-system-type">system types</a> and resources and therefore fall under the <a href="#def-cross-system">cross-system</a> information category.
    - Some taxonomies are implemented as dedicated Entities (e.g. `Package`, `Product`) that can express additional information.
      They are defined by the <a href="#def-ord-provider">ORD providers</a> in a decentralized manner.
    - Other taxonomies are provided via fixed enums (code lists) and are defined as part of ORD itself, e.g. tags.
    - Taxonomies are not a consumer contract and therefore do not offer the same stability guarantees and lifecycle management as ORD resources.

- <dfn id="def-ord-behavior">ORD behavior</dfn> standardizes how <a href="#def-ord-information">ORD information</a> is discovered, transported, and aggregated.

- A <dfn id="def-system-type">system type</dfn> is the abstract type of an application or service from operational perspective. It is also known as system role ([SAP CLD](https://support.sap.com/en/tools/software-logistics-tools/landscape-management-process/system-landscape-directory.html)). Within the specification it is sometimes referred to as _application and service_ for better readability.
  Since system type is an abstract concept, it is not concretely addressable.
  A [system deployment](#def-system-deployment) and potentially a [system instance](#def-system-instance) needs to be created and used in this case.

  Please note that a system type is similar, but not necessarily identical to a [product](#def-product).
  System type is a technical concept, while product is a term for external communication and sales.

- A <dfn id="def-system-deployment">system deployment</dfn> is a concrete running instance of a <a href="#def-system-type">system type</a>. If the system type supports tenant isolation, a system deployment is the host for multiple <a href="#def-system-instance">system instances</a> (tenants). A system deployment has at least one [base URL](#def-base-url).

- A <dfn id="def-system-instance">system instance</dfn> is running instance of a <a href="#def-system-type">system type</a> and always refers to the _most specific_ instance from a customer / account perspective. Usually this is the boundary where the isolation of resources, capabilities and data is ensured.
  If the system type offers tenant isolation (multi-tenancy), system instance refers to a tenant. If there is no tenant isolation, there are two options: Either the isolation is achieved by having a dedicated [system deployment](#def-system-deployment) per tenant or system isolation does not matter. In those cases system instance equals the system deployment.

  To illustrate this, think of an API resource. It may be differently described between system-instances of the same type due to configuration and extensibility. But for sure, the API of one system-instance acts on their own isolated data set (potentially also users).

  The term is also known as System (simplified public SAP communication). For internal SAP communication it is referred to as tenant ([SAP CLD](https://support.sap.com/en/tools/software-logistics-tools/landscape-management-process/system-landscape-directory.html)) if multi-tenancy is supported or system ([SAP CLD](https://support.sap.com/en/tools/software-logistics-tools/landscape-management-process/system-landscape-directory.html)) if not.

  A system instance can act as an [ORD Provider](#ord-provider).

- A <dfn id="def-system-version">system version</dfn> states the design-time version / release of a [system instance](#def-system-instance). It provides versioning for operational purposes for the <a href="#def-system-type">system type</a>. E.g. all system instances of the same system version could have the same static metadata description.

- A <dfn id="def-system-landscape">system landscape</dfn> is a set of <a href="#def-system-instance">system instances</a> that are explicitly combined together, for example via a shared zone of trust/connectivity, an account or a [namespace concept](#namespaces).

- A <dfn id="def-resource">resource</dfn> is provided by or for a [system instance](#def-system-instance) for outside consumption and/or communication.

  - A <dfn id="def-machine-readable-resource">machine-readable resource</dfn> is a <a href="#def-resource">resource</a> that can be used for machine consumption and communication.
    For example, APIs and events.
    They are usually described through a [resource definition](#def-resource-definition) format.

  - A <dfn id="def-human-consumption-resource">human-consumption resource</dfn> is a <a href="#def-resource">resource</a> that is meant for human consumption, for example documentation.

- A <dfn id="def-resource-definition">resource definition</dfn> is a machine-readable, structured document defining the inputs and outputs of a [machine-readable resource](#def-machine-readable-resource) in a standardized format.
  It is primarily designed for automated processing, not human consumption. See also [definition](https://webapi-discovery.github.io/rfcs/rfc0001.html#definitions) by the [W3 WebAPI Discovery Community Group](https://www.w3.org/community/web-api-discovery/).

- A <dfn id="def-product">product</dfn> is understood as a software product:
  A non-versioned, high-level entity for structuring the software portfolio from a software logistics perspective.
  While <a href="#def-system-type">system type</a> addresses the technical perspective, product is the term to use for customer-facing communication.

- A <dfn id="def-base-url">base URL</dfn> is the consistent part of a <a href="#def-system-instance">system instance</a> URL.
  From ORD perspective this is the base URL where the discovery starts and where the [ORD config endpoint](#ord-configuration-endpoint) location is relative to.
  In most cases the base URL consists of the URL protocol, domain name and (if necessary) the port, for example `https://example.com`.
  In rare cases, a relative path (e.g. including a tenant ID) might be included, for example `https://example.com/tenantA/`.

## ORD Roles

The ORD specification consists of several [parts](#ord-parts).
Depending on the role of the adopter, only some parts of the specification are relevant and need to be implemented.

Please note that ORD roles are not exclusive.
A [system type](#def-system-type) can implement multiple roles, e.g. an ORD Consumer MAY also be an ORD Provider.

### ORD Provider

An <dfn id="def-ord-provider">ORD provider</dfn> is a system instance (of an application or service) that exposes ORD information for self-description.

An ORD provider MUST implement the [ORD Provider API](#ord-provider-api), which entails providing an [ORD configuration endpoint](#ord-configuration-endpoint) and [ORD document(s)](#ord-document).
An ORD provider MUST use one of the standardized [ORD transport modes](#ord-transport-modes) for the ORD documents. Depending on the overall architecture, it MUST integrate with specific [ORD aggregators](#ord-aggregator).

> 📖 See also: [How To Adopt ORD as a Provider](../help/faq/adopt-ord-as-provider.md).

![ORD Provider Role](/img/ord-role-provider.svg "ORD Provider Role")

### ORD Aggregator

An <dfn id="def-ord-aggregator">ORD aggregator</dfn> is a system that collects, aggregates, and proxies the ORD information from multiple [ORD providers](#ord-provider).
It reflects the combined information on the ORD providers that it aggregates.
The aggregator itself MAY represent a [static catalog view](#def-static-catalog-view) or a [as-is view](#def-as-is-view).
In case of an [as-is view](#def-as-is-view) of a concrete [system landscape](#def-system-landscape), it MUST support [system instance aware](#def-system-instance-aware) information and MAY support further [system instance](#def-system-instance) grouping concepts, such as accounts, zones etc.
If it needs to reflect system instance aware information it MUST be system instance aware itself.

The ORD information MUST be made available to [ORD Consumers](#ord-consumer) through a higher-quality API, for example via an [ORD Discovery API](#ord-discovery-api) that allows for more advanced consumption patterns.

An ORD aggregator MUST ensure that information that has `visibility` of `private` or `internal` is not made available to consumers that don't have the corresponding permissions to get such information (e.g. external consumers). If ORD consumers get private or internal information, they inherit the responsibility of protecting it.

There are [aggregation rules](#aggregation-rules) and [validation rules](#validation-rules) that an ORD aggregator MUST implement and [ORD Consumers](#ord-consumer) MAY hold to.

It MUST support all [ORD transport modes](#ord-transport-modes) that are used by the systems it aggregates.

It SHOULD support the proposed optimizations for the transport modes, e.g. make use of `systemInstanceAware`, `lastUpdate` properties and support the proposed HTTP cache mechanisms. This has the potential to significantly reduce overall TCO.

![ORD Aggregator Role](/img/ord-role-aggregator.svg "ORD Aggregator Role")

### ORD Consumer

An <dfn id="def-ord-consumer">ORD consumer</dfn> is an actor or a system that needs to retrieve ORD information.

ORD can either be consumed from a single [ORD provider](#ord-provider) (a system instance) or from an [ORD aggregator](#def-ord-aggregator).
The latter is RECOMMENDED, because it provides more information and a higher quality of access.

If the consumer gets the information from an [ORD aggregator](#ord-aggregator), it will be provided through an [ORD Discovery API](#ord-discovery-api).

If the consumer gets the information from an [ORD provider](#ord-provider), it will be received as an [ORD document](#ord-document) via one of the implemented [transport modes](#ord-transport-modes).

An ORD consumer that receives information with a `visibility` of `private` or `internal` inherits the responsibility of the ORD aggregator to protect the information.
The ORD consumer MUST ensure that private and internal information is not exposed to consumers without the corresponding permissions.
If the ORD consumer only needs public information, it SHOULD only request those from the ORD aggregator in the first place.

![ORD Consumer Role](/img/ord-role-consumer.svg "ORD Consumer Role")

## ORD Transport Modes

The specification makes a distinction between how [ORD information](#def-ord-information) is expressed (say, as an [ORD document](#ord-document)) and how it is transported.

An [ORD Provider](#def-ord-provider) MUST implement at least one of the defined transport modes.
If the ORD information is [system instance aware](#def-system-instance-aware), the implementation of the transport mode MUST support providing it **per system instance**.

### Pull Transport

In pull transport mode, [ORD information](#def-ord-information) is made available through a simple REST API that exposes [ORD documents](#ord-document) via `GET` endpoints.

This is implemented by providing an [ORD Provider API](#ord-provider-api).

##### Pull Transport - Pros

- Simple REST implementation
- ORD Provider does not need to know the ORD Aggregators
- Decentralized approach
- Each system provides the ORD information directly

##### Pull Transport - Cons

- Periodic pulling leads to many requests (efficiency)
- Periodic pulling may result in slow information updates. For some use cases it might be critical to get updates as soon as possible.
- No direct feedback channel for validation errors from an ORD aggregator

##### Pull Transport Sequence Diagram

![Pull Transport - Sequence Diagram](/img/ord-pull-transport-sequence.svg "Pull Transport - Sequence Diagram")

### Other Modes of Transport

Other modes of transport have not yet been standardized/specified.
They are are only listed here to outline potential modes that we anticipate.

#### Import Transport

Manual import of the [ORD document](#ord-document) as a JSON file into an interested system or tool (offline mode):

- The system instances do not need to know each other or be integrated in any way
- The ORD document alone is sufficient for this type of consumption
- All URLs in the document MUST be resolvable (e.g. through `baseUrl` or full URLs)

#### Push Transport

> 🚧 The specification currently does not cover this mode.

The Document can be pushed to the interested ORD aggregator, e.g. via a webhook, a known HTTP POST endpoint, or via file upload.

- Every system instance needs to know where the ORD documents need to be pushed to.
- An ORD aggregator might provide a dedicated HTTP POST endpoint for this.
- Changes can be pushed faster and more efficiently compared to the [pull transport](#pull-transport).
- The specification currently does not cover this mode.

#### Event-Driven Transport

> 🚧 The specification currently does not cover this mode.

Event-driven transport uses a publish/subscribe or a distributed log pattern.

## ORD Parts

The ORD specification consists of several parts.
Depending on the role of the adopter, only some parts of the specification are relevant and need to be implemented.

### ORD Document

#### Overview

The <dfn id="def-ord-document">ORD document</dfn> is a standardized, technology agnostic and machine-readable document that provides a high-level description of the resources (such as APIs and Events) of a **system instance**. The document itself is just a wrapper format to transport the actual ORD information.
It is notated and distributed in the [JSON format](https://www.json.org/json-en.html) and can be [transported in various ways](#ord-transport-modes).

#### ORD Document Content

The ORD document MUST be a valid [JSON](https://www.json.org/json-en.html) document with [UTF-8](https://en.wikipedia.org/wiki/UTF-8) encoding.
It MUST NOT exceed 2MB in size.
If the size gets too big, consider splitting the information into multiple ORD documents instead.

The interfaces are described in [ORD document interface](./interfaces/document.md), including [examples](./interfaces/document.md#examples).

An ORD document MUST be compliant with the following [JSON Schema](https://json-schema.org/) definition: [Document.schema.json](https://open-resource-discovery.github.io/specification/spec-v1/interfaces/Document.schema.json).

Internationalization and localization are not supported natively in ORD documents.
It is therefore RECOMMENDED to use American English for human-readable titles and descriptions.

#### ORD Document Data Model (Simplified)

![High-Level ORD Entities (simplified)](/img/ord-high-level-data-model.drawio.svg "High-Level ORD Entities (simplified)")

#### Considerations on the ORD Content

The ORD documents MUST describe the current state of a concrete, running [system instance](#def-system-instance).

All resources that are described within one document MUST describe the same system instance.

The described information MUST not be duplicated within or across ORD documents.
If some information like Package or Consumption Bundle are needed across multiple documents they can either be put in one of the documents or be moved to a separate document for shared information.
This also applies across ORD Providers, which is ensured through the correct use of namespaces and namespace ownerships.

The [validation rules](#validation-rules) MUST be considered.

If the [resources](#def-resource) that are described through ORD are [system instance aware](#def-system-instance-aware) (they differ between system instances), the ORD document MUST reflect this.
In that case, one ORD document MUST be provided for each system instance.
Only if the information is [system instance unaware](#def-system-instance-unaware) (the system behaves the same for each instance), a single ORD document can represent the system as a whole.

Differences between system instances are possible, for example, when the system has configuration or extensibility capabilities that result in resources being activated, deactivated, added, or modified.
This might happen at config time, deploy time, or even at runtime.

For example, a configuration could explicitly disable an API. In this case, the ORD document for this specific system instance MUST not describe the disabled API.
Some systems are even extensible in a way that customers can add new APIs or alter existing APIs at runtime.
Those changes MUST be documented via ORD.
Please note that some changes only affect the referenced [resource definitions](#def-resource-definition) and not the ORD document itself.
However, the change in the resource definition MUST be indicated through a version increment (see [Version and Lifecycle](#version-and-lifecycle)).

#### Considerations on the Granularity of ORD Documents

- MUST be split if multiple namespaces or even system instances are described.
  At least one ORD document MUST be created for each, as the ORD document is scoped to describe a specific system instance.
- MUST be split when they become too big in size (MUST not exceed 2 MB), as no pagination is supported.
- MUST be split with different access strategies (as an ORD document can't be both open and protected).
- SHOULD be split according to lifecycle and ownership concerns (e.g. all customer or partner created resources together).
- SHOULD be split according to team autonomy boundaries / bounded contexts / domains.
- SHOULD be split to optimize retrieval and cache handling.
  - Move frequently changing information to dedicated or smaller documents.

#### ORD Information Reuse

To avoid repeating too much information, ORD provides some limited means for information reuse on [document level](#document-level-inheritance) and [package level](#package-level-inheritance).

Which attributes support information reuse and how it works is described in the [ORD Document interface documentation](./interfaces/document.md) and the [ORD Aggregator Content Enrichment and Preservation](#content-enrichment-and-preservation) section.

##### Document Level Inheritance

Some ORD information are described on the document root level and apply to all information that the ORD Document contains.
In some cases (like `policyLevel`), it is also possible to override the values locally.

##### Package Level Inheritance

Some ORD information are described on Package level and inherited down to all resources it that are assigned to the it.
The information on package level are merged into resource level, but can be overridden locally at resource level.

> Please note that package level inheritance might not always have the right granularity, as putting resources into packages can have a different motivation / cut than the reuse.
> In this case, the information need to be defined on resource level individually, leading to some information duplication.
> For ORD 2.0 we consider replacing package level inheritance with a more generic information reuse concept.

#### ORD Document Content Extensions

Some properties only have a fixed set of allowed values.
In many cases they allow setting this to `custom`.
The actual value is then provided through an accompanying property, such as `customType`, which has no restrictions (but also no agreed-upon semantics).

Additional information or categorization can be added through the generic `Label` concept, which is available for most ORD information.

If such custom values or labels are relied upon by more than one application or team, they SHOULD be standardized through ORD.
Please [create an issue](https://github.com/open-resource-discovery/specification/issues) to request this.

### ORD Provider API

This section details how an [ORD Provider](#ord-provider) exposes one or multiple [ORD documents](#ord-document) for the [pull transport mode](#pull-transport).

The ORD Provider MUST implement a RESTful API that provides an [ORD configuration endpoint](#ord-configuration-endpoint) and at least one [ORD document endpoint](#ord-document-endpoint).

The API contract is defined as an [OpenAPI 3 Definition](https://open-resource-discovery.github.io/specification/spec-v1/interfaces/DocumentAPI.oas3.yaml).
The definition contains the well-known ORD configuration endpoint and one exemplary document endpoint.

#### ORD Configuration Endpoint

The <dfn id="def-configuration-endpoint">ORD configuration endpoint</dfn> is the single entry point for the discovery.

The motivation behind the ORD configuration endpoint is to:

- Define which version(s) and capabilities of the ORD standard are currently supported by the [system instance](#def-system-instance).
- Define where and how the ORD information can be accessed
  - Which transport mode is available (URLs to ORD document(s) indicate the [pull transport mode](#pull-transport))
  - Which [access strategies](../spec-extensions/access-strategies/index.mdx) are available

The idea behind the configuration endpoint is inspired by the [well-known URI](https://datatracker.ietf.org/doc/html/rfc8615) discovery mechanism.

> Some applications on the Web require the discovery of information
> about an origin [[RFC6454](https://datatracker.ietf.org/doc/html/rfc6454)] (sometimes called "site-wide metadata")
> before making a request.
>
> <cite>https://datatracker.ietf.org/doc/html/rfc8615#section-1</cite>

##### Provider Implementation

The [ORD configuration endpoint](#ord-configuration-endpoint) MUST be implemented by [ORD Providers](#def-ord-provider) and be accessible via an HTTP GET request.

The response MUST be a valid UTF-8 encoded [JSON](https://www.json.org/json-en.html) document that is returned with the `application/json;charset=UTF-8` content type and the HTTP Status Code `200`.

- The response MUST not contain any sensitive information or leak tenant specific information.
- It MUST be compliant with the following [JSON Schema](https://json-schema.org/) definition: [Configuration.schema.json](https://open-resource-discovery.github.io/specification/spec-v1/interfaces/Configuration.schema.json).
- Please refer to the [interface documentation](./interfaces/configuration.md) for more details and [examples](./interfaces/configuration.md#complete-examples).

All of the [common REST characteristics](#common-rest-characteristics) MUST be met.
The rules on [ORD Provider Cache Handling](#ord-provider-cache-handling) apply.

It is RECOMMENDED to make this endpoint public.

It is RECOMMENDED use the fixed [Well-Known URI](https://tools.ietf.org/html/rfc8615#section-3) `/.well-known/open-resource-discovery` (as registered [here](https://www.iana.org/assignments/well-known-uris/well-known-uris.xhtml)) that is relative to the system instances [base URL](#def-base-url).

Since the ORD config does not contain any tenant specific information, it is RECOMMENDED to only provide one ORD configuration endpoint for one [system deployment](#def-system-deployment) (same [base URL](#def-base-url)) of a multi-tenant application.

This assumes that the ORD document URLs in the configuration are not different per tenant and the tenant ID is selected as part of the access strategy.
If the application is single-tenant or the tenant ID is part of the base URL (for example in the domain name), each tenant / system instance will have their own ORD config endpoint as a consequence.

If the ORD configuration endpoint is either customized or protected, the information where to find and access the ORD config endpoint MUST be made available to all ORD consumers and aggregators and will be a prerequisite for the ORD discovery.
This could be implemented either through explicit solutions like a central system registry or through established conventions.

If the ORD configuration endpoint is customized, the ORD configuration response MUST either use absolute URLs or provide the `baseUrl`.

#### ORD Document Endpoint

The <dfn id="def-document-endpoint">ORD document endpoint</dfn> provides an [ORD document](#ord-document) via [pull transport](#pull-transport).
An [ORD Provider](#ord-provider) MUST implement one ORD document endpoint for each ORD document it exposes.

##### Provider Implementation

The content of an [ORD document](#ord-document) MUST be made available via an HTTP GET request and be returned with the `application/json;charset=UTF-8` MIME type and the HTTP Status Code `200`.

All of the [common REST characteristics](#common-rest-characteristics) MUST be met.

If the ORD document is [system instance aware](#def-system-instance-aware) (different between system instances), the ORD document endpoint MUST ensure that the response describes the correct/chosen instance specifically.
This can be implemented, for example, via authentication (multi tenancy) or by having different URLs per system instance.
In this case, the ORD documents MUST be provided and fetched for _each_ system instance.
For more details, please see the [considerations on the ORD content](#considerations-on-the-ord-content) section.

The rules for [ORD Provider Cache Handling](#ord-provider-cache-handling) apply.

#### Consumer Perspective

An [ORD consumer](#ord-consumer) MUST first consult the [ORD configuration endpoint](#ord-configuration-endpoint).
The response will indicate the supported version(s) of ORD, the URLs of the exposed [ORD documents](#ord-document), and additional information that has implications for accessing the information.
For all rules and more information, please consult the [configuration interfaces](interfaces/configuration.md).

The most important rules are:

- The consumer MUST NOT make any fixed assumptions on the ORD document endpoint paths.
- The consumer MUST download the [ORD document](#ord-document) via an HTTP GET request.
- It is RECOMMENDED to add `Accept: application/json` to all request headers.
- The rules for [ORD Consumer Cache Handling](#ord-consumer-cache-handling) apply.

#### Cache Handling

##### ORD Provider Cache Handling

The GET endpoints MUST provide a [`Cache-Control`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control) HTTP header defining the caching behavior.
It is RECOMMENDED to also provide an [`ETag`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag) HTTP header with the corresponding [`304`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/304) (Not Modified) response behavior.

If an ORD resource, or any of its referenced resource definitions, has changed, the `version` of the affected resource MUST be updated/incremented.
The `ETag` header value on the document REST response will implicitly be updated as a consequence.

##### ORD Consumer Cache Handling

An arbitrary [ORD consumer](#ord-consumer) MAY implement the following cache handling rules to optimize frequent access.
An [ORD aggregator](#ord-aggregator) MUST implement the cache handling rules in order to reduce unnecessary load on the ORD providers.

The `Cache-Control` and `ETag` headers (as described in [ORD Provider Cache Handling](#ord-provider-cache-handling)) MUST be respected and correctly implemented from the client's side.

Referenced definition files MUST only be fetched if they have not been retrieved yet or the `version` has been incremented since the last retrieval.

ORD documents and ORD resources that have been marked as [system instance aware](#def-system-instance-aware) MUST each be fetched per tenant.
If they are [system instance unaware](#def-system-instance-unaware) they SHOULD only be fetched once per system.

### ORD Aggregation

This section covers the aggregation rules and validations for [ORD aggregators](#ord-aggregator).

[ORD Consumers](#def-ord-consumer) that retrieve information from an aggregator MAY rely on the outlined rules.

#### Aggregation Rules

One of the responsibilities of an [ORD aggregator](#ord-aggregator) is to combine the ORD information from multiple system instances.
When information from many different system instances comes together, some situations may arise that need to be resolved through clearly defined rules.

##### Merging ORD information

This section outlines the rules of how ORD information is merged and - if conflicts arise - how they are resolved.

First, the distinction between [ORD taxonomy](#def-ord-taxonomy) and [ORD resource](#def-ord-resource) information must be understood.

The ORD taxonomy is considered <a href="#def-cross-system">cross-system</a> information, while [ORD resources](#def-ord-resource) can be either [system instance aware](#def-system-instance-aware) or [system instance unaware](#def-system-instance-unaware).

###### Merging ORD Taxonomy

This applies currently to the `Package` and `Product` [ORD taxonomy](#def-ord-taxonomy) interfaces.

The information is [system instance unaware](#def-system-instance-unaware) and therefore MUST not be stored for each [system instance](#def-system-instance).
If multiple systems/system instances describe the same ORD taxonomy instance, the following merging rules MUST be followed:

- Instances with the same [ORD ID](#ord-id) are considered to be the same and MUST be merged.
- If there is a conflict, the instance with the higher `version` according to the [Semantic Versioning](https://semver.org/) rules takes precedence.
- If both instances have the same version but different content, the most recent information takes precedence.
  This case SHOULD be avoided and the aggregator MUST indicate this problem as part of the [validation rules](#validation-rules).
- If a breaking change was introduced to a taxonomy entity (e.g. the meaning changed), a new major version of it MUST be introduced.
  See [Versioning and Lifecycle](#version-and-lifecycle).

###### Merging ORD Resources

This applies currently to the `APIResource` and `EventResource` [ORD resource](#def-ord-resource) interfaces.

The information MAY be [system instance aware](#def-system-instance-aware).
Therefore, the information MUST be retrieved and stored for each [system instance](#def-system-instance) individually.
In this case, an ORD resource with the same [ORD ID](#ord-id) will exist exactly once for each system instance.
Therefore, the ORD ID MUST be further qualified by a system instance ID when stored by the aggregator.
If a [system landscape](#def-system-landscape) view needs to be supported, the information about the landscape assignment/zone information MUST be enriched and considered by the aggregator.

If the same system instances describe the same ORD resource, the following merging rules MUST be followed:

- Instances with the same ORD ID from the same system instance are considered to be the same and MUST be merged.
- Instances with the same ORD ID from different system instances MUST not be merged.
  If the aggregator knows for sure that the information is [system instance unaware](#def-system-instance-unaware) it MAY only retrieve and store some of the information once for optimization purposes.
  However, the aggregator MUST store the information about which system instances (system instance IDs) the resource is available on.
- If there is a conflict, the instance with the higher `version` according to [Semantic Versioning](https://semver.org/) rules takes precedence.
- If both instances have the same version but different content, the most recent information takes precedence.
  This case SHOULD be avoided and the aggregator MUST indicate this problem as part of the [validation rules](#validation-rules).
- If a breaking change was introduced to an ORD resource, a new major version of it MUST be introduced.
  See [Versioning and Lifecycle](#version-and-lifecycle).

##### Content Enrichment and Preservation

Some ORD information may need to be added, modified, inherited or preserved by the ORD aggregator.

An ORD aggregator MUST implement an internal data model/persistence where the additional information can be stored.
It MUST apply the outlined inheritance rules internally and expose the ORD information to ORD Consumers with inheritance already applied.
This makes it easier for ORD Consumers, as they don't need to understand and apply the outlined rules.

The following rules need to be implemented by ORD aggregators:

- If the aggregator detects a change in a resource (compared to previous state), but the `lastUpdate` isn't provided or hasn't changed since, the aggregator MUST update the `lastUpdate` timestamp on aggregator side.
  - This ensures that consumers can rely on `lastUpdate` to be always available and to understand if a change happened, even if the ORD Provider did not update it at the source
  - Ideally this situation doesn't happen and the ORD Providers update `lastUpdate`. Then the date can also reflect better the time when the change happened, not when it was detected.
- The aggregator MUST apply all defined inheritances from root document properties to all the ORD information that it contains.
  - `policyLevel` (and the corresponding `customPolicyLevel`) MUST be inherited to the resource / package level, with the latter taking precedence.
- The aggregator MUST apply all defined inheritances from `Package` properties to all the ORD resources that it contains.
  - `vendor`, `partOfProducts`, `tags`, `countries`, `industry`, and `lineOfBusiness` MUST be merged without duplicates.
  - `labels` MUST be merged without duplicated values.
    - Values of the same label key will be merged.
    - Duplicate values of the same label key will be removed.
- The aggregator MUST rewrite all URLs for [hosted referenced files](#hosting-referenced-files) to point to their own hosted URLs.
- The aggregator MUST convert all relative URLs to absolute URLs
  - Relative URLs MUST be rewritten according to the detected [base URL](#def-base-url) of the described system instance.
    - The base URL MUST be made known to the aggregator, either via context (e.g. service discovery or trust context) or by explicitly describing it in the ORD document via `describedSystemInstance`.`baseUrl`.
    - When both information are available and differ, the aggregator MAY decide to give precedence to the context information.
- The information on the [described system instance](#def-described-system-instance) SHOULD be added if they are missing.
  - If system instance information is missing, the aggregator SHOULD obtain and enrich the ORD information, for example, via service discovery or trust context.
  - If the ORD aggregator has additional information on a system instance that are not standardized through the ORD interfaces, they MAY be added and exposed through the ORD Discovery API.
- The aggregator MAY keep a history of previous versions (including minor and patch changes) of published resources.

##### Removal of Resources/Information

The removal of resources is indicated through setting a [Tombstone](./interfaces/document.md#tombstone).
The ORD Aggregator MUST remove unpublished information that has been tombstoned within a grace period of 31 days.

##### Hosting Referenced Files

The ORD aggregator MUST host all files that have been referenced in the [ORD resources](#def-ord-resource), most notably the [resource definitions](#def-resource-definition).
The files MUST be stored, hosted, and made available by the ORD aggregator system itself.
The URLs to the hosted files MUST be rewritten accordingly in the [ORD Discovery API](#ord-discovery-api) responses.
The aggregator MUST implement caching and error handling according to the [common REST characteristics](#common-rest-characteristics).

The hosting ensures that ORD consumers can retrieve the referenced files directly from the aggregator itself. They don't need to fetch them from the [ORD Providers](#ord-provider) individually.
This eliminates the need for authentication and authorization against many different systems.
It also ensures that the files have the same high SLA availability that the ORD aggregator has.

#### Validation Rules

The ORD spec aims to move as many validation rules to the [ORD document](#ord-document) itself.
The aggregator MUST validate the retrieved ORD documents accordingly.

However, there are also validations that can only be done by an aggregator, such as checks for consistency across multiple systems or within a concrete system landscape.

The following validation rules apply specifically for ORD aggregators:

- References SHOULD be checked to not be broken, but MAY be temporally allowed to be "dangling".
  This happens if the [ORD ID](#ord-id) points an ORD resource or ORD taxonomy that is not (yet) known to the ORD aggregator.
  - As resources can be added or removed later, this SHOULD be continually checked. For example, one reference could point to an ORD resource that has been removed lately. Now the reference that was valid when it was created, becomes invalid and the relevant ORD Provider(s) SHOULD be notified.
- The same ORD information or resource (identical ORD ID) MUST NOT be described multiple times.
  Please be aware that this could happen within an ORD Document, within the same ORD Provider on different ORD Documents or even across different ORD Providers.
  For migration transitions this rule MAY be violated temporarily.

### ORD Discovery API

The ORD Discovery API is a higher quality API, provided by an [ORD aggregator](#ord-aggregator) that is optimized for easy consumption of ORD information.
It MAY support advanced features like pagination, filtering, search, expansion, etc.
Such features are deliberately missing at the [ORD Provider API](#ord-provider-api) to keep the provider interface simple.

The ORD Discovery API MUST be implemented by the [ORD aggregator](#ord-aggregator) role.
It is the RECOMMENDED interface for [ORD consumers](#ord-consumer) to retrieve ORD information.

An ORD aggregator MAY expose more information than it received from the ORD providers, for example additional information it acquired through service discovery or other metadata sources.

As long as there is no standardized ORD Discovery API contract, each ORD aggregator MAY implement their own API contract.
Ideally this contract is based on the [ORD Provider API](#ord-provider-api) interfaces with only minor differences and additions.

## Miscellaneous

### Namespaces

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

#### Structure of Namespaces

![Namespace Concept Overview](/img/namespace-concept.svg "Namespace Concept Overview")

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

#### Namespace Constraints

- A namespace MUST be ensured to be conflict free.
  This falls into the responsibility of the registered namespace owner and assumes a registry of some kind.
- The total length of the `<systemNamespace>` or `<authorityNamespace>` MUST NOT exceed 32 characters
- The total length of the overall `<namespace>` (incl. nested subcontext namespaces) MUST NOT exceed 36 characters
- It is RECOMMENDED to keep namespaces as short as reasonable, as they become part of IDs which have their own length limitations.
  Shorter namespaces leave more room for the overall IDs.

#### Vendor Namespace

A <dfn id="def-ord-vendor-namespace">vendor namespace</dfn> is a stable and globally unique identifier namespace that corresponds to a vendor / company.
The vendor owns this top-level namespace and is responsible for governing this namespace and all the namespaces within it.

A vendor namespace MUST be constructed according to the following rules:

`<vendorNamespace>` := `<vendorId>`

- `<vendorId>` is a registered ID of a vendor.
  - MUST only consist of lower case ASCII letters (`a-z`) and digits (`0-9`).
  - The organization using ORD MUST ensure that `<vendorId>` is uniquely registered, e.g. in a namespace registry.
  - There is a special reserved vendor namespace `customer`:
    - It can be used in extension scenarios, where the customer of an applications (tenant owner) creates their own ORD resources.
    - This avoids that customers need to register their own namespaces (which could still be done as an alternative).
- MUST match Regexp: `^[a-z0-9]+$`

**Examples**: For SAP, we chose and registered `sap`.

> 🚧 There is currently no global namespace registry where we can ensure that there are no conflicts across different vendors.

#### System Namespace

An <dfn id="def-ord-system-namespace">system namespace</dfn> is a stable and globally unique identifier namespace that corresponds to an ORD <a href="#def-system-type">system type</a> (application or service type).

The system type is the top-level technical, simplified view on an application or service.
There there can be hierarchical groupings of them to higher, logical concepts and also to divide them into multiple sub-components.
Here we simplify on purpose and **treat the identity of an application / service type flatly, without hierarchy**.
How this boundary is drawn depends on the technical decisions of the application / service.

To model a more complex application or organizational structure, for instance containing multiple modules / components, further sub-fragments MAY be indicated via [sub-context namespaces](#sub-context-namespace).

System namespaces are sub-namespaces of exactly one vendor namespace.

An system namespace MUST be constructed according to the following rules:

`<systemNamespace> := <vendorNamespace>.<systemTypeId>`

- `<systemNamespace>` MUST be a valid [vendor namespace](#vendor-namespace)
- `<systemTypeId>` is the identifier of the technical system type (of the application or service).
  - MUST only consist of lower case ASCII letters (`a-z`) and digits (`0-9`).
- MUST match Regexp: `^[a-z0-9]+(?:[.][a-z0-9]+){1}$`

**Examples**: `sap.s4`, `sap.dsc`.

#### Authority Namespace

An <dfn id="def-authority-namespace">authority namespace</dfn> is a stable and globally unique identifier namespace that corresponds to an **organizational unit** responsible for cross-alignment and governance.
Authority namespaces are relevant when contracts, interfaces or taxonomy are owned and defined on a level that spans across individual applications or services.

An authority namespace MUST be constructed according to the following rules:

`<authority>` := `<vendorNamespace>.<authorityIdentifier>`

- `<vendorNamespace>` MUST be a valid [vendor namespace](#vendor-namespace)
- `<authorityIdentifier>` is the identifier of the organizational unit.
  - MUST only consist of lower case ASCII letters (`a-z`) and digits (`0-9`).
- MUST match Regexp: `^[a-z0-9]+(?:[.][a-z0-9]+){1}$`

**Examples**: `sap.odm`.

#### Sub-Context Namespace

A <dfn id="def-ord-sub-context-namespace">sub-context namespace</dfn> is a stable and globally unique identifier namespace that allows for further namespacing within an [system namespace](#system-namespace) or [authority namespace](#system-namespace).

A sub-context can be motivated by ownership, ID uniqueness, domain or technical modularity concerns.

- A Sub-Context MUST be directly below an application / service namespace or an authority namespace.
- A Sub-Context MAY contain further sub-namespaces, e.g. `subcontext.subsubcontext`.
- **The Sub-Context MUST NOT be interpreted as identity by services and consumers.**.

An sub-context namespace MUST be constructed according to the following rules:

`<subContextNamespace>` := `<systemNamespace|authorityNamespace>.<subContextName>`

- `<systemNamespace|authorityNamespace>` MUST be a valid [system namespace](#system-namespace) or [authority namespace](#system-namespace).
- `<subContextName>` is the identifier of the application / service.
  - MUST only consist of lower case ASCII letters (`a-z`) and digits (`0-9`) (`^[a-z0-9]+$`).
  - MAY include further sub-context namespaces, separated by `.`.
- MUST match Regexp: `^[a-z0-9]+(?:[.][a-z0-9]+){2,}$`

**Examples**: `sap.billing.sb`, `sap.s4.beh`, `sap.odm.finance.bank`.

It is NOT RECOMMENDED to use sub-context namespaces for grouping purposes only, see [grouping and bundling](./concepts/grouping-and-bundling.md#namespaces).

### Customer Namespace

Some systems allow their customers / end-users to create their own resources (in-app extensions).
In most cases these resources are local to the tenant, so we don't need to force the customer to register a namespace.

To keep this situation simple, there is a reserved [vendor namespace](#vendor-namespace): `customer`.
Everything within this namespace is owned by the customer, the owner of the tenant.
In addition, there is one reserved authority namespace, specifically for customer in-app extensions: `customer.ext`.

The limitation of using `customer.*` namespaces is that they are unique only within a tenant and once the resources are published and shared outside the local scope, the `customer` namespace will be insufficient.

### ORD ID

An <dfn id="def-ord-id">ORD ID</dfn> is a stable and globally unique identifier (at design-time) for [ORD resources](#def-ord-resource) and [ORD taxonomies](#def-ord-taxonomy).

It serves two purposes:

- Use as an identifier for ORD information.
- Refer to an ORD resources/taxonomy.

The ORD ID is a globally unique identifier from a [system type](#def-system-type) perspective and is [system instance unaware](#def-system-instance-unaware).
This means that the ORD ID will not include information about system instances (e.g. tenant IDs) and is therefore only unique at design-time.
Therefore an ORD ID is not unique from a [system instance](#def-system-instance) perspective.
The same resource (with the same ORD ID) can be exposed in different variations (e.g. customizations, extensions) by multiple system instances at run-time.

To get a globally unique ID at run-time, a composite key is required.
This can be achieved by either combining it with a system instance ID or a full version, depending on the use cases.

#### ORD ID Construction

The ORD ID consists of four fragments, separated by `:`.

It MUST be constructed as defined here:

**`<ordId>`** := `<namespace>:<conceptName>:<resourceName>:[v<majorVersion>]`

- **`<namespace>`** := an [ORD namespace](#namespaces).
  The namespace MUST reflect the provider of the described resource.

  - For `Package`, `ConsumptionBundle`, `APIResource` and `EventResource`, `Capability` and `IntegrationDependency`:
    - MUST be a valid [system namespace](#system-namespace) or an [sub-context namespace](#sub-context-namespace) thereof
  - For `EntityType`
    - MUST be a valid [system namespace](#system-namespace), [authority namespace](#authority-namespace) or [sub-context namespace](#sub-context-namespace)
  - For `Vendor` and `Product`:
    - MUST be a valid [vendor namespace](#def-ord-vendor-namespace) for `Vendor` and `Product`
  - The provider is the system hosting the described resource.
    - In advanced cases, the provider could be an embedded system / sidecar with its own system namespace.
      This can lead to multiple system namespaces within one system.
      In this case it needs to be taken care that static publishing does not create conflicts, e.g. through moving the publishing responsibility to the embedded system (and not by the parent system).

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

- **`<resourceName>`** := the technical resource name.

  - MUST only contain ASCII letters (`a-z`, `A-Z`), digits (`0-9`) and the special characters `-`, `_` and `.`.
  - MUST be unique within the `<namespace>`.
  - SHOULD be a (somewhat) human readable and SEO/URL friendly string (avoid UUIDs).
  - SHOULD be kept stable when a new `<majorVersion>` is introduced, so multiple major versions of the same resource share the same `<namespace>:<conceptName>:<resourceName>:` part of the ORD ID.
    - This can help an aggregator to group the semantically same APIs multiple major versions together
    - If this cannot be followed, the relationship to the successor APIs can still be indicated via the `successors` property.

- **`<majorVersion>`** := a version incrementor of the resource that increases on breaking changes.

  - MUST be provided for `Package`, `ConsumptionBundle`, `APIResource`, `EventResource`, `EntityType`, `Capability`, `IntegrationDependency`
  - MUST NOT be provided for `Product` and `Vendor`
  - If provided: MUST be an integer and MUST NOT contain leading zeroes.
  - MUST be incremented if the resource introduced an incompatible API change. This correlates with a major version change in [Semantic Versioning](https://semver.org/).
    - If the described resource has a `releaseStatus` of `beta`, this rule can be ignored. Incompatible changes MAY be introduced in `beta` resources.
  - MUST NOT be incremented if non-breaking changes have been made to the resource; the updated resource should replace the current one.
  - The `<majorVersion>` and the major version of [`version`](#version-and-lifecycle) MUST be identical.
  - In the case of REST APIs, the `<majorVersion>` MUST also equal the API Version. Please be aware that most organizations have defined API Compatibility rules that MUST be followed in this context.

- The ORD ID MUST be globally unique.

- The ORD ID is immutable and MUST not change after it has been published.

- The ORD ID MUST not exceed 255 characters in total.

An ORD ID MUST match the following [regular expression](https://en.wikipedia.org/wiki/Regular_expression):

```regex
^([a-z0-9-]+(?:[.][a-z0-9-]+)*):(package|consumptionBundle|product|vendor|apiResource|eventResource|capability|entityType|integrationDependency|dataProduct):([a-zA-Z0-9._\-]+):(v0|v[1-9][0-9]*|)$
```

#### ORD ID Resolving

An ORD ID should contain all of the necessary information to be self contained and to be successfully resolved.

Resolving an ORD ID can serve multiple purposes, for example, by having an ID we can construct the link to the API Catalog page describing this resource.
Or we can construct the API request to an [ORD aggregator](#ord-aggregator) where the ORD resource can be accessed.

The rules about how an ORD ID is resolved to the customer's own URLs/APIs SHOULD be provided by the ORD aggregator.

### Correlation ID

A <dfn id="def-correlation-id">Correlation ID</dfn> is a stable and globally unique reference and is conceptually similar to an [ORD ID](#ord-id).
It can be used to correlate [ORD resources](#def-ord-resource) and [ORD taxonomy](#def-ord-taxonomy) to information that are provided by other systems (especially systems of record).
If the target information is already described via ORD, the relation should be expressed via an [ORD ID](#ord-id) instead.

The correlation ID does not have a version fragment like the ORD ID, because it assumes that versioning is already part of the `<localIdentifier>` (if applicable at all).
It is assumed that the `<localIdentifier>` already considers the problem of versioning if applicable.

#### Correlation ID Construction

A Correlation ID consists of three fragments, separated by `:`.
Its first two fragments `<namespace>:<conceptName>` are a [Concept ID](#concept-id).

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
^([a-z0-9-]+(?:[.][a-z0-9-]+)*):([a-zA-Z0-9._\-\/]+):([a-zA-Z0-9._\-\/]+)$
```

Examples (contrived):

- `sap.s4:communicationScenario:SAP_COM_0008`
- `sap.cld:system:500064231`
- `sap.cld:tenant:741234567`

### Concept ID

A Concept ID consists of two fragments, separated by `:`.

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

The system of record application / service or responsible org unit is indicated through the [`<namespace>`](#namespaces) and MUST be able to resolve / correlate when given the `<conceptName>` and the `<localIdentifier>`.

A Concept ID MUST not exceed 255 characters in total.

A Concept ID MUST match the following [regular expression](https://en.wikipedia.org/wiki/Regular_expression):

```regex
^([a-z0-9-]+(?:[.][a-z0-9-]+)*):([a-zA-Z0-9._\-\/]+)$
```

Examples (contrived):

- `sap.cap:service`
- `sap.s4:communicationScenario`
- `sap.cld:system`

### Specification ID

A <dfn id="def-specification-id">Specification ID</dfn> is a stable and globally unique reference to a specification of a standard, procedure or guideline.

It can be used to indicate which strategy to use for certain ORD behaviors ([access strategies](../spec-extensions/access-strategies/index.mdx), credential exchange strategies, [policy levels](../spec-extensions/policy-levels/index.mdx) and can be implemented in multiple ways (see [strategy pattern](https://en.wikipedia.org/wiki/Strategy_pattern)).
In some situations it is also used to refer to certain implementation standards (for example resource definition standards).

#### Specification ID Construction

**`<specificationId>`** := `<namespace>:<specificationIdentifier>:v<majorVersion>`

- **`<namespace>`** := an [ORD namespace](#namespaces).

  - MUST be a valid [namespace](#namespaces).

  - If the specification is specific only to a single application / service, an [system namespace](#system-namespace) SHOULD be chosen.

- **`<specificationIdentifier>`** a technical Specification Identifier that is unique within `<namespace>`

  - MUST only contain ASCII letters (`a-z`, `A-Z`), digits (`0-9`) and the special characters `-`, `_`, `/` and `.`.
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
^([a-z0-9-]+(?:[.][a-z0-9-]+)*):([a-zA-Z0-9._\-]+):(v0|v[1-9][0-9]*)$
```

### Version and Lifecycle

The `version` expresses the complete/full resource version number of an [ORD resource](#def-ord-resource) or [ORD taxonomy](#def-ord-taxonomy).

It MUST follow the [Semantic Versioning 2.0.0](https://semver.org/) standard and therefore express minor and patch changes that don't lead to incompatible changes.
The version SHOULD be changed when the resource or the resource definition changed in any way.
If (potentially runtime) customization/extension leads to changes in the resource definition, a build number SHOULD be added or incremented to indicate that this change happened.

When the `version` major version changes, the [ORD ID](#ord-id) `<majorVersion>` fragment MUST be updated to be identical.
If the resource definition also contains a version number, it MUST be equal to the resource `version`.

When a breaking change is introduced, the rules on constructing [ORD IDs](#ord-id) will ensure that the old version of the resource is not replaced.
The new version will lead to the creation of a separate and new resource.
If the old resource is subject to API Deprecation rules, it MUST only be removed after the deprecation period.
The `releaseStatus` MUST be used to indicate `deprecated` or `decommissioned`.

When an ORD resource has been removed (decommissioned) or an ORD taxonomy is no longer used, it:

- MUST be removed from ORD
- Its removal MUST be indicated by explicitly setting a [`Tombstone`](interfaces/document.md#document.tombstones).

![IDs, Version and Lifecycle](/img/versioning-and-lifecycle.svg "IDs, Version and Lifecycle")

### Common REST Characteristics

#### Error Handling

If there are internal implementation errors, the REST endpoint MUST return a `500` (Server Error) response as defined in the [OpenAPI 3 definition](https://open-resource-discovery.github.io/specification/spec-v1/interfaces/DocumentAPI.oas3.yaml).
Additional error details MAY be added.

If a resource has been requested that does not exist or is not implemented,
the REST endpoint MUST return a `404` (Not Found) response as defined in the [OpenAPI 3 definition](https://open-resource-discovery.github.io/specification/spec-v1/interfaces/DocumentAPI.oas3.yaml) definition.
Additional error details MAY be added.

#### Authentication & Authorization

The ORD document endpoints MAY implement authentication and authorization to protect the ORD information and the resource definitions it references.
In case of system instance aware information, authentication MAY be a technical necessity.

If authentication/authorization are applied, the endpoints MUST return the corresponding HTTP status codes `401` (Unauthorized) and `403` (Forbidden) as defined in the [OpenAPI 3 definition](https://open-resource-discovery.github.io/specification/spec-v1/interfaces/DocumentAPI.oas3.yaml).

The specification makes no hard assumptions about the authorization and authentication mechanism.
The strategy/access methodology that was chosen to retrieve the ORD information and the referenced resource definition files is described via Access Strategies (`accessStrategies`).
