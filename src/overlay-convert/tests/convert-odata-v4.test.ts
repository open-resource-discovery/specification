import assert from "node:assert/strict";
import test from "node:test";
import { convertODataV4EnrichmentToOrd } from "../convert-odata-v4";
import type { ODataV4Enrichment } from "../types";
import { loadLocalFixture } from "./test-helpers";

test("converts OData v4 enrichment to ORD overlay patches using all new selectors", async () => {
	const source =
		await loadLocalFixture<ODataV4Enrichment>("odata-v4-enrichment.json");

	const { overlay, warnings } = convertODataV4EnrichmentToOrd(source, {
		target: { definitionType: "edmx" },
	});

	assert.equal(overlay.ordOverlay, "0.1");
	assert.equal(overlay.target?.definitionType, "edmx");

	// Expected patches:
	// - 1 namespace patch (service-level summary/description)
	// - 1 entityType (Employee) + 2 properties = 3
	// - 1 complexType (AddressInfo) + 1 property = 2
	// - 1 entitySet (Employees) = 1
	// - 1 enumType (EmploymentStatus) + 2 members = 3
	// - 1 action (TerminateEmployee) + 2 params + 1 returnType = 4
	// - 1 function (GetDirectReports) + 1 param + 1 returnType = 3
	// - 1 actionImport = 0 (skipped)
	// - 1 functionImport = 0 (skipped)
	// Total = 17 patches
	assert.equal(overlay.patches.length, 17);

	// patch[0]: namespace selector for service-level description
	const nsPatch = overlay.patches[0];
	assert.deepEqual(nsPatch.selector, { namespace: "com.sap.HRService" });

	// patch[1]: entityType patch uses namespace-qualified name
	const etPatch = overlay.patches[1];
	assert.deepEqual(etPatch.selector, {
		entityType: "com.sap.HRService.Employee",
	});
	assert.equal(etPatch.action, "merge");
	assert.deepEqual(etPatch.data, {
		"@Core.Description": "Employee master record",
		"@Core.LongDescription":
			"Represents a single employee in the HR system. Contains identification, personal data, job assignment, and employment status.",
	});

	// patch[2]: property EmployeeId on Employee
	assert.deepEqual(overlay.patches[2].selector, {
		propertyType: "EmployeeId",
		entityType: "com.sap.HRService.Employee",
	});

	// patch[4]: complexType patch
	assert.deepEqual(overlay.patches[4].selector, {
		entityType: "com.sap.HRService.AddressInfo",
	});

	// patch[6]: entitySet patch
	assert.deepEqual(overlay.patches[6].selector, {
		entitySet: "Employees",
	});

	// patch[7]: enumType patch (via entityType selector)
	assert.deepEqual(overlay.patches[7].selector, {
		entityType: "com.sap.HRService.EmploymentStatus",
	});

	// patch[8]: first enum member
	assert.deepEqual((overlay.patches[8].selector as unknown as Record<string, unknown>).propertyType, "Active");
	assert.deepEqual((overlay.patches[8].selector as unknown as Record<string, unknown>).entityType, "com.sap.HRService.EmploymentStatus");

	// patch[10]: action operation patch
	assert.deepEqual(overlay.patches[10].selector, {
		operation: "com.sap.HRService.TerminateEmployee",
	});

	// patch[11]: first parameter of TerminateEmployee
	assert.deepEqual(overlay.patches[11].selector, {
		parameter: "EmployeeId",
		operation: "com.sap.HRService.TerminateEmployee",
	});

	// patch[13]: returnType of TerminateEmployee
	assert.deepEqual(overlay.patches[13].selector, {
		returnType: true,
		operation: "com.sap.HRService.TerminateEmployee",
	});

	// patch[14]: function operation patch
	assert.deepEqual(overlay.patches[14].selector, {
		operation: "com.sap.HRService.GetDirectReports",
	});

	// Warnings: only actionImport and functionImport remain (tags may also appear)
	const serviceWarnings = warnings.filter((w) =>
		w.field?.includes("root.summary"),
	);
	assert.equal(serviceWarnings.length, 0, "service-level should emit a patch, not a warning");

	const entitySetWarnings = warnings.filter((w) =>
		w.type === "unsupported-concept" && w.field?.startsWith("entitySets"),
	);
	assert.equal(entitySetWarnings.length, 0, "entitySet should emit a patch, not an unsupported-concept warning");

	const enumTypeWarnings = warnings.filter((w) =>
		w.field?.startsWith("enumTypes"),
	);
	assert.equal(enumTypeWarnings.length, 0, "enumType should emit patches, not warnings");

	const paramWarnings = warnings.filter((w) =>
		w.type === "unsupported-concept" && w.field?.includes("parameter"),
	);
	assert.equal(paramWarnings.length, 0, "parameters should emit patches, not warnings");

	const returnTypeWarnings = warnings.filter((w) =>
		w.type === "unsupported-concept" && w.field?.includes("returnType"),
	);
	assert.equal(returnTypeWarnings.length, 0, "returnType should emit patches, not warnings");

	const actionImportWarnings = warnings.filter((w) =>
		w.field?.startsWith("actionImports"),
	);
	assert.equal(actionImportWarnings.length, 1);

	const functionImportWarnings = warnings.filter((w) =>
		w.field?.startsWith("functionImports"),
	);
	assert.equal(functionImportWarnings.length, 1);
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

	// patch[0] = namespace, patch[1] = entityType
	assert.deepEqual(overlay.patches[1].selector, {
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

	// patch[0] = namespace, patch[1] = entityType
	assert.deepEqual(overlay.patches[1].selector, {
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

test("service-level summary/description produce a namespace selector patch", () => {
	const source: ODataV4Enrichment = {
		protocol: "odatav4",
		namespace: "com.example.Svc",
		summary: "Svc",
		description: "A service.",
		entityTypes: [
			{ name: "Item", summary: "Item", description: "An item." },
		],
	};

	const { overlay, warnings } = convertODataV4EnrichmentToOrd(source);

	// First patch should be namespace selector
	assert.deepEqual(overlay.patches[0].selector, { namespace: "com.example.Svc" });
	assert.deepEqual(overlay.patches[0].data, {
		"@Core.Description": "Svc",
		"@Core.LongDescription": "A service.",
	});

	// No needs-spec-extension warning for root.summary anymore
	const schemaWarning = warnings.find((w) =>
		w.type === "needs-spec-extension" && w.field?.includes("root.summary"),
	);
	assert.equal(schemaWarning, undefined, "service-level should no longer emit a warning");
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

	// patch[0] = namespace, patch[1] = complexType, patch[2] = property
	assert.deepEqual(overlay.patches[1].selector, {
		entityType: "com.example.Svc.Address",
	});
	// Property uses the qualified complex type name as entityType context
	assert.deepEqual(overlay.patches[2].selector, {
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

	// patch[0] = namespace, patch[1] = Approve, patch[2] = GetSummary
	assert.equal(overlay.patches.length, 3);
	assert.deepEqual(overlay.patches[1].selector, {
		operation: "com.example.Svc.Approve",
	});
	assert.deepEqual(overlay.patches[2].selector, {
		operation: "com.example.Svc.GetSummary",
	});
});
