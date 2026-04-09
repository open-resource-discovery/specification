/**
 * EDMX XML overlay merge support.
 *
 * This module provides `applyOverlayToEdmxDocument` for patching OData EDMX XML files
 * using CSDL JSON annotation format patch data, as defined by the ORD Overlay specification.
 *
 * Supported selectors for EDMX targets:
 * - `entityType`: targets an EntityType or ComplexType element by name (qualified or unqualified).
 * - `propertyType`: targets a Property or NavigationProperty on an EntityType/ComplexType.
 * - `operation`: targets an Action or Function by namespace-qualified name.
 *
 * Patch data MUST be expressed in CSDL JSON annotation format.
 * Annotation keys use the `@TermName` convention (e.g. `@Core.Description`).
 * The implementation converts these to `<Annotation>` XML child elements on the matched element.
 *
 * See: https://docs.oasis-open.org/odata/odata-csdl-json/v4.01/odata-csdl-json-v4.01.html
 */
import { XMLBuilder, XMLParser } from "fast-xml-parser";
import type { ORDOverlay, OverlayPatch } from "../generated/spec/v1/types";
import {
	type ApplyOverlayOptions,
	isJSONObject,
	type JSONObject,
	type JSONValue,
	OverlayMergeError,
} from "./types";
import {
	emitOverlayValidationWarnings,
	throwOnOverlayValidationErrors,
	validateOverlaySemantics,
} from "./validation";

// XML elements that may appear multiple times as siblings must always parse as arrays.
const ALWAYS_ARRAY_TAGS = new Set([
	"Schema",
	"EntityType",
	"ComplexType",
	"EnumType",
	"Action",
	"Function",
	"ActionImport",
	"FunctionImport",
	"Property",
	"NavigationProperty",
	"Parameter",
	"ReturnType",
	"Annotation",
	"PropertyValue",
	"Record",
	"Member",
	"EntitySet",
	"Singleton",
	"OnDelete",
	"ReferentialConstraint",
	"NavigationPropertyBinding",
	"PropertyRef",
	"Annotations",
	"edmx:Reference",
	"edmx:Include",
]);

function buildXmlParser(): XMLParser {
	return new XMLParser({
		ignoreAttributes: false,
		attributeNamePrefix: "@_",
		parseAttributeValue: false,
		isArray: (tagName) => ALWAYS_ARRAY_TAGS.has(tagName),
		preserveOrder: false,
	});
}

function buildXmlBuilder(): XMLBuilder {
	return new XMLBuilder({
		ignoreAttributes: false,
		attributeNamePrefix: "@_",
		suppressBooleanAttributes: false,
		format: true,
		indentBy: "  ",
	});
}

// ─── Internal tree navigation helpers ──────────────────────────────────────

function getEdmxSchemas(tree: Record<string, JSONValue>): JSONObject[] {
	const edmxRoot =
		tree["edmx:Edmx"] ??
		tree["edmx:edmx"] ??
		Object.values(tree).find((v) => isJSONObject(v) && "@_Version" in v);

	if (!isJSONObject(edmxRoot)) {
		throw new OverlayMergeError(
			"Invalid EDMX: missing edmx:Edmx root element.",
		);
	}

	const dataServices =
		edmxRoot["edmx:DataServices"] ?? edmxRoot["edmx:dataservices"];
	if (!isJSONObject(dataServices)) {
		return [];
	}

	const schemas = dataServices.Schema ?? dataServices.schema;
	if (!schemas) return [];
	if (Array.isArray(schemas)) {
		return schemas.filter(isJSONObject);
	}

	if (isJSONObject(schemas)) return [schemas];
	return [];
}

/**
 * Finds an EntityType or ComplexType by name across all schemas.
 * Supports qualified names (e.g. `OData.Demo.Customer`) and unqualified names (e.g. `Customer`).
 * Also resolves EnumType elements by the same naming convention.
 * Throws if an unqualified name matches in more than one schema — use a qualified name to disambiguate.
 *
 * @param typeKind - Optional OData type kind filter ("EntityType", "ComplexType", "EnumType").
 *   If provided, only types matching this kind are considered.
 */
function findEdmxEntityType(
	schemas: JSONObject[],
	entityTypeName: string,
	typeKind?: string,
): { entityType: JSONObject; array: JSONObject[]; index: number } | undefined {
	const found: Array<{
		entityType: JSONObject;
		array: JSONObject[];
		index: number;
		ns: string;
		kind: string;
	}> = [];

	// Determine which type arrays to search based on typeKind filter
	const typeArrayKeys =
		typeKind !== undefined
			? [typeKind]
			: ["EntityType", "ComplexType", "EnumType"];

	for (const schema of schemas) {
		const ns = schema["@_Namespace"];
		if (typeof ns !== "string") continue;

		let localName: string;
		if (entityTypeName.startsWith(`${ns}.`)) {
			localName = entityTypeName.substring(ns.length + 1);
		} else if (!entityTypeName.includes(".")) {
			localName = entityTypeName;
		} else {
			continue;
		}

		for (const typeArrayKey of typeArrayKeys) {
			const typeArray = schema[typeArrayKey];
			if (!Array.isArray(typeArray)) continue;
			for (let i = 0; i < typeArray.length; i++) {
				const et = typeArray[i];
				if (isJSONObject(et) && et["@_Name"] === localName) {
					found.push({
						entityType: et,
						array: typeArray as JSONObject[],
						index: i,
						ns,
						kind: typeArrayKey,
					});
				}
			}
		}
	}

	if (found.length > 1 && !entityTypeName.includes(".")) {
		throw new OverlayMergeError(
			`Ambiguous entityType selector "${entityTypeName}": found ${found.length} matches across schemas [${found.map((f) => f.ns).join(", ")}]. ` +
				`Use a fully qualified name to disambiguate (e.g. "${found[0].ns}.${entityTypeName}").`,
		);
	}

	if (found.length === 0) return undefined;
	return {
		entityType: found[0].entityType,
		array: found[0].array,
		index: found[0].index,
	};
}

/**
 * Finds a Property, NavigationProperty, or Member by name on an EntityType/ComplexType/EnumType JSON object.
 */
function findEdmxProperty(
	entityType: JSONObject,
	propertyName: string,
): { prop: JSONObject; parent: JSONObject[]; index: number } | undefined {
	for (const propArrayKey of ["Property", "NavigationProperty", "Member"]) {
		const props = entityType[propArrayKey];
		if (!Array.isArray(props)) continue;
		for (let i = 0; i < props.length; i++) {
			const prop = props[i];
			if (isJSONObject(prop) && prop["@_Name"] === propertyName) {
				return { prop, parent: props as JSONObject[], index: i };
			}
		}
	}

	return undefined;
}

/**
 * Finds an Action or Function by name across all schemas.
 * Supports namespace-qualified names (e.g. `OData.Demo.Approval`) and unqualified names.
 * Throws if an unqualified name matches in more than one schema — use a qualified name to disambiguate.
 * For OData v2: also searches FunctionImport elements inside EntityContainer when no
 * Schema-level Action/Function match is found.
 */
function findEdmxOperation(
	schemas: JSONObject[],
	operationName: string,
): { operation: JSONObject; array: JSONObject[]; index: number } | undefined {
	// First: search Schema-level Action/Function
	const found: Array<{
		operation: JSONObject;
		array: JSONObject[];
		index: number;
		ns: string;
	}> = [];

	for (const schema of schemas) {
		const ns = schema["@_Namespace"];
		if (typeof ns !== "string") continue;

		let localName: string;
		if (operationName.startsWith(`${ns}.`)) {
			localName = operationName.substring(ns.length + 1);
		} else if (!operationName.includes(".")) {
			localName = operationName;
		} else {
			continue;
		}

		for (const opArrayKey of ["Action", "Function"]) {
			const ops = schema[opArrayKey];
			if (!Array.isArray(ops)) continue;
			for (let i = 0; i < ops.length; i++) {
				const op = ops[i];
				if (isJSONObject(op) && op["@_Name"] === localName) {
					found.push({
						operation: op,
						array: ops as JSONObject[],
						index: i,
						ns,
					});
				}
			}
		}
	}

	if (found.length > 1 && !operationName.includes(".")) {
		throw new OverlayMergeError(
			`Ambiguous operation selector "${operationName}": found ${found.length} matches across schemas [${found.map((f) => f.ns).join(", ")}]. ` +
				`Use a fully qualified name to disambiguate (e.g. "${found[0].ns}.${operationName}").`,
		);
	}

	if (found.length > 0) {
		return {
			operation: found[0].operation,
			array: found[0].array,
			index: found[0].index,
		};
	}

	// Fallback: search FunctionImport inside EntityContainer (OData v2)
	return findEdmxFunctionImport(schemas, operationName);
}

/**
 * Finds a FunctionImport element inside EntityContainer by name across all schemas.
 * Throws if an unqualified name matches in more than one EntityContainer.
 */
function findEdmxFunctionImport(
	schemas: JSONObject[],
	operationName: string,
): { operation: JSONObject; array: JSONObject[]; index: number } | undefined {
	const found: Array<{
		operation: JSONObject;
		array: JSONObject[];
		index: number;
		ns: string;
	}> = [];

	for (const schema of schemas) {
		const ns = schema["@_Namespace"];
		if (typeof ns !== "string") continue;

		let localName: string;
		if (operationName.startsWith(`${ns}.`)) {
			localName = operationName.substring(ns.length + 1);
		} else if (!operationName.includes(".")) {
			localName = operationName;
		} else {
			continue;
		}

		const container = getEdmxEntityContainer(schema);
		if (!container) continue;

		const fiArray = container.FunctionImport;
		if (!Array.isArray(fiArray)) continue;
		for (let i = 0; i < fiArray.length; i++) {
			const fi = fiArray[i];
			if (isJSONObject(fi) && fi["@_Name"] === localName) {
				found.push({
					operation: fi,
					array: fiArray as JSONObject[],
					index: i,
					ns,
				});
			}
		}
	}

	if (found.length > 1 && !operationName.includes(".")) {
		throw new OverlayMergeError(
			`Ambiguous operation selector "${operationName}": found ${found.length} FunctionImport matches across schemas [${found.map((f) => f.ns).join(", ")}]. ` +
				`Use a fully qualified name to disambiguate (e.g. "${found[0].ns}.${operationName}").`,
		);
	}

	if (found.length === 0) return undefined;
	return {
		operation: found[0].operation,
		array: found[0].array,
		index: found[0].index,
	};
}

// ─── EntityContainer navigation helpers ─────────────────────────────────────

/**
 * Returns the EntityContainer object from a single Schema, or undefined.
 * EntityContainer is treated as a direct object property (not an array) per OData spec.
 */
function getEdmxEntityContainer(schema: JSONObject): JSONObject | undefined {
	const container = schema.EntityContainer;
	if (isJSONObject(container)) {
		return container;
	}

	// Defensive: handle unlikely case where EntityContainer is an array
	if (
		Array.isArray(container) &&
		container.length > 0 &&
		isJSONObject(container[0])
	) {
		return container[0] as JSONObject;
	}

	return undefined;
}

/**
 * Finds an EntitySet by name across all schemas' EntityContainers.
 * Throws if an unqualified name matches in more than one EntityContainer.
 */
function findEdmxEntitySet(
	schemas: JSONObject[],
	entitySetName: string,
): { entitySet: JSONObject; array: JSONObject[]; index: number } | undefined {
	const found: Array<{
		entitySet: JSONObject;
		array: JSONObject[];
		index: number;
		ns: string;
	}> = [];

	for (const schema of schemas) {
		const ns = schema["@_Namespace"];
		if (typeof ns !== "string") continue;

		let localName: string;
		if (entitySetName.startsWith(`${ns}.`)) {
			localName = entitySetName.substring(ns.length + 1);
		} else if (!entitySetName.includes(".")) {
			localName = entitySetName;
		} else {
			continue;
		}

		const container = getEdmxEntityContainer(schema);
		if (!container) continue;

		const esArray = container.EntitySet;
		if (!Array.isArray(esArray)) continue;
		for (let i = 0; i < esArray.length; i++) {
			const es = esArray[i];
			if (isJSONObject(es) && es["@_Name"] === localName) {
				found.push({
					entitySet: es,
					array: esArray as JSONObject[],
					index: i,
					ns,
				});
			}
		}
	}

	if (found.length > 1 && !entitySetName.includes(".")) {
		throw new OverlayMergeError(
			`Ambiguous entitySet selector "${entitySetName}": found ${found.length} matches across EntityContainers [${found.map((f) => f.ns).join(", ")}]. ` +
				"Ensure the target document has a unique EntitySet name, or use a jsonPath selector to target a specific container.",
		);
	}

	if (found.length === 0) return undefined;
	return {
		entitySet: found[0].entitySet,
		array: found[0].array,
		index: found[0].index,
	};
}

/**
 * Finds a Schema element by its Namespace attribute.
 */
function findEdmxSchema(
	schemas: JSONObject[],
	namespaceName: string,
): JSONObject | undefined {
	return schemas.find((s) => s["@_Namespace"] === namespaceName);
}

/**
 * Finds a Parameter by name on an Action/Function/FunctionImport element.
 */
function findEdmxParameter(
	operation: JSONObject,
	parameterName: string,
): { param: JSONObject; parent: JSONObject[]; index: number } | undefined {
	const params = operation.Parameter;
	if (!Array.isArray(params)) return undefined;
	for (let i = 0; i < params.length; i++) {
		const p = params[i];
		if (isJSONObject(p) && p["@_Name"] === parameterName) {
			return { param: p, parent: params as JSONObject[], index: i };
		}
	}

	return undefined;
}

/**
 * Finds the ReturnType child element of an Action or Function.
 * ReturnType is always an array (added to ALWAYS_ARRAY_TAGS), so take index 0.
 */
function findEdmxReturnType(
	operation: JSONObject,
): { returnType: JSONObject; parent: JSONObject[]; index: number } | undefined {
	const rtArray = operation.ReturnType;
	if (
		Array.isArray(rtArray) &&
		rtArray.length > 0 &&
		isJSONObject(rtArray[0])
	) {
		return {
			returnType: rtArray[0] as JSONObject,
			parent: rtArray as JSONObject[],
			index: 0,
		};
	}

	return undefined;
}

/**
 * Converts a CSDL JSON annotation value to an XML Annotation element object
 * compatible with fast-xml-parser's tree format.
 *
 * Simple values (strings, booleans, numbers) map to attribute or child element form.
 * Objects with `@EnumMember` or `@Path` keys use OData expression form.
 * Arrays produce a `Collection` child element.
 * Plain objects produce a `Record` with `PropertyValue` entries.
 */
function csdlJsonValueToXmlAnnotationElement(
	termName: string,
	value: JSONValue,
): JSONObject {
	const element: JSONObject = { "@_Term": termName };

	if (typeof value === "string") {
		element.String = value;
	} else if (typeof value === "boolean") {
		element["@_Bool"] = String(value);
	} else if (typeof value === "number") {
		if (Number.isInteger(value)) {
			element["@_Int"] = String(value);
		} else {
			element["@_Decimal"] = String(value);
		}
	} else if (Array.isArray(value)) {
		element.Collection = convertCsdlJsonCollectionToXml(value);
	} else if (isJSONObject(value)) {
		if (typeof value["@EnumMember"] === "string") {
			element.EnumMember = value["@EnumMember"];
		} else if (typeof value["@Path"] === "string") {
			element["@_Path"] = value["@Path"];
		} else {
			element.Record = convertCsdlJsonRecordToXml(value);
		}
	}

	return element;
}

function convertCsdlJsonCollectionToXml(arr: JSONValue[]): JSONObject {
	const collection: JSONObject = {};
	const records: JSONObject[] = [];
	const strings: string[] = [];

	for (const item of arr) {
		if (isJSONObject(item)) {
			records.push(convertCsdlJsonRecordToXml(item));
		} else if (typeof item === "string") {
			strings.push(item);
		}
	}

	if (records.length > 0) {
		collection.Record = records;
	}

	if (strings.length > 0) {
		collection.String = strings;
	}

	return collection;
}

function convertCsdlJsonRecordToXml(obj: JSONObject): JSONObject {
	const propertyValues: JSONObject[] = [];

	for (const [key, value] of Object.entries(obj)) {
		if (key.startsWith("@")) continue; // skip nested annotation keys

		const pv: JSONObject = { "@_Property": key };

		if (typeof value === "string") {
			pv.String = value;
		} else if (typeof value === "boolean") {
			pv["@_Bool"] = String(value);
		} else if (typeof value === "number") {
			pv["@_Int"] = String(value);
		} else if (Array.isArray(value)) {
			pv.Collection = convertCsdlJsonCollectionToXml(value);
		} else if (isJSONObject(value)) {
			if (typeof value["@EnumMember"] === "string") {
				pv.EnumMember = value["@EnumMember"];
			} else {
				pv.Record = convertCsdlJsonRecordToXml(value);
			}
		}

		propertyValues.push(pv);
	}

	return { PropertyValue: propertyValues };
}

/**
 * Merges CSDL JSON annotation data into an EDMX element (EntityType, Property, Action, etc.)
 * by adding or replacing `<Annotation>` child elements.
 *
 * @param element - The parsed XML element object to update (mutated in place).
 * @param annotationData - Object whose `@`-prefixed keys are CSDL JSON annotation keys.
 * @param action - The patch action ("merge", "update", "append", "remove").
 */
function mergeAnnotationsIntoEdmxElement(
	element: JSONObject,
	annotationData: JSONObject,
	action: OverlayPatch["action"],
): void {
	if (!element.Annotation) {
		element.Annotation = [];
	}

	const annotations = element.Annotation as JSONObject[];

	for (const [key, value] of Object.entries(annotationData)) {
		if (!key.startsWith("@")) continue;

		const termName = key.substring(1);

		if (action === "remove" || value === null) {
			const idx = annotations.findIndex((a) => a["@_Term"] === termName);
			if (idx >= 0) annotations.splice(idx, 1);
			continue;
		}

		const newAnnotation = csdlJsonValueToXmlAnnotationElement(termName, value);
		const existingIdx = annotations.findIndex((a) => a["@_Term"] === termName);

		if (existingIdx >= 0) {
			if (action === "append" && typeof value === "string") {
				const existing = annotations[existingIdx];
				const existingStr = existing.String;
				existing.String =
					typeof existingStr === "string" ? existingStr + value : value;
			} else {
				// merge and update both replace the whole annotation term
				annotations[existingIdx] = newAnnotation;
			}
		} else {
			annotations.push(newAnnotation);
		}
	}

	if (annotations.length === 0) {
		delete element.Annotation;
	}
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Applies an ORD Overlay to an OData EDMX XML document string.
 *
 * Returns the patched EDMX XML as a string.
 *
 * Supported selectors: `entityType`, `propertyType`, `operation`.
 * The `jsonPath` and `ordId` selectors are not supported for EDMX targets.
 *
 * Patch data MUST use CSDL JSON annotation format (`@TermName` keys).
 * Annotations are added as `<Annotation>` child elements on the matched XML element.
 */
export function applyOverlayToEdmxDocument(
	xmlString: string,
	overlay: ORDOverlay,
	options: ApplyOverlayOptions = {},
): string {
	const validateOverlay = options.validateOverlaySemantics ?? true;
	if (validateOverlay) {
		const validation = validateOverlaySemantics(overlay, {
			context: options.context,
		});
		throwOnOverlayValidationErrors(validation.errors);
		emitOverlayValidationWarnings(validation.warnings);
	}

	const parser = buildXmlParser();
	const tree = parser.parse(xmlString) as Record<string, JSONValue>;

	const schemas = getEdmxSchemas(tree);
	if (schemas.length === 0) {
		throw new OverlayMergeError(
			"EDMX document does not contain any Schema elements.",
		);
	}

	const noMatchBehavior = options.noMatchBehavior ?? "error";

	overlay.patches.forEach((patch, patchIndex) => {
		const matched = applyEdmxPatch(schemas, patch);

		if (!matched) {
			const message = `Patch #${patchIndex + 1} did not match any target element in EDMX.`;
			if (noMatchBehavior === "error") {
				throw new OverlayMergeError(message);
			}

			if (noMatchBehavior === "warn") {
				console.warn(`[overlay-merge] ${message}`);
			}
		}
	});

	const builder = buildXmlBuilder();
	return builder.build(tree) as string;
}

function applyEdmxPatch(schemas: JSONObject[], patch: OverlayPatch): boolean {
	const { selector } = patch;

	if (isJSONObject(selector) && typeof selector.jsonPath === "string") {
		throw new OverlayMergeError(
			'The "jsonPath" selector is not supported for EDMX XML targets. Use entityType, propertyType, or operation selectors.',
		);
	}

	if (isJSONObject(selector) && typeof selector.ordId === "string") {
		throw new OverlayMergeError(
			'The "ordId" selector is not supported for EDMX XML targets. Use entityType, propertyType, or operation selectors.',
		);
	}

	if (
		isJSONObject(selector) &&
		typeof selector.entityType === "string" &&
		!("propertyType" in selector)
	) {
		const result = findEdmxEntityType(
			schemas,
			selector.entityType,
			"EntityType",
		);
		if (!result) return false;
		applyEdmxAnnotationPatch(result.entityType, patch);
		return true;
	}

	if (isJSONObject(selector) && typeof selector.complexType === "string") {
		const result = findEdmxEntityType(
			schemas,
			selector.complexType,
			"ComplexType",
		);
		if (!result) return false;
		applyEdmxAnnotationPatch(result.entityType, patch);
		return true;
	}

	if (
		isJSONObject(selector) &&
		typeof selector.enumType === "string" &&
		!("propertyType" in selector)
	) {
		const result = findEdmxEntityType(schemas, selector.enumType, "EnumType");
		if (!result) return false;
		applyEdmxAnnotationPatch(result.entityType, patch);
		return true;
	}

	if (isJSONObject(selector) && typeof selector.propertyType === "string") {
		// Determine parent type context: entityType, complexType, or enumType
		const entityTypeName =
			typeof (selector as Record<string, unknown>).entityType === "string"
				? (selector as { entityType: string }).entityType
				: undefined;
		const complexTypeName =
			typeof (selector as Record<string, unknown>).complexType === "string"
				? (selector as { complexType: string }).complexType
				: undefined;
		const enumTypeName =
			typeof (selector as Record<string, unknown>).enumType === "string"
				? (selector as { enumType: string }).enumType
				: undefined;

		// Derive typeKind from which context field is present
		let parentTypeName: string | undefined;
		let typeKind: string | undefined;
		if (entityTypeName !== undefined) {
			parentTypeName = entityTypeName;
			typeKind = "EntityType";
		} else if (complexTypeName !== undefined) {
			parentTypeName = complexTypeName;
			typeKind = "ComplexType";
		} else if (enumTypeName !== undefined) {
			parentTypeName = enumTypeName;
			typeKind = "EnumType";
		}

		if (parentTypeName !== undefined) {
			const entityResult = findEdmxEntityType(
				schemas,
				parentTypeName,
				typeKind,
			);
			if (!entityResult) return false;
			const propResult = findEdmxProperty(
				entityResult.entityType,
				selector.propertyType,
			);

			if (!propResult) return false;
			applyEdmxAnnotationPatch(propResult.prop, patch);
			return true;
		}

		// Search all entity types across all schemas (no parent type context provided)
		const typeArrayKeys = ["EntityType", "ComplexType", "EnumType"];
		let matched = false;
		for (const schema of schemas) {
			for (const typeArrayKey of typeArrayKeys) {
				const types = schema[typeArrayKey];
				if (!Array.isArray(types)) continue;
				for (const et of types) {
					if (!isJSONObject(et)) continue;
					const propResult = findEdmxProperty(et, selector.propertyType);
					if (propResult) {
						applyEdmxAnnotationPatch(propResult.prop, patch);
						matched = true;
					}
				}
			}
		}

		return matched;
	}

	if (
		isJSONObject(selector) &&
		typeof selector.operation === "string" &&
		!("parameter" in selector) &&
		!("returnType" in selector)
	) {
		const result = findEdmxOperation(schemas, selector.operation);
		if (!result) return false;
		applyEdmxAnnotationPatch(result.operation, patch);
		return true;
	}

	if (
		isJSONObject(selector) &&
		typeof selector.operation === "string" &&
		typeof (selector as Record<string, unknown>).parameter === "string"
	) {
		const paramName = (selector as unknown as { parameter: string }).parameter;
		const operationResult = findEdmxOperation(schemas, selector.operation);
		if (!operationResult) return false;
		const paramResult = findEdmxParameter(operationResult.operation, paramName);
		if (!paramResult) return false;
		applyEdmxAnnotationPatch(paramResult.param, patch);
		return true;
	}

	if (
		isJSONObject(selector) &&
		typeof selector.operation === "string" &&
		(selector as Record<string, unknown>).returnType === true
	) {
		const operationResult = findEdmxOperation(schemas, selector.operation);
		if (!operationResult) return false;
		const rtResult = findEdmxReturnType(operationResult.operation);
		if (!rtResult) return false;
		applyEdmxAnnotationPatch(rtResult.returnType, patch);
		return true;
	}

	if (isJSONObject(selector) && typeof selector.entitySet === "string") {
		const result = findEdmxEntitySet(schemas, selector.entitySet);
		if (!result) return false;
		applyEdmxAnnotationPatch(result.entitySet, patch);
		return true;
	}

	if (isJSONObject(selector) && typeof selector.namespace === "string") {
		const result = findEdmxSchema(schemas, selector.namespace);
		if (!result) return false;
		applyEdmxAnnotationPatch(result, patch);
		return true;
	}

	throw new OverlayMergeError(
		"Unsupported selector for EDMX target. Supported selectors are: entityType, complexType, enumType, propertyType, operation, entitySet, namespace, parameter, returnType.",
	);
}

function applyEdmxAnnotationPatch(
	element: JSONObject,
	patch: OverlayPatch,
): void {
	if (patch.action === "remove") {
		if (patch.data === undefined) {
			// Remove the entire Annotation array
			delete element.Annotation;
			return;
		}

		if (!isJSONObject(patch.data)) {
			throw new OverlayMergeError(
				"EDMX remove patch with data requires an object with @-prefixed annotation keys to remove.",
			);
		}

		mergeAnnotationsIntoEdmxElement(
			element,
			patch.data as JSONObject,
			"remove",
		);
		return;
	}

	if (patch.data === undefined) {
		throw new OverlayMergeError(
			`Patch action "${patch.action}" requires data.`,
		);
	}

	if (!isJSONObject(patch.data)) {
		throw new OverlayMergeError(
			"EDMX annotation patches require data to be an object with @-prefixed annotation keys.",
		);
	}

	mergeAnnotationsIntoEdmxElement(
		element,
		patch.data as JSONObject,
		patch.action,
	);
}
