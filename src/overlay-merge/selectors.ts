import { Selector } from "../generated/spec/v1/types";
import { JSONValue, OverlayMergeError, isJSONObject } from "./types";

const jsonpath = require("jsonpath") as {
  nodes: (input: unknown, expression: string) => Array<{ path: Array<string | number>; value: unknown }>;
  stringify: (path: Array<string | number>) => string;
};

// HTTP methods recognised by OpenAPI path items.
const OPENAPI_HTTP_METHODS = new Set(["get", "put", "post", "delete", "options", "head", "patch", "trace"]);

interface NodeReference {
  parent: JSONValue | undefined;
  key: string | number | undefined;
  value: JSONValue;
  path: string;
}

export function resolveSelector(root: JSONValue, selector: Selector, definitionType?: string): NodeReference[] {
  if (isJSONObject(selector) && typeof selector.jsonPath === "string") {
    return resolveJsonPath(root, selector.jsonPath);
  }

  if (isJSONObject(selector) && typeof selector.ordId === "string") {
    return resolveOrdIdSelector(root, selector.ordId, typeof selector.resourceType === "string" ? selector.resourceType : undefined);
  }

  if (isJSONObject(selector) && typeof selector.operation === "string") {
    return resolveOperationSelector(root, selector.operation, definitionType);
  }

  // TODO: implement entityType and propertyType selectors for OData CSDL.
  // For edmx: find EntityType[@Name=entityType] and Property[@Name=propertyType] in XML.
  // For csdl-json: find Schema.*.EntityType[entityType] and its properties.
  if (isJSONObject(selector) && "entityType" in selector && "propertyType" in selector) {
    throw new OverlayMergeError(
      "Unsupported selector: propertyType. This merge script currently supports only jsonPath, ordId, and operation.",
    );
  }

  if (isJSONObject(selector) && "entityType" in selector) {
    throw new OverlayMergeError("Unsupported selector: entityType. This merge script currently supports only jsonPath, ordId, and operation.");
  }

  throw new OverlayMergeError("Unsupported selector. This merge script currently supports only jsonPath, ordId, and operation.");
}

/**
 * Resolves an `operation` selector against a target document.
 *
 * Mapping by `definitionType`:
 * - OpenAPI (`openapi-v2`, `openapi-v3`, `openapi-v3.1+`):
 *     scans `$.paths.{path}.{method}` entries whose `operationId` equals the selector value.
 * - A2A Agent Card (`a2a-agent-card`):
 *     scans `$.skills[*]` entries whose `id` equals the selector value.
 * - MCP (any Specification ID, or documents containing `$.tools`):
 *     scans `$.tools[*]` entries whose `name` equals the selector value.
 *
 * If `definitionType` is not provided, all three strategies are tried in order:
 *   OpenAPI paths → MCP tools → A2A skills.
 */
function resolveOperationSelector(root: JSONValue, operationName: string, definitionType: string | undefined): NodeReference[] {
  if (!isJSONObject(root)) {
    throw new OverlayMergeError("operation selector requires a JSON object as target document.");
  }

  if (isOpenApiDefinitionType(definitionType)) {
    return resolveOpenApiOperation(root, operationName);
  }

  if (definitionType === "a2a-agent-card") {
    return resolveA2ASkill(root, operationName);
  }

  if (definitionType !== undefined) {
    // Only Specification IDs (e.g. MCP) support the `operation` selector.
    // Named constants for other formats (edmx, csdl-json, asyncapi-v2, etc.) do not.
    if (!isSpecificationId(definitionType)) {
      throw new OverlayMergeError(
        `The 'operation' selector is not supported for definitionType "${definitionType}". ` +
        `Supported types are: openapi-v2, openapi-v3, openapi-v3.1+, a2a-agent-card, ` +
        `or any MCP Specification ID (e.g. "sap.foo:my-mcp-server:v1").`,
      );
    }
    return resolveMcpTool(root, operationName);
  }

  // No definitionType: try all three strategies and return the first that finds matches.
  const openApiMatches = resolveOpenApiOperation(root, operationName);
  if (openApiMatches.length > 0) {
    return openApiMatches;
  }

  const mcpMatches = resolveMcpTool(root, operationName);
  if (mcpMatches.length > 0) {
    return mcpMatches;
  }

  return resolveA2ASkill(root, operationName);
}

function isOpenApiDefinitionType(definitionType: string | undefined): boolean {
  return (
    definitionType === "openapi-v2" ||
    definitionType === "openapi-v3" ||
    definitionType === "openapi-v3.1+"
  );
}

/** Matches the ORD Specification ID pattern, used for MCP and similar freeform formats. */
function isSpecificationId(definitionType: string): boolean {
  return /^([a-z0-9]+(?:[.][a-z0-9]+)*):([a-zA-Z0-9._\-]+):(v0|v[1-9][0-9]*)$/.test(definitionType);
}

/**
 * Finds all OpenAPI operations (entries under `paths.{path}.{method}`)
 * whose `operationId` matches `operationName`.
 */
function resolveOpenApiOperation(root: Record<string, JSONValue>, operationName: string): NodeReference[] {
  const paths = root.paths;
  if (!isJSONObject(paths)) {
    return [];
  }

  const matches: NodeReference[] = [];

  for (const [pathKey, pathItem] of Object.entries(paths)) {
    if (!isJSONObject(pathItem)) {
      continue;
    }

    for (const [method, operation] of Object.entries(pathItem)) {
      if (!OPENAPI_HTTP_METHODS.has(method) || !isJSONObject(operation)) {
        continue;
      }

      if (operation.operationId === operationName) {
        matches.push({
          parent: pathItem,
          key: method,
          value: operation,
          path: `$.paths.${pathKey}.${method}`,
        });
      }
    }
  }

  return matches;
}

/**
 * Finds MCP tool entries (`tools[*]`) whose `name` matches `operationName`.
 */
function resolveMcpTool(root: Record<string, JSONValue>, operationName: string): NodeReference[] {
  const tools = root.tools;
  if (!Array.isArray(tools)) {
    return [];
  }

  const matches: NodeReference[] = [];
  tools.forEach((tool, index) => {
    if (isJSONObject(tool) && tool.name === operationName) {
      matches.push({
        parent: tools,
        key: index,
        value: tool,
        path: `$.tools[${index}]`,
      });
    }
  });

  return matches;
}

/**
 * Finds A2A Agent Card skill entries (`skills[*]`) whose `id` matches `operationName`.
 */
function resolveA2ASkill(root: Record<string, JSONValue>, operationName: string): NodeReference[] {
  const skills = root.skills;
  if (!Array.isArray(skills)) {
    return [];
  }

  const matches: NodeReference[] = [];
  skills.forEach((skill, index) => {
    if (isJSONObject(skill) && skill.id === operationName) {
      matches.push({
        parent: skills,
        key: index,
        value: skill,
        path: `$.skills[${index}]`,
      });
    }
  });

  return matches;
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
