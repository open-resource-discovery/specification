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
 */
function findEdmxEntityType(
	schemas: JSONObject[],
	entityTypeName: string,
): { entityType: JSONObject; array: JSONObject[]; index: number } | undefined {
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

		for (const typeArrayKey of ["EntityType", "ComplexType"]) {
			const typeArray = schema[typeArrayKey];
			if (!Array.isArray(typeArray)) continue;
			for (let i = 0; i < typeArray.length; i++) {
				const et = typeArray[i];
				if (isJSONObject(et) && et["@_Name"] === localName) {
					return {
						entityType: et,
						array: typeArray as JSONObject[],
						index: i,
					};
				}
			}
		}
	}

	return undefined;
}

/**
 * Finds a Property or NavigationProperty by name on an EntityType/ComplexType JSON object.
 */
function findEdmxProperty(
	entityType: JSONObject,
	propertyName: string,
): { prop: JSONObject; parent: JSONObject[]; index: number } | undefined {
	for (const propArrayKey of ["Property", "NavigationProperty"]) {
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
 */
function findEdmxOperation(
	schemas: JSONObject[],
	operationName: string,
): { operation: JSONObject; array: JSONObject[]; index: number } | undefined {
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
					return { operation: op, array: ops as JSONObject[], index: i };
				}
			}
		}
	}

	return undefined;
}

// ─── CSDL JSON annotation → XML Annotation element conversion ──────────────

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
		const result = findEdmxEntityType(schemas, selector.entityType);
		if (!result) return false;
		applyEdmxAnnotationPatch(result.entityType, patch);
		return true;
	}

	if (isJSONObject(selector) && typeof selector.propertyType === "string") {
		const entityTypeName =
			typeof (selector as Record<string, unknown>).entityType === "string"
				? (selector as { entityType: string }).entityType
				: undefined;

		if (entityTypeName !== undefined) {
			const entityResult = findEdmxEntityType(schemas, entityTypeName);
			if (!entityResult) return false;
			const propResult = findEdmxProperty(
				entityResult.entityType,
				selector.propertyType,
			);

			if (!propResult) return false;
			applyEdmxAnnotationPatch(propResult.prop, patch);
			return true;
		}

		// Search all entity types across all schemas
		let matched = false;
		for (const schema of schemas) {
			for (const typeArrayKey of ["EntityType", "ComplexType"]) {
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

	if (isJSONObject(selector) && typeof selector.operation === "string") {
		const result = findEdmxOperation(schemas, selector.operation);
		if (!result) return false;
		applyEdmxAnnotationPatch(result.operation, patch);
		return true;
	}

	throw new OverlayMergeError(
		"Unsupported selector for EDMX target. Supported selectors are: entityType, propertyType, operation.",
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
