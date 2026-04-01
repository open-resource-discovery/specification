import assert from "node:assert/strict";
import test from "node:test";
import { convertODataV2EnrichmentToOrd } from "../convert-odata-v2";
import type { ODataV2Enrichment } from "../types";
import { loadLocalFixture } from "./test-helpers";

test("converts OData v2 entityTypes, entitySets and functionImports to ORD overlay patches", async () => {
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
	// - 1 entitySet (compensationInfo) = 1 patch
	// - 1 functionImport (getCompensationHistory) + 1 parameter = 2 patches
	// Total: 8 patches
	assert.equal(overlay.patches.length, 8);

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

	// entitySet patch
	const esPatch = overlay.patches[5];
	assert.deepEqual(esPatch.selector, { entitySet: "compensationInfo" });
	assert.equal(esPatch.action, "merge");

	// functionImport operation patch
	const fiPatch = overlay.patches[6];
	assert.deepEqual(fiPatch.selector, { operation: "getCompensationHistory" });
	assert.equal(fiPatch.action, "merge");
	assert.deepEqual(
		(fiPatch.data as Record<string, unknown>)["@Core.Description"],
		"Retrieve compensation history for an employee",
	);

	// functionImport parameter patch
	const paramPatch = overlay.patches[7];
	assert.deepEqual(paramPatch.selector, {
		parameter: "employeeId",
		operation: "getCompensationHistory",
	});

	// Warnings: no more entitySet skip, no more needs-spec-extension, no param skip
	// Only tag warnings remain (e.g. tags on entitySets produce lost-information warnings)
	const entitySetWarnings = warnings.filter((w) =>
		w.type === "unsupported-concept" && w.field?.startsWith("entitySets"),
	);
	assert.equal(entitySetWarnings.length, 0, "entitySet no longer produces unsupported-concept warnings");

	const fiSpecWarnings = warnings.filter(
		(w) => w.type === "needs-spec-extension",
	);
	assert.equal(fiSpecWarnings.length, 0, "functionImport no longer needs spec extension");

	const paramWarnings = warnings.filter((w) =>
		w.type === "unsupported-concept" && w.field?.includes("parameter"),
	);
	assert.equal(paramWarnings.length, 0, "parameters no longer produce warnings");

	// Tags are now preserved in patch.tags instead of being discarded
	const tagsWarnings = warnings.filter((w) => w.type === "lost-information");
	assert.equal(tagsWarnings.length, 0, "no lost-information warnings — tags go to patch.tags");

	// entityType patch should carry its tags in tags
	assert.deepEqual(etPatch.tags, ["Employee Central (EC)", "Compensation"]);
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

test("entitySets produce entitySet selector patches", () => {
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

	// No unsupported-concept warnings for entitySets anymore
	const entitySetWarnings = warnings.filter((w) =>
		w.type === "unsupported-concept" && w.field?.startsWith("entitySets"),
	);
	assert.equal(entitySetWarnings.length, 0);

	// 1 entityType + 2 entitySet patches = 3
	assert.equal(overlay.patches.length, 3);
	assert.deepEqual(overlay.patches[1].selector, { entitySet: "FooSet" });
	assert.deepEqual(overlay.patches[2].selector, { entitySet: "BarSet" });
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
