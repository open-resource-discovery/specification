---
title: "SAP Core Policy Level (v1.0)"
description: "SAP Core v1 policy level"
sidebar_position: 2
---

{/* AUTO-GENERATED from spec-extension/policy-levels/sap-core-v1.overlay.yaml — do not edit */}

# SAP Core Policy Level (v1.0)

## Description

This policy level `sap:core:v1` is based on the [`sap:base:v1`](./sap-base-v1.md) and [`sap:documentation:v1`](./sap-documentation-v1.md) policy levels and inherits all its expectations.

It MUST be fulfilled by all SAP applications and services.
Exceptions are only allowed on a case by case basis.

This policy level is based on various SAP guidelines and rules - most of them which are already established.
It defines the core rules and guidelines that are shared across SAP, although more specific rules and guidelines MAY be applied on top.

**All constraints of the ORD specification itself still apply (valid ORD document). The constraints described here come on top and may be stricter than the base spec where the base spec intentionally leaves room for exceptional use cases.**

## General Policies

### SAP specific access strategies

SAP applications and services MUST support SAP specific access strategies:

- [`sap.businesshub:basic-auth:v1`](../access-strategies/sap-businesshub-basic-v1.md) for the [SAP Business Accelerator Hub](https://api.sap.com/).
  - The use of "mixed" access strategies is not supported, so both the ORD documents AND the attached resource definitions MUST be available through the same access strategy.
- [`sap:cmp-mtls:v1`](../access-strategies/sap-cmp-mtls-v1.md) for the Unified Customer Landscape.

### Open access strategy requires explicit consent

The `accessStrategy` [`open`](../access-strategies/open.md) MUST NOT be used without explicit consent by the responsible security experts, especially when the metadata could expose tenant (customer) specific information.

### Access strategy for resource definitions

If the access strategy for retrieving the document differs from the retrieval of the resource definitions: At least one access strategy MUST also be provided for the resource definitions.

_Applies when: the access strategy for retrieving the document differs from the retrieval of the resource definitions_

### Namespaces must be registered

All SAP [namespaces](../../spec-v1/index.md#namespaces) MUST be registered in the SAP namespace-registry.

- All SAP applications MUST use the `sap` vendor namespace.

### Publish at least one static perspective

SAP applications and services MUST publish at least one applicable static perspective (`system-type`, `system-version`, or both).

### Keep correlation with existing Business Hub IDs

IF the resources have already been published to the public [SAP Business Accelerator Hub](https://api.sap.com/) we MUST somehow keep a correlation between their ORD ID and already existing Business Hub ID. This is necessary to keep existing URLs stable and to ensure we update the existing entries, not create new ones.

- **Preferred Approach**:
  - Get in touch with the Business Hub colleagues, to clarify which existing packages need to be associated with the registered [namespace](../../spec-v1/index.md#namespaces) (from step above).
  - Keep the `<resourceId>` fragment of the [ORD ID](../../spec-v1/index.md#ord-id) identical to the ID that was previously published on the Business Accelerator Hub.
  - Alternatively, add a [Correlation ID](../../spec-v1/index.md#correlation-id) to the resource:
    - Add a `correlationIds` entry, that starts with `sap.businesshub` namespace and then the Business Accelerator Hub concept name (that is also part of the Old URL), e.g. `api` or `package`
    - Package Example: `{ "ordId": "sap.s4:package:SomeName:v1", "correlationIds": ["sap.businesshub:package:SAPS4HANACloud"] }`
    - API Example: `{ "ordId": "sap.s4:apiResource:AccountingDocumentRead:v1", "correlationIds": ["sap.businesshub:api:API_OPLACCTGDOCITEMCUBE_SRV"] }`

_Applies when: the resources have already been published to the public SAP Business Accelerator Hub_

### Use a recent ORD specification version

ORD documents SHOULD use a recent ORD specification version in `openResourceDiscovery`.
Validators SHOULD report a warning when the declared version is more than three minor versions behind the latest ORD version they support.
This recommendation does not invalidate documents that conform to an older supported ORD version.

## Context Specific Policies

### Governance Guidelines for API Packages

For [Packages](../../spec-v1/interfaces/Document.md#package) with policy level sap, the Governance Guidelines for API Packages MUST be followed.

- This includes current limitations:
  - Packages MUST NOT be shared by multiple provider (source) systems
  - Packages MUST NOT contain mixed resource types. E.g., a Package must only contain either APIs or Events, but never both together.

### Mixed visibility within a Package

A Package can contain resources with different visibility values. Each resource and its definitions remain subject to their existing visibility rules.

### Provide a Consumption Bundle for consumable API Resources

For public or internal [API Resources](../../spec-v1/interfaces/Document.md#api-resource) with `inbound` or `mixed` direction (consumption pattern): SHOULD provide and assign a [Consumption Bundle](../../spec-v1/interfaces/Document.md#consumption-bundle). This is necessary as some SAP ORD Consumers rely on Consumption Bundles to find and navigate accessible resources.

_Applies when: the API Resource is public or internal with inbound or mixed direction_

### Guidelines for publishing API Resources

For [API Resources](../../spec-v1/interfaces/Document.md#api-resource) the Guidelines for publishing API Resources on the SAP Business Accelerator Hub MUST be followed according to our internal API and external API guidelines.
The first link includes a decision table for internal vs. external, which corresponds to `visibility` internal vs. public in ORD.

### Extensible must be provided

The [`extensible`](../../spec-v1/interfaces/Document.md#api-resource_extensible) property MUST be provided.

### Required resource definitions per API protocol

For API Resources with `visibility`: "public" or "internal":

- Resource definitions MUST be provided for OData, REST, GraphQL and SOAP APIs.
- OData APIs MUST have a resource definition of `"type": "edmx"` AND additionally one of either `"type": "openapi-v3"` or `"type": "openapi-v2"`.
- Plain REST APIs MUST have a resource definition of `"type": "openapi-v3"` (RECOMMENDED) or `"type": "openapi-v2"`.
- GraphQL APIs MUST have a resource definition of `"type": "graphql-sdl"`.
- SOAP APIs MUST have a resource definition of `"type": "wsdl-v2"` (RECOMMENDED) or `"type": "wsdl-v1"`.

_Applies when: visibility is public or internal_

### Validate OpenAPI definitions

OpenAPI definitions SHOULD be validated via the SAP API Metadata Validator, using `sap:core:v1` compliance level.

### API Harmonization Guideline (out of scope)

The SAP API Harmonization Guideline rules MAY be adhered, but are not part of the `sap:core:v1` scope.

- We intend to release an additional policy level (`sap:core:v2`?) that includes this as MUST requirement.

### Governance Guidelines for Events

For [Event Resources](../../spec-v1/interfaces/Document.md#event-resource) the [Governance Guidelines for Events](https://help.sap.com/viewer/9c880f03c6084ca4b2573b5605ec7a83/Cloud/en-US/3cda0ea7b65849108d530eb33ce2fb85.html) MUST be followed.

### Extensible must be provided

The `extensible` property MUST be provided.

### Required resource definitions for Event Resources

For Event Resources with `visibility`: "public" or "internal":

- Resource definitions MUST be provided.
- CloudEvents MUST have a resource definition of `"type": "asyncapi-v2"` (see [AsyncAPI specification 2.0](https://www.asyncapi.com/docs/reference/specification/v2.0.0)).
- SAP Business Events (that conform to the SAP Event Specification:
  - MUST use the SAP Event Catalog standard, which is compatible to AsyncAPI 2.0 (`"type": "asyncapi-v2"`).
  - MUST NOT be part of a Consumption Bundle.
    - Events can only be consumed at an intermediary, i.e., the SAP Event Mesh.
    - Consequently, the producing application cannot describe how they are eventually consumed.

_Applies when: visibility is public or internal_

### Validate SAP Event Catalogs

SAP Event Catalogs SHOULD be validated via the SAP API Metadata Validator, using `sap:core:v1` compliance level.

### Entity Type definition visibility

For [Entity Types](../../spec-v1/interfaces/Document.md#entity-type):

- Entity Type definitions MUST have `visibility` set to either `private` or `internal` (stricter than the base spec, which permits `public` for exceptional open-standardization cases).

### Extensible description follows TG12.R2

If the mandatory [Extensible](../../spec-v1/interfaces/Document.md#extensible) object has a [description](../../spec-v1/interfaces/Document.md#extensible_description), it MUST follow the guidance and rules of the SAP Technology Guideline TG12.R2.

_Applies when: the mandatory Extensible object has a description_

### System type restriction for SAP Event Broker subscriptions

If an Integration Dependency is used to indicate Subscription Content for the [SAP Event Broker](https://help.sap.com/docs/event-broker/event-broker-service-guide/what-is):

- Each [EventResourceIntegrationAspect](../../spec-v1/interfaces/Document.md#event-resource-integration-aspect) MUST provide exactly one `systemTypeRestriction` application namespace.
  The value of the `systemTypeRestriction` MUST always be the same within an integration dependency.
  These limitation MAY be reconsidered in the future.

_Applies when: an Integration Dependency is used to indicate Subscription Content for the SAP Event Broker_

### Overlays must identify their target

[ORD Overlays](../../spec-v1/interfaces/OrdOverlay.md) MUST always provide a [`target.ordId`](../../spec-v1/interfaces/OrdOverlay.md#overlay-target_ordid) to identify the ORD resource being patched.

### Standardize on the ORD Overlay format

SAP applications and services MUST use `type: "ord:overlay:v1"` as the overlay format for all published overlays. The `oas-overlay-v1` type is supported by the ORD specification for interoperability with the OpenAPI Initiative Overlay ecosystem, but within SAP we standardize on ORD Overlay because it works uniformly across all metadata formats we publish (OpenAPI, AsyncAPI, OData EDMX/CSDL, A2A, MCP, CSN Interop) and integrates with ORD identifiers, `purpose`, and `visibility`.

### Overlay visibility

All ORD Overlays governed by this policy MUST have an effective `visibility` of `internal` or `private`, regardless of their purpose or publishing mechanism.

The existing ORD restriction that a resource definition's `visibility` MUST NOT be less restrictive than the `visibility` of its containing resource continues to apply.

### Registered Correlation ID types

With ORD comes a [Correlation ID](../../spec-v1/index.md#correlation-id) concept.

All correlations that target an `sap.*` namespace MUST use registered correlation ID types.
Like the namespaces, they can be registered in the SAP namespace-registry.

This will help us to 1) achieve internal consistency that we can also automatically validate and 2) get an overview of valid and registered Correlation ID Types.
