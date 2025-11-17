---
sidebar_position: 2
title: HowTo adopt as ORD Provider
description: ORD Provider guide how to adopt ORD, depending on preconditions and requirements.
---

# How To Adopt ORD as a Provider

## Introduction

You may wonder how much work it is to adopt ORD as an [ORD Provider](../../spec-v1/index.md#ord-provider).
What are the steps involved? Are there any libraries / frameworks that can help me?

This guide will explain those questions, but some of the answers will depend on your situation.
The reason is that different adopters of ORD may have different initial conditions and expectations.

ORD is designed to allow a very simple implementation with minimal effort. Many sophisticated concepts from the specification can be skipped in this case. However, if you need to support advanced features like run-time dynamic metadata discovery, the adoption complexity increases.

Therefore let's start with the simplest scenarios first and discuss the advantages and shortcomings.

## Scope

First, it's important to understand that ORD may look bigger and more complex than it may be in practice.
This is, because **most of the specification is optional to implement** and the data interfaces share a lot of common attributes.
An ORD document that returns one empty ORD document is technically a valid implementation - although it doesn't bring value to anyone.

So it needs to be clarified first, which information need to be exposed via ORD that are useful to actual [ORD Consumers](../../spec-v1/index.md#ord-consumer). Typically the most essential resources to describe are APIs and Events and their Package assignments.

> ℹ At SAP, the minimal scope of ORD adoption is to describe public APIs and Events and their Package assignments.
> Everything else is optional, but may be a prerequisite for other Product integrations or use cases (like SAP Event Broker / Mesh or Data Products)

## Scenarios

### ORD Support by Framework

The simplest scenario is that ORD support is already built into an opinionated framework.
This is the case for the [SAP ABAP Platform](https://developers.sap.com/topics/abap-platform.platform.html) already and in the future, also the [SAP CAP framework](https://cap.cloud.sap/docs/about/).

In these cases, ORD support only needs to be activated and configured. Any additional information that is needed for ORD may need to be provided. But there is no need to write extra code.

After this is done, an [integration with ORD Aggregators](#integrate-with-ord-aggregators) needs to be established.

> ℹ Other frameworks may also adopt ORD support, but this will only work well with highly opinionated frameworks that have a strong internal metadata model where the ORD information can be extracted from.

### Only Static Metadata

#### When is this applicable?

This option requires a clear understanding of whether the metadata that is revealed is static only.
Metadata here includes both the ORD documents and the metadata definitions that come with them.

The metadata is static, if it can be fully determined at design-time or deploy-time.
The application / service that is described usually stays the same at run-time and there are no tenant-specific changes / extensions or they are not documented via metadata.

#### Option 1: Serve as static files

This option is not recommended, but let's look at it anyway, just to make a point how simple an ORD implementation can be.

The ORD Provider API is designed to be a very simple REST API.
In fact, it's just serving files via HTTP GET request in a standard manner.
This can even be achieved by using a static web server like [nginx](https://www.nginx.com/), without writing a single line of code.

Just dropping the ORD configuration and documents and additional metadata files into a web server can already work.
Please consider whether the information [need to be protected](#protect-ord-provider-api-access) and do so if necessary.

> 🔗 See [./implementation-examples/nginx-no-auth](https://github.com/open-resource-discovery/specification/tree/main/implementation-examples/nginx-no-auth) for an example implementation

#### Option 2: Implement a simple REST API

We recommend implementing the ORD Provider API just like any other API that your application / service exposes.
How you do this may depend on your programming language, framework and backend architecture.

The API itself consists just of three different types of API GET operations:

- One to implement the [ORD Configuration Endpoint](../../spec-v1/index.md#ord-configuration-endpoint)
- One to return all [ORD Documents](../../spec-v1/index.md#ord-document)
- One to return the "attached" metadata documents (ORD Resource Definitions)

Please note that you may need to [protect the API access](#protect-ord-provider-api-access).

> 🔗 See [./implementation-examples/no-auth](https://github.com/open-resource-discovery/specification/tree/main/implementation-examples/no-auth) for an example node.js implementation without authentication.

#### Future Options

We are aware that publishing static metadata can be made even more convenient.
Currently it is necessary to serve the metadata by a service at runtime.
If the metadata is purely static, it would also be possible to publish it at design-time or deploy-time, e.g. via a CI/CD pipeline job or CLI utility.

This is an option we're considering to standardize in ORD, as a [push transport](../../spec-v1/index.md#push-transport) mode. If this pattern is of practical use to you, please reach out to us.

### Dynamic Metadata

If some of the metadata is dynamic (changes at run-time or different per tenant), the static solutions will not be sufficient.

Now becomes a necessity to implement ORD as a REST API, where the GET operations return metadata dynamically.
The response (of at least some requests) will depend on tenant context, customizations and extensions.

In practice it's more realistic that such an implementation will be a mix between static and dynamic metadata.
Since static metadata is much cheaper and easier to provide, it's recommended to only use run-time dynamic generation of metadata where necessary. In ORD it's possible to indicate this on a per resource basis via the `systemInstanceAware` attribute see [definition](../../spec-v1/index.md#def-system-instance-aware).

> 🚧 The [ORD Reference Application](https://ord-reference-application.cfapps.sap.hana.ondemand.com/) showcases a mix between static and dynamic metadata. The source-code for it is yet to be made public, though.

## Shared Concerns

The following concerns apply the same to the different scenarios and should always be considered.

### Validate ORD and other Metadata

While the [ORD Aggregators](../../spec-v1/index.md#ord-aggregator) will validate the published metadata, this happens very late in the development lifecycle.
We therefore strongly RECOMMEND to validate the published metadata as early as possible, ideally in the local CI/CD pipelines.

Usually metadata specification come with a schema that can be used for validation. This is also true for the ORD specification, where it can be downloaded on the interface documentation pages.

Industry standard metadata formats usually come with validators, too. Consider for example [spectral](https://stoplight.io/open-source/spectral).

> 🚧 At SAP we have built a metadata validator for this [TODO: link], that we consider open-sourcing in the future, too.
> It can not only validate ORD documents and configs but also other metadata standards for technical correctness and guideline compliance.

### Protect ORD Provider API Access

You may not want to openly expose the ORD information and related metadata to everyone.
If this is the case, the ORD Provider API needs to be protected.
The specification makes no assumptions on how this is done, but the [ORD Aggregators](../../spec-v1/index.md#ord-aggregator) will likely define the [Access Strategies](../../spec-extensions/access-strategies/) it supports.

### Integrate with ORD Aggregators

An ORD Provider implementation alone will not be very useful, because the information also need to be made available to other Consumers. This is done by integrating with one (or multiple) [ORD Aggregators](../../spec-v1/index.md#ord-aggregator).

How this is done is defined by the onboarding of the aggregators.

To avoid detecting issues late (when publishing to the ORD aggregator), we highly RECOMMEND to locally [validate ORD and other metadata](#validate-ord-and-other-metadata) first.

> At SAP we have the [SAP Business Accelerator Hub](https://api.sap.com/) as aggregator for the static perspective and the Unified Customer Landscape (BTP System Landscape) for the tenant-aware, dynamic perspective.
