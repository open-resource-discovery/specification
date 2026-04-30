/**
 * Converter: OData v4 Enrichment format → ORD Overlay format.
 *
 * Source format: tmp/cto-api-docs/integration/kg/odatav4/schemas/enrichment.json
 *
 * Mapping:
 *   root.{summary, description}                           → namespace selector + @Core.Description / @Core.LongDescription
 *   entityTypes[].{name, summary, description}            → entityType selector + @Core.Description / @Core.LongDescription
 *   entityTypes[].properties[].{name, summary, description} → nested inside entityType patch data (recursive merge)
 *   complexTypes[].{name, summary, description}           → complexType selector + @Core.Description / @Core.LongDescription
 *   complexTypes[].properties[].{name, summary, description} → nested inside complexType patch data (recursive merge)
 *   entitySets[].{name, summary, description}             → entitySet selector + @Core.Description / @Core.LongDescription
 *   enumTypes[].{name, summary, description}              → enumType selector + @Core.Description / @Core.LongDescription
 *   enumTypes[].members[].{name, summary, description}    → nested inside enumType patch data (recursive merge)
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
 *    Import entries are NOT separately patched. Instead, if a matching actions[]/functions[]
 *    entry already exists, the import description is compared and a warning is emitted when
 *    they differ (the op description wins). If no matching op exists, a patch is generated
 *    from the import itself and a `needs-spec-extension` warning is emitted.
 *
 * 2. tags — No standard OData vocabulary term for string tags.
 *    Tags are preserved in `patch.tags` so consumers can use them for filtering/categorization.
 *
 * Patch data convention:
 *   OData targets require CSDL JSON annotation format in patch data.
 *   `summary`     → @Core.Description   (single-line human-readable label)
 *   `description` → @Core.LongDescription (detailed prose)
 *
 * Recursive merge format:
 *   Properties/members are nested directly inside their parent type's patch data.
 *   This is more compact and mirrors the CSDL JSON structure. Example:
 *   {
 *     "@Core.Description": "Entity description",
 *     "PropertyName": { "@Core.Description": "Property description" }
 *   }
 */
import type { ORDOverlay, OverlayPatch } from "../generated/spec/v1/types";
import type {
	ConversionResult,
	ConversionWarning,
	ConvertOptions,
	ODataV4Action,
	ODataV4ActionImport,
	ODataV4ComplexType,
	ODataV4Enrichment,
	ODataV4EntityType,
	ODataV4Function,
	ODataV4FunctionImport,
} from "./types";

function descriptionAnnotations(summary: string, description: string) {
	return {
		"@Core.Description": summary,
		"@Core.LongDescription": description,
	};
}

function patchTags(tags: string[]): { tags: [string, ...string[]] } {
	return { tags: tags as [string, ...string[]] };
}

function patchTagsIfPresent(
	tags: string[] | undefined,
): Partial<Pick<OverlayPatch, "tags">> {
	return tags !== undefined && tags.length > 0 ? patchTags(tags) : {};
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
		addEntityTypePatches(et, ns, patches, warnings);
	}

	// complexTypes — use complexType selector
	for (const ct of source.complexTypes ?? []) {
		addComplexTypePatches(ct, ns, patches, warnings);
	}

	// entitySets — use the entitySet concept-level selector
	for (const es of source.entitySets ?? []) {
		patches.push({
			action: "merge",
			selector: { entitySet: es.name },
			data: descriptionAnnotations(es.summary, es.description),
			...patchTagsIfPresent(es.tags),
		});
	}

	// enumTypes — use enumType selector with nested members
	for (const en of source.enumTypes ?? []) {
		const qualifiedSelector = `${ns}.${en.name}`;

		// Build data with nested member annotations (recursive merge format)
		const data: Record<string, unknown> = descriptionAnnotations(
			en.summary,
			en.description,
		);

		// Add member annotations nested directly in the type's data
		for (const member of en.members ?? []) {
			data[member.name] = descriptionAnnotations(
				member.summary,
				member.description,
			);
		}

		patches.push({
			action: "merge",
			selector: { enumType: qualifiedSelector },
			data,
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

	// Build an index of operation patches already generated (by qualified operation name)
	// so that actionImports/functionImports can be merged onto them.
	const opPatchIndex = new Map<string, OverlayPatch>();
	for (const patch of patches) {
		if (typeof patch.selector === "object" && "operation" in patch.selector) {
			opPatchIndex.set(patch.selector.operation as string, patch);
		}
	}

	// actionImports — EntityContainer-level aliases for Schema-level Actions.
	// Merge onto the existing actions[] patch when one exists; generate a new patch otherwise.
	for (const ai of source.actionImports ?? []) {
		mergeImportOntoOperation(
			ai,
			ns,
			"actionImport",
			opPatchIndex,
			patches,
			warnings,
		);
	}

	// functionImports — EntityContainer-level aliases for Schema-level Functions.
	// Merge onto the existing functions[] patch when one exists; generate a new patch otherwise.
	for (const fi of source.functionImports ?? []) {
		mergeImportOntoOperation(
			fi,
			ns,
			"functionImport",
			opPatchIndex,
			patches,
			warnings,
		);
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
			"https://open-resource-discovery.org/spec-v1/interfaces/OrdOverlay.schema.json#",
		ordOverlay: "0.1",
		...(options.ordId !== undefined ? { ordId: options.ordId } : {}),
		description,
		...(options.target !== undefined ? { target: options.target } : {}),
		patches: patches as [OverlayPatch, ...OverlayPatch[]],
	};

	return { overlay: result, warnings };
}

function addEntityTypePatches(
	et: ODataV4EntityType,
	namespace: string,
	patches: OverlayPatch[],
	_warnings: ConversionWarning[],
): void {
	const qualifiedSelector = `${namespace}.${et.name}`;

	// Build data with nested property annotations (recursive merge format)
	const data: Record<string, unknown> = descriptionAnnotations(
		et.summary,
		et.description,
	);

	// Add property annotations nested directly in the type's data
	for (const prop of et.properties ?? []) {
		data[prop.name] = descriptionAnnotations(prop.summary, prop.description);
	}

	patches.push({
		action: "merge",
		selector: { entityType: qualifiedSelector },
		data,
		...patchTagsIfPresent(et.tags),
	});
}

function addComplexTypePatches(
	ct: ODataV4ComplexType,
	namespace: string,
	patches: OverlayPatch[],
	_warnings: ConversionWarning[],
): void {
	const qualifiedSelector = `${namespace}.${ct.name}`;

	// Build data with nested property annotations (recursive merge format)
	const data: Record<string, unknown> = descriptionAnnotations(
		ct.summary,
		ct.description,
	);

	// Add property annotations nested directly in the type's data
	for (const prop of ct.properties ?? []) {
		data[prop.name] = descriptionAnnotations(prop.summary, prop.description);
	}

	patches.push({
		action: "merge",
		selector: { complexType: qualifiedSelector },
		data,
		...patchTagsIfPresent(ct.tags),
	});
}

function addOperationPatches(
	op: ODataV4Action | ODataV4Function,
	namespace: string,
	patches: OverlayPatch[],
	_warnings: ConversionWarning[],
	_entityKind: string,
): void {
	const qualifiedSelector = `${namespace}.${op.name}`;

	patches.push({
		action: "merge",
		selector: { operation: qualifiedSelector },
		data: descriptionAnnotations(op.summary, op.description),
		...patchTagsIfPresent(op.tags),
	});

	for (const param of op.parameters ?? []) {
		patches.push({
			action: "merge",
			selector: { parameter: param.name, operation: qualifiedSelector },
			data: descriptionAnnotations(param.summary, param.description),
		});
	}

	if (op.returnType != null) {
		patches.push({
			action: "merge",
			selector: { returnType: true, operation: qualifiedSelector },
			data: descriptionAnnotations(
				op.returnType.summary,
				op.returnType.description,
			),
		});
	}
}

/**
 * Merges an ActionImport or FunctionImport onto the corresponding operation patch.
 *
 * Policy:
 * - If a matching actions[]/functions[] patch already exists, compare descriptions.
 *   The op description always wins (it is the Schema-level authoritative entry).
 *   When the import carries a non-trivially different description, a `lost-information`
 *   warning is emitted so the difference is visible to consumers.
 * - If no matching op patch exists (the operation was only described at import level),
 *   a new operation patch is generated from the import entry and a `needs-spec-extension`
 *   warning is emitted — the enrichment source should ideally use actions[]/functions[]
 *   instead of actionImports[]/functionImports[].
 */
function mergeImportOntoOperation(
	imp: ODataV4ActionImport | ODataV4FunctionImport,
	namespace: string,
	importKind: "actionImport" | "functionImport",
	opPatchIndex: Map<string, OverlayPatch>,
	patches: OverlayPatch[],
	warnings: ConversionWarning[],
): void {
	const qualifiedName = `${namespace}.${imp.name}`;
	const existing = opPatchIndex.get(qualifiedName);

	if (existing !== undefined) {
		// Op patch already exists. Check whether the import description differs.
		const existingData = existing.data as Record<string, string>;
		const opSummary = existingData["@Core.Description"] ?? "";
		const opDescription = existingData["@Core.LongDescription"] ?? "";
		const importSummary = imp.summary ?? "";
		const importDescription = imp.description ?? "";

		const summaryDiffers = importSummary.trim() !== opSummary.trim();
		const descDiffers = importDescription.trim() !== opDescription.trim();

		if (summaryDiffers || descDiffers) {
			warnings.push({
				type: "lost-information",
				field: `${importKind}s[name="${imp.name}"]`,
				message:
					`${importKind} "${imp.name}" has a different description than the corresponding ` +
					`${importKind === "actionImport" ? "actions[]" : "functions[]"} entry. ` +
					`The Schema-level operation description is used (authoritative); the import description is discarded. ` +
					`Import summary: "${importSummary}" | Op summary: "${opSummary}"`,
			});
		}
		// Merge import tags onto the existing patch if present and not already there
		const importTags = imp.tags ?? [];
		if (importTags.length > 0) {
			const existingTags: string[] =
				(existing.tags as string[] | undefined) ?? [];
			const merged = [...new Set([...existingTags, ...importTags])] as [
				string,
				...string[],
			];
			existing.tags = merged;
		}
	} else {
		// No matching op — generate a patch from the import itself.
		const patch: OverlayPatch = {
			action: "merge",
			selector: { operation: qualifiedName },
			data: descriptionAnnotations(imp.summary, imp.description),
			...patchTagsIfPresent(imp.tags),
		};
		patches.push(patch);
		opPatchIndex.set(qualifiedName, patch);

		warnings.push({
			type: "needs-spec-extension",
			field: `${importKind}s[name="${imp.name}"]`,
			message:
				`${importKind} "${imp.name}" has no corresponding ` +
				`${importKind === "actionImport" ? "actions[]" : "functions[]"} entry. ` +
				`A patch was generated from the import description using the operation selector "${qualifiedName}". ` +
				`Prefer enriching the Schema-level ${importKind === "actionImport" ? "actions[]" : "functions[]"} entry directly.`,
		});
	}
}
