---
title: Ontologies
---

# Ontologies

An ontology describes domain concepts, their relationships, and formal semantics in a machine-readable form.
ORD models an ontology as a [Capability](../interfaces/Document.md#capability) with `type: "ontology"`.

An ontology Capability SHOULD provide at least one entry in `definitions`.
All entries MUST describe the same logical ontology or semantic domain model.
They can provide alternative semantic representations or serialization formats of that model.

## Definition type and serialization

The definition `type` identifies the semantic language or model format.
The `mediaType` identifies the concrete serialization that a consumer must parse.

| Definition `type` | Meaning | Example `mediaType` values |
| --- | --- | --- |
| `rdf-v1.1` | Generic [RDF 1.1](https://www.w3.org/TR/rdf11-concepts/) graph | `application/ld+json`, `text/turtle`, `application/rdf+xml`, `application/n-triples` |
| `rdfs-v1.1` | [RDF Schema 1.1](https://www.w3.org/TR/rdf-schema/) vocabulary | `application/ld+json`, `text/turtle`, `application/rdf+xml`, `application/n-triples` |
| `owl-v2` | [OWL 2](https://www.w3.org/TR/owl2-overview/) ontology represented as an RDF graph | `application/ld+json`, `text/turtle`, `application/rdf+xml`, `application/n-triples` |
| `sap-csn-interop-effective-v1` | [CSN Interop Effective](https://sap.github.io/csn-interop-specification/) domain model export | `application/json` |

Publishers MAY provide more than one serialization of the same definition.
Each entry uses the same `type` and a different `mediaType`.
Consumers can then select a serialization they support.

```json
{
  "capabilities": [
    {
      "ordId": "example:capability:workforceOntology:v1",
      "title": "Workforce Ontology",
      "type": "ontology",
      "version": "1.0.0",
      "releaseStatus": "active",
      "visibility": "public",
      "partOfPackage": "example:package:workforce:v1",
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

## SPARQL access

[SPARQL 1.1](https://www.w3.org/TR/sparql11-query/) is a query language for RDF data, not an ontology definition or RDF serialization.
A SPARQL service endpoint SHOULD therefore be published as an API Resource with an appropriate API protocol Specification ID.
The ontology Capability can reference that API Resource through `relatedApiResources`.
