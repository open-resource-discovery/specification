/**
 * Converter: OData v2 Enrichment format → ORD Overlay format.
 *
 * Source format: tmp/cto-api-docs/integration/kg/odatav2/schemas/enrichment.json
 *
 * Mapping:
 *   entityTypes[].{name, summary, description}            → entityType selector + @Core.Description / @Core.LongDescription
 *   entityTypes[].properties[].{name, summary, description} → propertyType + entityType selectors
 *   complexTypes[].{name, summary, description}           → entityType selector (ORD overlay supports ComplexType via entityType)
 *   complexTypes[].properties[].{name, summary, description} → propertyType + entityType selectors
 *   entitySets[].{name, summary, description}             → entitySet selector + @Core.Description / @Core.LongDescription
 *   functionImports[].{name, summary, description}        → operation selector (namespace-qualified)
 *                                                            For EDMX targets, the operation selector also searches
 *                                                            EntityContainer FunctionImport elements as a fallback.
 *   functionImports[].parameters[].{name, summary, description} → parameter + operation selectors
 *
 * Known model mismatches (see README.md for details):
 *
 * 1. tags — No standard OData vocabulary term for string tags.
 *    Tags are preserved in `patch.tags` so consumers can use them for filtering/categorization.
 *
 * Patch data convention:
 *   OData targets require CSDL JSON annotation format in patch data.
 *   `summary`     → @Core.Description   (single-line human-readable label)
 *   `description` → @Core.LongDescription (detailed prose)
 *
 * Namespace handling:
 *   OData v2 enrichment files do not embed a namespace. The EDMX merge implementation
 *   accepts unqualified names for entityType / propertyType selectors and resolves them
 *   by scanning all Schema elements. When `options.odataNamespace` is provided, selectors
 *   use the namespace-qualified form (e.g. `Namespace.EntityTypeName`) which is more precise.
 */
import type { ORDOverlay, OverlayPatch } from "../generated/spec/v1/types";
import type {
	ConversionResult,
	ConversionWarning,
	ConvertOptions,
	ODataV2Enrichment,
	ODataV2Property,
} from "./types";

function qualifiedName(localName: string, namespace?: string): string {
	return namespace !== undefined ? `${namespace}.${localName}` : localName;
}

function descriptionAnnotations(summary: string, description: string) {
	return {
		"@Core.Description": summary,
		"@Core.LongDescription": description,
	};
}

function patchTags(tags: string[]): { tags: [string, ...string[]] } {
	return { tags: tags as [string, ...string[]] };
}

export function convertODataV2EnrichmentToOrd(
	source: ODataV2Enrichment,
	options: ConvertOptions = {},
): ConversionResult {
	const warnings: ConversionWarning[] = [];
	const patches: OverlayPatch[] = [];
	const ns = options.odataNamespace;

	// entityTypes
	for (const et of source.entityTypes ?? []) {
		const selector = qualifiedName(et.name, ns);

		patches.push({
			action: "merge",
			selector: { entityType: selector },
			data: descriptionAnnotations(et.summary, et.description),
			...((et.tags ?? []).length > 0 ? patchTags(et.tags!) : {}),
		});

		for (const prop of et.properties ?? []) {
			patches.push(makePropertyPatch(prop, selector));
		}
	}

	// complexTypes — ORD overlay entityType selector also resolves ComplexType elements
	for (const ct of source.complexTypes ?? []) {
		const selector = qualifiedName(ct.name, ns);

		patches.push({
			action: "merge",
			selector: { entityType: selector },
			data: descriptionAnnotations(ct.summary, ct.description),
			...((ct.tags ?? []).length > 0 ? patchTags(ct.tags!) : {}),
		});

		for (const prop of ct.properties ?? []) {
			patches.push(makePropertyPatch(prop, selector));
		}
	}

	// entitySets — use the entitySet concept-level selector
	for (const es of source.entitySets ?? []) {
		const selector = qualifiedName(es.name, ns);

		patches.push({
			action: "merge",
			selector: { entitySet: selector },
			data: descriptionAnnotations(es.summary, es.description),
			...((es.tags ?? []).length > 0 ? patchTags(es.tags!) : {}),
		});
	}

	// functionImports — use the operation selector.
	// For EDMX targets, the operation selector also searches EntityContainer FunctionImport
	// elements as a fallback when no Schema-level Action/Function matches the name.
	for (const fi of source.functionImports ?? []) {
		const selector = qualifiedName(fi.name, ns);

		patches.push({
			action: "merge",
			selector: { operation: selector },
			data: descriptionAnnotations(fi.summary, fi.description),
			...((fi.tags ?? []).length > 0 ? patchTags(fi.tags!) : {}),
		});

		for (const param of fi.parameters ?? []) {
			patches.push({
				action: "merge",
				selector: { parameter: param.name, operation: selector },
				data: descriptionAnnotations(param.summary, param.description),
			});
		}
	}

	if (patches.length === 0) {
		throw new Error(
			"Conversion produced zero patches — the resulting ORD overlay would be invalid.",
		);
	}

	const description =
		options.description ?? "Converted from OData v2 enrichment format.";

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

function makePropertyPatch(
	prop: ODataV2Property,
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
