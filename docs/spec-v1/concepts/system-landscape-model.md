---
sidebar_position: 5
description: Detailed explanation of the System Landscape and the ORD Data model.
---

import { DataModelDiagram, TaxonomyScopeDiagram } from "@site/src/components/OrdDiagrams";

# System Landscape Model

## Summary

We assume a high-level system landscape model, which already knows which applications and services (tenants) are running in a given context (e.g. a customer account).
ORD is used to describe the tenants in detail, most notably their exposed resources and capabilities.
With Integration Dependencies it is also possible to describe how resources of other tenants can be used, connecting the dots.
But also some taxonomy like entity types help to connect, by expressing shared use of aligned concepts or models across different types of systems.

The metadata discovery can happen at run-time, describing the tenant at its current state - or we can describe all tenants of the same system type and version statically.

> **Visual walkthrough:** Explore the [system landscape model](https://open-resource-discovery.github.io/presentation/landscape-model) in the ORD presentation.

## Systems

ORD relies on a high-level system landscape model to be already existing.
Before you can discover ORD information from system instances (tenants), you need to know of their existence and nature in the first place.
From there ORD is used to fill in the details.

However, those two worlds need to be connected and therefore ORD has a simplified, very high-level system landscape model.
It is mostly described in the [ORD Terminology section](../index.md#terminology).

<div className="img-box" style={{aspectRatio: "701/362"}}>

![System and namespace concept overview](/img/system-landscape/system.drawio.svg)

</div>

The most essential concept to understand is the **[System Instance](../index.md#system-instance)**.
It's a simplified concept that usually stands for a technical tenant of a system, but in case of single-tenant system it can also stand for the system itself.
The important aspect is that it's where the isolation of resources, capabilities and data is ensured.
In the diagram, it's also marked with "dynamic", as it is a live running system that can describe its actual state at run-time.

A System Instance is hosted by a [System Deployment](../index.md#system-deployment), which is a concrete, addressable deployment of a system.
A single [System Type](../index.md#system-type) can have multiple deployments (e.g., one per region or data center), and each deployment can host multiple system instances (tenants).
The System Deployment concept is shown with a dotted border in the diagram, indicating it's not yet a formal ORD interface but is conceptually important for understanding the system landscape hierarchy.

A System Instance can be of a [System Type](../index.md#system-type), which is the technical type.
This is not to be confused with the [Product](../index.md#product), which lives in the commercial domain and can have a more complicated relationship with the concepts from the technical system domain.

Optionally, a System Instance or a Type could also have several [System Versions](../index.md#system-version), in case that metadata needs to have a history or that multiple versions of the same System Type are deployed at the same time (this is very common with on-premises systems).

## Namespaces

[Namespaces](../index.md#namespaces) are a purely static concept and are used to get globally unique, conflict free IDs.
They are described in more detail behind the link.

It should be pointed out that the:

- [vendor namespace](./identifiers.md#vendor-namespace) corresponds to the [ORD Vendor](../interfaces/Document.md#vendor).
- [system namespace](./identifiers.md#system-namespace) corresponds to the [ORD System Type](../index.md#system-type).
- [sub-context namespaces](./identifiers.md#sub-context-namespace) have no corresponding ORD concept.

When resources, taxonomy or contracts are shared across multiple system types, the namespace identifies the owner of the shared definition.
See [Namespace Ownership](./shared-resources.md#namespace-ownership) for guidance on choosing the correct namespace.

## System Resources and Capabilities

From here we can place most of the ORD concepts, e.g. like the APIs and Events.

There is an important distinction between **ORD Resources / Capabilities** and **ORD Taxonomy**.
The ORD Resources and Capabilities describe either a System Type (in static perspective) or a System Instance (in dynamic perspective).

Taxonomy is independent of Systems, but can be defined either locally or globally.

<DataModelDiagram />

## Taxonomy

Some taxonomy concepts can be global, so they remain available in a catalog even when no system instance publishes them.
The following overview compares which ORD concepts can differ by system instance, can be published globally, or are always global.
Select a concept name to open its detailed definition.

<TaxonomyScopeDiagram />

## Big Picture

### Static Catalog

In the static catalog, products and their resources are described on a system type Level.
Optionally, a static catalog can also reflect the system version to also provide a history of the metadata, e.g. how it changed over time with releases.

### Dynamic Catalog

The dynamic catalog can show a real (customer) system landscape at run-time.
It is usually connected or part of a runtime control plane, which needs to know the system topology anyway.
Here the focus is clearly on the System Instance level, although in many cases the metadata may still be static (defined on System Type level).
