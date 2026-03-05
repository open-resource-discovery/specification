import { Selector } from "../generated/spec/v1/types";
import { JSONValue, OverlayMergeError, isJSONObject } from "./types";

const jsonpath = require("jsonpath") as {
  nodes: (input: unknown, expression: string) => Array<{ path: Array<string | number>; value: unknown }>;
  stringify: (path: Array<string | number>) => string;
};

interface NodeReference {
  parent: JSONValue | undefined;
  key: string | number | undefined;
  value: JSONValue;
  path: string;
}

export function resolveSelector(root: JSONValue, selector: Selector): NodeReference[] {
  if (isJSONObject(selector) && typeof selector.jsonPath === "string") {
    return resolveJsonPath(root, selector.jsonPath);
  }

  if (isJSONObject(selector) && typeof selector.ordId === "string") {
    return resolveOrdIdSelector(root, selector.ordId, typeof selector.resourceType === "string" ? selector.resourceType : undefined);
  }

  if (isJSONObject(selector) && "operation" in selector) {
    throw new OverlayMergeError("Unsupported selector: operation. This merge script currently supports only jsonPath and ordId.");
  }

  if (isJSONObject(selector) && "entityType" in selector && "propertyType" in selector) {
    throw new OverlayMergeError(
      "Unsupported selector: propertyType. This merge script currently supports only jsonPath and ordId.",
    );
  }

  if (isJSONObject(selector) && "entityType" in selector) {
    throw new OverlayMergeError("Unsupported selector: entityType. This merge script currently supports only jsonPath and ordId.");
  }

  throw new OverlayMergeError("Unsupported selector. This merge script currently supports only jsonPath and ordId.");
}

function resolveOrdIdSelector(root: JSONValue, ordId: string, resourceType: string | undefined): NodeReference[] {
  if (!isJSONObject(root)) {
    throw new OverlayMergeError("ordId selector requires an ORD Document object as target.");
  }

  const ordCollections = findOrdCollections(root);
  const collectionNames = resolveCandidateCollections(ordCollections, resourceType);
  const matches: NodeReference[] = [];

  for (const collectionName of collectionNames) {
    const candidate = root[collectionName];
    if (!Array.isArray(candidate)) {
      continue;
    }

    candidate.forEach((item, index) => {
      if (!isJSONObject(item)) {
        return;
      }

      if (item.ordId === ordId) {
        matches.push({
          parent: candidate,
          key: index,
          value: item,
          path: `$.${collectionName}[${index}]`,
        });
      }
    });
  }

  return matches;
}

function findOrdCollections(root: Record<string, JSONValue>): string[] {
  const collections: string[] = [];

  for (const [key, value] of Object.entries(root)) {
    if (!Array.isArray(value)) {
      continue;
    }

    const hasOrdIdObjects = value.some((entry: JSONValue) => isJSONObject(entry) && "ordId" in entry);
    if (hasOrdIdObjects) {
      collections.push(key);
    }
  }

  return collections;
}

function resolveCandidateCollections(ordCollections: string[], resourceType: string | undefined): string[] {
  if (resourceType === undefined) {
    return ordCollections;
  }

  const candidates = new Set<string>([resourceType]);
  if (!resourceType.endsWith("s")) {
    candidates.add(`${resourceType}s`);
  }

  if (resourceType.endsWith("y")) {
    candidates.add(`${resourceType.slice(0, -1)}ies`);
  }

  return ordCollections.filter((collectionName) => candidates.has(collectionName));
}

function resolveJsonPath(root: JSONValue, expression: string): NodeReference[] {
  try {
    const nodes = jsonpath.nodes(root, expression);
    return nodes.map((node) => toNodeReference(root, node.path, node.value));
  } catch (error: unknown) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new OverlayMergeError(`Invalid JSONPath \"${expression}\": ${reason}`);
  }
}

function toNodeReference(root: JSONValue, path: Array<string | number>, value: unknown): NodeReference {
  if (path.length === 0 || path[0] !== "$") {
    throw new OverlayMergeError("JSONPath resolver returned an invalid node path.");
  }

  if (path.length === 1) {
    return {
      parent: undefined,
      key: undefined,
      value: root,
      path: "$",
    };
  }

  const key = path[path.length - 1];
  if (typeof key !== "string" && typeof key !== "number") {
    throw new OverlayMergeError("JSONPath resolver returned an invalid terminal path key.");
  }

  const parent = resolvePath(root, path.slice(1, -1));

  return {
    parent,
    key,
    value: value as JSONValue,
    path: jsonpath.stringify(path),
  };
}

function resolvePath(root: JSONValue, segments: Array<string | number>): JSONValue {
  let current: JSONValue = root;

  for (const segment of segments) {
    if (typeof segment === "number") {
      if (!Array.isArray(current) || segment < 0 || segment >= current.length) {
        throw new OverlayMergeError("JSONPath resolver returned a path that cannot be resolved in the current document.");
      }

      current = current[segment];
      continue;
    }

    if (!isJSONObject(current) || !(segment in current)) {
      throw new OverlayMergeError("JSONPath resolver returned a path that cannot be resolved in the current document.");
    }

    current = current[segment];
  }

  return current;
}

export type { NodeReference };
