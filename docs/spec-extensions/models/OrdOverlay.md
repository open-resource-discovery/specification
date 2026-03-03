---
title: "ORD Overlay"
sidebar_position: "3"
description: "Describes the technical interface / schema for the ORD Overlay (alpha), used to enrich ORD resources with additional metadata."
---

:::caution Alpha
This specification is in **alpha** and subject to change.
:::

Use ORD Overlays to patch the ORD resources themselves, e.g. to add `partOfGroups` assignments, `labels`, and other ORD-level metadata.

This allows external parties to enrich or annotate ORD resources without modifying the original ORD documents.
This can be necessary when the ownership or lifecycle of the original ORD documents is different from the enhancements in the overlay.

:::warning
Incompatible ORD-level changes are not allowed through ORD Overlays.
Only additive or non-breaking changes (such as adding group assignments or labels) are permitted.
:::

## Schema Definitions

* The root schema of the document is [ORD Overlay](#ord-overlay)
* The interface is available as JSON Schema: [OrdOverlay.schema.json](https://open-resource-discovery.org/spec-extension/models/OrdOverlay.schema.json#).


### ORD Overlay

**Type**: Object(<a href="#ord-overlay_$schema">$schema</a>, <a href="#ord-overlay_ordoverlay">ordOverlay</a>)

| Property | Type | Description |
| -------- | ---- | ----------- |
|<div className="interface-property-name anchor" id="ord-overlay_$schema">$schema<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#ord-overlay_$schema" title="#ord-overlay_$schema"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">Optional [URL](https://tools.ietf.org/html/rfc3986) to the ORD Overlay schema (defined as a JSON Schema).<br/>If provided, this enables code intelligence and validation in supported editors (like VSCode) and tools.<hr/>**JSON Schema Format**: `uri-reference`<br/>**Array Item Allowed Values (extensible)**: <ul><li><em>Any</em> string of format `uri-reference`</li><li>`"https://open-resource-discovery.org/spec-extension/models/OrdOverlay.schema.json#"`</li></ul></div>|
|<div className="interface-property-name anchor" id="ord-overlay_ordoverlay">ordOverlay<br/><span className="mandatory">MANDATORY</span><a className="hash-link" href="#ord-overlay_ordoverlay" title="#ord-overlay_ordoverlay"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">Version of the ORD Overlay specification.<hr/>**Allowed Values**: <ul><li>`"0.1"`</li></ul><br/>**Example Values**: <ul className="examples"><li>`"0.1"`</li></ul></div>|

