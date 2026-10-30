import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ajv = new Ajv({ strict: false, allErrors: true });
addFormats(ajv);
const schema = JSON.parse(
  fs.readFileSync(
    "./src/generated/spec/v1/schemas/Document.schema.json",
    "utf8",
  ),
);
const validate = ajv.compile(schema);
const identifiers = {
  ordId: "sap.foo:apiResource:example:v1",
  groupId: "sap.foo:domain:sap.foo:example",
  groupTypeId: "sap.foo:domain",
};
const document = (identity: object) => ({
  openResourceDiscovery: "1.16",
  tombstones: [{ ...identity, removalDate: "2026-10-30T00:00:00Z" }],
});

describe("Tombstone identity", () => {
  for (const [field, value] of Object.entries(identifiers)) {
    it("accepts a tombstone identified only by " + field, () => {
      assert.ok(
        validate(document({ [field]: value })),
        JSON.stringify(validate.errors),
      );
    });
  }

  it("rejects a tombstone with no identifier", () => {
    assert.equal(validate(document({})), false);
    assert.ok(
      validate.errors?.some((error) => error.instancePath === "/tombstones/0"),
    );
  });

  const entries = Object.entries(identifiers);
  for (let first = 0; first < entries.length; first++) {
    for (let second = first + 1; second < entries.length; second++) {
      const pair = [entries[first]!, entries[second]!];
      it(
        "rejects a tombstone with both " + pair[0][0] + " and " + pair[1][0],
        () => {
          assert.equal(validate(document(Object.fromEntries(pair))), false);
        },
      );
    }
  }

  it("rejects a tombstone with all three identifiers", () => {
    assert.equal(validate(document(identifiers)), false);
  });
});
