import assert from "node:assert/strict";
import test from "node:test";
import { resolveSelector } from "../selectors";
import type { JSONValue } from "../types";

test("resolveSelector rejects invalid JSONPath expressions", () => {
	assert.throws(
		() => resolveSelector({ info: {} } as JSONValue, { jsonPath: "$[" }),
		/Invalid JSONPath/,
	);
});

test("resolveSelector requires JSON objects for operation selectors", () => {
	assert.throws(
		() =>
			resolveSelector(
				["not-an-object"] as JSONValue,
				{ operation: "listThings" },
				"openapi-v3",
			),
		/operation selector requires a JSON object as target document/,
	);
});

test("resolveSelector requires ORD documents for ordId selectors", () => {
	assert.throws(
		() =>
			resolveSelector(["not-an-ord-document"] as JSONValue, {
				ordId: "sap.foo:apiResource:astronomy:v1",
			}),
		/ordId selector requires an ORD Document object as target/,
	);
});

test("resolveSelector throws for entityType selector on unsupported target format", () => {
	// An empty object with no $Version or csnInteropEffective — format unknown
	assert.throws(
		() => resolveSelector({} as JSONValue, { entityType: "BusinessPartner" }),
		/entityType.*not supported/i,
	);

	// Explicit unsupported definitionType
	assert.throws(
		() =>
			resolveSelector(
				{} as JSONValue,
				{ entityType: "BusinessPartner" },
				"openapi-v3",
			),
		/entityType.*not supported/i,
	);
});

test("resolveSelector throws for propertyType selector on unsupported target format", () => {
	// Explicit unsupported definitionType
	assert.throws(
		() =>
			resolveSelector(
				{} as JSONValue,
				{ propertyType: "Name", entityType: "Customer" },
				"openapi-v3",
			),
		/propertyType.*not supported/i,
	);
});

test("resolveSelector throws for entityType/propertyType on edmx (must use EDMX-specific API)", () => {
	assert.throws(
		() => resolveSelector({} as JSONValue, { entityType: "Customer" }, "edmx"),
		/applyOverlayToEdmxDocument/,
	);

	assert.throws(
		() =>
			resolveSelector(
				{} as JSONValue,
				{ propertyType: "Name", entityType: "Customer" },
				"edmx",
			),
		/applyOverlayToEdmxDocument/,
	);
});

test("resolveSelector throws for entitySet selector on unsupported target format", () => {
	assert.throws(
		() => resolveSelector({} as JSONValue, { entitySet: "Customers" }, "openapi-v3"),
		/'entitySet' selector is only supported/,
	);
});

test("resolveSelector throws for namespace selector on unsupported target format", () => {
	assert.throws(
		() => resolveSelector({} as JSONValue, { namespace: "com.example.Svc" }, "openapi-v3"),
		/'namespace' selector is only supported/,
	);
});

test("resolveSelector throws for entitySet/namespace on edmx (must use EDMX-specific API)", () => {
	assert.throws(
		() => resolveSelector({} as JSONValue, { entitySet: "Customers" }, "edmx"),
		/applyOverlayToEdmxDocument/,
	);

	assert.throws(
		() => resolveSelector({} as JSONValue, { namespace: "com.example.Svc" }, "edmx"),
		/applyOverlayToEdmxDocument/,
	);
});

test("resolveSelector throws for parameter selector on unsupported target format", () => {
	assert.throws(
		() =>
			resolveSelector(
				{} as JSONValue,
				{ parameter: "employeeId", operation: "listEmployees" },
				"a2a-agent-card",
			),
		/'parameter' selector is supported for/,
	);
});

test("resolveSelector throws for returnType selector on unsupported target format", () => {
	assert.throws(
		() =>
			resolveSelector(
				{} as JSONValue,
				{ returnType: true, operation: "com.example.Svc.GetReports" },
				"a2a-agent-card",
			),
		/'returnType' selector is only supported/,
	);
});
