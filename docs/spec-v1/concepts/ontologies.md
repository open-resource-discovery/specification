---
description: Entity Types, ontologies, and their relationships to other ORD concepts.
title: Ontologies and Entity Types
---

# Ontologies and Entity Types

An ontology is a machine-readable specification of concepts, classifications, relationships, and constraints.
It can describe a conceptual domain model, a data model, an API model, or several of these.
A domain model can also include state, rules, behavior, and domain events, so an ontology does not always cover the complete domain model.

ORD publishes an ontology as a [Capability](../interfaces/Document#capability) with `type: "ontology"`, called an *ontology Capability* on this page.
An ontology Capability connects the ontology to individually addressable [Entity Types](../interfaces/Document#entity-type) and to technical resources.

## Entity Types and ontology Capabilities

### Entity Types

An Entity Type represents a domain concept or business term, such as a Workforce Person, Work Agreement, or Cost Center.
Its stable [ORD ID](./identifiers.md#ord-id) lets other ORD resources reference the concept independently.
API Resources, Event Resources, Data Products, Agents, and Capabilities use these IDs to state which concepts they expose, contain, process, or otherwise relate to.

An Entity Type can provide `definitions` that describe its own model or aggregate.
These definitions cover only that Entity Type and are not a container for a multi-entity ontology.

### Ontology Capabilities

An ontology Capability gives the ontology its own ORD ID, lifecycle, ownership context, visibility, and machine-readable definitions.

Its definitions describe the ontology as one artifact within its declared scope.
This preserves relationships that would be lost if the model were split into one file per Entity Type.
The definitions can also contain elements that are not published as Entity Types, such as properties, predicates, axioms, classifications, constraints, and references to external concepts or vocabularies.

Not every class or concept in an ontology needs to become an ORD Entity Type.
Publishers SHOULD create Entity Types for concepts that other ORD resources need to discover or reference independently.
The Capability SHOULD list the Entity Types represented in the ontology in `relatedEntityTypes`.

### Why publish both?

Entity Types and ontology Capabilities solve different discovery problems:

- Entity Types let consumers find and reference individual domain concepts by ORD ID.
- The ontology Capability lets consumers retrieve and interpret the whole ontology, including its relationships and additional elements.
- Shared Entity Type references connect the ontology to APIs, Events, Data Products, Agents, and other Capabilities without duplicating the ontology definition on each resource.

![ORD ontology publication model](/img/ontology-publication.svg "ORD ontology publication model")

The provider publishes the ontology, its definitions, and the relationships it owns.
An ORD aggregator can derive reverse navigation and combine this metadata into a connected view.
Publishing an ontology Capability does not create a populated knowledge graph or a query interface.
These are downstream concerns.

## Ontology model layers

The optional `ontologyLayers` property states which model layers an ontology describes.
It is an array because an ontology can span several layers.

| `ontologyLayers` value | Scope | Typical content |
| --- | --- | --- |
| `domain-model` | Conceptual meaning within a declared domain or bounded context | Concepts, classifications, relationships, and constraints, independent of a technical contract |
| `data-model` | A concrete data representation | Data structures, properties, keys, relationships, and validation shapes |
| `api-model` | The model exposed by an API contract | API objects, fields, payload structures, and constraints |

The definition language does not determine the layer.
For example, SHACL can constrain a conceptual RDF graph as well as a concrete data or API representation.

A data-model or API-model ontology can use `relatedEntityTypes` to identify the conceptual Entity Types it is based on.
An API-model ontology can also use `relatedApiResources` to identify the API Resource whose model it describes.
The API Resource can separately use `exposedEntityTypes` to state which Entity Types it exposes.

The following example publishes an OWL ontology and a SHACL shapes graph for an API model.
Both definitions belong to one ontology Capability, which references the conceptual Entity Type and the API Resource.

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
          "type": "owl-v2",
          "mediaType": "text/turtle",
          "url": "/ontologies/workforce-api.ttl"
        },
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

The ontology Capability is the catalog entry for the whole ontology.
Entity Types connect it to the rest of ORD.

| ORD concept | Relationship to Entity Types and the ontology |
| --- | --- |
| [Package and Product](./grouping-and-bundling.md) | The Capability and its Entity Types use `partOfPackage` and optionally `partOfProducts` to express ownership and product context. |
| [API Resource](../interfaces/Document#api-resource) | An API can identify the Entity Types it exposes. An API-model ontology can reference the API Resource through `relatedApiResources`, but does not replace the API's native contract. |
| [Event Resource](../interfaces/Document#event-resource) | An Event Resource can identify the Entity Types in its payloads, which connects event contracts to the shared semantic model. |
| [Data Product](./data-product.md) | A Data Product can list the Entity Types in its data set. Consumers can follow those ORD IDs to the ontology that provides their wider semantic context. |
| [Agent](./ai-agents-and-protocols.md) | An Agent can use `relatedEntityTypes` to identify the domain concepts it operates on. These Entity Types connect the Agent to the ontology. |
| Other Capabilities | A Capability can use `relatedEntityTypes` for domain context. An ontology Capability can use `relatedCapabilities` for catalog-level relationships to other ontologies or semantic capabilities. |
| [Groups](./grouping-and-bundling.md#groups) | The Capability and Entity Types can use `partOfGroups` for governed classification or navigation. Groups do not replace the semantic relationships in the ontology. |
| [Integration Dependencies](./integration-dependency.md) | Integration Dependencies describe resources required at runtime. Ontology imports and references belong in the ontology definition. A reference from one ontology to another SHOULD NOT be modeled as an Integration Dependency for that reason alone. |

There is no direct relationship from an ontology Capability to Data Products or Agents.
Shared Entity Type ORD IDs provide this connection, which avoids a separate relationship property for every resource combination.

## Entity Type definitions and ontology definitions

The two definition locations differ in scope.

| Definition location | Scope | Typical content |
| --- | --- | --- |
| `entityTypes[].definitions` | One Entity Type or aggregate | The structure, properties, or implementation-oriented model of that Entity Type |
| `capabilities[type=ontology].definitions` | The whole ontology within its declared scope | Multiple concepts, their relationships, formal semantics, validation shapes, ontology metadata, and external references |

If both are published, they SHOULD describe consistent semantics.
Combining individual Entity Type definitions does not necessarily reproduce the complete ontology, because the ontology definition also contains relationships and elements that Entity Types do not represent.

## Definition type and serialization

The definition `type` names the main specification that applies to the artifact.
It does not list every RDF vocabulary used in the graph.
The `mediaType` names the serialization that a consumer must parse.

RDF Schema, OWL, and SHACL are not serialization formats, and they are not mutually exclusive.
Their terms can appear in the same RDF graph, where each keeps its own meaning and role.

| Definition `type` | Use for | `mediaType` |
| --- | --- | --- |
| `rdf-v1.1` | A generic [RDF 1.1](https://www.w3.org/TR/rdf11-concepts/) graph when no more specific type applies | An RDF serialization |
| `rdfs-v1.1` | An RDF vocabulary or schema based on [RDF Schema 1.1](https://www.w3.org/TR/rdf-schema/) | An RDF serialization |
| `owl-v2` | An [OWL 2](https://www.w3.org/TR/owl2-overview/) ontology represented as an RDF graph | An RDF serialization |
| `shacl-v1.0` | A [SHACL](https://www.w3.org/TR/shacl/) shapes graph for validating RDF data graphs | An RDF serialization |
| `sap-csn-interop-effective-v1` | A [CSN Interop Effective](https://sap.github.io/csn-interop-specification/) domain model export | `application/json` |

RDF serializations include `application/ld+json` (JSON-LD), `text/turtle` (Turtle), `application/rdf+xml` (RDF/XML), and `application/n-triples` (N-Triples).

### Choosing a definition type

A known RDFS, OWL, or SHACL artifact SHOULD use the matching type instead of describing its semantics only through `purpose`.
Use `rdfs-v1.1` for lightweight vocabularies that define only RDFS classes, properties, hierarchies, domains, and ranges, and do not claim OWL semantics.

The generic `rdf-v1.1` type SHOULD be used when no more specific type applies.
Its `purpose` SHOULD identify the graph's role if that role is not otherwise clear, such as mappings, annotations, or controlled values.
For example, a mapping graph can use `type: "rdf-v1.1"` with `purpose: "example:ontology-mappings"`.

### Publishing multiple serializations

Publishers MAY provide the same definition in more than one serialization.
Each entry uses the same `type` and a different `mediaType`, so consumers can select a serialization they support.
For example, JSON-LD and Turtle serializations of an OWL ontology both use `owl-v2`.
The ontology can use RDF and RDFS terms without additional `rdf-v1.1` or `rdfs-v1.1` entries.

### Publishing OWL and SHACL together

An OWL ontology and a complementary SHACL shapes graph MAY be published as separate definitions of the same ontology Capability.
Their definition types already distinguish them, so they do not need a `purpose` for this reason.
The SHACL shapes can refer to OWL classes and properties, but SHACL validation does not imply OWL reasoning.

### Graphs that combine several specifications

If one RDF graph intentionally combines several specifications, it SHOULD use a [Specification ID](./identifiers.md#specification-id) that defines the combined profile.
Listing the same URL under several built-in types does not tell consumers how to process the graph or which entailment regime applies.

### RDF and RDFS versions

The built-in types target the RDF 1.1 and RDF Schema 1.1 W3C Recommendations.
[RDF 1.1 changed the RDF 1.0 model](https://www.w3.org/TR/rdf11-new/), while [RDF Schema 1.1 kept the technical content of the 2004 Recommendation](https://www.w3.org/TR/rdf-schema/#sotd).
ORD does not provide separate `rdf-v1.0` or `rdfs-v1.0` types.
A legacy contract that needs this distinction can use a Specification ID.

## Schema axioms and individual assertions

An OWL ontology can contain [schema axioms and assertions about individuals](https://www.w3.org/TR/owl2-syntax/#Axioms), also known as TBox and ABox content.
An ontology definition can therefore include stable reference individuals, enumerated values, code values, and controlled concepts.
OWL expresses closed enumerations of individuals or literals with [`ObjectOneOf`](https://www.w3.org/TR/owl2-syntax/#Enumeration_of_Individuals) and [`DataOneOf`](https://www.w3.org/TR/owl2-syntax/#Enumeration_of_Literals).
[SKOS](https://www.w3.org/TR/skos-reference/) concept schemes are another option for controlled concepts, but they are open by default: they do not state that the listed concepts are exhaustive.

An ontology Capability is not a way to publish operational instance data, even if it contains stable reference individuals.
Populated knowledge graphs, transactional records, and their query interfaces remain downstream concerns.

## Example

The following example publishes two Entity Types and one ontology Capability that covers both.
The optional Entity Type definition covers only Workforce Person, while both Capability definitions serialize the whole workforce ontology.

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
          "url": "/entity-types/workforce-person.json",
          "visibility": "public"
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

`relatedEntityTypes` states that the ontology covers, projects, or otherwise uses these Entity Types.
It does not identify the matching class or concept in the ontology definition.
It also does not establish complete semantic equivalence, schema compatibility, or business-record identity.

ORD does not currently standardize ontology construction, upper-ontology use, or IRI construction.
It also provides no annotation predicate or property that maps an Entity Type ORD ID to an ontology IRI.
Consumers MUST NOT infer the mapping from similar titles or local identifiers alone.

## SPARQL access

[SPARQL 1.1](https://www.w3.org/TR/sparql11-query/) is a query language for RDF data, not an ontology definition or RDF serialization.
An ontology Capability does not imply that the provider offers a SPARQL endpoint.
An ORD aggregator or a knowledge graph built from aggregated ORD metadata can offer SPARQL or another query interface, but ORD does not currently standardize this access.
