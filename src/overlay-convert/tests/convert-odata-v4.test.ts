import assert from "node:assert/strict";
import test from "node:test";
import { convertODataV4EnrichmentToOrd } from "../convert-odata-v4";
import type { ODataV4Enrichment } from "../types";
import { loadLocalFixture } from "./test-helpers";

test("converts OData v4 enrichment to ORD overlay patches using all new selectors", async () => {
	const source = await loadLocalFixture<ODataV4Enrichment>(
		"odata-v4-enrichment.json",
	);

	const { overlay, warnings } = convertODataV4EnrichmentToOrd(source, {
		target: { definitionType: "edmx" },
	});

	assert.equal(overlay.ordOverlay, "0.1");
	assert.equal(overlay.target?.definitionType, "edmx");

	// Expected patches (with compact recursive format):
	// - 1 namespace patch (service-level summary/description)
	// - 1 entityType (Employee with nested properties)
	// - 1 complexType (AddressInfo with nested properties)
	// - 1 entitySet (Employees)
	// - 1 enumType (EmploymentStatus with nested members)
	// - 1 action (TerminateEmployee) + 2 params + 1 returnType = 4
	// - 1 function (GetDirectReports) + 1 param + 1 returnType = 3
	// - 1 actionImport (TerminateEmployeeImport — no matching actions[] entry) = 1 patch + warning
	// - 1 functionImport (GetDirectReportsImport — no matching functions[] entry) = 1 patch + warning
	// Total = 14 patches (properties/members are nested in their parent type's data)
	assert.equal(overlay.patches.length, 14);

	// patch[0]: namespace selector for service-level description
	const nsPatch = overlay.patches[0];
	assert.deepEqual(nsPatch.selector, { namespace: "com.sap.HRService" });

	// patch[1]: entityType patch with nested property annotations
	const etPatch = overlay.patches[1];
	assert.deepEqual(etPatch.selector, {
		entityType: "com.sap.HRService.Employee",
	});
	assert.equal(etPatch.action, "merge");
	// Verify entity-level annotations
	assert.equal(
		(etPatch.data as Record<string, unknown>)["@Core.Description"],
		"Employee master record",
	);
	// Verify nested property annotations (compact format)
	const employeeIdAnnotation = (etPatch.data as Record<string, unknown>)
		.EmployeeId as Record<string, unknown>;
	assert.equal(
		employeeIdAnnotation?.["@Core.Description"],
		"Unique employee identifier",
	);

	// patch[2]: complexType patch with nested property annotations
	const ctPatch = overlay.patches[2];
	assert.deepEqual(ctPatch.selector, {
		complexType: "com.sap.HRService.AddressInfo",
	});
	// Verify nested property annotation
	const countryAnnotation = (ctPatch.data as Record<string, unknown>)
		.Country as Record<string, unknown>;
	assert.equal(countryAnnotation?.["@Core.Description"], "ISO country code");

	// patch[3]: entitySet patch
	assert.deepEqual(overlay.patches[3].selector, {
		entitySet: "Employees",
	});

	// patch[4]: enumType patch with nested member annotations
	const enumPatch = overlay.patches[4];
	assert.deepEqual(enumPatch.selector, {
		enumType: "com.sap.HRService.EmploymentStatus",
	});
	// Verify nested member annotation
	const activeAnnotation = (enumPatch.data as Record<string, unknown>)
		.Active as Record<string, unknown>;
	assert.equal(activeAnnotation?.["@Core.Description"], "Currently employed");

	// patch[5]: action operation patch
	assert.deepEqual(overlay.patches[5].selector, {
		operation: "com.sap.HRService.TerminateEmployee",
	});

	// patch[6]: first parameter of TerminateEmployee
	assert.deepEqual(overlay.patches[6].selector, {
		parameter: "EmployeeId",
		operation: "com.sap.HRService.TerminateEmployee",
	});

	// patch[8]: returnType of TerminateEmployee
	assert.deepEqual(overlay.patches[8].selector, {
		returnType: true,
		operation: "com.sap.HRService.TerminateEmployee",
	});

	// patch[9]: function operation patch
	assert.deepEqual(overlay.patches[9].selector, {
		operation: "com.sap.HRService.GetDirectReports",
	});

	// Warnings: only actionImport and functionImport remain (tags may also appear)
	const serviceWarnings = warnings.filter((w) =>
		w.field?.includes("root.summary"),
	);
	assert.equal(
		serviceWarnings.length,
		0,
		"service-level should emit a patch, not a warning",
	);

	const entitySetWarnings = warnings.filter(
		(w) =>
			w.type === "unsupported-concept" && w.field?.startsWith("entitySets"),
	);
	assert.equal(
		entitySetWarnings.length,
		0,
		"entitySet should emit a patch, not an unsupported-concept warning",
	);

	const enumTypeWarnings = warnings.filter((w) =>
		w.field?.startsWith("enumTypes"),
	);
	assert.equal(
		enumTypeWarnings.length,
		0,
		"enumType should emit patches, not warnings",
	);

	const paramWarnings = warnings.filter(
		(w) => w.type === "unsupported-concept" && w.field?.includes("parameter"),
	);
	assert.equal(
		paramWarnings.length,
		0,
		"parameters should emit patches, not warnings",
	);

	const returnTypeWarnings = warnings.filter(
		(w) => w.type === "unsupported-concept" && w.field?.includes("returnType"),
	);
	assert.equal(
		returnTypeWarnings.length,
		0,
		"returnType should emit patches, not warnings",
	);

	// patch[12]: actionImport fallback patch (no matching actions[] entry)
	assert.deepEqual(overlay.patches[12].selector, {
		operation: "com.sap.HRService.TerminateEmployeeImport",
	});

	// patch[13]: functionImport fallback patch (no matching functions[] entry)
	assert.deepEqual(overlay.patches[13].selector, {
		operation: "com.sap.HRService.GetDirectReportsImport",
	});

	// Warnings: actionImport and functionImport both produce needs-spec-extension (no matching op)
	const actionImportWarnings = warnings.filter((w) =>
		w.field?.startsWith("actionImports"),
	);
	assert.equal(actionImportWarnings.length, 1);
	assert.equal(actionImportWarnings[0].type, "needs-spec-extension");

	const functionImportWarnings = warnings.filter((w) =>
		w.field?.startsWith("functionImports"),
	);
	assert.equal(functionImportWarnings.length, 1);
	assert.equal(functionImportWarnings[0].type, "needs-spec-extension");
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
		entityTypes: [{ name: "Item", summary: "Item", description: "An item." }],
	};

	const { overlay, warnings } = convertODataV4EnrichmentToOrd(source);

	// First patch should be namespace selector
	assert.deepEqual(overlay.patches[0].selector, {
		namespace: "com.example.Svc",
	});
	assert.deepEqual(overlay.patches[0].data, {
		"@Core.Description": "Svc",
		"@Core.LongDescription": "A service.",
	});

	// No needs-spec-extension warning for root.summary anymore
	const schemaWarning = warnings.find(
		(w) =>
			w.type === "needs-spec-extension" && w.field?.includes("root.summary"),
	);
	assert.equal(
		schemaWarning,
		undefined,
		"service-level should no longer emit a warning",
	);
});

test("complexType uses complexType selector with nested property annotations", () => {
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

	// patch[0] = namespace, patch[1] = complexType (with nested properties)
	assert.equal(overlay.patches.length, 2);
	assert.deepEqual(overlay.patches[1].selector, {
		complexType: "com.example.Svc.Address",
	});
	// Property is nested inside the complexType data (compact format)
	const cityAnnotation = (overlay.patches[1].data as Record<string, unknown>)
		.City as Record<string, unknown>;
	assert.equal(cityAnnotation?.["@Core.Description"], "City name");
	assert.equal(cityAnnotation?.["@Core.LongDescription"], "The city.");
});

test("actions and functions are converted with namespace-qualified operation selector", () => {
	const source: ODataV4Enrichment = {
		protocol: "odatav4",
		namespace: "com.example.Svc",
		summary: "Svc",
		description: "A service.",
		actions: [
			{
				name: "Approve",
				summary: "Approve record",
				description: "Approves the record.",
			},
		],
		functions: [
			{
				name: "GetSummary",
				summary: "Get summary",
				description: "Reads a summary.",
			},
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

test("actionImport with matching actions[] entry and same description produces no extra patch and no warning", () => {
	const source: ODataV4Enrichment = {
		protocol: "odatav4",
		namespace: "com.example.Svc",
		summary: "Svc",
		description: "A service.",
		actions: [
			{
				name: "Approve",
				summary: "Approve record",
				description: "Approves the record.",
			},
		],
		actionImports: [
			{
				name: "Approve",
				summary: "Approve record",
				description: "Approves the record.",
			},
		],
	};

	const { overlay, warnings } = convertODataV4EnrichmentToOrd(source);

	// patch[0] = namespace, patch[1] = Approve — no extra import patch
	assert.equal(overlay.patches.length, 2);
	assert.deepEqual(overlay.patches[1].selector, {
		operation: "com.example.Svc.Approve",
	});
	assert.equal(
		warnings.filter((w) => w.field?.startsWith("actionImports")).length,
		0,
	);
});

test("actionImport with matching actions[] entry but different description emits lost-information warning, op description wins", () => {
	const source: ODataV4Enrichment = {
		protocol: "odatav4",
		namespace: "com.example.Svc",
		summary: "Svc",
		description: "A service.",
		actions: [
			{
				name: "Approve",
				summary: "Approve record",
				description: "Approves the record.",
			},
		],
		actionImports: [
			{
				name: "Approve",
				summary: "Action import for Approve.",
				description: "Exposes Approve via container.",
			},
		],
	};

	const { overlay, warnings } = convertODataV4EnrichmentToOrd(source);

	// No extra patch — import is merged onto the existing op patch
	assert.equal(overlay.patches.length, 2);

	// Op description is preserved unchanged — import description loses
	const opPatch = overlay.patches[1];
	assert.deepEqual(opPatch.data, {
		"@Core.Description": "Approve record",
		"@Core.LongDescription": "Approves the record.",
	});

	// A lost-information warning is emitted
	const importWarnings = warnings.filter((w) =>
		w.field?.startsWith("actionImports"),
	);
	assert.equal(importWarnings.length, 1);
	assert.equal(importWarnings[0].type, "lost-information");
});
