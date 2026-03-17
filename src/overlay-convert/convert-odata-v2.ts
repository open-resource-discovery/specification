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
 *
 * Known model mismatches (see README.md for details):
 *
 * 1. entitySets — NO concept-level selector in ORD overlay for EntitySet (which lives in
 *    EntityContainer, not in the Schema). Converted entries are SKIPPED with a warning.
 *    Suggested spec extension: add an `entitySet` selector type.
 *
 * 2. functionImports — In OData v2, FunctionImport elements are defined inside EntityContainer.
 *    The ORD overlay `operation` selector for EDMX targets only resolves Action/Function elements
 *    at the Schema level, not FunctionImport elements in EntityContainer.
 *    Converted entries are generated using `operation` selector but will NOT resolve against
 *    EDMX targets until the EDMX operation selector is extended to also search EntityContainer.
 *    A `needs-spec-extension` warning is emitted for each FunctionImport.
 *
 * 3. functionImports[].parameters — No parameter-level selector in ORD overlay.
 *    Parameter enrichment is SKIPPED with a warning.
 *
 * 4. tags — No standard OData vocabulary term for string tags.
 *    Tags are SKIPPED with a warning.
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
		});

		if ((et.tags ?? []).length > 0) {
			warnings.push({
				type: "lost-information",
				field: `entityTypes[name="${et.name}"].tags`,
				message: `Tags for entityType "${et.name}" were discarded — no standard OData vocabulary term for string tags. Consider a custom annotation.`,
			});
		}

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
		});

		if ((ct.tags ?? []).length > 0) {
			warnings.push({
				type: "lost-information",
				field: `complexTypes[name="${ct.name}"].tags`,
				message: `Tags for complexType "${ct.name}" were discarded — no standard OData vocabulary term for string tags. Consider a custom annotation.`,
			});
		}

		for (const prop of ct.properties ?? []) {
			patches.push(makePropertyPatch(prop, selector));
		}
	}

	// entitySets — no concept-level selector available; skip with warning
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

	// functionImports — FunctionImport lives in EntityContainer, not the Schema.
	// The `operation` selector for EDMX only resolves Schema-level Action/Function elements.
	// We generate patches optimistically, but warn that EDMX resolution will fail until extended.
	for (const fi of source.functionImports ?? []) {
		const selector = qualifiedName(fi.name, ns);

		warnings.push({
			type: "needs-spec-extension",
			field: `functionImports[name="${fi.name}"]`,
			message:
				`FunctionImport "${fi.name}" was converted using the \`operation\` selector, ` +
				"but OData v2 FunctionImport elements reside in EntityContainer — not in the Schema. " +
				"The current EDMX `operation` selector only resolves Schema-level Action/Function elements. " +
				"This patch will not resolve against EDMX targets until the selector is extended to also " +
				"search EntityContainer for FunctionImport.",
		});

		patches.push({
			action: "merge",
			selector: { operation: selector },
			data: descriptionAnnotations(fi.summary, fi.description),
		});

		if ((fi.tags ?? []).length > 0) {
			warnings.push({
				type: "lost-information",
				field: `functionImports[name="${fi.name}"].tags`,
				message: `Tags for functionImport "${fi.name}" were discarded — no standard OData vocabulary term for string tags.`,
			});
		}

		if ((fi.parameters ?? []).length > 0) {
			warnings.push({
				type: "unsupported-concept",
				field: `functionImports[name="${fi.name}"].parameters`,
				message:
					`Parameter enrichment for FunctionImport "${fi.name}" was discarded — ` +
					"the ORD overlay specification does not provide a parameter-level selector.",
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
