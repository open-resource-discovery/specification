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

**Type**: Object(<a href="#resource-definition-overlay_$schema">$schema</a>, <a href="#resource-definition-overlay_resourcedefinitionoverlay">resourceDefinitionOverlay</a>, <a href="#resource-definition-overlay_info">info</a>, <a href="#resource-definition-overlay_target">target</a>, <a href="#resource-definition-overlay_patches">patches</a>)

| Property | Type | Description |
| -------- | ---- | ----------- |
|<div className="interface-property-name anchor" id="resource-definition-overlay_$schema">$schema<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#resource-definition-overlay_$schema" title="#resource-definition-overlay_$schema"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">Optional [URL](https://tools.ietf.org/html/rfc3986) to the Resource Definition Overlay schema (defined as a JSON Schema).<br/>If provided, this enables code intelligence and validation in supported editors (like VSCode) and tools.<hr/>**JSON Schema Format**: `uri-reference`<br/>**Array Item Allowed Values (extensible)**: <ul><li><em>Any</em> string of format `uri-reference`</li><li>`"https://open-resource-discovery.org/spec-extension/models/ResourceDefinitionOverlay.schema.json#"`</li></ul></div>|
|<div className="interface-property-name anchor" id="resource-definition-overlay_resourcedefinitionoverlay">resourceDefinitionOverlay<br/><span className="mandatory">MANDATORY</span><a className="hash-link" href="#resource-definition-overlay_resourcedefinitionoverlay" title="#resource-definition-overlay_resourcedefinitionoverlay"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">Version of the Resource Definition Overlay specification.<hr/>**Allowed Values**: <ul><li>`"0.1"`</li></ul><br/>**Example Values**: <ul className="examples"><li>`"0.1"`</li></ul></div>|
|<div className="interface-property-name anchor" id="resource-definition-overlay_info">info<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#resource-definition-overlay_info" title="#resource-definition-overlay_info"></a></div>|<div className="interface-property-type">[Overlay Info](#overlay-info)</div>|<div className="interface-property-description">Human-readable metadata about this overlay document.</div>|
|<div className="interface-property-name anchor" id="resource-definition-overlay_target">target<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#resource-definition-overlay_target" title="#resource-definition-overlay_target"></a></div>|<div className="interface-property-type">[Overlay Target](#overlay-target)</div>|<div className="interface-property-description">Reference to the single resource being patched by this overlay.<br/>MUST provide at least one identifier: an ORD ID, a URL, or one or more correlationIds.<br/>Multiple identifiers are treated as all pointing to the same resource,<br/>providing redundant ways to resolve it.</div>|
|<div className="interface-property-name anchor" id="resource-definition-overlay_patches">patches<br/><span className="mandatory">MANDATORY</span><a className="hash-link" href="#resource-definition-overlay_patches" title="#resource-definition-overlay_patches"></a></div>|<div className="interface-property-type">Array&lt;[Patch](#patch)&gt;</div>|<div className="interface-property-description">Ordered sequence of patches to apply to the targeted resource(s).<br/>Patches are applied in the order listed.<hr/>**Array Constraint**: MUST have at least 1 items</div>|


### Overlay Info

Human-readable metadata about this overlay document.

**Type**: Object(<a href="#overlay-info_title">title</a>, <a href="#overlay-info_version">version</a>, <a href="#overlay-info_description">description</a>)

| Property | Type | Description |
| -------- | ---- | ----------- |
|<div className="interface-property-name anchor" id="overlay-info_title">title<br/><span className="mandatory">MANDATORY</span><a className="hash-link" href="#overlay-info_title" title="#overlay-info_title"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">Short human-readable title describing the purpose of this overlay.<hr/>**Example Values**: <ul className="examples"><li>`"Add deprecation notices to legacy operations"`</li></ul></div>|
|<div className="interface-property-name anchor" id="overlay-info_version">version<br/><span className="mandatory">MANDATORY</span><a className="hash-link" href="#overlay-info_version" title="#overlay-info_version"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">Version of this overlay document (not the spec version).<hr/>**Example Values**: <ul className="examples"><li>`"1.0.0"`</li></ul></div>|
|<div className="interface-property-name anchor" id="overlay-info_description">description<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#overlay-info_description" title="#overlay-info_description"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">Longer description of what this overlay does and why.</div>|


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

