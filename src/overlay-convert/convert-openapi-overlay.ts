/**
 * Converter: Standard OpenAPI Overlay spec → ORD Overlay format.
 *
 * OpenAPI Overlay spec: https://spec.openapis.org/overlay/v1.1.0.html
 *
 * Mapping:
 *   actions[].target (JSONPath) → patches[].selector.jsonPath
 *   actions[].update            → patches[].action = "merge",  patches[].data = update
 *   actions[].remove = true     → patches[].action = "remove" with data omitted
 *   actions[].remove = false    → (no-op, skipped)
 *   actions[].description       → patches[].description (1:1 mapping)
 *   info.title / info.version   → overlay.description (informational prefix)
 *   extends                     → overlay.target.url (if no explicit target provided)
 *
 * An action with both `update` and `remove` produces two patches in order,
 * per the OpenAPI Overlay spec: "apply the update first and then remove the targets".
 */
import type { ORDOverlay, OverlayPatch } from "../generated/spec/v1/types";
import type {
	ConversionResult,
	ConversionWarning,
	ConvertOptions,
	OpenApiOverlay,
} from "./types";

export function convertOpenApiOverlayToOrd(
	source: OpenApiOverlay,
	options: ConvertOptions = {},
): ConversionResult {
	const warnings: ConversionWarning[] = [];
	const patches: OverlayPatch[] = [];

	for (const action of source.actions) {
		const hasUpdate = action.update !== undefined;
		const hasRemove = action.remove === true;
		const isNoOp = action.remove === false && !hasUpdate;

		if (isNoOp) {
			continue;
		}

		if (hasUpdate && action.update !== undefined) {
			patches.push({
				...(action.description !== undefined
					? { description: action.description }
					: {}),
				action: "merge",
				selector: { jsonPath: action.target },
				data: action.update,
			});
		}

		if (hasRemove) {
			patches.push({
				// description is only attached to the first patch when both update and remove are present
				...(action.description !== undefined && !hasUpdate
					? { description: action.description }
					: {}),
				action: "remove",
				selector: { jsonPath: action.target },
			});
		}
	}

	if (patches.length === 0) {
		throw new Error(
			"Conversion produced zero patches — the resulting ORD overlay would be invalid.",
		);
	}

	const descriptionParts: string[] = [];
	if (options.description !== undefined) {
		descriptionParts.push(options.description);
	} else {
		const title = source.info?.title;
		const version = source.info?.version;
		if (title !== undefined) {
			descriptionParts.push(
				`Converted from OpenAPI Overlay: ${title}${version !== undefined ? ` (${version})` : ""}`,
			);
		}
	}

	// When the caller did not provide an explicit target and the source document
	// declares an `extends` URL, use that URL as the target's url.
	let target = options.target;
	if (target === undefined && source.extends !== undefined) {
		target = { url: source.extends };
	}

	const result: ORDOverlay = {
		$schema:
			"https://open-resource-discovery.org/spec-extension/models/OrdOverlay.schema.json#",
		ordOverlay: "0.1",
		...(options.ordId !== undefined ? { ordId: options.ordId } : {}),
		...(descriptionParts.length > 0
			? { description: descriptionParts.join("\n") }
			: {}),
		...(target !== undefined ? { target } : {}),
		patches: patches as [OverlayPatch, ...OverlayPatch[]],
	};

	return { overlay: result, warnings };
}
