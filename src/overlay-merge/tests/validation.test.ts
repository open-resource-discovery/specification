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

test("validateOverlaySemantics reports unsupported selector and patch data errors", () => {
	const overlay = createOrdOverlay({
		target: {
			definitionType: "asyncapi-v2",
		},
		patches: [
			createOverlayPatch({
				action: "append",
				selector: {
					operation: "publishAstronomyUpdate",
				},
				data: {
					invalid: true,
				},
			}),
		],
	});

	const result = validateOverlaySemantics(overlay);

	assert.ok(
		result.errors.some((issue) =>
			issue.message.includes('Patch action "append" requires string data.'),
		),
	);
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

test("validateOverlaySemantics warns about ambiguous propertyType selectors and errors because OData support is not implemented", () => {
	const overlay = createOrdOverlay({
		target: {
			definitionType: "csdl-json",
		},
		patches: [
			createOverlayPatch({
				selector: {
					propertyType: "BusinessPartnerFullName",
				},
				data: {
					title: "patched",
				},
			}),
		],
	});

	const result = validateOverlaySemantics(overlay);

	assert.ok(
		result.warnings.some((issue) =>
			issue.message.includes(
				"propertyType selectors may need selector.entityType",
			),
		),
	);
	assert.ok(
		result.errors.some((issue) =>
			issue.message.includes(
				'The "propertyType" selector is not supported yet.',
			),
		),
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
