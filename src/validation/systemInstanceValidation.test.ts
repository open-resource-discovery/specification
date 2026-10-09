import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ajv = new Ajv({ strict: false, allErrors: true });
addFormats(ajv);

for (const name of ["Document", "OrdOverlay"]) {
  const schema = JSON.parse(
    fs.readFileSync(
      `./src/generated/spec/v1/schemas/${name}.schema.json`,
      "utf8",
    ),
  );
  ajv.addSchema(schema, name);
}

const patch = {
  action: "merge",
  selector: { jsonPath: "$.info" },
  data: { description: "Tenant-specific metadata" },
};

const contexts = [
  {
    name: "ORD Document",
    schema: "Document",
    document: (instance: object) => ({
      openResourceDiscovery: "1.16",
      describedSystemInstance: instance,
    }),
  },
  {
    name: "ORD Overlay describedSystemInstance",
    schema: "OrdOverlay",
    document: (instance: object) => ({
      ordOverlay: "0.1",
      describedSystemInstance: instance,
      patches: [patch],
    }),
  },
  {
    name: "ORD Overlay target.systemInstance",
    schema: "OrdOverlay",
    document: (instance: object) => ({
      ordOverlay: "0.1",
      target: { definitionType: "openapi-v3", systemInstance: instance },
      patches: [patch],
    }),
  },
];

describe("Shared system instance identity", () => {
  for (const context of contexts) {
    const validate = ajv.getSchema(context.schema);
    assert.ok(validate);

    describe(context.name, () => {
      it("accepts an authority-assigned global ID without imposing a UUID format", () => {
        assert.ok(
          validate(
            context.document({
              baseUrl: "https://example.com",
              globalId: "authority-tenant-record-42",
            }),
          ),
          JSON.stringify(validate.errors),
        );
      });

      it("keeps the global ID optional", () => {
        assert.ok(
          validate(context.document({ baseUrl: "https://example.com" })),
          JSON.stringify(validate.errors),
        );
      });

      it("rejects a global ID longer than 255 characters", () => {
        assert.equal(
          validate(
            context.document({
              baseUrl: "https://example.com",
              globalId: "a".repeat(256),
            }),
          ),
          false,
        );
        assert.ok(
          validate.errors?.some((error) => error.keyword === "maxLength"),
        );
      });
    });
  }
});
