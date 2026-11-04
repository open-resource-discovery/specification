import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ajv = new Ajv({ strict: false, allErrors: true });
addFormats(ajv);
const documentSchema = JSON.parse(
  fs.readFileSync(
    "./src/generated/spec/v1/schemas/Document.schema.json",
    "utf8",
  ),
);
const configurationSchema = JSON.parse(
  fs.readFileSync(
    "./src/generated/spec/v1/schemas/Configuration.schema.json",
    "utf8",
  ),
);
const validateDocument = ajv.compile(documentSchema);
const validateConfiguration = ajv.compile(configurationSchema);
const deployment = {
  openResourceDiscovery: "1.17",
  perspective: "system-deployment",
  describedSystemDeployment: { localId: "installation-1" },
};

describe("Alpha system-deployment contract", () => {
  it("accepts an empty complete deployment view without tenant identity", () => {
    assert.ok(
      validateDocument(deployment),
      JSON.stringify(validateDocument.errors),
    );
  });

  it("permits authoritative onboarding to supply deployment identity", () => {
    assert.ok(
      validateDocument({
        openResourceDiscovery: "1.17",
        perspective: "system-deployment",
      }),
      JSON.stringify(validateDocument.errors),
    );
  });

  it("keeps deployment and tenant identity separate in tenant documents", () => {
    assert.ok(
      validateDocument({
        ...deployment,
        perspective: "system-instance",
        describedSystemInstance: { localId: "tenant-1" },
      }),
      JSON.stringify(validateDocument.errors),
    );
  });

  it("rejects empty deployment identifiers and tenant properties", () => {
    for (const identity of [
      { localId: "" },
      { globalId: "" },
      { tenantId: "tenant-1" },
    ]) {
      assert.equal(
        validateDocument({
          ...deployment,
          describedSystemDeployment: identity,
        }),
        false,
      );
    }
  });

  it("advertises deployment documents through the configuration endpoint", () => {
    assert.ok(
      validateConfiguration({
        openResourceDiscoveryV1: {
          documents: [
            {
              url: "/ord/deployment.json",
              perspective: "system-deployment",
              accessStrategies: [{ type: "open" }],
            },
          ],
        },
      }),
      JSON.stringify(validateConfiguration.errors),
    );
  });

  it("preserves every existing perspective and its schema default", () => {
    assert.equal(
      documentSchema.properties.perspective.default,
      "system-instance",
    );
    for (const perspective of [
      "system-type",
      "system-version",
      "system-instance",
      "system-independent",
    ]) {
      assert.ok(
        validateDocument({ openResourceDiscovery: "1.17", perspective }),
        JSON.stringify(validateDocument.errors),
      );
    }
  });
});
