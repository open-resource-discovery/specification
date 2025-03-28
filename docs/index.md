---
slug: /
id: overview
title: Open Resource Discovery
hide_title: false
sidebar_position: 0
---

<div className="container"><div className="row">
<div className="col">
Open Resource Discovery (ORD) is a protocol that **allows applications and services to self-describe their resources and capabilities** (e.g. ports and adapters).

ORD can describe [APIs](./spec-v1/interfaces/document#api-resource), [Events](./spec-v1/interfaces/document#event-resource) and higher-level concepts like [Entity Types](./spec-v1/interfaces/document#entity-type) (Domain / Business Objects) and [Data Products](./details/articles/data-product.md).
With [Integration Dependencies](./spec-v1/interfaces/document#integration-dependency) the use of external resources can be stated.
In case that the standardized concepts or attributes are not sufficient, there are extensibility attributes and [Capabilities](./spec-v1/interfaces/document#capability).
All of the described artifacts can share relationships, taxonomy and [grouping](./details/articles/grouping-and-bundling.md) concepts, enabling a **well-connected metadata graph**.

ORD can be used for **static documentation** (like API / data catalogs and marketplaces) or to describe a dynamic **run-time system landscape** (with tenant specific configuration and extensions).

</div>
<div className="col">
<div style={{"text-align": "center", "max-width": "600px"}}>
![ORD Provider Overview](/img/ord-provider-overview.svg 'ORD Provider Overview')
</div></div></div></div>

To adopt ORD, an application implements a single-entry point ([Service Provider Interface](https://en.wikipedia.org/wiki/Service_provider_interface)) that can be used to discover and crawl the relevant information / metadata.
The information can be used to build metadata registries / catalogs and do runtime inspection of actual system landscapes.

> ℹ ORD is an [open source](https://github.com/open-resource-discovery/specification) standard by SAP, released under the Apache 2 license (see [public announcement](https://blogs.sap.com/2023/11/14/open-resource-discovery-a-protocol-for-decentralized-metadata-discovery-is-now-open-source/)).

> The ORD interface (JSON Schema) and TypeScript types are available via npm: [`@sap/open-resource-discovery`](https://www.npmjs.com/package/@sap/open-resource-discovery).

## Introduction

Read the 📄 [ORD Introduction](./introduction.mdx) and watch the 🎦[ORD Videos](./details/videos).

<div className="videoContainer">
  <iframe className="videoIframe" src="https://www.youtube.com/embed/7Z818CdoZJg" title="Introducing the Open Resource Discovery protocol" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"></iframe>
</div>

## Use Cases

Information expressed or discovered through ORD can be used to build static **metadata catalogs** or do detailed **runtime inspection of actual system landscapes**.
Based on this, many end-user use cases can be realized, e.g.:

- API and event catalog
- Data product directory/catalog
- Landscape specific API/event discovery for development platforms, platform engineering and low-code/no-code development
- Support admins in configuring services (discovery & automation)
- AI grounding & training
- Generic channel to describe, discover and exchange system capabilities between providers and consumers (even across vendors)

## Goals

<div className="container"><div className="row"><div className="col">
<div className="card"><div className="card__header">
<h3>Design Goals</h3>
</div><div className="card__body"><p>

- Systems to **describe themselves** with a single entry-point to crawl all relevant metadata
- Achieve a combined, machine-readable **system landscape metadata view**
- Enable **fully automatic** of publication and discovery of metadata
- Having **one aligned standard** for
  - Description of different types of resources
  - Description of both the static / generic perspective and the actual runtime perspective
  - Support of many different metadata-driven use-cases and consumer requirements
- ORD is an **open standard**
  - It is [open source](https://github.com/open-resource-discovery/specification) an can be used by SAP partners and customers if they see a value in adopting it, like better integration in the SAP ecosystem
  - The specification is open for extensions via labels, custom types, spec extensions. Those don't need to go through alignment first.

</p></div></div></div>
<div className="col"><div className="card"><div className="card__header">
<h3>Non-Goals</h3>
</div><div className="card__body"><p>

- Replace industry-standard resource definition formats like OpenAPI
- Describing resources or capabilities in extensive detail.
- Currently it is not recommended to put fast changing information into ORD, as the current pull-based transport mechanism would be to slow and expensive to support time-critical updates.
  - This could change in the future by introducing more efficient, asynchronous transport modes.
- Currently: Describe resources other than those that are owned and exposed by the systems directly
  (only self-description of systems).
  - This could be changed in the future if necessary.

</p></div></div></div></div></div>

## Future Plans

Now that ORD is [open-source](https://open-resource-discovery.github.io/specification/), a potential next step is to work with partners on a true industry wide standard, as ORD is currently focused on SAPs requirements.
We are also part of the publicly funded [IPCEI CIS](https://www.bmwk.de/Redaktion/EN/Artikel/Industry/ipcei-cis.html) project, where we also work towards this goal.

The specification itself is designed to be generic, so most SAP specific aspects are described as [spec extensions](./spec-extensions).
Some concepts like [namespaces](./spec-v1/#namespaces) could be further standardized if there's a need for cross-company metadata exchange.

We are thinking about ways to make ORD publishing more efficient when there is a lot of tenant specific metadata or data changes happen frequently and replication is more time critical.
There is also need to make publishing easier for simple, static providers that prefer publishing design-time information only.
