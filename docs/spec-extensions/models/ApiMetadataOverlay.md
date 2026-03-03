---
title: "API Metadata Overlay"
sidebar_position: "2"
description: "Describes the technical interface / schema for API Metadata Overlay."
---



## Schema Definitions

* The root schema of the document is [API Metadata Overlay](#api-metadata-overlay)
* The interface is available as JSON Schema: [ApiMetadataOverlay.schema.json](https://open-resource-discovery.org/spec-extension/models/ApiMetadataOverlay.schema.json#).


### API Metadata Overlay

**Type**: Object(<a href="#api-metadata-overlay_$schema">$schema</a>, <a href="#api-metadata-overlay_apimetadataoverlay">apiMetadataOverlay</a>)

| Property | Type | Description |
| -------- | ---- | ----------- |
|<div className="interface-property-name anchor" id="api-metadata-overlay_$schema">$schema<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#api-metadata-overlay_$schema" title="#api-metadata-overlay_$schema"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">Optional [URL](https://tools.ietf.org/html/rfc3986) to the API Metadata Overlay schema (defined as a JSON Schema).<br/>If provided, this enables code intelligence and validation in supported editors (like VSCode) and tools.<hr/>**JSON Schema Format**: `uri-reference`<br/>**Array Item Allowed Values (extensible)**: <ul><li><em>Any</em> string of format `uri-reference`</li><li>`"https://open-resource-discovery.org/spec-extension/models/ApiMetadataOverlay.schema.json#"`</li></ul></div>|
|<div className="interface-property-name anchor" id="api-metadata-overlay_apimetadataoverlay">apiMetadataOverlay<br/><span className="mandatory">MANDATORY</span><a className="hash-link" href="#api-metadata-overlay_apimetadataoverlay" title="#api-metadata-overlay_apimetadataoverlay"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">Version of the API Metadata Overlay specification.<hr/>**Allowed Values**: <ul><li>`"1.0"`</li></ul><br/>**Example Values**: <ul className="examples"><li>`"1.0"`</li></ul></div>|

