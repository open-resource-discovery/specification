// AUTO-GENERATED definition files. Do not modify directly.

/**
 * Correlation ID identifying related records in external systems of record.
 * MUST be a valid [Correlation ID](../../spec-v1/index.md#correlation-id).
 */
export type CorrelationID = string;
/**
 * Defines metadata access control - which categories of consumers are allowed to discover and access the resource and its metadata.
 *
 * This controls who can see that the resource exists and retrieve its metadata level information.
 * It does NOT control runtime access to the resource itself - that is managed separately through authentication and authorization mechanisms.
 *
 * Use this to prevent exposing internal implementation details to inappropriate consumer audiences.
 */
export type Visibility = Visibility1 & Visibility2;
export type Visibility1 = "public" | "internal" | "private";
export type Visibility2 = string;
/**
 * Type of the targeted metadata definition file.
 * This can be used to disambiguate how selectors are interpreted for the target.
 *
 * MUST be either:
 * - any valid [Specification ID](../../spec-v1/index.md#specification-id), or
 * - one of the pre-defined values reused from:
 *   - API Resource Definition `type`
 *   - Event Resource Definition `type`
 *   - Capability Definition `type`
 */
export type OverlayDefinitionType = OverlayDefinitionType1 & OverlayDefinitionType2;
export type OverlayDefinitionType1 =
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
  | "custom";
export type OverlayDefinitionType2 = string;
/**
 * Identifies the element in the target to patch.
 * Exactly one selector type is used per patch. The selector object uses one explicit key:
 *
 * - `ordId`: resource level - targets an ORD resource (API, Event, Data Product, ...)
 * - `operation`: operation level - targets an operation by its concept-level ID
 * - `entityType`: entity type level - targets an entity/type by its concept-level ID
 * - `propertyType`: property type level - targets a property/element within an entity type
 * - `jsonPath`: generic fallback - targets any location in a JSON/YAML-based target document by path
 *
 * Prefer concept-level selectors (operation, entityType, propertyType) over jsonPath
 * where possible, as they are resilient to structural changes in the target format.
 */
export type Selector =
  | SelectorByJsonPath
  | SelectorByORDID
  | SelectorByOperation
  | SelectorByEntityType
  | SelectorByPropertyType;

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
 *   - Operation level: operation (OpenAPI `operationId`, MCP tool `name`)
 *   - Entity type level: entityType (OData EntityType)
 *   - Property type level: propertyType (OData Property scoped by entity type)
 *   - Generic fallback: jsonPath (any JSON/YAML document, structure-bound)
 *
 * Selector support by metadata format:
 *   - `operation`: OpenAPI (`openapi-v2`, `openapi-v3`, `openapi-v3.1+`) and MCP (typically `custom` API Resource Definition today).
 *   - `entityType` and `propertyType`: OData (`edmx` for v2/v4, `csdl-json` for v4).
 *   - `jsonPath`: any JSON/YAML-based metadata file (including OpenAPI and MCP files).
 *   - `ordId`: ORD resource metadata level (patching ORD resources themselves).
 *
 * TODO (OData operations):
 *   - Best current guess: map selector `operation` to OData operation names:
 *     - schema-level `Action`/`Function` names (prefer fully-qualified name)
 *     - container-level `ActionImport`/`FunctionImport` names when exposed via entity container
 *     Needs validation with OData experts.
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
   * MUST follow the ORD ID shape `*:overlay:*:v*`.
   *
   * TODO:
   * - Do we need this?
   * - If overlays are published via the configuration endpoint without direct ORD resource context, what should their stable ID be?
   * - Should this be mandatory or optional?
   */
  ordId?: string;
  /**
   * Optional description of the overlay document itself.
   *
   * Notated in [CommonMark](https://spec.commonmark.org/) (Markdown).
   */
  description?: string;
  describedSystemType?: OverlaySystemType;
  describedSystemVersion?: OverlaySystemVersion;
  describedSystemInstance?: OverlaySystemInstance;
  visibility?: Visibility;
  target: OverlayTarget;
  /**
   * Ordered sequence of patches to apply to the targeted resource(s).
   * Patches are applied in the order listed.
   *
   * @minItems 1
   */
  patches: [Patch, ...Patch[]];
  [k: string]: unknown | undefined;
}
/**
 * Information on the [system type](../../spec-v1/index.md#system-type) this overlay describes.
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
  correlationIds?: [CorrelationID, ...CorrelationID[]];
}
/**
 * Information on the [system version](../../spec-v1/index.md#system-version) this overlay describes.
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
  correlationIds?: [CorrelationID, ...CorrelationID[]];
}
/**
 * Information on the [system instance](../../spec-v1/index.md#system-instance) this overlay describes.
 */
export interface OverlaySystemInstance {
  /**
   * Optional [base URL](../../spec-v1/index.md#base-url) of the system instance.
   * By providing the base URL, relative URLs in the overlay are resolved relative to it.
   */
  baseUrl?: string;
  /**
   * Optional local ID for the system instance, as known by the described system.
   */
  localId?: string;
  /**
   * Correlation IDs for linking this system instance to external systems of record.
   *
   * @minItems 1
   */
  correlationIds?: [CorrelationID, ...CorrelationID[]];
}
/**
 * Reference to the single target being patched by this overlay.
 * The target can be an ORD resource or a referenced resource definition file.
 * MUST provide at least one identifier: an ORD ID, a URL, or one or more correlationIds.
 * Multiple identifiers are treated as all pointing to the same resource,
 * providing redundant ways to resolve it.
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
  [k: string]: unknown | undefined;
}
/**
 * A single patch action to apply to the element identified by the selector.
 */
export interface Patch {
  /**
   * The patch operation to perform on the selected element:
   *
   * - `update`: Replace the selected element entirely with `data`.
   * - `merge`:
   *   - objects are deep-merged recursively.
   *   - scalar values are overwritten by the value from `data`.
   *   - arrays are appended (new array items are added after existing items).
   *   - existing object properties not mentioned in `data` are preserved.
   *
   *   To fully replace an array, use two ordered patches:
   *   1. `remove` the array at the selected location.
   *   2. `merge` the new array content.
   * - `remove`:
   *   - without `data`: remove the selected element from the document entirely.
   *   - with `data`: remove fields that are set to `null`.
   *     This applies recursively, so nested `null` values remove nested fields as well
   *     (JSON Merge Patch-style delete semantics).
   *
   * Example for nested removal:
   * `data: { "foo": { "bar": null } }` removes `foo.bar` inside the selected element.
   */
  action: "update" | "merge" | "remove";
  selector: Selector;
  data?: PatchValue;
  [k: string]: unknown | undefined;
}
export interface SelectorByJsonPath {
  /**
   * JSONPath expression targeting any location in a JSON/YAML-based target document.
   * MUST start with `$`.
   * This is the generic fallback selector and is supported for all JSON/YAML-based metadata formats,
   * including OpenAPI and MCP metadata files.
   */
  jsonPath: string;
}
export interface SelectorByORDID {
  /**
   * ORD ID targeting an ORD resource (API, Event, Data Product, ...).
   * MUST be a valid [ORD ID](../../spec-v1/index.md#ord-id).
   * Use this selector when patching ORD resource metadata itself.
   */
  ordId: string;
  /**
   * Optional hint when selecting by `ordId`.
   * Specifies the ORD resource type to speed up resolution.
   * If omitted, implementations SHOULD scan all resource types.
   */
  resourceType?: string;
}
export interface SelectorByOperation {
  /**
   * Concept-level operation identifier.
   * Supported mappings:
   * - OpenAPI (`openapi-v2`, `openapi-v3`, `openapi-v3.1+`): maps to OpenAPI `operationId`.
   * - MCP metadata (typically provided via API Resource Definition type `custom` today): maps to MCP Tool `name`.
   *   See: https://modelcontextprotocol.io/specification/2025-11-25/schema#tool-name
   *
   * Not currently supported for OData selectors.
   * Best current guess for future OData support:
   * - map to `Action`/`Function` names (prefer fully-qualified name)
   * - or `ActionImport`/`FunctionImport` names when exposed via the entity container
   * TODO: validate this mapping with OData experts.
   */
  operation: string;
}
export interface SelectorByEntityType {
  /**
   * Concept-level entity type identifier.
   * Currently supported for OData metadata:
   * - `edmx` (OData v2/v4 CSDL XML)
   * - `csdl-json` (OData v4 CSDL JSON)
   */
  entityType: string;
}
export interface SelectorByPropertyType {
  /**
   * Concept-level property/element identifier.
   * Currently supported for OData metadata:
   * - `edmx` (OData v2/v4 CSDL XML)
   * - `csdl-json` (OData v4 CSDL JSON)
   */
  propertyType: string;
  /**
   * Entity type context of the selected property.
   * This scopes the property lookup to avoid ambiguity.
   * For OData metadata, this identifies the containing EntityType.
   */
  entityType: string;
}
/**
 * The value to be used together with patch actions:
 * - with `action: merge`:
 *   - objects are deep-merged recursively
 *   - scalar values overwrite existing values
 *   - arrays are appended to existing arrays
 * - with `action: update`, it replaces the selected element entirely
 * - with `action: remove`:
 *   - if omitted, the selected element is removed entirely
 *   - if provided, fields set to `null` are deleted (recursively, including nested fields;
 *     JSON Merge Patch-style delete semantics)
 *
 * To fully replace an existing array, use two ordered patches:
 * 1. remove the array
 * 2. merge the new array value
 *
 * This is a free-form object whose structure depends on the target being patched.
 */
export interface PatchValue {
  [k: string]: unknown | undefined;
}
