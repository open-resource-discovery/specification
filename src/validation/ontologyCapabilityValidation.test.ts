import assert from "node:assert";
import fs from "node:fs";
import { describe, it } from "node:test";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const schema = JSON.parse(
  fs.readFileSync(
    "./src/generated/spec/v1/schemas/Document.schema.json",
    "utf8",
  ),
);
const ajv = new Ajv({ strict: false, allErrors: true });
addFormats(ajv);
const validate = ajv.compile(schema);

function ontologyDocument(definitionType: string) {
  return {
    openResourceDiscovery: "1.17",
    perspective: "system-version",
    policyLevels: [],
    describedSystemVersion: { version: "1.0.0" },
    capabilities: [
      {
        ordId: "example:capability:workforceOntology:v1",
        title: "Workforce Ontology",
        type: "ontology",
        ontologyLayers: ["domain-model"],
        version: "1.0.0",
        releaseStatus: "active",
        visibility: "public",
        partOfPackage: "example:package:workforce:v1",
        definitions: [
          {
            type: definitionType,
            mediaType: "application/ld+json",
            url: "/ontologies/workforce.jsonld",
          },
          {
            type: definitionType,
            mediaType: "text/turtle",
            url: "/ontologies/workforce.ttl",
          },
        ],
      },
    ],
  };
}

describe("Ontology publication validation", () => {
  for (const definitionType of [
    "rdf-v1.1",
    "rdfs-v1.1",
    "owl-v2",
    "shacl-v1.0",
  ]) {
    it(`accepts ${definitionType} in JSON-LD and Turtle serializations`, () => {
      assert.equal(validate(ontologyDocument(definitionType)), true);
    });
  }

  it("does not treat SPARQL as an ontology definition type", () => {
    assert.equal(validate(ontologyDocument("sparql-v1.1")), false);
  });

  it("accepts an ontology spanning data and API model layers", () => {
    const document = ontologyDocument("shacl-v1.0");
    document.capabilities[0].ontologyLayers = ["data-model", "api-model"];
    assert.equal(validate(document), true);
  });

  it("accepts parallel OWL ontology and SHACL shapes definitions", () => {
    const document = ontologyDocument("owl-v2");
    document.capabilities[0].definitions = [
      {
        type: "owl-v2",
        mediaType: "text/turtle",
        url: "/ontologies/workforce.ttl",
      },
      {
        type: "shacl-v1.0",
        mediaType: "text/turtle",
        url: "/ontologies/workforce-shapes.ttl",
      },
    ];
    assert.equal(validate(document), true);
  });

  it("rejects unknown or duplicate ontology layers", () => {
    const document = ontologyDocument("owl-v2");
    document.capabilities[0].ontologyLayers = ["domain-model", "domain-model"];
    assert.equal(validate(document), false);

    document.capabilities[0].ontologyLayers = ["physical-model"];
    assert.equal(validate(document), false);
  });
});
