---
sidebar_position: 1
description: What problems is ORD solving and why create a new standard for this.
---

# Why ORD?

## Why create a new Standard?

There are quite a few open standards for describing software system resources.
API resources can be described, for example, using [OpenAPI](https://www.openapis.org/) or [OData CSDL](http://docs.oasis-open.org/odata/odata/v4.0/odata-v4.0-part3-csdl.html).
For Events, [AsyncAPI](https://www.asyncapi.com/) is an option.

**So why introduce a new standard like ORD?**

Imagine the use case of an API catalog that describes resources exposed by multiple systems.
Each system exposes various resources like APIs and Events that can be implemented using different protocols (plain REST, OData, SOAP, CloudEvents, etc.) and which in turn are described using a variety of different resource definition formats.

Because of this heterogeneity,

- how would the API catalog know which complete set of resources is actually available in a given system?
- Which resource definition formats have been chosen to describe them?
- How and where can this information be accessed?

From an API catalog perspective, the resource definition formats themselves may even miss some high-level information, for instance:
A global taxonomy (e.g. tags), logos, additional documentation links, relations between the resources, etc.

Even though some resource definition formats may have means to provide some of this high-level information, not all do.
Currently, there is no standardized and machine-readable way to describe this high-level information across the different resource definition formats.

We also want to use the same discovery mechanism(s) (how and where to access this information) - independent on what resource type or what definition format was used.

An API Catalog is just one of many possible use cases.
There are all kinds of use cases that rely on having an aligned metadata view on a specific system or system landscape.

- An individual developer may be interested in understanding a single system in its current state.
  Having a single entry point for finding such information simplifies this.
- Applications may be interested in finding out the current state of a concrete system landscape and dynamically react on the information available.
  For example, find out what external resources are available, generate API clients, establish connectivity/trust between systems and their APIs, etc.

> 👉 **ORD is about adding missing/common high-level information and standardizing the discovery aspects.
> It is _not_ meant to replace existing open standards, but to complement them.**

ORD is a **decentralized** standard. There is no single system of record.
Instead, systems describe themselves using multiple common resource definition formats, and ORD adds the means for putting the system's resources into relation and makes them crawl-able with a single entry-point.
The information may reflect system-generic capabilities, but may also reflect its current state at runtime, including customizations.

ORD also specifies how the distributed metadata is brought together (by ORD aggregators), which will result in a combined bigger picture (system landscape metadata view).
Based on this, we can not only understand the possibilities of individual systems, but we can also gain a metadata view on what constitutes a specific system landscape and how the systems within it relate to each other.
This enables new automation possibilities, central platform services and metadata driven use-cases.
Solutions to certain problems can be standardized and responsibilities be split.

As a long-term goal, we see ORD as a single building block to create an ecosystem where the individual systems can benefit from platform effects and efficiencies.

## The ORD Ecosystem

The overall benefit of adopting ORD grows with the ecosystem that uses it.
Therefore, the commitment of all LoBs and areas is required to exploit the full potential.

Depending on the role of the adopter the value proposition is different:

- If you are an application or service, that needs to provide ORD information, you are in the [ORD Provider](#benefits-to-ord-providers) role.
  - The provider benefits from having one protocol for providing the information and not multiple.
  - The provider only needs to publish to two ORD aggregators and avoids having many more point-to-point integrations to the various consumers.
  - The use cases that ORD consumers provide may very well serve the same customer and solve commonly shared problems.
  - See [Benefits to ORD Providers](#benefits-to-ord-providers) for more elaboration.

- If you make use of ORD information, you are in the role of an [ORD Consumer](#benefits-to-ord-consumers).
  - Consumers benefit from having a shared, aligned standard and central aggregators to get the information from.
  - If an application / service already adopted ORD and information is missing, the Consumer could extend the ORD protocol to add missing information.
    Since the protocol and integrations are already there, the implementation effort is greatly reduced for all parties.
  - See [Benefits to ORD Consumers](#benefits-to-ord-consumers).

### Benefits to ORD Providers

**ORD Provider** is the term we use for applications and services that provide their metadata to other interested parties via ORD.

#### Reduce Total Cost of Ownership for Metadata Integration

At SAP we have many applications and services that rely on machine-readable metadata that describe a system's capabilities and resources (like APIs and Events).
Without ORD, describing and exchanging this metadata implies multiple integrations, leading to higher costs and complexities for all involved parties.
The goal of ORD is to avoid those duplicated efforts.

With ORD, we provide **one aligned standard** that serves many use cases and metadata consumers.
Instead of implementing integrations and service provider interfaces (SPI) for each interested application, the adopter only needs to implement one interoperability standard.
This reduces the number of APIs and integrations that need to be developed and maintained and therefore reduces our overall TCO for metadata publishing and integration.

ORD can be used to describe two different application perspectives:

- The **static catalog** ("yellow-pages") view for publishing to [SAP Business Accelerator Hub](https://api.sap.com/).
- The **as-is** view that describe the actual, customer specific runtime view (reflecting customizations and extensions).

![Reduce ORD Provider TCO](/img/ord-motivation-reduce-provider-tco.svg)

Without a single, aligned standard many of those use cases would need a special, proprietary integration.
Through ORD, we can reduce the integration complexity to O(1) instead of O(n) for each affected application / use case.

#### Profit from having less integrations

With ORD, we only have a limited set of ORD Aggregators (UCL and SAP Business Accelerator Hub) where the information needs to be published to.

All applications and services shall get the information from the ORD Aggregators.

This means less point-to-point integrations directly to the ORD consumers.

#### Profit from ORD Consumer Use Cases

ORD Providers can automatically benefit of the use cases that the various [ORD Consumers](#benefits-to-ord-consumers) bring to our customers.

ORD Consumers usually solve "shared problems" that many SAP applications have and provide a more consistent and integrated experience for the end customers.
To phrase it differently, some ORD Consumers solve problems and save efforts that the ORD Provider otherwise would need to implement on their own.

### Benefits to ORD Consumers

**ORD Consumer** is the term we use for applications and services that make use of the metadata that [ORD Providers](#benefits-to-ord-providers) make available.

#### Reduce Total Cost of Ownership for Metadata Integration

ORD is an **aligned interoperability standard** that serves as a common denominator of shared understanding.
While each LoB may handle their internal metadata differently, with ORD we standardized how to express this for all external consumers. Therefore, a metadata consumer does not need to support the various different application specific standards, but can rely on one shared standard.

ORD also comes with the concept of an ORD Aggregator, which is a central service that aggregates and exposes the ORD information.
This saves metadata consumers from point-to-point integrations with each metadata provider they are interested in.

![Reduce ORD Consumer TCO](/img/ord-motivation-reduce-consumer-tco.svg)

Similar to the complexity on the provider's side, we can again reduce the integration complexity to O(1) instead of O(n) for each ORD provider from which information needs to be retrieved.

#### Benefit from already established standard and integrations

If a consumer needs information that we don't have today, they can consider aligning it through the ORD standard. With this, they don't need to invent their own Service Provider Interface and convince all of their information providers to create new integrations to them.

ORD even offers the concept of [Generic Capabilities](https://sap.sharepoint.com/:w:/r/teams/CPAIntegration/_layouts/15/Doc.aspx?sourcedoc=%7B9AFD0C50-1234-43E9-9E04-C881FAA3614B%7D&file=CPA_APIs_and-Events_ADR_ORD_Generic_Capabilities.docx&wdOrigin=OFFICECOM-WEB.MAIN.SEARCH&ct=1661765177310&action=default&mobileredirect=true) (agreed upon, but not yet rolled out) to further reduce the effort to introduce new capability / metadata discovery scenarios with less efforts for all parties involved.
