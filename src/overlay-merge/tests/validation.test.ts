import assert from "node:assert/strict";
import test from "node:test";
import { applyOverlayToDocument } from "../merge";
import {
	validateOverlayInput,
	validateOverlaySemantics,
	validateTargetDocumentForDefinitionType,
} from "../validation";
import { createOrdOverlay, createOverlayPatch } from "./test-helpers";

test("validateOverlayInput reports schema errors for invalid overlay documents", () => {
	const result = validateOverlayInput({
		patches: [],
	});

	assert.ok(
		result.errors.some((issue) =>
			issue.message.includes('Missing required property "ordOverlay"'),
		),
	);
	assert.ok(
		result.errors.some(
			(issue) =>
				issue.path === "$.patches" &&
				issue.message.includes("must NOT have fewer than 1 items"),
		),
	);
	assert.equal(result.warnings.length, 0);
});

test("validateOverlaySemantics emits SHOULD warnings for ambiguous operation patches", () => {
	const overlay = createOrdOverlay({
		perspective: "system-version",
		target: {
			ordId: "sap.foo:apiResource:astronomy:v1",
		},
		patches: [
			createOverlayPatch({
				selector: {
					operation: "getConstellationByAbbreviation",
				},
				data: {
					deprecated: true,
				},
			}),
		],
	});

	const result = validateOverlaySemantics(overlay);

	assert.equal(result.errors.length, 0);
	assert.ok(
		result.warnings.some((issue) =>
			issue.message.includes("target.definitionType is RECOMMENDED"),
		),
	);
	assert.ok(
		result.warnings.some((issue) =>
			issue.message.includes("target.ordId alone can be ambiguous"),
		),
	);
	assert.ok(
		result.warnings.some((issue) =>
			issue.message.includes(
				"resolver falls back to OpenAPI -> MCP -> A2A detection order",
			),
		),
	);
	assert.ok(
		result.warnings.some((issue) =>
			issue.message.includes("describedSystemVersion SHOULD be provided"),
		),
	);
	assert.ok(
		result.warnings.some((issue) =>
			issue.message.includes("describedSystemType SHOULD also be provided"),
		),
	);
});

test("validateOverlaySemantics enforces patch data requirements by action", () => {
	const mergeWithoutData = createOrdOverlay({
		patches: [
			createOverlayPatch(
				{
					action: "merge",
					selector: { jsonPath: "$.info" },
				},
				{ omitData: true },
			),
		],
	});

	const removeWithoutData = createOrdOverlay({
		patches: [
			createOverlayPatch({
				action: "remove",
				selector: { jsonPath: "$.info" },
			}),
		],
	});

	const removeWithEmptyData = createOrdOverlay({
		patches: [
			createOverlayPatch({
				action: "remove",
				selector: { jsonPath: "$.info" },
				data: {},
			}),
		],
	});

	const missingDataResult = validateOverlaySemantics(mergeWithoutData);
	assert.ok(
		missingDataResult.errors.some((issue) =>
			issue.message.includes('Patch action "merge" requires data'),
		),
	);

	const removeWithoutDataResult = validateOverlaySemantics(removeWithoutData);
	assert.equal(removeWithoutDataResult.errors.length, 0);

	const emptyRemoveDataResult = validateOverlaySemantics(removeWithEmptyData);
	assert.ok(
		emptyRemoveDataResult.errors.some((issue) =>
			issue.message.includes("empty data is not allowed"),
		),
	);
});

test("validateOverlaySemantics does not emit metadata-definition warnings for ordId-only patches", () => {
	const overlay = createOrdOverlay({
		patches: [
			createOverlayPatch({
				selector: {
					ordId: "sap.foo:apiResource:astronomy:v1",
				},
				data: {
					title: "patched",
				},
			}),
		],
	});

	const result = validateOverlaySemantics(overlay);

	assert.equal(result.errors.length, 0);
	assert.equal(
		result.warnings.some((issue) =>
			issue.message.includes("target.definitionType is RECOMMENDED"),
		),
		false,
	);
});

test("validateOverlaySemantics reports unsupported selector errors", () => {
	const overlay = createOrdOverlay({
		target: {
			definitionType: "asyncapi-v2",
		},
		patches: [
			createOverlayPatch({
				action: "update",
				selector: {
					operation: "publishAstronomyUpdate",
				},
				data: { description: "Updated" },
			}),
		],
	});

	const result = validateOverlaySemantics(overlay);

	assert.ok(
		result.errors.some((issue) =>
			issue.message.includes(
				'The "operation" selector is not supported for definitionType "asyncapi-v2"',
			),
		),
	);
});

test("validateOverlaySemantics validates deprecated definitionType values and JSONPath syntax", () => {
	const overlay = createOrdOverlay({
		target: {
			definitionType: "custom",
		},
		patches: [
			createOverlayPatch({
				selector: {
					jsonPath: "paths[",
				},
				data: {
					title: "invalid",
				},
			}),
		],
	});

	const result = validateOverlaySemantics(overlay);

	assert.ok(
		result.errors.some((issue) =>
			issue.message.includes('MUST NOT use the deprecated literal "custom"'),
		),
	);
	assert.ok(
		result.errors.some((issue) =>
			issue.message.includes("Invalid JSONPath expression"),
		),
	);
});

test("validateOverlaySemantics errors for propertyType selectors with missing or ambiguous parent type context", () => {
	const overlay = createOrdOverlay({
		target: {
			definitionType: "csdl-json",
		},
		patches: [
			createOverlayPatch({
				selector: {
					propertyType: "BusinessPartnerFullName",
					entityType: "BusinessPartner",
				},
				data: {
					title: "patched",
				},
			}),
		],
	});

	const result = validateOverlaySemantics(overlay);

	// No errors: propertyType is supported for csdl-json
	assert.equal(
		result.errors.filter((issue) => issue.message.includes("not supported"))
			.length,
		0,
		"propertyType selector should not produce errors for csdl-json",
	);

	// Error when propertyType is used without any parent type for disambiguation
	const overlayNoParent = createOrdOverlay({
		target: {
			definitionType: "csdl-json",
		},
		patches: [
			createOverlayPatch({
				selector: {
					propertyType: "BusinessPartnerFullName",
				},
				data: { title: "patched" },
			}),
		],
	});

	const resultNoParent = validateOverlaySemantics(overlayNoParent);
	assert.ok(
		resultNoParent.errors.some((issue) =>
			issue.message.includes(
				'MUST provide exactly one of "entityType", "complexType", or "enumType"',
			),
		),
		"propertyType without parent type should produce an error",
	);

	// Error when propertyType has multiple parent types
	const overlayMultiParent = createOrdOverlay({
		target: {
			definitionType: "csdl-json",
		},
		patches: [
			createOverlayPatch({
				selector: {
					propertyType: "Street",
					entityType: "Customer",
					complexType: "Address",
				} as Record<string, unknown>,
				data: { title: "patched" },
			}),
		],
	});

	const resultMultiParent = validateOverlaySemantics(overlayMultiParent);
	assert.ok(
		resultMultiParent.errors.some((issue) =>
			issue.message.includes("but multiple were provided"),
		),
		"propertyType with multiple parent types should produce an error",
	);
});

test("validateOverlaySemantics errors for entityType/propertyType selector on unsupported definitionType", () => {
	const overlay = createOrdOverlay({
		target: {
			definitionType: "asyncapi-v2",
		},
		patches: [
			createOverlayPatch({
				selector: {
					entityType: "Customer",
				},
				data: { title: "patched" },
			}),
		],
	});

	const result = validateOverlaySemantics(overlay);
	assert.ok(
		result.errors.some(
			(issue) =>
				issue.message.includes("entityType") &&
				issue.message.includes("asyncapi-v2"),
		),
		"entityType selector should error for asyncapi-v2",
	);

	// complexType selector should also error for unsupported definitionType
	const overlayComplexType = createOrdOverlay({
		target: {
			definitionType: "asyncapi-v2",
		},
		patches: [
			createOverlayPatch({
				selector: {
					complexType: "Address",
				} as Record<string, unknown>,
				data: { title: "patched" },
			}),
		],
	});

	const resultComplexType = validateOverlaySemantics(overlayComplexType);
	assert.ok(
		resultComplexType.errors.some(
			(issue) =>
				issue.message.includes("complexType") &&
				issue.message.includes("asyncapi-v2"),
		),
		"complexType selector should error for asyncapi-v2",
	);

	// enumType selector should also error for unsupported definitionType
	const overlayEnumType = createOrdOverlay({
		target: {
			definitionType: "asyncapi-v2",
		},
		patches: [
			createOverlayPatch({
				selector: {
					enumType: "OrderStatus",
				} as Record<string, unknown>,
				data: { title: "patched" },
			}),
		],
	});

	const resultEnumType = validateOverlaySemantics(overlayEnumType);
	assert.ok(
		resultEnumType.errors.some(
			(issue) =>
				issue.message.includes("enumType") &&
				issue.message.includes("asyncapi-v2"),
		),
		"enumType selector should error for asyncapi-v2",
	);
});

test("validateTargetDocumentForDefinitionType detects target shape mismatches", () => {
	const openApi31Issues = validateTargetDocumentForDefinitionType(
		{
			openapi: "3.0.3",
			info: {
				title: "Astronomy",
			},
		},
		"openapi-v3.1+",
	);

	const mcpIssues = validateTargetDocumentForDefinitionType(
		{
			name: "server-card-without-tools",
		},
		"sap.foo:mcp-server-card:v1",
		createOrdOverlay({
			patches: [
				createOverlayPatch({
					selector: {
						operation: "listStars",
					},
					data: {
						title: "patched",
					},
				}),
			],
		}),
	);

	assert.ok(
		openApi31Issues.some((issue) =>
			issue.message.includes('does not match definitionType "openapi-v3.1+"'),
		),
	);
	assert.ok(mcpIssues.some((issue) => issue.path === "$.tools"));
});

test("validateTargetDocumentForDefinitionType accepts matching target shapes", () => {
	const openApiV2Issues = validateTargetDocumentForDefinitionType(
		{
			swagger: "2.0",
			info: {
				title: "Legacy API",
			},
		},
		"openapi-v2",
	);

	const a2aIssues = validateTargetDocumentForDefinitionType(
		{
			skills: [],
		},
		"a2a-agent-card",
	);

	const csdlIssues = validateTargetDocumentForDefinitionType(
		{
			$Version: "4.01",
		},
		"csdl-json",
	);

	assert.deepEqual(openApiV2Issues, []);
	assert.deepEqual(a2aIssues, []);
	assert.deepEqual(csdlIssues, []);
});

test("applyOverlayToDocument fails early for non JSON/YAML definition types", () => {
	const overlay = createOrdOverlay({
		target: {
			definitionType: "graphql-sdl",
		},
		patches: [
			createOverlayPatch({
				selector: {
					jsonPath: "$.info",
				},
				data: {
					title: "patched",
				},
			}),
		],
	});

	assert.throws(
		() => applyOverlayToDocument({ info: {} }, overlay),
		/The "jsonPath" selector is only defined for JSON\/YAML-based target formats/,
	);
});

test("validateOverlaySemantics errors for entitySet/namespace selector on unsupported definitionType", () => {
	const entitySetOverlay = createOrdOverlay({
		target: { definitionType: "openapi-v3" },
		patches: [
			createOverlayPatch({
				selector: { entitySet: "Customers" },
				data: { "@Core.Description": "all customers" },
			}),
		],
	});

	const nsOverlay = createOrdOverlay({
		target: { definitionType: "openapi-v3" },
		patches: [
			createOverlayPatch({
				selector: { namespace: "com.example.Svc" },
				data: { "@Core.Description": "the service" },
			}),
		],
	});

	const esResult = validateOverlaySemantics(entitySetOverlay);
	assert.ok(
		esResult.errors.some(
			(issue) =>
				issue.message.includes("entitySet") &&
				issue.message.includes("openapi-v3"),
		),
		"entitySet selector should error for openapi-v3",
	);

	const nsResult = validateOverlaySemantics(nsOverlay);
	assert.ok(
		nsResult.errors.some(
			(issue) =>
				issue.message.includes("namespace") &&
				issue.message.includes("openapi-v3"),
		),
		"namespace selector should error for openapi-v3",
	);
});

test("validateOverlaySemantics errors for parameter/returnType selector on unsupported definitionType", () => {
	const paramOverlay = createOrdOverlay({
		target: { definitionType: "a2a-agent-card" },
		patches: [
			createOverlayPatch({
				selector: { parameter: "myParam", operation: "myOp" },
				data: { "@Core.Description": "desc" },
			}),
		],
	});

	const rtOverlay = createOrdOverlay({
		target: { definitionType: "a2a-agent-card" },
		patches: [
			createOverlayPatch({
				selector: { returnType: true, operation: "myOp" },
				data: { "@Core.Description": "desc" },
			}),
		],
	});

	const paramResult = validateOverlaySemantics(paramOverlay);
	assert.ok(
		paramResult.errors.some(
			(issue) =>
				issue.message.includes("parameter") &&
				issue.message.includes("a2a-agent-card"),
		),
		"parameter selector should error for a2a-agent-card",
	);

	const rtResult = validateOverlaySemantics(rtOverlay);
	assert.ok(
		rtResult.errors.some(
			(issue) =>
				issue.message.includes("returnType") &&
				issue.message.includes("a2a-agent-card"),
		),
		"returnType selector should error for a2a-agent-card",
	);
});

test("validateOverlaySemantics warns for OData patch data without @-prefixed annotation keys", () => {
	const overlay = createOrdOverlay({
		target: { definitionType: "csdl-json" },
		patches: [
			createOverlayPatch({
				selector: { entityType: "Customer" },
				data: { title: "not an annotation key", count: 42 },
			}),
		],
	});

	const result = validateOverlaySemantics(overlay);
	assert.ok(
		result.warnings.some(
			(issue) =>
				issue.message.includes("MUST use @-prefixed annotation keys") &&
				issue.message.includes("title") &&
				issue.message.includes("count"),
		),
		"should warn about non-@ keys in OData patch data",
	);
});

test("validateOverlaySemantics does not warn for OData patch data with valid @-prefixed keys", () => {
	const overlay = createOrdOverlay({
		target: { definitionType: "csdl-json" },
		patches: [
			createOverlayPatch({
				selector: { entityType: "Customer" },
				data: { "@Core.Description": "A customer entity" },
			}),
		],
	});

	const result = validateOverlaySemantics(overlay);
	assert.equal(
		result.warnings.filter((issue) => issue.message.includes("annotation keys"))
			.length,
		0,
		"should not warn for valid @-prefixed annotation keys",
	);
});

test("validateOverlaySemantics allows non-@ keys with object values as child annotations for OData", () => {
	const overlay = createOrdOverlay({
		target: { definitionType: "edmx" },
		patches: [
			createOverlayPatch({
				selector: { entityType: "Customer" },
				data: {
					"@Core.Description": "A customer",
					Name: { "@Core.Description": "Customer name" },
				},
			}),
		],
	});

	const result = validateOverlaySemantics(overlay);
	assert.equal(
		result.warnings.filter((issue) => issue.message.includes("annotation keys"))
			.length,
		0,
		"should not warn for non-@ keys with object values (child annotations)",
	);
});

test("validateOverlaySemantics does not warn about OData annotation format for non-OData targets", () => {
	const overlay = createOrdOverlay({
		target: { definitionType: "openapi-v3" },
		patches: [
			createOverlayPatch({
				selector: { operation: "getCustomers" },
				data: { description: "Updated description" },
			}),
		],
	});

	const result = validateOverlaySemantics(overlay);
	assert.equal(
		result.warnings.filter((issue) => issue.message.includes("annotation keys"))
			.length,
		0,
		"should not emit OData annotation warnings for openapi-v3 targets",
	);
});
