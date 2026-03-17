import assert from "node:assert/strict";
import test from "node:test";
import { convertODataV2EnrichmentToOrd } from "../convert-odata-v2";
import type { ODataV2Enrichment } from "../types";
import { loadLocalFixture } from "./test-helpers";

test("converts OData v2 entityTypes and properties to ORD overlay patches", async () => {
	const source =
		await loadLocalFixture<ODataV2Enrichment>("odata-v2-enrichment.json");

	const { overlay, warnings } = convertODataV2EnrichmentToOrd(source, {
		target: { definitionType: "edmx" },
	});

	assert.equal(overlay.ordOverlay, "0.1");
	assert.equal(overlay.target?.definitionType, "edmx");

	// Should produce patches for:
	// - 1 entityType (compensationInfo) + 2 properties = 3 patches
	// - 1 complexType (compensationPayComponents) + 1 property = 2 patches
	// - 1 entitySet = 0 patches (skipped)
	// - 1 functionImport = 1 patch (operation selector, with warning)
	// Total: 6 patches, 0 params patches (skipped)
	assert.equal(overlay.patches.length, 6);

	// entityType patch
	const etPatch = overlay.patches[0];
	assert.deepEqual(etPatch.selector, { entityType: "compensationInfo" });
	assert.equal(etPatch.action, "merge");
	assert.deepEqual(etPatch.data, {
		"@Core.Description": "Compensation information for employee assignments",
		"@Core.LongDescription":
			"Comprehensive compensation information for employee assignments including salary details, pay components, benefits, and related financial data with effective dating and historical tracking capabilities.",
	});

	// property patch on entityType
	const prop1Patch = overlay.patches[1];
	assert.deepEqual(prop1Patch.selector, {
		propertyType: "id",
		entityType: "compensationInfo",
	});
	assert.equal(prop1Patch.action, "merge");
	assert.deepEqual((prop1Patch.data as Record<string, unknown>)["@Core.Description"],
		"Unique identifier for the employee assignment",
	);

	// complexType patch
	const ctPatch = overlay.patches[3];
	assert.deepEqual(ctPatch.selector, {
		entityType: "compensationPayComponents",
	});
	assert.equal(ctPatch.action, "merge");

	// functionImport patch
	const fiPatch = overlay.patches[5];
	assert.deepEqual(fiPatch.selector, { operation: "getCompensationHistory" });
	assert.equal(fiPatch.action, "merge");
	assert.deepEqual(
		(fiPatch.data as Record<string, unknown>)["@Core.Description"],
		"Retrieve compensation history for an employee",
	);

	// Warnings: entitySet skip, functionImport needs-spec-extension, 2x tags, 1x parameters
	const entitySetWarnings = warnings.filter((w) =>
		w.field?.startsWith("entitySets"),
	);
	assert.equal(entitySetWarnings.length, 1);
	assert.equal(entitySetWarnings[0].type, "unsupported-concept");

	const fiWarnings = warnings.filter(
		(w) => w.type === "needs-spec-extension",
	);
	assert.equal(fiWarnings.length, 1);

	const tagsWarnings = warnings.filter((w) => w.type === "lost-information");
	assert.ok(tagsWarnings.length >= 2, "expected at least 2 tag warnings");

	const paramWarnings = warnings.filter((w) =>
		w.field?.includes("parameters"),
	);
	assert.equal(paramWarnings.length, 1);
	assert.equal(paramWarnings[0].type, "unsupported-concept");
});

test("uses namespace-qualified selectors when odataNamespace is provided", () => {
	const source: ODataV2Enrichment = {
		protocol: "odatav2",
		entityTypes: [
			{
				name: "Employee",
				summary: "An employee record",
				description: "Represents an employee in the HR system.",
			},
		],
	};

	const { overlay } = convertODataV2EnrichmentToOrd(source, {
		odataNamespace: "SFSF.EC",
	});

	assert.deepEqual(overlay.patches[0].selector, {
		entityType: "SFSF.EC.Employee",
	});
});

test("uses unqualified names when no namespace is provided", () => {
	const source: ODataV2Enrichment = {
		protocol: "odatav2",
		entityTypes: [
			{
				name: "Employee",
				summary: "An employee record",
				description: "Represents an employee in the HR system.",
			},
		],
	};

	const { overlay } = convertODataV2EnrichmentToOrd(source);

	assert.deepEqual(overlay.patches[0].selector, { entityType: "Employee" });
});

test("emits unsupported-concept warning for each entitySet", () => {
	const source: ODataV2Enrichment = {
		protocol: "odatav2",
		entityTypes: [
			{
				name: "Foo",
				summary: "Foo",
				description: "Foo entity.",
			},
		],
		entitySets: [
			{ name: "FooSet", summary: "Foo set", description: "Collection of Foo." },
			{ name: "BarSet", summary: "Bar set", description: "Collection of Bar." },
		],
	};

	const { overlay, warnings } = convertODataV2EnrichmentToOrd(source);

	const entitySetWarnings = warnings.filter((w) =>
		w.type === "unsupported-concept" && w.field?.startsWith("entitySets"),
	);
	assert.equal(entitySetWarnings.length, 2);

	// The 1 entityType should still produce a patch
	assert.equal(overlay.patches.length, 1);
});

test("converts complexType properties using entityType selector with complex type name", () => {
	const source: ODataV2Enrichment = {
		protocol: "odatav2",
		complexTypes: [
			{
				name: "Address",
				summary: "Postal address",
				description: "Represents a postal address.",
				properties: [
					{
						name: "Street",
						summary: "Street name and number",
						description: "The street portion of the address.",
					},
				],
			},
		],
	};

	const { overlay } = convertODataV2EnrichmentToOrd(source);

	assert.equal(overlay.patches.length, 2);
	// ComplexType itself
	assert.deepEqual(overlay.patches[0].selector, { entityType: "Address" });
	// Property on complex type uses entityType name as context
	assert.deepEqual(overlay.patches[1].selector, {
		propertyType: "Street",
		entityType: "Address",
	});
});

test("converts the shipped compensationInfo.json example from the repository", async () => {
	const source = await loadLocalFixture<ODataV2Enrichment>(
		"odata-v2-enrichment.json",
	);

	// Use the real example from the repo to verify round-trip integrity
	const { overlay } = convertODataV2EnrichmentToOrd(source, {
		odataNamespace: "com.sap.sfsf.ec",
		target: {
			url: "https://example.sap.com/odata/v2/$metadata",
			definitionType: "edmx",
		},
	});

	// Verify qualified names are emitted
	const etPatch = overlay.patches[0];
	assert.deepEqual(etPatch.selector, {
		entityType: "com.sap.sfsf.ec.compensationInfo",
	});

	// All patches have @Core.Description and @Core.LongDescription
	for (const patch of overlay.patches) {
		if (patch.action === "merge") {
			const data = patch.data as Record<string, unknown>;
			assert.ok(
				"@Core.Description" in data || "@Core.LongDescription" in data,
				`patch missing annotation data: ${JSON.stringify(patch.selector)}`,
			);
		}
	}
});
