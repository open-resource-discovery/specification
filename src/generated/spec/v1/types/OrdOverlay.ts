// AUTO-GENERATED definition files. Do not modify directly.

/**
 * Overlay-specific [perspective](../../spec-v1/index.md#perspectives) that scopes where this overlay should be applied.
 *
 * Use this together with `describedSystemType`, `describedSystemVersion`, and `describedSystemInstance`
 * to describe whether the overlay applies broadly to a system type, to one released system version,
 * or only to a specific system instance.
 */
export type OverlayPerspective = ("system-type" | "system-version" | "system-instance") & string;
/**
 * Correlation ID identifying related records in external systems of record.
 * MUST be a valid [Correlation ID](../../spec-v1/index.md#correlation-id).
 */
export type OverlayCorrelationID = string;
/**
 * Correlation ID identifying related records in external systems of record.
 * MUST be a valid [Correlation ID](../../spec-v1/index.md#correlation-id).
 */
export type OverlayCorrelationID1 = string;
/**
 * Correlation ID identifying related records in external systems of record.
 * MUST be a valid [Correlation ID](../../spec-v1/index.md#correlation-id).
 */
export type OverlayCorrelationID2 = string;
/**
 * Controls which consumers can discover and access this overlay document.
 *
 * It does NOT control runtime access to the resources being patched — that is managed separately through authentication and authorization mechanisms.
 *
 * Use this to prevent exposing internal overlay enrichments to inappropriate consumer audiences.
 */
export type OverlayVisibility = ("public" | "internal" | "private") & string;
/**
 * Optional, but RECOMMENDED type of the target definition being patched.
 * If provided, this SHOULD match the `type` of the referenced metadata definition
 * (as used in API/Event/Capability resource definitions).
 * This is especially useful when `ordId` resolves to a resource with multiple attached definitions.
 *
 * This can be used to disambiguate how selectors are interpreted for the target.
 *
 * MUST be either:
 * - any valid [Specification ID](../../spec-v1/index.md#specification-id), or
 * - one of the pre-defined values reused from:
 *   - API Resource Definition `type`
 *   - Event Resource Definition `type`
 *   - Capability Definition `type`
 *
 * The literal value `custom` is deprecated for `definitionType` and MUST NOT be used.
 * In such cases, use a concrete [Specification ID](../../spec-v1/index.md#specification-id) instead.
 */
export type OverlayDefinitionType = (
  | string
  | "openapi-v2"
  | "openapi-v3"
  | "openapi-v3.1+"
  | "raml-v1"
  | "edmx"
  | "csdl-json"
  | "graphql-sdl"
  | "wsdl-v1"
  | "wsdl-v2"
  | "a2a-agent-card"
  | "sap-rfc-metadata-v1"
  | "sap-sql-api-definition-v1"
  | "sap-csn-interop-effective-v1"
  | "asyncapi-v2"
  | "sap.mdo:mdi-capability-definition:v1"
  | "ord:overlay:v1"
) &
  string;
/**
 * Identifies the element in the target to patch.
 * Exactly one selector type is used per patch. The selector object uses one explicit key:
 *
 * - `ordId`: resource level - targets an ORD resource (API, Event, Data Product, ...)
 * - `operation`: operation level - targets an operation (OpenAPI: operationId, MCP: tool name, OData: Action/Function name)
 * - `entityType`: entity type level - targets an OData EntityType or CSN entity definition by name
 * - `propertyType`: property type level - targets a property/element on an OData EntityType/ComplexType or a CSN entity element
 * - `jsonPath`: generic fallback - targets any location in a JSON/YAML-based target document by path
 *
 * Prefer concept-level selectors (operation, entityType, propertyType) over jsonPath
 * where possible, as they are resilient to structural changes in the target format.
 */
export type OverlaySelector =
  | OverlaySelectorByJsonPath
  | OverlaySelectorByORDID
  | OverlaySelectorByOperation
  | OverlaySelectorByEntityType
  | OverlaySelectorByPropertyType;
/**
 * The value to be used together with patch actions:
 * - with `action: append`:
 *   - string value appended to selected text field
 * - with `action: merge`:
 *   - objects are deep-merged recursively
 *   - scalar values overwrite existing values
 *   - arrays are appended to existing arrays
 * - with `action: update`, it replaces the selected element entirely
 * - with `action: remove`:
 *   - `{}` (empty object): the selected element is removed entirely
 *   - object with null-valued properties: only those fields are deleted (recursively,
 *     including nested fields; JSON Merge Patch-style delete semantics)
 *
 * To fully replace an existing array, use two ordered patches:
 * 1. remove the array
 * 2. merge the new array value
 *
 * For OData targets (`edmx`, `csdl-json`), the value MUST be expressed in CSDL JSON
 * annotation format. Annotation keys use the `@TermName` convention:
 * e.g. `{ "@Core.Description": "...", "@Core.Revisions": [...] }`.
 * When the target is EDMX XML, the merge implementation converts this to `<Annotation>` elements.
 * See: https://docs.oasis-open.org/odata/odata-csdl-json/v4.01/odata-csdl-json-v4.01.html
 *
 * For CSN Interop targets (`sap-csn-interop-effective-v1`), the value is plain CSN JSON
 * merged directly into the matched entity definition or element object.
 * Use the CSN `doc` field for human-readable descriptions, and `@AnnotationName` keys
 * for vocabulary annotations (e.g. `@EndUserText.label`, `@Semantics.text`).
 * See: https://sap.github.io/csn-interop-specification/
 *
 * This is a free-form value whose structure depends on the target being patched.
 *
 * `null` as a standalone patch value is not supported outside `remove` masks.
 * To delete an element, use `action: remove` with `data: {}`.
 */
export type OverlayPatchValue =
  | {
      [k: string]: unknown | undefined;
    }
  | unknown[]
  | string
  | number
  | boolean
  | null;

/**
 * ⚠️ ALPHA: This specification is in alpha and subject to change.
 *
 * The ORD Overlay is an optional ORD model extension.
 *
 * It allows patching both ORD resources and referenced resource definition files (e.g. OpenAPI,
 * AsyncAPI, OData CSDL, MCP Agent Cards) without modifying the original source files.
 *
 * Overlay files can be provided through the ORD configuration endpoint
 * (https://open-resource-discovery.org/spec-v1/index#ord-configuration-endpoint),
 * or attached as `resourceDefinitions` entries on API or Event resources with type `ord:overlay:v1`.
 *
 * Patches use concept-level selectors that are independent of the internal structure of the target format,
 * making overlays resilient to format changes (e.g. OpenAPI 3.0 → 3.1, OData CSDL JSON → XML).
 * A JSON Path selector is available as a generic fallback for any JSON/YAML-based target format.
 *
 * Conceptual selector levels (from high to low):
 *   - Resource level: ORD ID (resolved via the ORD registry)
 *   - Operation level: operation (OpenAPI `operationId`, MCP tool `name`, OData Action/Function name)
 *   - Entity type level: entityType (OData EntityType or CSN Interop entity definition — targets the type definition, not an EntitySet)
 *   - Property type level: propertyType (OData Property/NavigationProperty on an EntityType or ComplexType, or CSN Interop element)
 *   - Generic fallback: jsonPath (any JSON/YAML document, structure-bound)
 *
 * Selector support by metadata format:
 *   - `operation`: OpenAPI (`openapi-v2`, `openapi-v3`, `openapi-v3.1+`), MCP (identified via a Specification ID in `definitionType`), and OData (`edmx`, `csdl-json`) for Action and Function names.
 *   - `entityType` and `propertyType`: OData (`edmx` for v2/v4, `csdl-json` for v4) and CSN Interop (`sap-csn-interop-effective-v1`). For OData, `entityType` targets the EntityType definition — not the EntitySet in the container.
 *   - `jsonPath`: any JSON/YAML-based metadata file (including OpenAPI and MCP files).
 *   - `ordId`: ORD resource metadata level (patching ORD resources themselves).
 *
 * Patch data format for OData:
 *   When patching OData metadata (`edmx` or `csdl-json` targets), the `data` value in each patch
 *   MUST be expressed in CSDL JSON annotation format, regardless of whether the actual target file
 *   is EDMX XML or CSDL JSON.
 *   See: https://docs.oasis-open.org/odata/odata-csdl-json/v4.01/odata-csdl-json-v4.01.html
 *   Annotation keys follow the `@TermName` convention (e.g. `@Core.Description`).
 *   For available standard vocabulary terms, see:
 *   https://docs.oasis-open.org/odata/odata-vocabularies/v4.0/odata-vocabularies-v4.0.html
 *   When the target file is EDMX XML (`edmx`), the overlay merge implementation converts
 *   the CSDL JSON patch data to equivalent `<Annotation>` XML elements in the output.
 *
 * Intended use and compatibility:
 *   - Overlays MUST NOT introduce breaking / incompatible changes to the original API or metadata.
 *   - Typical use-cases are non-breaking enrichments: adding extensions, annotations, or updating
 *     non-critical properties such as descriptions, summaries, or display names.
 *   - An exception is intentionally restricting exposure: an overlay MAY remove or hide elements
 *     (e.g. operations, fields) that should not be visible in a given context or to a given audience.
 *
 * Validation assumption:
 *   - overlays and overlay application assume the selected target document is already valid
 *     for its native metadata format.
 *   - the merge process does not fully validate all target metadata formats.
 *   - the merged output should be validated again with the corresponding format-specific tooling.
 */
export interface ORDOverlay {
  /**
   * Optional [URL](https://tools.ietf.org/html/rfc3986) to the ORD Overlay schema (defined as a JSON Schema).
   * If provided, this enables code intelligence and validation in supported editors (like VSCode) and tools.
   */
  $schema?: (string | "https://open-resource-discovery.org/spec-extension/models/OrdOverlay.schema.json#") & string;
  /**
   * Version of the ORD Overlay specification.
   */
  ordOverlay: "0.1";
  /**
   * Optional ORD ID of this overlay document.
   * MUST be provided if the ORD Overlay is published via ORD Configuration endpoint.
   */
  ordId?: string;
  /**
   * Optional description of the overlay document itself.
   *
   * Notated in [CommonMark](https://spec.commonmark.org/) (Markdown).
   */
  description?: string;
  perspective?: OverlayPerspective;
  describedSystemType?: OverlaySystemType;
  describedSystemVersion?: OverlaySystemVersion;
  describedSystemInstance?: OverlaySystemInstance;
  visibility?: OverlayVisibility;
  target?: OverlayTarget;
  /**
   * Ordered sequence of patches to apply to the targeted resource(s).
   * Patches are applied strictly in the order they are listed.
   * If two patches target the same document element, both are applied in sequence —
   * the later patch supersedes the earlier one.
   *
   * @minItems 1
   */
  patches: [OverlayPatch, ...OverlayPatch[]];
  [k: string]: unknown | undefined;
}
/**
 * Information on the [system type](../../spec-v1/index.md#system-type) this overlay describes.
 * This object is identical to the ORD Document [`describedSystemType`](../../spec-v1/interfaces/Document.md#ord-document_describedsystemtype) object.
 *
 * Its purpose is to link the overlay to the same system landscape model as ORD resources, if needed.
 * This is the primary context object for `perspective: system-type`, and also the parent context
 * for more specific `system-version` and `system-instance` overlays.
 *
 * Usually this is not necessary for static overlays if the patched resource is already selected via ORD ID.
 */
export interface OverlaySystemType {
  /**
   * The [system namespace](../../spec-v1/index.md#system-namespace) is a unique identifier for the system type.
   */
  systemNamespace?: string;
  /**
   * Correlation IDs for linking this system type to external systems of record.
   *
   * @minItems 1
   */
  correlationIds?: [OverlayCorrelationID, ...OverlayCorrelationID[]];
}
/**
 * Information on the [system version](../../spec-v1/index.md#system-version) this overlay describes.
 * This object is identical to the ORD Document [`describedSystemVersion`](../../spec-v1/interfaces/Document.md#ord-document_describedsystemversion) object.
 *
 * Its purpose is to link the overlay to the same system landscape model as ORD resources, if needed.
 * Use this when the overlay should only patch metadata for one specific released system version.
 *
 * Usually this is not necessary for static overlays if the patched resource is already selected via ORD ID.
 */
export interface OverlaySystemVersion {
  /**
   * The version of the system instance (run-time) or the version of the described system-version perspective.
   *
   * It MUST follow the [Semantic Versioning 2.0.0](https://semver.org/) standard.
   */
  version?: string;
  /**
   * Human-readable title of the system version.
   */
  title?: string;
  /**
   * Correlation IDs for linking this system version to external systems of record.
   *
   * @minItems 1
   */
  correlationIds?: [OverlayCorrelationID1, ...OverlayCorrelationID1[]];
}
/**
 * Information on the [system instance](../../spec-v1/index.md#system-instance) this overlay describes.
 * This object is identical to the ORD Document [`describedSystemInstance`](../../spec-v1/interfaces/Document.md#ord-document_describedsysteminstance) object.
 *
 * Its purpose is to link the overlay to the same system landscape model as ORD resources, if needed.
 * Use this when the overlay should only patch metadata for one concrete tenant / runtime instance.
 *
 * Usually this is not necessary for static overlays if the patched resource is already selected via ORD ID.
 */
export interface OverlaySystemInstance {
  /**
   * Optional [base URL](../../spec-v1/index.md#base-url) of the system instance.
   * By providing the base URL, relative URLs in the overlay are resolved relative to it.
   */
  baseUrl?: string;
  /**
   * Optional local ID for the system instance (usually tenant ID), as known by the described system.
   */
  localId?: string;
  /**
   * Correlation IDs for linking this system instance to external systems of record.
   *
   * @minItems 1
   */
  correlationIds?: [OverlayCorrelationID2, ...OverlayCorrelationID2[]];
}
/**
 * Optional target context for this overlay.
 * The target can reference an ORD resource or a referenced resource definition file.
 *
 * When `target` is present, at least one identifier (`ordId`, `url`, or `correlationIds`)
 * MUST be provided so that consumers and tooling can determine what is being patched.
 *
 * `ordId` selects the ORD resource metadata itself.
 * If patches are intended for a specific attached metadata definition file, `ordId` alone can be ambiguous
 * when the resource exposes multiple definitions.
 * In that case, use `url` and/or `definitionType` to clarify the intended file.
 *
 * Example: an OData API resource may provide both `edmx` and `openapi-v3` definitions.
 * Use `definitionType` and/or an explicit `url` to identify which one is patched.
 *
 * Exception: if all patches exclusively use `selector.ordId`, the patch selectors themselves
 * are sufficient to identify the target resources and `target` may be omitted entirely.
 * Multiple resources can still be patched by defining multiple patches with different selector `ordId` values.
 */
export interface OverlayTarget {
  /**
   * ORD ID of the target being patched (e.g. an API Resource, Event Resource, Data Product).
   * MUST be a valid [ORD ID](../../spec-v1/index.md#ord-id).
   */
  ordId?: string;
  /**
   * URL or URI pointing directly to the file being patched.
   * This is typically a resource definition file (e.g. OpenAPI, AsyncAPI, OData CSDL),
   * but can also point to any JSON/YAML-based target document.
   */
  url?: string;
  /**
   * Correlation IDs referencing the target resource in external registries or systems of record.
   * Reuses the ORD correlation ID format: `namespace:type:localId`.
   * All listed IDs are treated as pointing to the same resource.
   *
   * @minItems 1
   */
  correlationIds?: [string, ...string[]];
  definitionType?: OverlayDefinitionType;
}
/**
 * A single patch action to apply to the element identified by the selector.
 */
export interface OverlayPatch {
  /**
   * The patch operation to perform on the selected element:
   *
   * - `update`: Replace the selected element entirely with `data`.
   * - `append`:
   *   - append string `data` to the selected string value.
   *   - only valid when the selected element is a text/string field.
   *   - useful to extend existing descriptions without replacing them.
   * - `remove`:
   *   - `data: {}` (empty object): remove the selected element from the document entirely.
   *   - `data` with null-valued properties: remove only those fields (recursively).
   *     Nested `null` values remove nested fields as well
   *     (JSON Merge Patch-style delete semantics).
   *
   * Example for partial removal:
   * `data: { "foo": { "bar": null } }` removes only `foo.bar` inside the selected element.
   * To remove the entire selected element, use `data: {}`.
   * - `merge`:
   *   - objects are deep-merged recursively.
   *   - scalar values are overwritten by the value from `data`.
   *   - arrays are appended (new array items are added after existing items).
   *   - existing object properties not mentioned in `data` are preserved.
   *
   *   To fully replace an array, use two ordered patches:
   *   1. `remove` the array at the selected location.
   *   2. `merge` the new array content.
   */
  action: "update" | "append" | "remove" | "merge";
  selector: OverlaySelector;
  data: OverlayPatchValue;
  [k: string]: unknown | undefined;
}
export interface OverlaySelectorByJsonPath {
  /**
   * JSONPath expression targeting any location in a JSON/YAML-based target document.
   * MUST start with `$`.
   * This is the generic fallback selector and is supported for all JSON/YAML-based metadata formats,
   * including OpenAPI and MCP metadata files.
   */
  jsonPath: string;
}
export interface OverlaySelectorByORDID {
  /**
   * ORD ID targeting an ORD resource (API, Event, Data Product, ...).
   * MUST be a valid [ORD ID](../../spec-v1/index.md#ord-id).
   * Use this selector when patching ORD resource metadata itself.
   * The ORD resource type is derived from the ORD ID itself.
   */
  ordId: string;
}
export interface OverlaySelectorByOperation {
  /**
   * Concept-level operation identifier.
   * Supported mappings by format:
   * - OpenAPI (`openapi-v2`, `openapi-v3`, `openapi-v3.1+`): maps to the `operationId` field on
   *   an HTTP operation inside `paths.{path}.{method}`.
   * - MCP (any Specification ID other than `a2a-agent-card`): maps to `tools[].name`.
   *   See: https://modelcontextprotocol.io/specification/2025-11-25/schema#tool-name
   * - A2A Agent Card (`a2a-agent-card`): maps to `skills[].id`.
   *   See: https://google.github.io/A2A/specification/#agentskill-object
   * - OData (`edmx`, `csdl-json`): maps to the Action or Function name.
   *   MUST use the namespace-qualified name (e.g. `OData.Demo.Approval`) to be unambiguous.
   *   For bound operations overloaded on multiple entity types, use `jsonPath` as a fallback
   *   to target the specific overload.
   *
   * When `definitionType` is set on `target`, the format is known and the selector resolves unambiguously.
   * When `definitionType` is absent, the implementation SHOULD infer the format from the target
   * document's content (e.g. the `openapi` field, `$schema`, or `$kind` markers).
   */
  operation: string;
}
export interface OverlaySelectorByEntityType {
  /**
   * Concept-level entity type identifier.
   * Supported metadata formats:
   * - `edmx` (OData v2/v4 CSDL XML): targets the EntityType element declared in the schema.
   *   MUST use the namespace-qualified name (e.g. `OData.Demo.Customer`).
   *   Note: EntitySet-level patching (e.g. Capabilities annotations) is not covered;
   *   use `jsonPath` as a fallback for those cases.
   * - `csdl-json` (OData v4 CSDL JSON): same name resolution as `edmx`.
   * - `sap-csn-interop-effective-v1` (CSN Interop): targets a `definitions` entry by its
   *   fully qualified key (e.g. `AirlineService.Airline`). In CSN Interop the key is always
   *   fully qualified, so the fully qualified form MUST be used.
   */
  entityType: string;
}
export interface OverlaySelectorByPropertyType {
  /**
   * Concept-level property/element identifier.
   * Supported metadata formats:
   * - `edmx` (OData v2/v4 CSDL XML): targets a Property or NavigationProperty on an EntityType
   *   or ComplexType. Use the unqualified property name (e.g. `BirthDate`).
   * - `csdl-json` (OData v4 CSDL JSON): same resolution as `edmx`.
   * - `sap-csn-interop-effective-v1` (CSN Interop): targets an entry in the `elements` map of
   *   the matched entity definition. Use the element name as defined (e.g. `AirlineID`, `Name`).
   *
   * `entityType` MUST always accompany this field to unambiguously identify the owning type.
   * Property names are unqualified and frequently reused across entity types (e.g. `Name`,
   * `Description`, `CreatedAt`), so `propertyType` alone is not a reliable unique selector.
   */
  propertyType: string;
  /**
   * Required entity type context for the selected property.
   * Because property names are unqualified and commonly repeated across entity types
   * (e.g. `Name`, `Description`, `CreatedAt`), `entityType` is mandatory to ensure
   * the selector is unambiguous and stable across schema evolution.
   * - For OData: the namespace-qualified EntityType or ComplexType name (e.g. `OData.Demo.Customer`).
   * - For CSN Interop: the fully qualified `definitions` key of the containing entity
   *   (e.g. `AirlineService.Airline`).
   */
  entityType: string;
}
