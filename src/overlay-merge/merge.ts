import { ORDOverlay, Patch } from "../generated/spec/v1/types";
import { NodeReference, resolveSelector } from "./selectors";
import {
  ApplyOverlayOptions,
  JSONValue,
  OverlayMergeError,
  cloneJSONValue,
  isJSONObject,
  matchesOverlayTarget,
  validateTargetDocumentForDefinitionType,
} from "./types";

const REMOVE_SENTINEL = Symbol("remove");

interface RootHolder {
  value: JSONValue;
}

export function applyOverlayToDocument<T extends JSONValue>(
  sourceDocument: T,
  overlay: ORDOverlay,
  options: ApplyOverlayOptions = {},
): T {
  if (options.requireTargetMatch === true && options.context !== undefined && !matchesOverlayTarget(overlay, options.context)) {
    throw new OverlayMergeError("Overlay target does not match the provided document context.");
  }

  const validateDefinitionType = options.validateDefinitionType ?? true;
  if (validateDefinitionType) {
    const definitionType =
      options.context?.definitionType ??
      (typeof overlay.target.definitionType === "string" ? overlay.target.definitionType : undefined);

    if (!validateTargetDocumentForDefinitionType(sourceDocument, definitionType)) {
      throw new OverlayMergeError(
        `Target document does not match the expected definitionType${definitionType !== undefined ? ` (${definitionType})` : ""}.`,
      );
    }
  }

  const rootHolder: RootHolder = { value: cloneJSONValue(sourceDocument) };
  const noMatchBehavior = resolveNoMatchBehavior(options);

  overlay.patches.forEach((patch, patchIndex) => {
    const matches = resolveSelector(rootHolder.value, patch.selector);

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

function resolveNoMatchBehavior(options: ApplyOverlayOptions): "error" | "warn" | "ignore" {
  if (options.noMatchBehavior !== undefined) {
    return options.noMatchBehavior;
  }

  if (options.failOnNoMatch !== undefined) {
    return options.failOnNoMatch ? "error" : "ignore";
  }

  return "error";
}

function applyPatch(rootHolder: RootHolder, patch: Patch, matches: NodeReference[]): void {
  if (patch.action === "update") {
    if (patch.data === undefined) {
      throw new OverlayMergeError("Patch action 'update' requires data.");
    }

    const replacement = cloneJSONValue(patch.data as unknown as JSONValue);
    matches.forEach((match) => {
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
      setNode(rootHolder, match, merged);
    });
    return;
  }

  if (patch.data === undefined) {
    removeMatchedNodes(matches);
    return;
  }

  matches.forEach((match) => {
    const updated = removeFieldsMarkedAsNull(match.value, patch.data as unknown as JSONValue);
    if (updated === REMOVE_SENTINEL) {
      removeNode(match);
      return;
    }

    setNode(rootHolder, match, updated);
  });
}

function removeMatchedNodes(matches: NodeReference[]): void {
  const sorted = [...matches].sort((left, right) => {
    if (left.parent === right.parent && typeof left.key === "number" && typeof right.key === "number") {
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

  throw new OverlayMergeError("Invalid selector target: unable to remove selected element.");
}

function setNode(rootHolder: RootHolder, match: NodeReference, value: JSONValue): void {
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

  throw new OverlayMergeError("Invalid selector target: unable to set selected element.");
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

  return cloneJSONValue(incoming);
}

function removeFieldsMarkedAsNull(base: JSONValue, mask: JSONValue): JSONValue | typeof REMOVE_SENTINEL {
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
