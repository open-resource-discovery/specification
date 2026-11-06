import assert from "node:assert";
import fs from "node:fs";
import { describe, it } from "node:test";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const schema = JSON.parse(
  fs.readFileSync(
    "./src/generated/spec/v1/schemas/OrdOverlay.schema.json",
    "utf8",
  ),
);
const ajv = new Ajv({ strict: false, allErrors: true });
addFormats(ajv);
const validate = ajv.compile(schema);

function ordLevelOverlay(selector: Record<string, string>) {
  return {
    ordOverlay: "0.2",
    patches: [
      {
        action: "merge",
        selector,
        data: { shortDescription: "Enriched description" },
      },
    ],
  };
}

describe("ORD Overlay ORD-level selector validation", () => {
  for (const selector of [
    { ordId: "sap.foo:apiResource:astronomy:v1" },
    { groupId: "sap.foo:groupTypeAbc:sap.foo:groupAssignmentValue" },
    { groupTypeId: "sap.foo:groupTypeAbc" },
  ]) {
    it(`accepts ${Object.keys(selector)[0]} without target`, () => {
      assert.equal(validate(ordLevelOverlay(selector)), true);
    });
  }

  for (const selector of [
    { ordId: "not-an-ord-id" },
    { groupId: "sap.foo:groupTypeAbc" },
    { groupTypeId: "not-a-group-type-id" },
  ]) {
    it(`rejects an invalid ${Object.keys(selector)[0]}`, () => {
      assert.equal(validate(ordLevelOverlay(selector)), false);
    });
  }

  it("accepts the ORD resource metadata example", () => {
    const example = JSON.parse(
      fs.readFileSync("./examples/overlay/ord-document-1.overlay.json", "utf8"),
    );
    assert.equal(validate(example), true);
  });
});
