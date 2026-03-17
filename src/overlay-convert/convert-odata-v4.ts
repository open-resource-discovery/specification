/**
 * Converter: OData v4 Enrichment format → ORD Overlay format.
 *
 * Source format: tmp/cto-api-docs/integration/kg/odatav4/schemas/enrichment.json
 *
 * Mapping:
 *   root.{summary, description}                           → entityType-level patch on the Schema namespace
 *                                                             (no Schema-level selector exists; see warning below)
 *   entityTypes[].{name, summary, description}            → entityType selector + @Core.Description / @Core.LongDescription
 *   entityTypes[].properties[].{name, summary, description} → propertyType + entityType selectors
 *   complexTypes[].{name, summary, description}           → entityType selector (ORD overlay supports ComplexType via entityType)
 *   complexTypes[].properties[].{name, summary, description} → propertyType + entityType selectors
 *   actions[].{name, summary, description}                → operation selector (namespace-qualified)
 *   functions[].{name, summary, description}              → operation selector (namespace-qualified)
 *
 * Known model mismatches (see README.md for details):
 *
 * 1. Service-level metadata (root summary/description) — No ORD overlay selector targets a
 *    Schema element by namespace. The Schema-level description is SKIPPED with a warning.
 *    Suggested fix: add a `namespace` or `schema` concept-level selector.
 *
 * 2. entitySets — NO concept-level selector for EntitySet (which lives in EntityContainer).
 *    Converted entries are SKIPPED with a warning.
 *    Suggested fix: add an `entitySet` selector type to the ORD overlay spec.
 *
 * 3. actionImports / functionImports — these are aliases in EntityContainer for the
 *    underlying Action/Function. The enrichment format treats them separately, but the
 *    ORD overlay `operation` selector targets Schema-level Action/Function, not EntityContainer imports.
 *    These entries are SKIPPED with a warning. Enrich the corresponding `actions[]` / `functions[]`
 *    entry instead.
 *
 * 4. enumTypes — No concept-level selector for EnumType. The ORD overlay `entityType` selector
 *    only resolves EntityType and ComplexType elements. EnumType enrichment is SKIPPED with a warning.
 *    Suggested fix: extend the `entityType` selector to also resolve EnumType, or add an `enumType` selector.
 *
 * 5. actions[].parameters / functions[].parameters — No parameter-level selector in ORD overlay.
 *    Parameter enrichment is SKIPPED with a warning.
 *
 * 6. actions[].returnType / functions[].returnType — OData v4 return types are sub-elements
 *    of Action/Function. No return-type selector exists. ReturnType enrichment is SKIPPED with a warning.
 *
 * 7. tags — No standard OData vocabulary term for string tags. Tags are SKIPPED with a warning.
 *
 * Patch data convention:
 *   OData targets require CSDL JSON annotation format in patch data.
 *   `summary`     → @Core.Description   (single-line human-readable label)
 *   `description` → @Core.LongDescription (detailed prose)
 */
import type { ORDOverlay, OverlayPatch } from "../generated/spec/v1/types";
import type {
	ConversionResult,
	ConversionWarning,
	ConvertOptions,
	ODataV4Action,
	ODataV4ComplexType,
	ODataV4Enrichment,
	ODataV4EntityType,
	ODataV4Function,
	ODataV4Property,
} from "./types";

function descriptionAnnotations(summary: string, description: string) {
	return {
		"@Core.Description": summary,
		"@Core.LongDescription": description,
	};
}

function warnTags(
	entityKind: string,
	entityName: string,
	warnings: ConversionWarning[],
): void {
	warnings.push({
		type: "lost-information",
		field: `${entityKind}[name="${entityName}"].tags`,
		message: `Tags for ${entityKind} "${entityName}" were discarded — no standard OData vocabulary term for string tags. Consider a custom annotation.`,
	});
}

function warnParameters(
	entityKind: string,
	entityName: string,
	warnings: ConversionWarning[],
): void {
	warnings.push({
		type: "unsupported-concept",
		field: `${entityKind}[name="${entityName}"].parameters`,
		message:
			`Parameter enrichment for ${entityKind} "${entityName}" was discarded — ` +
			"the ORD overlay specification does not provide a parameter-level selector.",
	});
}

function warnReturnType(
	entityKind: string,
	entityName: string,
	warnings: ConversionWarning[],
): void {
	warnings.push({
		type: "unsupported-concept",
		field: `${entityKind}[name="${entityName}"].returnType`,
		message:
			`ReturnType enrichment for ${entityKind} "${entityName}" was discarded — ` +
			"the ORD overlay specification does not provide a return-type selector. " +
			"The return type is a sub-element of the Action/Function and cannot be targeted separately.",
	});
}

export function convertODataV4EnrichmentToOrd(
	source: ODataV4Enrichment,
	options: ConvertOptions = {},
): ConversionResult {
	const warnings: ConversionWarning[] = [];
	const patches: OverlayPatch[] = [];
	const ns = options.odataNamespace ?? source.namespace;

	// Service-level summary/description: targets the Schema element, but no ORD overlay
	// selector can address a Schema by namespace. Skip with warning.
	warnings.push({
		type: "needs-spec-extension",
		field: "root.summary / root.description",
		message:
			`Service-level summary and description for namespace "${source.namespace}" were discarded — ` +
			"the ORD overlay specification does not provide a concept-level selector for the Schema element. " +
			"Suggested fix: add a `namespace` or `schema` selector type to the ORD overlay spec. " +
			"As a workaround, use a jsonPath selector targeting the Schema in CSDL JSON format.",
	});

	// entityTypes
	for (const et of source.entityTypes ?? []) {
		addEntityTypePatches(et, ns, patches, warnings, "entityTypes");
	}

	// complexTypes — ORD overlay entityType selector also resolves ComplexType elements
	for (const ct of source.complexTypes ?? []) {
		addEntityTypePatches(ct, ns, patches, warnings, "complexTypes");
	}

	// entitySets — no concept-level selector; skip
	for (const es of source.entitySets ?? []) {
		warnings.push({
			type: "unsupported-concept",
			field: `entitySets[name="${es.name}"]`,
			message:
				`EntitySet "${es.name}" cannot be converted to an ORD overlay patch: ` +
				"the ORD overlay specification does not provide a concept-level selector for EntitySet elements " +
				"(which reside in EntityContainer, not in the Schema). " +
				"Suggested fix: add an `entitySet` selector type to the ORD overlay spec.",
		});
	}

	// enumTypes — no concept-level selector; skip
	for (const en of source.enumTypes ?? []) {
		warnings.push({
			type: "unsupported-concept",
			field: `enumTypes[name="${en.name}"]`,
			message:
				`EnumType "${en.name}" cannot be converted to an ORD overlay patch: ` +
				"the ORD overlay `entityType` selector only resolves EntityType and ComplexType elements. " +
				"Suggested fix: extend the `entityType` selector to also resolve EnumType, " +
				"or add a dedicated `enumType` selector type.",
		});
	}

	// actions — Schema-level, namespace-qualified name, use `operation` selector
	for (const action of source.actions ?? []) {
		addOperationPatches(action, ns, patches, warnings, "actions");
	}

	// functions — Schema-level, namespace-qualified name, use `operation` selector
	for (const fn of source.functions ?? []) {
		addOperationPatches(fn, ns, patches, warnings, "functions");
	}

	// actionImports — EntityContainer level; no concept-level selector
	for (const ai of source.actionImports ?? []) {
		warnings.push({
			type: "unsupported-concept",
			field: `actionImports[name="${ai.name}"]`,
			message:
				`ActionImport "${ai.name}" cannot be converted: ActionImports reside in EntityContainer. ` +
				"The ORD overlay `operation` selector targets Schema-level Action/Function elements. " +
				"Enrich the corresponding `actions` entry instead.",
		});
	}

	// functionImports — EntityContainer level; no concept-level selector
	for (const fi of source.functionImports ?? []) {
		warnings.push({
			type: "unsupported-concept",
			field: `functionImports[name="${fi.name}"]`,
			message:
				`FunctionImport "${fi.name}" cannot be converted: FunctionImports reside in EntityContainer. ` +
				"The ORD overlay `operation` selector targets Schema-level Action/Function elements. " +
				"Enrich the corresponding `functions` entry instead.",
		});
	}

	if (patches.length === 0) {
		throw new Error(
			"Conversion produced zero patches — the resulting ORD overlay would be invalid.",
		);
	}

	const description =
		options.description ??
		`Converted from OData v4 enrichment format (namespace: ${source.namespace}).`;

	const result: ORDOverlay = {
		$schema:
			"https://open-resource-discovery.org/spec-extension/models/OrdOverlay.schema.json#",
		ordOverlay: "0.1",
		...(options.ordId !== undefined ? { ordId: options.ordId } : {}),
		description,
		...(options.target !== undefined ? { target: options.target } : {}),
		patches: patches as [OverlayPatch, ...OverlayPatch[]],
	};

	return { overlay: result, warnings };
}

function addEntityTypePatches(
	et: ODataV4EntityType | ODataV4ComplexType,
	namespace: string,
	patches: OverlayPatch[],
	warnings: ConversionWarning[],
	entityKind: string,
): void {
	const qualifiedSelector = `${namespace}.${et.name}`;

	patches.push({
		action: "merge",
		selector: { entityType: qualifiedSelector },
		data: descriptionAnnotations(et.summary, et.description),
	});

	if ((et.tags ?? []).length > 0) {
		warnTags(entityKind, et.name, warnings);
	}

	for (const prop of et.properties ?? []) {
		patches.push(makePropertyPatch(prop, qualifiedSelector));
	}
}

function addOperationPatches(
	op: ODataV4Action | ODataV4Function,
	namespace: string,
	patches: OverlayPatch[],
	warnings: ConversionWarning[],
	entityKind: string,
): void {
	const qualifiedSelector = `${namespace}.${op.name}`;

	patches.push({
		action: "merge",
		selector: { operation: qualifiedSelector },
		data: descriptionAnnotations(op.summary, op.description),
	});

	if ((op.tags ?? []).length > 0) {
		warnTags(entityKind, op.name, warnings);
	}

	if ((op.parameters ?? []).length > 0) {
		warnParameters(entityKind, op.name, warnings);
	}

	if (op.returnType !== undefined) {
		warnReturnType(entityKind, op.name, warnings);
	}
}

function makePropertyPatch(
	prop: ODataV4Property,
	entityTypeName: string,
): OverlayPatch {
	return {
		action: "merge",
		selector: {
			propertyType: prop.name,
			entityType: entityTypeName,
		},
		data: descriptionAnnotations(prop.summary, prop.description),
	};
}
