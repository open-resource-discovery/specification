/*
 * Validation coverage in this module:
 * - JSON Schema validation for ORD Overlay input via OrdOverlay.schema.json
 * - semantic validation for documented MUST and SHOULD requirements
 * - selector validation against known definitionType support
 * - basic target-document shape validation for supported JSON-based formats
 *
 * Current gaps / known limitations:
 * - target-format validation is heuristic and not a full spec validator for OpenAPI, AsyncAPI, etc.
 * - YAML parsing/serialization is handled outside this module and is not supported by the current CLI flow
 * - no remote resolution, dereferencing, or validation of target.url contents
 */
import Ajv, { type ErrorObject } from "ajv";
import addFormats from "ajv-formats";
import overlaySchema from "../generated/spec/v1/schemas/OrdOverlay.schema.json";
import type { ORDOverlay } from "../generated/spec/v1/types";
import {
	isJSONObject,
	type JSONValue,
	type OverlayMergeContext,
	OverlayMergeError,
} from "./types";

const jsonpath = require("jsonpath") as {
	nodes: (
		input: unknown,
		expression: string,
	) => Array<{ path: Array<string | number>; value: unknown }>;
};
export interface OverlayValidationIssue {
	level: "error" | "warning";
	path: string;
	message: string;
}

export interface OverlayValidationResult {
	errors: OverlayValidationIssue[];
	warnings: OverlayValidationIssue[];
}

interface ValidateOverlaySemanticsOptions {
	context?: OverlayMergeContext | undefined;
}

const KNOWN_NON_JSON_OR_YAML_DEFINITION_TYPES = new Set([
	"edmx",
	"graphql-sdl",
	"wsdl-v1",
	"wsdl-v2",
]);
const ajv = new Ajv({
	allErrors: true,
	allowUnionTypes: true,
	strict: false,
});

addFormats(ajv);

const validateOverlaySchemaWithAjv = ajv.compile(
	overlaySchema as Record<string, unknown>,
);

export function validateOverlayInput(
	input: unknown,
	options: ValidateOverlaySemanticsOptions = {},
): OverlayValidationResult {
	const errors = validateOverlaySchema(input);
	if (errors.length > 0) {
		return { errors, warnings: [] };
	}

	return validateOverlaySemantics(input as ORDOverlay, options);
}

export function validateOverlaySchema(
	input: unknown,
): OverlayValidationIssue[] {
	if (validateOverlaySchemaWithAjv(input)) {
		return [];
	}

	return (validateOverlaySchemaWithAjv.errors ?? []).map((error) =>
		createIssue(
			"error",
			toDisplayPath(error.instancePath),
			formatAjvError(error),
		),
	);
}

export function validateOverlaySemantics(
	overlay: ORDOverlay,
	options: ValidateOverlaySemanticsOptions = {},
): OverlayValidationResult {
	const errors: OverlayValidationIssue[] = [];
	const warnings: OverlayValidationIssue[] = [];
	const definitionType = resolveDefinitionType(overlay, options.context);

	if (overlay.target?.definitionType === "custom") {
		errors.push(
			createIssue(
				"error",
				"$.target.definitionType",
				'target.definitionType MUST NOT use the deprecated literal "custom". Use a concrete Specification ID instead.',
			),
		);
	}

	const hasMetadataDefinitionSelectors = overlay.patches.some(
		(patch) => getSelectorKind(patch.selector) !== "ordId",
	);
	if (
		hasMetadataDefinitionSelectors &&
		overlay.target?.definitionType === undefined &&
		options.context?.definitionType === undefined
	) {
		warnings.push(
			createIssue(
				"warning",
				"$.target.definitionType",
				"target.definitionType is RECOMMENDED when patching metadata definition files so selector support and target format can be validated explicitly.",
			),
		);
	}

	if (
		overlay.target?.ordId !== undefined &&
		hasMetadataDefinitionSelectors &&
		overlay.target.url === undefined &&
		overlay.target.definitionType === undefined
	) {
		warnings.push(
			createIssue(
				"warning",
				"$.target",
				"target.ordId alone can be ambiguous for metadata definition patches. Provide target.definitionType and/or target.url to identify the concrete file.",
			),
		);
	}

	addPerspectiveWarnings(overlay, warnings);

	overlay.patches.forEach((patch, patchIndex) => {
		const patchPath = `$.patches[${patchIndex}]`;
		const selectorKind = getSelectorKind(patch.selector);

		validatePatchData(patch, patchPath, errors);
		validateSelectorSemantics(
			selectorKind,
			patch.selector,
			patchPath,
			definitionType,
			errors,
			warnings,
		);
		validateODataPatchData(
			patch,
			patchPath,
			selectorKind,
			definitionType,
			warnings,
		);
	});

	return { errors, warnings };
}

export function validateTargetDocumentForDefinitionType(
	targetDocument: JSONValue,
	definitionType: string | undefined,
	overlay?: ORDOverlay,
): OverlayValidationIssue[] {
	if (definitionType === undefined) {
		return [];
	}

	if (KNOWN_NON_JSON_OR_YAML_DEFINITION_TYPES.has(definitionType)) {
		return [
			createIssue(
				"error",
				"$",
				`definitionType "${definitionType}" is not JSON/YAML-based and is not supported by this merge script.`,
			),
		];
	}

	if (!isJSONObject(targetDocument)) {
		return [
			createIssue(
				"error",
				"$",
				`Target document for definitionType "${definitionType}" must be a JSON object after parsing.`,
			),
		];
	}

	if (definitionType === "openapi-v2") {
		return validateExactVersionPrefix(
			targetDocument.swagger,
			"2.",
			"$.swagger",
			"openapi-v2",
		);
	}

	if (definitionType === "openapi-v3") {
		return validateOpenApiVersion(targetDocument.openapi, "openapi-v3");
	}

	if (definitionType === "openapi-v3.1+") {
		return validateOpenApiVersion(targetDocument.openapi, "openapi-v3.1+");
	}

	if (definitionType === "a2a-agent-card") {
		return Array.isArray(targetDocument.skills)
			? []
			: [
					createIssue(
						"error",
						"$.skills",
						'A2A Agent Card targets must contain a top-level "skills" array.',
					),
				];
	}

	if (definitionType === "csdl-json") {
		return typeof targetDocument.$Version === "string"
			? []
			: [
					createIssue(
						"error",
						"$.$Version",
						'CSDL JSON targets must contain a top-level "$Version" string.',
					),
				];
	}

	if (definitionType === "asyncapi-v2") {
		return validateExactVersionPrefix(
			targetDocument.asyncapi,
			"2.",
			"$.asyncapi",
			"asyncapi-v2",
		);
	}

	if (definitionType === "ord:overlay:v1") {
		return targetDocument.ordOverlay === "0.1"
			? []
			: [
					createIssue(
						"error",
						"$.ordOverlay",
						'ORD Overlay targets must contain ordOverlay: "0.1".',
					),
				];
	}

	if (
		isSpecificationId(definitionType) &&
		overlay?.patches.some(
			(patch) => getSelectorKind(patch.selector) === "operation",
		)
	) {
		return Array.isArray(targetDocument.tools)
			? []
			: [
					createIssue(
						"error",
						"$.tools",
						'Specification ID targets using the "operation" selector must expose a top-level "tools" array.',
					),
				];
	}

	return [];
}

export function emitOverlayValidationWarnings(
	warnings: OverlayValidationIssue[],
	emit: (message: string) => void = console.warn,
): void {
	warnings.forEach((warning) => {
		emit(`[overlay-merge] Warning at ${warning.path}: ${warning.message}`);
	});
}

export function throwOnOverlayValidationErrors(
	errors: OverlayValidationIssue[],
): void {
	if (errors.length === 0) {
		return;
	}

	throw new OverlayMergeError(formatOverlayValidationErrors(errors));
}

export function formatOverlayValidationErrors(
	errors: OverlayValidationIssue[],
): string {
	return `Overlay validation failed:\n${errors.map((error) => `- ${error.path}: ${error.message}`).join("\n")}`;
}

function addPerspectiveWarnings(
	overlay: ORDOverlay,
	warnings: OverlayValidationIssue[],
): void {
	if (
		overlay.perspective === "system-type" &&
		overlay.describedSystemType === undefined
	) {
		warnings.push(
			createIssue(
				"warning",
				"$.describedSystemType",
				'perspective "system-type" indicates describedSystemType SHOULD be provided as identifying context.',
			),
		);
	}

	if (overlay.perspective === "system-version") {
		if (overlay.describedSystemVersion === undefined) {
			warnings.push(
				createIssue(
					"warning",
					"$.describedSystemVersion",
					'perspective "system-version" indicates describedSystemVersion SHOULD be provided.',
				),
			);
		}

		if (overlay.describedSystemType === undefined) {
			warnings.push(
				createIssue(
					"warning",
					"$.describedSystemType",
					'perspective "system-version" indicates describedSystemType SHOULD also be provided as parent context.',
				),
			);
		}
	}

	if (
		overlay.perspective === "system-instance" &&
		overlay.describedSystemInstance === undefined
	) {
		warnings.push(
			createIssue(
				"warning",
				"$.describedSystemInstance",
				'perspective "system-instance" indicates describedSystemInstance SHOULD be provided.',
			),
		);
	}
}

function isODataDefinitionType(definitionType: string): boolean {
	return definitionType === "csdl-json" || definitionType === "edmx";
}

function isODataSelector(selectorKind: SelectorKind): boolean {
	return (
		selectorKind === "entityType" ||
		selectorKind === "complexType" ||
		selectorKind === "enumType" ||
		selectorKind === "propertyType" ||
		selectorKind === "entitySet" ||
		selectorKind === "namespace" ||
		selectorKind === "parameter" ||
		selectorKind === "returnType"
	);
}

function validateODataPatchData(
	patch: ORDOverlay["patches"][number],
	patchPath: string,
	selectorKind: SelectorKind,
	definitionType: string | undefined,
	warnings: OverlayValidationIssue[],
): void {
	if (definitionType === undefined || !isODataDefinitionType(definitionType)) {
		return;
	}

	if (!isODataSelector(selectorKind)) {
		return;
	}

	if (patch.data === undefined || patch.action === "remove") {
		return;
	}

	if (!isJSONObject(patch.data)) {
		warnings.push(
			createIssue(
				"warning",
				`${patchPath}.data`,
				`OData patch data for "${definitionType}" targets MUST be an object with @-prefixed annotation keys (CSDL JSON format).`,
			),
		);
		return;
	}

	const invalidKeys = Object.entries(patch.data)
		.filter(([key, value]) => !key.startsWith("@") && !isJSONObject(value))
		.map(([key]) => key);

	if (invalidKeys.length > 0) {
		warnings.push(
			createIssue(
				"warning",
				`${patchPath}.data`,
				`OData patch data for "${definitionType}" targets MUST use @-prefixed annotation keys (CSDL JSON format). ` +
					`Non-annotation keys found: ${invalidKeys.join(", ")}. ` +
					`These keys will be ignored by the EDMX merge path.`,
			),
		);
	}
}

function validatePatchData(
	patch: ORDOverlay["patches"][number],
	patchPath: string,
	errors: OverlayValidationIssue[],
): void {
	// update and merge require data
	if (
		(patch.action === "update" || patch.action === "merge") &&
		patch.data === undefined
	) {
		errors.push(
			createIssue(
				"error",
				`${patchPath}.data`,
				`Patch action "${patch.action}" requires data.`,
			),
		);
	}

	// remove does NOT require data - omitting data or using {} removes the entire element
}

function validateSelectorSemantics(
	selectorKind: SelectorKind,
	selector: ORDOverlay["patches"][number]["selector"],
	patchPath: string,
	definitionType: string | undefined,
	errors: OverlayValidationIssue[],
	warnings: OverlayValidationIssue[],
): void {
	const selectorPath = `${patchPath}.selector`;

	if (selectorKind === "jsonPath") {
		const expression = (selector as { jsonPath: string }).jsonPath;
		validateJsonPathExpression(expression, `${selectorPath}.jsonPath`, errors);

		if (
			definitionType !== undefined &&
			KNOWN_NON_JSON_OR_YAML_DEFINITION_TYPES.has(definitionType)
		) {
			errors.push(
				createIssue(
					"error",
					selectorPath,
					`The "jsonPath" selector is only defined for JSON/YAML-based target formats, but definitionType "${definitionType}" is not JSON/YAML-based.`,
				),
			);
		}

		return;
	}

	if (selectorKind === "operation") {
		if (definitionType === undefined) {
			warnings.push(
				createIssue(
					"warning",
					selectorPath,
					'The "operation" selector works best with target.definitionType. Without it, the resolver falls back to OpenAPI -> MCP -> A2A detection order.',
				),
			);
			return;
		}

		if (!supportsOperationSelector(definitionType)) {
			errors.push(
				createIssue(
					"error",
					selectorPath,
					`The "operation" selector is not supported for definitionType "${definitionType}". Supported values are openapi-v2, openapi-v3, openapi-v3.1+, a2a-agent-card, csdl-json, edmx, and Specification IDs used for MCP-style targets.`,
				),
			);
		}

		return;
	}

	if (
		selectorKind === "entityType" ||
		selectorKind === "complexType" ||
		selectorKind === "enumType" ||
		selectorKind === "propertyType"
	) {
		if (selectorKind === "propertyType") {
			const parentCount = [
				"entityType" in selector,
				"complexType" in selector,
				"enumType" in selector,
			].filter(Boolean).length;

			if (parentCount === 0) {
				errors.push(
					createIssue(
						"error",
						selectorPath,
						'propertyType selectors MUST provide exactly one of "entityType", "complexType", or "enumType" to disambiguate the target property.',
					),
				);
			} else if (parentCount > 1) {
				errors.push(
					createIssue(
						"error",
						selectorPath,
						'propertyType selectors MUST provide exactly one of "entityType", "complexType", or "enumType", but multiple were provided.',
					),
				);
			}
		}

		if (
			definitionType !== undefined &&
			!supportsEntityTypeSelector(definitionType)
		) {
			errors.push(
				createIssue(
					"error",
					selectorPath,
					`The "${selectorKind}" selector is only supported for OData metadata (edmx, csdl-json) and CSN Interop (sap-csn-interop-effective-v1) targets, not for definitionType "${definitionType}".`,
				),
			);
		}

		return;
	}

	if (selectorKind === "entitySet") {
		if (
			definitionType !== undefined &&
			!supportsEntitySetSelector(definitionType)
		) {
			errors.push(
				createIssue(
					"error",
					selectorPath,
					`The "entitySet" selector is only supported for OData metadata (edmx, csdl-json) targets, not for definitionType "${definitionType}".`,
				),
			);
		}

		return;
	}

	if (selectorKind === "namespace") {
		if (
			definitionType !== undefined &&
			!supportsNamespaceSelector(definitionType)
		) {
			errors.push(
				createIssue(
					"error",
					selectorPath,
					`The "namespace" selector is only supported for OData metadata (edmx, csdl-json) targets, not for definitionType "${definitionType}".`,
				),
			);
		}

		return;
	}

	if (selectorKind === "parameter" || selectorKind === "returnType") {
		if (
			definitionType !== undefined &&
			!supportsParameterSelector(definitionType)
		) {
			errors.push(
				createIssue(
					"error",
					selectorPath,
					`The "${selectorKind}" selector is only supported for OpenAPI and OData metadata (edmx, csdl-json) targets, not for definitionType "${definitionType}".`,
				),
			);
		}

		return;
	}
}

function validateJsonPathExpression(
	expression: string,
	path: string,
	errors: OverlayValidationIssue[],
): void {
	try {
		jsonpath.nodes({}, expression);
	} catch (error: unknown) {
		const reason = error instanceof Error ? error.message : String(error);
		errors.push(
			createIssue("error", path, `Invalid JSONPath expression: ${reason}`),
		);
	}
}

function validateOpenApiVersion(
	value: unknown,
	definitionType: "openapi-v3" | "openapi-v3.1+",
): OverlayValidationIssue[] {
	if (typeof value !== "string") {
		return [
			createIssue(
				"error",
				"$.openapi",
				`OpenAPI targets for "${definitionType}" must contain a top-level "openapi" version string.`,
			),
		];
	}

	const match = /^(\d+)\.(\d+)(?:[.].*)?$/.exec(value);
	if (match === null) {
		return [
			createIssue(
				"error",
				"$.openapi",
				`OpenAPI version "${value}" is not in a recognised semantic version format.`,
			),
		];
	}

	const major = Number(match[1]);
	const minor = Number(match[2]);

	if (definitionType === "openapi-v3" && major === 3 && minor === 0) {
		return [];
	}

	if (definitionType === "openapi-v3.1+" && major === 3 && minor >= 1) {
		return [];
	}

	return [
		createIssue(
			"error",
			"$.openapi",
			`Target document version "${value}" does not match definitionType "${definitionType}".`,
		),
	];
}

function validateExactVersionPrefix(
	value: unknown,
	expectedPrefix: string,
	path: string,
	definitionType: string,
): OverlayValidationIssue[] {
	return typeof value === "string" && value.startsWith(expectedPrefix)
		? []
		: [
				createIssue(
					"error",
					path,
					`Target document does not match definitionType "${definitionType}".`,
				),
			];
}

function resolveDefinitionType(
	overlay: ORDOverlay,
	context: OverlayMergeContext | undefined,
): string | undefined {
	if (typeof context?.definitionType === "string") {
		return context.definitionType;
	}

	return typeof overlay.target?.definitionType === "string"
		? overlay.target.definitionType
		: undefined;
}

function supportsOperationSelector(definitionType: string): boolean {
	return (
		isOpenApiDefinitionType(definitionType) ||
		definitionType === "a2a-agent-card" ||
		definitionType === "csdl-json" ||
		definitionType === "edmx" ||
		isSpecificationId(definitionType)
	);
}

function supportsEntityTypeSelector(definitionType: string): boolean {
	return (
		definitionType === "edmx" ||
		definitionType === "csdl-json" ||
		definitionType === "sap-csn-interop-effective-v1"
	);
}

function supportsEntitySetSelector(definitionType: string): boolean {
	return definitionType === "edmx" || definitionType === "csdl-json";
}

function supportsNamespaceSelector(definitionType: string): boolean {
	return definitionType === "edmx" || definitionType === "csdl-json";
}

function supportsParameterSelector(definitionType: string): boolean {
	return (
		isOpenApiDefinitionType(definitionType) ||
		definitionType === "edmx" ||
		definitionType === "csdl-json"
	);
}

function isOpenApiDefinitionType(definitionType: string): boolean {
	return (
		definitionType === "openapi-v2" ||
		definitionType === "openapi-v3" ||
		definitionType === "openapi-v3.1+"
	);
}

function isSpecificationId(definitionType: string): boolean {
	return /^([a-z0-9]+(?:[.][a-z0-9]+)*):([a-zA-Z0-9._-]+):(v0|v[1-9][0-9]*)$/.test(
		definitionType,
	);
}

type SelectorKind =
	| "jsonPath"
	| "ordId"
	| "operation"
	| "entityType"
	| "complexType"
	| "enumType"
	| "propertyType"
	| "entitySet"
	| "namespace"
	| "parameter"
	| "returnType"
	| "unknown";

function getSelectorKind(
	selector: ORDOverlay["patches"][number]["selector"],
): SelectorKind {
	if (isJSONObject(selector) && typeof selector.jsonPath === "string") {
		return "jsonPath";
	}

	if (isJSONObject(selector) && typeof selector.ordId === "string") {
		return "ordId";
	}

	if (
		isJSONObject(selector) &&
		typeof selector.operation === "string" &&
		!("parameter" in selector) &&
		!("returnType" in selector)
	) {
		return "operation";
	}

	if (
		isJSONObject(selector) &&
		typeof selector.operation === "string" &&
		typeof (selector as Record<string, unknown>).parameter === "string"
	) {
		return "parameter";
	}

	if (
		isJSONObject(selector) &&
		typeof selector.operation === "string" &&
		(selector as Record<string, unknown>).returnType === true
	) {
		return "returnType";
	}

	if (
		isJSONObject(selector) &&
		typeof selector.entityType === "string" &&
		!("propertyType" in selector)
	) {
		return "entityType";
	}

	if (
		isJSONObject(selector) &&
		typeof selector.complexType === "string" &&
		!("propertyType" in selector)
	) {
		return "complexType";
	}

	if (
		isJSONObject(selector) &&
		typeof selector.enumType === "string" &&
		!("propertyType" in selector)
	) {
		return "enumType";
	}

	if (isJSONObject(selector) && typeof selector.propertyType === "string") {
		return "propertyType";
	}

	if (isJSONObject(selector) && typeof selector.entitySet === "string") {
		return "entitySet";
	}

	if (isJSONObject(selector) && typeof selector.namespace === "string") {
		return "namespace";
	}

	return "unknown";
}

function formatAjvError(error: ErrorObject): string {
	if (
		error.keyword === "required" &&
		typeof error.params.missingProperty === "string"
	) {
		return `Missing required property "${error.params.missingProperty}".`;
	}

	if (
		error.keyword === "additionalProperties" &&
		typeof error.params.additionalProperty === "string"
	) {
		return `Unexpected property "${error.params.additionalProperty}".`;
	}

	return (
		error.message ?? `Schema validation failed for keyword "${error.keyword}".`
	);
}

function toDisplayPath(instancePath: string): string {
	if (instancePath.length === 0) {
		return "$";
	}

	return `$${instancePath.replace(/\/(\d+)/g, "[$1]").replace(/\/([^/]+)/g, ".$1")}`;
}

function createIssue(
	level: "error" | "warning",
	path: string,
	message: string,
): OverlayValidationIssue {
	return { level, path, message };
}
