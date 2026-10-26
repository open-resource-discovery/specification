import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
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
ajv.addSchema(schema, "Document");

const validateEntityTypeDef = ajv.getSchema(
  "Document#/definitions/EntityTypeDefinition",
);
assert.ok(validateEntityTypeDef);

const validateCapabilityDef = ajv.getSchema(
  "Document#/definitions/CapabilityDefinition",
);
assert.ok(validateCapabilityDef);

const entityTypeBase: object = {
  type: "sap-csn-interop-effective-v1",
  mediaType: "application/json",
  url: "https://example.com/entity-type.json",
  visibility: "private",
};

const capabilityBase: object = {
  type: "sap.mdo:mdi-capability-definition:v1",
  mediaType: "application/json",
  url: "https://example.com/capability.json",
};

describe("EntityTypeDefinition purpose field", () => {
  it("accepts a definition without purpose (default definition)", () => {
    assert.ok(
      validateEntityTypeDef(entityTypeBase),
      JSON.stringify(validateEntityTypeDef.errors),
    );
  });

  it("accepts a definition with purpose ord:ai-enrichment", () => {
    assert.ok(
      validateEntityTypeDef({
        ...entityTypeBase,
        purpose: "ord:ai-enrichment",
      }),
      JSON.stringify(validateEntityTypeDef.errors),
    );
  });

  it("accepts a definition with purpose ord:agent-security-permissions", () => {
    assert.ok(
      validateEntityTypeDef({
        ...entityTypeBase,
        purpose: "ord:agent-security-permissions",
      }),
      JSON.stringify(validateEntityTypeDef.errors),
    );
  });

  it("accepts a custom vendor-namespaced purpose", () => {
    assert.ok(
      validateEntityTypeDef({
        ...entityTypeBase,
        purpose: "foo.bar:my-purpose",
      }),
      JSON.stringify(validateEntityTypeDef.errors),
    );
  });

  it("rejects a purpose that is not a valid Concept ID", () => {
    assert.equal(
      validateEntityTypeDef({ ...entityTypeBase, purpose: "not-a-concept-id" }),
      false,
    );
  });

  it("rejects an empty purpose string", () => {
    assert.equal(
      validateEntityTypeDef({ ...entityTypeBase, purpose: "" }),
      false,
    );
  });

  it("rejects a numeric purpose value", () => {
    assert.equal(
      validateEntityTypeDef({ ...entityTypeBase, purpose: 42 }),
      false,
    );
  });
});

describe("CapabilityDefinition purpose field — shared semantics with EntityTypeDefinition", () => {
  it("accepts a definition without purpose", () => {
    assert.ok(
      validateCapabilityDef(capabilityBase),
      JSON.stringify(validateCapabilityDef.errors),
    );
  });

  it("accepts ord:ai-enrichment", () => {
    assert.ok(
      validateCapabilityDef({
        ...capabilityBase,
        purpose: "ord:ai-enrichment",
      }),
      JSON.stringify(validateCapabilityDef.errors),
    );
  });

  it("accepts ord:agent-security-permissions", () => {
    assert.ok(
      validateCapabilityDef({
        ...capabilityBase,
        purpose: "ord:agent-security-permissions",
      }),
      JSON.stringify(validateCapabilityDef.errors),
    );
  });

  it("accepts a custom vendor-namespaced purpose", () => {
    assert.ok(
      validateCapabilityDef({
        ...capabilityBase,
        purpose: "foo.bar:my-purpose",
      }),
      JSON.stringify(validateCapabilityDef.errors),
    );
  });

  it("rejects a purpose that is not a valid Concept ID", () => {
    assert.equal(
      validateCapabilityDef({
        ...capabilityBase,
        purpose: "not-a-concept-id",
      }),
      false,
    );
  });

  it("rejects an empty purpose string", () => {
    assert.equal(
      validateCapabilityDef({ ...capabilityBase, purpose: "" }),
      false,
    );
  });
});
