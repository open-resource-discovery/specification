---
title: FAQ 🙋
sidebar_position: 10
---

# FAQ

#### Q: How does ORD relate to other API standards like OData and OpenAPI?

**A:** ORD is not meant to replace existing metadata standards that describe APIs or Events in detail.
Such metadata standards (OpenAPI, EDMX for OData APIs) are often protocol-specific.

The role of ORD is to standardize the high-level, lifecycle-related, semantic, and shared attributes of APIs while referencing detailed schema-level metadata definition files.
Therefore, ORD complements these standards rather than replacing them, improving their discoverability.
Consumers that need to understand an API or Event resource in detail still need to understand those metadata standards.

#### Q: Do you have a library for ORD for language XYZ?

**A:** Since adopting ORD is mostly about creating ORD documents correctly, the main challenge is usually how the information can be provided in the first place.
A library cannot solve this problem for you; only frameworks with a rich internal meta model (like the [CAP framework](https://cap.cloud.sap/docs/)) can automatically generate an ORD description of the application.

That leaves the main challenge to create the ORD documents correctly. Two things are usually helpful here:

- Use a validator to ensure that the ORD Documents are correct and compliant, ideally as CI/CD step or test cases.
- Implement against a generated (ideally type safe) ORD document interface.
  - ORD comes with a [JSON Schema definition](https://openresourcediscovery.org/spec-v1/interfaces/Document.schema.json), which can be converted into interfaces / clients for most programming languages.
    This can be done with converters like [quicktype](https://quicktype.io/).

#### Q: Is ORD already used outside of SAP?

**A:** Not that we are aware of, but it is designed to support this.

ORD is [open source](https://github.com/open-resource-discovery/specification) under the Apache 2 license (see [public announcement](https://blogs.sap.com/2023/11/14/open-resource-discovery-a-protocol-for-decentralized-metadata-discovery-is-now-open-source/)) and governed by the [Linux Foundation](https://www.linuxfoundation.org/) / [NeoNephos](https://neonephos.org/projects/open-resource-discovery-ord/). We are in discussion with other companies to form a broader community around the standard.

#### Q: How long does it take for metadata changes to reflect in the Aggregators?

**A:** This depends on the configuration and implementation of an ORD aggregator.
The aggregation can be fully automated, but currently ORD has only defined a [pull transport](../../spec-v1/index.md#pull-transport) mode, which relies on periodic fetching (similar as a search engine indexes the web). As a consequence, metadata changes need a while to be replicated.
We're aware that some use-cases require faster metadata updates and the ORD spec is designed to support other transport modes (like push or event based), to make faster and more efficient replication possible.

#### Q: Does ORD work for On-Premises Software?

**A:** ORD does not distinguish between on-premises and cloud software.
However, on-premises software has implications for how ORD information can be accessed.
Whether on-premises is supported depends on whether connectivity can be established between ORD aggregators (systems collecting the information) and on-premises ORD providers.
In SAP context, we support on-premises software through [Cloud Connectors](https://help.sap.com/viewer/cca91383641e40ffbe03bdc78f00f681/Cloud/en-US/e6c7616abb5710148cfcf3e75d96d596.html?q=cloud%20connector).

#### Q: What does "Open" in ORD stand for?

**A:** The "Open" in ORD refers to the protocol itself being published publicly under a permissive license (Apache 2.0).
It can be freely implemented by SAP partners and customers.

The standard is published at https://openresourcediscovery.org and governed by the [Linux Foundation](https://www.linuxfoundation.org/) / [NeoNephos](https://neonephos.org/projects/open-resource-discovery-ord/).

Please note that ORD being an open protocol does not imply that the resources and information described through it are "open".
They can be categorized explicitly, for example through the `visibility` attribute.

> 🎧 Checkout the openSAP podcast [The Open Source Way - Open Resource Discovery](https://podcast.opensap.info/open-source-way/2024/06/14/open-resource-discovery-ord/).
