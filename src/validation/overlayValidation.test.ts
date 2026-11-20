import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { validateOverlayDefinitionUniqueness } from "./overlayValidation";

const ajv = new Ajv({ strict: false, allErrors: true });
addFormats(ajv);
const documentSchema = JSON.parse(
  fs.readFileSync(
    "./src/generated/spec/v1/schemas/Document.schema.json",
    "utf8",
  ),
);
const patchSchema = JSON.parse(
  fs.readFileSync(
    "./src/generated/spec/v1/schemas/OrdOverlay.schema.json",
    "utf8",
  ),
);
const validateDocument = ajv.compile(documentSchema);
const validatePatch = ajv.compile(patchSchema);
const example = JSON.parse(
  fs.readFileSync("./examples/documents/document-overlays.json", "utf8"),
);

function projection() {
  return {
    openResourceDiscovery: "1.17",
    overlays: [structuredClone(example.overlays[0])],
  };
}

describe("Overlay projection contract", () => {
  it("accepts an entity selecting a public input and producing an internal AI projection", () => {
    const document = projection();
    document.overlays[0].visibility = "internal";
    document.overlays[0].purpose = "ord:ai-enrichment";
    document.overlays[0].target.resourceDefinition.visibility = "public";
    assert.ok(
      validateDocument(document),
      JSON.stringify(validateDocument.errors),
    );
  });

  for (const field of ["target", "definitions", "visibility"]) {
    it(`requires entity ${field}`, () => {
      const document = projection();
      delete document.overlays[0][field];
      assert.equal(validateDocument(document), false);
    });
  }

  for (const field of ["type", "mediaType", "visibility"]) {
    it(`requires input definition ${field}`, () => {
      const document = projection();
      delete document.overlays[0].target.resourceDefinition[field];
      assert.equal(validateDocument(document), false);
    });
  }

  it("rejects an empty target or patch-file list", () => {
    const document = projection();
    document.overlays[0].target = {};
    assert.equal(validateDocument(document), false);
    const empty = projection();
    empty.overlays[0].definitions = [];
    assert.equal(validateDocument(empty), false);
  });

  it("identifies custom input formats directly by Specification ID", () => {
    const document = projection();
    const input = document.overlays[0].target.resourceDefinition;
    input.type = "foo.bar:metadata:v1";
    assert.ok(
      validateDocument(document),
      JSON.stringify(validateDocument.errors),
    );
    input.customType = "foo.bar:metadata:v1";
    assert.equal(validateDocument(document), false);
    delete input.customType;
    input.type = "custom";
    assert.equal(validateDocument(document), false);
  });

  for (const field of ["visibility", "purpose"]) {
    it(`rejects definition-level ${field}`, () => {
      const document = projection();
      document.overlays[0].definitions[0][field] =
        field === "visibility" ? "public" : "ord:ai-enrichment";
      assert.equal(validateDocument(document), false);
    });
  }

  for (const field of [
    "relatedApiResources",
    "relatedEventResources",
    "describedSystemType",
    "describedSystemVersion",
    "describedSystemInstance",
    "perspective",
  ]) {
    it(`rejects unsupported entity ${field}`, () => {
      const document = projection();
      document.overlays[0][field] =
        field === "describedSystemType"
          ? { systemNamespace: "sap.foo" }
          : field === "describedSystemVersion"
            ? { version: "1.0.0" }
            : field === "describedSystemInstance"
              ? { globalId: "tenant-42" }
              : field === "perspective"
                ? "system-type"
                : [];
      assert.equal(validateDocument(document), false);
    });
  }

  const file = {
    ordOverlay: "0.1",
    patches: [
      {
        action: "merge",
        selector: { root: true },
        data: { description: "Enriched" },
      },
    ],
  };
  it("accepts a context-free patch file", () => {
    assert.ok(validatePatch(file), JSON.stringify(validatePatch.errors));
  });
  for (const field of [
    "target",
    "ordId",
    "perspective",
    "describedSystemType",
    "describedSystemVersion",
    "describedSystemInstance",
    "visibility",
    "purpose",
    "description",
    "meta",
  ]) {
    it(`rejects file-level ${field}`, () => {
      assert.equal(validatePatch({ ...file, [field]: {} }), false);
    });
  }

  it("rejects duplicate format keys even when URLs differ", () => {
    const definitions = [
      { type: "ord:overlay:v1", mediaType: "application/json", url: "/a.json" },
      { type: "ord:overlay:v1", mediaType: "application/json", url: "/b.json" },
    ];
    assert.equal(validateOverlayDefinitionUniqueness(definitions).length, 1);
  });

  it("allows different media types or format types", () => {
    assert.deepEqual(
      validateOverlayDefinitionUniqueness([
        { type: "oas-overlay-v1", mediaType: "application/json" },
        { type: "oas-overlay-v1", mediaType: "application/yaml" },
        { type: "ord:overlay:v1", mediaType: "application/json" },
      ]),
      [],
    );
  });
});
