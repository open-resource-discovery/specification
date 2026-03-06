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
  "$schema": "https://open-resource-discovery.org/spec-extension/models/OrdOverlay.schema.json#",
  "ordOverlay": "0.1",
  "target": { "definitionType": "openapi-v3" },
  "patches": [
    {
      "action": "merge",
      "selector": { "operation": "getBusinessPartner" },
      "data": {
        "summary": "Retrieve a Business Partner by ID",
        "description": "Returns the full profile of a business partner including addresses, roles, and tax data.\nUsed in order-to-cash and procurement processes."
      }
    }
  ]
}
```

## Distribution

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
| [`operation`](#overlay-selector-by-operation) | Operation | OpenAPI (`openapi-v2/v3/v3.1+`), MCP (MCP Server Card), A2A Agent Card (`a2a-agent-card`) |
| [`entityType`](#overlay-selector-by-entity-type) | Entity type | OData (`edmx`, `csdl-json`) |
| [`propertyType`](#overlay-selector-by-property-type) | Property | OData (`edmx`, `csdl-json`) |
| [`jsonPath`](#overlay-selector-by-jsonpath) | Any location | Any JSON/YAML metadata file (generic fallback) |

The [`operation`](#overlay-selector-by-operation) selector maps to different identifiers depending on the format:

- **OpenAPI** → `operationId` of an HTTP operation in `paths.{path}.{method}`
- **MCP** (any [Specification ID](../../spec-v1/index.md#specification-id)) → `tools[].name`
- **A2A Agent Card** → `skills[].id`

When `definitionType` is not provided, the implementation auto-detects the format by trying OpenAPI → MCP → A2A in order.
Using the `operation` selector with a named format constant that has no operation support (e.g. `edmx`, `asyncapi-v2`) raises an error.

## Patch Actions

Each [patch](#overlay-patch) specifies an [`action`](#overlay-patch) and a [`selector`](#overlay-selector), plus an optional [`data`](#overlay-patch-value) value.
The full semantics of each action (`update`, `merge`, `append`, `remove`) are defined on the [`action`](#overlay-patch) field.

Key point for `merge`: arrays are appended, not replaced.
To fully replace an array, use two ordered patches — first `remove` the array, then `merge` the new value.

## Validation

Overlays assume the target document is already valid for its native format.
The merge tool does not fully re-validate target formats.
After applying an overlay, validate the merged output with the corresponding format-specific tooling.

## Overlay Document Metadata

Optional top-level fields scope an overlay to a specific system context:

- [`perspective`](#overlay-perspective) — declares whether the overlay applies at system-type, system-version, or system-instance scope.
- [`describedSystemType`](#overlay-system-type), [`describedSystemVersion`](#overlay-system-version), [`describedSystemInstance`](#overlay-system-instance) — narrow the overlay to a particular system type, version, or instance.
- [`visibility`](#overlay-visibility) — controls who can discover this overlay document (`public`, `internal`, `private`).
- `description` — human-readable Markdown description of the overlay document itself.
- `ordId` — optional stable ORD ID for this overlay, using pattern `*:overlay:*:v*`.

For overlays, `perspective` answers a different question than document transport scope: it declares where the patch should be applied.

- `system-type` means the same overlay can patch the targeted resource across versions and instances of the same system type, typically for the same ORD resource major version.
- `system-version` means the overlay patches one concrete released system version only.
- `system-instance` means the overlay patches one concrete tenant / runtime instance only.

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
|<div className="interface-property-name anchor" id="ord-overlay_perspective">perspective<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#ord-overlay_perspective" title="#ord-overlay_perspective"></a></div>|<div className="interface-property-type">[Overlay Perspective](#overlay-perspective)</div>|<div className="interface-property-description">Overlay-specific [perspective](../../spec-v1/index.md#perspectives) that scopes where this overlay should be applied.<br/><br/>Use this together with `describedSystemType`, `describedSystemVersion`, and `describedSystemInstance`<br/>to describe whether the overlay applies broadly to a system type, to one released system version,<br/>or only to a specific system instance.</div>|
|<div className="interface-property-name anchor" id="ord-overlay_describedsystemtype">describedSystemType<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#ord-overlay_describedsystemtype" title="#ord-overlay_describedsystemtype"></a></div>|<div className="interface-property-type">[Overlay System Type](#overlay-system-type)</div>|<div className="interface-property-description">Information on the [system type](../../spec-v1/index.md#system-type) this overlay describes.<br/>This is the primary context object for `perspective: system-type`, and also the parent context<br/>for more specific `system-version` and `system-instance` overlays.</div>|
|<div className="interface-property-name anchor" id="ord-overlay_describedsystemversion">describedSystemVersion<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#ord-overlay_describedsystemversion" title="#ord-overlay_describedsystemversion"></a></div>|<div className="interface-property-type">[Overlay System Version](#overlay-system-version)</div>|<div className="interface-property-description">Information on the [system version](../../spec-v1/index.md#system-version) this overlay describes.<br/>Use this when the overlay should only patch metadata for one specific released system version.</div>|
|<div className="interface-property-name anchor" id="ord-overlay_describedsysteminstance">describedSystemInstance<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#ord-overlay_describedsysteminstance" title="#ord-overlay_describedsysteminstance"></a></div>|<div className="interface-property-type">[Overlay System Instance](#overlay-system-instance)</div>|<div className="interface-property-description">Information on the [system instance](../../spec-v1/index.md#system-instance) this overlay describes.<br/>Use this when the overlay should only patch metadata for one concrete tenant / runtime instance.</div>|
|<div className="interface-property-name anchor" id="ord-overlay_visibility">visibility<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#ord-overlay_visibility" title="#ord-overlay_visibility"></a></div>|<div className="interface-property-type">[Overlay Visibility](#overlay-visibility)</div>|<div className="interface-property-description">Defines metadata access control - which categories of consumers are allowed to discover and access the resource and its metadata.<br/><br/>This controls who can see that the resource exists and retrieve its metadata level information.<br/>It does NOT control runtime access to the resource itself - that is managed separately through authentication and authorization mechanisms.<br/><br/>Use this to prevent exposing internal implementation details to inappropriate consumer audiences.</div>|
|<div className="interface-property-name anchor" id="ord-overlay_target">target<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#ord-overlay_target" title="#ord-overlay_target"></a></div>|<div className="interface-property-type">[Overlay Target](#overlay-target)</div>|<div className="interface-property-description">Optional target context for this overlay.<br/>The target can reference an ORD resource or a referenced resource definition file.<br/><br/>`ordId` selects the ORD resource metadata itself.<br/>If patches are intended for a specific attached metadata definition file, `ordId` alone can be ambiguous<br/>when the resource exposes multiple definitions.<br/>In that case, use `url` and/or `definitionType` to clarify the intended file.<br/><br/>Example: an OData API resource may provide both `edmx` and `openapi-v3` definitions.<br/>Use `definitionType` and/or an explicit `url` to identify which one is patched.<br/><br/>For overlays that only patch ORD-level metadata via patch selectors (`selector.ordId`),<br/>a `target.ordId` is often not needed. In that case, `target` may be omitted entirely,<br/>or provided as an empty object for informational purposes.<br/>Multiple resources can still be patched by defining multiple patches with different selector `ordId` values.<br/><br/>If the ORD document URL is known, it can be provided via `target.url` as additional context.</div>|
|<div className="interface-property-name anchor" id="ord-overlay_patches">patches<br/><span className="mandatory">MANDATORY</span><a className="hash-link" href="#ord-overlay_patches" title="#ord-overlay_patches"></a></div>|<div className="interface-property-type">Array&lt;[Overlay Patch](#overlay-patch)&gt;</div>|<div className="interface-property-description">Ordered sequence of patches to apply to the targeted resource(s).<br/>Patches are applied in the order listed.<hr/>**Array Constraint**: MUST have at least 1 items</div>|


### Overlay Correlation ID

Correlation ID identifying related records in external systems of record.
MUST be a valid [Correlation ID](../../spec-v1/index.md#correlation-id).

**Type:** string<br/>
**Regex Pattern**: <code className="regex">^([a-z0-9]+(?\:[.][a-z0-9]+)\*)\:([a-zA-Z0-9._\\-\\/]+)\:([a-zA-Z0-9._\\-\\/]+)$</code><br/>
**Maximum Length**: `255`


### Overlay Definition Type

Type of the targeted metadata definition file.
This can be used to disambiguate how selectors are interpreted for the target.

MUST be either:
- any valid [Specification ID](../../spec-v1/index.md#specification-id), or
- one of the pre-defined values reused from:
  - API Resource Definition `type`
  - Event Resource Definition `type`
  - Capability Definition `type`

The literal value `custom` is deprecated for `definitionType` and MUST NOT be used.
In such cases, use a concrete [Specification ID](../../spec-v1/index.md#specification-id) instead.

**Type:** string<br/>
**Allowed Values (extensible)**: <ul><li><em>Any</em> string: Any valid [Specification ID](../../spec-v1/index.md#specification-id).</li><li>`"openapi-v2"`</li><li>`"openapi-v3"`</li><li>`"openapi-v3.1+"`</li><li>`"raml-v1"`</li><li>`"edmx"`</li><li>`"csdl-json"`</li><li>`"graphql-sdl"`</li><li>`"wsdl-v1"`</li><li>`"wsdl-v2"`</li><li>`"a2a-agent-card"`</li><li>`"sap-rfc-metadata-v1"`</li><li>`"sap-sql-api-definition-v1"`</li><li>`"sap-csn-interop-effective-v1"`</li><li>`"asyncapi-v2"`</li><li>`"sap.mdo:mdi-capability-definition:v1"`</li><li>`"ord:overlay:v1"`</li></ul>

###### Example Values:


```js
"openapi-v3"
```


```js
"asyncapi-v2"
```


```js
"sap.mdo:mdi-capability-definition:v1"
```



### Overlay Visibility

Defines metadata access control - which categories of consumers are allowed to discover and access the resource and its metadata.

This controls who can see that the resource exists and retrieve its metadata level information.
It does NOT control runtime access to the resource itself - that is managed separately through authentication and authorization mechanisms.

Use this to prevent exposing internal implementation details to inappropriate consumer audiences.

**Type:** string<br/>
**Allowed Values**: <ul><li><p>`"public"`: The overlay can be discovered and accessed by anyone, including customers, partners, and unauthenticated external parties.</p></li><li><p>`"internal"`: The overlay can only be discovered and accessed by vendor internal consumers (e.g. applications or services of the same vendor).<br/>MUST NOT be made available to external parties or vendor customers.</p></li><li><p>`"private"`: The overlay should not be discoverable outside the application / service's own deployment scope (e.g., outside of the provider application or the same system namespace / system type).</p></li></ul>


### Overlay Perspective

Declares from which system landscape perspective this overlay is meant to be applied.

Unlike an ORD Document perspective, an overlay perspective scopes where the patch content should be consumed:
- `system-type`: patch the targeted resource metadata across the system type in general.
- `system-version`: patch the targeted resource metadata only for one released system version.
- `system-instance`: patch the targeted resource metadata only for one concrete system instance / tenant.

Use this together with `describedSystemType`, `describedSystemVersion`, and `describedSystemInstance`
to make the intended overlay scope explicit.

**Type:** string<br/>
**Allowed Values**: <ul><li><p>`"system-type"`: Applies the overlay at system-type level.<br/><br/>Use this when the overlay should patch the same targeted resource across versions and instances<br/>of the same system type, typically for the same ORD resource major version.<br/>`describedSystemType` SHOULD be provided as the identifying context.</p></li><li><p>`"system-version"`: Applies the overlay to one concrete system version.<br/><br/>Use this when metadata differs between released versions and the patch should only affect<br/>a specific version of the target resource.<br/>`describedSystemVersion` SHOULD be provided, and `describedSystemType` SHOULD also be provided as parent context.</p></li><li><p>`"system-instance"`: Applies the overlay to one concrete system instance / tenant.<br/><br/>Use this when the patch reflects tenant-specific configuration, extensions, or runtime differences<br/>in the target metadata.<br/>`describedSystemInstance` SHOULD be provided.</p></li></ul>

###### Example Values:


```js
"system-type"
```


```js
"system-version"
```


```js
"system-instance"
```



### Overlay System Instance

A [system instance](../../spec-v1/index.md#system-instance) is a concrete, running instance of a system type.

**Type**: Object(<a href="#overlay-system-instance_baseurl">baseUrl</a>, <a href="#overlay-system-instance_localid">localId</a>, <a href="#overlay-system-instance_correlationids">correlationIds</a>)

| Property | Type | Description |
| -------- | ---- | ----------- |
|<div className="interface-property-name anchor" id="overlay-system-instance_baseurl">baseUrl<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#overlay-system-instance_baseurl" title="#overlay-system-instance_baseurl"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">Optional [base URL](../../spec-v1/index.md#base-url) of the system instance.<br/>By providing the base URL, relative URLs in the overlay are resolved relative to it.<hr/>**JSON Schema Format**: `uri-reference`<br/>**Regex Pattern**: <code className="regex">^http[s]?\:\\/\\/[^\:\\/\\s]+\\.[^\:\\/\\s\\.]+(\:\\d+)?(\\/[a-zA-Z0-9-\\._~]+)\*$</code><br/>**Example Values**: <ul className="examples"><li>`"https://example-sap-system.com"`</li><li>`"https://sub.foo.bar.com/api/v1"`</li></ul></div>|
|<div className="interface-property-name anchor" id="overlay-system-instance_localid">localId<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#overlay-system-instance_localid" title="#overlay-system-instance_localid"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">Optional local ID for the system instance, as known by the described system.<hr/>**Maximum Length**: `255`<br/>**Example Values**: <ul className="examples"><li>`"LocalTenantId123"`</li></ul></div>|
|<div className="interface-property-name anchor" id="overlay-system-instance_correlationids">correlationIds<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#overlay-system-instance_correlationids" title="#overlay-system-instance_correlationids"></a></div>|<div className="interface-property-type">Array&lt;[Overlay Correlation ID](#overlay-correlation-id)&gt;</div>|<div className="interface-property-description">Correlation IDs for linking this system instance to external systems of record.<hr/>**Array Constraint**: MUST have at least 1 items<br/>**Example Values**: <ul className="examples"><li>`["sap.cld:tenant:741234567"]`</li></ul></div>|


### Overlay System Type

A [system type](../../spec-v1/index.md#system-type) is the abstract type of an application or service, from operational perspective.

**Type**: Object(<a href="#overlay-system-type_systemnamespace">systemNamespace</a>, <a href="#overlay-system-type_correlationids">correlationIds</a>)

| Property | Type | Description |
| -------- | ---- | ----------- |
|<div className="interface-property-name anchor" id="overlay-system-type_systemnamespace">systemNamespace<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#overlay-system-type_systemnamespace" title="#overlay-system-type_systemnamespace"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">The [system namespace](../../spec-v1/index.md#system-namespace) is a unique identifier for the system type.<hr/>**Regex Pattern**: <code className="regex">^[a-z0-9]+(?\:[.][a-z0-9]+)\{1\}$</code><br/>**Maximum Length**: `32`<br/>**Example Values**: <ul className="examples"><li>`"sap.s4"`</li><li>`"sap.c4c"`</li><li>`"sap.cld"`</li></ul></div>|
|<div className="interface-property-name anchor" id="overlay-system-type_correlationids">correlationIds<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#overlay-system-type_correlationids" title="#overlay-system-type_correlationids"></a></div>|<div className="interface-property-type">Array&lt;[Overlay Correlation ID](#overlay-correlation-id)&gt;</div>|<div className="interface-property-description">Correlation IDs for linking this system type to external systems of record.<hr/>**Array Constraint**: MUST have at least 1 items<br/>**Example Values**: <ul className="examples"><li>`["sap.cld:systemRole:S4_PC"]`</li></ul></div>|


### Overlay System Version

A [system version](../../spec-v1/index.md#system-version) describes a version/release of the system.

**Type**: Object(<a href="#overlay-system-version_version">version</a>, <a href="#overlay-system-version_title">title</a>, <a href="#overlay-system-version_correlationids">correlationIds</a>)

| Property | Type | Description |
| -------- | ---- | ----------- |
|<div className="interface-property-name anchor" id="overlay-system-version_version">version<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#overlay-system-version_version" title="#overlay-system-version_version"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">The version of the system instance (run-time) or the version of the described system-version perspective.<br/><br/>It MUST follow the [Semantic Versioning 2.0.0](https://semver.org/) standard.<hr/>**Regex Pattern**: <code className="regex">^(0\|[1-9]\\d\*)\\.(0\|[1-9]\\d\*)\\.(0\|[1-9]\\d\*)(?\:-((?\:0\|[1-9]\\d\*\|\\d\*[a-zA-Z-][0-9a-zA-Z-]\*)(?\:\\.(?\:0\|[1-9]\\d\*\|\\d\*[a-zA-Z-][0-9a-zA-Z-]\*))\*))?(?\:\\+([0-9a-zA-Z-]+(?\:\\.[0-9a-zA-Z-]+)\*))?$</code><br/>**Example Values**: <ul className="examples"><li>`"1.2.3"`</li><li>`"2024.8.0"`</li></ul></div>|
|<div className="interface-property-name anchor" id="overlay-system-version_title">title<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#overlay-system-version_title" title="#overlay-system-version_title"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">Human-readable title of the system version.<hr/>**Minimum Length**: `1`<br/>**Maximum Length**: `255`<br/>**Example Values**: <ul className="examples"><li>`"SAP S/4HANA Cloud 2408"`</li></ul></div>|
|<div className="interface-property-name anchor" id="overlay-system-version_correlationids">correlationIds<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#overlay-system-version_correlationids" title="#overlay-system-version_correlationids"></a></div>|<div className="interface-property-type">Array&lt;[Overlay Correlation ID](#overlay-correlation-id)&gt;</div>|<div className="interface-property-description">Correlation IDs for linking this system version to external systems of record.<hr/>**Array Constraint**: MUST have at least 1 items<br/>**Example Values**: <ul className="examples"><li>`["sap.cld:release:2408"]`</li></ul></div>|


### Overlay Target

Optional context about the target being patched.
The target can refer to an ORD resource or to a referenced resource definition file.

`ordId` targets the ORD resource metadata itself.
For patching a specific resource definition file of that resource, use `url` and/or `definitionType`
to disambiguate.

Example: one OData API resource can have both `edmx` and `openapi-v3` definitions attached.
In such cases, provide `definitionType` and/or `url` to make the concrete patch target explicit.

For ORD-level-only overlays, this object can be omitted (or left empty) and
selectors can directly identify resources via `selector.ordId`.
Multiple identifiers, if provided, are treated as all pointing to the same resource.

**Type**: Object(<a href="#overlay-target_ordid">ordId</a>, <a href="#overlay-target_url">url</a>, <a href="#overlay-target_correlationids">correlationIds</a>, <a href="#overlay-target_definitiontype">definitionType</a>)

| Property | Type | Description |
| -------- | ---- | ----------- |
|<div className="interface-property-name anchor" id="overlay-target_ordid">ordId<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#overlay-target_ordid" title="#overlay-target_ordid"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">ORD ID of the target being patched (e.g. an API Resource, Event Resource, Data Product).<br/>MUST be a valid [ORD ID](../../spec-v1/index.md#ord-id).<hr/>**Regex Pattern**: <code className="regex">^([a-z0-9]+(?\:[.][a-z0-9]+)\*)\:([a-zA-Z0-9._\\-]+)\:([a-zA-Z0-9._\\-]+)\:(v0\|v[1-9][0-9]\*)$</code><br/>**Maximum Length**: `255`<br/>**Example Values**: <ul className="examples"><li>`"sap.s4:apiResource:OP_API_BUSINESS_PARTNER_SRV:v1"`</li></ul></div>|
|<div className="interface-property-name anchor" id="overlay-target_url">url<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#overlay-target_url" title="#overlay-target_url"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">URL or URI pointing directly to the file being patched.<br/>This is typically a resource definition file (e.g. OpenAPI, AsyncAPI, OData CSDL),<br/>but can also point to any JSON/YAML-based target document.<hr/>**JSON Schema Format**: `uri-reference`<br/>**Example Values**: <ul className="examples"><li>`"https://example.com/api/openapi.json"`</li><li>`"./openapi.yaml"`</li></ul></div>|
|<div className="interface-property-name anchor" id="overlay-target_correlationids">correlationIds<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#overlay-target_correlationids" title="#overlay-target_correlationids"></a></div>|<div className="interface-property-type">Array&lt;string&gt;</div>|<div className="interface-property-description">Correlation IDs referencing the target resource in external registries or systems of record.<br/>Reuses the ORD correlation ID format: `namespace:type:localId`.<br/>All listed IDs are treated as pointing to the same resource.<hr/>**Array Constraint**: MUST have at least 1 items<br/>**Array Item Regex Pattern**: <code className="regex">^([a-z0-9]+(?\:[.][a-z0-9]+)\*)\:([a-zA-Z0-9._\\-\\/]+)\:([a-zA-Z0-9._\\-\\/]+)$</code><br/>**Example Values**: <ul className="examples"><li>`["sap.s4:communicationScenario:SAP_COM_0008"]`</li></ul></div>|
|<div className="interface-property-name anchor" id="overlay-target_definitiontype">definitionType<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#overlay-target_definitiontype" title="#overlay-target_definitiontype"></a></div>|<div className="interface-property-type">[Overlay Definition Type](#overlay-definition-type)</div>|<div className="interface-property-description">Optional type of the target definition being patched.<br/>If provided, this SHOULD match the `type` of the referenced metadata definition<br/>(as used in API/Event/Capability resource definitions).<br/>This is especially useful when `ordId` resolves to a resource with multiple attached definitions.</div>|


### Overlay Patch

A single patch action to apply to the element identified by the selector.

**Type**: Object(<a href="#overlay-patch_action">action</a>, <a href="#overlay-patch_selector">selector</a>, <a href="#overlay-patch_data">data</a>)

| Property | Type | Description |
| -------- | ---- | ----------- |
|<div className="interface-property-name anchor" id="overlay-patch_action">action<br/><span className="mandatory">MANDATORY</span><a className="hash-link" href="#overlay-patch_action" title="#overlay-patch_action"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">The patch operation to perform on the selected element:<br/><br/>- `update`: Replace the selected element entirely with `data`.<br/>- `append`:<br/>  - append string `data` to the selected string value.<br/>  - only valid when the selected element is a text/string field.<br/>  - useful to extend existing descriptions without replacing them.<br/>- `merge`:<br/>  - objects are deep-merged recursively.<br/>  - scalar values are overwritten by the value from `data`.<br/>  - arrays are appended (new array items are added after existing items).<br/>  - existing object properties not mentioned in `data` are preserved.<br/><br/>  To fully replace an array, use two ordered patches:<br/>  1. `remove` the array at the selected location.<br/>  2. `merge` the new array content.<br/>- `remove`:<br/>  - without `data`: remove the selected element from the document entirely.<br/>  - with `data`: remove fields that are set to `null`.<br/>    This applies recursively, so nested `null` values remove nested fields as well<br/>    (JSON Merge Patch-style delete semantics).<br/><br/>Example for nested removal:<br/>`data: { "foo": { "bar": null } }` removes `foo.bar` inside the selected element.<hr/>**Allowed Values**: <ul><li>`"update"`</li><li>`"append"`</li><li>`"merge"`</li><li>`"remove"`</li></ul></div>|
|<div className="interface-property-name anchor" id="overlay-patch_selector">selector<br/><span className="mandatory">MANDATORY</span><a className="hash-link" href="#overlay-patch_selector" title="#overlay-patch_selector"></a></div>|<div className="interface-property-type">[Overlay Selector](#overlay-selector)</div>|<div className="interface-property-description">Identifies the element in the target to patch.<br/>Exactly one selector type is used per patch. The selector object uses one explicit key:<br/><br/>- `ordId`: resource level - targets an ORD resource (API, Event, Data Product, ...)<br/>- `operation`: operation level - targets an operation by its concept-level ID<br/>- `entityType`: entity type level - targets an entity/type by its concept-level ID<br/>- `propertyType`: property type level - targets a property/element within an entity type<br/>- `jsonPath`: generic fallback - targets any location in a JSON/YAML-based target document by path<br/><br/>Prefer concept-level selectors (operation, entityType, propertyType) over jsonPath<br/>where possible, as they are resilient to structural changes in the target format.</div>|
|<div className="interface-property-name anchor" id="overlay-patch_data">data<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#overlay-patch_data" title="#overlay-patch_data"></a></div>|<div className="interface-property-type">[Overlay Patch Value](#overlay-patch-value)</div>|<div className="interface-property-description">The value to be used together with patch actions:<br/>- with `action: append`:<br/>  - string value appended to selected text field<br/>- with `action: merge`:<br/>  - objects are deep-merged recursively<br/>  - scalar values overwrite existing values<br/>  - arrays are appended to existing arrays<br/>- with `action: update`, it replaces the selected element entirely<br/>- with `action: remove`:<br/>  - if omitted, the selected element is removed entirely<br/>  - if provided, fields set to `null` are deleted (recursively, including nested fields;<br/>    JSON Merge Patch-style delete semantics)<br/><br/>To fully replace an existing array, use two ordered patches:<br/>1. remove the array<br/>2. merge the new array value<br/><br/>This is a free-form value whose structure depends on the target being patched.</div>|


### Overlay Selector

Identifies the element in the target to patch.
Exactly one selector type is used per patch. The selector object uses one explicit key:

- `ordId`: resource level - targets an ORD resource (API, Event, Data Product, ...)
- `operation`: operation level - targets an operation by its concept-level ID
- `entityType`: entity type level - targets an entity/type by its concept-level ID
- `propertyType`: property type level - targets a property/element within an entity type
- `jsonPath`: generic fallback - targets any location in a JSON/YAML-based target document by path

Prefer concept-level selectors (operation, entityType, propertyType) over jsonPath
where possible, as they are resilient to structural changes in the target format.

One of the following: 
[Overlay Selector By JsonPath](#overlay-selector-by-jsonpath) \| [Overlay Selector By ORD ID](#overlay-selector-by-ord-id) \| [Overlay Selector By Operation](#overlay-selector-by-operation) \| [Overlay Selector By Entity Type](#overlay-selector-by-entity-type) \| [Overlay Selector By Property Type](#overlay-selector-by-property-type)<br/>

### Overlay Selector By JsonPath

**Type**: Object(<a href="#overlay-selector-by-jsonpath_jsonpath">jsonPath</a>)

| Property | Type | Description |
| -------- | ---- | ----------- |
|<div className="interface-property-name anchor" id="overlay-selector-by-jsonpath_jsonpath">jsonPath<br/><span className="mandatory">MANDATORY</span><a className="hash-link" href="#overlay-selector-by-jsonpath_jsonpath" title="#overlay-selector-by-jsonpath_jsonpath"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">JSONPath expression targeting any location in a JSON/YAML-based target document.<br/>MUST start with `$`.<br/>This is the generic fallback selector and is supported for all JSON/YAML-based metadata formats,<br/>including OpenAPI and MCP metadata files.<hr/>**Regex Pattern**: <code className="regex">^\\$</code><br/>**Minimum Length**: `1`<br/>**Example Values**: <ul className="examples"><li>`"$.paths./business-partners.get"`</li></ul></div>|


### Overlay Selector By ORD ID

**Type**: Object(<a href="#overlay-selector-by-ord-id_ordid">ordId</a>)

| Property | Type | Description |
| -------- | ---- | ----------- |
|<div className="interface-property-name anchor" id="overlay-selector-by-ord-id_ordid">ordId<br/><span className="mandatory">MANDATORY</span><a className="hash-link" href="#overlay-selector-by-ord-id_ordid" title="#overlay-selector-by-ord-id_ordid"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">ORD ID targeting an ORD resource (API, Event, Data Product, ...).<br/>MUST be a valid [ORD ID](../../spec-v1/index.md#ord-id).<br/>Use this selector when patching ORD resource metadata itself.<br/>The ORD resource type is derived from the ORD ID itself.<hr/>**Regex Pattern**: <code className="regex">^([a-z0-9]+(?\:[.][a-z0-9]+)\*)\:([a-zA-Z0-9._\\-]+)\:([a-zA-Z0-9._\\-]+)\:(v0\|v[1-9][0-9]\*)$</code><br/>**Example Values**: <ul className="examples"><li>`"sap.s4:apiResource:OP_API_BUSINESS_PARTNER_SRV:v1"`</li></ul></div>|


### Overlay Selector By Operation

**Type**: Object(<a href="#overlay-selector-by-operation_operation">operation</a>)

| Property | Type | Description |
| -------- | ---- | ----------- |
|<div className="interface-property-name anchor" id="overlay-selector-by-operation_operation">operation<br/><span className="mandatory">MANDATORY</span><a className="hash-link" href="#overlay-selector-by-operation_operation" title="#overlay-selector-by-operation_operation"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">Concept-level operation identifier.<br/>Supported mappings by format:<br/>- OpenAPI (`openapi-v2`, `openapi-v3`, `openapi-v3.1+`): maps to the `operationId` field on<br/>  an HTTP operation inside `paths.{path}.{method}`.<br/>- MCP (any Specification ID other than `a2a-agent-card`): maps to `tools[].name`.<br/>  See: https://modelcontextprotocol.io/specification/2025-11-25/schema#tool-name<br/>- A2A Agent Card (`a2a-agent-card`): maps to `skills[].id`.<br/>  See: https://google.github.io/A2A/specification/#agentskill-object<br/><br/>When `definitionType` is not provided, the implementation tries OpenAPI paths first,<br/>then MCP tools, then A2A skills, returning the first match found.<br/><br/>Not currently supported for OData selectors.<hr/>**Minimum Length**: `1`<br/>**Example Values**: <ul className="examples"><li>`"getBusinessPartner"`</li><li>`"dispute-case-resolution"`</li></ul></div>|


### Overlay Selector By Entity Type

**Type**: Object(<a href="#overlay-selector-by-entity-type_entitytype">entityType</a>)

| Property | Type | Description |
| -------- | ---- | ----------- |
|<div className="interface-property-name anchor" id="overlay-selector-by-entity-type_entitytype">entityType<br/><span className="mandatory">MANDATORY</span><a className="hash-link" href="#overlay-selector-by-entity-type_entitytype" title="#overlay-selector-by-entity-type_entitytype"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">Concept-level entity type identifier.<br/>Currently supported for OData metadata:<br/>- `edmx` (OData v2/v4 CSDL XML)<br/>- `csdl-json` (OData v4 CSDL JSON)<hr/>**Minimum Length**: `1`<br/>**Example Values**: <ul className="examples"><li>`"BusinessPartner"`</li><li>`"A_BusinessPartnerType"`</li></ul></div>|


### Overlay Selector By Property Type

**Type**: Object(<a href="#overlay-selector-by-property-type_propertytype">propertyType</a>, <a href="#overlay-selector-by-property-type_entitytype">entityType</a>)

| Property | Type | Description |
| -------- | ---- | ----------- |
|<div className="interface-property-name anchor" id="overlay-selector-by-property-type_propertytype">propertyType<br/><span className="mandatory">MANDATORY</span><a className="hash-link" href="#overlay-selector-by-property-type_propertytype" title="#overlay-selector-by-property-type_propertytype"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">Concept-level property/element identifier.<br/>Currently supported for OData metadata:<br/>- `edmx` (OData v2/v4 CSDL XML)<br/>- `csdl-json` (OData v4 CSDL JSON)<br/><br/>If the property type is globally unique in the targeted metadata, this field alone is sufficient.<br/>If it is ambiguous, `entityType` SHOULD be provided in addition to disambiguate the lookup.<hr/>**Minimum Length**: `1`<br/>**Example Values**: <ul className="examples"><li>`"BusinessPartnerFullName"`</li><li>`"LegacySearchTerm1"`</li></ul></div>|
|<div className="interface-property-name anchor" id="overlay-selector-by-property-type_entitytype">entityType<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#overlay-selector-by-property-type_entitytype" title="#overlay-selector-by-property-type_entitytype"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">Optional entity type context of the selected property.<br/>Provide this when `propertyType` alone is ambiguous.<br/>For OData metadata, this identifies the containing EntityType.<hr/>**Minimum Length**: `1`<br/>**Example Values**: <ul className="examples"><li>`"BusinessPartner"`</li><li>`"A_BusinessPartnerType"`</li></ul></div>|


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
  - if omitted, the selected element is removed entirely
  - if provided, fields set to `null` are deleted (recursively, including nested fields;
    JSON Merge Patch-style delete semantics)

To fully replace an existing array, use two ordered patches:
1. remove the array
2. merge the new array value

This is a free-form value whose structure depends on the target being patched.

**Type:** object,array,string,number,boolean,null

## Open TODOs

**Overlay `ordId`:**

- Decide whether the overlay document itself needs a stable `ordId`.
- If overlays are published only via the configuration endpoint, define what that stable ID should represent.
- Decide whether `ordId` stays optional or becomes mandatory.

**Target resolution and matching:**

- Decide what should be optional vs mandatory on `target`.
- Decide whether transparency-oriented fields such as `url` and `correlationIds` stay in the model.
- Align the spec-level target identifiers with reference merge behavior, especially when `requireTargetMatch` is enabled.

**Extension model naming:**

- Decide how model extensions should avoid interface-name collisions with ORD core models.
- Confirm whether extension-local definitions should always use an explicit prefix such as `Overlay...`.

**Patch value model:**

- Decide whether `PatchValue` should remain an explicit JSON-type union or become a truly unconstrained value (`unknown` / `any`) once the toolkit supports that shape cleanly.
- Decide whether `null` should be supported as an explicit standalone patch value outside `remove` masks.

**OData selectors:**

- Validate the `operation` selector mapping with OData experts.
- Best current guess: map selector `operation` to schema-level `Action`/`Function` names, preferring fully-qualified names, or to container-level `ActionImport`/`FunctionImport` names when exposed via the entity container.
- Define the implementation roadmap for `entityType` and `propertyType` selector support in the reference merge library.

Reference: [OData CSDL XML 4.01](https://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/odata-csdl-xml-v4.01.html).