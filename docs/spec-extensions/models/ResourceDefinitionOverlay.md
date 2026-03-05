---
title: "Resource Definition Overlay"
sidebar_position: "2"
description: "Describes the technical interface / schema for the Resource Definition Overlay (alpha), e.g. API definition overlays."
---

:::caution Alpha
This specification is in **alpha** and subject to change.
:::

Use Resource Definition Overlays to patch or overlay resource definition files such as OpenAPI, OData CSDL, AsyncAPI, or MCP Agent Cards — without modifying the original file.

This allows external parties (e.g. platform teams, ORD aggregators) to add or override metadata in resource definition files without modifying the originals. This is especially useful when the ownership or lifecycle of the target file differs from the overlay.

Concept-level selectors (`operationId`, `entityTypeId`, `propertyId`) are preferred over structural selectors (`jsonPath`) as they remain valid across format versions (e.g. OpenAPI 3.0 → 3.1, OData CSDL XML → JSON).

## Overlay Document Metadata

Overlay-level metadata is defined directly on the root object (no `info` wrapper).  
Use these optional root properties to provide context:

- `description`: Human-readable Markdown description of the overlay document itself.
- `describedSystemType`: System type context for which the overlay applies.
- `describedSystemVersion`: System version context for which the overlay applies.
- `describedSystemInstance`: System instance context for which the overlay applies.
- `visibility`: Discovery visibility (`public`, `internal`, or `private`) for the overlay metadata.

## Referencing from ORD Documents

Resource Definition Overlay files are referenced from ORD documents using a `resourceDefinitions` entry with type `ord:resourceDefinitionOverlay:v0`:

```json
{
  "resourceDefinitions": [
    {
      "type": "openapi-v3",
      "mediaType": "application/json",
      "url": "/ord/metadata/my-api.oas3.json",
      "accessStrategies": [{ "type": "open" }]
    },
    {
      "type": "ord:resourceDefinitionOverlay:v0",
      "mediaType": "application/json",
      "url": "/ord/overlays/my-api.overlay.json",
      "accessStrategies": [{ "type": "open" }]
    }
  ]
}
```

## Schema Definitions

* The root schema of the document is [Resource Definition Overlay](#resource-definition-overlay)
* The interface is available as JSON Schema: [ResourceDefinitionOverlay.schema.json](https://open-resource-discovery.org/spec-extension/models/ResourceDefinitionOverlay.schema.json#).


### Resource Definition Overlay

**Type**: Object(<a href="#resource-definition-overlay_$schema">$schema</a>, <a href="#resource-definition-overlay_resourcedefinitionoverlay">resourceDefinitionOverlay</a>, <a href="#resource-definition-overlay_description">description</a>, <a href="#resource-definition-overlay_describedsystemtype">describedSystemType</a>, <a href="#resource-definition-overlay_describedsystemversion">describedSystemVersion</a>, <a href="#resource-definition-overlay_describedsysteminstance">describedSystemInstance</a>, <a href="#resource-definition-overlay_visibility">visibility</a>, <a href="#resource-definition-overlay_target">target</a>, <a href="#resource-definition-overlay_patches">patches</a>)

| Property | Type | Description |
| -------- | ---- | ----------- |
|<div className="interface-property-name anchor" id="resource-definition-overlay_$schema">$schema<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#resource-definition-overlay_$schema" title="#resource-definition-overlay_$schema"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">Optional [URL](https://tools.ietf.org/html/rfc3986) to the Resource Definition Overlay schema (defined as a JSON Schema).<br/>If provided, this enables code intelligence and validation in supported editors (like VSCode) and tools.<hr/>**JSON Schema Format**: `uri-reference`<br/>**Array Item Allowed Values (extensible)**: <ul><li><em>Any</em> string of format `uri-reference`</li><li>`"https://open-resource-discovery.org/spec-extension/models/ResourceDefinitionOverlay.schema.json#"`</li></ul></div>|
|<div className="interface-property-name anchor" id="resource-definition-overlay_resourcedefinitionoverlay">resourceDefinitionOverlay<br/><span className="mandatory">MANDATORY</span><a className="hash-link" href="#resource-definition-overlay_resourcedefinitionoverlay" title="#resource-definition-overlay_resourcedefinitionoverlay"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">Version of the Resource Definition Overlay specification.<hr/>**Allowed Values**: <ul><li>`"0.1"`</li></ul><br/>**Example Values**: <ul className="examples"><li>`"0.1"`</li></ul></div>|
|<div className="interface-property-name anchor" id="resource-definition-overlay_description">description<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#resource-definition-overlay_description" title="#resource-definition-overlay_description"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">Optional description of the overlay document itself.<br/><br/>Notated in [CommonMark](https://spec.commonmark.org/) (Markdown).<hr/>**Minimum Length**: `1`<br/>**Example Values**: <ul className="examples"><li>`"This overlay adds descriptive metadata for AI use-cases\nwithout modifying the original resource definition.\n"`</li></ul></div>|
|<div className="interface-property-name anchor" id="resource-definition-overlay_describedsystemtype">describedSystemType<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#resource-definition-overlay_describedsystemtype" title="#resource-definition-overlay_describedsystemtype"></a></div>|<div className="interface-property-type">[System Type](#system-type)</div>|<div className="interface-property-description">Information on the [system type](../../spec-v1/index.md#system-type) this overlay describes.</div>|
|<div className="interface-property-name anchor" id="resource-definition-overlay_describedsystemversion">describedSystemVersion<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#resource-definition-overlay_describedsystemversion" title="#resource-definition-overlay_describedsystemversion"></a></div>|<div className="interface-property-type">[System Version](#system-version)</div>|<div className="interface-property-description">Information on the [system version](../../spec-v1/index.md#system-version) this overlay describes.</div>|
|<div className="interface-property-name anchor" id="resource-definition-overlay_describedsysteminstance">describedSystemInstance<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#resource-definition-overlay_describedsysteminstance" title="#resource-definition-overlay_describedsysteminstance"></a></div>|<div className="interface-property-type">[System Instance](#system-instance)</div>|<div className="interface-property-description">Information on the [system instance](../../spec-v1/index.md#system-instance) this overlay describes.</div>|
|<div className="interface-property-name anchor" id="resource-definition-overlay_visibility">visibility<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#resource-definition-overlay_visibility" title="#resource-definition-overlay_visibility"></a></div>|<div className="interface-property-type">[Visibility](#visibility)</div>|<div className="interface-property-description">Defines metadata access control - which categories of consumers are allowed to discover and access the resource and its metadata.<br/><br/>This controls who can see that the resource exists and retrieve its metadata level information.<br/>It does NOT control runtime access to the resource itself - that is managed separately through authentication and authorization mechanisms.<br/><br/>Use this to prevent exposing internal implementation details to inappropriate consumer audiences.</div>|
|<div className="interface-property-name anchor" id="resource-definition-overlay_target">target<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#resource-definition-overlay_target" title="#resource-definition-overlay_target"></a></div>|<div className="interface-property-type">[Overlay Target](#overlay-target)</div>|<div className="interface-property-description">Reference to the single resource being patched by this overlay.<br/>MUST provide at least one identifier: an ORD ID, a URL, or one or more correlationIds.<br/>Multiple identifiers are treated as all pointing to the same resource,<br/>providing redundant ways to resolve it.</div>|
|<div className="interface-property-name anchor" id="resource-definition-overlay_patches">patches<br/><span className="mandatory">MANDATORY</span><a className="hash-link" href="#resource-definition-overlay_patches" title="#resource-definition-overlay_patches"></a></div>|<div className="interface-property-type">Array&lt;[Patch](#patch)&gt;</div>|<div className="interface-property-description">Ordered sequence of patches to apply to the targeted resource(s).<br/>Patches are applied in the order listed.<hr/>**Array Constraint**: MUST have at least 1 items</div>|


### Correlation ID

Correlation ID identifying related records in external systems of record.
MUST be a valid [Correlation ID](../../spec-v1/index.md#correlation-id).

**Type:** string<br/>
**Regex Pattern**: <code className="regex">^([a-z0-9]+(?\:[.][a-z0-9]+)\*)\:([a-zA-Z0-9._\\-\\/]+)\:([a-zA-Z0-9._\\-\\/]+)$</code><br/>
**Maximum Length**: `255`


### Visibility

Defines metadata access control - which categories of consumers are allowed to discover and access the resource and its metadata.

This controls who can see that the resource exists and retrieve its metadata level information.
It does NOT control runtime access to the resource itself - that is managed separately through authentication and authorization mechanisms.

Use this to prevent exposing internal implementation details to inappropriate consumer audiences.

**Type:** string<br/>
**Allowed Values**: <ul><li><p>`"public"`: Metadata can be discovered and accessed by anyone, including customers, partners, and unauthenticated external parties.</p></li><li><p>`"internal"`: Metadata can only be discovered and accessed by vendor internal consumers (e.g. applications or services of the same vendor).<br/>MUST NOT be made available to external parties or vendor customers.</p></li><li><p>`"private"`: Metadata should not be discoverable outside the application / service's own deployment scope (e.g., outside of the provider application or the same system namespace / system type).<br/>Used for metadata completeness when describing implementation details or dependencies.</p></li></ul>


### System Instance

A [system instance](../../spec-v1/index.md#system-instance) is a concrete, running instance of a system type.

**Type**: Object(<a href="#system-instance_baseurl">baseUrl</a>, <a href="#system-instance_localid">localId</a>, <a href="#system-instance_correlationids">correlationIds</a>)

| Property | Type | Description |
| -------- | ---- | ----------- |
|<div className="interface-property-name anchor" id="system-instance_baseurl">baseUrl<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#system-instance_baseurl" title="#system-instance_baseurl"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">Optional [base URL](../../spec-v1/index.md#base-url) of the system instance.<br/>By providing the base URL, relative URLs in the overlay are resolved relative to it.<hr/>**JSON Schema Format**: `uri-reference`<br/>**Regex Pattern**: <code className="regex">^http[s]?\:\\/\\/[^\:\\/\\s]+\\.[^\:\\/\\s\\.]+(\:\\d+)?(\\/[a-zA-Z0-9-\\._~]+)\*$</code><br/>**Example Values**: <ul className="examples"><li>`"https://example-sap-system.com"`</li><li>`"https://sub.foo.bar.com/api/v1"`</li></ul></div>|
|<div className="interface-property-name anchor" id="system-instance_localid">localId<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#system-instance_localid" title="#system-instance_localid"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">Optional local ID for the system instance, as known by the described system.<hr/>**Maximum Length**: `255`<br/>**Example Values**: <ul className="examples"><li>`"LocalTenantId123"`</li></ul></div>|
|<div className="interface-property-name anchor" id="system-instance_correlationids">correlationIds<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#system-instance_correlationids" title="#system-instance_correlationids"></a></div>|<div className="interface-property-type">Array&lt;[Correlation ID](#correlation-id)&gt;</div>|<div className="interface-property-description">Correlation IDs for linking this system instance to external systems of record.<hr/>**Array Constraint**: MUST have at least 1 items<br/>**Example Values**: <ul className="examples"><li>`["sap.cld:tenant:741234567"]`</li></ul></div>|


### System Type

A [system type](../../spec-v1/index.md#system-type) is the abstract type of an application or service, from operational perspective.

**Type**: Object(<a href="#system-type_systemnamespace">systemNamespace</a>, <a href="#system-type_correlationids">correlationIds</a>)

| Property | Type | Description |
| -------- | ---- | ----------- |
|<div className="interface-property-name anchor" id="system-type_systemnamespace">systemNamespace<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#system-type_systemnamespace" title="#system-type_systemnamespace"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">The [system namespace](../../spec-v1/index.md#system-namespace) is a unique identifier for the system type.<hr/>**Regex Pattern**: <code className="regex">^[a-z0-9]+(?\:[.][a-z0-9]+)\{1\}$</code><br/>**Maximum Length**: `32`<br/>**Example Values**: <ul className="examples"><li>`"sap.s4"`</li><li>`"sap.c4c"`</li><li>`"sap.cld"`</li></ul></div>|
|<div className="interface-property-name anchor" id="system-type_correlationids">correlationIds<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#system-type_correlationids" title="#system-type_correlationids"></a></div>|<div className="interface-property-type">Array&lt;[Correlation ID](#correlation-id)&gt;</div>|<div className="interface-property-description">Correlation IDs for linking this system type to external systems of record.<hr/>**Array Constraint**: MUST have at least 1 items<br/>**Example Values**: <ul className="examples"><li>`["sap.cld:systemRole:S4_PC"]`</li></ul></div>|


### System Version

A [system version](../../spec-v1/index.md#system-version) describes a version/release of the system.

**Type**: Object(<a href="#system-version_version">version</a>, <a href="#system-version_title">title</a>, <a href="#system-version_correlationids">correlationIds</a>)

| Property | Type | Description |
| -------- | ---- | ----------- |
|<div className="interface-property-name anchor" id="system-version_version">version<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#system-version_version" title="#system-version_version"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">The version of the system instance (run-time) or the version of the described system-version perspective.<br/><br/>It MUST follow the [Semantic Versioning 2.0.0](https://semver.org/) standard.<hr/>**Regex Pattern**: <code className="regex">^(0\|[1-9]\\d\*)\\.(0\|[1-9]\\d\*)\\.(0\|[1-9]\\d\*)(?\:-((?\:0\|[1-9]\\d\*\|\\d\*[a-zA-Z-][0-9a-zA-Z-]\*)(?\:\\.(?\:0\|[1-9]\\d\*\|\\d\*[a-zA-Z-][0-9a-zA-Z-]\*))\*))?(?\:\\+([0-9a-zA-Z-]+(?\:\\.[0-9a-zA-Z-]+)\*))?$</code><br/>**Example Values**: <ul className="examples"><li>`"1.2.3"`</li><li>`"2024.8.0"`</li></ul></div>|
|<div className="interface-property-name anchor" id="system-version_title">title<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#system-version_title" title="#system-version_title"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">Human-readable title of the system version.<hr/>**Minimum Length**: `1`<br/>**Maximum Length**: `255`<br/>**Example Values**: <ul className="examples"><li>`"SAP S/4HANA Cloud 2408"`</li></ul></div>|
|<div className="interface-property-name anchor" id="system-version_correlationids">correlationIds<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#system-version_correlationids" title="#system-version_correlationids"></a></div>|<div className="interface-property-type">Array&lt;[Correlation ID](#correlation-id)&gt;</div>|<div className="interface-property-description">Correlation IDs for linking this system version to external systems of record.<hr/>**Array Constraint**: MUST have at least 1 items<br/>**Example Values**: <ul className="examples"><li>`["sap.cld:release:2408"]`</li></ul></div>|


### Overlay Target

Reference to the resource being patched.
At least one of ordId, url, or correlationIds MUST be provided.
Multiple identifiers are treated as all pointing to the same resource,
providing redundant ways to resolve it.

**Type**: Object(<a href="#overlay-target_ordid">ordId</a>, <a href="#overlay-target_url">url</a>, <a href="#overlay-target_correlationids">correlationIds</a>)

| Property | Type | Description |
| -------- | ---- | ----------- |
|<div className="interface-property-name anchor" id="overlay-target_ordid">ordId<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#overlay-target_ordid" title="#overlay-target_ordid"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">ORD ID of the resource being patched (e.g. an API Resource, Event Resource, Data Product).<br/>MUST be a valid [ORD ID](../../spec-v1/index.md#ord-id).<hr/>**Regex Pattern**: <code className="regex">^([a-z0-9]+(?\:[.][a-z0-9]+)\*)\:([a-zA-Z0-9._\\-]+)\:([a-zA-Z0-9._\\-]+)\:(v0\|v[1-9][0-9]\*)$</code><br/>**Maximum Length**: `255`<br/>**Example Values**: <ul className="examples"><li>`"sap.s4:apiResource:OP_API_BUSINESS_PARTNER_SRV:v1"`</li></ul></div>|
|<div className="interface-property-name anchor" id="overlay-target_url">url<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#overlay-target_url" title="#overlay-target_url"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">URL or URI pointing directly to the resource definition file to be patched<br/>(e.g. an OpenAPI document URL, an OData metadata endpoint).<hr/>**JSON Schema Format**: `uri-reference`<br/>**Example Values**: <ul className="examples"><li>`"https://example.com/api/openapi.json"`</li><li>`"./openapi.yaml"`</li></ul></div>|
|<div className="interface-property-name anchor" id="overlay-target_correlationids">correlationIds<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#overlay-target_correlationids" title="#overlay-target_correlationids"></a></div>|<div className="interface-property-type">Array&lt;string&gt;</div>|<div className="interface-property-description">Correlation IDs referencing the target resource in external registries or systems of record.<br/>Reuses the ORD correlation ID format: `namespace:type:localId`.<br/>All listed IDs are treated as pointing to the same resource.<hr/>**Array Constraint**: MUST have at least 1 items<br/>**Array Item Regex Pattern**: <code className="regex">^([a-z0-9]+(?\:[.][a-z0-9]+)\*)\:([a-zA-Z0-9._\\-\\/]+)\:([a-zA-Z0-9._\\-\\/]+)$</code><br/>**Example Values**: <ul className="examples"><li>`["sap.s4:communicationScenario:SAP_COM_0008"]`</li></ul></div>|


### Patch

A single patch action to apply to the element identified by the selector.

**Type**: Object(<a href="#patch_action">action</a>, <a href="#patch_selector">selector</a>, <a href="#patch_data">data</a>)

| Property | Type | Description |
| -------- | ---- | ----------- |
|<div className="interface-property-name anchor" id="patch_action">action<br/><span className="mandatory">MANDATORY</span><a className="hash-link" href="#patch_action" title="#patch_action"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">The patch operation to perform on the selected element:<br/><br/>- `update`: Replace the selected element entirely with `data`.<br/>- `merge`: Deep-merge `data` into the selected element (properties are added or overwritten, others preserved).<br/>- `remove`: Remove the selected element from the document entirely. No `data` required.<hr/>**Allowed Values**: <ul><li>`"update"`</li><li>`"merge"`</li><li>`"remove"`</li></ul></div>|
|<div className="interface-property-name anchor" id="patch_selector">selector<br/><span className="mandatory">MANDATORY</span><a className="hash-link" href="#patch_selector" title="#patch_selector"></a></div>|<div className="interface-property-type">[Selector](#selector)</div>|<div className="interface-property-description">Identifies the element within the resource definition to patch.<br/>Exactly one selector type is used per patch. Types represent different conceptual levels:<br/><br/>- `ordId`: resource level — targets an ORD resource (API, Event, Data Product, …)<br/>- `operationId`: operation level — targets an operation by its concept-level ID<br/>- `entityTypeId`: entity type level — targets an entity/type by its concept-level ID<br/>- `propertyId`: property level — targets a property/element within an entity type<br/>- `jsonPath`: generic fallback — targets any location in a JSON/YAML document by path<br/><br/>Prefer concept-level selectors (operationId, entityTypeId, propertyId) over jsonPath<br/>where possible, as they are resilient to structural changes in the target format.</div>|
|<div className="interface-property-name anchor" id="patch_data">data<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#patch_data" title="#patch_data"></a></div>|<div className="interface-property-type">[Patch Value](#patch-value)</div>|<div className="interface-property-description">The value to be merged into or used to replace the selected element.<br/>When used together with `merge: true` on the patch, performs a deep merge.<br/>When used without `merge` (or `merge: false`), replaces the selected element entirely.<br/>Mutually exclusive with `remove`.<br/><br/>This is a free-form object whose structure depends on the target being patched.</div>|


### Selector

Identifies the element within the resource definition to patch.
Exactly one selector type is used per patch. Types represent different conceptual levels:

- `ordId`: resource level — targets an ORD resource (API, Event, Data Product, …)
- `operationId`: operation level — targets an operation by its concept-level ID
- `entityTypeId`: entity type level — targets an entity/type by its concept-level ID
- `propertyId`: property level — targets a property/element within an entity type
- `jsonPath`: generic fallback — targets any location in a JSON/YAML document by path

Prefer concept-level selectors (operationId, entityTypeId, propertyId) over jsonPath
where possible, as they are resilient to structural changes in the target format.

**Type**: Object(<a href="#selector_type">type</a>, <a href="#selector_value">value</a>, <a href="#selector_entitytypeid">entityTypeId</a>, <a href="#selector_resourcetype">resourceType</a>)

| Property | Type | Description |
| -------- | ---- | ----------- |
|<div className="interface-property-name anchor" id="selector_type">type<br/><span className="mandatory">MANDATORY</span><a className="hash-link" href="#selector_type" title="#selector_type"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">The selector type. Determines how the `value` is interpreted:<br/><br/>- `jsonPath`: A JSONPath expression targeting any location in a JSON/YAML document (structure-bound, generic fallback).<br/>- `operationId`: An operation identifier (OpenAPI operationId, MCP tool name, AsyncAPI operationId, …).<br/>- `entityTypeId`: An entity type identifier (OData EntitySet/EntityType, CSN entity, JSON Schema definition, …).<br/>- `propertyId`: A property/element identifier within an entity type (requires `entityTypeId` to be set).<br/>- `ordId`: An ORD ID targeting an ORD resource (API, Event, Data Product, …).<hr/>**Allowed Values**: <ul><li>`"jsonPath"`</li><li>`"operationId"`</li><li>`"entityTypeId"`</li><li>`"propertyId"`</li><li>`"ordId"`</li></ul></div>|
|<div className="interface-property-name anchor" id="selector_value">value<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#selector_value" title="#selector_value"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">The selector value. Interpretation depends on the `type`:<br/><br/>- For `jsonPath`: A JSONPath expression (MUST start with `$`).<br/>- For `operationId`: The concept-level operation identifier (e.g. OpenAPI `operationId`, MCP tool `name`).<br/>- For `entityTypeId`: The concept-level entity type name (e.g. OData EntitySet name, CSN entity name).<br/>- For `propertyId`: The concept-level property/element name (e.g. OData Property name, CSN element name).<br/>- For `ordId`: A valid ORD ID of the resource to patch.<hr/>**Example Values**: <ul className="examples"><li>`"$.paths./business-partners.get"`</li><li>`"getBusinessPartner"`</li><li>`"BusinessPartner"`</li><li>`"BusinessPartnerFullName"`</li><li>`"sap.s4:apiResource:OP_API_BUSINESS_PARTNER_SRV:v1"`</li></ul></div>|
|<div className="interface-property-name anchor" id="selector_entitytypeid">entityTypeId<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#selector_entitytypeid" title="#selector_entitytypeid"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">Required when `type` is `propertyId`. Specifies the entity type that contains the target property.<br/>This scopes the property lookup to avoid ambiguity (the same property name may exist in multiple types).<hr/>**Example Values**: <ul className="examples"><li>`"BusinessPartner"`</li></ul></div>|
|<div className="interface-property-name anchor" id="selector_resourcetype">resourceType<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#selector_resourcetype" title="#selector_resourcetype"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">Optional hint when `type` is `ordId`. Specifies the ORD resource type to speed up resolution.<br/>If omitted, implementations SHOULD scan all resource types.<hr/>**Example Values**: <ul className="examples"><li>`"apiResource"`</li><li>`"eventResource"`</li><li>`"dataProduct"`</li></ul></div>|


### Patch Value

The value to be merged into or used to replace the selected element.
When used together with `merge: true` on the patch, performs a deep merge.
When used without `merge` (or `merge: false`), replaces the selected element entirely.
Mutually exclusive with `remove`.

This is a free-form object whose structure depends on the target being patched.

