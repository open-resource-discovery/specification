---
title: "Resource Definition Overlay"
sidebar_position: "2"
description: "Describes the technical interface / schema for the Resource Definition Overlay (alpha), e.g. API definition overlays."
---

:::caution Alpha
This specification is in **alpha** and subject to change.
:::

Use Resource Definition Overlays to patch or overlay resource definition files, such as API resource definitions like OpenAPI, OData CSDL, etc.

This allows to add or override metadata that is not part of the original resource definition, without modifying the original file.

## Schema Definitions

* The root schema of the document is [Resource Definition Overlay](#resource-definition-overlay)
* The interface is available as JSON Schema: [ResourceDefinitionOverlay.schema.json](https://open-resource-discovery.org/spec-extension/models/ResourceDefinitionOverlay.schema.json#).


### Resource Definition Overlay

**Type**: Object(<a href="#resource-definition-overlay_$schema">$schema</a>, <a href="#resource-definition-overlay_resourcedefinitionoverlay">resourceDefinitionOverlay</a>)

| Property | Type | Description |
| -------- | ---- | ----------- |
|<div className="interface-property-name anchor" id="resource-definition-overlay_$schema">$schema<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#resource-definition-overlay_$schema" title="#resource-definition-overlay_$schema"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">Optional [URL](https://tools.ietf.org/html/rfc3986) to the Resource Definition Overlay schema (defined as a JSON Schema).<br/>If provided, this enables code intelligence and validation in supported editors (like VSCode) and tools.<hr/>**JSON Schema Format**: `uri-reference`<br/>**Array Item Allowed Values (extensible)**: <ul><li><em>Any</em> string of format `uri-reference`</li><li>`"https://open-resource-discovery.org/spec-extension/models/ResourceDefinitionOverlay.schema.json#"`</li></ul></div>|
|<div className="interface-property-name anchor" id="resource-definition-overlay_resourcedefinitionoverlay">resourceDefinitionOverlay<br/><span className="mandatory">MANDATORY</span><a className="hash-link" href="#resource-definition-overlay_resourcedefinitionoverlay" title="#resource-definition-overlay_resourcedefinitionoverlay"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">Version of the Resource Definition Overlay specification.<hr/>**Allowed Values**: <ul><li>`"0.1"`</li></ul><br/>**Example Values**: <ul className="examples"><li>`"0.1"`</li></ul></div>|

