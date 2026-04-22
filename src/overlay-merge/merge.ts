import type { ORDOverlay, OverlayPatch } from "../generated/spec/v1/types";
import { type NodeReference, resolveSelector } from "./selectors";
import {
	type ApplyOverlayOptions,
	cloneJSONValue,
	isJSONObject,
	type JSONValue,
	matchesOverlayTarget,
	OverlayMergeError,
} from "./types";
import {
	emitOverlayValidationWarnings,
	throwOnOverlayValidationErrors,
	validateOverlaySemantics,
	validateTargetDocumentForDefinitionType,
} from "./validation";

const REMOVE_SENTINEL = Symbol("remove");

/**
 * Deep equality check for JSON values
 */
function areValuesEqual(a: JSONValue, b: JSONValue): boolean {
	// Null check
	if (a === null && b === null) {
		return true;
	}
	if (a === null || b === null) {
		return false;
	}

	// Primitive types
	if (typeof a !== "object" || typeof b !== "object") {
		return a === b;
	}

	// Array comparison
	if (Array.isArray(a) && Array.isArray(b)) {
		if (a.length !== b.length) {
			return false;
		}
		return a.every((item, index) => areValuesEqual(item, b[index]));
	}

	// One is array, other is not
	if (Array.isArray(a) || Array.isArray(b)) {
		return false;
	}

	// Object comparison
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

interface RootHolder {
	value: JSONValue;
}

export function applyOverlayToDocument<T extends JSONValue>(
	sourceDocument: T,
	overlay: ORDOverlay,
	options: ApplyOverlayOptions = {},
): T {
	const validateOverlay = options.validateOverlaySemantics ?? true;
	if (validateOverlay) {
		const validation = validateOverlaySemantics(overlay, {
			context: options.context,
		});
		throwOnOverlayValidationErrors(validation.errors);
		emitOverlayValidationWarnings(validation.warnings);
	}

	if (
		options.requireTargetMatch === true &&
		options.context !== undefined &&
		!matchesOverlayTarget(overlay, options.context)
	) {
		throw new OverlayMergeError(
			"Overlay target does not match the provided document context.",
		);
	}

	const definitionType =
		options.context?.definitionType ??
		(typeof overlay.target?.definitionType === "string"
			? overlay.target.definitionType
			: undefined);

	const validateDefinitionType = options.validateDefinitionType ?? true;
	if (validateDefinitionType) {
		const definitionTypeIssues = validateTargetDocumentForDefinitionType(
			sourceDocument,
			definitionType,
			overlay,
		);
		throwOnOverlayValidationErrors(definitionTypeIssues);
	}

	const rootHolder: RootHolder = { value: cloneJSONValue(sourceDocument) };
	const noMatchBehavior = resolveNoMatchBehavior(options);

	overlay.patches.forEach((patch, patchIndex) => {
		const matches = resolveSelector(
			rootHolder.value,
			patch.selector,
			definitionType,
		);

		if (matches.length === 0) {
			const message = `Patch #${patchIndex + 1} did not match any target element.`;
			if (noMatchBehavior === "error") {
				throw new OverlayMergeError(message);
			}

			if (noMatchBehavior === "warn") {
				console.warn(`[overlay-merge] ${message}`);
			}

			return;
		}

		applyPatch(rootHolder, patch, matches);
	});

	return rootHolder.value as T;
}

function resolveNoMatchBehavior(
	options: ApplyOverlayOptions,
): "error" | "warn" | "ignore" {
	if (options.noMatchBehavior !== undefined) {
		return options.noMatchBehavior;
	}

	return "error";
}

function applyPatch(
	rootHolder: RootHolder,
	patch: OverlayPatch,
	matches: NodeReference[],
): void {
	if (patch.action === "update") {
		if (patch.data === undefined) {
			throw new OverlayMergeError("Patch action 'update' requires data.");
		}

		const replacement = cloneJSONValue(patch.data as unknown as JSONValue);
		matches.forEach((match) => {
			// Warn if the overlay value is redundant (same as target)
			if (areValuesEqual(match.value, replacement)) {
				console.warn(
					`[overlay-merge] Warning: Redundant overlay at ${match.path}. ` +
						`The overlay value matches the target value and can be removed.`,
				);
			}
			setNode(rootHolder, match, cloneJSONValue(replacement));
		});
		return;
	}

	if (patch.action === "merge") {
		if (patch.data === undefined) {
			throw new OverlayMergeError("Patch action 'merge' requires data.");
		}

		matches.forEach((match) => {
			const merged = deepMerge(match.value, patch.data as unknown as JSONValue);
			// Warn if the merge resulted in no changes (redundant overlay)
			if (areValuesEqual(match.value, merged)) {
				console.warn(
					`[overlay-merge] Warning: Redundant overlay at ${match.path}. ` +
						`The overlay value matches the target value and can be removed.`,
				);
			}
			setNode(rootHolder, match, merged);
		});
		return;
	}

	if (patch.action === "remove") {
		const data = patch.data as unknown as JSONValue | undefined;
		const isRemoveAll =
			data === undefined ||
			(isJSONObject(data) && Object.keys(data).length === 0);

		if (isRemoveAll) {
			removeMatchedNodes(matches);
			return;
		}

		matches.forEach((match) => {
			const updated = removeFieldsMarkedAsNull(match.value, data);
			if (updated === REMOVE_SENTINEL) {
				removeNode(match);
				return;
			}

			setNode(rootHolder, match, updated);
		});
		return;
	}

	throw new OverlayMergeError(
		`Unsupported patch action: ${String((patch as { action?: unknown }).action)}`,
	);
}

function removeMatchedNodes(matches: NodeReference[]): void {
	const sorted = [...matches].sort((left, right) => {
		if (
			left.parent === right.parent &&
			typeof left.key === "number" &&
			typeof right.key === "number"
		) {
			return right.key - left.key;
		}

		return right.path.localeCompare(left.path);
	});

	sorted.forEach((match) => {
		removeNode(match);
	});
}

function removeNode(match: NodeReference): void {
	if (match.parent === undefined || match.key === undefined) {
		throw new OverlayMergeError("Removing the root document is not supported.");
	}

	if (Array.isArray(match.parent) && typeof match.key === "number") {
		match.parent.splice(match.key, 1);
		return;
	}

	if (isJSONObject(match.parent) && typeof match.key === "string") {
		delete match.parent[match.key];
		return;
	}

	throw new OverlayMergeError(
		"Invalid selector target: unable to remove selected element.",
	);
}

function setNode(
	rootHolder: RootHolder,
	match: NodeReference,
	value: JSONValue,
): void {
	if (match.parent === undefined || match.key === undefined) {
		rootHolder.value = value;
		return;
	}

	if (Array.isArray(match.parent) && typeof match.key === "number") {
		match.parent[match.key] = value;
		return;
	}

	if (isJSONObject(match.parent) && typeof match.key === "string") {
		match.parent[match.key] = value;
		return;
	}

	throw new OverlayMergeError(
		"Invalid selector target: unable to set selected element.",
	);
}

function deepMerge(base: JSONValue, incoming: JSONValue): JSONValue {
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

			result[key] = deepMerge(baseValue, incomingValue);
		});

		return result;
	}

	// Scalar merge: incoming value overwrites base value
	// This is the expected behavior for primitive types (string, number, boolean, null)
	if (
		!isJSONObject(base) &&
		!Array.isArray(base) &&
		!isJSONObject(incoming) &&
		!Array.isArray(incoming)
	) {
		return cloneJSONValue(incoming);
	}

	// When types are incompatible (e.g. merging a string into an object, or an object
	// into an array), throw an error to alert the user of the mismatch.
	throw new OverlayMergeError(
		`Type mismatch in merge: cannot merge ${Array.isArray(incoming) ? "array" : typeof incoming} into ${Array.isArray(base) ? "array" : typeof base}. ` +
			`Use 'update' action to replace the value entirely.`,
	);
}

function removeFieldsMarkedAsNull(
	base: JSONValue,
	mask: JSONValue,
): JSONValue | typeof REMOVE_SENTINEL {
	if (mask === null) {
		return REMOVE_SENTINEL;
	}

	if (Array.isArray(base) && Array.isArray(mask)) {
		const result = [...base];

		for (let index = mask.length - 1; index >= 0; index -= 1) {
			if (index >= result.length) {
				continue;
			}

			const updated = removeFieldsMarkedAsNull(result[index], mask[index]);
			if (updated === REMOVE_SENTINEL) {
				result.splice(index, 1);
			} else {
				result[index] = updated;
			}
		}

		return result;
	}

	if (isJSONObject(base) && isJSONObject(mask)) {
		const result: Record<string, JSONValue> = { ...base };

		Object.entries(mask).forEach(([key, value]) => {
			if (!(key in result)) {
				return;
			}

			const updated = removeFieldsMarkedAsNull(result[key], value);
			if (updated === REMOVE_SENTINEL) {
				delete result[key];
			} else {
				result[key] = updated;
			}
		});

		return result;
	}

	return base;
}
