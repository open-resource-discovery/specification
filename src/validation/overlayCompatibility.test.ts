import assert from "node:assert/strict";
import fs from "node:fs";
import { describe, it } from "node:test";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ajv = new Ajv({ strict: false, allErrors: true });
addFormats(ajv);
for (const name of ["Document", "OrdOverlay"]) {
  ajv.addSchema(
    JSON.parse(
      fs.readFileSync(
        `./src/generated/spec/v1/schemas/${name}.schema.json`,
        "utf8",
      ),
    ),
    name,
  );
}
const validateResource = ajv.getSchema("Document#/definitions/Overlay");
const validateFile = ajv.getSchema("OrdOverlay");
assert.ok(validateResource);
assert.ok(validateFile);

const overlay = {
  ordId: "sap.foo:overlay:astronomy:v1",
  version: "1.0.0",
  releaseStatus: "active",
  visibility: "public",
};
const definition = {
  type: "ord:overlay:v1",
  mediaType: "application/json",
  url: "/overlay.json",
};
const target = {
  ordId: "sap.foo:apiResource:astronomy:v1",
  resourceDefinition: {
    type: "openapi-v3",
    mediaType: "application/json",
    visibility: "public",
  },
};

describe("Overlay publication compatibility", () => {
  it("keeps targets, purpose, and definitions optional for existing resources", () => {
    assert.ok(
      validateResource(overlay),
      JSON.stringify(validateResource.errors),
    );
    assert.ok(validateResource({ ...overlay, definitions: [] }));
  });

  it("accepts legacy relationships and definition metadata", () => {
    assert.ok(
      validateResource({
        ...overlay,
        relatedApiResources: [
          { ordId: target.ordId, relationType: "ord:patches" },
        ],
        relatedEventResources: [
          {
            ordId: "sap.foo:eventResource:astronomy:v1",
            relationType: "ord:patches",
          },
        ],
        definitions: [
          {
            ...definition,
            visibility: "internal",
            purpose: "ord:ai-enrichment",
          },
        ],
      }),
      JSON.stringify(validateResource.errors),
    );
  });

  it("accepts explicit input selection with separate output purpose and visibility", () => {
    assert.ok(
      validateResource({
        ...overlay,
        visibility: "internal",
        purpose: "ord:ai-enrichment",
        targets: [target],
        definitions: [definition],
      }),
      JSON.stringify(validateResource.errors),
    );
  });

  it("limits explicit targets to one without requiring purpose", () => {
    assert.ok(validateResource({ ...overlay, targets: [target] }));
    assert.equal(validateResource({ ...overlay, targets: [] }), false);
    assert.equal(
      validateResource({ ...overlay, targets: [target, target] }),
      false,
    );
  });

  it("requires explicit input visibility when targets are supplied", () => {
    const { visibility: _visibility, ...input } = target.resourceDefinition;
    assert.equal(
      validateResource({
        ...overlay,
        targets: [{ ...target, resourceDefinition: input }],
      }),
      false,
    );
    assert.ok(
      validateResource.errors?.some((error) => error.keyword === "required"),
    );
  });

  it("retains self-contained and minimal ORD Overlay files", () => {
    const file = {
      ordOverlay: "0.1",
      patches: [
        {
          action: "merge",
          selector: { root: true },
          data: { info: { description: "Enriched" } },
        },
      ],
    };
    assert.ok(validateFile(file), JSON.stringify(validateFile.errors));
    assert.ok(
      validateFile({
        ...file,
        ordId: overlay.ordId,
        description: "Self-contained overlay",
        perspective: "system-instance",
        describedSystemType: { systemNamespace: "sap.foo" },
        describedSystemVersion: { version: "1.0.0" },
        describedSystemInstance: { globalId: "tenant-42" },
        visibility: "internal",
        target: { ordId: target.ordId, definitionType: "openapi-v3" },
        meta: { sourceSystem: "Enrichment pipeline" },
      }),
      JSON.stringify(validateFile.errors),
    );
  });
});
