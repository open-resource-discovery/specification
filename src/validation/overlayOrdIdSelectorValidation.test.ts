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

function ordIdOverlay(ordId: string) {
  return {
    ordOverlay: "0.2",
    patches: [
      {
        action: "merge",
        selector: { ordId },
        data: { shortDescription: "Enriched description" },
      },
    ],
  };
}

describe("ORD Overlay ordId selector validation", () => {
  it("accepts an overlay without target that patches an ORD resource", () => {
    assert.equal(
      validate(ordIdOverlay("sap.foo:apiResource:astronomy:v1")),
      true,
    );
  });

  it("rejects an invalid ORD ID", () => {
    assert.equal(validate(ordIdOverlay("not-an-ord-id")), false);
  });

  it("accepts the ORD resource metadata example", () => {
    const example = JSON.parse(
      fs.readFileSync("./examples/overlay/ord-document-1.overlay.json", "utf8"),
    );
    assert.equal(validate(example), true);
  });
});
