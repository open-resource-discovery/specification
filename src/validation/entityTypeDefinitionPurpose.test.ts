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
const validate = ajv.getSchema("Document#/definitions/EntityTypeDefinition");
assert.ok(validate);

const base: object = {
  type: "sap-csn-interop-effective-v1",
  mediaType: "application/json",
  url: "https://example.com/entity-type.json",
  visibility: "private",
};

describe("EntityTypeDefinition purpose field", () => {
  it("accepts a definition without purpose (default definition)", () => {
    assert.ok(validate(base), JSON.stringify(validate.errors));
  });

  it("accepts a definition with purpose ord:ai-enrichment", () => {
    assert.ok(
      validate({ ...base, purpose: "ord:ai-enrichment" }),
      JSON.stringify(validate.errors),
    );
  });

  it("accepts a definition with purpose ord:agent-security-permissions", () => {
    assert.ok(
      validate({ ...base, purpose: "ord:agent-security-permissions" }),
      JSON.stringify(validate.errors),
    );
  });

  it("accepts a custom vendor-namespaced purpose", () => {
    assert.ok(
      validate({ ...base, purpose: "foo.bar:my-purpose" }),
      JSON.stringify(validate.errors),
    );
  });

  it("rejects a purpose that is not a valid Concept ID", () => {
    assert.equal(validate({ ...base, purpose: "not-a-concept-id" }), false);
  });

  it("rejects an empty purpose string", () => {
    assert.equal(validate({ ...base, purpose: "" }), false);
  });
});
