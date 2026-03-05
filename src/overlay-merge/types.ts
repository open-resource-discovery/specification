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
   * @deprecated Use noMatchBehavior instead.
   * true -> error, false -> ignore
   */
  failOnNoMatch?: boolean;
  /**
   * Validate that the target document structure matches the selected definition type.
   * Currently implemented checks:
   * - openapi-v3: target document must contain `openapi` version string starting with `3.`
   *
   * Defaults to true.
   */
  validateDefinitionType?: boolean;
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

export function validateTargetDocumentForDefinitionType(
  targetDocument: JSONValue,
  definitionType: string | undefined,
): boolean {
  if (definitionType === undefined) {
    return true;
  }

  if (definitionType === "openapi-v3") {
    if (!isJSONObject(targetDocument)) {
      return false;
    }

    const openapiVersion = targetDocument.openapi;
    return typeof openapiVersion === "string" && openapiVersion.startsWith("3.");
  }

  // TODO: add structural validators for additional definition types.
  // Suggested checks:
  // - openapi-v2: targetDocument.swagger must be a string starting with "2."
  // - openapi-v3.1+: targetDocument.openapi must be a string starting with "3.1"
  // - a2a-agent-card: targetDocument must have "skills" array (A2A format) or "tools" array (MCP format)
  // - edmx: targetDocument must contain top-level "edmx:Edmx" key (CSDL XML/JSON)
  // - csdl-json: targetDocument must contain "$Version" key

  return true;
}
