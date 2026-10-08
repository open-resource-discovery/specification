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
const validate = ajv.getSchema("Document#/definitions/IntegrationAspect");
assert.ok(validate);

const aspect = {
  mandatory: true,
  apiResources: [{ ordId: "foo.bar:apiResource:ProductCatalog:v1" }],
};

describe("Integration aspect display title", () => {
  it("accepts a resource-level aspect without a title", () => {
    assert.ok(validate(aspect), JSON.stringify(validate.errors));
  });

  it("keeps existing titled aspects valid", () => {
    assert.ok(
      validate({ ...aspect, title: "Product catalog" }),
      JSON.stringify(validate.errors),
    );
  });

  it("keeps the non-empty title constraint when a title is provided", () => {
    assert.equal(validate({ ...aspect, title: "" }), false);
    assert.ok(validate.errors?.some((error) => error.keyword === "minLength"));
  });

  it("still requires the mandatory flag", () => {
    assert.equal(validate({ apiResources: aspect.apiResources }), false);
    assert.ok(
      validate.errors?.some(
        (error) =>
          error.keyword === "required" &&
          error.params.missingProperty === "mandatory",
      ),
    );
  });
});
