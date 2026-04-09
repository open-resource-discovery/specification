/**
 * ORD Overlay Validation Module
 *
 * Provides programmatic validation of ORD Overlay documents.
 * Can validate overlay schema/semantics alone, or also validate
 * selector matching and detect redundant patches against a target document.
 */

import type { ORDOverlay } from "../generated/spec/v1/types";
import { applyOverlayToEdmxDocument } from "../overlay-merge/edmx";
import {
	type NodeReference,
	resolveSelector,
} from "../overlay-merge/selectors";
import {
	cloneJSONValue,
	isJSONObject,
	type JSONValue,
	type OverlayMergeContext,
} from "../overlay-merge/types";
import {
	type OverlayValidationIssue,
	type OverlayValidationResult,
	validateOverlayInput,
	validateTargetDocumentForDefinitionType,
} from "../overlay-merge/validation";

/**
 * Summary of validation result for a single patch.
 */
export interface PatchValidationSummary {
	/** Zero-based index of the patch in the overlay */
	patchIndex: number;
	/** The selector used in the patch */
	selector: unknown;
	/** Number of elements matched by the selector (-1 if not determinable) */
	matchCount: number;
	/** Whether the patch is redundant (would not change the target) */
	redundant: boolean;
	/** Human-readable explanation of why the patch is redundant */
	redundantDetails?: string | undefined;
}

/**
 * Result of overlay validation.
 */
export interface OverlayFullValidationResult {
	/** Whether the overlay is valid (no errors) */
	valid: boolean;
	/** Validation errors that indicate invalid overlay */
	errors: OverlayValidationIssue[];
	/** Validation warnings (overlay is valid but has issues) */
	warnings: OverlayValidationIssue[];
	/** Per-patch validation summaries (only when target is provided) */
	patchSummary?: PatchValidationSummary[] | undefined;
}

/**
 * Options for validating an overlay.
 */
export interface ValidateOverlayOptions {
	/** Context for validation (ordId, url, definitionType) */
	context?: OverlayMergeContext;
}

/**
 * Options for validating an overlay against a target document.
 */
export interface ValidateOverlayWithTargetOptions
	extends ValidateOverlayOptions {
	/** The definition type of the target document */
	definitionType?: string | undefined;
}

/**
 * Validates an ORD Overlay document for schema conformance and semantic correctness.
 *
 * This is the programmatic API for overlay validation. Use this when you want to
 * validate an overlay without applying it.
 *
 * @param overlay - The ORD Overlay document to validate
 * @param options - Validation options
 * @returns Validation result with errors, warnings, and validity status
 *
 * @example
 * ```typescript
 * import { validateOverlay } from './overlay-validate/validate';
 *
 * const overlay = JSON.parse(fs.readFileSync('overlay.json', 'utf8'));
 * const result = validateOverlay(overlay);
 *
 * if (!result.valid) {
 *   console.error('Validation errors:', result.errors);
 * }
 * ```
 */
export function validateOverlay(
	overlay: ORDOverlay,
	options: ValidateOverlayOptions = {},
): OverlayFullValidationResult {
	const validation = validateOverlayInput(overlay, {
		context: options.context,
	});

	const result: OverlayFullValidationResult = {
		valid: validation.errors.length === 0,
		errors: validation.errors,
		warnings: validation.warnings,
	};

	// Additional overlay-level validations
	checkEmptyDataValues(overlay, result);
	checkDuplicatePatches(overlay, result);

	return result;
}

/**
 * Validates an ORD Overlay against a target JSON document.
 *
 * In addition to schema and semantic validation, this function:
 * - Validates that all selectors match at least one element in the target
 * - Detects redundant patches that would not change the target
 *
 * @param overlay - The ORD Overlay document to validate
 * @param targetDocument - The target JSON document to validate against
 * @param options - Validation options
 * @returns Validation result with errors, warnings, patch summaries, and validity status
 *
 * @example
 * ```typescript
 * import { validateOverlayWithTarget } from './overlay-validate/validate';
 *
 * const overlay = JSON.parse(fs.readFileSync('overlay.json', 'utf8'));
 * const target = JSON.parse(fs.readFileSync('openapi.json', 'utf8'));
 *
 * const result = validateOverlayWithTarget(overlay, target, {
 *   definitionType: 'openapi-v3',
 * });
 *
 * if (!result.valid) {
 *   console.error('Validation errors:', result.errors);
 * }
 *
 * // Check for redundant patches
 * result.patchSummary?.forEach((summary, i) => {
 *   if (summary.redundant) {
 *     console.warn(`Patch ${i + 1} is redundant: ${summary.redundantDetails}`);
 *   }
 * });
 * ```
 */
export function validateOverlayWithTarget(
	overlay: ORDOverlay,
	targetDocument: JSONValue,
	options: ValidateOverlayWithTargetOptions = {},
): OverlayFullValidationResult {
	const result = validateOverlay(overlay, options);

	const definitionType =
		options.definitionType ??
		(typeof overlay.target?.definitionType === "string"
			? overlay.target.definitionType
			: undefined);

	// Validate target document shape
	const targetValidation = validateTargetDocumentForDefinitionType(
		targetDocument,
		definitionType,
		overlay,
	);
	result.errors.push(...targetValidation);
	if (targetValidation.length > 0) {
		result.valid = false;
	}

	// Validate each patch against the target
	result.patchSummary = validatePatches(
		overlay,
		targetDocument,
		definitionType,
		result,
	);

	return result;
}

/**
 * Validates an ORD Overlay against an EDMX/XML target document.
 *
 * EDMX validation is performed via a dry-run merge that captures warnings.
 *
 * @param overlay - The ORD Overlay document to validate
 * @param edmxContent - The EDMX XML content as a string
 * @param options - Validation options
 * @returns Validation result with errors, warnings, patch summaries, and validity status
 */
export function validateOverlayWithEdmxTarget(
	overlay: ORDOverlay,
	edmxContent: string,
	options: ValidateOverlayOptions = {},
): OverlayFullValidationResult {
	const result = validateOverlay(overlay, options);

	// For EDMX/XML targets, perform a dry-run merge to capture warnings
	try {
		const warnings = captureEdmxValidationWarnings(edmxContent, overlay);
		for (const warning of warnings) {
			result.warnings.push({
				level: "warning",
				path: warning.path,
				message: warning.message,
			});
		}

		// For XML, we can't easily provide patch-level match counts
		result.patchSummary = overlay.patches.map((patch, index) => ({
			patchIndex: index,
			selector: patch.selector,
			matchCount: -1, // Unknown for XML
			redundant: false,
		}));
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		result.errors.push({
			level: "error",
			path: "$",
			message: `EDMX validation failed: ${message}`,
		});
		result.valid = false;
	}

	return result;
}

/**
 * Validates each patch in the overlay against the target document.
 */
function validatePatches(
	overlay: ORDOverlay,
	targetDocument: JSONValue,
	definitionType: string | undefined,
	result: OverlayFullValidationResult,
): PatchValidationSummary[] {
	const summaries: PatchValidationSummary[] = [];

	overlay.patches.forEach((patch, patchIndex) => {
		const summary: PatchValidationSummary = {
			patchIndex,
			selector: patch.selector,
			matchCount: 0,
			redundant: false,
		};

		try {
			const matches = resolveSelector(
				targetDocument,
				patch.selector,
				definitionType,
			);
			summary.matchCount = matches.length;

			if (matches.length === 0) {
				result.errors.push({
					level: "error",
					path: `$.patches[${patchIndex}].selector`,
					message: `Selector does not match any element in the target document.`,
				});
				result.valid = false;
			} else {
				// Check for redundancy: does the patch actually change anything?
				const redundancyCheck = checkPatchRedundancy(patch, matches);
				if (redundancyCheck.redundant) {
					summary.redundant = true;
					summary.redundantDetails = redundancyCheck.details;
					result.warnings.push({
						level: "warning",
						path: `$.patches[${patchIndex}]`,
						message: `Redundant patch: ${redundancyCheck.details}`,
					});
				}
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			result.errors.push({
				level: "error",
				path: `$.patches[${patchIndex}].selector`,
				message: `Selector resolution failed: ${message}`,
			});
			result.valid = false;
		}

		summaries.push(summary);
	});

	return summaries;
}

interface RedundancyCheckResult {
	redundant: boolean;
	details?: string | undefined;
}

/**
 * Checks if a patch is redundant (would not change the target value).
 */
function checkPatchRedundancy(
	patch: ORDOverlay["patches"][number],
	matches: NodeReference[],
): RedundancyCheckResult {
	if (patch.data === undefined) {
		// remove action without data means "remove entire node" - not redundant by definition
		if (patch.action === "remove") {
			return { redundant: false };
		}
		return { redundant: false };
	}

	const patchData = patch.data as unknown as JSONValue;

	// For "update" action: check if patch value exactly matches all target values
	if (patch.action === "update") {
		const allIdentical = matches.every((match) =>
			areValuesEqual(match.value, patchData),
		);
		if (allIdentical) {
			return {
				redundant: true,
				details: `Update value is identical to existing value${matches.length > 1 ? " for all matches" : ""}.`,
			};
		}
		return { redundant: false };
	}

	// For "merge" action: check if merging would result in no changes
	if (patch.action === "merge") {
		const allUnchanged = matches.every((match) => {
			const merged = simulateMerge(match.value, patchData);
			return areValuesEqual(match.value, merged);
		});
		if (allUnchanged) {
			return {
				redundant: true,
				details: `Merge would not change the target value${matches.length > 1 ? " for any match" : ""}.`,
			};
		}
		return { redundant: false };
	}

	// For "append" action: check if append adds empty content
	if (patch.action === "append") {
		if (typeof patchData === "string" && patchData === "") {
			return {
				redundant: true,
				details: "Appending an empty string has no effect.",
			};
		}
		if (isJSONObject(patchData) && Object.keys(patchData).length === 0) {
			return {
				redundant: true,
				details: "Appending an empty object has no effect.",
			};
		}
		return { redundant: false };
	}

	return { redundant: false };
}

/**
 * Simulates a merge operation to check if the result differs from the original.
 */
function simulateMerge(base: JSONValue, incoming: JSONValue): JSONValue {
	if (Array.isArray(base) && Array.isArray(incoming)) {
		return [...base, ...cloneJSONValue(incoming)];
	}

	if (isJSONObject(base) && isJSONObject(incoming)) {
		const result: Record<string, JSONValue> = { ...base };

		Object.entries(incoming).forEach(([key, incomingValue]) => {
			const baseValue = result[key];
			if (baseValue === undefined) {
				result[key] = cloneJSONValue(incomingValue);
				return;
			}

			result[key] = simulateMerge(baseValue, incomingValue);
		});

		return result;
	}

	// Scalar merge: incoming overwrites
	return cloneJSONValue(incoming);
}

/**
 * Deep equality check for JSON values.
 */
function areValuesEqual(a: JSONValue, b: JSONValue): boolean {
	if (a === null && b === null) {
		return true;
	}
	if (a === null || b === null) {
		return false;
	}

	if (typeof a !== "object" || typeof b !== "object") {
		return a === b;
	}

	if (Array.isArray(a) && Array.isArray(b)) {
		if (a.length !== b.length) {
			return false;
		}
		return a.every((item, index) => areValuesEqual(item, b[index]));
	}

	if (Array.isArray(a) || Array.isArray(b)) {
		return false;
	}

	const aKeys = Object.keys(a);
	const bKeys = Object.keys(b);

	if (aKeys.length !== bKeys.length) {
		return false;
	}

	return aKeys.every((key) => {
		if (!(key in b)) {
			return false;
		}
		return areValuesEqual(
			a[key as keyof typeof a] as JSONValue,
			b[key as keyof typeof b] as JSONValue,
		);
	});
}

interface EdmxWarning {
	path: string;
	message: string;
}

/**
 * Captures validation warnings from an EDMX merge dry-run.
 */
function captureEdmxValidationWarnings(
	edmxContent: string,
	overlay: ORDOverlay,
): EdmxWarning[] {
	const warnings: EdmxWarning[] = [];
	const originalWarn = console.warn;

	console.warn = (message?: unknown): void => {
		const msg = String(message);
		// Parse warning messages from the EDMX merge function
		const match = msg.match(/\[overlay-merge\]\s*(?:Warning:?)?\s*(.*)/i);
		if (match) {
			warnings.push({
				path: "$",
				message: match[1],
			});
		}
	};

	try {
		// Perform a dry-run merge to capture warnings
		applyOverlayToEdmxDocument(edmxContent, overlay, {
			noMatchBehavior: "warn",
		});
	} finally {
		console.warn = originalWarn;
	}

	return warnings;
}

/**
 * Checks for empty string values in patch data that may be unintentional.
 */
function checkEmptyDataValues(
	overlay: ORDOverlay,
	result: OverlayFullValidationResult,
): void {
	overlay.patches.forEach((patch, patchIndex) => {
		if (patch.data === undefined) {
			return;
		}

		const emptyFields = findEmptyStringFields(
			patch.data as unknown as JSONValue,
		);
		if (emptyFields.length > 0) {
			result.warnings.push({
				level: "warning",
				path: `$.patches[${patchIndex}].data`,
				message: `Patch data contains empty string value(s) for: ${emptyFields.join(", ")}. This may be unintentional.`,
			});
		}
	});
}

/**
 * Finds fields with empty string values in a JSON object.
 */
function findEmptyStringFields(data: JSONValue, prefix = ""): string[] {
	const emptyFields: string[] = [];

	if (!isJSONObject(data)) {
		return emptyFields;
	}

	for (const [key, value] of Object.entries(data)) {
		const fieldPath = prefix ? `${prefix}.${key}` : key;

		if (value === "") {
			emptyFields.push(fieldPath);
		} else if (isJSONObject(value)) {
			emptyFields.push(...findEmptyStringFields(value, fieldPath));
		}
	}

	return emptyFields;
}

/**
 * Checks for duplicate patches targeting the same element.
 */
function checkDuplicatePatches(
	overlay: ORDOverlay,
	result: OverlayFullValidationResult,
): void {
	const selectorMap = new Map<string, number[]>();

	overlay.patches.forEach((patch, patchIndex) => {
		const selectorKey = serializeSelector(patch.selector);
		const existing = selectorMap.get(selectorKey);

		if (existing !== undefined) {
			existing.push(patchIndex);
		} else {
			selectorMap.set(selectorKey, [patchIndex]);
		}
	});

	for (const [_selectorKey, patchIndices] of selectorMap) {
		if (patchIndices.length > 1) {
			const patchNumbers = patchIndices.map((i) => i + 1).join(", ");
			result.warnings.push({
				level: "warning",
				path: `$.patches`,
				message: `Patches ${patchNumbers} target the same element. Consider reviewing whether this is intentional (e.g., remove then update) or indicates accidental duplication.`,
			});
		}
	}
}

/**
 * Serializes a selector to a string for comparison.
 */
function serializeSelector(selector: unknown): string {
	return JSON.stringify(selector, Object.keys(selector as object).sort());
}

// Re-export types from validation module for convenience
export type { OverlayValidationIssue, OverlayValidationResult };
