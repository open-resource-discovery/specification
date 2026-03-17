---
title: "ORD Overlay"
sidebar_position: "2"
description: "Describes the technical interface / schema for the ORD Overlay (alpha), used to patch ORD resources and their resource definitions."
---

:::caution Alpha
This specification is in **alpha** and subject to change.
:::

The **ORD Overlay** is an optional ORD model extension that allows patching both ORD resource metadata
and referenced resource definition files (e.g. OpenAPI, AsyncAPI, OData CSDL, MCP/A2A Agent Cards)
without modifying the original source files.

```json
{
  "ordOverlay": "0.1",
  "target": { "ordId": "sap.foo:apiResource:astronomy:v1", "definitionType": "openapi-v3" },
  "patches": [
    {
      "action": "merge",
      "selector": { "operation": "getConstellationByAbbreviation" },
      "data": {
        "summary": "Get constellation by IAU abbreviation",
        "description": "Returns full details of a constellation by its IAU abbreviation (e.g. 'Ori' for Orion). Useful for star-chart lookups and astronomy education tools."
      }
    }
  ]
}
```

## Distribution

Decision guidance for choosing a distribution mode is collected in the
[Appendix: ORD Configuration vs. Attached Resource Definition](#deep-dive-ord-configuration-vs-attached-resource-definition).

### Via the ORD Configuration Endpoint

Overlays can be listed directly in the [ORD Configuration Endpoint](../../spec-v1/index.md#ord-configuration-endpoint) under `openResourceDiscoveryV1.overlays`.
This is the preferred approach for cross-cutting overlays that are not tied to a single resource, or when patching ORD resource metadata itself.

```json
{
  "openResourceDiscoveryV1": {
    "overlays": [
      { "url": "/ord/overlays/my-api.overlay.json", "accessStrategies": [{ "type": "open" }] }
    ]
  }
}
```

### Attached to an ORD Resource

Overlays can also be attached directly to an API or Event resource as a `resourceDefinitions` entry with type `ord:overlay:v1`.
This keeps the overlay co-located with the resource it patches.

```json
{
  "resourceDefinitions": [
    { "type": "openapi-v3", "url": "/ord/metadata/my-api.oas3.json", "accessStrategies": [{ "type": "open" }] },
    { "type": "ord:overlay:v1", "url": "/ord/overlays/my-api.overlay.json", "accessStrategies": [{ "type": "open" }] }
  ]
}
```

## Target Resolution

The optional [`target`](#overlay-target) object narrows which document the overlay applies to.
When omitted, all patches in the file are context-free and each patch's [`selector`](#overlay-selector) alone identifies the element.

Key fields on `target`:

| Field | Purpose |
|---|---|
| `ordId` | Identifies the ORD resource being patched (API, Event, Data Product, …). Selects the ORD resource metadata itself. |
| `url` | Direct URL to the specific metadata definition file (e.g. an OpenAPI JSON file). |
| `definitionType` | Declares the format of the file (e.g. `openapi-v3`, `a2a-agent-card`). Disambiguates when a resource has multiple definitions attached. |

Example of ambiguity: an OData API resource may expose both `edmx` and `openapi-v3` definitions.
Provide `definitionType` and/or `url` to make the concrete patch target explicit.

For overlays that only patch ORD metadata via [`selector.ordId`](#overlay-selector-by-ord-id), `target` may be omitted.
Multiple resources can be patched in a single file using multiple patches with different selector `ordId` values.

## Selectors

Each [patch](#overlay-patch) identifies the element to patch using exactly one [selector](#overlay-selector).
Concept-level selectors are preferred over `jsonPath` because they are resilient to structural format changes
(e.g. OpenAPI 3.0 → 3.1, OData CSDL XML → JSON).

| Selector | Level | Supported formats |
|---|---|---|
| [`ordId`](#overlay-selector-by-ord-id) | Resource | ORD resource metadata |
| [`operation`](#overlay-selector-by-operation) | Operation | OpenAPI (`openapi-v2/v3/v3.1+`), MCP (MCP Server Card), A2A Agent Card (`a2a-agent-card`), OData (`edmx`, `csdl-json`) |
| [`entityType`](#overlay-selector-by-entity-type) | Entity type | OData (`edmx`, `csdl-json`), CSN Interop (`sap-csn-interop-effective-v1`) |
| [`propertyType`](#overlay-selector-by-property-type) | Property | OData (`edmx`, `csdl-json`), CSN Interop (`sap-csn-interop-effective-v1`) |
| [`jsonPath`](#overlay-selector-by-jsonpath) | Any location | Any JSON/YAML metadata file (generic fallback) |

The [`operation`](#overlay-selector-by-operation) selector maps to different identifiers depending on the format:

- **OpenAPI** → `operationId` of an HTTP operation in `paths.{path}.{method}`
- **MCP** (any [Specification ID](../../spec-v1/index.md#specification-id)) → `tools[].name`
- **A2A Agent Card** → `skills[].id`
- **OData** (`edmx`, `csdl-json`) → Action or Function name, namespace-qualified (e.g. `OData.Demo.Approval`)

When `definitionType` is set on `target`, the format is known and the selector resolves unambiguously.
When `definitionType` is absent, the implementation SHOULD infer the format from the target document's content (e.g. the `openapi` field, `$schema`, or `$kind` markers).
Using the `operation` selector with a named format constant that has no operation support (e.g. `asyncapi-v2`) raises an error.

## Patch Actions

Each [patch](#overlay-patch) specifies an [`action`](#overlay-patch) and a [`selector`](#overlay-selector), plus an optional [`data`](#overlay-patch-value) value.
The full semantics of each action (`update`, `merge`, `append`, `remove`) are defined on the [`action`](#overlay-patch) field.

Key point for `merge`: arrays are appended, not replaced.
To fully replace an array, use two ordered patches — first `remove` the array, then `merge` the new value.

## Validation

Overlays assume the target document is already valid for its native format.
The merge tool does not fully re-validate target formats.
After applying an overlay, validate the merged output with the corresponding format-specific tooling.

## ORD Aggregator Expectations

An ORD Aggregator MUST apply overlays that patch ORD resource metadata when building its ORD Discovery API and related indexes.
This is necessary so that ORD-level overlay changes are reflected in discovery responses, filtering, searching, and similar aggregator behavior.

An ORD Aggregator SHOULD enforce that overlay sources are permitted to patch the target metadata.
Without such enforcement, consumers could be exposed to unauthorized metadata changes through overlay processing.

## Overlay Document Metadata

Note on [`perspective`](#overlay-perspective): unlike its use in ORD Documents (which scopes transport),
`perspective` on an overlay declares *where the patch should be applied* — at system-type, system-version, or system-instance level.
See the field description for details.

## Schema Definitions

* The root schema of the document is [ORD Overlay](#ord-overlay)
* The interface is available as JSON Schema: [OrdOverlay.schema.json](https://open-resource-discovery.org/spec-extension/models/OrdOverlay.schema.json#).


### ORD Overlay

**Type**: Object(<a href="#ord-overlay_$schema">$schema</a>, <a href="#ord-overlay_ordoverlay">ordOverlay</a>, <a href="#ord-overlay_ordid">ordId</a>, <a href="#ord-overlay_description">description</a>, <a href="#ord-overlay_perspective">perspective</a>, <a href="#ord-overlay_describedsystemtype">describedSystemType</a>, <a href="#ord-overlay_describedsystemversion">describedSystemVersion</a>, <a href="#ord-overlay_describedsysteminstance">describedSystemInstance</a>, <a href="#ord-overlay_visibility">visibility</a>, <a href="#ord-overlay_target">target</a>, <a href="#ord-overlay_patches">patches</a>)

| Property | Type | Description |
| -------- | ---- | ----------- |
|<div className="interface-property-name anchor" id="ord-overlay_$schema">$schema<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#ord-overlay_$schema" title="#ord-overlay_$schema"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">Optional [URL](https://tools.ietf.org/html/rfc3986) to the ORD Overlay schema (defined as a JSON Schema).<br/>If provided, this enables code intelligence and validation in supported editors (like VSCode) and tools.<hr/>**JSON Schema Format**: `uri-reference`<br/>**Array Item Allowed Values (extensible)**: <ul><li><em>Any</em> string of format `uri-reference`</li><li>`"https://open-resource-discovery.org/spec-extension/models/OrdOverlay.schema.json#"`</li></ul></div>|
|<div className="interface-property-name anchor" id="ord-overlay_ordoverlay">ordOverlay<br/><span className="mandatory">MANDATORY</span><a className="hash-link" href="#ord-overlay_ordoverlay" title="#ord-overlay_ordoverlay"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">Version of the ORD Overlay specification.<hr/>**Allowed Values**: <ul><li>`"0.1"`</li></ul><br/>**Example Values**: <ul className="examples"><li>`"0.1"`</li></ul></div>|
|<div className="interface-property-name anchor" id="ord-overlay_ordid">ordId<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#ord-overlay_ordid" title="#ord-overlay_ordid"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">Optional ORD ID of this overlay document.<br/>MUST be provided if the ORD Overlay is published via ORD Configuration endpoint.<hr/>**Regex Pattern**: <code className="regex">^([a-z0-9]+(?\:[.][a-z0-9]+)\*)\:(overlay)\:([a-zA-Z0-9._\\-]+)\:(v0\|v[1-9][0-9]\*)$</code><br/>**Maximum Length**: `255`<br/>**Example Values**: <ul className="examples"><li>`"sap.foo:overlay:astronomy-api-openapi:v1"`</li></ul></div>|
|<div className="interface-property-name anchor" id="ord-overlay_description">description<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#ord-overlay_description" title="#ord-overlay_description"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">Optional description of the overlay document itself.<br/><br/>Notated in [CommonMark](https://spec.commonmark.org/) (Markdown).<hr/>**Minimum Length**: `1`<br/>**Example Values**: <ul className="examples"><li>`"This overlay adds descriptive metadata for AI use-cases\nwithout modifying the original resource definition.\n"`</li></ul></div>|
|<div className="interface-property-name anchor" id="ord-overlay_perspective">perspective<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#ord-overlay_perspective" title="#ord-overlay_perspective"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">Overlay Perspective<br/><br/>Overlay-specific [perspective](../../spec-v1/index.md#perspectives) that scopes where this overlay should be applied.<br/><br/>Use this together with `describedSystemType`, `describedSystemVersion`, and `describedSystemInstance`<br/>to describe whether the overlay applies broadly to a system type, to one released system version,<br/>or only to a specific system instance.<hr/>**Allowed Values**: <ul><li><p>`"system-type"`: Applies the overlay at system-type level.<br/><br/>Use this when the overlay should patch the same targeted resource across versions and instances<br/>of the same system type, typically for the same ORD resource major version.<br/>`describedSystemType` SHOULD be provided as the identifying context.</p></li><li><p>`"system-version"`: Applies the overlay to one concrete system version.<br/><br/>Use this when metadata differs between released versions and the patch should only affect<br/>a specific version of the target resource.<br/>`describedSystemVersion` SHOULD be provided, and `describedSystemType` SHOULD also be provided as parent context.</p></li><li><p>`"system-instance"`: Applies the overlay to one concrete system instance / tenant.<br/><br/>Use this when the patch reflects tenant-specific configuration, extensions, or runtime differences<br/>in the target metadata.<br/>`describedSystemInstance` SHOULD be provided.</p></li></ul><br/>**Example Values**: <ul className="examples"><li>`"system-type"`</li><li>`"system-version"`</li><li>`"system-instance"`</li></ul></div>|
|<div className="interface-property-name anchor" id="ord-overlay_describedsystemtype">describedSystemType<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#ord-overlay_describedsystemtype" title="#ord-overlay_describedsystemtype"></a></div>|<div className="interface-property-type">[Overlay System Type](#overlay-system-type)</div>|<div className="interface-property-description">Information on the [system type](../../spec-v1/index.md#system-type) this overlay describes.<br/>This object is identical to the ORD Document [`describedSystemType`](../../spec-v1/interfaces/Document.md#ord-document_describedsystemtype) object.<br/><br/>Its purpose is to link the overlay to the same system landscape model as ORD resources, if needed.<br/>This is the primary context object for `perspective: system-type`, and also the parent context<br/>for more specific `system-version` and `system-instance` overlays.<br/><br/>Usually this is not necessary for static overlays if the patched resource is already selected via ORD ID.</div>|
|<div className="interface-property-name anchor" id="ord-overlay_describedsystemversion">describedSystemVersion<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#ord-overlay_describedsystemversion" title="#ord-overlay_describedsystemversion"></a></div>|<div className="interface-property-type">[Overlay System Version](#overlay-system-version)</div>|<div className="interface-property-description">Information on the [system version](../../spec-v1/index.md#system-version) this overlay describes.<br/>This object is identical to the ORD Document [`describedSystemVersion`](../../spec-v1/interfaces/Document.md#ord-document_describedsystemversion) object.<br/><br/>Its purpose is to link the overlay to the same system landscape model as ORD resources, if needed.<br/>Use this when the overlay should only patch metadata for one specific released system version.<br/><br/>Usually this is not necessary for static overlays if the patched resource is already selected via ORD ID.</div>|
|<div className="interface-property-name anchor" id="ord-overlay_describedsysteminstance">describedSystemInstance<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#ord-overlay_describedsysteminstance" title="#ord-overlay_describedsysteminstance"></a></div>|<div className="interface-property-type">[Overlay System Instance](#overlay-system-instance)</div>|<div className="interface-property-description">Information on the [system instance](../../spec-v1/index.md#system-instance) this overlay describes.<br/>This object is identical to the ORD Document [`describedSystemInstance`](../../spec-v1/interfaces/Document.md#ord-document_describedsysteminstance) object.<br/><br/>Its purpose is to link the overlay to the same system landscape model as ORD resources, if needed.<br/>Use this when the overlay should only patch metadata for one concrete tenant / runtime instance.<br/><br/>Usually this is not necessary for static overlays if the patched resource is already selected via ORD ID.</div>|
|<div className="interface-property-name anchor" id="ord-overlay_visibility">visibility<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#ord-overlay_visibility" title="#ord-overlay_visibility"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">Overlay Visibility<br/><br/>Controls which consumers can discover and access this overlay document.<br/><br/>It does NOT control runtime access to the resources being patched — that is managed separately through authentication and authorization mechanisms.<br/><br/>Use this to prevent exposing internal overlay enrichments to inappropriate consumer audiences.<hr/>**Allowed Values**: <ul><li><p>`"public"`: The overlay can be discovered and accessed by anyone, including customers, partners, and unauthenticated external parties.</p></li><li><p>`"internal"`: The overlay can only be discovered and accessed by vendor internal consumers (e.g. applications or services of the same vendor).<br/>MUST NOT be made available to external parties or vendor customers.</p></li><li><p>`"private"`: The overlay should not be discoverable outside the application / service's own deployment scope (e.g., outside of the provider application or the same system namespace / system type).</p></li></ul></div>|
|<div className="interface-property-name anchor" id="ord-overlay_target">target<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#ord-overlay_target" title="#ord-overlay_target"></a></div>|<div className="interface-property-type">[Overlay Target](#overlay-target)</div>|<div className="interface-property-description">Optional target context for this overlay.<br/>The target can reference an ORD resource or a referenced resource definition file.<br/><br/>When `target` is present, at least one identifier (`ordId`, `url`, or `correlationIds`)<br/>MUST be provided so that consumers and tooling can determine what is being patched.<br/><br/>`ordId` selects the ORD resource metadata itself.<br/>If patches are intended for a specific attached metadata definition file, `ordId` alone can be ambiguous<br/>when the resource exposes multiple definitions.<br/>In that case, use `url` and/or `definitionType` to clarify the intended file.<br/><br/>Example: an OData API resource may provide both `edmx` and `openapi-v3` definitions.<br/>Use `definitionType` and/or an explicit `url` to identify which one is patched.<br/><br/>Exception: if all patches exclusively use `selector.ordId`, the patch selectors themselves<br/>are sufficient to identify the target resources and `target` may be omitted entirely.<br/>Multiple resources can still be patched by defining multiple patches with different selector `ordId` values.</div>|
|<div className="interface-property-name anchor" id="ord-overlay_patches">patches<br/><span className="mandatory">MANDATORY</span><a className="hash-link" href="#ord-overlay_patches" title="#ord-overlay_patches"></a></div>|<div className="interface-property-type">Array&lt;[Overlay Patch](#overlay-patch)&gt;</div>|<div className="interface-property-description">Ordered sequence of patches to apply to the targeted resource(s).<br/>Patches are applied strictly in the order they are listed.<br/>If two patches target the same document element, both are applied in sequence —<br/>the later patch supersedes the earlier one.<hr/>**Array Constraint**: MUST have at least 1 items</div>|


### Overlay Target

Optional context about the target being patched.
The target can refer to an ORD resource or to a referenced resource definition file.

When this object is present, at least one of `ordId`, `url`, or `correlationIds`
MUST be provided so that consumers can identify what is being patched.
Exception: if all patches exclusively use `selector.ordId` selectors, `target` may be omitted entirely.

`ordId` targets the ORD resource metadata itself.
For patching a specific resource definition file of that resource, use `url` and/or `definitionType`
to disambiguate.

Example: one OData API resource can have both `edmx` and `openapi-v3` definitions attached.
In such cases, provide `definitionType` and/or `url` to make the concrete patch target explicit.

Multiple identifiers, if provided, are treated as all pointing to the same resource.

**Type**: Object(<a href="#overlay-target_ordid">ordId</a>, <a href="#overlay-target_url">url</a>, <a href="#overlay-target_correlationids">correlationIds</a>, <a href="#overlay-target_definitiontype">definitionType</a>)

| Property | Type | Description |
| -------- | ---- | ----------- |
|<div className="interface-property-name anchor" id="overlay-target_ordid">ordId<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#overlay-target_ordid" title="#overlay-target_ordid"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">ORD ID of the target being patched (e.g. an API Resource, Event Resource, Data Product).<br/>MUST be a valid [ORD ID](../../spec-v1/index.md#ord-id).<hr/>**Regex Pattern**: <code className="regex">^([a-z0-9]+(?\:[.][a-z0-9]+)\*)\:([a-zA-Z0-9._\\-]+)\:([a-zA-Z0-9._\\-]+)\:(v0\|v[1-9][0-9]\*)$</code><br/>**Maximum Length**: `255`<br/>**Example Values**: <ul className="examples"><li>`"sap.s4:apiResource:OP_API_BUSINESS_PARTNER_SRV:v1"`</li></ul></div>|
|<div className="interface-property-name anchor" id="overlay-target_url">url<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#overlay-target_url" title="#overlay-target_url"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">URL or URI pointing directly to the file being patched.<br/>This is typically a resource definition file (e.g. OpenAPI, AsyncAPI, OData CSDL),<br/>but can also point to any JSON/YAML-based target document.<hr/>**JSON Schema Format**: `uri-reference`<br/>**Example Values**: <ul className="examples"><li>`"https://example.com/api/openapi.json"`</li><li>`"./openapi.yaml"`</li></ul></div>|
|<div className="interface-property-name anchor" id="overlay-target_correlationids">correlationIds<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#overlay-target_correlationids" title="#overlay-target_correlationids"></a></div>|<div className="interface-property-type">Array&lt;string&gt;</div>|<div className="interface-property-description">Correlation IDs referencing the target resource in external registries or systems of record.<br/>Reuses the ORD correlation ID format: `namespace:type:localId`.<br/>All listed IDs are treated as pointing to the same resource.<hr/>**Array Constraint**: MUST have at least 1 items<br/>**Array Item Regex Pattern**: <code className="regex">^([a-z0-9]+(?\:[.][a-z0-9]+)\*)\:([a-zA-Z0-9._\\-\\/]+)\:([a-zA-Z0-9._\\-\\/]+)$</code><br/>**Example Values**: <ul className="examples"><li>`["sap.s4:communicationScenario:SAP_COM_0008"]`</li></ul></div>|
|<div className="interface-property-name anchor" id="overlay-target_definitiontype">definitionType<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#overlay-target_definitiontype" title="#overlay-target_definitiontype"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">Overlay Definition Type<br/><br/>Optional, but RECOMMENDED type of the target definition being patched.<br/>If provided, this SHOULD match the `type` of the referenced metadata definition<br/>(as used in API/Event/Capability resource definitions).<br/>This is especially useful when `ordId` resolves to a resource with multiple attached definitions.<br/><br/>This can be used to disambiguate how selectors are interpreted for the target.<br/><br/>MUST be either:<br/>- any valid [Specification ID](../../spec-v1/index.md#specification-id), or<br/>- one of the pre-defined values reused from:<br/>  - API Resource Definition `type`<br/>  - Event Resource Definition `type`<br/>  - Capability Definition `type`<br/><br/>The literal value `custom` is deprecated for `definitionType` and MUST NOT be used.<br/>In such cases, use a concrete [Specification ID](../../spec-v1/index.md#specification-id) instead.<hr/>**Array Item Allowed Values (extensible)**: <ul><li><em>Any</em> string: Any valid [Specification ID](../../spec-v1/index.md#specification-id).</li><li>`"openapi-v2"`</li><li>`"openapi-v3"`</li><li>`"openapi-v3.1+"`</li><li>`"raml-v1"`</li><li>`"edmx"`</li><li>`"csdl-json"`</li><li>`"graphql-sdl"`</li><li>`"wsdl-v1"`</li><li>`"wsdl-v2"`</li><li>`"a2a-agent-card"`</li><li>`"sap-rfc-metadata-v1"`</li><li>`"sap-sql-api-definition-v1"`</li><li>`"sap-csn-interop-effective-v1"`</li><li>`"asyncapi-v2"`</li><li>`"sap.mdo:mdi-capability-definition:v1"`</li><li>`"ord:overlay:v1"`</li></ul><br/>**Example Values**: <ul className="examples"><li>`"openapi-v3"`</li><li>`"asyncapi-v2"`</li><li>`"sap.mdo:mdi-capability-definition:v1"`</li></ul></div>|


### Overlay Patch

A single patch action to apply to the element identified by the selector.

**Type**: Object(<a href="#overlay-patch_action">action</a>, <a href="#overlay-patch_selector">selector</a>, <a href="#overlay-patch_data">data</a>)

| Property | Type | Description |
| -------- | ---- | ----------- |
|<div className="interface-property-name anchor" id="overlay-patch_action">action<br/><span className="mandatory">MANDATORY</span><a className="hash-link" href="#overlay-patch_action" title="#overlay-patch_action"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">The patch operation to perform on the selected element:<br/><br/>- `update`: Replace the selected element entirely with `data`.<br/>- `append`:<br/>  - When `data` is a string: append it to the selected string value.<br/>    Only valid when the selected element is a text/string field.<br/>  - When `data` is an object: recursively append each string property in `data`<br/>    to the corresponding string field in the selected object.<br/>    Nested objects are traversed; arrays in `data` are appended to matching arrays.<br/>    Throws an error if a string in `data` targets a non-string field in the target.<br/>  - Useful to extend existing descriptions, summaries, or other text fields<br/>    without replacing them entirely.<br/>- `remove`:<br/>  - `data: {}` (empty object): remove the selected element from the document entirely.<br/>  - `data` with null-valued properties: remove only those fields (recursively).<br/>    Nested `null` values remove nested fields as well<br/>    (JSON Merge Patch-style delete semantics).<br/><br/>Example for partial removal:<br/>`data: { "foo": { "bar": null } }` removes only `foo.bar` inside the selected element.<br/>To remove the entire selected element, use `data: {}`.<br/>- `merge`:<br/>  - objects are deep-merged recursively.<br/>  - scalar values are overwritten by the value from `data`.<br/>  - arrays are appended (new array items are added after existing items).<br/>  - existing object properties not mentioned in `data` are preserved.<br/><br/>  To fully replace an array, use two ordered patches:<br/>  1. `remove` the array at the selected location.<br/>  2. `merge` the new array content.<hr/>**Allowed Values**: <ul><li>`"update"`</li><li>`"append"`</li><li>`"remove"`</li><li>`"merge"`</li></ul></div>|
|<div className="interface-property-name anchor" id="overlay-patch_selector">selector<br/><span className="mandatory">MANDATORY</span><a className="hash-link" href="#overlay-patch_selector" title="#overlay-patch_selector"></a></div>|<div className="interface-property-type">[Overlay Selector](#overlay-selector)</div>|<div className="interface-property-description">Identifies the element in the target to patch.<br/>Exactly one selector type is used per patch. The selector object uses one explicit key:<br/><br/>- `ordId`: resource level - targets an ORD resource (API, Event, Data Product, ...)<br/>- `operation`: operation level - targets an operation (OpenAPI: operationId, MCP: tool name, OData: Action/Function name)<br/>- `entityType`: entity type level - targets an OData EntityType or CSN entity definition by name<br/>- `propertyType`: property type level - targets a property/element on an OData EntityType/ComplexType or a CSN entity element<br/>- `jsonPath`: generic fallback - targets any location in a JSON/YAML-based target document by path<br/><br/>Prefer concept-level selectors (operation, entityType, propertyType) over jsonPath<br/>where possible, as they are resilient to structural changes in the target format.</div>|
|<div className="interface-property-name anchor" id="overlay-patch_data">data<br/><span className="mandatory">MANDATORY</span><a className="hash-link" href="#overlay-patch_data" title="#overlay-patch_data"></a></div>|<div className="interface-property-type">[Overlay Patch Value](#overlay-patch-value)</div>|<div className="interface-property-description">The value to be used together with patch actions:<br/>- with `action: append`:<br/>  - string value appended to selected text field<br/>- with `action: merge`:<br/>  - objects are deep-merged recursively<br/>  - scalar values overwrite existing values<br/>  - arrays are appended to existing arrays<br/>- with `action: update`, it replaces the selected element entirely<br/>- with `action: remove`:<br/>  - `{}` (empty object): the selected element is removed entirely<br/>  - object with null-valued properties: only those fields are deleted (recursively,<br/>    including nested fields; JSON Merge Patch-style delete semantics)<br/><br/>To fully replace an existing array, use two ordered patches:<br/>1. remove the array<br/>2. merge the new array value<br/><br/>For OData targets (`edmx`, `csdl-json`), the value MUST be expressed in CSDL JSON<br/>annotation format. Annotation keys use the `@TermName` convention:<br/>e.g. `{ "@Core.Description": "...", "@Core.Revisions": [...] }`.<br/>When the target is EDMX XML, the merge implementation converts this to `<Annotation>` elements.<br/>See: https://docs.oasis-open.org/odata/odata-csdl-json/v4.01/odata-csdl-json-v4.01.html<br/><br/>For CSN Interop targets (`sap-csn-interop-effective-v1`), the value is plain CSN JSON<br/>merged directly into the matched entity definition or element object.<br/>Use the CSN `doc` field for human-readable descriptions, and `@AnnotationName` keys<br/>for vocabulary annotations (e.g. `@EndUserText.label`, `@Semantics.text`).<br/>See: https://sap.github.io/csn-interop-specification/<br/><br/>This is a free-form value whose structure depends on the target being patched.<br/><br/>`null` as a standalone patch value is not supported outside `remove` masks.<br/>To delete an element, use `action: remove` with `data: {}`.</div>|


### Overlay Selector

Identifies the element in the target to patch.
Exactly one selector type is used per patch. The selector object uses one explicit key:

- `ordId`: resource level - targets an ORD resource (API, Event, Data Product, ...)
- `operation`: operation level - targets an operation (OpenAPI: operationId, MCP: tool name, OData: Action/Function name)
- `entityType`: entity type level - targets an OData EntityType or CSN entity definition by name
- `propertyType`: property type level - targets a property/element on an OData EntityType/ComplexType or a CSN entity element
- `jsonPath`: generic fallback - targets any location in a JSON/YAML-based target document by path

Prefer concept-level selectors (operation, entityType, propertyType) over jsonPath
where possible, as they are resilient to structural changes in the target format.

One of the following: 
[Overlay Selector By JsonPath](#overlay-selector-by-jsonpath) \| [Overlay Selector By ORD ID](#overlay-selector-by-ord-id) \| [Overlay Selector By Operation](#overlay-selector-by-operation) \| [Overlay Selector By Entity Type](#overlay-selector-by-entity-type) \| [Overlay Selector By Property Type](#overlay-selector-by-property-type) \| [Overlay Selector By Entity Set](#overlay-selector-by-entity-set) \| [Overlay Selector By Namespace](#overlay-selector-by-namespace) \| [Overlay Selector By Parameter](#overlay-selector-by-parameter) \| [Overlay Selector By Return Type](#overlay-selector-by-return-type)<br/>

###### Example Values:


```js
{
  "ordId": "sap.foo:apiResource:astronomy:v1"
}
```


```js
{
  "operation": "getConstellationByAbbreviation"
}
```


```js
{
  "operation": "OData.Demo.Approval"
}
```


```js
{
  "operation": "dispute-case-resolution"
}
```


```js
{
  "entityType": "OData.Demo.Customer"
}
```


```js
{
  "entityType": "AirlineService.Airline"
}
```


```js
{
  "propertyType": "BirthDate",
  "entityType": "OData.Demo.Customer"
}
```


```js
{
  "propertyType": "AirlineID",
  "entityType": "AirlineService.Airline"
}
```


```js
{
  "jsonPath": "$.info.description"
}
```


```js
{
  "jsonPath": "$.paths['/constellations'].get"
}
```


### Overlay Selector By JsonPath

**Type**: Object(<a href="#overlay-selector-by-jsonpath_jsonpath">jsonPath</a>)

| Property | Type | Description |
| -------- | ---- | ----------- |
|<div className="interface-property-name anchor" id="overlay-selector-by-jsonpath_jsonpath">jsonPath<br/><span className="mandatory">MANDATORY</span><a className="hash-link" href="#overlay-selector-by-jsonpath_jsonpath" title="#overlay-selector-by-jsonpath_jsonpath"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">JSONPath expression targeting any location in a JSON/YAML-based target document.<br/>MUST start with `$`.<br/>This is the generic structural fallback selector, supported for all JSON/YAML-based formats:<br/>- `openapi-v2`, `openapi-v3`, `openapi-v3.1+`: targets any node in the OpenAPI document.<br/>- `a2a-agent-card`: targets any node in the A2A Agent Card JSON document.<br/>- `csdl-json`: targets any node in the OData CSDL JSON document.<br/>- MCP (any Specification ID): targets any node in the MCP-compatible JSON/YAML tool metadata.<br/><br/>Use concept-level selectors (`operation`, `entityType`, etc.) when available, as they are<br/>resilient to structural differences between format versions. Reserve `jsonPath` for cases<br/>where no concept-level selector covers the target location.<hr/>**Regex Pattern**: <code className="regex">^\\$</code><br/>**Minimum Length**: `1`<br/>**Example Values**: <ul className="examples"><li>`"$.info.description"`</li><li>`"$.paths['/constellations'].get"`</li></ul></div>|


### Overlay Selector By ORD ID

**Type**: Object(<a href="#overlay-selector-by-ord-id_ordid">ordId</a>)

| Property | Type | Description |
| -------- | ---- | ----------- |
|<div className="interface-property-name anchor" id="overlay-selector-by-ord-id_ordid">ordId<br/><span className="mandatory">MANDATORY</span><a className="hash-link" href="#overlay-selector-by-ord-id_ordid" title="#overlay-selector-by-ord-id_ordid"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">ORD ID targeting an ORD resource (API, Event, Data Product, ...) in an ORD document.<br/>MUST be a valid [ORD ID](../../spec-v1/index.md#ord-id).<br/>Supported metadata formats:<br/>- ORD document (no specific `definitionType`): locates the ORD resource object whose<br/>  `ordId` field matches this value. The resource type (apiResource, eventResource,<br/>  dataProduct, etc.) is derived from the ORD ID namespace and is not required in the selector.<br/><br/>Use this selector when patching ORD resource metadata itself (e.g. title, description,<br/>visibility, tags). For patching the technical API definition file that the resource<br/>references, apply the overlay to that definition file directly using its own selectors.<hr/>**Regex Pattern**: <code className="regex">^([a-z0-9]+(?\:[.][a-z0-9]+)\*)\:([a-zA-Z0-9._\\-]+)\:([a-zA-Z0-9._\\-]+)\:(v0\|v[1-9][0-9]\*)$</code><br/>**Example Values**: <ul className="examples"><li>`"sap.s4:apiResource:OP_API_BUSINESS_PARTNER_SRV:v1"`</li></ul></div>|


### Overlay Selector By Operation

**Type**: Object(<a href="#overlay-selector-by-operation_operation">operation</a>)

| Property | Type | Description |
| -------- | ---- | ----------- |
|<div className="interface-property-name anchor" id="overlay-selector-by-operation_operation">operation<br/><span className="mandatory">MANDATORY</span><a className="hash-link" href="#overlay-selector-by-operation_operation" title="#overlay-selector-by-operation_operation"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">Concept-level operation identifier.<br/>Supported mappings by format:<br/>- OpenAPI (`openapi-v2`, `openapi-v3`, `openapi-v3.1+`): maps to the `operationId` field on<br/>  an HTTP operation inside `paths.{path}.{method}`.<br/>- MCP (any Specification ID other than `a2a-agent-card`): maps to `tools[].name`.<br/>  See: https://modelcontextprotocol.io/specification/2025-11-25/schema#tool-name<br/>- A2A Agent Card (`a2a-agent-card`): maps to `skills[].id`.<br/>  See: https://google.github.io/A2A/specification/#agentskill-object<br/>- OData (`edmx`, `csdl-json`): maps to the Action or Function name at Schema level.<br/>  MUST use the namespace-qualified name (e.g. `OData.Demo.Approval`) to be unambiguous.<br/>  For OData v2 `edmx` targets: also searches FunctionImport elements in EntityContainer<br/>  when no Schema-level Action/Function matches the name.<br/>  For bound operations overloaded on multiple entity types, use `jsonPath` as a fallback<br/>  to target the specific overload.<br/><br/>When `definitionType` is set on `target`, the format is known and the selector resolves unambiguously.<br/>When `definitionType` is absent, the implementation SHOULD infer the format from the target<br/>document's content (e.g. the `openapi` field, `$schema`, or `$kind` markers).<hr/>**Minimum Length**: `1`<br/>**Example Values**: <ul className="examples"><li>`"getConstellationByAbbreviation"`</li><li>`"dispute-case-resolution"`</li><li>`"OData.Demo.Approval"`</li><li>`"OData.Demo.Rejection"`</li><li>`"getCompensationHistory"`</li></ul></div>|


### Overlay Selector By Entity Type

**Type**: Object(<a href="#overlay-selector-by-entity-type_entitytype">entityType</a>)

| Property | Type | Description |
| -------- | ---- | ----------- |
|<div className="interface-property-name anchor" id="overlay-selector-by-entity-type_entitytype">entityType<br/><span className="mandatory">MANDATORY</span><a className="hash-link" href="#overlay-selector-by-entity-type_entitytype" title="#overlay-selector-by-entity-type_entitytype"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">Concept-level entity or enum type identifier.<br/>Supported metadata formats:<br/>- `edmx` (OData v2/v4 CSDL XML): targets EntityType, ComplexType, or EnumType elements<br/>  declared in the Schema. MUST use the namespace-qualified name (e.g. `OData.Demo.Customer`).<br/>  For EntitySet-level patching (Capabilities annotations), use the `entitySet` selector instead.<br/>- `csdl-json` (OData v4 CSDL JSON): same name resolution as `edmx`. Resolves elements<br/>  with `$Kind` equal to `EntityType`, `ComplexType`, or `EnumType`.<br/>- `sap-csn-interop-effective-v1` (CSN Interop): targets a `definitions` entry by its<br/>  fully qualified key (e.g. `AirlineService.Airline`). In CSN Interop the key is always<br/>  fully qualified, so the fully qualified form MUST be used.<br/><br/>When targeting an EnumType to patch its members individually,<br/>use this selector as the `entityType` context within a `propertyType` selector.<hr/>**Minimum Length**: `1`<br/>**Example Values**: <ul className="examples"><li>`"OData.Demo.Customer"`</li><li>`"OData.Demo.LeaveRequest"`</li><li>`"OData.Demo.OrderStatus"`</li><li>`"AirlineService.Airline"`</li></ul></div>|


### Overlay Selector By Property Type

**Type**: Object(<a href="#overlay-selector-by-property-type_propertytype">propertyType</a>, <a href="#overlay-selector-by-property-type_entitytype">entityType</a>)

| Property | Type | Description |
| -------- | ---- | ----------- |
|<div className="interface-property-name anchor" id="overlay-selector-by-property-type_propertytype">propertyType<br/><span className="mandatory">MANDATORY</span><a className="hash-link" href="#overlay-selector-by-property-type_propertytype" title="#overlay-selector-by-property-type_propertytype"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">Concept-level property, navigation property, or enum member identifier.<br/>Supported metadata formats:<br/>- `edmx` (OData v2/v4 CSDL XML): targets a Property or NavigationProperty on an EntityType<br/>  or ComplexType; or a Member on an EnumType. Use the unqualified name (e.g. `BirthDate`).<br/>- `csdl-json` (OData v4 CSDL JSON): same resolution as `edmx`. Targets non-`$`-prefixed keys<br/>  on the matched EntityType, ComplexType, or EnumType object.<br/>- `sap-csn-interop-effective-v1` (CSN Interop): targets an entry in the `elements` map of<br/>  the matched entity definition. Use the element name as defined (e.g. `AirlineID`, `Name`).<br/><br/>`entityType` MUST always accompany this field to unambiguously identify the owning type.<br/>Property names are unqualified and frequently reused across entity types (e.g. `Name`,<br/>`Description`, `CreatedAt`), so `propertyType` alone is not a reliable unique selector.<br/><br/>To patch an enum member, set `entityType` to the qualified EnumType name and<br/>`propertyType` to the unqualified member name.<hr/>**Minimum Length**: `1`<br/>**Example Values**: <ul className="examples"><li>`"BirthDate"`</li><li>`"CountryName"`</li><li>`"Fax"`</li><li>`"AirlineID"`</li><li>`"Name"`</li><li>`"Active"`</li></ul></div>|
|<div className="interface-property-name anchor" id="overlay-selector-by-property-type_entitytype">entityType<br/><span className="mandatory">MANDATORY</span><a className="hash-link" href="#overlay-selector-by-property-type_entitytype" title="#overlay-selector-by-property-type_entitytype"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">Required entity type, complex type, or enum type context for the selected property or member.<br/>Because property and member names are unqualified and commonly repeated across types<br/>(e.g. `Name`, `Description`, `CreatedAt`), `entityType` is mandatory to ensure<br/>the selector is unambiguous and stable across schema evolution.<br/>- For OData EntityType/ComplexType: the namespace-qualified name (e.g. `OData.Demo.Customer`).<br/>- For OData EnumType: the namespace-qualified EnumType name (e.g. `OData.Demo.OrderStatus`).<br/>- For CSN Interop: the fully qualified `definitions` key of the containing entity<br/>  (e.g. `AirlineService.Airline`).<hr/>**Minimum Length**: `1`<br/>**Example Values**: <ul className="examples"><li>`"OData.Demo.Customer"`</li><li>`"OData.Demo.LeaveRequest"`</li><li>`"OData.Demo.OrderStatus"`</li><li>`"AirlineService.Airline"`</li></ul></div>|


### Overlay Selector By Entity Set

**Type**: Object(<a href="#overlay-selector-by-entity-set_entityset">entitySet</a>)

| Property | Type | Description |
| -------- | ---- | ----------- |
|<div className="interface-property-name anchor" id="overlay-selector-by-entity-set_entityset">entitySet<br/><span className="mandatory">MANDATORY</span><a className="hash-link" href="#overlay-selector-by-entity-set_entityset" title="#overlay-selector-by-entity-set_entityset"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">Concept-level entity set identifier.<br/>Supported metadata formats:<br/>- `edmx` (OData v2/v4 CSDL XML): targets an EntitySet element inside EntityContainer.<br/>  May use the unqualified name (e.g. `Customers`) or namespace-prefixed name.<br/>- `csdl-json` (OData v4 CSDL JSON): targets a key with `$Collection: true` inside the<br/>  EntityContainer object in the namespace.<br/><br/>Use `entitySet` when you need to patch EntityContainer-bound metadata such as<br/>Capabilities annotations (InsertRestrictions, UpdateRestrictions, etc.).<br/>For patching the EntityType structure (Properties, NavigationProperties), use `entityType`.<hr/>**Minimum Length**: `1`<br/>**Example Values**: <ul className="examples"><li>`"Customers"`</li><li>`"SalesOrders"`</li><li>`"EmployeeSet"`</li></ul></div>|


### Overlay Selector By Namespace

**Type**: Object(<a href="#overlay-selector-by-namespace_namespace">namespace</a>)

| Property | Type | Description |
| -------- | ---- | ----------- |
|<div className="interface-property-name anchor" id="overlay-selector-by-namespace_namespace">namespace<br/><span className="mandatory">MANDATORY</span><a className="hash-link" href="#overlay-selector-by-namespace_namespace" title="#overlay-selector-by-namespace_namespace"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">Concept-level OData schema/namespace selector.<br/>Supported metadata formats:<br/>- `edmx` (OData v2/v4 CSDL XML): targets the `<Schema Namespace="...">` element.<br/>  Use the namespace value exactly as declared (e.g. `com.example.OrderService`).<br/>- `csdl-json` (OData v4 CSDL JSON): targets the namespace-level object (the non-`$`-prefixed<br/>  key in the CSDL JSON document that matches the namespace value).<br/><br/>Use this selector for service/schema-level annotations such as `@Core.Description` and<br/>`@Core.LongDescription` on the OData service as a whole.<hr/>**Minimum Length**: `1`<br/>**Example Values**: <ul className="examples"><li>`"com.example.OrderService"`</li><li>`"SFSF.EC.Compensation"`</li><li>`"API_BUSINESS_PARTNER"`</li></ul></div>|


### Overlay Selector By Parameter

**Type**: Object(<a href="#overlay-selector-by-parameter_parameter">parameter</a>, <a href="#overlay-selector-by-parameter_operation">operation</a>)

| Property | Type | Description |
| -------- | ---- | ----------- |
|<div className="interface-property-name anchor" id="overlay-selector-by-parameter_parameter">parameter<br/><span className="mandatory">MANDATORY</span><a className="hash-link" href="#overlay-selector-by-parameter_parameter" title="#overlay-selector-by-parameter_parameter"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">Concept-level parameter name.<br/>Supported metadata formats:<br/>- `edmx` (OData v2/v4 CSDL XML): targets a `<Parameter Name="...">` child element on<br/>  an Action, Function, or FunctionImport. Use the unqualified parameter name.<br/>- `csdl-json` (OData v4 CSDL JSON): targets an entry in the `$Parameter` array of an<br/>  Action/Function overload whose `$Name` matches.<br/>- OpenAPI (`openapi-v2`, `openapi-v3`, `openapi-v3.1+`): targets an entry in the<br/>  `parameters` array of the operation identified by `operation` (operationId), matching<br/>  by the parameter `name` field.<br/><br/>`operation` MUST always accompany this field to unambiguously identify the owning operation.<hr/>**Minimum Length**: `1`<br/>**Example Values**: <ul className="examples"><li>`"employeeId"`</li><li>`"Count"`</li><li>`"filter"`</li></ul></div>|
|<div className="interface-property-name anchor" id="overlay-selector-by-parameter_operation">operation<br/><span className="mandatory">MANDATORY</span><a className="hash-link" href="#overlay-selector-by-parameter_operation" title="#overlay-selector-by-parameter_operation"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">Required operation context for the selected parameter.<br/>- For OData: the namespace-qualified Action, Function, or FunctionImport name.<br/>- For OpenAPI: the `operationId` of the HTTP operation.<hr/>**Minimum Length**: `1`<br/>**Example Values**: <ul className="examples"><li>`"com.example.Svc.TerminateEmployee"`</li><li>`"getConstellationByAbbreviation"`</li></ul></div>|


### Overlay Selector By Return Type

**Type**: Object(<a href="#overlay-selector-by-return-type_returntype">returnType</a>, <a href="#overlay-selector-by-return-type_operation">operation</a>)

| Property | Type | Description |
| -------- | ---- | ----------- |
|<div className="interface-property-name anchor" id="overlay-selector-by-return-type_returntype">returnType<br/><span className="mandatory">MANDATORY</span><a className="hash-link" href="#overlay-selector-by-return-type_returntype" title="#overlay-selector-by-return-type_returntype"></a></div>|<div className="interface-property-type">boolean</div>|<div className="interface-property-description">Flag indicating that the return type of the specified operation is the target.<br/>MUST be `true`. Use `operation` to identify the owning operation.<br/>Supported metadata formats:<br/>- `edmx` (OData v2/v4 CSDL XML): targets the `<ReturnType>` child element of the<br/>  matched Action or Function element.<br/>- `csdl-json` (OData v4 CSDL JSON): targets the `$ReturnType` object inside the matched<br/>  Action/Function overload array entry.<hr/>**Constant Value**: `true`</div>|
|<div className="interface-property-name anchor" id="overlay-selector-by-return-type_operation">operation<br/><span className="mandatory">MANDATORY</span><a className="hash-link" href="#overlay-selector-by-return-type_operation" title="#overlay-selector-by-return-type_operation"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">Namespace-qualified Action or Function name whose ReturnType is targeted.<br/>- For `edmx`: the namespace-qualified name of the Action or Function (e.g. `com.example.Svc.TerminateEmployee`).<br/>- For `csdl-json`: the namespace-qualified name looked up in the Namespace object.<hr/>**Minimum Length**: `1`<br/>**Example Values**: <ul className="examples"><li>`"com.example.Svc.TerminateEmployee"`</li><li>`"com.example.Svc.GetDirectReports"`</li></ul></div>|


### Overlay Patch Value

The value to be used together with patch actions:
- with `action: append`:
  - string value appended to selected text field
- with `action: merge`:
  - objects are deep-merged recursively
  - scalar values overwrite existing values
  - arrays are appended to existing arrays
- with `action: update`, it replaces the selected element entirely
- with `action: remove`:
  - `{}` (empty object): the selected element is removed entirely
  - object with null-valued properties: only those fields are deleted (recursively,
    including nested fields; JSON Merge Patch-style delete semantics)

To fully replace an existing array, use two ordered patches:
1. remove the array
2. merge the new array value

For OData targets (`edmx`, `csdl-json`), the value MUST be expressed in CSDL JSON
annotation format. Annotation keys use the `@TermName` convention:
e.g. `{ "@Core.Description": "...", "@Core.Revisions": [...] }`.
When the target is EDMX XML, the merge implementation converts this to `<Annotation>` elements.
See: https://docs.oasis-open.org/odata/odata-csdl-json/v4.01/odata-csdl-json-v4.01.html

For CSN Interop targets (`sap-csn-interop-effective-v1`), the value is plain CSN JSON
merged directly into the matched entity definition or element object.
Use the CSN `doc` field for human-readable descriptions, and `@AnnotationName` keys
for vocabulary annotations (e.g. `@EndUserText.label`, `@Semantics.text`).
See: https://sap.github.io/csn-interop-specification/

This is a free-form value whose structure depends on the target being patched.

`null` as a standalone patch value is not supported outside `remove` masks.
To delete an element, use `action: remove` with `data: {}`.

**Type:** object,array,string,number,boolean,null


### Overlay System Instance

A [system instance](../../spec-v1/index.md#system-instance) is a concrete, running instance of a system type.
This object is identical to the ORD Document [`describedSystemInstance`](../../spec-v1/interfaces/Document.md#ord-document_describedsysteminstance) object.

Its purpose is to link the overlay to the same system landscape model as ORD resources, if needed.
Usually this is not necessary for static overlays if the patched resource is already selected via ORD ID.

**Type**: Object(<a href="#overlay-system-instance_baseurl">baseUrl</a>, <a href="#overlay-system-instance_localid">localId</a>, <a href="#overlay-system-instance_correlationids">correlationIds</a>)

| Property | Type | Description |
| -------- | ---- | ----------- |
|<div className="interface-property-name anchor" id="overlay-system-instance_baseurl">baseUrl<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#overlay-system-instance_baseurl" title="#overlay-system-instance_baseurl"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">Optional [base URL](../../spec-v1/index.md#base-url) of the system instance.<br/>By providing the base URL, relative URLs in the overlay are resolved relative to it.<hr/>**JSON Schema Format**: `uri-reference`<br/>**Regex Pattern**: <code className="regex">^http[s]?\:\\/\\/[^\:\\/\\s]+\\.[^\:\\/\\s\\.]+(\:\\d+)?(\\/[a-zA-Z0-9-\\._~]+)\*$</code><br/>**Example Values**: <ul className="examples"><li>`"https://example-sap-system.com"`</li><li>`"https://sub.foo.bar.com/api/v1"`</li></ul></div>|
|<div className="interface-property-name anchor" id="overlay-system-instance_localid">localId<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#overlay-system-instance_localid" title="#overlay-system-instance_localid"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">Optional local ID for the system instance (usually tenant ID), as known by the described system.<hr/>**Maximum Length**: `255`<br/>**Example Values**: <ul className="examples"><li>`"LocalTenantId123"`</li></ul></div>|
|<div className="interface-property-name anchor" id="overlay-system-instance_correlationids">correlationIds<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#overlay-system-instance_correlationids" title="#overlay-system-instance_correlationids"></a></div>|<div className="interface-property-type">Array&lt;string&gt;</div>|<div className="interface-property-description">Correlation IDs for linking this system instance to external systems of record.<hr/>**Array Constraint**: MUST have at least 1 items<br/>**Array Item Regex Pattern**: <code className="regex">^([a-z0-9]+(?\:[.][a-z0-9]+)\*)\:([a-zA-Z0-9._\\-\\/]+)\:([a-zA-Z0-9._\\-\\/]+)$</code><br/>**Example Values**: <ul className="examples"><li>`["sap.cld:tenant:741234567"]`</li></ul></div>|


### Overlay System Type

A [system type](../../spec-v1/index.md#system-type) is the abstract type of an application or service, from operational perspective.
This object is identical to the ORD Document [`describedSystemType`](../../spec-v1/interfaces/Document.md#ord-document_describedsystemtype) object.

Its purpose is to link the overlay to the same system landscape model as ORD resources, if needed.
Usually this is not necessary for static overlays if the patched resource is already selected via ORD ID.

**Type**: Object(<a href="#overlay-system-type_systemnamespace">systemNamespace</a>, <a href="#overlay-system-type_correlationids">correlationIds</a>)

| Property | Type | Description |
| -------- | ---- | ----------- |
|<div className="interface-property-name anchor" id="overlay-system-type_systemnamespace">systemNamespace<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#overlay-system-type_systemnamespace" title="#overlay-system-type_systemnamespace"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">The [system namespace](../../spec-v1/index.md#system-namespace) is a unique identifier for the system type.<hr/>**Regex Pattern**: <code className="regex">^[a-z0-9]+(?\:[.][a-z0-9]+)\{1\}$</code><br/>**Maximum Length**: `32`<br/>**Example Values**: <ul className="examples"><li>`"sap.s4"`</li><li>`"sap.c4c"`</li><li>`"sap.cld"`</li></ul></div>|
|<div className="interface-property-name anchor" id="overlay-system-type_correlationids">correlationIds<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#overlay-system-type_correlationids" title="#overlay-system-type_correlationids"></a></div>|<div className="interface-property-type">Array&lt;string&gt;</div>|<div className="interface-property-description">Correlation IDs for linking this system type to external systems of record.<hr/>**Array Constraint**: MUST have at least 1 items<br/>**Array Item Regex Pattern**: <code className="regex">^([a-z0-9]+(?\:[.][a-z0-9]+)\*)\:([a-zA-Z0-9._\\-\\/]+)\:([a-zA-Z0-9._\\-\\/]+)$</code><br/>**Example Values**: <ul className="examples"><li>`["sap.cld:systemRole:S4_PC"]`</li></ul></div>|


### Overlay System Version

A [system version](../../spec-v1/index.md#system-version) describes a version/release of the system.
This object is identical to the ORD Document [`describedSystemVersion`](../../spec-v1/interfaces/Document.md#ord-document_describedsystemversion) object.

Its purpose is to link the overlay to the same system landscape model as ORD resources, if needed.
Usually this is not necessary for static overlays if the patched resource is already selected via ORD ID.

**Type**: Object(<a href="#overlay-system-version_version">version</a>, <a href="#overlay-system-version_title">title</a>, <a href="#overlay-system-version_correlationids">correlationIds</a>)

| Property | Type | Description |
| -------- | ---- | ----------- |
|<div className="interface-property-name anchor" id="overlay-system-version_version">version<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#overlay-system-version_version" title="#overlay-system-version_version"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">The version of the system instance (run-time) or the version of the described system-version perspective.<br/><br/>It MUST follow the [Semantic Versioning 2.0.0](https://semver.org/) standard.<hr/>**Regex Pattern**: <code className="regex">^(0\|[1-9]\\d\*)\\.(0\|[1-9]\\d\*)\\.(0\|[1-9]\\d\*)(?\:-((?\:0\|[1-9]\\d\*\|\\d\*[a-zA-Z-][0-9a-zA-Z-]\*)(?\:\\.(?\:0\|[1-9]\\d\*\|\\d\*[a-zA-Z-][0-9a-zA-Z-]\*))\*))?(?\:\\+([0-9a-zA-Z-]+(?\:\\.[0-9a-zA-Z-]+)\*))?$</code><br/>**Example Values**: <ul className="examples"><li>`"1.2.3"`</li><li>`"2024.8.0"`</li></ul></div>|
|<div className="interface-property-name anchor" id="overlay-system-version_title">title<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#overlay-system-version_title" title="#overlay-system-version_title"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">Human-readable title of the system version.<hr/>**Minimum Length**: `1`<br/>**Maximum Length**: `255`<br/>**Example Values**: <ul className="examples"><li>`"SAP S/4HANA Cloud 2408"`</li></ul></div>|
|<div className="interface-property-name anchor" id="overlay-system-version_correlationids">correlationIds<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#overlay-system-version_correlationids" title="#overlay-system-version_correlationids"></a></div>|<div className="interface-property-type">Array&lt;string&gt;</div>|<div className="interface-property-description">Correlation IDs for linking this system version to external systems of record.<hr/>**Array Constraint**: MUST have at least 1 items<br/>**Array Item Regex Pattern**: <code className="regex">^([a-z0-9]+(?\:[.][a-z0-9]+)\*)\:([a-zA-Z0-9._\\-\\/]+)\:([a-zA-Z0-9._\\-\\/]+)$</code><br/>**Example Values**: <ul className="examples"><li>`["sap.cld:release:2408"]`</li></ul></div>|

## Appendix

### Deep Dive: Overlays vs. Resource Definition Visibility

When additional metadata should only be visible to a narrower audience, two main approaches exist:

- publish a separate overlay that patches the target metadata for that audience
- publish multiple resource definitions of the same resource with different [`API Resource Definition.visibility`](../../spec-v1/interfaces/Document.md#api-resource-definition_visibility) settings

These approaches solve different problems:

- resource-definition visibility controls who can access a concrete published definition file
- overlays add another metadata layer without modifying the original source

#### Prefer overlays when

- the enrichment is owned by a different team than the team publishing the base resource definition
- the enrichment has a different lifecycle, approval workflow, or release cadence
- the enrichment should be optional and separable from the original source
- multiple parallel enrichments may exist for different consumers or use cases
- the original source format should remain untouched, for example because it is generated elsewhere or mirrored from another system

#### Prefer multiple resource definitions with different visibility when

- the same producer team owns both the public and internal metadata
- the enriched information is part of the authoritative source and should not drift from it
- full consumer compatibility is required without assuming overlay support
- the difference is primarily "what full definition should this audience receive?" rather than "what extra layer should be applied afterward?"
- the provider already has a reliable publishing pipeline for separate public/internal definition artifacts

#### Main tradeoff

- overlays improve separation of concerns, but they add a second source of truth and may create ordering, sync, and provenance questions
- duplicated resource definitions reduce consumer complexity and stay self-contained, but they increase publisher-side duplication and consistency obligations
- both approaches can be combined: a narrower-visibility definition may still be enriched further via overlay

Rule of thumb:

- use resource-definition visibility for authoritative producer-owned variants
- use overlays for additive, externally managed, or use-case-specific enrichment layers

### Deep Dive: ORD Configuration vs. Attached Resource Definition

Overlays can be distributed either through the ORD Configuration endpoint or by attaching them as `ord:overlay:v1` resource definitions to a resource.
Those options are not interchangeable in practice, because they imply different ownership and publication models.

The strongest discriminator is ownership:
if the overlay is created by a different ORD Provider than the one describing the target resource,
there is in practice no way to attach that overlay as a resource definition of the foreign resource.
In that case, ORD Configuration is the viable distribution mechanism.

#### Prefer ORD Configuration when

- the overlay is created by someone other than the original resource provider
- the overlay patches ORD resource metadata itself rather than only one attached definition file
- the overlay is cross-cutting and applies to multiple resources
- the overlay should be published independently from the lifecycle of one concrete API or Event resource
- the overlay provider needs its own publication channel and cannot modify the target resource entry

#### Prefer attaching as a resource definition when

- the same ORD Provider owns both the target resource and the overlay
- the overlay belongs to the resource as part of the producer-owned metadata package
- consumers should discover the overlay directly next to the resource definition it patches
- the overlay lifecycle is tightly coupled to one specific API or Event resource
- the producer wants the co-location to be explicit in the resource metadata itself

#### Main tradeoff

- ORD Configuration is more flexible for independent publishers, cross-resource overlays, and separate release cycles
- attached resource definitions are easier to understand when the overlay is just another producer-owned artifact of the same resource
- ORD Configuration makes provenance and authorization more important, because overlays may come from outside the original resource provider
- attached overlays reduce indirection, but only work when the publisher controls the target resource entry

Rule of thumb:

- use attached resource definitions for producer-owned, resource-local overlays
- use ORD Configuration for externally managed, cross-resource, or ORD-level overlays

## Open TODOs

**Aggregator behavior and compatibility:**

- Decide how to indicate use-case-specific overlays when multiple overlays exist for the same target.

**OData selectors:**

- Define the implementation roadmap for `entityType` and `propertyType` selector support in the reference merge library.
- Decide whether OData overlays should be restricted to annotation-only patches (i.e. `data` keys MUST follow the `@TermName` convention). In practice, all meaningful OData enrichments are vocabulary annotations, and allowing arbitrary structural changes could produce invalid CSDL output. Restricting to annotations would also make the patch intent more explicit and aid validation.
- Decide whether the `entityType` selector should target only the EntityType/ComplexType definition, or also the EntitySet in the EntityContainer (or both). Currently only the EntityType definition is targeted. EntitySet-level annotations (e.g. `Capabilities`) sit on the EntitySet, not the EntityType, and are not reachable via the current selector — `jsonPath` is the current fallback for those cases.
Reference: [OData CSDL XML 4.01](https://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/odata-csdl-xml-v4.01.html).