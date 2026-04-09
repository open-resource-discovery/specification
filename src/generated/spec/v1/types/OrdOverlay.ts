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
 * Exactly one selector type is used per patch.
 *
 * Prefer concept-level selectors over generic `jsonPath` where possible,
 * as they are resilient to structural changes in the target format.
 */
export type OverlaySelector =
  | OverlaySelectorByJsonPath
  | OverlaySelectorByORDID
  | OverlaySelectorByOperation
  | OverlaySelectorByEntityType
  | OverlaySelectorByComplexType
  | OverlaySelectorByEnumType
  | OverlaySelectorByPropertyType
  | OverlaySelectorByEntitySet
  | OverlaySelectorByNamespace
  | OverlaySelectorByParameter
  | OverlaySelectorByReturnType;
/**
 * The value used by the patch [`action`](#overlay-patch).
 * Structure depends on the target being patched and the action type.
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
 * The ORD Overlay is an optional ORD model extension that allows patching both ORD resource metadata
 * and referenced resource definition files without modifying the original source files.
 *
 * Overlays use concept-level [selectors](#overlay-selector) that are independent of the target format's
 * internal structure, making them resilient to format changes.
 * A `jsonPath` selector is available as a generic fallback.
 *
 * Overlay files can be provided through the
 * [ORD Configuration endpoint](../../spec-v1/index.md#ord-configuration-endpoint),
 * or attached as `resourceDefinitions` entries on API or Event resources with type `ord:overlay:v1`.
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
  meta?: OverlayMeta1;
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
 * Optional target context identifying the resource or definition file being patched.
 * See [Overlay Target](#overlay-target) for details on identifier requirements and disambiguation.
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
   * Optional human-readable note explaining the purpose or rationale of this individual patch.
   * This field is purely informational and has no effect on patch application.
   *
   * Typical use-cases:
   * - Reviewer / audit notes explaining why a particular element is being modified.
   * - Commit-message style annotations generated by AI tooling (e.g. "Enriched summary for GetUser operation").
   * - References to tickets or decisions that motivated the change.
   *
   * Maps 1:1 to the `actions[].description` field in the
   * [OpenAPI Overlay spec](https://spec.openapis.org/overlay/v1.1.0.html), enabling lossless
   * round-trip conversion between OpenAPI overlays and ORD overlays.
   */
  description?: string;
  /**
   * The patch operation to perform on the selected element:
   *
   * - `update`: Replace the selected element entirely with `data`.
   * - `append`:
   *   - When `data` is a string: append it to the selected string value.
   *     Only valid when the selected element is a text/string field.
   *   - When `data` is an object: recursively append each string property in `data`
   *     to the corresponding string field in the selected object.
   *     Nested objects are traversed; arrays in `data` are appended to matching arrays.
   *     Throws an error if a string in `data` targets a non-string field in the target.
   *   - Useful to extend existing descriptions, summaries, or other text fields
   *     without replacing them entirely.
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
  data?: OverlayPatchValue;
  /**
   * String labels associated with the patched element.
   * Useful for classification, domain tagging, and filtering in registries or tooling.
   *
   * These are purely informational and have no effect on patch application or on the
   * target document.
   *
   * @minItems 1
   */
  tags?: [string, ...string[]];
  meta?: OverlayMeta;
  [k: string]: unknown | undefined;
}
export interface OverlaySelectorByJsonPath {
  /**
   * JSONPath expression targeting any location in a JSON/YAML-based target document.
   * MUST start with `$`.
   * This is the generic structural fallback selector, supported for all JSON/YAML-based formats:
   * - `openapi-v2`, `openapi-v3`, `openapi-v3.1+`: targets any node in the OpenAPI document.
   * - `a2a-agent-card`: targets any node in the A2A Agent Card JSON document.
   * - `csdl-json`: targets any node in the OData CSDL JSON document.
   * - MCP (any Specification ID): targets any node in the MCP-compatible JSON/YAML tool metadata.
   *
   * Use concept-level selectors (`operation`, `entityType`, etc.) when available, as they are
   * resilient to structural differences between format versions. Reserve `jsonPath` for cases
   * where no concept-level selector covers the target location.
   */
  jsonPath: string;
}
export interface OverlaySelectorByORDID {
  /**
   * ORD ID targeting an ORD resource (API, Event, Data Product, ...) in an ORD document.
   * MUST be a valid [ORD ID](../../spec-v1/index.md#ord-id).
   * Supported metadata formats:
   * - ORD document (no specific `definitionType`): locates the ORD resource object whose
   *   `ordId` field matches this value. The resource type (apiResource, eventResource,
   *   dataProduct, etc.) is derived from the ORD ID namespace and is not required in the selector.
   *
   * Use this selector when patching ORD resource metadata itself (e.g. title, description,
   * visibility, tags). For patching the technical API definition file that the resource
   * references, apply the overlay to that definition file directly using its own selectors.
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
   * - OData (`edmx`, `csdl-json`): maps to the Action or Function name at Schema level.
   *   MUST use the namespace-qualified name (e.g. `OData.Demo.Approval`) to be unambiguous.
   *   For OData v2 `edmx` targets: also searches FunctionImport elements in EntityContainer
   *   when no Schema-level Action/Function matches the name.
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
   * **OData-specific** selector targeting an EntityType element by its namespace-qualified name.
   *
   * An EntityType in OData is a structured type with a key that represents a business entity
   * (e.g. `Customer`, `Order`, `Employee`). This maps to:
   * - `edmx` (OData v2/v4 CSDL XML): targets `<EntityType Name="...">` elements in the Schema.
   * - `csdl-json` (OData v4 CSDL JSON): targets elements with `$Kind: "EntityType"`.
   *
   * MUST use the namespace-qualified name (e.g. `OData.Demo.Customer`) for unambiguous resolution.
   * For EntitySet-level patching (Capabilities annotations), use the `entitySet` selector instead.
   *
   * For CSN Interop targets (`sap-csn-interop-effective-v1`), this selector targets a `definitions`
   * entry by its fully qualified key (e.g. `AirlineService.Airline`).
   *
   * To target ComplexType or EnumType elements, use the dedicated `complexType` or `enumType` selectors.
   */
  entityType: string;
}
export interface OverlaySelectorByComplexType {
  /**
   * **OData-specific** selector targeting a ComplexType element by its namespace-qualified name.
   *
   * A ComplexType in OData is a structured type without a key, typically used for reusable
   * embedded structures like addresses, coordinates, or measurement values. This maps to:
   * - `edmx` (OData v2/v4 CSDL XML): targets `<ComplexType Name="...">` elements in the Schema.
   * - `csdl-json` (OData v4 CSDL JSON): targets elements with `$Kind: "ComplexType"`.
   *
   * MUST use the namespace-qualified name (e.g. `OData.Demo.Address`) for unambiguous resolution.
   *
   * ComplexTypes are often shared across multiple EntityTypes, so patching a ComplexType
   * affects all usages of that type throughout the service.
   */
  complexType: string;
}
export interface OverlaySelectorByEnumType {
  /**
   * **OData-specific** selector targeting an EnumType element by its namespace-qualified name.
   *
   * An EnumType in OData is an enumeration type with named members representing a fixed set
   * of values (e.g. `OrderStatus`, `Priority`, `Gender`). This maps to:
   * - `edmx` (OData v2/v4 CSDL XML): targets `<EnumType Name="...">` elements in the Schema.
   * - `csdl-json` (OData v4 CSDL JSON): targets elements with `$Kind: "EnumType"`.
   *
   * MUST use the namespace-qualified name (e.g. `OData.Demo.OrderStatus`) for unambiguous resolution.
   *
   * To patch individual enum members, use the `propertyType` selector with this `enumType` as context.
   */
  enumType: string;
}
export interface OverlaySelectorByPropertyType {
  /**
   * Concept-level property, navigation property, or enum member identifier.
   *
   * Use the unqualified property name (e.g. `BirthDate`, `Street`, `Pending`).
   * Property names are frequently reused across types, so a parent type context
   * MUST be provided via exactly one of: `entityType`, `complexType`, or `enumType`.
   *
   * Supported metadata formats:
   * - `edmx` (OData v2/v4 CSDL XML): targets a Property or NavigationProperty on an EntityType
   *   or ComplexType; or a Member on an EnumType.
   * - `csdl-json` (OData v4 CSDL JSON): targets non-`$`-prefixed keys on the matched type object.
   * - `sap-csn-interop-effective-v1` (CSN Interop): targets an entry in the `elements` map of
   *   the matched entity definition. Use `entityType` for CSN Interop targets.
   */
  propertyType: string;
  /**
   * Parent EntityType context for the property.
   * Use this when targeting a property on an EntityType.
   * MUST be the namespace-qualified name (e.g. `OData.Demo.Customer`).
   * For CSN Interop: the fully qualified `definitions` key (e.g. `AirlineService.Airline`).
   *
   * Exactly one of `entityType`, `complexType`, or `enumType` MUST be provided.
   */
  entityType?: string;
  /**
   * **OData-specific** parent ComplexType context for the property.
   * Use this when targeting a property on a ComplexType.
   * MUST be the namespace-qualified name (e.g. `OData.Demo.Address`).
   *
   * Exactly one of `entityType`, `complexType`, or `enumType` MUST be provided.
   */
  complexType?: string;
  /**
   * **OData-specific** parent EnumType context for the enum member.
   * Use this when targeting a member of an EnumType.
   * MUST be the namespace-qualified name (e.g. `OData.Demo.OrderStatus`).
   *
   * Exactly one of `entityType`, `complexType`, or `enumType` MUST be provided.
   */
  enumType?: string;
}
export interface OverlaySelectorByEntitySet {
  /**
   * Concept-level entity set identifier.
   * Supported metadata formats:
   * - `edmx` (OData v2/v4 CSDL XML): targets an EntitySet element inside EntityContainer.
   *   May use the unqualified name (e.g. `Customers`) or namespace-prefixed name.
   * - `csdl-json` (OData v4 CSDL JSON): targets a key with `$Collection: true` inside the
   *   EntityContainer object in the namespace.
   *
   * Use `entitySet` when you need to patch EntityContainer-bound metadata such as
   * Capabilities annotations (InsertRestrictions, UpdateRestrictions, etc.).
   * For patching the EntityType structure (Properties, NavigationProperties), use `entityType`.
   */
  entitySet: string;
}
export interface OverlaySelectorByNamespace {
  /**
   * Concept-level OData schema/namespace selector.
   * Supported metadata formats:
   * - `edmx` (OData v2/v4 CSDL XML): targets the `<Schema Namespace="...">` element.
   *   Use the namespace value exactly as declared (e.g. `com.example.OrderService`).
   * - `csdl-json` (OData v4 CSDL JSON): targets the namespace-level object (the non-`$`-prefixed
   *   key in the CSDL JSON document that matches the namespace value).
   *
   * Use this selector for service/schema-level annotations such as `@Core.Description` and
   * `@Core.LongDescription` on the OData service as a whole.
   */
  namespace: string;
}
export interface OverlaySelectorByParameter {
  /**
   * Concept-level parameter name.
   * Supported metadata formats:
   * - `edmx` (OData v2/v4 CSDL XML): targets a `<Parameter Name="...">` child element on
   *   an Action, Function, or FunctionImport. Use the unqualified parameter name.
   * - `csdl-json` (OData v4 CSDL JSON): targets an entry in the `$Parameter` array of an
   *   Action/Function overload whose `$Name` matches.
   * - OpenAPI (`openapi-v2`, `openapi-v3`, `openapi-v3.1+`): targets an entry in the
   *   `parameters` array of the operation identified by `operation` (operationId), matching
   *   by the parameter `name` field.
   *
   * `operation` MUST always accompany this field to unambiguously identify the owning operation.
   */
  parameter: string;
  /**
   * Required operation context for the selected parameter.
   * - For OData: the namespace-qualified Action, Function, or FunctionImport name.
   * - For OpenAPI: the `operationId` of the HTTP operation.
   */
  operation: string;
}
export interface OverlaySelectorByReturnType {
  /**
   * Flag indicating that the return type of the specified operation is the target.
   * MUST be `true`. Use `operation` to identify the owning operation.
   * Supported metadata formats:
   * - `edmx` (OData v2/v4 CSDL XML): targets the `<ReturnType>` child element of the
   *   matched Action or Function element.
   * - `csdl-json` (OData v4 CSDL JSON): targets the `$ReturnType` object inside the matched
   *   Action/Function overload array entry.
   */
  returnType: true;
  /**
   * Namespace-qualified Action or Function name whose ReturnType is targeted.
   * - For `edmx`: the namespace-qualified name of the Action or Function (e.g. `com.example.Svc.TerminateEmployee`).
   * - For `csdl-json`: the namespace-qualified name looked up in the Namespace object.
   */
  operation: string;
}
/**
 * Optional arbitrary metadata for use by overlay consumers, tooling, and registries.
 * The contents of this block are **never applied to the target document** — they are strictly out-of-band and ignored by the patch merge process.
 *
 * When used at the document level, this carries information about the overlay as a whole (e.g. provenance, approval status, processing instructions).
 * When used at the patch level, this carries information specific to the patched element (e.g. confidence scores, source references).
 *
 * This is an open/extensible object — any properties are allowed.
 */
export interface OverlayMeta {
  [k: string]: unknown | undefined;
}
/**
 * Optional arbitrary metadata for use by overlay consumers, tooling, and registries.
 * The contents of this block are **never applied to the target document** — they are strictly out-of-band and ignored by the patch merge process.
 *
 * When used at the document level, this carries information about the overlay as a whole (e.g. provenance, approval status, processing instructions).
 * When used at the patch level, this carries information specific to the patched element (e.g. confidence scores, source references).
 *
 * This is an open/extensible object — any properties are allowed.
 */
export interface OverlayMeta1 {
  [k: string]: unknown | undefined;
}
