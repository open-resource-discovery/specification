import test from "node:test";
import assert from "node:assert/strict";
import { resolveSelector } from "../selectors";
import { JSONValue } from "../types";

test("resolveSelector rejects invalid JSONPath expressions", () => {
  assert.throws(
    () => resolveSelector({ info: {} } as JSONValue, { jsonPath: "$[" }),
    /Invalid JSONPath/,
  );
});

test("resolveSelector requires JSON objects for operation selectors", () => {
  assert.throws(
    () => resolveSelector(["not-an-object"] as JSONValue, { operation: "listThings" }, "openapi-v3"),
    /operation selector requires a JSON object as target document/,
  );
});

test("resolveSelector requires ORD documents for ordId selectors", () => {
  assert.throws(
    () => resolveSelector(["not-an-ord-document"] as JSONValue, { ordId: "sap.foo:apiResource:astronomy:v1" }),
    /ordId selector requires an ORD Document object as target/,
  );
});

test("resolveSelector rejects unsupported OData selectors directly", () => {
  assert.throws(
    () => resolveSelector({} as JSONValue, { entityType: "BusinessPartner" }),
    /Unsupported selector: entityType/,
  );

  assert.throws(
    () => resolveSelector({} as JSONValue, { propertyType: "BusinessPartnerFullName" }),
    /Unsupported selector: propertyType/,
  );
});
