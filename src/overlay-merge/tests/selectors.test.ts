import assert from "node:assert/strict";
import test from "node:test";
import { resolveSelector } from "../selectors";
import type { JSONValue } from "../types";

test("resolveSelector resolves root selector to document root", () => {
	const target = {
		info: { title: "Test API", version: "1.0.0" },
		paths: { "/foo": {} },
	};
	const result = resolveSelector(target as JSONValue, { root: true } as never);

	assert.equal(result.length, 1);
	assert.equal(result[0].path, "$");
	assert.equal(result[0].parent, undefined);
	assert.equal(result[0].key, undefined);
	assert.deepEqual(result[0].value, target);
});

test("resolveSelector root selector works with any document type", () => {
	// OpenAPI-like
	const openapi = { openapi: "3.0.0", info: {}, paths: {} };
	assert.equal(
		resolveSelector(openapi as JSONValue, { root: true } as never)[0].value,
		openapi,
	);

	// CSDL JSON-like
	const csdl = { $Version: "4.0", "OData.Demo": {} };
	assert.equal(
		resolveSelector(csdl as JSONValue, { root: true } as never)[0].value,
		csdl,
	);

	// ORD Document-like
	const ord = { openResourceDiscovery: "1.9", apiResources: [] };
	assert.equal(
		resolveSelector(ord as JSONValue, { root: true } as never)[0].value,
		ord,
	);

	// Primitive root (array)
	const arr = [1, 2, 3];
	assert.deepEqual(
		resolveSelector(arr as JSONValue, { root: true } as never)[0].value,
		arr,
	);
});

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
		() =>
			resolveSelector(
				{} as JSONValue,
				{ entitySet: "Customers" },
				"openapi-v3",
			),
		/'entitySet' selector is only supported/,
	);
});

test("resolveSelector throws for namespace selector on unsupported target format", () => {
	assert.throws(
		() =>
			resolveSelector(
				{} as JSONValue,
				{ namespace: "com.example.Svc" },
				"openapi-v3",
			),
		/'namespace' selector is only supported/,
	);
});

test("resolveSelector throws for entitySet/namespace on edmx (must use EDMX-specific API)", () => {
	assert.throws(
		() => resolveSelector({} as JSONValue, { entitySet: "Customers" }, "edmx"),
		/applyOverlayToEdmxDocument/,
	);

	assert.throws(
		() =>
			resolveSelector(
				{} as JSONValue,
				{ namespace: "com.example.Svc" },
				"edmx",
			),
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

// ─── Ambiguity detection tests ───────────────────────────────────────────────

const csdlTwoNamespaces = {
	$Version: "4.0",
	"com.example.NS1": {
		Customer: { $Kind: "EntityType" },
		Approve: [{ $Kind: "Action" }],
		Container1: {
			$Kind: "EntityContainer",
			Customers: { $Type: "com.example.NS1.Customer", $Collection: true },
		},
	},
	"com.example.NS2": {
		Customer: { $Kind: "EntityType" },
		Approve: [{ $Kind: "Action" }],
		Container2: {
			$Kind: "EntityContainer",
			Customers: { $Type: "com.example.NS2.Customer", $Collection: true },
		},
	},
} as JSONValue;

test("resolveSelector throws on ambiguous unqualified entityType across CSDL namespaces", () => {
	assert.throws(
		() =>
			resolveSelector(
				csdlTwoNamespaces,
				{ entityType: "Customer" },
				"csdl-json",
			),
		/Ambiguous entityType selector "Customer"/,
	);
});

test("resolveSelector resolves qualified entityType unambiguously in CSDL", () => {
	const result = resolveSelector(
		csdlTwoNamespaces,
		{ entityType: "com.example.NS1.Customer" },
		"csdl-json",
	);
	assert.equal(result.length, 1);
	assert.equal(result[0].path, "$['com.example.NS1']['Customer']");
});

test("resolveSelector throws on ambiguous unqualified operation across CSDL namespaces", () => {
	assert.throws(
		() =>
			resolveSelector(csdlTwoNamespaces, { operation: "Approve" }, "csdl-json"),
		/Ambiguous operation selector "Approve"/,
	);
});

test("resolveSelector resolves qualified operation unambiguously in CSDL", () => {
	const result = resolveSelector(
		csdlTwoNamespaces,
		{ operation: "com.example.NS2.Approve" },
		"csdl-json",
	);
	assert.equal(result.length, 1);
	assert.equal(result[0].path, "$['com.example.NS2']['Approve'][0]");
});

test("resolveSelector throws on ambiguous entitySet name across CSDL EntityContainers", () => {
	assert.throws(
		() =>
			resolveSelector(
				csdlTwoNamespaces,
				{ entitySet: "Customers" },
				"csdl-json",
			),
		/Ambiguous entitySet selector "Customers"/,
	);
});
