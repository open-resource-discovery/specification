/**
 * Input type definitions for overlay converters.
 *
 * Three source formats are supported:
 * 1. Standard OpenAPI Overlay spec (https://spec.openapis.org/overlay/v1.1.0.html)
 * 2. OData v2 Enrichment format (tmp/cto-api-docs/integration/kg/odatav2/schemas/enrichment.json)
 * 3. OData v4 Enrichment format (tmp/cto-api-docs/integration/kg/odatav4/schemas/enrichment.json)
 */
import type { ORDOverlay, OverlayTarget } from "../generated/spec/v1/types";

// ─── OpenAPI Overlay spec (https://spec.openapis.org/overlay/v1.1.0.html) ──

export interface OpenApiOverlayInfo {
	title?: string;
	version?: string;
	[key: string]: unknown;
}

export interface OpenApiOverlayAction {
	/** JSONPath expression targeting document nodes to patch. */
	target: string;
	/** Human-readable description of the action (not representable as an ORD patch property). */
	description?: string;
	/** Object to deep-merge onto each targeted node. */
	update?: Record<string, unknown>;
	/** Remove the targeted node(s) when true. */
	remove?: boolean;
}

export interface OpenApiOverlay {
	/** Overlay spec version, e.g. "1.1.0". */
	overlay: string;
	info?: OpenApiOverlayInfo;
	/** Optional URL of the base document this overlay targets. */
	extends?: string;
	actions: OpenApiOverlayAction[];
}

// ─── OData v2 Enrichment format ─────────────────────────────────────────────

export interface ODataV2Property {
	name: string;
	summary: string;
	description: string;
}

export interface ODataV2ComplexType {
	name: string;
	summary: string;
	description: string;
	tags?: string[];
	properties?: ODataV2Property[];
}

export interface ODataV2EntitySet {
	name: string;
	summary: string;
	description: string;
	tags?: string[];
}

export interface ODataV2EntityType {
	name: string;
	summary: string;
	description: string;
	tags?: string[];
	properties?: ODataV2Property[];
}

export interface ODataV2FunctionImportParameter {
	name: string;
	summary: string;
	description: string;
}

export interface ODataV2FunctionImport {
	name: string;
	summary: string;
	description: string;
	tags?: string[];
	parameters?: ODataV2FunctionImportParameter[];
}

export interface ODataV2Enrichment {
	protocol: "odatav2";
	complexTypes?: ODataV2ComplexType[];
	entitySets?: ODataV2EntitySet[];
	entityTypes?: ODataV2EntityType[];
	functionImports?: ODataV2FunctionImport[];
}

// ─── OData v4 Enrichment format ─────────────────────────────────────────────

export interface ODataV4Property {
	name: string;
	summary: string;
	description: string;
}

export interface ODataV4ReturnType {
	summary: string;
	description: string;
}

export interface ODataV4Parameter {
	name: string;
	summary: string;
	description: string;
}

export interface ODataV4ComplexType {
	name: string;
	summary: string;
	description: string;
	tags?: string[];
	properties?: ODataV4Property[];
}

export interface ODataV4EntitySet {
	name: string;
	summary: string;
	description: string;
	tags?: string[];
}

export interface ODataV4EntityType {
	name: string;
	summary: string;
	description: string;
	tags?: string[];
	properties?: ODataV4Property[];
}

export interface ODataV4EnumMember {
	name: string;
	summary: string;
	description: string;
}

export interface ODataV4EnumType {
	name: string;
	summary: string;
	description: string;
	members?: ODataV4EnumMember[];
}

export interface ODataV4Action {
	name: string;
	summary: string;
	description: string;
	tags?: string[];
	parameters?: ODataV4Parameter[];
	returnType?: ODataV4ReturnType;
}

export interface ODataV4ActionImport {
	name: string;
	summary: string;
	description: string;
	tags?: string[];
}

export interface ODataV4Function {
	name: string;
	summary: string;
	description: string;
	tags?: string[];
	parameters?: ODataV4Parameter[];
	returnType?: ODataV4ReturnType;
}

export interface ODataV4FunctionImport {
	name: string;
	summary: string;
	description: string;
	tags?: string[];
}

export interface ODataV4Enrichment {
	protocol: "odatav4";
	/** Namespace of the OData service schema (e.g. "com.example.HRService"). */
	namespace: string;
	/** Short summary of the service — maps to @Core.Description on the Schema. */
	summary: string;
	/** Detailed description of the service — maps to @Core.LongDescription on the Schema. */
	description: string;
	/** Relative service root URI (optional). */
	uri?: string;
	actions?: ODataV4Action[];
	actionImports?: ODataV4ActionImport[];
	complexTypes?: ODataV4ComplexType[];
	entitySets?: ODataV4EntitySet[];
	entityTypes?: ODataV4EntityType[];
	enumTypes?: ODataV4EnumType[];
	functions?: ODataV4Function[];
	functionImports?: ODataV4FunctionImport[];
}

// ─── Converter options and result ───────────────────────────────────────────

/**
 * Options shared by all three converters.
 */
export interface ConvertOptions {
	/**
	 * The `target` block to embed in the resulting ORD overlay.
	 * If not provided, no target block is emitted (valid when all patches use `ordId` selectors).
	 */
	target?: OverlayTarget;
	/**
	 * Optional ORD ID for the resulting overlay document.
	 * MUST be provided when the overlay will be published via the ORD Configuration endpoint.
	 */
	ordId?: string;
	/**
	 * Optional description for the overlay document.
	 * A default description derived from the source format is used when omitted.
	 */
	description?: string;
	/**
	 * OData namespace prefix for concept-level selectors.
	 * Required for OData v2 conversion (not embedded in v2 enrichment files);
	 * optional for OData v4 (namespace is already present in the enrichment document).
	 * When provided, it overrides the namespace from the OData v4 document root for selectors.
	 */
	odataNamespace?: string;
}

/**
 * Category of conversion issue.
 *
 * - `"unsupported-concept"`: The source concept cannot be represented in the ORD overlay model
 *   without extending the spec (e.g. entity sets, OData v2 FunctionImports targeting EDMX).
 * - `"lost-information"`: Information from the source was silently dropped
 *   (e.g. per-action OpenAPI description, tags).
 * - `"needs-spec-extension"`: The conversion is partial and correct output depends on a
 *   future ORD overlay spec or implementation enhancement.
 */
export type ConversionWarningType =
	| "unsupported-concept"
	| "lost-information"
	| "needs-spec-extension";

export interface ConversionWarning {
	type: ConversionWarningType;
	message: string;
	/** Source field name or selector that triggered this warning. */
	field?: string;
}

export interface ConversionResult {
	/** The resulting ORD overlay document. */
	overlay: ORDOverlay;
	/** Warnings about information loss or model mismatches during conversion. */
	warnings: ConversionWarning[];
}
