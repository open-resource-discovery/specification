---
sidebar_position: 6
description: Detailed explanation of the Schema concept.
---

# Schema

:::info Beta
The **Schema** concept is in **beta**. Its properties and relationships MAY change based on adoption and feedback.
:::

## Summary

A **Schema** describes the concrete structure of a data object, for example a Data Transfer Object (DTO), an event payload, or an API request/response model.
A Schema can be described with formats such as [JSON Schema](https://json-schema.org/), [CSN Interop](https://sap.github.io/csn-interop-specification/), [Apache Avro](https://avro.apache.org/), [Protocol Buffers](https://protobuf.dev/), or XSD.

Schemas can also describe the contract of **whole documents or declarative configuration objects**, such as [Kubernetes Custom Resource Definitions (CRDs)](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/). The ORD specification itself is such an example: it publishes a [JSON Schema for ORD Documents](https://open-resource-discovery.org/spec-v1/interfaces/Document.schema.json).

Schemas are lightweight to describe (similar to [Capabilities](../interfaces/Document#capability)) and are meant to be **reusable** and **shared**.

See also: [Schema interface](../interfaces/Document#schema).

## Schema vs. Entity Type

ORD distinguishes between the *conceptual* and the *physical* view of data:

| | [Entity Type](../interfaces/Document#entity-type) | [Schema](../interfaces/Document#schema) |
|---|---|---|
| Represents | conceptual domain model or business term (a "noun") | concrete serialization structure ("how the data is shaped on the wire") |
| Answers | *what it means* | *how it is shaped* |
| Example | `sap.odm:entityType:BusinessPartner:v1` | `sap.foo:schema:BusinessPartner:v1` |

An Entity Type is more than just data: it captures business semantics and, depending on the API and protocol, the same Entity Type may have **different physical representations** (and therefore different Schemas). A Schema is one such physical representation of an Entity Type.

A Schema MAY reference the Entity Type(s) it represents via `relatedEntityTypes`, providing traceability between the conceptual model and its physical representation. The direction is always **Schema → Entity Type** (a Schema points to the concept it represents); the inverse is derived automatically.

## Relationship to APIs and Events

Resources link to Schemas via a `relatedSchemas` list of `{ordId, relationType}` entries. The optional `relationType` is an extensible [Concept ID](../index.md#concept-id) that qualifies the nature of the relationship:

- **API resources expose many Schemas.** An API contract (e.g. OpenAPI or AsyncAPI) typically contains many Schemas as its request, response, or payload structures (`relationType: ord:exposes`).
- **Event resources reference payload Schemas.** Each event typically references one payload Schema, often published in a schema registry, e.g. Confluent Schema Registry or CNCF xRegistry (`relationType: ord:payload`).
- **Capabilities can relate to Schemas** as well, via the same `relatedSchemas` field.
- **Schemas are reusable.** Because a Schema is a top-level resource with its own ORD ID, the same Schema can be related from several APIs, Events, and Capabilities.

## Describing the Schema

The machine-readable schema definition file(s) are referenced via `definitions`, following the same mechanism as API and Event resource definitions (`type` + `mediaType` + `url`).

The `type` is an **extensible enum**. Global industry-standard formats are standardized by ORD as bare (unprefixed) values (`json-schema-v7`, `json-schema-v2020-12`, `avro-v1`, `protobuf-v3`, `xsd-v1`, `sap-csn-interop-effective-v1`), consistent with existing definition types like `openapi-v3` and `asyncapi-v2`. Vendor- or organization-specific formats use a namespace-prefixed [Specification ID](../index.md#specification-id), or `custom` + `customType`.

## Versioning and compatibility

A Schema carries a semantic `version`. It MAY additionally declare an optional `compatibility` mode (`none`, `backward`, `forward`, `full`) to express its schema-evolution guarantees, mirroring the compatibility modes found in common schema registries.

## Current Status

This concept is in **beta**. In particular, the following are open for feedback:

- The exact set of `SchemaDefinition` `type` enum values.
- Whether Schema-to-Schema composition references are needed.
- Whether `compatibility` should be extended to transitive variants.
