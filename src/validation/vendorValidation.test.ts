import assert from "node:assert/strict";
import fs from "node:fs";
import { describe, it } from "node:test";
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
const validate = ajv.getSchema("Document#/definitions/Vendor");
assert.ok(validate);

const vendor = { ordId: "example:vendor:Example:", title: "Example Vendor" };

describe("Vendor identifiers", () => {
  it("accepts a namespace-aligned Vendor", () => {
    assert.ok(validate(vendor), JSON.stringify(validate.errors));
    assert.ok(
      validate({ ...vendor, vendorNamespace: "example" }),
      JSON.stringify(validate.errors),
    );
  });

  it("accepts an authority-registered Vendor with or without a vendor namespace", () => {
    const authorityRegisteredVendor = {
      ordId: "example.prm:vendor:partner-123:",
      title: "Partner 123",
    };

    assert.ok(
      validate(authorityRegisteredVendor),
      JSON.stringify(validate.errors),
    );
    assert.ok(
      validate({ ...authorityRegisteredVendor, vendorNamespace: "partner123" }),
      JSON.stringify(validate.errors),
    );
  });

  it("rejects a Vendor ID under a sub-context namespace", () => {
    assert.equal(
      validate({
        ...vendor,
        ordId: "example.prm.internal:vendor:partner-123:",
      }),
      false,
    );
    assert.ok(validate.errors?.some((error) => error.keyword === "pattern"));
  });

  it("requires vendorNamespace to use the top-level vendor namespace syntax", () => {
    assert.equal(
      validate({ ...vendor, vendorNamespace: "example.partner" }),
      false,
    );
    assert.ok(validate.errors?.some((error) => error.keyword === "pattern"));
  });
});

describe("Vendor correlation IDs", () => {
  it("keeps correlationIds optional for existing vendors", () => {
    assert.ok(validate(vendor), JSON.stringify(validate.errors));
  });

  it("accepts multiple standardized CRM references with leading zeros", () => {
    assert.ok(
      validate({
        ...vendor,
        correlationIds: [
          "sap:crmCustomer:0098765432",
          "sap:crmCustomer:0012345678",
        ],
      }),
      JSON.stringify(validate.errors),
    );
  });

  it("applies the existing correlation ID syntax and length limits", () => {
    for (const correlationId of [
      "0098765432",
      "sap:crmCustomer:",
      `sap:crmCustomer:${"a".repeat(240)}`,
    ]) {
      assert.equal(
        validate({ ...vendor, correlationIds: [correlationId] }),
        false,
      );
      assert.ok(
        validate.errors?.some((error) =>
          ["pattern", "maxLength"].includes(error.keyword),
        ),
      );
    }
  });
});
