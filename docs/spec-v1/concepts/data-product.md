---
sidebar_position: 4
description: More details on the Data Product concept in ORD.
title: Data Product
---

# Data Product

> 🚧 Please note that the [Data Products](../interfaces/Document#data-product) concept is still in development and contains <span className="feature-status-beta">BETA</span> properties and will get further extended.

## Definition

> A [Data Product](../interfaces/Document#data-product) is a **data set** exposed for consumption via APIs or Events.
> They are described through high quality **metadata** that can be accessed through the Data Product Directory ([ORD Aggregator](../#ord-aggregator)).

The Data Product concept is based on [Data Mesh Principles](https://martinfowler.com/articles/data-mesh-principles.html) (see also [this book](https://www.thoughtworks.com/en-de/insights/books/data-mesh)).

While that provides a concise definition, let's support that with a few more clarification points:

The following aspects of the definition are essential: (1) [data](#data-aspect), (2) [APIs](#api-aspect), (3) [metadata](#metadata-aspect) and (4) [product](#product-aspect). If they are not covered, it’s not a Data Product. Optionally, a Data Product can also have (5) [business semantics](#business-semantic-aspect).

### Data Aspect

- Applications produce data within a domain. An application takes responsibility for the data it produces, and the application offers data for consumption outside the original context in the form of a Data Product.
- A data product is a "data set", which can include:
  - Business Objects: master data, transaction data
  - Other objects, e.g.: config data
  - Analytical data, including cubes, measures and dimensions
  - Graph data (e.g. who knows whom, recommendations)
  - Documents (e.g. raw log entries, events, multi-level-aggregates, hierarchies)
  - Spatial data
- A data product is exposed by a "producer" to fulfill the needs of "consumers".
- The data set is optimized toward "intensive reads" and consumed in a read-only fashion.

### API Aspect

- Above we say that Data Products are consumed via APIs, but to be precise, they are consumed via APIs or Events (we treat events as a special form of API). In this doc, we generally use the term APIs to include Events (it is just more readable than always saying "APIs and/or Events").
- There is a clear expectation that the APIs are described via [metadata](#metadata-aspect) for machine- and human-readable documentation.
- For Data Products only certain types of API Protocols and qualities (performant mass read) are adequate. E.g. SAP uses [Delta Sharing](https://github.com/delta-io/delta-sharing/blob/main/PROTOCOL.md), which we additionally describe with [CSN Interop](https://sap.github.io/csn-interop-specification/) for richer metadata.
- Data Products are also expected to describe their data lineage. This is done via Data Product input ports, which are described in details as an ORD [Integration Dependency](../interfaces/Document#integration-dependency)

### Metadata Aspect

- A data product is described by the producer via ORD, which fulfills the role as its discoverability API / port. Through this, the discoverability of a Data Product is decentralized and therefore "shifted left": It's the data products responsibility to describe itself. The [ORD Aggregators](../#ord-aggregator)(s) take on the responsibility of the Data Product Directory.
- Please note that ORD is only used to describe Data Products on (slow changing) metadata level. It is not intended as an active control API or as an API to fetch fast moving runtime data (e.g. log metrics)
  - However, those can be added to the Data Product as dedicated APIs, which follow a standardized [SPI](https://en.wikipedia.org/wiki/Service_provider_interface) contract and be marked as such via the ORD `implementationStandard`. This way, such APIs can still be discovered via API, but are treated as a separate concern.

### Product Aspect

- The word "Product" does not imply that it’s something on the price list. Instead it only implies a product mindset towards its consumers. Typically, Data Products are not independent "products" but are available as part of a larger product that produces them.
- Data Products have owners that are responsible for defining what Data Products to produce to meet the needs of consumers. All data products have owners.
- The owners of the data product (at least of its definition) are ideally the domain owners / the same team that is responsible for the operational data (decentralized data products).

### Business Semantic Aspect

- In ORD, it's not just possible to describe the APIs - and through them the data model / schema / syntax of the data. There are also [Entity Types](../interfaces/Document#entity-type) which can be used to describe the **semantic model** (underlying conceptual model) and map it with the technical API / data model.

## Architecture Overview

### Model

![Data Product Model Overview](/img/data-product-model.svg "Data Product Model Overview")

The diagram is not a complete ER model, but highlights the most important relationships from Data Product perspective.

### Roles

Data Products are exposed by **Producers** so that they can be used by **Consumers**. Consumers can use **Aggregators** / Data Product Directories to discover, explore and understand Data Products.

- Data Product Producers are applications or services that expose data via one or more APIs and describe relevant contracts and information via metadata. Note that there are various types of producers.
- Data Product Consumers are applications or services that access and use the data from Data Products. Consumers can be of various types and cover both transactional and analytical applications. An application that processes operational data can be as Data Product consumer, as can analytical products like SAP Datasphere and SAP Analytics Cloud (SAC).
- The Data Product Directory ([ORD Aggregator](../#ord-aggregator)) is used by Consumers to find and discover available Data Products.

## Current Status

Please note that the Data Product concept still contains some <span className="feature-status-beta" title="This feature is in BETA status and subject to potential changes.">BETA</span> properties.

This has the following implications

- The beta-level properties are potentially subject to changes, although we aim to avoid breaking changes if possible.
- Many data product relevant attributes are currently **not explicitly defined** in the specification yet.
  - Some attributes should be handled via documentation, e.g. Service Level Agreements via [dataProductLinks](../interfaces/Document#data-product_dataproductlinks) of `type`: [`service-level-agreement`](../interfaces/Document#data-product-link_type)
  - Such attributes need to be defined through generic extensibility mechanisms like `labels` and `documentationLabels` or added as text to the documentation.
  - We do this to gain more experience on what information we need to collect and how to structure them best. Later ORD Data Product releases will add more standardized properties or define a dedicated Data Product definition specification that can be attached.
  - Which information needs to be added as additional extensibility attributes is currently only defined as SAP internal guidance.
