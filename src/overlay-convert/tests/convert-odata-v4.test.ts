import assert from "node:assert/strict";
import test from "node:test";
import { convertODataV4EnrichmentToOrd } from "../convert-odata-v4";
import type { ODataV4Enrichment } from "../types";
import { loadLocalFixture } from "./test-helpers";

test("converts OData v4 entityTypes, complexTypes, actions and functions to ORD overlay patches", async () => {
	const source =
		await loadLocalFixture<ODataV4Enrichment>("odata-v4-enrichment.json");

	const { overlay, warnings } = convertODataV4EnrichmentToOrd(source, {
		target: { definitionType: "edmx" },
	});

	assert.equal(overlay.ordOverlay, "0.1");
	assert.equal(overlay.target?.definitionType, "edmx");

	// Expected patches:
	// - 1 entityType (Employee) + 2 properties = 3
	// - 1 complexType (AddressInfo) + 1 property = 2
	// - 1 entitySet = 0 (skipped)
	// - 1 enumType = 0 (skipped)
	// - 1 action (TerminateEmployee) = 1
	// - 1 function (GetDirectReports) = 1
	// - 1 actionImport = 0 (skipped)
	// - 1 functionImport = 0 (skipped)
	// Total = 7 patches
	assert.equal(overlay.patches.length, 7);

	// entityType patch uses namespace-qualified name
	const etPatch = overlay.patches[0];
	assert.deepEqual(etPatch.selector, {
		entityType: "com.sap.HRService.Employee",
	});
	assert.equal(etPatch.action, "merge");
	assert.deepEqual(etPatch.data, {
		"@Core.Description": "Employee master record",
		"@Core.LongDescription":
			"Represents a single employee in the HR system. Contains identification, personal data, job assignment, and employment status.",
	});

	// property EmployeeId on Employee
	const prop1 = overlay.patches[1];
	assert.deepEqual(prop1.selector, {
		propertyType: "EmployeeId",
		entityType: "com.sap.HRService.Employee",
	});

	// complexType patch
	const ctPatch = overlay.patches[3];
	assert.deepEqual(ctPatch.selector, {
		entityType: "com.sap.HRService.AddressInfo",
	});

	// action patch
	const actionPatch = overlay.patches[5];
	assert.deepEqual(actionPatch.selector, {
		operation: "com.sap.HRService.TerminateEmployee",
	});
	assert.equal(actionPatch.action, "merge");
	assert.deepEqual(
		(actionPatch.data as Record<string, unknown>)["@Core.Description"],
		"Terminate an employee's employment",
	);

	// function patch
	const fnPatch = overlay.patches[6];
	assert.deepEqual(fnPatch.selector, {
		operation: "com.sap.HRService.GetDirectReports",
	});

	// Warnings: service-level, entitySet, enumType, parameters, returnType x2,
	// actionImport, functionImport, tags
	const serviceWarning = warnings.filter((w) =>
		w.field?.includes("root.summary"),
	);
	assert.equal(
		serviceWarning.length,
		1,
		"expected service-level warning",
	);

	const entitySetWarnings = warnings.filter((w) =>
		w.type === "unsupported-concept" && w.field?.startsWith("entitySets"),
	);
	assert.equal(entitySetWarnings.length, 1);

	const enumTypeWarnings = warnings.filter((w) =>
		w.type === "unsupported-concept" && w.field?.startsWith("enumTypes"),
	);
	assert.equal(enumTypeWarnings.length, 1);

	const actionImportWarnings = warnings.filter((w) =>
		w.type === "unsupported-concept" && w.field?.startsWith("actionImports"),
	);
	assert.equal(actionImportWarnings.length, 1);

	const functionImportWarnings = warnings.filter((w) =>
		w.type === "unsupported-concept" && w.field?.startsWith("functionImports"),
	);
	assert.equal(functionImportWarnings.length, 1);

	// 2 returnType warnings (one for action, one for function)
	const returnTypeWarnings = warnings.filter((w) =>
		w.field?.includes("returnType"),
	);
	assert.equal(returnTypeWarnings.length, 2);

	// 2 parameter warnings (one for action, one for function)
	const paramWarnings = warnings.filter((w) =>
		w.field?.includes("parameters"),
	);
	assert.equal(paramWarnings.length, 2);
});

test("uses namespace from enrichment document for qualified selectors", () => {
	const source: ODataV4Enrichment = {
		protocol: "odatav4",
		namespace: "com.example.MyService",
		summary: "My Service",
		description: "A test service.",
		entityTypes: [
			{
				name: "Widget",
				summary: "A widget",
				description: "Represents a widget.",
			},
		],
	};

	const { overlay } = convertODataV4EnrichmentToOrd(source);

	assert.deepEqual(overlay.patches[0].selector, {
		entityType: "com.example.MyService.Widget",
	});
});

test("options.odataNamespace overrides the namespace from the document", () => {
	const source: ODataV4Enrichment = {
		protocol: "odatav4",
		namespace: "com.example.MyService",
		summary: "My Service",
		description: "A test service.",
		entityTypes: [
			{
				name: "Widget",
				summary: "A widget",
				description: "Represents a widget.",
			},
		],
	};

	const { overlay } = convertODataV4EnrichmentToOrd(source, {
		odataNamespace: "custom.Namespace",
	});

	assert.deepEqual(overlay.patches[0].selector, {
		entityType: "custom.Namespace.Widget",
	});
});

test("description is derived from namespace when no option is provided", () => {
	const source: ODataV4Enrichment = {
		protocol: "odatav4",
		namespace: "com.example.InvoiceService",
		summary: "Invoice Service",
		description: "Manages invoices.",
		entityTypes: [
			{ name: "Invoice", summary: "Invoice", description: "An invoice." },
		],
	};

	const { overlay } = convertODataV4EnrichmentToOrd(source);

	assert.ok(
		overlay.description?.includes("com.example.InvoiceService"),
		"description should reference the namespace",
	);
});

test("emits needs-spec-extension warning for service-level summary/description", () => {
	const source: ODataV4Enrichment = {
		protocol: "odatav4",
		namespace: "com.example.Svc",
		summary: "Svc",
		description: "A service.",
		entityTypes: [
			{ name: "Item", summary: "Item", description: "An item." },
		],
	};

	const { warnings } = convertODataV4EnrichmentToOrd(source);

	const schemaWarning = warnings.find((w) =>
		w.type === "needs-spec-extension" && w.field?.includes("root.summary"),
	);
	assert.ok(schemaWarning, "expected service-level needs-spec-extension warning");
});

test("complexType properties use qualified entityType name as context", () => {
	const source: ODataV4Enrichment = {
		protocol: "odatav4",
		namespace: "com.example.Svc",
		summary: "Svc",
		description: "A service.",
		complexTypes: [
			{
				name: "Address",
				summary: "Address",
				description: "A postal address.",
				properties: [
					{ name: "City", summary: "City name", description: "The city." },
				],
			},
		],
	};

	const { overlay } = convertODataV4EnrichmentToOrd(source);

	// ComplexType itself
	assert.deepEqual(overlay.patches[0].selector, {
		entityType: "com.example.Svc.Address",
	});
	// Property uses the qualified complex type name as entityType context
	assert.deepEqual(overlay.patches[1].selector, {
		propertyType: "City",
		entityType: "com.example.Svc.Address",
	});
});

test("actions and functions are converted with namespace-qualified operation selector", () => {
	const source: ODataV4Enrichment = {
		protocol: "odatav4",
		namespace: "com.example.Svc",
		summary: "Svc",
		description: "A service.",
		actions: [
			{ name: "Approve", summary: "Approve record", description: "Approves the record." },
		],
		functions: [
			{ name: "GetSummary", summary: "Get summary", description: "Reads a summary." },
		],
	};

	const { overlay } = convertODataV4EnrichmentToOrd(source);

	assert.equal(overlay.patches.length, 2);
	assert.deepEqual(overlay.patches[0].selector, {
		operation: "com.example.Svc.Approve",
	});
	assert.deepEqual(overlay.patches[1].selector, {
		operation: "com.example.Svc.GetSummary",
	});
});
