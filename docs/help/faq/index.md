---
title: FAQ 🙋
sidebar_position: 10
---

# FAQ

#### How does ORD relate to other API standards like OData and OpenAPI?

ORD is not meant to replace existing metadata standards that describe APIs or Events in detail.
Such metadata standards, OpenAPI or EDMX for OData APIs are often protocol specific.

The role of ORD is to standardize the high-level, lifecycle related, more semantic and shared attributes of APIs and pass along such detailed schema level metadata definition files.
Therefore, ORD is not a substitution to such standards, its meant to actually aid the discoverability of them.
Consumers that need to understand an API or Event resource in detail still need to understand those metadata standards.

#### Q: Do you have a library for ORD for language XYZ?

Since adopting ORD is mostly about creating ORD documents correctly, the main challenge is usually how the information can be provided in the first place.
A library can not solve this problem for you, only frameworks which have a rich internal meta model (like the [CAP framework](https://cap.cloud.sap/docs/)) can automatically generate an ORD description of the application.

That leaves the main challenge to create the ORD documents correctly. Two things are usually helpful here:

- Use a validator to ensure that the ORD Documents are correct and compliant, ideally as CI/CD step or test cases.
- Implement against a generated (ideally type safe) ORD document interface.
  - ORD comes with a [JSON Schema definition](https://open-resource-discovery.github.io/specification/spec-v1/interfaces/Document.schema.json), which can be converted into interfaces / clients for most programming languages.
    This can be done with converters like [quicktype](https://quicktype.io/).

#### Is ORD already used outside of SAP?

Not that we are aware of. But it it designed in a way that this is possible.

In a first step, we released ORD as [open source](https://github.com/open-resource-discovery/specification) under the Apache 2 license (see [public announcement](https://blogs.sap.com/2023/11/14/open-resource-discovery-a-protocol-for-decentralized-metadata-discovery-is-now-open-source/)).

Currently, we're in discussion with other companies to form a community around the standard.

#### How long does it take for metadata changes to reflect in the Aggregators?

This depends on the configuration and implementation of an ORD aggregator.
The aggregation can be fully automated, but currently ORD has only defined a [pull transport](../../spec-v1/index.md#pull-transport) mode, which relies on periodic fetching (similar as a search engine indexes the web). As a consequence, metadata changes need a while to be replicated.
We're aware that some use-cases require faster metadata updates and the ORD spec is designed to support other transport modes (like push or event based), to make faster and more efficient replication possible.

#### Q: Does ORD work for On-Premises Software?

ORD does not make a distinction between on-premises or cloud software.
However On-premises software has implications on how (and whether at all) the ORD information can be accessed.
Effectively, whether on-premises is supported or not depends on whether the connectivity between the the ORD aggregators (the system that are collecting the information) and the On-premises ORD providers can be established.
In SAP context, we support including On-Premises software through [Cloud Connectors](https://help.sap.com/viewer/cca91383641e40ffbe03bdc78f00f681/Cloud/en-US/e6c7616abb5710148cfcf3e75d96d596.html?q=cloud%20connector).

#### Q: What does "Open" in ORD stand for?

The Open in ORD refers to the protocol itself and that it is published publicly under a permissive license.
It can therefore be freely implemented by SAP partners or customers.

A public version of the standard is published here: https://open-resource-discovery.github.io/specification.

The governance and the actual development will remain fully at SAP for now.
In the long term, we can imagine to contribute ORD to an open governance body
if there is an interest by other companies to drive the specification together.

Please note that the fact that ORD is an open protocol, does not imply
that the resources and information that are described through it are "open".
They can be categorized explicitly, e.g. through `visibility`.

> 🎧 Checkout the openSAP podcast [The Open Source Way - Open Resource Discovery](https://podcast.opensap.info/open-source-way/2024/06/14/open-resource-discovery-ord/).
