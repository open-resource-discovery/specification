# CHANGELOG

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) rules,
but omits the **patch** level in the spec version number.

For a roadmap including expected timeline, please refer to [ROADMAP.md](./ROADMAP.md)

## [unreleased]

### Fixed

- make AccessStrategy from ORD Configuration consistent with AccessStrategy from ORD Document (both should use `anyOf` for the allowed values)

### Removed

- deleted SAP specific values from ORD Configuration:
  - `AccessStrategy` values: `sap:oauth-client-credentials:v1`, `sap:cmp-mtls:v1`, `sap.businesshub:basic-auth:v1` but any string with pattern `^([a-z0-9-]+(?:[.][a-z0-9-]+)*):([a-zA-Z0-9._\\-]+):(v0|v[1-9][0-9]*)$` is allowed therefore using this values is still allowed

- deleted SAP specific values from ORD Document:
  - `policyLevel` values: `sap:base:v1`, `sap:core:v1`, `sap:dp:v1` but any string with pattern `^([a-z0-9-]+(?:[.][a-z0-9-]+)*):([a-zA-Z0-9._\\-]+):(v0|v[1-9][0-9]*)$` is allowed therefore using this values is still allowed
  - `ApiResource.implementationStandard` values: `sap:ord-document-api:v1`, `sap:csn-exposure:v1`, `sap:ape-api:v1`, `sap:cdi-api:v1`, `sap:delta-sharing:v1`, `sap:hana-cloud-sql:v1`, `sap.dp:data-subscription-api:v1` but any string with pattern `^([a-z0-9-]+(?:[.][a-z0-9-]+)*):([a-zA-Z0-9._\\-]+):(v0|v[1-9][0-9]*)$` is allowed therefore using this values is still allowed
  - `Package.policyLevel`, `ApiResource.policyLevel`, `EventResource.policyLevel`, `EntityType.policyLevel`, `DataProduct.policyLevel` values: `sap:base:v1`, `sap:core:v1`, `sap:dp:v1` but any string with pattern `^([a-z0-9-]+(?:[.][a-z0-9-]+)*):([a-zA-Z0-9._\\-]+):(v0|v[1-9][0-9]*)$` is allowed therefore using this values is still allowed
  - `AccessStrategy` values: `sap:oauth-client-credentials:v1`, `sap:cmp-mtls:v1`, `sap.businesshub:basic-auth:v1` but any string with pattern `^([a-z0-9-]+(?:[.][a-z0-9-]+)*):([a-zA-Z0-9._\\-]+):(v0|v[1-9][0-9]*)$` is allowed therefore using this values is still allowed

## [1.12.3]

### Changed

- Breaking: NPM package does not export `ordDocumentSchemaWithAnnotations` and `ordConfigurationSchemaWithAnnotations` anymore, use `ordDocumentSchema` and `ordConfigurationSchema` instead
- Breaking: Typescript Types renaming:
  - renamed `AccessStrategy` from Configuration schema to `OrdV1DocumentAccessStrategy`
  - renamed `ORDDocument` to `OrdDocument`, `ORDConfiguration` to `OrdConfiguration`, `APIResource` to `ApiResource` etc. (similar interface names are now camelCase explicit)

## [1.12.2]

### Added

- Added [Google A2A protocol](https://a2a-protocol.org/) support for agent integration
  - Added new `apiProtocol`: `a2a`
  - Added new resource definition type: `a2a-agent-card`

## [1.12.1]

### Added

- Added `basic-auth` access strategy for generic basic authentication
  - Deprecated `sap.businesshub:basic-auth:v1` access strategy in favor of `basic-auth`

### Changed

- Added explicit max length constrain to `systemNamespace` (32 chars)
  - This was already stated in the specification, but not enforced in the JSON Schema

## [1.12.0]

### Added

- Introduction of `perspective` in the ORD config and ORD document interfaces
  - This allows to explicitly declare which perspective is described on a per ORD-Document granularity level
    - `system-version`: Describes a static view, how a type of the system looks like in a specific version
    - `system-instance`: Describes how the system instance actually looks like at run-time (complete description, not partial!)
    - `system-independent`: Content that is independent or shared by multiple systems, e.g. global taxonomy.
  - It is now allowed to describe the same ORD resource not once, but for each perspective
  - This deprecates the `systemInstanceAware` flag
- Added `relationType` to `EntityType`.`relatedEntityTypes`
  - This allows to define the semantic relationship type between two entity types
  - Allowed values are `part-of` and `can-share-identity`
- Added new `releaseStatus` of `sunset`
  - If a resource has been sunset, previously it was required to also remove the resource description in ORD. Now it's allowed to keep it, but with `sunset` status. A tombstone entry MUST be provided on top.

### Changed

- Clarifications on Versioning and Lifecycle
  - Deprecation of resource does not imply a planned sunset, this is only implied once a `sunsetDate` has been set.
  - Deprecation of resource is RECOMMENDED once a successor resource exists.
  - Tombstone indicates either removal or archival of the entry for an ORD aggregator (implementation choice)

### Fixed

- Consistency: The Access Strategy enum in the ORD config interface was not extensible, like it already was in the Document interface (introduced with v1.11.0)

## [1.11.1]

### Added

- Added [MCP](https://modelcontextprotocol.io) as standardized API Resource `apiProtocol` option: `mcp`
  - There is not yet an official standardized resource definition type yet unfortunately
- Added `openapi-v3.1+` as new API Resource Definition type
  - This is a new resource definition type as 3.1 is not backward compatible with 3.0. All upcoming 3.x versions will be backward compatible with 3.1, so they share the `3.1+` definition type.
- Added new standardized enum values for `industry` and `lineOfBusiness`

### Changed

- Fixed regex for `customImplementationStandard` and `customType` to avoid versions with leadings zeroes:
  - `:v00001` - not allowed
  - `:v0` - allowed
  - `:v1` - allowed

## [1.11.0]

### Added

- Added simplified `exposedEntityTypes` to API and event resource, in favor of now deprecated `entityTypeMappings`
- Added optional ORD Provider API `?select` parameter to reduce result set of ORD aggregation run
  - Support of the select subset of the select parameter is indicated through ORD Config `capabilities.select`.

### Changed

- Deprecated `entityTypeMappings` in favor of simplified `exposedEntityTypes`
- Changed most enums to be "extensible" by default, usually by allowing strings, following a Spec ID regexp pattern
  - This will lead to less need to update the validator and could deprecate `custom` types
- Changed the structure of the ORD page
  - Details section removed, merged content either into spec itself (concepts) or new help area
  - Moved FAQ into help, some detail article became FAQ articles

## [1.10.1]

### Added

- Added `partOfProducts` to Data Product, to be consistent with API, Event Resource etc.
  - This allows an individual data product to add product assignments independent of the package they are part of.

### Changed

- Updated ORD Logo and relevant images / diagrams
- Renamed "ORD Document API" to "ORD Provider API"
- Renamed "ORD Service" to "ORD Discovery API"

## [1.10.0]

### Added

- Added `minSystemVersion` to API and event resources, data products and capabilities
- Added `describedSystemVersion` and `describedSystemType` to the ORD Document root
  - This completes the simplified ORD system landscape model, so it can be described within ORD (in case aggregator doesn't have the landscape model already)
- Added `compatibleWith` to API / event resources
  - This allows to point to another ORD ID that defines the contract that the API / event resources are compatible with
  - Typical case is that the API contract is defined by an external party, e.g. as a Service Provider Interface
  - There is some overlap with `implementationStandard`, which in the future should be less used / considered for deprecation (in case of Events)
- Added explicit constraints of 36 characters length for namespaces, 32 for system / authority namespaces
  - So far we only documented the constraints in the SAP namespace registry, we add them now in the public spec to be transparent on current constraints. If they prove to be a problem, making them more liberal will be a follow-up discussion. However, without explicit constraints, no consumer can rely on particular limits.
- Added `sap.dp:data-subscription-api:v1` as `implementationStandard` choice

### Changed

- Renamed the term system installation to system deployment and updated some definition terms for more clarity.
  - This has no impact on the ORD interface, just on the documentation.

## [1.9.11]

### Changed

- The public ORD repository moved into its own GitHub organization
  - Old: https://sap.github.io/open-resource-discovery/
  - New: https://open-resource-discovery.github.io/specification/

### Added

- Added `sap:oauth-client-credentials:v1` access strategy

## [1.9.10]

### Added

- Added `countries` to Data Products (like for APIs, Events and Packages)

## [1.9.9]

### Added

- Added `terms-of-use` as a new type for Data Product links.
- Added `sap:dp:v1` policy level (beta, WIP)

### Changed

- Deprecated `policyLevel` and `customPolicyLevel` in favor of more flexible `policyLevels` (multiple items)
  - This makes the policy level concept more flexible, as more than one policy level can apply
  - Policy levels are now just a Specification ID, no fixed enum + customType (for simplification)
- Removed constraint that `describedSystemInstance` MUST be same as system instance providing the ORD information
- Allow apostrophe for plural proper nouns in Short Descriptions in Policy Level `sap:core:v1`, e.g. `partners'`.
- Added two new Entity Type `level` options: `root-entity` and `sub-entity`.
- The alpha property `runtimeRestriction` is now just expecting a valid system namespace as value, not a fixed enum value range
  - This makes the property more flexible, no need for spec changes

## [1.9.8]

### Added

- Added How To guide for ORD Provider adoption (as new detail article)
- Added explicit `sap:base:v1` policy level to not conflate it with `none`
  - So far we only had SAP to use ORD, so we assumed that `none` equals to our `sap:base:v1`.
    By introducing this policy level, we can now keep `none` unopinionated.

## [1.9.7]

### Changed

- Allowing `disabled` as "hidden property" in Data Products for backward compatibility
  - The property was removed in favor of `lifecycleStatus`
  - This may be cleaned up / removed again in the future

## [1.9.6]

### Added

- Added `lifecycleStatus` to data products, which replaces the boolean `disabled` property.

### Fixed

- Renamed some instances of `sap-csn-interop-v1` to `sap-csn-interop-effective-v1` (inconsistency)
  - Bugfix release. So far, this was not used yet, as CSN Interop Effective is still in development.

### Removed

- Removed optional `disabled` property on data products, as the new `lifecycleStatus` supersedes it.

## [1.9.5]

### Changed

- Renamed one Data Product `type` enum value from `base` to `primary`.
  - BREAKING change, but introduced as a patch, as the Data Product interface is still in beta phase.

### Infrastructure

- Schemas published on NPMJS.org under [@sap/open-resource-discovery](https://www.npmjs.com/package/@sap/open-resource-discovery) package name.

## [1.9.4]

### Changed

- Renamed `sap:hdlf-delta-sharing:v1` implementation standard to `sap:delta-sharing:v1` to be more generic and not technology specific.
  - Incompatible change, but part of the "beta" Data Products, so we'll introduce it as a bugfix

### Added

- added `sap-csn-interop-effective-v1` as a standardized resource definition format for API and event resources

## [1.9.3]

### Added

- added optional `visibility` to Consumption Bundle
  - Some consumption bundle access types are only meant for internal or private purposes. Especially when we have internal APIs, their assigned Consumption Bundles are likely internal, too.
  - If `visibility` is not given, default is `public` (to ensure backward compatibility)

## [1.9.2]

### Added

- Added `localId` to Packages, for consistency with other ORD resources
- Added public link to the [SQL interface specification for SAP ecosystem](https://github.com/SAP/sql-interface-specification).

### Changed

- Data Product `shortDescription` and `description` are now mandatory
  - This is a breaking change, but as the Data Product concept as a whole is beta, we'll introduce it as a patch change.

## [1.9.1]

### Added

- Added back [FAQ page](https://open-resource-discovery.github.io/specification/details/faq) (can be found under "Details" navbar item)
- Added autogenerated class diagrams for [ORD Documents](https://open-resource-discovery.github.io/specification/spec-v1/diagrams/document) and [Configuration](https://open-resource-discovery.github.io/specification/spec-v1/diagrams/configuration) Interface.
- Added optional `systemTypeRestriction` to `EventResourceIntegrationAspect`
  - This can be used to limit the event publisher system type, which can be used to setup the subscription accordingly.
- Added explicit statement that the same resource definition type MUST NOT be provided more than once.
  - This was already implied, but not stated explicitly.
- Added two new (optional) SHOULD statements regarding deprecation and sunset lifecycle.
  - They represent common sense / practice and help with validating a good usage of the related attributes.
  - If `successors` is given, the described resource SHOULD set its `releaseStatus` to `deprecated`.
  - If a resource is deprecated without defining its `successors`, a `sunsetDate` SHOULD be provided.
- Clarification on consumer expectations toward `lastUpdate` property.

### Changed

- Renamed the term application namespace to system namespace
  - This is more consistent with the existing ORD terminology around system type
  - As it's only used as a term and not in the interface, this is not a breaking change

## [1.9.0]

### Added

- Added new (lightweight) Group and Group Type concept
  - Adds a new `partOfGroups` attribute on ORD resources
  - Adds two new top level concepts to the ORD document: [Group](https://open-resource-discovery.github.io/specification/spec-v1/interfaces/Document#group) and [Group Type](https://open-resource-discovery.github.io/specification/spec-v1/interfaces/Document#group-type)
  - This can be used to define custom group types and assign ORD resources to them
  - With this, custom taxonomies can be built that are either centrally or decentrally defined.
- Added [`relatedEntityTypes`](https://open-resource-discovery.github.io/specification/spec-v1/interfaces/Document#entity-type_relatedentitytypes) to Entity Types
  - This allows to define that Entity Types are related to other Entity Types (e.g. from a different namespace)
- Added clarification that an ORD Aggregator MUST bump `lastUpdated` if the provider didn't do it, but it detected a change.
- Added explicit [Access Strategy](https://open-resource-discovery.github.io/specification/spec-extensions/access-strategies/) description for `open`, defining how local and global tenant headers can be optionally passed on.
- Added new Detail Articles:
  - [How To Adopt ORD as a Provider](https://open-resource-discovery.github.io/specification/help/faq/adopt-ord-as-provider) detail page
  - [System Landscape Model](https://open-resource-discovery.github.io/specification/spec-v1/concepts/system-landscape-model) detail page
  - [Grouping and Bundling](https://open-resource-discovery.github.io/specification/spec-v1/concepts/grouping-and-bundling) detail page

### Changed

- Providing the `sunsetDate` for a deprecated resource is now only recommended instead of mandatory (compatible change)
  - "If the `releaseStatus` is set to `deprecated`, the `sunsetDate` SHOULD be provided (if already known)."
  - "Once the sunset date is known and ready to be communicated externally, it MUST be provided here."

## [1.8.5]

### Fixed

- Accidentally exported an `x-` attribute in the ORD JSON Schema interface in `Document.schema.json`
  - This export is meant to be clean of such extension attributes, as validators as AJV will complain on it by default
  - The `Document.annotated.schema.json` export keeps the extension attributes intact.

## [1.8.4]

### Fixed

- **Breaking**: The relation of a data product input port to the integration dependency was accidentally modeled as composition, not association,
  - Since the Data Product concept is still in beta, we'll ship this change as a fix and notify current adopters

### Added

- Added statement that there's a reserved `customer` vendor namespace
- The `.well-known/open-resource-discovery` URI is now [officially registered](https://www.iana.org/assignments/well-known-uris/well-known-uris.xhtml).

## [1.8.3]

### Added

- Added Excel and CSV files export that gives a high-level overview of ORD entities and their attributes

### Removed

- Removed `sap-delta-sharing-combined` API resource definition format, as it has not be specified yet.
  - It may be reintroduced in the future, if a specification exists and a producer for it exists.

### Fixed

- Fixed some ORD ID regexp, where it was still allowed to have `alpha` or `beta` instead of a major version
  - This affected Capability and Integration Dependency.
  - Instead, the `releaseStatus` property should be used to set `beta`.

## [1.8.2]

### Changed

- Made `accessStrategies` optional within the ORD document.
  - If this property is not provided, the definition URL will be available through the same access strategy as this ORD document.
  - It is RECOMMENDED anyway that the attached metadata definitions are available with the same access strategies, to simplify the aggregator crawling process.
- Minor clarification on visibility of Packages (since they don't have an explicit property for it)

### Fixed

- Product `title` property did not properly inherit constraints like the other `title` attributes (min- and max-length)

## [1.8.1]

### Changed

- Fix: Data Products need to have at least one output port
  - This is implied through the definition of a Data Product
  - Breaking change that we'll push as a bugfix, as so far it was clear to have at least one output port

## [1.8.0]

### Added

- Added [Data Product](../../spec-v1/interfaces/Document.md#data-product) concept.
  - for the time being in **beta** status
- Added `runtimeRestriction` to packages
- Added `responsible` to APIs, events and data products
- Added `usage` to APIs
- Added new `apiProtocol`s: `delta-sharing` and `sap-ina-api-v1`
- Added new API Resource Definition `type`: `sap-delta-sharing-combined`

### Changed

- Changed values of `supportedUseCases` on APIs
  - Technically a breaking change, but no consumer used it, therefore it is introduced as minor change
- Introduced a clear distinction between application namespace and authority namespace instead of "unit namespace"
  - At SAP we already made that distinction.
  - Having a unit-namespace as a simplification didn't work out in all cases and introduced an unnecessary new term
  - This change only affects how we name things and allows us to be more precise
  - For `Entity Type` its now clearly stated that they can also have an authority namespace

## [1.7.2]

### Fixed

- Fixed type of `minVersion` property. It was accidentally set to `boolean`, but is obviously meant as a (semver) version `string`

## [1.7.1]

### Added

- ORD has been made public as Open Source under Apache 2 license.
  - GitHub: https://github.com/open-resource-discovery/specification
  - Announcement: https://blogs.sap.com/2023/11/14/open-resource-discovery-a-protocol-for-decentralized-metadata-discovery-is-now-open-source/
- Added `eventResourceLinks` that allow to add typed links with predefined semantics
  - This was already available for APIs and just missing for event resources
  - In both cases, they share the same interface and predefined types
  - The internal interface name changed from `APIResourceLink` to `APIEventResourceLink`
    - This doesn't have any effect on the interface contract, but may need to be considered for internal refactoring / renaming.

