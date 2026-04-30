import assert from "node:assert/strict";
import test from "node:test";
import { convertOpenApiOverlayToOrd } from "../convert-openapi-overlay";
import type { OpenApiOverlay } from "../types";
import { loadLocalFixture } from "./test-helpers";

test("converts a standard OpenAPI overlay to ORD overlay format", async () => {
	const source = await loadLocalFixture<OpenApiOverlay>(
		"openapi-overlay-input.json",
	);

	const { overlay, warnings } = convertOpenApiOverlayToOrd(source);

	// Result must be a valid ORD overlay structure
	assert.equal(overlay.ordOverlay, "0.1");
	assert.equal(
		overlay.$schema,
		"https://open-resource-discovery.org/spec-v1/interfaces/OrdOverlay.schema.json#",
	);

	// target.url should be derived from source.extends
	assert.deepEqual(overlay.target, {
		url: "https://example.com/astronomy-api/openapi.json",
	});

	// description should be derived from info.title and info.version
	assert.ok(
		overlay.description?.includes("Astronomy API Enrichment"),
		"description should reference the source title",
	);

	// 3 actions with `update` (no-op remove excluded) + 1 action with `remove: true` = 4 patches
	// action with `remove: false` should be silently skipped
	assert.equal(overlay.patches.length, 4);

	// First patch: update on $.info
	const patch0 = overlay.patches[0];
	assert.deepEqual(patch0.selector, { jsonPath: "$.info" });
	assert.equal(patch0.action, "merge");
	assert.deepEqual(patch0.data, {
		"x-ai-ready": true,
		"x-purpose":
			"Provides constellation and star data for astronomy applications.",
	});
	// description from the source action should be preserved on the patch
	assert.equal(patch0.description, "Add AI-usage note to info block");

	// Second patch: update on deprecated endpoint
	const patch1 = overlay.patches[1];
	assert.deepEqual(patch1.selector, {
		jsonPath: "$.paths./constellations/{abbreviation}.get",
	});
	assert.equal(patch1.action, "merge");
	assert.equal(
		patch1.description,
		"Deprecate the old abbreviation-based endpoint",
	);

	// Third patch: update on schema property (no action description in fixture)
	const patch2 = overlay.patches[2];
	assert.deepEqual(patch2.selector, {
		jsonPath: "$.components.schemas.Star.properties.magnitude",
	});
	assert.equal(patch2.action, "merge");
	assert.equal(patch2.description, undefined);

	// Fourth patch: remove action (no action description in fixture)
	const patch3 = overlay.patches[3];
	assert.deepEqual(patch3.selector, {
		jsonPath: "$.components.schemas.ObsoleteSchema",
	});
	assert.equal(patch3.action, "remove");
	assert.equal(patch3.data, undefined);

	// No warnings — action descriptions are now preserved on patches, not discarded
	assert.equal(warnings.length, 0);
});

test("remove: false action is silently skipped", () => {
	const source: OpenApiOverlay = {
		overlay: "1.1.0",
		actions: [
			{ target: "$.info", remove: false },
			{ target: "$.paths", update: { "x-note": "kept" } },
		],
	};

	const { overlay, warnings } = convertOpenApiOverlayToOrd(source);

	// Only the update action should produce a patch
	assert.equal(overlay.patches.length, 1);
	assert.equal(overlay.patches[0].action, "merge");

	// No warnings for the no-op remove: false
	assert.equal(warnings.length, 0);
});

test("action with both update and remove produces two ordered patches", () => {
	const source: OpenApiOverlay = {
		overlay: "1.1.0",
		actions: [
			{
				target: "$.info",
				description: "Update and then remove",
				update: { "x-updated": true },
				remove: true,
			},
		],
	};

	const { overlay } = convertOpenApiOverlayToOrd(source);

	assert.equal(overlay.patches.length, 2);
	assert.equal(overlay.patches[0].action, "merge");
	assert.deepEqual(overlay.patches[0].data, { "x-updated": true });
	// description goes on the first (merge) patch only
	assert.equal(overlay.patches[0].description, "Update and then remove");
	assert.equal(overlay.patches[1].action, "remove");
	assert.equal(overlay.patches[1].data, undefined);
	assert.equal(overlay.patches[1].description, undefined);
});

test("explicit options override derived values", () => {
	const source: OpenApiOverlay = {
		overlay: "1.1.0",
		extends: "https://original.invalid/api.json",
		info: { title: "Should be ignored" },
		actions: [{ target: "$", update: { "x-test": 1 } }],
	};

	const { overlay } = convertOpenApiOverlayToOrd(source, {
		ordId: "sap.foo:overlay:my-api:v1",
		description: "My custom description",
		target: {
			ordId: "sap.foo:apiResource:my-api:v1",
			definitionType: "openapi-v3",
		},
	});

	assert.equal(overlay.ordId, "sap.foo:overlay:my-api:v1");
	assert.equal(overlay.description, "My custom description");
	assert.deepEqual(overlay.target, {
		ordId: "sap.foo:apiResource:my-api:v1",
		definitionType: "openapi-v3",
	});
});

test("throws when conversion produces zero patches", () => {
	const source: OpenApiOverlay = {
		overlay: "1.1.0",
		actions: [{ target: "$.info", remove: false }],
	};

	assert.throws(() => {
		convertOpenApiOverlayToOrd(source);
	}, /zero patches/);
});

test("converts the real compensationInfo OData v2 example as OpenAPI overlay source does not apply", () => {
	// This is just a structural check with a minimal real-world-like input
	const source: OpenApiOverlay = {
		overlay: "1.0.0",
		info: { title: "S/4HANA Business Partner Overlay", version: "2.0.0" },
		actions: [
			{
				target: "$.paths./A_BusinessPartner.get",
				update: {
					description: "Retrieve business partners matching filter criteria.",
				},
			},
			{
				target:
					"$.components.schemas.A_BusinessPartnerType.properties.LegacyField",
				remove: true,
			},
		],
	};

	const { overlay, warnings } = convertOpenApiOverlayToOrd(source, {
		target: {
			ordId: "sap.s4:apiResource:OP_API_BUSINESS_PARTNER_SRV:v1",
			definitionType: "openapi-v3",
		},
	});

	assert.equal(overlay.patches.length, 2);
	assert.equal(overlay.patches[0].action, "merge");
	assert.equal(overlay.patches[1].action, "remove");

	// No description warnings because neither action has a `description`
	assert.equal(warnings.length, 0);
});
