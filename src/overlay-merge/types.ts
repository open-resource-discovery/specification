import { ORDOverlay } from "../generated/spec/v1/types";

export type JSONPrimitive = string | number | boolean | null;
export type JSONValue = JSONPrimitive | JSONArray | JSONObject;
export type JSONArray = JSONValue[];
export type JSONObject = { [key: string]: JSONValue };

export interface OverlayMergeContext {
  ordId?: string;
  url?: string;
  definitionType?: string;
}

export interface ApplyOverlayOptions {
  /**
   * Behavior when a patch selector resolves to zero matches.
   * - error: throw an OverlayMergeError
   * - warn: continue and emit console warning
   * - ignore: continue silently
   *
   * Defaults to "error".
   */
  noMatchBehavior?: "error" | "warn" | "ignore";
  /**
   * Validate that the target document structure matches the selected definition type.
   * Currently implemented checks:
   * - openapi-v3: target document must contain `openapi` version string starting with `3.`
   *
   * Defaults to true.
   */
  validateDefinitionType?: boolean;
  /**
   * Validate overlay selector/action semantics before applying patches.
   * Schema validation of raw overlay files is handled separately by the CLI.
   *
   * Defaults to true.
   */
  validateOverlaySemantics?: boolean;
  /**
   * When true, compare overlay `target` metadata against `context`.
   * Current comparison checks:
   * - `ordId` equality (if both are provided)
   * - `definitionType` equality (if both are provided)
   *
   * TODO: decide whether/when `url` should be compared strictly.
   */
  requireTargetMatch?: boolean;
  context?: OverlayMergeContext;
}

export class OverlayMergeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OverlayMergeError";
  }
}

export function isJSONObject(value: unknown): value is JSONObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function cloneJSONValue<T>(value: T): T {
  const cloneFn = (globalThis as { structuredClone?: <U>(input: U) => U }).structuredClone;
  if (typeof cloneFn === "function") {
    return cloneFn(value);
  }

  return JSON.parse(JSON.stringify(value)) as T;
}

export function matchesOverlayTarget(overlay: ORDOverlay, context: OverlayMergeContext): boolean {
  const target = overlay.target;
  if (target === undefined) {
    return true;
  }

  if (context.ordId !== undefined && target.ordId !== undefined && context.ordId !== target.ordId) {
    return false;
  }

  if (
    context.definitionType !== undefined &&
    target.definitionType !== undefined &&
    context.definitionType !== target.definitionType
  ) {
    return false;
  }

  return true;
}
