/**
 * Converter: OData v4 Enrichment format → ORD Overlay format.
 *
 * Source format: tmp/cto-api-docs/integration/kg/odatav4/schemas/enrichment.json
 *
 * Mapping:
 *   root.{summary, description}                           → namespace selector + @Core.Description / @Core.LongDescription
 *   entityTypes[].{name, summary, description}            → entityType selector + @Core.Description / @Core.LongDescription
 *   entityTypes[].properties[].{name, summary, description} → propertyType + entityType selectors
 *   complexTypes[].{name, summary, description}           → entityType selector (ORD overlay supports ComplexType via entityType)
 *   complexTypes[].properties[].{name, summary, description} → propertyType + entityType selectors
 *   entitySets[].{name, summary, description}             → entitySet selector + @Core.Description / @Core.LongDescription
 *   enumTypes[].{name, summary, description}              → entityType selector (ORD overlay entityType also resolves EnumType)
 *   enumTypes[].members[].{name, summary, description}    → propertyType + entityType selectors
 *   actions[].{name, summary, description}                → operation selector (namespace-qualified)
 *   actions[].parameters[].{name, summary, description}   → parameter + operation selectors
 *   actions[].returnType.{summary, description}           → returnType selector
 *   functions[].{name, summary, description}              → operation selector (namespace-qualified)
 *   functions[].parameters[].{name, summary, description} → parameter + operation selectors
 *   functions[].returnType.{summary, description}         → returnType selector
 *
 * Known model mismatches (see README.md for details):
 *
 * 1. actionImports / functionImports — these are aliases in EntityContainer for the
 *    underlying Action/Function. The ORD overlay `operation` selector targets
 *    Schema-level Action/Function, not EntityContainer imports.
 *    These entries are SKIPPED. Enrich the corresponding `actions[]` / `functions[]` entry instead.
 *
 * 2. tags — No standard OData vocabulary term for string tags. Tags are SKIPPED with a warning.
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

export function convertODataV4EnrichmentToOrd(
	source: ODataV4Enrichment,
	options: ConvertOptions = {},
): ConversionResult {
	const warnings: ConversionWarning[] = [];
	const patches: OverlayPatch[] = [];
	const ns = options.odataNamespace ?? source.namespace;

	// Service-level summary/description — use the namespace selector
	if (source.summary || source.description) {
		patches.push({
			action: "merge",
			selector: { namespace: source.namespace },
			data: descriptionAnnotations(source.summary, source.description),
		});
	}

	// entityTypes
	for (const et of source.entityTypes ?? []) {
		addEntityTypePatches(et, ns, patches, warnings, "entityTypes");
	}

	// complexTypes — ORD overlay entityType selector also resolves ComplexType elements
	for (const ct of source.complexTypes ?? []) {
		addEntityTypePatches(ct, ns, patches, warnings, "complexTypes");
	}

	// entitySets — use the entitySet concept-level selector
	for (const es of source.entitySets ?? []) {
		patches.push({
			action: "merge",
			selector: { entitySet: es.name },
			data: descriptionAnnotations(es.summary, es.description),
		});

		if ((es.tags ?? []).length > 0) {
			warnTags("entitySets", es.name, warnings);
		}
	}

	// enumTypes — the entityType selector also resolves EnumType elements.
	// Enum members are targeted with propertyType + entityType selectors.
	for (const en of source.enumTypes ?? []) {
		const qualifiedSelector = `${ns}.${en.name}`;

		patches.push({
			action: "merge",
			selector: { entityType: qualifiedSelector },
			data: descriptionAnnotations(en.summary, en.description),
		});

		for (const member of en.members ?? []) {
			patches.push({
				action: "merge",
				selector: { propertyType: member.name, entityType: qualifiedSelector },
				data: descriptionAnnotations(member.summary, member.description),
			});
		}
	}

	// actions — Schema-level, namespace-qualified name, use `operation` selector
	for (const action of source.actions ?? []) {
		addOperationPatches(action, ns, patches, warnings, "actions");
	}

	// functions — Schema-level, namespace-qualified name, use `operation` selector
	for (const fn of source.functions ?? []) {
		addOperationPatches(fn, ns, patches, warnings, "functions");
	}

	// actionImports — EntityContainer-level aliases for Schema-level Actions.
	// Patch the corresponding `actions` entry instead.
	for (const ai of source.actionImports ?? []) {
		warnings.push({
			type: "unsupported-concept",
			field: `actionImports[name="${ai.name}"]`,
			message:
				`ActionImport "${ai.name}" was skipped: ActionImports are EntityContainer aliases. ` +
				"Enrich the corresponding `actions` entry instead.",
		});
	}

	// functionImports — EntityContainer-level aliases for Schema-level Functions.
	// Patch the corresponding `functions` entry instead.
	for (const fi of source.functionImports ?? []) {
		warnings.push({
			type: "unsupported-concept",
			field: `functionImports[name="${fi.name}"]`,
			message:
				`FunctionImport "${fi.name}" was skipped: FunctionImports are EntityContainer aliases. ` +
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

	for (const param of op.parameters ?? []) {
		patches.push({
			action: "merge",
			selector: { parameter: param.name, operation: qualifiedSelector },
			data: descriptionAnnotations(param.summary, param.description),
		});
	}

	if (op.returnType !== undefined) {
		patches.push({
			action: "merge",
			selector: { returnType: true, operation: qualifiedSelector },
			data: descriptionAnnotations(op.returnType.summary, op.returnType.description),
		});
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
