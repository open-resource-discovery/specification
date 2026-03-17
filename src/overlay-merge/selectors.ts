import type { OverlaySelector } from "../generated/spec/v1/types";
import { isJSONObject, type JSONValue, OverlayMergeError } from "./types";

const jsonpath = require("jsonpath") as {
	nodes: (
		input: unknown,
		expression: string,
	) => Array<{ path: Array<string | number>; value: unknown }>;
	stringify: (path: Array<string | number>) => string;
};

// HTTP methods recognised by OpenAPI path items.
const OPENAPI_HTTP_METHODS = new Set([
	"get",
	"put",
	"post",
	"delete",
	"options",
	"head",
	"patch",
	"trace",
]);

interface NodeReference {
	parent: JSONValue | undefined;
	key: string | number | undefined;
	value: JSONValue;
	path: string;
}

export function resolveSelector(
	root: JSONValue,
	selector: OverlaySelector,
	definitionType?: string,
): NodeReference[] {
	if (isJSONObject(selector) && typeof selector.jsonPath === "string") {
		return resolveJsonPath(root, selector.jsonPath);
	}

	if (isJSONObject(selector) && typeof selector.ordId === "string") {
		return resolveOrdIdSelector(root, selector.ordId);
	}

	if (isJSONObject(selector) && typeof selector.operation === "string") {
		return resolveOperationSelector(root, selector.operation, definitionType);
	}

	if (isJSONObject(selector) && typeof selector.propertyType === "string") {
		const entityTypeName =
			typeof (selector as Record<string, unknown>).entityType === "string"
				? (selector as { entityType: string }).entityType
				: undefined;
		return resolvePropertyTypeSelector(
			root,
			selector.propertyType,
			entityTypeName,
			definitionType,
		);
	}

	if (
		isJSONObject(selector) &&
		typeof selector.entityType === "string" &&
		!("propertyType" in selector)
	) {
		return resolveEntityTypeSelector(root, selector.entityType, definitionType);
	}

	throw new OverlayMergeError(
		"Unsupported selector. This merge script currently supports jsonPath, ordId, operation, entityType, and propertyType.",
	);
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
function resolveOperationSelector(
	root: JSONValue,
	operationName: string,
	definitionType: string | undefined,
): NodeReference[] {
	if (!isJSONObject(root)) {
		throw new OverlayMergeError(
			"operation selector requires a JSON object as target document.",
		);
	}

	if (isOpenApiDefinitionType(definitionType)) {
		return resolveOpenApiOperation(root, operationName);
	}

	if (definitionType === "a2a-agent-card") {
		return resolveA2ASkill(root, operationName);
	}

	if (definitionType === "csdl-json") {
		return resolveCsdlJsonOperation(root, operationName);
	}

	if (definitionType !== undefined) {
		// Only Specification IDs (e.g. MCP) support the `operation` selector.
		// Named constants for other formats (asyncapi-v2, etc.) do not.
		if (!isSpecificationId(definitionType)) {
			throw new OverlayMergeError(
				`The 'operation' selector is not supported for definitionType "${definitionType}". ` +
					`Supported types are: openapi-v2, openapi-v3, openapi-v3.1+, a2a-agent-card, csdl-json, edmx (via EDMX API), ` +
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
	return /^([a-z0-9]+(?:[.][a-z0-9]+)*):([a-zA-Z0-9._-]+):(v0|v[1-9][0-9]*)$/.test(
		definitionType,
	);
}

/**
 * Finds all OpenAPI operations (entries under `paths.{path}.{method}`)
 * whose `operationId` matches `operationName`.
 */
function resolveOpenApiOperation(
	root: Record<string, JSONValue>,
	operationName: string,
): NodeReference[] {
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
function resolveMcpTool(
	root: Record<string, JSONValue>,
	operationName: string,
): NodeReference[] {
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
function resolveA2ASkill(
	root: Record<string, JSONValue>,
	operationName: string,
): NodeReference[] {
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

function resolveOrdIdSelector(root: JSONValue, ordId: string): NodeReference[] {
	if (!isJSONObject(root)) {
		throw new OverlayMergeError(
			"ordId selector requires an ORD Document object as target.",
		);
	}

	const ordCollections = findOrdCollections(root);
	const collectionNames = resolveCandidateCollections(
		ordCollections,
		deriveResourceTypeFromOrdId(ordId),
	);
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

function deriveResourceTypeFromOrdId(ordId: string): string | undefined {
	const segments = ordId.split(":");
	if (segments.length !== 4) {
		return undefined;
	}

	return segments[1];
}

function findOrdCollections(root: Record<string, JSONValue>): string[] {
	const collections: string[] = [];

	for (const [key, value] of Object.entries(root)) {
		if (!Array.isArray(value)) {
			continue;
		}

		const hasOrdIdObjects = value.some(
			(entry: JSONValue) => isJSONObject(entry) && "ordId" in entry,
		);
		if (hasOrdIdObjects) {
			collections.push(key);
		}
	}

	return collections;
}

function resolveCandidateCollections(
	ordCollections: string[],
	resourceType: string | undefined,
): string[] {
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

	return ordCollections.filter((collectionName) =>
		candidates.has(collectionName),
	);
}

function resolveJsonPath(root: JSONValue, expression: string): NodeReference[] {
	try {
		const nodes = jsonpath.nodes(root, expression);
		return nodes.map((node) => toNodeReference(root, node.path, node.value));
	} catch (error: unknown) {
		const reason = error instanceof Error ? error.message : String(error);
		throw new OverlayMergeError(`Invalid JSONPath "${expression}": ${reason}`);
	}
}

function toNodeReference(
	root: JSONValue,
	path: Array<string | number>,
	value: unknown,
): NodeReference {
	if (path.length === 0 || path[0] !== "$") {
		throw new OverlayMergeError(
			"JSONPath resolver returned an invalid node path.",
		);
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
		throw new OverlayMergeError(
			"JSONPath resolver returned an invalid terminal path key.",
		);
	}

	const parent = resolvePath(root, path.slice(1, -1));

	return {
		parent,
		key,
		value: value as JSONValue,
		path: jsonpath.stringify(path),
	};
}

function resolvePath(
	root: JSONValue,
	segments: Array<string | number>,
): JSONValue {
	let current: JSONValue = root;

	for (const segment of segments) {
		if (typeof segment === "number") {
			if (!Array.isArray(current) || segment < 0 || segment >= current.length) {
				throw new OverlayMergeError(
					"JSONPath resolver returned a path that cannot be resolved in the current document.",
				);
			}

			current = current[segment];
			continue;
		}

		if (!isJSONObject(current) || !(segment in current)) {
			throw new OverlayMergeError(
				"JSONPath resolver returned a path that cannot be resolved in the current document.",
			);
		}

		current = current[segment];
	}

	return current;
}

// ─── CSN Interop selectors ──────────────────────────────────────────────────

/**
 * Detects whether a JSON document is a CSN Interop document.
 */
function isCsnInteropDocument(root: Record<string, JSONValue>): boolean {
	return typeof root.csnInteropEffective === "string";
}

/**
 * Detects whether a JSON document is a CSDL JSON document.
 */
function isCsdlJsonDocument(root: Record<string, JSONValue>): boolean {
	return typeof root.$Version === "string";
}

/**
 * Dispatches an `entityType` selector to the correct format-specific resolver.
 */
function resolveEntityTypeSelector(
	root: JSONValue,
	entityTypeName: string,
	definitionType: string | undefined,
): NodeReference[] {
	if (!isJSONObject(root)) {
		throw new OverlayMergeError(
			"entityType selector requires a JSON object as target document.",
		);
	}

	const isCsn =
		definitionType === "sap-csn-interop-effective-v1" ||
		(definitionType === undefined && isCsnInteropDocument(root));
	if (isCsn) {
		return resolveCsnEntityType(root, entityTypeName);
	}

	const isCsdl =
		definitionType === "csdl-json" ||
		(definitionType === undefined && isCsdlJsonDocument(root));
	if (isCsdl) {
		return resolveCsdlJsonEntityType(root, entityTypeName);
	}

	if (definitionType === "edmx") {
		throw new OverlayMergeError(
			"EDMX (edmx) targets must be processed with applyOverlayToEdmxDocument, not applyOverlayToDocument.",
		);
	}

	throw new OverlayMergeError(
		`The 'entityType' selector is not supported for definitionType "${definitionType ?? "unknown"}". ` +
			`Supported JSON-based formats are: csdl-json, sap-csn-interop-effective-v1.`,
	);
}

/**
 * Dispatches a `propertyType` selector to the correct format-specific resolver.
 */
function resolvePropertyTypeSelector(
	root: JSONValue,
	propertyName: string,
	entityTypeName: string | undefined,
	definitionType: string | undefined,
): NodeReference[] {
	if (!isJSONObject(root)) {
		throw new OverlayMergeError(
			"propertyType selector requires a JSON object as target document.",
		);
	}

	const isCsn =
		definitionType === "sap-csn-interop-effective-v1" ||
		(definitionType === undefined && isCsnInteropDocument(root));
	if (isCsn) {
		return resolveCsnPropertyType(root, propertyName, entityTypeName);
	}

	const isCsdl =
		definitionType === "csdl-json" ||
		(definitionType === undefined && isCsdlJsonDocument(root));
	if (isCsdl) {
		return resolveCsdlJsonPropertyType(root, propertyName, entityTypeName);
	}

	if (definitionType === "edmx") {
		throw new OverlayMergeError(
			"EDMX (edmx) targets must be processed with applyOverlayToEdmxDocument, not applyOverlayToDocument.",
		);
	}

	throw new OverlayMergeError(
		`The 'propertyType' selector is not supported for definitionType "${definitionType ?? "unknown"}". ` +
			`Supported JSON-based formats are: csdl-json, sap-csn-interop-effective-v1.`,
	);
}

// ─── CSN Interop resolver implementations ────────────────────────────────────

function resolveCsnEntityType(
	root: Record<string, JSONValue>,
	entityTypeName: string,
): NodeReference[] {
	const definitions = root.definitions;
	if (!isJSONObject(definitions)) {
		return [];
	}

	const target = definitions[entityTypeName];
	if (target === undefined) {
		return [];
	}

	return [
		{
			parent: definitions,
			key: entityTypeName,
			value: target,
			path: `$.definitions['${entityTypeName}']`,
		},
	];
}

function resolveCsnPropertyType(
	root: Record<string, JSONValue>,
	propertyName: string,
	entityTypeName: string | undefined,
): NodeReference[] {
	const definitions = root.definitions;
	if (!isJSONObject(definitions)) {
		return [];
	}

	if (entityTypeName !== undefined) {
		const entity = definitions[entityTypeName];
		if (!isJSONObject(entity)) {
			return [];
		}

		const elements = entity.elements;
		if (!isJSONObject(elements) || !(propertyName in elements)) {
			return [];
		}

		return [
			{
				parent: elements,
				key: propertyName,
				value: elements[propertyName],
				path: `$.definitions['${entityTypeName}'].elements['${propertyName}']`,
			},
		];
	}

	// Global scan across all definitions for a unique match
	const matches: NodeReference[] = [];
	for (const [defKey, defVal] of Object.entries(definitions)) {
		if (!isJSONObject(defVal)) continue;
		const elements = defVal.elements;
		if (!isJSONObject(elements) || !(propertyName in elements)) continue;
		matches.push({
			parent: elements,
			key: propertyName,
			value: elements[propertyName],
			path: `$.definitions['${defKey}'].elements['${propertyName}']`,
		});
	}

	return matches;
}

// ─── CSDL JSON (OData) resolver implementations ──────────────────────────────

/**
 * Returns all namespace-level entries in a CSDL JSON document.
 * These are non-`$`-prefixed keys whose values are objects (namespace schemas).
 */
function getCsdlJsonNamespaceEntries(
	root: Record<string, JSONValue>,
): Array<{ namespace: string; nsObj: Record<string, JSONValue> }> {
	const result: Array<{ namespace: string; nsObj: Record<string, JSONValue> }> =
		[];
	for (const [key, value] of Object.entries(root)) {
		if (!key.startsWith("$") && isJSONObject(value)) {
			result.push({ namespace: key, nsObj: value });
		}
	}

	return result;
}

function resolveCsdlJsonEntityType(
	root: Record<string, JSONValue>,
	entityTypeName: string,
): NodeReference[] {
	const namespaces = getCsdlJsonNamespaceEntries(root);
	const matches: NodeReference[] = [];

	for (const { namespace, nsObj } of namespaces) {
		let localName: string;
		if (entityTypeName.startsWith(`${namespace}.`)) {
			// Qualified name: strip namespace prefix
			localName = entityTypeName.substring(namespace.length + 1);
		} else if (!entityTypeName.includes(".")) {
			// Unqualified: try direct match
			localName = entityTypeName;
		} else {
			// Qualified with a different namespace
			continue;
		}

		const candidate = nsObj[localName];
		if (!isJSONObject(candidate)) continue;

		const kind = candidate["$Kind"];
		if (kind === "EntityType" || kind === "ComplexType") {
			matches.push({
				parent: nsObj,
				key: localName,
				value: candidate,
				path: `$['${namespace}']['${localName}']`,
			});
		}
	}

	return matches;
}

function resolveCsdlJsonPropertyType(
	root: Record<string, JSONValue>,
	propertyName: string,
	entityTypeName: string | undefined,
): NodeReference[] {
	let entityRefs: NodeReference[];

	if (entityTypeName !== undefined) {
		entityRefs = resolveCsdlJsonEntityType(root, entityTypeName);
	} else {
		// Scan all EntityType and ComplexType definitions across all namespaces
		const namespaces = getCsdlJsonNamespaceEntries(root);
		entityRefs = [];
		for (const { namespace, nsObj } of namespaces) {
			for (const [key, value] of Object.entries(nsObj)) {
				if (
					isJSONObject(value) &&
					(value["$Kind"] === "EntityType" || value["$Kind"] === "ComplexType")
				) {
					entityRefs.push({
						parent: nsObj,
						key,
						value,
						path: `$['${namespace}']['${key}']`,
					});
				}
			}
		}
	}

	const matches: NodeReference[] = [];
	for (const entityRef of entityRefs) {
		const entityObj = entityRef.value as Record<string, JSONValue>;
		// Properties are non-`$` keys in the entity type object
		if (propertyName in entityObj && !propertyName.startsWith("$")) {
			matches.push({
				parent: entityObj,
				key: propertyName,
				value: entityObj[propertyName],
				path: `${entityRef.path}['${propertyName}']`,
			});
		}
	}

	return matches;
}

/**
 * Resolves an `operation` selector against a CSDL JSON document.
 * Matches Action and Function overload entries by namespace-qualified or unqualified name.
 *
 * In CSDL JSON, Action/Function overloads are stored as arrays:
 * `{ "OData.Demo": { "Approval": [{ "$Kind": "Action", ... }] } }`
 * Returns references to matching overload objects (first or all).
 */
function resolveCsdlJsonOperation(
	root: Record<string, JSONValue>,
	operationName: string,
): NodeReference[] {
	const namespaces = getCsdlJsonNamespaceEntries(root);
	const matches: NodeReference[] = [];

	for (const { namespace, nsObj } of namespaces) {
		let localName: string;
		if (operationName.startsWith(`${namespace}.`)) {
			localName = operationName.substring(namespace.length + 1);
		} else if (!operationName.includes(".")) {
			localName = operationName;
		} else {
			continue;
		}

		const candidate = nsObj[localName];
		if (!Array.isArray(candidate)) continue;

		candidate.forEach((overload, index) => {
			if (!isJSONObject(overload)) return;
			const kind = overload["$Kind"];
			if (kind === "Action" || kind === "Function") {
				matches.push({
					parent: candidate,
					key: index,
					value: overload,
					path: `$['${namespace}']['${localName}'][${index}]`,
				});
			}
		});
	}

	return matches;
}

export type { NodeReference };
