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
 * ⚠️ ALPHA: This specification is in alpha and subject to change.
 *
 * Describes an overlay document for patching resource definitions (e.g. OpenAPI, AsyncAPI, OData CSDL, MCP)
 * or ORD resources, without modifying the original files.
 *
 * Patches use concept-level selectors that are independent of the internal structure of the target format,
 * making overlays resilient to format changes (e.g. OpenAPI 3.0 → 3.1, OData CSDL JSON → XML).
 * A JSON Path selector is available as a generic fallback for JSON/YAML-based targets.
 *
 * Conceptual selector levels (from high to low):
 *   - Resource level: ORD ID (resolved via the ORD registry)
 *   - Operation level: operationId (REST operation, MCP tool, AsyncAPI operation, …)
 *   - Entity type level: entityTypeId (OData EntitySet, CSN entity, JSON Schema object, …)
 *   - Property level: propertyId (OData Property, CSN element, JSON Schema property, …)
 *   - Generic fallback: jsonPath (any JSON/YAML document, structure-bound)
 */
export interface ResourceDefinitionOverlay {
  /**
   * Optional [URL](https://tools.ietf.org/html/rfc3986) to the Resource Definition Overlay schema (defined as a JSON Schema).
   * If provided, this enables code intelligence and validation in supported editors (like VSCode) and tools.
   */
  $schema?: (
    | string
    | "https://open-resource-discovery.org/spec-extension/models/ResourceDefinitionOverlay.schema.json#"
  ) &
    string;
  /**
   * Version of the Resource Definition Overlay specification.
   */
  resourceDefinitionOverlay: "0.1";
  /**
   * Optional description of the overlay document itself.
   *
   * Notated in [CommonMark](https://spec.commonmark.org/) (Markdown).
   */
  description?: string;
  describedSystemType?: SystemType;
  describedSystemVersion?: SystemVersion;
  describedSystemInstance?: SystemInstance;
  visibility?: Visibility;
  target?: OverlayTarget;
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
export interface SystemType {
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
export interface SystemVersion {
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
export interface SystemInstance {
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
 * Reference to the single resource being patched by this overlay.
 * MUST provide at least one identifier: an ORD ID, a URL, or one or more correlationIds.
 * Multiple identifiers are treated as all pointing to the same resource,
 * providing redundant ways to resolve it.
 */
export interface OverlayTarget {
  /**
   * ORD ID of the resource being patched (e.g. an API Resource, Event Resource, Data Product).
   * MUST be a valid [ORD ID](../../spec-v1/index.md#ord-id).
   */
  ordId?: string;
  /**
   * URL or URI pointing directly to the resource definition file to be patched
   * (e.g. an OpenAPI document URL, an OData metadata endpoint).
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
   * - `merge`: Deep-merge `data` into the selected element (properties are added or overwritten, others preserved).
   * - `remove`: Remove the selected element from the document entirely. No `data` required.
   */
  action: "update" | "merge" | "remove";
  selector: Selector;
  data?: PatchValue;
  [k: string]: unknown | undefined;
}
/**
 * Identifies the element within the resource definition to patch.
 * Exactly one selector type is used per patch. Types represent different conceptual levels:
 *
 * - `ordId`: resource level — targets an ORD resource (API, Event, Data Product, …)
 * - `operationId`: operation level — targets an operation by its concept-level ID
 * - `entityTypeId`: entity type level — targets an entity/type by its concept-level ID
 * - `propertyId`: property level — targets a property/element within an entity type
 * - `jsonPath`: generic fallback — targets any location in a JSON/YAML document by path
 *
 * Prefer concept-level selectors (operationId, entityTypeId, propertyId) over jsonPath
 * where possible, as they are resilient to structural changes in the target format.
 */
export interface Selector {
  /**
   * The selector type. Determines how the `value` is interpreted:
   *
   * - `jsonPath`: A JSONPath expression targeting any location in a JSON/YAML document (structure-bound, generic fallback).
   * - `operationId`: An operation identifier (OpenAPI operationId, MCP tool name, AsyncAPI operationId, …).
   * - `entityTypeId`: An entity type identifier (OData EntitySet/EntityType, CSN entity, JSON Schema definition, …).
   * - `propertyId`: A property/element identifier within an entity type (requires `entityTypeId` to be set).
   * - `ordId`: An ORD ID targeting an ORD resource (API, Event, Data Product, …).
   */
  type: "jsonPath" | "operationId" | "entityTypeId" | "propertyId" | "ordId";
  /**
   * The selector value. Interpretation depends on the `type`:
   *
   * - For `jsonPath`: A JSONPath expression (MUST start with `$`).
   * - For `operationId`: The concept-level operation identifier (e.g. OpenAPI `operationId`, MCP tool `name`).
   * - For `entityTypeId`: The concept-level entity type name (e.g. OData EntitySet name, CSN entity name).
   * - For `propertyId`: The concept-level property/element name (e.g. OData Property name, CSN element name).
   * - For `ordId`: A valid ORD ID of the resource to patch.
   */
  value?: string;
  /**
   * Required when `type` is `propertyId`. Specifies the entity type that contains the target property.
   * This scopes the property lookup to avoid ambiguity (the same property name may exist in multiple types).
   */
  entityTypeId?: string;
  /**
   * Optional hint when `type` is `ordId`. Specifies the ORD resource type to speed up resolution.
   * If omitted, implementations SHOULD scan all resource types.
   */
  resourceType?: string;
  [k: string]: unknown | undefined;
}
/**
 * The value to be merged into or used to replace the selected element.
 * When used together with `merge: true` on the patch, performs a deep merge.
 * When used without `merge` (or `merge: false`), replaces the selected element entirely.
 * Mutually exclusive with `remove`.
 *
 * This is a free-form object whose structure depends on the target being patched.
 */
export interface PatchValue {
  [k: string]: unknown | undefined;
}
