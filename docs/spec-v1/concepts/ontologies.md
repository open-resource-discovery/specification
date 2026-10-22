---
description: Entity Types, ontologies, and their relationships to other ORD concepts.
title: Ontologies and Entity Types
---

# Ontologies and Entity Types

An ontology is a machine-readable specification of concepts, classifications, relationships, and constraints.
It can describe a conceptual domain model, a data model, an API model, or more than one of these layers.
A broader domain model can additionally contain state, rules, behavior, and domain events, so an ontology is not necessarily the complete domain model.
ORD can express and publish an ontology as a [Capability](../interfaces/Document#capability) with `type: "ontology"` and connect it to individually addressable [Entity Types](../interfaces/Document#entity-type) and technical resources.

## Two complementary layers

### Entity Types

An Entity Type represents a significant domain concept or business term, such as a Workforce Person, Work Agreement, or Cost Center.
Publishing the concept as an Entity Type gives it a stable ORD ID that other ORD resources can reference independently.
An ORD ID is globally unique at design time unless it uses a customer-scoped namespace, and runtime identity additionally depends on the system context.

Entity Types make the domain concepts addressable in the ORD graph.
API Resources, Event Resources, Data Products, Agents, and Capabilities can use these identifiers to state which concepts they expose, contain, process, or otherwise relate to.

An Entity Type can provide `definitions` that describe its own internal model or aggregate.
Such a definition is scoped to that individual Entity Type and is not a container for an entire multi-entity ontology.

### Publishing an ontology as a Capability

An ontology can be expressed and published in ORD as a Capability with `type: "ontology"`.
This gives the ontology itself an ORD identity, lifecycle, ownership context, visibility, and machine-readable definitions.

The Capability definition describes the ontology as one coherent artifact within its declared scope.
It can preserve relationships that would be lost if the model were split into separate files for every Entity Type.
It can also contain semantic elements that are not published as Entity Types, including properties, predicates, axioms, classifications, constraints, and references to external concepts or vocabularies.

Not every class or concept in an ontology needs to become an ORD Entity Type.
Publishers SHOULD create Entity Types for the concepts that need to be discovered or referenced independently by other ORD resources.
The Capability SHOULD list the Entity Types represented in the ontology through `relatedEntityTypes`.

### Why publish both?

Entity Types and an ontology published as a Capability solve different discovery problems.

- Entity Types let consumers find and reference individual domain concepts by ORD ID.
- The Capability lets consumers retrieve and interpret the ontology as a whole within its declared scope, including relationships and additional ontology elements.
- Shared Entity Type references connect the ontology to APIs, Events, Data Products, Agents, and other Capabilities without duplicating the ontology definition on each resource.

![ORD ontology publication model](/img/ontology-publication.svg "ORD ontology publication model")

The provider publishes the ontology, its definitions, and relationships that it owns.
An ORD aggregator can derive reverse navigation and combine this metadata into a connected view.
A populated knowledge graph and its query interfaces are downstream concerns and are not created by publishing the ontology as a Capability.

## Ontology model layers

The optional `ontologyLayers` property states which model layers the ontology describes.
It is an array because one ontology can span several layers.

| `ontologyLayers` value | Scope | Typical content |
| --- | --- | --- |
| `domain-model` | Conceptual meaning within a declared domain or bounded context | Domain concepts, classifications, relationships, and constraints independent of a particular technical contract |
| `data-model` | A concrete data representation | Data structures, properties, keys, relationships, and validation shapes |
| `api-model` | The model exposed by an API contract | API objects, fields, payload structures, and constraints |

The definition language does not determine the model layer.
For example, SHACL can constrain either a conceptual RDF graph or a concrete data or API representation.
An ontology that describes a data or API model can use `relatedEntityTypes` to identify the shared conceptual Entity Types on which the representation is based.
Where applicable, `relatedApiResources` can identify the API Resource whose model the ontology describes.
The API Resource can independently use `exposedEntityTypes` to state which Entity Types it exposes.

The following excerpt publishes a SHACL ontology for an API model while connecting it to the shared conceptual Entity Type and the API Resource it describes.

```json
{
  "capabilities": [
    {
      "ordId": "example:capability:workforceApiOntology:v1",
      "title": "Workforce API Ontology",
      "type": "ontology",
      "ontologyLayers": ["api-model"],
      "version": "1.0.0",
      "releaseStatus": "active",
      "visibility": "public",
      "partOfPackage": "example:package:workforce:v1",
      "relatedEntityTypes": [
        "example:entityType:WorkforcePerson:v1"
      ],
      "relatedApiResources": [
        { "ordId": "example:apiResource:workforce:v1" }
      ],
      "definitions": [
        {
          "type": "shacl-v1.0",
          "mediaType": "text/turtle",
          "url": "/ontologies/workforce-api-shapes.ttl"
        }
      ]
    }
  ]
}
```

## Relationships to other ORD concepts

The Capability acts as the catalog entry for the ontology as a whole, while Entity Types connect it to the rest of ORD.

| ORD concept | Relationship to Entity Types and the ontology |
| --- | --- |
| [Package and Product](./grouping-and-bundling.md) | The Capability and its Entity Types use `partOfPackage` and optionally `partOfProducts` to express ownership and product context. |
| [API Resource](../interfaces/Document#api-resource) | An API can identify the Entity Types it exposes. An API-model ontology can reference the API Resource through `relatedApiResources`; the relationship does not replace the API's native contract. |
| [Event Resource](../interfaces/Document#event-resource) | An Event Resource can identify Entity Types represented by its payloads, connecting event contracts to the shared semantic model. |
| [Data Product](./data-product.md) | A Data Product can list the Entity Types in its data set. Consumers can follow those ORD IDs to the ontology that supplies their broader semantic context. |
| [Agent](./ai-agents-and-protocols.md) | An Agent can use `relatedEntityTypes` to identify the domain concepts it operates on. Those same Entity Types connect the Agent to the ontology. |
| Other Capabilities | A Capability can use `relatedEntityTypes` for domain context. A Capability that publishes an ontology can use `relatedCapabilities` for catalog-level relationships to another ontology or semantic capability. |
| [Groups](./grouping-and-bundling.md#groups) | The Capability and Entity Types can use `partOfGroups` for governed classification or navigation. Groups do not replace semantic relationships expressed by the ontology itself. |
| [Integration Dependencies](./integration-dependency.md) | Integration Dependencies describe resources required at runtime. Ontology imports and references belong in the ontology definition and SHOULD NOT be modeled as Integration Dependencies solely because one ontology refers to another. |

There is no direct relationship from a Capability that publishes an ontology to Data Products or Agents.
Their shared Entity Type ORD IDs provide the semantic connection and avoid duplicating relationship properties for every resource combination.

## Entity Type definitions and ontology definitions

The two definition locations have different scopes.

| Definition location | Scope | Typical content |
| --- | --- | --- |
| `entityTypes[].definitions` | One Entity Type or aggregate | The structure, properties, or implementation-oriented model of the individual Entity Type |
| `capabilities[type=ontology].definitions` | The ontology as a coherent artifact within its declared scope | Multiple concepts, their relationships, formal semantics, validation shapes, ontology metadata, and external references |

When both forms are published, they SHOULD describe consistent semantics.
Concatenating individual Entity Type definitions does not necessarily reconstruct the complete ontology.
The whole-model definition preserves relationships and ontology elements that are not represented by individual Entity Types.

## Definition type and serialization

The definition `type` identifies the semantic language or model format.
The `mediaType` identifies the concrete serialization that a consumer must parse.

| Definition `type` | Meaning | Example `mediaType` values |
| --- | --- | --- |
| `rdf-v1.1` | Generic [RDF 1.1](https://www.w3.org/TR/rdf11-concepts/) graph | `application/ld+json`, `text/turtle`, `application/rdf+xml`, `application/n-triples` |
| `rdfs-v1.1` | [RDF Schema 1.1](https://www.w3.org/TR/rdf-schema/) vocabulary | `application/ld+json`, `text/turtle`, `application/rdf+xml`, `application/n-triples` |
| `owl-v2` | [OWL 2](https://www.w3.org/TR/owl2-overview/) ontology represented as an RDF graph | `application/ld+json`, `text/turtle`, `application/rdf+xml`, `application/n-triples` |
| `shacl-v1.0` | [SHACL](https://www.w3.org/TR/shacl/) shapes graph for validating RDF data graphs | `application/ld+json`, `text/turtle`, `application/rdf+xml`, `application/n-triples` |
| `sap-csn-interop-effective-v1` | [CSN Interop Effective](https://sap.github.io/csn-interop-specification/) domain model export | `application/json` |

Publishers MAY provide more than one serialization of the same definition.
Each entry uses the same `type` and a different `mediaType`.
Consumers can then select a serialization they support.

## Example

The following excerpt publishes two independently addressable Entity Types and one ontology as a Capability that covers both concepts as a complete model.
The optional Entity Type definition is scoped to Workforce Person, while both Capability definitions serialize the entire workforce ontology.

```json
{
  "entityTypes": [
    {
      "ordId": "example:entityType:WorkforcePerson:v1",
      "localId": "WorkforcePerson",
      "level": "root-entity",
      "title": "Workforce Person",
      "version": "1.0.0",
      "releaseStatus": "active",
      "visibility": "public",
      "partOfPackage": "example:package:workforce:v1",
      "definitions": [
        {
          "type": "example:entity-model:v1",
          "mediaType": "application/json",
          "url": "/entity-types/workforce-person.json"
        }
      ]
    },
    {
      "ordId": "example:entityType:WorkAgreement:v1",
      "localId": "WorkAgreement",
      "level": "root-entity",
      "title": "Work Agreement",
      "version": "1.0.0",
      "releaseStatus": "active",
      "visibility": "public",
      "partOfPackage": "example:package:workforce:v1"
    }
  ],
  "capabilities": [
    {
      "ordId": "example:capability:workforceOntology:v1",
      "title": "Workforce Ontology",
      "type": "ontology",
      "ontologyLayers": ["domain-model"],
      "version": "1.0.0",
      "releaseStatus": "active",
      "visibility": "public",
      "partOfPackage": "example:package:workforce:v1",
      "relatedEntityTypes": [
        "example:entityType:WorkforcePerson:v1",
        "example:entityType:WorkAgreement:v1"
      ],
      "definitions": [
        {
          "type": "owl-v2",
          "mediaType": "application/ld+json",
          "url": "/ontologies/workforce.jsonld"
        },
        {
          "type": "owl-v2",
          "mediaType": "text/turtle",
          "url": "/ontologies/workforce.ttl"
        }
      ]
    }
  ]
}
```

## Mapping Entity Types to ontology concepts

`relatedEntityTypes` establishes that the ontology covers, projects, or otherwise uses the shared conceptual Entity Types.
It does not identify the corresponding class or concept inside the ontology definition, and it does not establish complete semantic equivalence, schema compatibility, or business-record identity.
ORD does not currently standardize ontology construction, upper-ontology use, IRI construction, an annotation predicate, or a separate property for mapping an Entity Type ORD ID to an ontology IRI.
Consumers MUST NOT infer the mapping from similar titles or local identifiers alone.

## SPARQL access

[SPARQL 1.1](https://www.w3.org/TR/sparql11-query/) is a query language for RDF data, not an ontology definition or RDF serialization.
Publishing an ontology as a Capability does not imply that its provider offers a SPARQL endpoint.
An ORD aggregator or a knowledge graph built from aggregated ORD metadata can offer SPARQL or another query interface, but ORD does not currently standardize that consumer-facing access contract.
