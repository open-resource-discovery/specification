import assert from "node:assert/strict";
import test from "node:test";
import { validateOverlay, validateOverlayWithTarget } from "../validate";
import {
	createOrdOverlay,
	createOverlayPatch,
} from "../../overlay-merge/tests/test-helpers";

test("validateOverlay returns valid result for valid overlay", () => {
	const overlay = createOrdOverlay({
		target: {
			definitionType: "openapi-v3",
		},
		patches: [
			createOverlayPatch({
				selector: {
					jsonPath: "$.info",
				},
				data: {
					title: "Patched",
				},
			}),
		],
	});

	const result = validateOverlay(overlay);

	assert.equal(result.valid, true);
	assert.deepEqual(result.errors, []);
});

test("validateOverlay returns errors for invalid overlay", () => {
	// Missing ordOverlay field
	const result = validateOverlay({ patches: [] } as never);

	assert.equal(result.valid, false);
	assert.ok(result.errors.length > 0);
	assert.ok(result.errors.some((e) => e.message.includes("ordOverlay")));
});

test("validateOverlay returns warnings for semantic issues", () => {
	const overlay = createOrdOverlay({
		perspective: "system-version", // Missing describedSystemVersion
		target: {
			definitionType: "openapi-v3",
		},
		patches: [
			createOverlayPatch({
				selector: {
					jsonPath: "$.info",
				},
				data: {
					title: "Patched",
				},
			}),
		],
	});

	const result = validateOverlay(overlay);

	assert.equal(result.valid, true);
	assert.ok(result.warnings.length > 0);
	assert.ok(
		result.warnings.some((w) => w.message.includes("describedSystemVersion")),
	);
});

test("validateOverlayWithTarget validates selector matches", () => {
	const overlay = createOrdOverlay({
		target: {
			definitionType: "openapi-v3",
		},
		patches: [
			createOverlayPatch({
				selector: {
					jsonPath: "$.info",
				},
				data: {
					title: "Patched",
				},
			}),
		],
	});

	const target = {
		openapi: "3.0.0",
		info: {
			title: "Original",
		},
	};

	const result = validateOverlayWithTarget(overlay, target, {
		definitionType: "openapi-v3",
	});

	assert.equal(result.valid, true);
	assert.ok(result.patchSummary !== undefined);
	assert.equal(result.patchSummary.length, 1);
	assert.equal(result.patchSummary[0].matchCount, 1);
	assert.equal(result.patchSummary[0].redundant, false);
});

test("validateOverlayWithTarget reports error for non-matching selector", () => {
	const overlay = createOrdOverlay({
		target: {
			definitionType: "openapi-v3",
		},
		patches: [
			createOverlayPatch({
				selector: {
					jsonPath: "$.nonexistent",
				},
				data: {
					title: "Patched",
				},
			}),
		],
	});

	const target = {
		openapi: "3.0.0",
		info: {
			title: "Original",
		},
	};

	const result = validateOverlayWithTarget(overlay, target, {
		definitionType: "openapi-v3",
	});

	assert.equal(result.valid, false);
	assert.ok(
		result.errors.some((e) => e.message.includes("does not match any element")),
	);
});

test("validateOverlayWithTarget detects redundant update patch", () => {
	const overlay = createOrdOverlay({
		target: {
			definitionType: "openapi-v3",
		},
		patches: [
			createOverlayPatch({
				action: "update",
				selector: {
					jsonPath: "$.info.title",
				},
				data: "Same Title",
			}),
		],
	});

	const target = {
		openapi: "3.0.0",
		info: {
			title: "Same Title",
		},
	};

	const result = validateOverlayWithTarget(overlay, target, {
		definitionType: "openapi-v3",
	});

	assert.equal(result.valid, true);
	assert.ok(result.patchSummary !== undefined);
	assert.equal(result.patchSummary[0].redundant, true);
	assert.ok(result.patchSummary[0].redundantDetails?.includes("identical"));
	assert.ok(result.warnings.some((w) => w.message.includes("Redundant")));
});

test("validateOverlayWithTarget detects redundant merge patch", () => {
	const overlay = createOrdOverlay({
		target: {
			definitionType: "openapi-v3",
		},
		patches: [
			createOverlayPatch({
				action: "merge",
				selector: {
					jsonPath: "$.info",
				},
				data: {
					title: "Existing Title",
				},
			}),
		],
	});

	const target = {
		openapi: "3.0.0",
		info: {
			title: "Existing Title",
			description: "Some description",
		},
	};

	const result = validateOverlayWithTarget(overlay, target, {
		definitionType: "openapi-v3",
	});

	assert.equal(result.valid, true);
	assert.ok(result.patchSummary !== undefined);
	assert.equal(result.patchSummary[0].redundant, true);
	assert.ok(result.patchSummary[0].redundantDetails?.includes("not change"));
});

test("validateOverlayWithTarget does not flag non-redundant merge", () => {
	const overlay = createOrdOverlay({
		target: {
			definitionType: "openapi-v3",
		},
		patches: [
			createOverlayPatch({
				action: "merge",
				selector: {
					jsonPath: "$.info",
				},
				data: {
					"x-new-field": "new value",
				},
			}),
		],
	});

	const target = {
		openapi: "3.0.0",
		info: {
			title: "Title",
		},
	};

	const result = validateOverlayWithTarget(overlay, target, {
		definitionType: "openapi-v3",
	});

	assert.equal(result.valid, true);
	assert.ok(result.patchSummary !== undefined);
	assert.equal(result.patchSummary[0].redundant, false);
});

test("validateOverlay warns on empty string values in patch data", () => {
	const overlay = createOrdOverlay({
		target: {
			definitionType: "openapi-v3",
		},
		patches: [
			createOverlayPatch({
				selector: {
					jsonPath: "$.info",
				},
				data: {
					description: "Valid description",
					"x-empty": "",
				},
			}),
		],
	});

	const result = validateOverlay(overlay);

	assert.equal(result.valid, true);
	assert.ok(
		result.warnings.some((w) => w.message.includes("empty string value")),
	);
	assert.ok(result.warnings.some((w) => w.message.includes("x-empty")));
});

test("validateOverlay warns on duplicate patches targeting same element", () => {
	const overlay = createOrdOverlay({
		target: {
			definitionType: "openapi-v3",
		},
		patches: [
			createOverlayPatch({
				selector: {
					jsonPath: "$.info",
				},
				data: {
					title: "First patch",
				},
			}),
			createOverlayPatch({
				selector: {
					jsonPath: "$.info",
				},
				data: {
					title: "Second patch - same selector",
				},
			}),
		],
	});

	const result = validateOverlay(overlay);

	assert.equal(result.valid, true);
	assert.ok(
		result.warnings.some((w) =>
			w.message.includes("Patches 1, 2 target the same element"),
		),
	);
});

test("validateOverlay does not warn on different selectors", () => {
	const overlay = createOrdOverlay({
		target: {
			definitionType: "openapi-v3",
		},
		patches: [
			createOverlayPatch({
				selector: {
					jsonPath: "$.info.title",
				},
				data: "Title",
			}),
			createOverlayPatch({
				selector: {
					jsonPath: "$.info.description",
				},
				data: "Description",
			}),
		],
	});

	const result = validateOverlay(overlay);

	assert.equal(result.valid, true);
	assert.ok(
		!result.warnings.some((w) => w.message.includes("Multiple patches")),
	);
});

test("validateOverlay does not warn on remove+merge pattern (valid array replacement)", () => {
	const overlay = createOrdOverlay({
		target: {
			definitionType: "openapi-v3",
		},
		patches: [
			createOverlayPatch({
				action: "remove",
				selector: {
					jsonPath: "$.info.tags",
				},
				data: {},
			}),
			createOverlayPatch({
				action: "merge",
				selector: {
					jsonPath: "$.info.tags",
				},
				data: ["new-tag"],
			}),
		],
	});

	const result = validateOverlay(overlay);

	assert.equal(result.valid, true);
	assert.ok(
		!result.warnings.some((w) => w.message.includes("target the same element")),
		"Should not warn on remove+merge pattern",
	);
});
