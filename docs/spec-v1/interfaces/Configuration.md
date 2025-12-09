---
title: "ORD Configuration"
sidebar_position: "0"
description: "Describes the technical interface / schema for ORD Configuration."
---



## Schema Definitions

* The root schema of the document is [Ord Configuration](#ord-configuration)
* The interface is available as JSON Schema: [Configuration.schema.json](https://openresourcediscovery.org/spec-v1/interfaces/Configuration.schema.json#).


### Ord Configuration

**Type**: Object(<a href="#ord-configuration_$schema">$schema</a>, <a href="#ord-configuration_baseurl">baseUrl</a>, <a href="#ord-configuration_openresourcediscoveryv1">openResourceDiscoveryV1</a>)

| Property | Type | Description |
| -------- | ---- | ----------- |
|<div className="interface-property-name anchor" id="ord-configuration_$schema">$schema<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#ord-configuration_$schema" title="#ord-configuration.$schema"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">Optional URL to the ORD Configuration schema (defined as JSON Schema).<br/>If given, this enables code intelligence and validation in supported editors (like VSCode) and tools.<hr/>**JSON Schema Format**: `uri-reference`<br/>**Recommended Values**: <ul><li>`"https://openresourcediscovery.org/spec-v1/interfaces/Configuration.schema.json#"`</li></ul></div>|
|<div className="interface-property-name anchor" id="ord-configuration_baseurl">baseUrl<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#ord-configuration_baseurl" title="#ord-configuration.baseUrl"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">Optional [base URL](../index.md#def-base-url) that can be used to resolve the relative URLs to the ORD Documents.<br/><br/>The `baseUrl` MUST not contain a leading slash.<br/><br/>If you do not provide this property, the base URL is assumed to be the URL of the config endpoint without `/.well-known/open-resource-discovery` suffix.<br/>This implies that either a `baseUrl` or only absolute URLs MUST be provided when no standardized well-known URI is used.<br/>If both a `baseUrl` and a well-known URI is provided, the explicit `baseUrl` takes precedence.<hr/>**JSON Schema Format**: `uri`<br/>**Regex Pattern**: <code className="regex">^http[s]?\:\\/\\/[^\:\\/\\s]+\\.[^\:\\/\\s\\.]+(\:\\d+)?(\\/[a-zA-Z0-9-\\._~]+)\*$</code><br/>**Example Values**: <ul className="examples"><li>`"https://example-sap-system.com"`</li><li>`"https://sub.foo.bar.com"`</li><li>`"https://sub.foo.bar.com/api/v1"`</li></ul></div>|
|<div className="interface-property-name anchor" id="ord-configuration_openresourcediscoveryv1">openResourceDiscoveryV1<br/><span className="mandatory">MANDATORY</span><a className="hash-link" href="#ord-configuration_openresourcediscoveryv1" title="#ord-configuration.openResourceDiscoveryV1"></a></div>|<div className="interface-property-type">[Ord V1 Support](#ord-v1-support)</div>|<div className="interface-property-description">The existence of this version indicates that Open Resource Discovery is supported in Version 1.x</div>|


### Ord V1 Support

The existence of this version indicates that Open Resource Discovery is supported in Version 1.x

**Type**: Object(<a href="#ord-v1-support_documents">documents</a>, <a href="#ord-v1-support_capabilities">capabilities</a>)

| Property | Type | Description |
| -------- | ---- | ----------- |
|<div className="interface-property-name anchor" id="ord-v1-support_documents">documents<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#ord-v1-support_documents" title="OpenResourceDiscoveryV1.documents"></a></div>|<div className="interface-property-type">Array&lt;[Ord V1 Document Description](#ord-v1-document-description)&gt;</div>|<div className="interface-property-description">List of all ORD documents that can be retrieved.<br/><br/>While it is possible to describe everything in one big ORD document, for bigger services/use cases it might be preferable to split the information into multiple documents.<br/><br/>For more details how to implement this correctly, please refer to the [ORD configuration endpoint](../index.md#ord-configuration-endpoint) section and the [considerations on the granularity of ORD documents](../index.md#considerations-on-the-granularity-of-ord-documents).</div>|
|<div className="interface-property-name anchor" id="ord-v1-support_capabilities">capabilities<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#ord-v1-support_capabilities" title="OpenResourceDiscoveryV1.capabilities"></a></div>|<div className="interface-property-type">[Ord V1 Capabilities](#ord-v1-capabilities)</div>|<div className="interface-property-description">List of capabilities that are supported by the ORD provider.</div>|


### Ord V1 Document Description

Describes an [ORD Document](../index.md#ord-document) that is available for pull transport consumption.

**Type**: Object(<a href="#ord-v1-document-description_url">url</a>, <a href="#ord-v1-document-description_perspective">perspective</a>, <a href="#ord-v1-document-description_systeminstanceaware">systemInstanceAware</a>, <a href="#ord-v1-document-description_accessstrategies">accessStrategies</a>)

| Property | Type | Description |
| -------- | ---- | ----------- |
|<div className="interface-property-name anchor" id="ord-v1-document-description_url">url<br/><span className="mandatory">MANDATORY</span><a className="hash-link" href="#ord-v1-document-description_url" title="V1DocumentDescription.url"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">URL or relative URL to the ORD document (provided by an ORD document endpoint).<br/><br/>It is RECOMMENDED to provide a relative URL (to `baseUrl`).<br/>If a `baseUrl` is given, the relative URLs will be resolved with it.<br/><br/>If the URL is not relative to the system providing this information or no well-known URI is used,<br/>either the baseUrl or a full URL to the document MUST be provided.<hr/>**JSON Schema Format**: `uri-reference`<br/>**Example Values**: <ul className="examples"><li>`"/open-resource-discovery/v1/documents/example1"`</li><li>`"../../documents/example1"`</li><li>`"https://example.com/open-resource-discovery/v1/documents/example1"`</li></ul></div>|
|<div className="interface-property-name anchor" id="ord-v1-document-description_perspective">perspective<br/><span className="optional">OPTIONAL</span> <span className="feature-status-beta" title="This feature is BETA status and subject to potential changes.">BETA</span><a className="hash-link" href="#ord-v1-document-description_perspective" title="V1DocumentDescription.perspective"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">With ORD it's possible to describe a system from a static or a dynamic [perspective](../index.md#perspectives) (for more details, follow the link).<br/><br/>It is strongly RECOMMENDED to mark all static ORD documents with perspective `system-version`.<br/><br/>It is RECOMMENDED to describe dynamic metadata in both static system-version perspective and additionally describe the system-instance perspective where it diverges from the static metadata.<br/><br/>If not provided, this defaults to `system-instance`, which is the most precise description but also the most costly to replicate.<br/><br/>Please read the [article on perspectives](../concepts/perspectives) for more explanations.<hr/>**Default Value**: `system-instance`<br/>**Allowed Values**: <ul><li><p>`"system-version"`: Describes the static [system-version](../index.md#def-system-version) perspective, usually known at deploy-time.<br/><br/>If chosen, `describedSystemVersion`.`version` MUST be provided, too.<br/><br/>This perspective describes how a system of a particular type and version generally look like.<br/>The latest system-version MAY also be interpreted as the [system-type](../index.md#def-system-type) perspective.</p></li><li><p>`"system-instance"`: Describes the complete dynamic [system-instance](../index.md#def-system-instance) (tenant) perspective as known at run-time.<br/>This allows to also reflect tenant specific extensions, customizations and runtime configuration.<br/><br/>If provided, it will completely override the static system-version perspective when metadata about system instances is requested.</p></li><li><p>`"system-independent"`: Describes content that is independent of [system-versions](../index.md#def-system-version) or [system-instances](../index.md#def-system-instance).<br/>This content is always static and has independent visibility and lifecycle from the systems in a particular landscape.<br/>The "system-independent" content MUST NOT be overridden via system-version or system-instance perspective metadata.<br/><br/>Examples are: Vendors, products, globally aligned entity types, groups and group types (taxonomy), which are usually shared by multiple systems.</p></li></ul><br/><strong>Introduced in Version</strong>: 1.12.0<br/>**Example Values**: <ul className="examples"><li>`"system-instance"`</li></ul></div>|
|<div className="interface-property-name anchor" id="ord-v1-document-description_systeminstanceaware">systemInstanceAware<br/><span className="optional">OPTIONAL</span><br/><span className="deprecated" title="Please use `perspectives` instead and split content of different perspectives into different ORD documents.">DEPRECATED</span><a className="hash-link" href="#ord-v1-document-description_systeminstanceaware" title="V1DocumentDescription.systemInstanceAware"></a></div>|<div className="interface-property-type">boolean</div>|<div className="interface-property-description"><span class="deprecated">DEPRECATION-TEXT</span>: Please use `perspectives` instead and split content of different perspectives into different ORD documents.<hr/>Whether the information in the ORD document is **system instance aware**.<br/><br/>This is the case when the provided ORD document potentially differs between **system instances**.<br/>Please note that if a system does not support multi-tenancy, most likely each system instance has its own<br/>URL and different system instances could even be deployed in a different state (version).<br/>If those conditions apply, `systemInstanceAware` MUST be set to true.<br/><br/>An ORD aggregator that represents a system instance aware perspective MUST fetch a system instance aware ORD document,<br/>not just once per system type but once per **system instance**.<br/><br/>Please note that you can define system instance awareness also on the level of an ORD resource.<br/>It is even possible and valid to have an ORD document that is NOT system instance aware to contain resources that are.<br/>This can be the case because the resource is described in separate resource definition formats which would change,<br/>while the ORD document itself would not change (the links to the resource definition files stay the same).<br/><br/>If some ORD information is **system instance aware** and some is not,<br/>we RECOMMEND to split the information into separate documents and mark their system instance awareness accordingly.<br/>**Default Value**: `false`<br/><strong>Deprecated in Version</strong>: 1.12.0<br/>**Example Values**: <ul className="examples"><li>`true`</li></ul></div>|
|<div className="interface-property-name anchor" id="ord-v1-document-description_accessstrategies">accessStrategies<br/><span className="mandatory">MANDATORY</span><a className="hash-link" href="#ord-v1-document-description_accessstrategies" title="V1DocumentDescription.accessStrategies"></a></div>|<div className="interface-property-type">Array&lt;[Ord V1 Document Access Strategy](#ord-v1-document-access-strategy)&gt;</div>|<div className="interface-property-description">List of supported access strategies for retrieving the metadata from the ORD provider.<br/><br/>An ORD Consumer/ORD Aggregator MAY freely choose any of the listed strategies.<hr/>**Array Constraint**: MUST have at least 1 items</div>|


### Ord V1 Capabilities

List of capabilities that are supported by the ORD provider.

**Type**: Object(<a href="#ord-v1-capabilities_selector">selector</a>)

| Property | Type | Description |
| -------- | ---- | ----------- |
|<div className="interface-property-name anchor" id="ord-v1-capabilities_selector">selector<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#ord-v1-capabilities_selector" title="V1Capabilities.selector"></a></div>|<div className="interface-property-type">boolean</div>|<div className="interface-property-description">Whether the ORD provider supports the optional [select parameter](../index.md#select-parameter) for retrieving the ORD config and ORD documents.<hr/>**Default Value**: `false`</div>|


### Ord V1 Document Access Strategy

Defines the [access strategy](../../spec-extensions/access-strategies/) for accessing the ORD documents from the ORD provider.

**Type**: Object(<a href="#ord-v1-document-access-strategy_type">type</a>, <a href="#ord-v1-document-access-strategy_customtype">customType</a>, <a href="#ord-v1-document-access-strategy_customdescription">customDescription</a>)

| Property | Type | Description |
| -------- | ---- | ----------- |
|<div className="interface-property-name anchor" id="ord-v1-document-access-strategy_type">type<br/><span className="mandatory">MANDATORY</span><a className="hash-link" href="#ord-v1-document-access-strategy_type" title="AccessStrategy.type"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">Defines the authentication/authorization strategy through which the referenced ORD Documents can be accessed.<hr/>**Recommended Values**: <ul><li>`"open"`: The resource definitions are openly accessible and not protected via authentication or authorization.<br/>Please find a more detailed documentation [here](../../spec-extensions/access-strategies/open).</li><li>`"basic-auth"`: The resource definitions are protected via generic basic auth.<br/>Please find a more detailed documentation [here](../../spec-extensions/access-strategies/basic-auth).</li><li>`"custom"`: If chosen, `customType` MUST be provided.<br/>If chosen, `customDescription` SHOULD be provided.</li></ul><br/>**Example Values**: <ul className="examples"><li>`"open"`</li></ul></div>|
|<div className="interface-property-name anchor" id="ord-v1-document-access-strategy_customtype">customType<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#ord-v1-document-access-strategy_customtype" title="AccessStrategy.customType"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">If the fixed `type` enum values need to be extended, an arbitrary `customType` can be provided.<br/><br/>MUST be a valid [Specification ID](../index.md#specification-id).<br/><br/>MUST only be provided if `type` is set to `custom`.<hr/>**Regex Pattern**: <code className="regex">^([a-z0-9]+(?\:[.][a-z0-9]+)\*)\:([a-zA-Z0-9._\\-]+)\:v([0-9]+)$</code><br/>**Maximum Length**: `255`<br/>**Example Values**: <ul className="examples"><li>`"sap.xref:open-local-tenant-id:v1"`</li></ul></div>|
|<div className="interface-property-name anchor" id="ord-v1-document-access-strategy_customdescription">customDescription<br/><span className="optional">OPTIONAL</span><a className="hash-link" href="#ord-v1-document-access-strategy_customdescription" title="AccessStrategy.customDescription"></a></div>|<div className="interface-property-type">string</div>|<div className="interface-property-description">Human-readable description about how the access is set up, notated in [CommonMark](https://spec.commonmark.org/) (Markdown).<br/><br/>MUST only be provided if `type` is set to `custom`.<hr/>**Minimum Length**: `1`<br/>**Example Values**: <ul className="examples"><li>`"To set up the access to OData APIs, please refer to the [SAP Cloud for Customer OData API](https://help.sap.com/viewer/1364b70b9cbb417ea5e2d80e966d4f49/CLOUD/en-US) help pages.\""`</li></ul></div>|


###### Example Values:


```js
{
  "type": "open"
}
```


```js
{
  "type": "custom",
  "customType": "sap.xref:open-local-tenant-id:v1",
  "customDescription": "Custom description how to use custom access strategy"
}
```

