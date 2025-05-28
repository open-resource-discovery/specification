// AUTO-GENERATED definition files. Do not modify directly.

/**
 * Define from where the API resource can be used and accessed
 */
export type Usage = "external" | "local";

/**
 * The [ORD Document](../index.md#ord-document) object serves as a wrapper for the **ORD resources** and **ORD taxonomy** and adds further top-level information
 * that are specific to the document/the service it describes.
 *
 * The constraints and considerations on [ORD Documents](../index.md#ord-document) MUST be followed.
 */
export interface ORDDocument {
  /**
   * Optional [URL](https://tools.ietf.org/html/rfc3986) to the Open Resource Discovery document schema (defined as a JSON Schema).
   * If provided, this enables code intelligence and validation in supported editors (like VSCode) and tools.
   */
  $schema?: (
    | string
    | "https://open-resource-discovery.github.io/specification/spec-v1/interfaces/Document.schema.json#"
  ) &
    string;
  /**
   * Version of the Open Resource Discovery specification that is used to describe this document.
   */
  openResourceDiscovery:
    | "1.0"
    | "1.1"
    | "1.2"
    | "1.3"
    | "1.4"
    | "1.5"
    | "1.6"
    | "1.7"
    | "1.8"
    | "1.9"
    | "1.10"
    | "1.11";
  /**
   * Optional description of the ORD document itself.
   * Please note that this information is NOT further processed or considered by an ORD aggregator.
   *
   * Notated in [CommonMark](https://spec.commonmark.org/) (Markdown).
   */
  description?: string;
  describedSystemInstance?: SystemInstance;
  describedSystemType?: SystemType;
  describedSystemVersion?: SystemVersion;
  /**
   * The [policy level](../../spec-extensions/policy-levels/) (aka. compliance level) that the described resources need to be compliant with.
   * Depending on the chosen policy level, additional expectations and validations rules will be applied.
   *
   * The policy level can be defined on ORD Document level, but also be overwritten on an individual package or resource level.
   *
   */
  policyLevel?: (string | "none" | "sap:base:v1" | "sap:core:v1" | "sap:dp:v1" | "custom") & string;
  /**
   * If the fixed `policyLevel` values need to be extended, an arbitrary `customPolicyLevel` can be provided.
   * The policy level is inherited from packages to resources they contain, but can be overwritten at resource level.
   *
   * MUST only be provided if `policyLevel` is set to `custom`.
   * MUST be a valid [Specification ID](../index.md#specification-id).
   */
  customPolicyLevel?: string;
  /**
   * A list of [policy levels](../../spec-extensions/policy-levels/) that the described resources need to be compliant with.
   * For each chosen policy level, additional expectations and validations rules will be applied.
   *
   * Policy levels can be defined on ORD Document level, but also be overwritten on an individual package or resource level.
   *
   * A policy level MUST be a valid [Specification ID](../index.md#specification-id).
   */
  policyLevels?: string[];
  /**
   * Array of all API Resources that are described in this ORD document.
   */
  apiResources?: APIResource[];
  /**
   * Array of all event resources that are described in this ORD document.
   */
  eventResources?: EventResource[];
  /**
   * Array of all entity types that are described in this ORD document.
   */
  entityTypes?: EntityType[];
  /**
   * Array of all capabilities that are described in this ORD document.
   */
  capabilities?: Capability[];
  /**
   * Array of all data products that are described in this ORD document.
   */
  dataProducts?: DataProduct[];
  /**
   * Array of all integration dependencies that are described in this ORD document.
   */
  integrationDependencies?: IntegrationDependency[];
  /**
   * Array of all Vendors that are described in this ORD document.
   */
  vendors?: Vendor[];
  /**
   * Array of all Products that are described in this ORD document.
   */
  products?: Product[];
  /**
   * Array of all Packages that are described in this ORD document.
   */
  packages?: Package[];
  /**
   * Array of all Consumption Bundles that are described in this ORD document.
   */
  consumptionBundles?: ConsumptionBundle[];
  /**
   * Array of all Groups that are described in this ORD document.
   */
  groups?: Group[];
  /**
   * Array of all Group Types that are described in this ORD document.
   */
  groupTypes?: GroupType[];
  /**
   * List of ORD information (resources or taxonomy) that have been "tombstoned"/removed.
   * This MUST be indicated explicitly, so that ORD aggregators and consumers can learn about the removal.
   *
   * A tombstone entry MAY be removed after a grace period of 31 days.
   */
  tombstones?: Tombstone[];
}
/**
 * A [system instance](../index.md#def-system-instance) is a concrete, running instance of a system type.
 * In a multi-tenant system, it corresponds to a tenant.
 * In a single-tenant system, it corresponds to the [system installation](../index.md#def-system-deployment) itself.
 */
export interface SystemInstance {
  /**
   * Optional [base URL](../index.md#def-base-url) of the **system instance**.
   * By providing the base URL, relative URLs in the document are resolved relative to it.
   *
   * The `baseUrl` MUST not contain a leading slash.
   *
   * MUST be provided if the base URL is not known to the ORD aggregators.
   * MUST be provided when the document needs to be fully self contained, e.g. when used for manual imports.
   */
  baseUrl?: string;
  /**
   * Optional local ID for the system instance, as known by the described system.
   *
   * In case of multi-tenant systems, it is equivalent to the local tenant id.
   */
  localId?: string;
  /**
   * Correlation IDs can be used to create a reference to related data in other repositories (especially to the system of record).
   *
   * They express an "identity" / "equals" / "mappable" relationship to the target ID.
   *
   * If a "part of" relationship needs to be expressed, use the `partOfGroups` assignment instead.
   *
   * MUST be a valid [Correlation ID](../index.md#correlation-id).
   */
  correlationIds?: string[];
  labels?: Labels;
  documentationLabels?: DocumentationLabels;
  /**
   * List of free text style tags.
   * No special characters are allowed except `-`, `_`, `.`, `/` and ` `.
   *
   * Tags that are assigned to a `Package` are inherited to all of the ORD resources it contains.
   */
  tags?: string[];
}
/**
 * Generic labels that can be applied to most ORD information.
 * They are defined as an object that may have arbitrary keys.
 * The value of a key is an array of strings.
 *
 * Labels can be used to attach technical information that cannot be expressed natively in ORD.
 * An ORD aggregator should allow to categorize and query information based on the labels provided.
 *
 * If multiple parties rely on the existence of certain label information,
 * standardization through ORD SHOULD be preferred.
 *
 * All labels attached to a `Package` will be inherited to the resources they contain.
 * Duplicate labels will be merged by the ORD aggregator according to the following rules:
 * * Values of the same label key will be merged.
 * * Duplicate values of the same label key will be removed.
 */
export interface Labels {
  /**
   * This interface was referenced by `Labels`'s JSON-Schema definition
   * via the `patternProperty` "^[a-zA-Z0-9-_.]*$".
   */
  [k: string]: string[];
}
/**
 * Generic documentation labels that can be applied to most ORD information.
 * They are defined as an object that may have arbitrary keys.
 * The value of a key is an array of [CommonMark](https://spec.commonmark.org/) (Markdown) text.
 *
 * Documentation Labels can be used to attach human readable documentation that cannot be expressed natively in ORD.
 * A documentation tool (like an API Catalog) can use the documentation labels to provide generic documentation "snippets".
 * Due to the given structure they can be displayed e.g. as tables.
 *
 * The key of the documentation Label is plain-text (MUST not contain line breaks) and denotes the subject matter that is described.
 * The values (multiple can be provided for the same key) are [CommonMark](https://spec.commonmark.org/) (Markdown) text
 * which describes the subject matter or lists options for the key.
 *
 * In contrast to regular labels, documentation labels are not meant to be used to categorize or query information.
 */
export interface DocumentationLabels {
  /**
   * This interface was referenced by `DocumentationLabels`'s JSON-Schema definition
   * via the `patternProperty` "^.*$".
   */
  [k: string]: string[];
}
/**
 * A [system type](../index.md#def-system-type) is the abstract type of an application or service, from operational perspective.
 */
export interface SystemType {
  /**
   * The system namespace is a unique identifier for the system type.
   * It is used to reference the system type in the ORD.
   */
  systemNamespace?: string;
  /**
   * Correlation IDs can be used to create a reference to related data in other repositories (especially to the system of record).
   *
   * They express an "identity" / "equals" / "mappable" relationship to the target ID.
   *
   * If a "part of" relationship needs to be expressed, use the `partOfGroups` assignment instead.
   *
   * MUST be a valid [Correlation ID](../index.md#correlation-id).
   */
  correlationIds?: string[];
  labels?: Labels;
  documentationLabels?: DocumentationLabels;
  /**
   * List of free text style tags.
   * No special characters are allowed except `-`, `_`, `.`, `/` and ` `.
   *
   * Tags that are assigned to a `Package` are inherited to all of the ORD resources it contains.
   */
  tags?: string[];
}
/**
 * A [system version](../index.md#def-system-version) states the design-time version / release of a [system instance](../index.md#def-system-instance).
 * It provides versioning for operational purposes for the [system type](../index.md#def-system-type).
 */
export interface SystemVersion {
  /**
   * The version number of the system instance (run-time) or the version of the described static system type.
   *
   * It MUST follow the [Semantic Versioning 2.0.0](https://semver.org/) standard.
   */
  version?: string;
  /**
   * Human-readable title of the system version.
   */
  title?: string;
  /**
   * Correlation IDs can be used to create a reference to related data in other repositories (especially to the system of record).
   *
   * They express an "identity" / "equals" / "mappable" relationship to the target ID.
   *
   * If a "part of" relationship needs to be expressed, use the `partOfGroups` assignment instead.
   *
   * MUST be a valid [Correlation ID](../index.md#correlation-id).
   */
  correlationIds?: string[];
  labels?: Labels;
  documentationLabels?: DocumentationLabels;
  /**
   * List of free text style tags.
   * No special characters are allowed except `-`, `_`, `.`, `/` and ` `.
   *
   * Tags that are assigned to a `Package` are inherited to all of the ORD resources it contains.
   */
  tags?: string[];
}
/**
 * The API Resource provides a high-level description of an exposed API.
 * You can find more information, such as the API resource definitions, in the links in the table below.
 *
 * An API Resource bundles multiple endpoints and resources together.
 * They share the same API namespace and lifecycle (API major version).
 * However, the exact granularity of this is up to the implementer of the API.
 * As a consequence, an API resource MUST NOT bundle together endpoints from different API versions or namespaces.
 *
 * A common practice is to bundle endpoints that are based on the same domain or Business Object.
 *
 * Please note that APIs can be described, but still be [`disabled`](#api-resource_disabled).
 *
 * If the API is not created or owned by the user of the system or by third parties (like partners), it MUST be assigned to dedicated [Packages](#package) that state this the ownership via the `vendor` property.
 */
export interface APIResource {
  /**
   * The ORD ID is a stable, globally unique ID for ORD resources or taxonomy.
   *
   * It MUST be a valid [ORD ID](../index.md#ord-id) of the appropriate ORD type.
   */
  ordId: string;
  /**
   * The locally unique ID under which this resource can be looked up / resolved in the described system itself.
   * Unlike the ORD ID it's not globally unique, but it may be useful to document the original ID / technical name.
   *
   * It MAY also be used as the `<resourceName>` fragment in the ORD ID, IF it can fulfill the charset and length limitations within the ORD ID.
   * But since this is not always possible, no assumptions MUST be made about the local ID being the same as the `<resourceName>` fragment in the ORD ID.
   */
  localId?: string;
  /**
   * Correlation IDs can be used to create a reference to related data in other repositories (especially to the system of record).
   *
   * They express an "identity" / "equals" / "mappable" relationship to the target ID.
   *
   * If a "part of" relationship needs to be expressed, use the `partOfGroups` assignment instead.
   *
   * MUST be a valid [Correlation ID](../index.md#correlation-id).
   */
  correlationIds?: string[];
  /**
   * Human-readable title.
   *
   * MUST NOT exceed 255 chars.
   * MUST NOT contain line breaks.
   */
  title: string;
  /**
   * Plain text short description.
   *
   * MUST NOT exceed 255 chars.
   * MUST NOT contain line breaks.
   */
  shortDescription: string;
  /**
   * Full description, notated in [CommonMark](https://spec.commonmark.org/) (Markdown).
   *
   * The description SHOULD not be excessive in length and is not meant to provide full documentation.
   * Detailed documentation SHOULD be attached as (typed) links.
   */
  description: string;
  /**
   * Defines which Package the resource is part of.
   *
   * MUST be a valid reference to a [Package](#package) ORD ID.
   *
   * Every resource MUST be part of one package.
   */
  partOfPackage: string;
  /**
   * Defines which groups the resource is assigned to.
   *
   * The property is optional, but if given the value MUST be an array of valid Group IDs.
   *
   * Groups are a lightweight custom taxonomy concept.
   * They express a "part of" relationship to the chosen group concept.
   * If an "identity / equals" relationship needs to be expressed, use the `correlationIds` instead.
   *
   * All resources that share the same group ID assignment are effectively grouped together.
   */
  partOfGroups?: string[];
  /**
   * List of references to the consumption bundles in this resource belongs to.
   *
   * MUST be a valid reference to a [Consumption Bundle](#consumption-bundle) ORD ID.
   *
   * An API resource SHOULD be associated to one or multiple consumption bundles, if it is of direction `inbound` or `mixed`.
   * Some ORD consumer use cases MAY depend on an association to a consumption bundle.
   * If none is given, the resource may not appear as it's unknown how it can be consumed.
   *
   * If a resource has no direct incoming consumption characteristics:
   * - MUST NOT assign consumption bundle to API or Event resources with `direction`: `outbound` (no inbound consumption)
   * - MUST NOT assign consumption bundle if resource is not accessible directly, but only via intermediaries like event brokers or gateways.
   *   - In this case the intermediary SHOULD describe the consumption bundle instead (potentially also re-describing the resources as well).
   */
  partOfConsumptionBundles?: ConsumptionBundleReference[];
  /**
   * References the default consumption bundle to use for this resource.
   *
   * MUST be a valid reference to a [Consumption Bundle](#consumption-bundle) ORD ID.
   *
   * Can be used by clients to make a deterministic and preferred choice when multiple options are available.
   *
   * The value MUST be an existing option in the corresponding `partOfConsumptionBundles` array.
   */
  defaultConsumptionBundle?: string;
  /**
   * List of products the resources of the package are a part of.
   *
   * MUST be a valid reference to a [Product](#product) ORD ID.
   *
   * `partOfProducts` that are assigned to a `Package` are inherited to all of the ORD resources it contains.
   *
   * @minItems 0
   */
  partOfProducts?: string[];
  /**
   * The complete [SemVer](https://semver.org/) version string.
   *
   * It MUST follow the [Semantic Versioning 2.0.0](https://semver.org/) standard.
   * It SHOULD be changed if the ORD information or referenced resource definitions changed.
   * It SHOULD express minor and patch changes that don't lead to incompatible changes.
   *
   * When the `version` major version changes, the [ORD ID](../index.md#ord-id) `<majorVersion>` fragment MUST be updated to be identical.
   * In case that a resource definition file also contains a version number (e.g. [OpenAPI `info`.`version`](https://swagger.io/specification/#info-object)), it MUST be equal with the resource `version` to avoid inconsistencies.
   *
   * If the resource has been extended by the user, the change MUST be indicated via `lastUpdate`.
   * The `version` MUST not be bumped for changes in extensions.
   *
   * The general [Version and Lifecycle](../index.md#version-and-lifecycle) flow MUST be followed.
   *
   * Note: A change is only relevant for a version increment, if it affects the ORD resource or ORD taxonomy directly.
   * For example: If a resource within a `Package` changes, but the package itself did not, the package version does not need to be incremented.
   */
  version: string;
  /**
   * Optional, but RECOMMENDED indicator when (date-time) the last change to the resource (including its definitions) happened.
   *
   * The date format MUST comply with [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339#section-5.6).
   *
   * When retrieved from an ORD aggregator, `lastUpdate` will be reliable there and reflect either the provider based update time or the aggregator processing time.
   * Therefore consumers MAY rely on it to detect changes to the metadata and the attached resource definition files.
   *
   * If the resource has attached definitions, either the `version` or `lastUpdate` property MUST be defined and updated to let the ORD aggregator know that they need to be fetched again.
   *
   * Together with `systemInstanceAware`, this property SHOULD be used to optimize the metadata crawling process of the ORD aggregators.
   */
  lastUpdate?: string;
  /**
   * The visibility states who is allowed to "see" the described resource or capability.
   */
  visibility: "public" | "internal" | "private";
  /**
   * The `releaseStatus` specifies the stability of the resource and its external contract.
   */
  releaseStatus: "active" | "beta" | "deprecated";
  /**
   * Indicates that this resource is currently not available for consumption at runtime, but could be configured to be so.
   * This can happen either because it has not been setup for use or disabled by an admin / user.
   *
   * If the resource is not available in principle for a particular system instance, e.g. due to lack of entitlement, it MUST not be described in the system-instance aware perspective.
   *
   * This property can only reflect the knowledge of the described system instance itself.
   * Outside factors for availability can't need to be considered (e.g. network connectivity, middlewares).
   *
   * A disabled resource MAY skip describing its resource definitions.
   *
   */
  disabled?: boolean;
  /**
   * The resource has been introduced in the given [system version](../index.md#def-system-version).
   * This implies that the resource is only available if the system instance is of at least that system version.
   */
  minSystemVersion?: string;
  /**
   * The deprecation date defines when the resource has been set as deprecated.
   * This is not to be confused with the `sunsetDate` which defines when the resource will be actually decommissioned / removed.
   *
   * If the `releaseStatus` is set to `deprecated`, the `deprecationDate` SHOULD be provided.
   *
   * The date format MUST comply with [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339#section-5.6).
   */
  deprecationDate?: string;
  /**
   * The sunset date defines when the resource is scheduled to be decommissioned/removed.
   *
   * If the `releaseStatus` is set to `deprecated`, the `sunsetDate` SHOULD be provided (if already known).
   * Once the sunset date is known and ready to be communicated externally, it MUST be provided here.
   *
   * The date format MUST comply with [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339#section-5.6).
   */
  sunsetDate?: string;
  /**
   * The successor resource(s).
   *
   * MUST be a valid reference to an ORD ID.
   *
   * If the `releaseStatus` is set to `deprecated`, `successors` MUST be provided if one exists.
   * If `successors` is given, the described resource SHOULD set its `releaseStatus` to `deprecated`.
   */
  successors?: string[];
  /**
   * Contains changelog entries that summarize changes with special regards to version and releaseStatus
   */
  changelogEntries?: ChangelogEntry[];
  /**
   * List of [URL reference](https://tools.ietf.org/html/rfc3986#section-4.1) (URL or relative reference) to the target host.
   *
   * If the API resource can be accessed through an entry point, it MUST be described here.
   *
   * The list of entry points MUST not include duplicates.
   * If multiple entry points are provided they MUST be arbitrarily exchangeable without effects.
   * This means that the URLs are just an alias to each other and the `resourceDefinitions` apply to all entry points equally.
   * In case of multiple entry points it is RECOMMENDED to provide a `defaultEntryPoint` through `partOfConsumptionBundles`.
   * The entry point URLs SHOULD match with the target host(s) in the resource definition files (e.g. OpenAPI `servers`).
   * If there is no match, the information in ORD takes precedence.
   *
   * **Provider View:**
   * If the URL is relative to the system that describes the ORD information,
   * it is RECOMMENDED to use relative references and (if known) to provide the `describedSystemInstance`.`baseUrl`.
   * If the URL is not relative to the described system instance [base URL](../index.md#def-base-url), a full URL MUST be provided.
   *
   * **Consumer View**:
   * When fetching the information from an ORD Aggregator, the consumer MAY rely on receiving full URLs.
   *
   * @minItems 0
   */
  entryPoints?: string[];
  /**
   * Direction of the API Resource consumption.
   * If not provided, "inbound" is assumed.
   *
   * In case of SOAP APIs, the direction is already indicated through the `apiProtocol`, making this property redundant and optional. But if it is provided, it MUST not be in contradiction with the `apiProtocol` direction.
   */
  direction?: "inbound" | "mixed" | "outbound";
  /**
   * API Protocol including the protocol version if applicable
   */
  apiProtocol: (
    | string
    | "odata-v2"
    | "odata-v4"
    | "rest"
    | "graphql"
    | "delta-sharing"
    | "soap-inbound"
    | "soap-outbound"
    | "websocket"
    | "sap-rfc"
    | "sap-sql-api-v1"
    | "sap-ina-api-v1"
  ) &
    string;
  /**
   * List of available machine-readable definitions, which describe the resource or capability in detail.
   *
   * Each definition is to be understood as an alternative description format, describing the same resource / capability.
   * As a consequence the same definition type MUST NOT be provided more than once.
   *
   * It is RECOMMENDED to provide the definitions as they enable machine-readable use cases.
   * If the definitions are added or changed, the `version` MUST be incremented.
   * An ORD aggregator MAY only (re)fetch the definitions again when the `version` was incremented.
   */
  resourceDefinitions?: APIResourceDefinition[];
  /**
   * Declares this API to be a valid implementation of an externally standardized API contract, sub-protocol or protocol variant.
   *
   * All APIs that share the same implementation standard MAY be treated the same or similar by a consumer client.
   */
  implementationStandard?: (
    | string
    | "sap:ord-document-api:v1"
    | "cff:open-service-broker:v2"
    | "sap:csn-exposure:v1"
    | "sap:ape-api:v1"
    | "sap:cdi-api:v1"
    | "sap:delta-sharing:v1"
    | "sap:hana-cloud-sql:v1"
    | "sap.dp:data-subscription-api:v1"
    | "custom"
  ) &
    string;
  /**
   * If the fixed `implementationStandard` values need to be extended, an arbitrary `customImplementationStandard` can be provided.
   *
   * MUST be a valid [Specification ID](../index.md#specification-id).
   *
   * MUST only be provided if `implementationStandard` is set to `custom`.
   */
  customImplementationStandard?: string;
  /**
   * Full description of the custom implementation standard, notated in [CommonMark](https://spec.commonmark.org/) (Markdown).
   *
   * MUST only be provided if `implementationStandard` is set to `custom`.
   *
   * SHOULD contain documentation and links that describe the used standard.
   */
  customImplementationStandardDescription?: string;
  /**
   * Declares this API is a compatible implementation of the referenced API contract(s).
   * This is also sometimes known as [Service Provider Interface](https://en.wikipedia.org/wiki/Service_provider_interface).
   *
   * MUST be a valid reference to an (usually external) [API Resource](#api-resource) ORD ID.
   *
   * All APIs that share the same `compatibleWith` value MAY be treated the same or similar by a consumer client.
   */
  compatibleWith?: string[];
  /**
   * Contains typically the organization that is responsible in the sense of RACI matrix for this ORD resource. This includes support and feature requests. It is maintained as correlation id to for example support components.
   */
  responsible?: string;
  /**
   * List of use cases (types) how the resource is meant to be used for.
   *
   * This helps consumers better to understand which use cases had been in mind by the provider
   * and are therefore explicitly supported.
   * This is obviously described from a provider perspective, but stating what consumer use cases it potentially supports.
   * As it's not possible to create a list of options that are mutually exclusive, all options that apply should be provided.
   *
   * If no array is defined, it is assumed that this information is not provided.
   */
  supportedUseCases?: ((string | "data-federation" | "snapshot" | "incremental" | "streaming") & string)[];
  usage?: Usage;
  /**
   * Describes mappings between the API Models of the described resource to the underlying, conceptual entity types.
   */
  entityTypeMappings?: EntityTypeMapping[];
  /**
   * Optional list of [entity types](#entity-type) that are exposed by the resource.
   *
   * This replaces `entityTypeMappings`. If both is given, the `exposedEntityTypes` wins.
   *
   * MUST be a valid reference to an [EntityType](#entity-type) ORD ID.
   */
  exposedEntityTypes?: ExposedEntityType[];
  /**
   * Links with semantic meaning that are specific to API Resources.
   */
  apiResourceLinks?: APIAndEventResourceLink[];
  /**
   * Generic Links with arbitrary meaning and content.
   *
   * If applicable, `apiResourceLinks` MUST be used instead of generic `links`.
   */
  links?: Link[];
  extensible?: Extensible;
  /**
   * List of countries that the package resources are applicable to.
   *
   * MUST be expressed as an array of country codes according to [IES ISO-3166 ALPHA-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2).
   *
   * `countries` that are assigned to a `Package` are inherited to all of the ORD resources it contains.
   */
  countries?: string[];
  /**
   * List of line of business tags.
   * No special characters are allowed except `-`, `_`, `.`, `/` and ` `.
   *
   * `lineOfBusiness` that are assigned to a `Package` are inherited to all of the ORD resources it contains.
   */
  lineOfBusiness?: ((
    | string
    | "Asset Management"
    | "Commerce"
    | "Finance"
    | "Human Resources"
    | "Manufacturing"
    | "Marketing"
    | "R&D Engineering"
    | "Sales"
    | "Service"
    | "Sourcing and Procurement"
    | "Supply Chain"
    | "Sustainability"
    | "Metering"
    | "Grid Operations and Maintenance"
    | "Plant Operations and Maintenance"
    | "Maintenance and Engineering"
  ) &
    string)[];
  /**
   * List of industry tags.
   * No special characters are allowed except `-`, `_`, `.`, `/` and ` `.
   *
   * `industry` that are assigned to a `Package` are inherited to all of the ORD resources it contains.
   */
  industry?: ((
    | string
    | "Aerospace and Defense"
    | "Automotive"
    | "Banking"
    | "Chemicals"
    | "Consumer Products"
    | "Defense and Security"
    | "Engineering Construction and Operations"
    | "Healthcare"
    | "Higher Education and Research"
    | "High Tech"
    | "Industrial Machinery and Components"
    | "Insurance"
    | "Life Sciences"
    | "Media"
    | "Mill Products"
    | "Mining"
    | "Oil and Gas"
    | "Professional Services"
    | "Public Sector"
    | "Retail"
    | "Sports and Entertainment"
    | "Telecommunications"
    | "Travel and Transportation"
    | "Utilities"
    | "Wholesale Distribution"
  ) &
    string)[];
  /**
   * List of free text style tags.
   * No special characters are allowed except `-`, `_`, `.`, `/` and ` `.
   *
   * Tags that are assigned to a `Package` are inherited to all of the ORD resources it contains.
   */
  tags?: string[];
  labels?: Labels;
  documentationLabels?: DocumentationLabels;
  /**
   * The [policy level](../../spec-extensions/policy-levels/) (aka. compliance level) that the described resources need to be compliant with.
   * Depending on the chosen policy level, additional expectations and validations rules will be applied.
   *
   * The policy level can be defined on ORD Document level, but also be overwritten on an individual package or resource level.
   *
   */
  policyLevel?: (string | "none" | "sap:base:v1" | "sap:core:v1" | "sap:dp:v1" | "custom") & string;
  /**
   * If the fixed `policyLevel` values need to be extended, an arbitrary `customPolicyLevel` can be provided.
   * The policy level is inherited from packages to resources they contain, but can be overwritten at resource level.
   *
   * MUST only be provided if `policyLevel` is set to `custom`.
   * MUST be a valid [Specification ID](../index.md#specification-id).
   */
  customPolicyLevel?: string;
  /**
   * A list of [policy levels](../../spec-extensions/policy-levels/) that the described resources need to be compliant with.
   * For each chosen policy level, additional expectations and validations rules will be applied.
   *
   * Policy levels can be defined on ORD Document level, but also be overwritten on an individual package or resource level.
   *
   * A policy level MUST be a valid [Specification ID](../index.md#specification-id).
   */
  policyLevels?: string[];
  /**
   * Defines whether this ORD resource is **system instance aware**.
   * This is the case (and relevant) when the referenced resource definitions are potentially different between **system instances**.
   *
   * If this behavior applies, `systemInstanceAware` MUST be set to true.
   * An ORD aggregator that represents a system instance aware perspective MUST fetch the referenced resource definitions,
   * not just once per system type, but once per **system instance**.
   */
  systemInstanceAware?: boolean;
}
/**
 * Reference to a Consumption bundle.
 *
 * This is a complex object to allow additional properties / selections to be attached.
 */
export interface ConsumptionBundleReference {
  /**
   * The consumption bundle ORD ID (`ConsumptionBundle.ordId`) this reference points to.
   */
  ordId: string;
  /**
   * In case that an API Resource has multiple entry points, this will indicate which entry point should be used by default
   * when discovering this resource from the context of the referenced Consumption Bundle.
   *
   * MUST NOT be provided for Event Resources, as they don't have entry points.
   * MUST only be provided if the resource has more than one entry point.
   * MUST be in the list of `entryPoints` of the affected resource.
   */
  defaultEntryPoint?: string;
}
/**
 * A changelog entry can be used to indicate changes.
 * Usually they lead to a change of the version number or the release status.
 */
export interface ChangelogEntry {
  /**
   * Full version number that corresponds to the `version` that is described by the changelog entry.
   *
   * Ideally it follows the [Semantic Versioning 2.0.0](https://semver.org/) standard,
   * but since it should reflect the actual version string / scheme used, this is not a mandatory requirement.
   */
  version: string;
  /**
   * The `releaseStatus` specifies the stability of the resource and its external contract.
   */
  releaseStatus: "active" | "beta" | "deprecated";
  /**
   * Date of change, without time or timezone information.
   *
   * The date format MUST comply with [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339#section-5.6).
   */
  date: string;
  /**
   * Full description, notated in [CommonMark](https://spec.commonmark.org/) (Markdown).
   *
   * The description SHOULD not be excessive in length and is not meant to provide full documentation.
   * Detailed documentation SHOULD be attached as (typed) links.
   */
  description?: string;
  /**
   * Optional [URL](https://tools.ietf.org/html/rfc3986) that links to a more detailed changelog entry.
   *
   * The link target MUST be absolute and SHOULD be openly accessible.
   */
  url?: string;
}
/**
 * Link and categorization of a machine-readable API definition.
 * For example, OpenAPI definition, OData Metadata, etc.
 */
export interface APIResourceDefinition {
  /**
   * Type of the API Resource Definition
   * If "custom" is chosen, a customType MUST be provided
   */
  type: (
    | string
    | "openapi-v2"
    | "openapi-v3"
    | "raml-v1"
    | "edmx"
    | "csdl-json"
    | "graphql-sdl"
    | "wsdl-v1"
    | "wsdl-v2"
    | "sap-rfc-metadata-v1"
    | "sap-sql-api-definition-v1"
    | "sap-csn-interop-effective-v1"
    | "custom"
  ) &
    string;
  /**
   * If the fixed `type` enum values need to be extended, an arbitrary `customType` can be provided.
   *
   * MUST be a valid [Specification ID](../index.md#specification-id).
   *
   * MUST only be provided if `type` is set to `custom`.
   */
  customType?: string;
  /**
   * The [Media Type](https://www.iana.org/assignments/media-types/media-types.xhtml) of the definition serialization format.
   * A consuming application can use this information to know which file format parser it needs to use.
   * For example, for OpenAPI 3, it's valid to express the same definition in both YAML and JSON.
   *
   * If no Media Type is registered for the referenced file,
   * `text/plain` MAY be used for arbitrary plain-text and `application/octet-stream` for arbitrary binary data.
   *
   */
  mediaType: "application/json" | "application/xml" | "text/yaml" | "text/plain" | "application/octet-stream";
  /**
   * [URL reference](https://tools.ietf.org/html/rfc3986#section-4.1) (URL or relative reference) to the resource definition file.
   *
   * It is RECOMMENDED to provide a relative URL (to base URL).
   */
  url: string;
  /**
   * List of supported access strategies for retrieving metadata from the ORD provider.
   * An ORD Consumer/ORD Aggregator MAY choose any of the strategies.
   *
   * The access strategies only apply to the metadata access and not the actual API access.
   * The actual access to the APIs for clients is described via Consumption Bundles.
   *
   * If this property is not provided, the definition URL will be available through the same access strategy as this ORD document.
   * It is RECOMMENDED anyway that the attached metadata definitions are available with the same access strategies, to simplify the aggregator crawling process.
   *
   * @minItems 1
   */
  accessStrategies?: [AccessStrategy, ...AccessStrategy[]];
}
/**
 * Defines the [access strategy](../../spec-extensions/access-strategies/) for accessing the resource definitions.
 */
export interface AccessStrategy {
  /**
   * Defines the authentication/authorization strategy through which the referenced `resourceDefinitions` are accessible.
   */
  type: (
    | string
    | "open"
    | "sap:oauth-client-credentials:v1"
    | "sap:cmp-mtls:v1"
    | "sap.businesshub:basic-auth:v1"
    | "custom"
  ) &
    string;
  /**
   * If the fixed `type` enum values need to be extended, an arbitrary `customType` can be provided.
   *
   * MUST be a valid [Specification ID](../index.md#specification-id).
   *
   * MUST only be provided if `type` is set to `custom`.
   */
  customType?: string;
  /**
   * Human-readable description about how the access is set up, notated in [CommonMark](https://spec.commonmark.org/) (Markdown).
   *
   * MUST only be provided if `type` is set to `custom`.
   */
  customDescription?: string;
}
/**
 * An API or Event resource may optionally define its `entityTypeMappings`.
 * This is used to map and correlate the API models to the underlying, conceptual **entity types**.
 *
 * If the mapping from API resource to entity types is not defined,
 * certain use-cases that rely on this explicit connection will not be possible.
 *
 * This mapping is meant to be rather fine granular.
 * Therefore, the mapping needs to be done on basis of one of the referenced resource definitions,
 * as only there we know the details and the actual contents of the API Model of the API resource.
 *
 * For the various resource definition formats the selection of API models may need to be expressed differently.
 * As a consequence, there are different types of selectors that are specialized toward certain resource definition formats.
 *
 * The target of the mapping is a correlation to an entity type via a [Correlation ID](../../#/v1/README?id=correlation-id)
 * or to an [ORD ID](../../spec-v1/#ord-id) of an entity type.
 * It is assumed that the entity types are described in more detail or on a different abstraction level via metadata.
 * When the correlation ID is used, an ORD consumer may need to know how to access the entity type metadata through conventions.
 * This can be determined either by the namespace of the correlation ID,
 * or through a defined and known `implementationStandard` that can resolve the `localId` fragment of the correlation ID .
 *
 * At SAP, the metadata about entity types could be retrieved via the CSN_EXPOSURE service.
 * To indicate this, the service needs to be implemented and described in ORD with `implementationStandard` set to `sap:csn-exposure:v1`).
 *
 * ODM 2.0 relies on the entity type mappings and uses the the mapping to express the relationship of an API to the
 * corresponding ODM entity. ORD consumers like SAP Business Accelerator Hub consume the mapping to make the relationships navigate-able for customers.
 */
export interface EntityTypeMapping {
  /**
   * List of selectors for API models within an API Resource.
   * If multiple selectors are given, every selected API model maps to the entity type target(s).
   * If omitted, the complete API resource will be mapped to the `entityTypeTargets` (less specific).
   *
   * Multiple selectors can be useful, e.g. with a CRUD REST API, to combine the similar API models.
   *
   * Depending on the chosen API protocol and the available resource definition formats,
   * different kind of selectors need to be used.
   */
  apiModelSelectors?: (APIModelSelectorOData | APIModelSelectorJSONPointer)[];
  /**
   * List of entity types the ORD resource maps to.
   * If `apiModelSelectors` are given, the mapping is more precise by also pointing to the specific model in the API.
   *
   * If multiple entity types are defined as the mapping target,
   * all of them can be at least partially mapped to the source API model(s).
   *
   * Entity types can be referenced using either using an [ORD ID](../../spec-v1/#ord-id) or a [Correlation ID](../../spec-v1/#correlation-id).
   *
   * @minItems 1
   */
  entityTypeTargets: [
    EntityTypeTargetORDID | EntityTypeTargetCorrelationID,
    ...(EntityTypeTargetORDID | EntityTypeTargetCorrelationID)[]
  ];
}
/**
 * API Model Selector for OData, using entity set names for the selection.
 *
 * MUST only be used if the API Resource provides an API Resource Definition of type `edmx`.
 */
export interface APIModelSelectorOData {
  /**
   * The type for OData selectors is fixed to `odata`.
   */
  type: "odata";
  /**
   * OData entity set name.
   *
   * As defined in the EDMX, e.g. `<EntitySet Name="AttachmentContent">`.
   */
  entitySetName: string;
}
/**
 * Generic API Model Selector for JSON / YAML based resource definitions.
 * It uses a [JSON Pointer](https://datatracker.ietf.org/doc/html/rfc6901) that points to the
 * entity type description within the resource definition.
 *
 * The JSON Pointer always to refer to the structure of the document as originally provided, before further post-processing like resolving $ref properties.
 *
 * MUST only be used if the API Resource provides an API Resource Definition of media type `application/json` or `text/yaml`.
 */
export interface APIModelSelectorJSONPointer {
  /**
   * The type for generic JSON Pointer selectors is fixed to `json-pointer`.
   */
  type: "json-pointer";
  /**
   * JSON Pointer to the entity type schema / description within the resource definition format.
   *
   * MUST be a valid JSON Pointer according to [RFC6901](https://datatracker.ietf.org/doc/html/rfc6901).
   *
   * The JSON pointers MUST point to each instance of the mapped entity type in the resource definition file, BEFORE `$ref` JSON Schema References are resolved (dereferenced).
   */
  jsonPointer: string;
}
/**
 * Define which entity type is the target of an entity type mapping
 *
 * Entity types can be referenced using a [ORD ID](../../spec-v1/#ord-id) of an entity type.
 */
export interface EntityTypeTargetORDID {
  /**
   * The ORD ID is a stable, globally unique ID for ORD resources or taxonomy.
   *
   * It MUST be a valid [ORD ID](../index.md#ord-id) of the appropriate ORD type.
   */
  ordId: string;
}
/**
 * Define which entity type is the target of an entity type mapping
 *
 * Entity types can be referenced using a [Correlation ID](../../spec-v1/#correlation-id).
 */
export interface EntityTypeTargetCorrelationID {
  correlationId: string;
}
/**
 * Defines which Entity Type is exposed through  (via its ORD ID).
 */
export interface ExposedEntityType {
  /**
   * The ORD ID is a stable, globally unique ID for ORD resources or taxonomy.
   *
   * It MUST be a valid [ORD ID](../index.md#ord-id) of the appropriate ORD type.
   */
  ordId: string;
}
/**
 * Links with specific semantic meaning that are related to API or event resources.
 *
 * If a generic [Link](#link) can also be expressed via an API / Event Resource Link, the latter MUST be chosen.
 */
export interface APIAndEventResourceLink {
  /**
   * See also: [WADG0001 WebAPI type extension](https://webapi-discovery.github.io/rfcs/rfc0001.html#webapiactions)
   */
  type: (
    | string
    | "api-documentation"
    | "authentication"
    | "client-registration"
    | "console"
    | "payment"
    | "service-level-agreement"
    | "support"
    | "custom"
  ) &
    string;
  /**
   * If the fixed `type` enum values need to be extended, an arbitrary `customType` can be provided.
   *
   * MUST be a valid [Specification ID](../index.md#specification-id).
   *
   * MUST only be provided if `type` is set to `custom`.
   */
  customType?: string;
  /**
   * [URL reference](https://tools.ietf.org/html/rfc3986#section-4.1) (URL or relative reference) to the API or Event Resource Link.
   *
   * The link target SHOULD be absolute and SHOULD be openly accessible.
   * If a relative link is given, it is relative to the [`describedSystemInstance.baseUrl`](#system-instance_baseurl).
   */
  url: string;
}
/**
 * Link that can be attached to packages or Open Resource Discovery resources.
 *
 */
export interface Link {
  /**
   * Human readable title of the link.
   *
   * MUST be unique within the collection of links provided.
   */
  title: string;
  /**
   * [URL](https://tools.ietf.org/html/rfc3986) of the link.
   *
   * The link target MUST be absolute and SHOULD be openly accessible.
   */
  url: string;
  /**
   * Full description, notated in [CommonMark](https://spec.commonmark.org/) (Markdown)
   */
  description?: string;
  [k: string]: any | undefined;
}
/**
 * Contains information about the extensibility of this resource.
 *
 * If applicable, a description and further resources about extending this resource are provided.
 */
export interface Extensible {
  /**
   * This property defines whether the resource is extensible.
   *
   * **Not extensible** means that the data model of the resource (i.e. API or event) cannot be extended with custom fields.
   * **Manually extensible** means that in addition to defining a custom field, manual activities to include the field in the data model of the resource (i.e. API or event) are required. E.g. using a specific mapping tool or by selecting the resource in the data model extension tool.
   * **Automatically extensible** means that after defining a custom field in the local domain model, the resource (i.e. API or event) is automatically extended as part of the default extension field definition.
   */
  supported: "no" | "manual" | "automatic";
  /**
   * A description about the extensibility capabilities of this API, notated in [CommonMark](https://spec.commonmark.org/) (Markdown).
   *
   * This description may contain detailed steps on how to extend the API.
   * Links to external resources can be provided within the description as markdown links.
   *
   * This description MUST be provided if `supported` is set to `manual` or `automatic`.
   */
  description?: string;
}
/**
 * The event resource provides a high-level description of a collection of related Events. More detailed information, such as the event resource definitions, are provided in links in the table below.
 * Which events are considered "related" is up to the implementer. A common practice is to bundle events that are based on the same resource/Business Object. It is also an option to bundle all available events into a single event resource/event catalog.
 * Please note that event resources can be described, but still be [`disabled`](#event-resource_disabled).
 * If the event resource is not created or owned by the user / customer of the system or by partners / third parties, it MUST be assigned to dedicated [Packages](#package) that state this the ownership via the `vendor` property.
 */
export interface EventResource {
  /**
   * The ORD ID is a stable, globally unique ID for ORD resources or taxonomy.
   *
   * It MUST be a valid [ORD ID](../index.md#ord-id) of the appropriate ORD type.
   */
  ordId: string;
  /**
   * The locally unique ID under which this resource can be looked up / resolved in the described system itself.
   * Unlike the ORD ID it's not globally unique, but it may be useful to document the original ID / technical name.
   *
   * It MAY also be used as the `<resourceName>` fragment in the ORD ID, IF it can fulfill the charset and length limitations within the ORD ID.
   * But since this is not always possible, no assumptions MUST be made about the local ID being the same as the `<resourceName>` fragment in the ORD ID.
   */
  localId?: string;
  /**
   * Correlation IDs can be used to create a reference to related data in other repositories (especially to the system of record).
   *
   * They express an "identity" / "equals" / "mappable" relationship to the target ID.
   *
   * If a "part of" relationship needs to be expressed, use the `partOfGroups` assignment instead.
   *
   * MUST be a valid [Correlation ID](../index.md#correlation-id).
   */
  correlationIds?: string[];
  /**
   * Human-readable title.
   *
   * MUST NOT exceed 255 chars.
   * MUST NOT contain line breaks.
   */
  title: string;
  /**
   * Plain text short description.
   *
   * MUST NOT exceed 255 chars.
   * MUST NOT contain line breaks.
   */
  shortDescription: string;
  /**
   * Full description, notated in [CommonMark](https://spec.commonmark.org/) (Markdown).
   *
   * The description SHOULD not be excessive in length and is not meant to provide full documentation.
   * Detailed documentation SHOULD be attached as (typed) links.
   */
  description: string;
  /**
   * Defines which Package the resource is part of.
   *
   * MUST be a valid reference to a [Package](#package) ORD ID.
   *
   * Every resource MUST be part of one package.
   */
  partOfPackage: string;
  /**
   * Defines which groups the resource is assigned to.
   *
   * The property is optional, but if given the value MUST be an array of valid Group IDs.
   *
   * Groups are a lightweight custom taxonomy concept.
   * They express a "part of" relationship to the chosen group concept.
   * If an "identity / equals" relationship needs to be expressed, use the `correlationIds` instead.
   *
   * All resources that share the same group ID assignment are effectively grouped together.
   */
  partOfGroups?: string[];
  /**
   * List of references to the consumption bundles in this resource belongs to.
   *
   * MUST be a valid reference to a [Consumption Bundle](#consumption-bundle) ORD ID.
   *
   * An API resource SHOULD be associated to one or multiple consumption bundles, if it is of direction `inbound` or `mixed`.
   * Some ORD consumer use cases MAY depend on an association to a consumption bundle.
   * If none is given, the resource may not appear as it's unknown how it can be consumed.
   *
   * If a resource has no direct incoming consumption characteristics:
   * - MUST NOT assign consumption bundle to API or Event resources with `direction`: `outbound` (no inbound consumption)
   * - MUST NOT assign consumption bundle if resource is not accessible directly, but only via intermediaries like event brokers or gateways.
   *   - In this case the intermediary SHOULD describe the consumption bundle instead (potentially also re-describing the resources as well).
   */
  partOfConsumptionBundles?: ConsumptionBundleReference[];
  /**
   * References the default consumption bundle to use for this resource.
   *
   * MUST be a valid reference to a [Consumption Bundle](#consumption-bundle) ORD ID.
   *
   * Can be used by clients to make a deterministic and preferred choice when multiple options are available.
   *
   * The value MUST be an existing option in the corresponding `partOfConsumptionBundles` array.
   */
  defaultConsumptionBundle?: string;
  /**
   * List of products the resources of the package are a part of.
   *
   * MUST be a valid reference to a [Product](#product) ORD ID.
   *
   * `partOfProducts` that are assigned to a `Package` are inherited to all of the ORD resources it contains.
   *
   * @minItems 0
   */
  partOfProducts?: string[];
  /**
   * The complete [SemVer](https://semver.org/) version string.
   *
   * It MUST follow the [Semantic Versioning 2.0.0](https://semver.org/) standard.
   * It SHOULD be changed if the ORD information or referenced resource definitions changed.
   * It SHOULD express minor and patch changes that don't lead to incompatible changes.
   *
   * When the `version` major version changes, the [ORD ID](../index.md#ord-id) `<majorVersion>` fragment MUST be updated to be identical.
   * In case that a resource definition file also contains a version number (e.g. [OpenAPI `info`.`version`](https://swagger.io/specification/#info-object)), it MUST be equal with the resource `version` to avoid inconsistencies.
   *
   * If the resource has been extended by the user, the change MUST be indicated via `lastUpdate`.
   * The `version` MUST not be bumped for changes in extensions.
   *
   * The general [Version and Lifecycle](../index.md#version-and-lifecycle) flow MUST be followed.
   *
   * Note: A change is only relevant for a version increment, if it affects the ORD resource or ORD taxonomy directly.
   * For example: If a resource within a `Package` changes, but the package itself did not, the package version does not need to be incremented.
   */
  version: string;
  /**
   * Optional, but RECOMMENDED indicator when (date-time) the last change to the resource (including its definitions) happened.
   *
   * The date format MUST comply with [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339#section-5.6).
   *
   * When retrieved from an ORD aggregator, `lastUpdate` will be reliable there and reflect either the provider based update time or the aggregator processing time.
   * Therefore consumers MAY rely on it to detect changes to the metadata and the attached resource definition files.
   *
   * If the resource has attached definitions, either the `version` or `lastUpdate` property MUST be defined and updated to let the ORD aggregator know that they need to be fetched again.
   *
   * Together with `systemInstanceAware`, this property SHOULD be used to optimize the metadata crawling process of the ORD aggregators.
   */
  lastUpdate?: string;
  /**
   * The visibility states who is allowed to "see" the described resource or capability.
   */
  visibility: "public" | "internal" | "private";
  /**
   * The `releaseStatus` specifies the stability of the resource and its external contract.
   */
  releaseStatus: "active" | "beta" | "deprecated";
  /**
   * Indicates that this resource is currently not available for consumption at runtime, but could be configured to be so.
   * This can happen either because it has not been setup for use or disabled by an admin / user.
   *
   * If the resource is not available in principle for a particular system instance, e.g. due to lack of entitlement, it MUST not be described in the system-instance aware perspective.
   *
   * This property can only reflect the knowledge of the described system instance itself.
   * Outside factors for availability can't need to be considered (e.g. network connectivity, middlewares).
   *
   * A disabled resource MAY skip describing its resource definitions.
   *
   */
  disabled?: boolean;
  /**
   * The resource has been introduced in the given [system version](../index.md#def-system-version).
   * This implies that the resource is only available if the system instance is of at least that system version.
   */
  minSystemVersion?: string;
  /**
   * The deprecation date defines when the resource has been set as deprecated.
   * This is not to be confused with the `sunsetDate` which defines when the resource will be actually decommissioned / removed.
   *
   * If the `releaseStatus` is set to `deprecated`, the `deprecationDate` SHOULD be provided.
   *
   * The date format MUST comply with [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339#section-5.6).
   */
  deprecationDate?: string;
  /**
   * The sunset date defines when the resource is scheduled to be decommissioned/removed.
   *
   * If the `releaseStatus` is set to `deprecated`, the `sunsetDate` SHOULD be provided (if already known).
   * Once the sunset date is known and ready to be communicated externally, it MUST be provided here.
   *
   * The date format MUST comply with [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339#section-5.6).
   */
  sunsetDate?: string;
  /**
   * The successor resource(s).
   *
   * MUST be a valid reference to an ORD ID.
   *
   * If the `releaseStatus` is set to `deprecated`, `successors` MUST be provided if one exists.
   * If `successors` is given, the described resource SHOULD set its `releaseStatus` to `deprecated`.
   */
  successors?: string[];
  /**
   * Contains changelog entries that summarize changes with special regards to version and releaseStatus
   */
  changelogEntries?: ChangelogEntry[];
  /**
   * List of available machine-readable definitions, which describe the resource or capability in detail.
   *
   * Each definition is to be understood as an alternative description format, describing the same resource / capability.
   * As a consequence the same definition type MUST NOT be provided more than once.
   *
   * It is RECOMMENDED to provide the definitions as they enable machine-readable use cases.
   * If the definitions are added or changed, the `version` MUST be incremented.
   * An ORD aggregator MAY only (re)fetch the definitions again when the `version` was incremented.
   */
  resourceDefinitions?: EventResourceDefinition[];
  /**
   * Declares this EventResource to be a valid implementation of a standardized or shared contract.
   *
   * All implementations of the same implementation standard MAY be treated the same by a consumer.
   * However, there MAY be differences in the access strategy, and compatible customizations by the implementer.
   * The implementation standard MAY define the role of the implementor (producer, consumer, both) and how it is determined.
   *
   * As of now, only custom implementation standards are supported.
   */
  implementationStandard?: (string | "custom") & string;
  /**
   * If the fixed `implementationStandard` values need to be extended, an arbitrary `customImplementationStandard` can be provided.
   *
   * MUST be a valid [Specification ID](../index.md#specification-id).
   *
   * MUST only be provided if `implementationStandard` is set to `custom`.
   */
  customImplementationStandard?: string;
  /**
   * Full description of the custom implementation standard, notated in [CommonMark](https://spec.commonmark.org/) (Markdown).
   *
   * MUST only be provided if `implementationStandard` is set to `custom`.
   *
   * SHOULD contain documentation and links that describe the used standard.
   */
  customImplementationStandardDescription?: string;
  /**
   * Declares this event resource is a compatible implementation of the referenced contract.
   * This is also sometimes known as [Service Provider Interface](https://en.wikipedia.org/wiki/Service_provider_interface).
   *
   * MUST be a valid reference to an (usually external) [Event Resource](#event-resource) ORD ID.
   *
   * All event resources that share the same `compatibleWith` value MAY be treated the same or similar by a consumer client.
   */
  compatibleWith?: string[];
  /**
   * Contains typically the organization that is responsible in the sense of RACI matrix for this ORD resource. This includes support and feature requests. It is maintained as correlation id to for example support components.
   */
  responsible?: string;
  /**
   * Describes mappings between the API Models of the described resource to the underlying, conceptual entity types.
   */
  entityTypeMappings?: EntityTypeMapping[];
  /**
   * Optional list of [entity types](#entity-type) that are exposed by the resource.
   *
   * This replaces `entityTypeMappings`. If both is given, the `exposedEntityTypes` wins.
   *
   * MUST be a valid reference to an [EntityType](#entity-type) ORD ID.
   */
  exposedEntityTypes?: ExposedEntityType[];
  /**
   * Links with semantic meaning that are specific to event resources.
   *
   * If applicable, `eventResourceLinks` MUST be used instead of generic `links`.
   */
  eventResourceLinks?: APIAndEventResourceLink[];
  /**
   * Generic Links with arbitrary meaning and content.
   */
  links?: Link[];
  extensible?: Extensible;
  /**
   * List of countries that the package resources are applicable to.
   *
   * MUST be expressed as an array of country codes according to [IES ISO-3166 ALPHA-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2).
   *
   * `countries` that are assigned to a `Package` are inherited to all of the ORD resources it contains.
   */
  countries?: string[];
  /**
   * List of line of business tags.
   * No special characters are allowed except `-`, `_`, `.`, `/` and ` `.
   *
   * `lineOfBusiness` that are assigned to a `Package` are inherited to all of the ORD resources it contains.
   */
  lineOfBusiness?: ((
    | string
    | "Asset Management"
    | "Commerce"
    | "Finance"
    | "Human Resources"
    | "Manufacturing"
    | "Marketing"
    | "R&D Engineering"
    | "Sales"
    | "Service"
    | "Sourcing and Procurement"
    | "Supply Chain"
    | "Sustainability"
    | "Metering"
    | "Grid Operations and Maintenance"
    | "Plant Operations and Maintenance"
    | "Maintenance and Engineering"
  ) &
    string)[];
  /**
   * List of industry tags.
   * No special characters are allowed except `-`, `_`, `.`, `/` and ` `.
   *
   * `industry` that are assigned to a `Package` are inherited to all of the ORD resources it contains.
   */
  industry?: ((
    | string
    | "Aerospace and Defense"
    | "Automotive"
    | "Banking"
    | "Chemicals"
    | "Consumer Products"
    | "Defense and Security"
    | "Engineering Construction and Operations"
    | "Healthcare"
    | "Higher Education and Research"
    | "High Tech"
    | "Industrial Machinery and Components"
    | "Insurance"
    | "Life Sciences"
    | "Media"
    | "Mill Products"
    | "Mining"
    | "Oil and Gas"
    | "Professional Services"
    | "Public Sector"
    | "Retail"
    | "Sports and Entertainment"
    | "Telecommunications"
    | "Travel and Transportation"
    | "Utilities"
    | "Wholesale Distribution"
  ) &
    string)[];
  /**
   * List of free text style tags.
   * No special characters are allowed except `-`, `_`, `.`, `/` and ` `.
   *
   * Tags that are assigned to a `Package` are inherited to all of the ORD resources it contains.
   */
  tags?: string[];
  labels?: Labels;
  documentationLabels?: DocumentationLabels;
  /**
   * The [policy level](../../spec-extensions/policy-levels/) (aka. compliance level) that the described resources need to be compliant with.
   * Depending on the chosen policy level, additional expectations and validations rules will be applied.
   *
   * The policy level can be defined on ORD Document level, but also be overwritten on an individual package or resource level.
   *
   */
  policyLevel?: (string | "none" | "sap:base:v1" | "sap:core:v1" | "sap:dp:v1" | "custom") & string;
  /**
   * If the fixed `policyLevel` values need to be extended, an arbitrary `customPolicyLevel` can be provided.
   * The policy level is inherited from packages to resources they contain, but can be overwritten at resource level.
   *
   * MUST only be provided if `policyLevel` is set to `custom`.
   * MUST be a valid [Specification ID](../index.md#specification-id).
   */
  customPolicyLevel?: string;
  /**
   * A list of [policy levels](../../spec-extensions/policy-levels/) that the described resources need to be compliant with.
   * For each chosen policy level, additional expectations and validations rules will be applied.
   *
   * Policy levels can be defined on ORD Document level, but also be overwritten on an individual package or resource level.
   *
   * A policy level MUST be a valid [Specification ID](../index.md#specification-id).
   */
  policyLevels?: string[];
  /**
   * Defines whether this ORD resource is **system instance aware**.
   * This is the case (and relevant) when the referenced resource definitions are potentially different between **system instances**.
   *
   * If this behavior applies, `systemInstanceAware` MUST be set to true.
   * An ORD aggregator that represents a system instance aware perspective MUST fetch the referenced resource definitions,
   * not just once per system type, but once per **system instance**.
   */
  systemInstanceAware?: boolean;
}
/**
 * Link and categorization of a machine-readable API definition.
 * For example, AsyncAPI or OpenAPI with callbacks, etc.
 */
export interface EventResourceDefinition {
  /**
   * Type of the event resource definition
   */
  type: (string | "asyncapi-v2" | "sap-csn-interop-effective-v1" | "custom") & string;
  /**
   * If the fixed `type` enum values need to be extended, an arbitrary `customType` can be provided.
   *
   * MUST be a valid [Specification ID](../index.md#specification-id).
   *
   * MUST only be provided if `type` is set to `custom`.
   */
  customType?: string;
  /**
   * The [Media Type](https://www.iana.org/assignments/media-types/media-types.xhtml) of the definition serialization format.
   * A consuming application can use this information to know which file format parser it needs to use.
   * For example, for OpenAPI 3, it's valid to express the same definition in both YAML and JSON.
   *
   * If no Media Type is registered for the referenced file,
   * `text/plain` MAY be used for arbitrary plain-text and `application/octet-stream` for arbitrary binary data.
   *
   */
  mediaType: "application/json" | "application/xml" | "text/yaml" | "text/plain" | "application/octet-stream";
  /**
   * [URL reference](https://tools.ietf.org/html/rfc3986#section-4.1) (URL or relative reference) to the resource definition file.
   *
   * It is RECOMMENDED to provide a relative URL (to base URL).
   */
  url: string;
  /**
   * List of supported access strategies for retrieving metadata from the ORD provider.
   * An ORD Consumer/ORD Aggregator MAY choose any of the strategies.
   *
   * The access strategies only apply to the metadata access and not the actual API access.
   * The actual access to the APIs for clients is described via Consumption Bundles.
   *
   * If this property is not provided, the definition URL will be available through the same access strategy as this ORD document.
   * It is RECOMMENDED anyway that the attached metadata definitions are available with the same access strategies, to simplify the aggregator crawling process.
   *
   * @minItems 1
   */
  accessStrategies?: [AccessStrategy, ...AccessStrategy[]];
}
/**
 * An [**Entity Type**](../concepts/grouping-and-bundling#entity-type) describes either a business concept / term or an underlying conceptual model.
 * The same entity type can be exposed through one or multiple API and events resources.
 *
 * To learn more about the concept, see [Entity Type](../concepts/grouping-and-bundling#entity-type).
 */
export interface EntityType {
  /**
   * The ORD ID is a stable, globally unique ID for ORD resources or taxonomy.
   *
   * It MUST be a valid [ORD ID](../index.md#ord-id) of the appropriate ORD type.
   */
  ordId: string;
  /**
   * The locally unique ID under which this resource can be looked up / resolved in the described system itself.
   * Unlike the ORD ID it's not globally unique, but it may be useful to document the original ID / technical name.
   *
   * It MAY also be used as the `<resourceName>` fragment in the ORD ID, IF it can fulfill the charset and length limitations within the ORD ID.
   * But since this is not always possible, no assumptions MUST be made about the local ID being the same as the `<resourceName>` fragment in the ORD ID.
   */
  localId: string;
  /**
   * Correlation IDs can be used to create a reference to related data in other repositories (especially to the system of record).
   *
   * They express an "identity" / "equals" / "mappable" relationship to the target ID.
   *
   * If a "part of" relationship needs to be expressed, use the `partOfGroups` assignment instead.
   *
   * MUST be a valid [Correlation ID](../index.md#correlation-id).
   */
  correlationIds?: string[];
  /**
   * Human-readable title.
   *
   * MUST NOT exceed 255 chars.
   * MUST NOT contain line breaks.
   */
  title: string;
  /**
   * Plain text short description.
   *
   * MUST NOT exceed 255 chars.
   * MUST NOT contain line breaks.
   */
  shortDescription?: string;
  /**
   * Full description, notated in [CommonMark](https://spec.commonmark.org/) (Markdown).
   *
   * The description SHOULD not be excessive in length and is not meant to provide full documentation.
   * Detailed documentation SHOULD be attached as (typed) links.
   */
  description?: string;
  /**
   * Defines which Package the resource is part of.
   *
   * MUST be a valid reference to a [Package](#package) ORD ID.
   *
   * Every resource MUST be part of one package.
   */
  partOfPackage: string;
  /**
   * Defines which groups the resource is assigned to.
   *
   * The property is optional, but if given the value MUST be an array of valid Group IDs.
   *
   * Groups are a lightweight custom taxonomy concept.
   * They express a "part of" relationship to the chosen group concept.
   * If an "identity / equals" relationship needs to be expressed, use the `correlationIds` instead.
   *
   * All resources that share the same group ID assignment are effectively grouped together.
   */
  partOfGroups?: string[];
  /**
   * List of products the resources of the package are a part of.
   *
   * MUST be a valid reference to a [Product](#product) ORD ID.
   *
   * `partOfProducts` that are assigned to a `Package` are inherited to all of the ORD resources it contains.
   *
   * @minItems 0
   */
  partOfProducts?: string[];
  /**
   * The complete [SemVer](https://semver.org/) version string.
   *
   * It MUST follow the [Semantic Versioning 2.0.0](https://semver.org/) standard.
   * It SHOULD be changed if the ORD information or referenced resource definitions changed.
   * It SHOULD express minor and patch changes that don't lead to incompatible changes.
   *
   * When the `version` major version changes, the [ORD ID](../index.md#ord-id) `<majorVersion>` fragment MUST be updated to be identical.
   * In case that a resource definition file also contains a version number (e.g. [OpenAPI `info`.`version`](https://swagger.io/specification/#info-object)), it MUST be equal with the resource `version` to avoid inconsistencies.
   *
   * If the resource has been extended by the user, the change MUST be indicated via `lastUpdate`.
   * The `version` MUST not be bumped for changes in extensions.
   *
   * The general [Version and Lifecycle](../index.md#version-and-lifecycle) flow MUST be followed.
   *
   * Note: A change is only relevant for a version increment, if it affects the ORD resource or ORD taxonomy directly.
   * For example: If a resource within a `Package` changes, but the package itself did not, the package version does not need to be incremented.
   */
  version: string;
  /**
   * Optional, but RECOMMENDED indicator when (date-time) the last change to the resource (including its definitions) happened.
   *
   * The date format MUST comply with [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339#section-5.6).
   *
   * When retrieved from an ORD aggregator, `lastUpdate` will be reliable there and reflect either the provider based update time or the aggregator processing time.
   * Therefore consumers MAY rely on it to detect changes to the metadata and the attached resource definition files.
   *
   * If the resource has attached definitions, either the `version` or `lastUpdate` property MUST be defined and updated to let the ORD aggregator know that they need to be fetched again.
   *
   * Together with `systemInstanceAware`, this property SHOULD be used to optimize the metadata crawling process of the ORD aggregators.
   */
  lastUpdate?: string;
  /**
   * The visibility states who is allowed to "see" the described resource or capability.
   */
  visibility: "public" | "internal" | "private";
  /**
   * The `releaseStatus` specifies the stability of the resource and its external contract.
   */
  releaseStatus: "active" | "beta" | "deprecated";
  /**
   * The deprecation date defines when the resource has been set as deprecated.
   * This is not to be confused with the `sunsetDate` which defines when the resource will be actually decommissioned / removed.
   *
   * If the `releaseStatus` is set to `deprecated`, the `deprecationDate` SHOULD be provided.
   *
   * The date format MUST comply with [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339#section-5.6).
   */
  deprecationDate?: string;
  /**
   * The sunset date defines when the resource is scheduled to be decommissioned/removed.
   *
   * If the `releaseStatus` is set to `deprecated`, the `sunsetDate` SHOULD be provided (if already known).
   * Once the sunset date is known and ready to be communicated externally, it MUST be provided here.
   *
   * The date format MUST comply with [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339#section-5.6).
   */
  sunsetDate?: string;
  /**
   * The successor resource(s).
   *
   * MUST be a valid reference to an ORD ID.
   *
   * If the `releaseStatus` is set to `deprecated`, `successors` MUST be provided if one exists.
   * If `successors` is given, the described resource SHOULD set its `releaseStatus` to `deprecated`.
   */
  successors?: string[];
  /**
   * Contains changelog entries that summarize changes with special regards to version and releaseStatus
   */
  changelogEntries?: ChangelogEntry[];
  /**
   * Defining the abstraction level of the entity type using the DDD terminology.
   *
   * In Domain-Driven Design, there is a concept of entities and aggregates.
   * There are root entities which may contain further sub entities by composition.
   * The complete "package" is then called an aggregate, which gets its name and identity from the root entity.
   * An aggregate is a cluster of domain objects that can be treated as a single unit.
   * The root is the entity that is referenced from outside the aggregate. There must be only one root per aggregate.
   * The root ensures the integrity of the aggregate. A sub entity is any other non-root entity in the aggregate.
   *
   * Source, see [Martin Fowler on DDD Aggregate](https://martinfowler.com/bliki/DDD_Aggregate.html)
   */
  level: "aggregate" | "root-entity" | "sub-entity";
  /**
   * States that this Entity Type is related to another Entity Type.
   *
   * Usually this happens if there are similar conceptual entity types across different namespaces.
   */
  relatedEntityTypes?: RelatedEntityType[];
  /**
   * Generic Links with arbitrary meaning and content.
   */
  links?: Link[];
  extensible?: Extensible;
  /**
   * List of free text style tags.
   * No special characters are allowed except `-`, `_`, `.`, `/` and ` `.
   *
   * Tags that are assigned to a `Package` are inherited to all of the ORD resources it contains.
   */
  tags?: string[];
  labels?: Labels;
  documentationLabels?: DocumentationLabels;
  /**
   * The [policy level](../../spec-extensions/policy-levels/) (aka. compliance level) that the described resources need to be compliant with.
   * Depending on the chosen policy level, additional expectations and validations rules will be applied.
   *
   * The policy level can be defined on ORD Document level, but also be overwritten on an individual package or resource level.
   *
   */
  policyLevel?: (string | "none" | "sap:base:v1" | "sap:core:v1" | "sap:dp:v1" | "custom") & string;
  /**
   * If the fixed `policyLevel` values need to be extended, an arbitrary `customPolicyLevel` can be provided.
   * The policy level is inherited from packages to resources they contain, but can be overwritten at resource level.
   *
   * MUST only be provided if `policyLevel` is set to `custom`.
   * MUST be a valid [Specification ID](../index.md#specification-id).
   */
  customPolicyLevel?: string;
  /**
   * A list of [policy levels](../../spec-extensions/policy-levels/) that the described resources need to be compliant with.
   * For each chosen policy level, additional expectations and validations rules will be applied.
   *
   * Policy levels can be defined on ORD Document level, but also be overwritten on an individual package or resource level.
   *
   * A policy level MUST be a valid [Specification ID](../index.md#specification-id).
   */
  policyLevels?: string[];
  /**
   * Defines whether this ORD resource is **system instance aware**.
   * This is the case (and relevant) when the referenced resource definitions are potentially different between **system instances**.
   *
   * If this behavior applies, `systemInstanceAware` MUST be set to true.
   * An ORD aggregator that represents a system instance aware perspective MUST fetch the referenced resource definitions,
   * not just once per system type, but once per **system instance**.
   */
  systemInstanceAware?: boolean;
}
/**
 * Defines which Entity Type is related (via its ORD ID).
 * In the future, this could include stating the relationship type, too.
 */
export interface RelatedEntityType {
  /**
   * The ORD ID is a stable, globally unique ID for ORD resources or taxonomy.
   *
   * It MUST be a valid [ORD ID](../index.md#ord-id) of the appropriate ORD type.
   */
  ordId: string;
}
/**
 * Capabilities can be used to describe use case specific capabilities, most notably supported features or additional information (like configuration) that needs to be understood from outside.
 * This is a generic ORD concept that aims to cover many different capability discovery use cases that would otherwise need be implemented as individual service provider interfaces (SPIs).
 *
 * If a capability needs to expose more information than possible with generic capability properties, a custom capability definition can be defined and referenced in ORD.
 * This is the same idea and mechanism as with API resources and their resource definition formats.
 */
export interface Capability {
  /**
   * The ORD ID is a stable, globally unique ID for ORD resources or taxonomy.
   *
   * It MUST be a valid [ORD ID](../index.md#ord-id) of the appropriate ORD type.
   */
  ordId: string;
  /**
   * The locally unique ID under which this resource can be looked up / resolved in the described system itself.
   * Unlike the ORD ID it's not globally unique, but it may be useful to document the original ID / technical name.
   *
   * It MAY also be used as the `<resourceName>` fragment in the ORD ID, IF it can fulfill the charset and length limitations within the ORD ID.
   * But since this is not always possible, no assumptions MUST be made about the local ID being the same as the `<resourceName>` fragment in the ORD ID.
   */
  localId?: string;
  /**
   * Correlation IDs can be used to create a reference to related data in other repositories (especially to the system of record).
   *
   * They express an "identity" / "equals" / "mappable" relationship to the target ID.
   *
   * If a "part of" relationship needs to be expressed, use the `partOfGroups` assignment instead.
   *
   * MUST be a valid [Correlation ID](../index.md#correlation-id).
   */
  correlationIds?: string[];
  /**
   * Type of the Capability
   */
  type: (string | "sap.mdo:mdi-capability:v1" | "custom") & string;
  /**
   * If the fixed `type` enum values need to be extended, an arbitrary `customType` can be provided.
   *
   * MUST be a valid [Specification ID](../index.md#specification-id).
   *
   * MUST only be provided if `type` is set to `custom`.
   */
  customType?: string;
  /**
   * Human-readable title.
   *
   * MUST NOT exceed 255 chars.
   * MUST NOT contain line breaks.
   */
  title: string;
  /**
   * Plain text short description.
   *
   * MUST NOT exceed 255 chars.
   * MUST NOT contain line breaks.
   */
  shortDescription?: string;
  /**
   * Full description, notated in [CommonMark](https://spec.commonmark.org/) (Markdown).
   *
   * The description SHOULD not be excessive in length and is not meant to provide full documentation.
   * Detailed documentation SHOULD be attached as (typed) links.
   */
  description?: string;
  /**
   * Defines which Package the resource is part of.
   *
   * MUST be a valid reference to a [Package](#package) ORD ID.
   *
   * Every resource MUST be part of one package.
   */
  partOfPackage: string;
  /**
   * Defines which groups the resource is assigned to.
   *
   * The property is optional, but if given the value MUST be an array of valid Group IDs.
   *
   * Groups are a lightweight custom taxonomy concept.
   * They express a "part of" relationship to the chosen group concept.
   * If an "identity / equals" relationship needs to be expressed, use the `correlationIds` instead.
   *
   * All resources that share the same group ID assignment are effectively grouped together.
   */
  partOfGroups?: string[];
  /**
   * The complete [SemVer](https://semver.org/) version string.
   *
   * It MUST follow the [Semantic Versioning 2.0.0](https://semver.org/) standard.
   * It SHOULD be changed if the ORD information or referenced resource definitions changed.
   * It SHOULD express minor and patch changes that don't lead to incompatible changes.
   *
   * When the `version` major version changes, the [ORD ID](../index.md#ord-id) `<majorVersion>` fragment MUST be updated to be identical.
   * In case that a resource definition file also contains a version number (e.g. [OpenAPI `info`.`version`](https://swagger.io/specification/#info-object)), it MUST be equal with the resource `version` to avoid inconsistencies.
   *
   * If the resource has been extended by the user, the change MUST be indicated via `lastUpdate`.
   * The `version` MUST not be bumped for changes in extensions.
   *
   * The general [Version and Lifecycle](../index.md#version-and-lifecycle) flow MUST be followed.
   *
   * Note: A change is only relevant for a version increment, if it affects the ORD resource or ORD taxonomy directly.
   * For example: If a resource within a `Package` changes, but the package itself did not, the package version does not need to be incremented.
   */
  version: string;
  /**
   * Optional, but RECOMMENDED indicator when (date-time) the last change to the resource (including its definitions) happened.
   *
   * The date format MUST comply with [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339#section-5.6).
   *
   * When retrieved from an ORD aggregator, `lastUpdate` will be reliable there and reflect either the provider based update time or the aggregator processing time.
   * Therefore consumers MAY rely on it to detect changes to the metadata and the attached resource definition files.
   *
   * If the resource has attached definitions, either the `version` or `lastUpdate` property MUST be defined and updated to let the ORD aggregator know that they need to be fetched again.
   *
   * Together with `systemInstanceAware`, this property SHOULD be used to optimize the metadata crawling process of the ORD aggregators.
   */
  lastUpdate?: string;
  /**
   * The visibility states who is allowed to "see" the described resource or capability.
   */
  visibility: "public" | "internal" | "private";
  /**
   * The `releaseStatus` specifies the stability of the resource and its external contract.
   */
  releaseStatus: "active" | "beta" | "deprecated";
  /**
   * Indicates that this resource is currently not available for consumption at runtime, but could be configured to be so.
   * This can happen either because it has not been setup for use or disabled by an admin / user.
   *
   * If the resource is not available in principle for a particular system instance, e.g. due to lack of entitlement, it MUST not be described in the system-instance aware perspective.
   *
   * This property can only reflect the knowledge of the described system instance itself.
   * Outside factors for availability can't need to be considered (e.g. network connectivity, middlewares).
   *
   * A disabled resource MAY skip describing its resource definitions.
   *
   */
  disabled?: boolean;
  /**
   * The resource has been introduced in the given [system version](../index.md#def-system-version).
   * This implies that the resource is only available if the system instance is of at least that system version.
   */
  minSystemVersion?: string;
  /**
   * Optional list of related EntityType Resources.
   * MUST be a valid reference to an [EntityType Resource](#entity-type) ORD ID.
   */
  relatedEntityTypes?: string[];
  /**
   * List of available machine-readable definitions, which describe the resource or capability in detail.
   *
   * Each definition is to be understood as an alternative description format, describing the same resource / capability.
   * As a consequence the same definition type MUST NOT be provided more than once.
   *
   * It is RECOMMENDED to provide the definitions as they enable machine-readable use cases.
   * If the definitions are added or changed, the `version` MUST be incremented.
   * An ORD aggregator MAY only (re)fetch the definitions again when the `version` was incremented.
   */
  definitions?: CapabilityDefinition[];
  /**
   * Generic Links with arbitrary meaning and content.
   */
  links?: Link[];
  /**
   * List of free text style tags.
   * No special characters are allowed except `-`, `_`, `.`, `/` and ` `.
   *
   * Tags that are assigned to a `Package` are inherited to all of the ORD resources it contains.
   */
  tags?: string[];
  labels?: Labels;
  documentationLabels?: DocumentationLabels;
  /**
   * Defines whether this ORD resource is **system instance aware**.
   * This is the case (and relevant) when the referenced resource definitions are potentially different between **system instances**.
   *
   * If this behavior applies, `systemInstanceAware` MUST be set to true.
   * An ORD aggregator that represents a system instance aware perspective MUST fetch the referenced resource definitions,
   * not just once per system type, but once per **system instance**.
   */
  systemInstanceAware?: boolean;
}
/**
 * Link and categorization of a machine-readable capability definition.
 */
export interface CapabilityDefinition {
  /**
   * Type of the capability resource definition
   */
  type: (string | "sap.mdo:mdi-capability-definition:v1" | "custom") & string;
  /**
   * If the fixed `type` enum values need to be extended, an arbitrary `customType` can be provided.
   *
   * MUST be a valid [Specification ID](../index.md#specification-id).
   *
   * MUST only be provided if `type` is set to `custom`.
   */
  customType?: string;
  /**
   * The [Media Type](https://www.iana.org/assignments/media-types/media-types.xhtml) of the definition serialization format.
   * A consuming application can use this information to know which file format parser it needs to use.
   * For example, for OpenAPI 3, it's valid to express the same definition in both YAML and JSON.
   *
   * If no Media Type is registered for the referenced file,
   * `text/plain` MAY be used for arbitrary plain-text and `application/octet-stream` for arbitrary binary data.
   *
   */
  mediaType: "application/json" | "application/xml" | "text/yaml" | "text/plain" | "application/octet-stream";
  /**
   * [URL reference](https://tools.ietf.org/html/rfc3986#section-4.1) (URL or relative reference) to the resource definition file.
   *
   * It is RECOMMENDED to provide a relative URL (to base URL).
   */
  url: string;
  /**
   * List of supported access strategies for retrieving metadata from the ORD provider.
   * An ORD Consumer/ORD Aggregator MAY choose any of the strategies.
   *
   * The access strategies only apply to the metadata access and not the actual API access.
   * The actual access to the APIs for clients is described via Consumption Bundles.
   *
   * If this property is not provided, the definition URL will be available through the same access strategy as this ORD document.
   * It is RECOMMENDED anyway that the attached metadata definitions are available with the same access strategies, to simplify the aggregator crawling process.
   *
   * @minItems 1
   */
  accessStrategies?: [AccessStrategy, ...AccessStrategy[]];
}
/**
 * A [Data Product](../concepts/data-product) is a data set exposed for consumption outside the boundaries of the producing application via APIs and described by high quality metadata that can be accessed through the [ORD Aggregator](../../spec-v1/#ord-aggregator).
 *
 * Please note that this concept is in beta, see [Data Product - Beta Status](../concepts/data-product#beta-status).
 */
export interface DataProduct {
  /**
   * The ORD ID is a stable, globally unique ID for ORD resources or taxonomy.
   *
   * It MUST be a valid [ORD ID](../index.md#ord-id) of the appropriate ORD type.
   */
  ordId: string;
  /**
   * The locally unique ID under which this resource can be looked up / resolved in the described system itself.
   * Unlike the ORD ID it's not globally unique, but it may be useful to document the original ID / technical name.
   *
   * It MAY also be used as the `<resourceName>` fragment in the ORD ID, IF it can fulfill the charset and length limitations within the ORD ID.
   * But since this is not always possible, no assumptions MUST be made about the local ID being the same as the `<resourceName>` fragment in the ORD ID.
   */
  localId?: string;
  /**
   * Correlation IDs can be used to create a reference to related data in other repositories (especially to the system of record).
   *
   * They express an "identity" / "equals" / "mappable" relationship to the target ID.
   *
   * If a "part of" relationship needs to be expressed, use the `partOfGroups` assignment instead.
   *
   * MUST be a valid [Correlation ID](../index.md#correlation-id).
   */
  correlationIds?: string[];
  /**
   * Human-readable title.
   *
   * MUST NOT exceed 255 chars.
   * MUST NOT contain line breaks.
   */
  title: string;
  /**
   * Plain text short description.
   *
   * MUST NOT exceed 255 chars.
   * MUST NOT contain line breaks.
   */
  shortDescription: string;
  /**
   * Full description, notated in [CommonMark](https://spec.commonmark.org/) (Markdown).
   *
   * The description SHOULD not be excessive in length and is not meant to provide full documentation.
   * Detailed documentation SHOULD be attached as (typed) links.
   */
  description: string;
  /**
   * Defines which Package the resource is part of.
   *
   * MUST be a valid reference to a [Package](#package) ORD ID.
   *
   * Every resource MUST be part of one package.
   */
  partOfPackage: string;
  /**
   * Defines which groups the resource is assigned to.
   *
   * The property is optional, but if given the value MUST be an array of valid Group IDs.
   *
   * Groups are a lightweight custom taxonomy concept.
   * They express a "part of" relationship to the chosen group concept.
   * If an "identity / equals" relationship needs to be expressed, use the `correlationIds` instead.
   *
   * All resources that share the same group ID assignment are effectively grouped together.
   */
  partOfGroups?: string[];
  /**
   * List of products this Data Product is a part of or is related to, its e.g. data source systems.
   *
   * MUST be a valid reference to a [Product](#product) ORD ID.
   *
   * `partOfProducts` that are assigned to a `Package` are inherited to all of the ORD resources it contains.
   *
   * @minItems 0
   */
  partOfProducts?: string[];
  /**
   * The complete [SemVer](https://semver.org/) version string.
   *
   * It MUST follow the [Semantic Versioning 2.0.0](https://semver.org/) standard.
   * It SHOULD be changed if the ORD information or referenced resource definitions changed.
   * It SHOULD express minor and patch changes that don't lead to incompatible changes.
   *
   * When the `version` major version changes, the [ORD ID](../index.md#ord-id) `<majorVersion>` fragment MUST be updated to be identical.
   * In case that a resource definition file also contains a version number (e.g. [OpenAPI `info`.`version`](https://swagger.io/specification/#info-object)), it MUST be equal with the resource `version` to avoid inconsistencies.
   *
   * If the resource has been extended by the user, the change MUST be indicated via `lastUpdate`.
   * The `version` MUST not be bumped for changes in extensions.
   *
   * The general [Version and Lifecycle](../index.md#version-and-lifecycle) flow MUST be followed.
   *
   * Note: A change is only relevant for a version increment, if it affects the ORD resource or ORD taxonomy directly.
   * For example: If a resource within a `Package` changes, but the package itself did not, the package version does not need to be incremented.
   */
  version: string;
  /**
   * Optional, but RECOMMENDED indicator when (date-time) the last change to the resource (including its definitions) happened.
   *
   * The date format MUST comply with [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339#section-5.6).
   *
   * When retrieved from an ORD aggregator, `lastUpdate` will be reliable there and reflect either the provider based update time or the aggregator processing time.
   * Therefore consumers MAY rely on it to detect changes to the metadata and the attached resource definition files.
   *
   * If the resource has attached definitions, either the `version` or `lastUpdate` property MUST be defined and updated to let the ORD aggregator know that they need to be fetched again.
   *
   * Together with `systemInstanceAware`, this property SHOULD be used to optimize the metadata crawling process of the ORD aggregators.
   */
  lastUpdate?: string;
  /**
   * The visibility/exposure of the data product. A public data product might have private APIs for trusted consumers therefore the having the property on data product
   */
  visibility: "public" | "internal" | "private";
  /**
   * The `releaseStatus` specifies the stability towards incompatible changes in the future.
   * In the context of data products, it it covers only properties on the data product level.
   * APIs that are part of the input and output ports have their own independent `releaseStatus` and `version`.
   */
  releaseStatus: "active" | "beta" | "deprecated";
  /**
   * Indicates that this resource is currently not available for consumption at runtime, but could be configured to be so.
   * This can happen either because it has not been setup for use or disabled by an admin / user.
   *
   * If the resource is not available in principle for a particular system instance, e.g. due to lack of entitlement, it MUST not be described in the system-instance aware perspective.
   *
   * This property can only reflect the knowledge of the described system instance itself.
   * Outside factors for availability can't need to be considered (e.g. network connectivity, middlewares).
   *
   * A disabled resource MAY skip describing its resource definitions.
   *
   */
  disabled?: boolean;
  /**
   * The resource has been introduced in the given [system version](../index.md#def-system-version).
   * This implies that the resource is only available if the system instance is of at least that system version.
   */
  minSystemVersion?: string;
  /**
   * Lifecycle status of the Data Product as a whole.
   *
   * MUST be provided when describing the system-instance aware (run-time) perspective.
   * SHOULD NOT be provided in static (design-time) perspective. Static aggregators MUST ignore this property.
   */
  lifecycleStatus?:
    | "inactive"
    | "provisioning"
    | "active"
    | "deprovisioning"
    | "active-with-errors"
    | "provisioning-error"
    | "deprovisioning-error";
  /**
   * The deprecation date defines when the resource has been set as deprecated.
   * This is not to be confused with the `sunsetDate` which defines when the resource will be actually decommissioned / removed.
   *
   * If the `releaseStatus` is set to `deprecated`, the `deprecationDate` SHOULD be provided.
   *
   * The date format MUST comply with [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339#section-5.6).
   */
  deprecationDate?: string;
  /**
   * The sunset date defines when the resource is scheduled to be decommissioned/removed.
   *
   * If the `releaseStatus` is set to `deprecated`, the `sunsetDate` SHOULD be provided (if already known).
   * Once the sunset date is known and ready to be communicated externally, it MUST be provided here.
   *
   * The date format MUST comply with [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339#section-5.6).
   */
  sunsetDate?: string;
  /**
   * The successor resource(s).
   *
   * MUST be a valid reference to an ORD ID.
   *
   * If the `releaseStatus` is set to `deprecated`, `successors` MUST be provided if one exists.
   * If `successors` is given, the described resource SHOULD set its `releaseStatus` to `deprecated`.
   */
  successors?: string[];
  /**
   * Contains changelog entries that summarize changes with special regards to version and releaseStatus
   */
  changelogEntries?: ChangelogEntry[];
  /**
   * Type of the data product. Based on the type some properties of a data product may become optional/mandatory.
   */
  type: "primary" | "derived";
  /**
   * Category of the data-set within data product. Based on its definition, a data product is a "data set" - which can include on the values below.
   * Based on the type some properties of a data product may become optional/mandatory.
   * Consumers might still do analytics on business object like data products.
   */
  category: (string | "business-object" | "analytical" | "other") & string;
  /**
   * Aggregated list of entity types that are at least partially exposed by the data product. Detailed mapping can be found on the output port schema level.
   */
  entityTypes?: string[];
  /**
   * The input ports of a data product indicate the data inputs for lineage purposes.
   *
   * It is a list of Integration Dependencies, whose aspects will form the actual input ports.
   *
   * Input ports can also be understood as the public interface to ingest data into the data product.
   * Data products of type `derived` consume data through the input ports. Different input ports allowing ingestion of different sub-sets building up the data-set for the data product.
   * Data products of type `base` might not have any input ports. Their data sets are typically based directly on the applications / services own data.
   *
   * @minItems 0
   */
  inputPorts?: DataProductInputPort[];
  /**
   * Output ports are the interface (APIs and Events) through which the data of the data product can be accessed.
   *
   * Output ports of the same data product might produce different facets of the data set with different qualities.
   * A data set can also be made available via different protocols, which also results in different ports.
   *
   * As long as different output ports are accessing the same model beneath, they should belong to the same data product.
   * If the above criteria cannot be reasonably met, consider splitting the data product into multiple smaller data products.
   *
   * @minItems 1
   */
  outputPorts: [DataProductOutputPort, ...DataProductOutputPort[]];
  /**
   * Contains typically the organization that is responsible in the sense of RACI matrix for this ORD resource. This includes support and feature requests. It is maintained as correlation id to for example support components.
   */
  responsible: string;
  /**
   * Links with semantic meaning that are specific to Data Product Resources.
   */
  dataProductLinks?: DataProductLink[];
  /**
   * Generic Links with arbitrary meaning and content.
   */
  links?: Link[];
  /**
   * List of industry tags.
   * No special characters are allowed except `-`, `_`, `.`, `/` and ` `.
   *
   * `industry` that are assigned to a `Package` are inherited to all of the ORD resources it contains.
   */
  industry?: ((
    | string
    | "Aerospace and Defense"
    | "Automotive"
    | "Banking"
    | "Chemicals"
    | "Consumer Products"
    | "Defense and Security"
    | "Engineering Construction and Operations"
    | "Healthcare"
    | "Higher Education and Research"
    | "High Tech"
    | "Industrial Machinery and Components"
    | "Insurance"
    | "Life Sciences"
    | "Media"
    | "Mill Products"
    | "Mining"
    | "Oil and Gas"
    | "Professional Services"
    | "Public Sector"
    | "Retail"
    | "Sports and Entertainment"
    | "Telecommunications"
    | "Travel and Transportation"
    | "Utilities"
    | "Wholesale Distribution"
  ) &
    string)[];
  /**
   * List of line of business tags.
   * No special characters are allowed except `-`, `_`, `.`, `/` and ` `.
   *
   * `lineOfBusiness` that are assigned to a `Package` are inherited to all of the ORD resources it contains.
   */
  lineOfBusiness?: ((
    | string
    | "Asset Management"
    | "Commerce"
    | "Finance"
    | "Human Resources"
    | "Manufacturing"
    | "Marketing"
    | "R&D Engineering"
    | "Sales"
    | "Service"
    | "Sourcing and Procurement"
    | "Supply Chain"
    | "Sustainability"
    | "Metering"
    | "Grid Operations and Maintenance"
    | "Plant Operations and Maintenance"
    | "Maintenance and Engineering"
  ) &
    string)[];
  /**
   * List of countries that the package resources are applicable to.
   *
   * MUST be expressed as an array of country codes according to [IES ISO-3166 ALPHA-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2).
   *
   * `countries` that are assigned to a `Package` are inherited to all of the ORD resources it contains.
   */
  countries?: string[];
  /**
   * List of free text style tags.
   * No special characters are allowed except `-`, `_`, `.`, `/` and ` `.
   *
   * Tags that are assigned to a `Package` are inherited to all of the ORD resources it contains.
   */
  tags?: string[];
  labels?: Labels;
  documentationLabels?: DocumentationLabels;
  /**
   * The [policy level](../../spec-extensions/policy-levels/) (aka. compliance level) that the described resources need to be compliant with.
   * Depending on the chosen policy level, additional expectations and validations rules will be applied.
   *
   * The policy level can be defined on ORD Document level, but also be overwritten on an individual package or resource level.
   *
   */
  policyLevel?: (string | "none" | "sap:base:v1" | "sap:core:v1" | "sap:dp:v1" | "custom") & string;
  /**
   * If the fixed `policyLevel` values need to be extended, an arbitrary `customPolicyLevel` can be provided.
   * The policy level is inherited from packages to resources they contain, but can be overwritten at resource level.
   *
   * MUST only be provided if `policyLevel` is set to `custom`.
   * MUST be a valid [Specification ID](../index.md#specification-id).
   */
  customPolicyLevel?: string;
  /**
   * A list of [policy levels](../../spec-extensions/policy-levels/) that the described resources need to be compliant with.
   * For each chosen policy level, additional expectations and validations rules will be applied.
   *
   * Policy levels can be defined on ORD Document level, but also be overwritten on an individual package or resource level.
   *
   * A policy level MUST be a valid [Specification ID](../index.md#specification-id).
   */
  policyLevels?: string[];
  /**
   * Defines whether this ORD resource is **system instance aware**.
   * This is the case (and relevant) when the referenced resource definitions are potentially different between **system instances**.
   *
   * If this behavior applies, `systemInstanceAware` MUST be set to true.
   * An ORD aggregator that represents a system instance aware perspective MUST fetch the referenced resource definitions,
   * not just once per system type, but once per **system instance**.
   */
  systemInstanceAware?: boolean;
}
/**
 * An input port of a data product states where it retrieves its data inputs from.
 *
 * It is described as via an ORD Integration Dependency.
 */
export interface DataProductInputPort {
  /**
   * The ORD ID is a stable, globally unique ID for ORD resources or taxonomy.
   *
   * It MUST be a valid [ORD ID](../index.md#ord-id) of the appropriate ORD type.
   */
  ordId: string;
}
/**
 * A data product output port references the APIs or Events that can be used to access the data-set.
 * It MAY provide full access to the complete data set, but can also just expose a subset of it - if other output ports cover the missing parts.
 *
 * Referenced API or Event ORD resources don't need to be provided within the same ORD document.
 * If a data product is built against a specific API contract of another application or data product, this API resource should be referred to.
 * In this case the other application is responsible for the lifecycle of the API contract and will update its ORD description independently.
 */
export interface DataProductOutputPort {
  /**
   * The ORD ID is a stable, globally unique ID for ORD resources or taxonomy.
   *
   * It MUST be a valid [ORD ID](../index.md#ord-id) of the appropriate ORD type.
   */
  ordId: string;
}
/**
 * Links with specific semantic meaning that are related to Data Product resources.
 * If a generic [Link](#link) can also be expressed via Data Product Link, the latter MUST be chosen.
 */
export interface DataProductLink {
  type: (string | "payment" | "terms-of-use" | "service-level-agreement" | "support" | "custom") & string;
  /**
   * If the fixed `type` enum values need to be extended, an arbitrary `customType` can be provided.
   *
   * MUST be a valid [Specification ID](../index.md#specification-id).
   *
   * MUST only be provided if `type` is set to `custom`.
   */
  customType?: string;
  /**
   * [URL reference](https://tools.ietf.org/html/rfc3986#section-4.1) (URL or relative reference) to the Data Product Link.
   *
   * The link target SHOULD be absolute and SHOULD be openly accessible.
   * If a relative link is given, it is relative to the [`describedSystemInstance.baseUrl`](#system-instance_baseurl).
   */
  url: string;
}
/**
 * An [Integration Dependency](../concepts/integration-dependency) states that the described system (self) can integrate with external systems (integration target) to achieve an integration purpose.
 * The purpose could be to enable a certain feature or integration scenario, but it could also be a mandatory prerequisite for the described system to work.
 *
 * The integration dependency includes a list of individual **aspects** that the integration consists of.
 * Aspects are an "ingredient" for the integration scenario (and are logically combined with AND condition).
 * Each aspect can express alternatives (OR condition) on what API and event resources can be used to achieve the same outcome.
 *
 * The direction of connection establishment, data flow is not directly implied and needs to be inferred from the referenced resources.
 *
 * It is not in scope for the Integration Dependency to describe scenarios that external consumers have with the own exposed resources.
 * This would overstep the boundary of self-description.
 *
 * If an integration scenario consists of two sides integration with each other, each need to describe its own part in it as an Integration Dependency.
 * Therefore, if an integration with multiple types of systems need to be setup, this SHOULD be separated into distinct Integration Dependencies.
 *
 * An integration dependency is also not meant to describe a bigger process.
 * Instead it focuses on the technical necessaries to create an integration for one particular purpose.
 *
 * To learn more about the concept, see [Integration Dependency](../concepts/integration-dependency).
 */
export interface IntegrationDependency {
  /**
   * The ORD ID is a stable, globally unique ID for ORD resources or taxonomy.
   *
   * It MUST be a valid [ORD ID](../index.md#ord-id) of the appropriate ORD type.
   */
  ordId: string;
  /**
   * The locally unique ID under which this resource can be looked up / resolved in the described system itself.
   * Unlike the ORD ID it's not globally unique, but it may be useful to document the original ID / technical name.
   *
   * It MAY also be used as the `<resourceName>` fragment in the ORD ID, IF it can fulfill the charset and length limitations within the ORD ID.
   * But since this is not always possible, no assumptions MUST be made about the local ID being the same as the `<resourceName>` fragment in the ORD ID.
   */
  localId?: string;
  /**
   * Correlation IDs can be used to create a reference to related data in other repositories (especially to the system of record).
   *
   * They express an "identity" / "equals" / "mappable" relationship to the target ID.
   *
   * If a "part of" relationship needs to be expressed, use the `partOfGroups` assignment instead.
   *
   * MUST be a valid [Correlation ID](../index.md#correlation-id).
   */
  correlationIds?: string[];
  /**
   * Human-readable title.
   *
   * MUST NOT exceed 255 chars.
   * MUST NOT contain line breaks.
   */
  title: string;
  /**
   * Plain text short description.
   *
   * MUST NOT exceed 255 chars.
   * MUST NOT contain line breaks.
   */
  shortDescription?: string;
  /**
   * Full description, notated in [CommonMark](https://spec.commonmark.org/) (Markdown).
   *
   * The description SHOULD not be excessive in length and is not meant to provide full documentation.
   * Detailed documentation SHOULD be attached as (typed) links.
   */
  description?: string;
  /**
   * Defines which Package the resource is part of.
   *
   * MUST be a valid reference to a [Package](#package) ORD ID.
   *
   * Every resource MUST be part of one package.
   */
  partOfPackage: string;
  /**
   * Defines which groups the resource is assigned to.
   *
   * The property is optional, but if given the value MUST be an array of valid Group IDs.
   *
   * Groups are a lightweight custom taxonomy concept.
   * They express a "part of" relationship to the chosen group concept.
   * If an "identity / equals" relationship needs to be expressed, use the `correlationIds` instead.
   *
   * All resources that share the same group ID assignment are effectively grouped together.
   */
  partOfGroups?: string[];
  /**
   * The complete [SemVer](https://semver.org/) version string.
   *
   * It MUST follow the [Semantic Versioning 2.0.0](https://semver.org/) standard.
   * It SHOULD be changed if the ORD information or referenced resource definitions changed.
   * It SHOULD express minor and patch changes that don't lead to incompatible changes.
   *
   * When the `version` major version changes, the [ORD ID](../index.md#ord-id) `<majorVersion>` fragment MUST be updated to be identical.
   * In case that a resource definition file also contains a version number (e.g. [OpenAPI `info`.`version`](https://swagger.io/specification/#info-object)), it MUST be equal with the resource `version` to avoid inconsistencies.
   *
   * If the resource has been extended by the user, the change MUST be indicated via `lastUpdate`.
   * The `version` MUST not be bumped for changes in extensions.
   *
   * The general [Version and Lifecycle](../index.md#version-and-lifecycle) flow MUST be followed.
   *
   * Note: A change is only relevant for a version increment, if it affects the ORD resource or ORD taxonomy directly.
   * For example: If a resource within a `Package` changes, but the package itself did not, the package version does not need to be incremented.
   */
  version: string;
  /**
   * Optional, but RECOMMENDED indicator when (date-time) the last change to the resource (including its definitions) happened.
   *
   * The date format MUST comply with [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339#section-5.6).
   *
   * When retrieved from an ORD aggregator, `lastUpdate` will be reliable there and reflect either the provider based update time or the aggregator processing time.
   * Therefore consumers MAY rely on it to detect changes to the metadata and the attached resource definition files.
   *
   * If the resource has attached definitions, either the `version` or `lastUpdate` property MUST be defined and updated to let the ORD aggregator know that they need to be fetched again.
   *
   * Together with `systemInstanceAware`, this property SHOULD be used to optimize the metadata crawling process of the ORD aggregators.
   */
  lastUpdate?: string;
  /**
   * The visibility states who is allowed to "see" the described resource or capability.
   */
  visibility: "public" | "internal" | "private";
  /**
   * The `releaseStatus` specifies the stability of the resource and its external contract.
   */
  releaseStatus: "active" | "beta" | "deprecated";
  /**
   * The sunset date defines when the resource is scheduled to be decommissioned/removed.
   *
   * If the `releaseStatus` is set to `deprecated`, the `sunsetDate` SHOULD be provided (if already known).
   * Once the sunset date is known and ready to be communicated externally, it MUST be provided here.
   *
   * The date format MUST comply with [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339#section-5.6).
   */
  sunsetDate?: string;
  /**
   * The successor resource(s).
   *
   * MUST be a valid reference to an ORD ID.
   *
   * If the `releaseStatus` is set to `deprecated`, `successors` MUST be provided if one exists.
   * If `successors` is given, the described resource SHOULD set its `releaseStatus` to `deprecated`.
   */
  successors?: string[];
  /**
   * If true, the Integration Dependency is mandatory for the described system to function.
   */
  mandatory: boolean;
  /**
   * List of integration aspects that make up the Integration Dependency.
   *
   * Each aspect listed is a dedicated, constituent part (AND condition).
   */
  aspects?: Aspect[];
  /**
   * If an Integration Dependency conceptually belongs or related to another Integration Dependency, this can be indicated here.
   * One situation would be where two systems each have an Integration Dependency to describe a two-sided integration from each side.
   */
  relatedIntegrationDependencies?: string[];
  /**
   * Generic Links with arbitrary meaning and content.
   */
  links?: Link[];
  /**
   * List of free text style tags.
   * No special characters are allowed except `-`, `_`, `.`, `/` and ` `.
   *
   * Tags that are assigned to a `Package` are inherited to all of the ORD resources it contains.
   */
  tags?: string[];
  labels?: Labels;
  documentationLabels?: DocumentationLabels;
}
/**
 * An (integration) aspect is the constituent part that makes up an Integration Dependency.
 *
 * Each aspect can list references to resources, which could be owned and defined by the integration target or by the described system itself.
 * In case the reference links to own resources, it is implied that they are to be used by the integration target to fulfill the Integration Dependency.
 *
 * If multiple resources are given within an aspect, they are considered alternatives to each other (OR condition).
 * In case an AND condition is needed, multiple aspects need to be added to the Integration Dependency.
 */
export interface Aspect {
  /**
   * Human-readable title.
   *
   * MUST NOT exceed 255 chars.
   * MUST NOT contain line breaks.
   */
  title: string;
  /**
   * Full description, notated in [CommonMark](https://spec.commonmark.org/) (Markdown).
   *
   * The description SHOULD not be excessive in length and is not meant to provide full documentation.
   * Detailed documentation SHOULD be attached as (typed) links.
   */
  description?: string;
  /**
   * If true, the aspect is mandatory to realize the Integration Dependency it contains.
   */
  mandatory: boolean;
  /**
   * If true, the references resources can be provided by multiple system instances.
   * If not, only one integration target is supported.
   */
  supportMultipleProviders?: boolean;
  /**
   * List of API Resource Dependencies.
   */
  apiResources?: APIResourceIntegrationAspect[];
  /**
   * List of Event Resource Dependencies.
   */
  eventResources?: EventResourceIntegrationAspect[];
}
/**
 * API resource related integration aspect
 */
export interface APIResourceIntegrationAspect {
  /**
   * The ORD ID is a stable, globally unique ID for ORD resources or taxonomy.
   *
   * It MUST be a valid [ORD ID](../index.md#ord-id) of the appropriate ORD type.
   */
  ordId: string;
  /**
   * Minimum version of the references resource that the integration requires.
   *
   */
  minVersion?: string;
}
/**
 * Event resource related integration aspect
 */
export interface EventResourceIntegrationAspect {
  /**
   * The ORD ID is a stable, globally unique ID for ORD resources or taxonomy.
   *
   * It MUST be a valid [ORD ID](../index.md#ord-id) of the appropriate ORD type.
   */
  ordId: string;
  /**
   * Minimum version of the references resource that the integration requires.
   *
   */
  minVersion?: string;
  /**
   * List of individual events or messages that are sufficient to achieve the aspect.
   */
  subset?: EventResourceIntegrationAspectSubset[];
  /**
   * In case that the event subscriptions are limited to known [system types](../index.md#def-system-type), they can be listed here as [system namespaces](../index.md#system-namespace).
   *
   * If given, only system types of the defined namespaces are supported as integration partners.
   * If not given, there is no restriction which system type provides the events.
   *
   * @minItems 1
   */
  systemTypeRestriction?: [string, ...string[]];
}
/**
 * Defines that Event Resource Integration Aspect only requires a subset of the referenced contract.
 *
 * For events, this could be a list of the events that need to be subscribed in order to make the integration work.
 * This information helps to narrow down what is really necessary and can help optimize the integration, e.g. by only publishing the events that are really needed.
 */
export interface EventResourceIntegrationAspectSubset {
  /**
   * The type ID of the individual event or message.
   *
   * This MUST be an ID that is understood by the used protocol and resource definition format.
   * E.g. for CloudEvents, the [type](https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md#type) can be used.
   */
  eventType: string;
}
/**
 * The vendor of a product or a package, usually a corporation or a customer / user.
 *
 * The vendor of a `Package` is the owner or creator of the content of the package.
 * The vendor of a `Product` is the owner of the product.
 *
 * If the resources are created by the customer / user of the described system, `customer:vendor:Customer:` MUST be used as vendor.
 *
 * Both have already a [vendor namespace](../index.md#vendor-namespace) within their ORD ID.
 * The `Vendor` entity is giving more details on the vendor namespace.
 * For one vendor namespace there MUST only be exactly one `Vendor` ORD entity describing it.
 *
 * For example: The only correct value for a SAP vendor reference is `sap:vendor:SAP:`.
 */
export interface Vendor {
  /**
   * The ORD ID is a stable, globally unique ID for ORD resources or taxonomy.
   *
   * It MUST be a valid [ORD ID](../index.md#ord-id) of the appropriate ORD type.
   */
  ordId: string;
  /**
   * Human-readable title.
   *
   * MUST NOT exceed 255 chars.
   * MUST NOT contain line breaks.
   */
  title: string;
  /**
   * Optional list of partner vendors, referenced through their ORD ID.
   *
   * MUST be a valid reference to a [Vendor](#vendor) ORD ID.
   *
   * This property can be used to indicate partnership relations between vendors.
   */
  partners?: string[];
  /**
   * List of free text style tags.
   * No special characters are allowed except `-`, `_`, `.`, `/` and ` `.
   *
   * Tags that are assigned to a `Package` are inherited to all of the ORD resources it contains.
   */
  tags?: string[];
  labels?: Labels;
  documentationLabels?: DocumentationLabels;
}
/**
 * A **product** in ORD is understood as a commercial product or service.
 *
 * It is a high-level entity for structuring the software portfolio from a sales / software logistics perspective.
 * While **system type** is a technical concept, **product** covers the commercial and marketing view.
 *
 * Please note that the ORD concept of a product is very simple on purpose.
 * There is no distinction between products and services and concepts like product versions, variants, etc.
 *
 * ORD assumes that this is handled by specialized systems and that ORD only provides the means to correlate to them.
 */
export interface Product {
  /**
   * The ORD ID is a stable, globally unique ID for ORD resources or taxonomy.
   *
   * It MUST be a valid [ORD ID](../index.md#ord-id) of the appropriate ORD type.
   */
  ordId: string;
  /**
   * Correlation IDs can be used to create a reference to related data in other repositories (especially to the system of record).
   *
   * They express an "identity" / "equals" / "mappable" relationship to the target ID.
   *
   * If a "part of" relationship needs to be expressed, use the `partOfGroups` assignment instead.
   *
   * MUST be a valid [Correlation ID](../index.md#correlation-id).
   */
  correlationIds?: string[];
  /**
   * Human-readable title.
   *
   * MUST NOT exceed 255 chars.
   * MUST NOT contain line breaks.
   */
  title: string;
  /**
   * Plain text short description.
   *
   * MUST NOT exceed 255 chars.
   * MUST NOT contain line breaks.
   */
  shortDescription: string;
  /**
   * Full description, notated in [CommonMark](https://spec.commonmark.org/) (Markdown).
   *
   * The description SHOULD not be excessive in length and is not meant to provide full documentation.
   * Detailed documentation SHOULD be attached as (typed) links.
   */
  description?: string;
  /**
   * Vendor / organization that is responsible for the Product.
   *
   * MUST be a valid reference to a [Vendor](#vendor) ORD ID.
   */
  vendor: string;
  /**
   * Optional product parent ORD ID, if a hierarchical product structure needs to be expressed.
   *
   * MUST be a valid reference to a [Product](#product) ORD ID.
   */
  parent?: string;
  /**
   * List of free text style tags.
   * No special characters are allowed except `-`, `_`, `.`, `/` and ` `.
   *
   * Tags that are assigned to a `Package` are inherited to all of the ORD resources it contains.
   */
  tags?: string[];
  labels?: Labels;
  documentationLabels?: DocumentationLabels;
}
/**
 * A [**Package**](../concepts/grouping-and-bundling#package) organizes a set of related resources together, by publishing and catalog presentation concerns.
 *
 * The Package can also be used to indicate which products or vendors provided the packaged resources.
 * For partner or customer content, the package can indicate this via the `vendor` and `partOfProducts` assignments.
 * In any case, the Package `ordID` namespace MUST reflect the namespace of the providing application (which hosts the resource), not the resource definition owner, which could be a customer or partner.
 *
 * A package SHOULD contain at least one resource. Avoid empty packages.
 *
 * The package assignment of a resource MAY change, so consumers MUST not rely on this to be stable.
 *
 * A package does not have a `visibility` property.
 * Whether it is displayed is decided by the fact, whether it contains any visible resources according to the visibility role of the aggregator.
 *
 * To learn more about the concept and further guidance, see [Package](../concepts/grouping-and-bundling#package).
 */
export interface Package {
  /**
   * The ORD ID is a stable, globally unique ID for ORD resources or taxonomy.
   *
   * It MUST be a valid [ORD ID](../index.md#ord-id) of the appropriate ORD type.
   */
  ordId: string;
  /**
   * The locally unique ID under which this resource can be looked up / resolved in the described system itself.
   * Unlike the ORD ID it's not globally unique, but it may be useful to document the original ID / technical name.
   *
   * It MAY also be used as the `<resourceName>` fragment in the ORD ID, IF it can fulfill the charset and length limitations within the ORD ID.
   * But since this is not always possible, no assumptions MUST be made about the local ID being the same as the `<resourceName>` fragment in the ORD ID.
   */
  localId?: string;
  /**
   * Human-readable title.
   *
   * MUST NOT exceed 255 chars.
   * MUST NOT contain line breaks.
   */
  title: string;
  /**
   * Plain text short description.
   *
   * MUST NOT exceed 255 chars.
   * MUST NOT contain line breaks.
   */
  shortDescription: string;
  /**
   * Full description, notated in [CommonMark](https://spec.commonmark.org/) (Markdown).
   *
   * The description SHOULD not be excessive in length and is not meant to provide full documentation.
   * Detailed documentation SHOULD be attached as (typed) links.
   */
  description: string;
  /**
   * The complete [SemVer](https://semver.org/) version string.
   *
   * It MUST follow the [Semantic Versioning 2.0.0](https://semver.org/) standard.
   * It SHOULD be changed if the ORD information or referenced resource definitions changed.
   * It SHOULD express minor and patch changes that don't lead to incompatible changes.
   *
   * When the `version` major version changes, the [ORD ID](../index.md#ord-id) `<majorVersion>` fragment MUST be updated to be identical.
   * In case that a resource definition file also contains a version number (e.g. [OpenAPI `info`.`version`](https://swagger.io/specification/#info-object)), it MUST be equal with the resource `version` to avoid inconsistencies.
   *
   * If the resource has been extended by the user, the change MUST be indicated via `lastUpdate`.
   * The `version` MUST not be bumped for changes in extensions.
   *
   * The general [Version and Lifecycle](../index.md#version-and-lifecycle) flow MUST be followed.
   *
   * Note: A change is only relevant for a version increment, if it affects the ORD resource or ORD taxonomy directly.
   * For example: If a resource within a `Package` changes, but the package itself did not, the package version does not need to be incremented.
   */
  version: string;
  /**
   * The [policy level](../../spec-extensions/policy-levels/) (aka. compliance level) that the described resources need to be compliant with.
   * Depending on the chosen policy level, additional expectations and validations rules will be applied.
   *
   * The policy level can be defined on ORD Document level, but also be overwritten on an individual package or resource level.
   *
   */
  policyLevel?: (string | "none" | "sap:base:v1" | "sap:core:v1" | "sap:dp:v1" | "custom") & string;
  /**
   * If the fixed `policyLevel` values need to be extended, an arbitrary `customPolicyLevel` can be provided.
   * The policy level is inherited from packages to resources they contain, but can be overwritten at resource level.
   *
   * MUST only be provided if `policyLevel` is set to `custom`.
   * MUST be a valid [Specification ID](../index.md#specification-id).
   */
  customPolicyLevel?: string;
  /**
   * A list of [policy levels](../../spec-extensions/policy-levels/) that the described resources need to be compliant with.
   * For each chosen policy level, additional expectations and validations rules will be applied.
   *
   * Policy levels can be defined on ORD Document level, but also be overwritten on an individual package or resource level.
   *
   * A policy level MUST be a valid [Specification ID](../index.md#specification-id).
   */
  policyLevels?: string[];
  /**
   * Links with semantic meaning that are specific to packages.
   */
  packageLinks?: PackageLink[];
  /**
   * Generic links with arbitrary meaning and content.
   *
   * `packageLinks` MUST be preferred if applicable.
   */
  links?: Link[];
  /**
   * Standardized identifier for the license.
   * It MUST conform to the [SPDX License List](https://spdx.org/licenses).
   */
  licenseType?: string;
  /**
   * Optional information that should be provided when creating a support ticket for the resources bundled in this package.
   * This can for example be a "component" name that needs to be chosen in the support portal.
   *
   * Notated in [CommonMark](https://spec.commonmark.org/) (Markdown).
   *
   * Please also note that if you want to provide link(s) where you can find support information,
   * you can use `packageLinks` with a link of type `support`.
   */
  supportInfo?: string;
  /**
   * Vendor / organization that is the creator (or responsible party) of the resources that are part of the `Package`.
   *
   * MUST be a valid reference to a [Vendor](#vendor) ORD ID.
   *
   * MUST be set to `customer:vendor:Customer:` if the contents of the package are created by the customer / user.
   *
   * MUST be set to a registered partner vendor, if the contents of the package are created by a partner / third party.
   */
  vendor: string;
  /**
   * List of products the resources of the package are a part of.
   *
   * MUST be a valid reference to a [Product](#product) ORD ID.
   *
   * `partOfProducts` that are assigned to a `Package` are inherited to all of the ORD resources it contains.
   *
   * @minItems 0
   */
  partOfProducts?: string[];
  /**
   * List of countries that the package resources are applicable to.
   *
   * MUST be expressed as an array of country codes according to [IES ISO-3166 ALPHA-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2).
   *
   * `countries` that are assigned to a `Package` are inherited to all of the ORD resources it contains.
   */
  countries?: string[];
  /**
   * List of line of business tags.
   * No special characters are allowed except `-`, `_`, `.`, `/` and ` `.
   *
   * `lineOfBusiness` that are assigned to a `Package` are inherited to all of the ORD resources it contains.
   */
  lineOfBusiness?: ((
    | string
    | "Asset Management"
    | "Commerce"
    | "Finance"
    | "Human Resources"
    | "Manufacturing"
    | "Marketing"
    | "R&D Engineering"
    | "Sales"
    | "Service"
    | "Sourcing and Procurement"
    | "Supply Chain"
    | "Sustainability"
    | "Metering"
    | "Grid Operations and Maintenance"
    | "Plant Operations and Maintenance"
    | "Maintenance and Engineering"
  ) &
    string)[];
  /**
   * List of industry tags.
   * No special characters are allowed except `-`, `_`, `.`, `/` and ` `.
   *
   * `industry` that are assigned to a `Package` are inherited to all of the ORD resources it contains.
   */
  industry?: ((
    | string
    | "Aerospace and Defense"
    | "Automotive"
    | "Banking"
    | "Chemicals"
    | "Consumer Products"
    | "Defense and Security"
    | "Engineering Construction and Operations"
    | "Healthcare"
    | "Higher Education and Research"
    | "High Tech"
    | "Industrial Machinery and Components"
    | "Insurance"
    | "Life Sciences"
    | "Media"
    | "Mill Products"
    | "Mining"
    | "Oil and Gas"
    | "Professional Services"
    | "Public Sector"
    | "Retail"
    | "Sports and Entertainment"
    | "Telecommunications"
    | "Travel and Transportation"
    | "Utilities"
    | "Wholesale Distribution"
  ) &
    string)[];
  /**
   * If provided, all resources that are part of this package can only run on the listed runtime.
   *
   * MUST be a valid [system namespace](../index.md#system-namespace).
   */
  runtimeRestriction?: string;
  /**
   * List of free text style tags.
   * No special characters are allowed except `-`, `_`, `.`, `/` and ` `.
   *
   * Tags that are assigned to a `Package` are inherited to all of the ORD resources it contains.
   */
  tags?: string[];
  labels?: Labels;
  documentationLabels?: DocumentationLabels;
}
/**
 * Links with specific semantic meaning that are related to `Package`.
 *
 * If a generic [Link](#link) can also be expressed via a Package Link, the latter MUST be chosen.
 */
export interface PackageLink {
  type: (
    | string
    | "terms-of-service"
    | "license"
    | "client-registration"
    | "payment"
    | "sandbox"
    | "service-level-agreement"
    | "support"
    | "custom"
  ) &
    string;
  /**
   * If the fixed `type` enum values need to be extended, an arbitrary `customType` can be provided.
   *
   * MUST be a valid [Specification ID](../index.md#specification-id).
   *
   * MUST only be provided if `type` is set to `custom`.
   */
  customType?: string;
  /**
   * [URL](https://tools.ietf.org/html/rfc3986) to the PackageLink.
   *
   * The link target MUST be absolute and SHOULD be openly accessible.
   */
  url: string;
  [k: string]: any | undefined;
}
/**
 * A [**Consumption Bundle**](../concepts/grouping-and-bundling#consumption-bundle) groups APIs and Events together that can be consumed with the credentials and auth mechanism.
 * Ideally it also includes instructions and details how to request access and credentials for resources.
 *
 * For more documentation and guidance how to correctly this correctly, see [Consumption Bundle details](../concepts/grouping-and-bundling#consumption-bundle).
 *
 * A consumption bundle SHOULD have at least one association with a resource (0..n). Avoid empty consumption bundles.
 * A consumption bundle MUST NOT contain APIs and Events that are NOT defined in the ORD document(s) returned
 * by the system instance that defines the consumption bundle.
 *
 * Please note that some ORD consumer use cases MAY depend on consumption bundle assignments to work with the resources.
 *
 * To learn more about the concept, see [Consumption Bundle](../concepts/grouping-and-bundling#consumption-bundle).
 */
export interface ConsumptionBundle {
  /**
   * The ORD ID is a stable, globally unique ID for ORD resources or taxonomy.
   *
   * It MUST be a valid [ORD ID](../index.md#ord-id) of the appropriate ORD type.
   */
  ordId: string;
  /**
   * The locally unique ID under which this resource can be looked up / resolved in the described system itself.
   * Unlike the ORD ID it's not globally unique, but it may be useful to document the original ID / technical name.
   *
   * It MAY also be used as the `<resourceName>` fragment in the ORD ID, IF it can fulfill the charset and length limitations within the ORD ID.
   * But since this is not always possible, no assumptions MUST be made about the local ID being the same as the `<resourceName>` fragment in the ORD ID.
   */
  localId?: string;
  /**
   * Correlation IDs can be used to create a reference to related data in other repositories (especially to the system of record).
   *
   * They express an "identity" / "equals" / "mappable" relationship to the target ID.
   *
   * If a "part of" relationship needs to be expressed, use the `partOfGroups` assignment instead.
   *
   * MUST be a valid [Correlation ID](../index.md#correlation-id).
   */
  correlationIds?: string[];
  /**
   * Human-readable title.
   *
   * MUST NOT exceed 255 chars.
   * MUST NOT contain line breaks.
   */
  title: string;
  /**
   * Plain text short description.
   *
   * MUST NOT exceed 255 chars.
   * MUST NOT contain line breaks.
   */
  shortDescription?: string;
  /**
   * Full description, notated in [CommonMark](https://spec.commonmark.org/) (Markdown).
   *
   * The description SHOULD not be excessive in length and is not meant to provide full documentation.
   * Detailed documentation SHOULD be attached as (typed) links.
   */
  description?: string;
  /**
   * The complete [SemVer](https://semver.org/) version string.
   *
   * It MUST follow the [Semantic Versioning 2.0.0](https://semver.org/) standard.
   * It SHOULD be changed if the ORD information or referenced resource definitions changed.
   * It SHOULD express minor and patch changes that don't lead to incompatible changes.
   *
   * When the `version` major version changes, the [ORD ID](../index.md#ord-id) `<majorVersion>` fragment MUST be updated to be identical.
   * In case that a resource definition file also contains a version number (e.g. [OpenAPI `info`.`version`](https://swagger.io/specification/#info-object)), it MUST be equal with the resource `version` to avoid inconsistencies.
   *
   * If the resource has been extended by the user, the change MUST be indicated via `lastUpdate`.
   * The `version` MUST not be bumped for changes in extensions.
   *
   * The general [Version and Lifecycle](../index.md#version-and-lifecycle) flow MUST be followed.
   *
   * Note: A change is only relevant for a version increment, if it affects the ORD resource or ORD taxonomy directly.
   * For example: If a resource within a `Package` changes, but the package itself did not, the package version does not need to be incremented.
   */
  version?: string;
  /**
   * Optional, but RECOMMENDED indicator when (date-time) the last change to the resource (including its definitions) happened.
   *
   * The date format MUST comply with [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339#section-5.6).
   *
   * When retrieved from an ORD aggregator, `lastUpdate` will be reliable there and reflect either the provider based update time or the aggregator processing time.
   * Therefore consumers MAY rely on it to detect changes to the metadata and the attached resource definition files.
   *
   * If the resource has attached definitions, either the `version` or `lastUpdate` property MUST be defined and updated to let the ORD aggregator know that they need to be fetched again.
   *
   * Together with `systemInstanceAware`, this property SHOULD be used to optimize the metadata crawling process of the ORD aggregators.
   */
  lastUpdate?: string;
  /**
   * The visibility states who is allowed to "see" the described resource or capability.
   */
  visibility?: "public" | "internal" | "private";
  /**
   * Defines the supported strategies for how the consumption credentials can be exchanged.
   *
   * Ideally, the system type supports a strategy that can automate the exchange.
   */
  credentialExchangeStrategies?: CredentialExchangeStrategy[];
  /**
   * Generic links with arbitrary meaning and content.
   */
  links?: Link[];
  /**
   * List of free text style tags.
   * No special characters are allowed except `-`, `_`, `.`, `/` and ` `.
   *
   * Tags that are assigned to a `Package` are inherited to all of the ORD resources it contains.
   */
  tags?: string[];
  labels?: Labels;
  documentationLabels?: DocumentationLabels;
}
/**
 * The credential exchange strategy specifies how a set of credentials for a particular usage
 * of the APIs in the consumption bundle can be obtained.
 * Until a SAP-wide strategy for obtaining such credentials exists and is agreed upon,
 * both LoBs and aggregators (namely Unified Customer Landscape) can define their own strategy specifications.
 *
 * While the actual flow in term of API calls can differ between the different strategies,
 * the end goal would always be the possibility for automatically obtaining credentials for each client
 * that would like to use the APIs from a particular bundle.
 */
export interface CredentialExchangeStrategy {
  /**
   * The type of credential exchange strategy.
   */
  type: (string | "custom") & string;
  /**
   * If the fixed `type` enum values need to be extended, an arbitrary `customType` can be provided.
   *
   * MUST be a valid [Specification ID](../index.md#specification-id).
   *
   * MUST only be provided if `type` is set to `custom`.
   */
  customType?: string;
  /**
   * Human-readable description about how the credential exchange is achieved, notated in [CommonMark](https://spec.commonmark.org/) (Markdown).
   *
   * MUST only be provided if `type` is set to `custom`.
   */
  customDescription?: string;
  /**
   * [URL reference](https://tools.ietf.org/html/rfc3986#section-4.1) (URL or relative reference) to the credential exchange callback endpoint.
   *
   * This allows requesting a set of credentials that can be used for consuming all the APIs and Events that are part of the bundle.
   *
   * The interface contract/protocol is dependent and defined by the chosen `type`.
   *
   * Whenever a client wants to consume a resource within a particular bundle, this endpoint can be called to obtain the credentials that this client can use.
   *
   * The returned credentials MUST be valid for all resources that are part of the respective bundle.
   * The endpoint SHOULD return a different set of credentials on each invocation.
   */
  callbackUrl?: string;
}
/**
 * Group (instance) that resources can be assigned to.
 *
 * Groups are a lightweight custom taxonomy concept.
 * They express a "part of" relationship to the chosen group concept.
 * If an "identity / equals" relationship needs to be expressed, use the `correlationIds` instead.
 *
 * To learn more about the concept, see [Group Concept Documentation](../concepts/grouping-and-bundling#Groups).
 */
export interface Group {
  /**
   * The Group ID consists of two [Concept IDs](../../spec-v1/#concept-id) separated by a `:`.
   *
   * The first two fragments MUST be equal to the used Group Type ID (`groupTypeId`).
   * The last two fragments MUST be a valid [Concept ID](../../spec-v1/#concept-id), indicating the group instance assignment.
   *
   * The ID concept is a bit unusual, but it ensures globally unique and conflict free group assignments.
   */
  groupId: string;
  /**
   * Group Type ID.
   *
   * MUST match with the first two fragments of the own `groupId`.
   */
  groupTypeId: string;
  /**
   * Human readable title of the group assignment (for UI).
   */
  title: string;
  /**
   * Full description, notated in [CommonMark](https://spec.commonmark.org/) (Markdown).
   *
   * The description SHOULD not be excessive in length and is not meant to provide full documentation.
   * Detailed documentation SHOULD be attached as (typed) links.
   */
  description?: string;
  [k: string]: any | undefined;
}
/**
 * A Group Type defines the semantics of [group assignments](#group).
 * What the Group Type means and how it is to be used correctly SHOULD be described in the `description` (which may include markdown links).
 *
 * Group Types can be defined centrally (ownership by authority namespace) or decentrally (defined by application / service itself).
 *
 * To learn more about the concept, see [Group Concept Documentation](../concepts/grouping-and-bundling#Groups).
 */
export interface GroupType {
  /**
   * GroupType ID, which MUST be a valid [Concept ID](../../spec-v1/#concept-id).
   */
  groupTypeId: string;
  /**
   * Human readable title of the group type.
   */
  title: string;
  /**
   * Full description, notated in [CommonMark](https://spec.commonmark.org/) (Markdown).
   *
   * The description SHOULD not be excessive in length and is not meant to provide full documentation.
   * Detailed documentation SHOULD be attached as (typed) links.
   */
  description?: string;
  [k: string]: any | undefined;
}
/**
 * A tombstone indicates that a previously published ORD resource or taxonomy has been removed / decommissioned.
 * This MUST be indicated explicitly, so ORD aggregators and consumers can learn about the removal.
 *
 * Exactly one of the IDs MUST be provided to state which ORD resource or taxonomy item the Tombstone addresses.
 *
 * It MUST be kept sufficiently long so that all ORD aggregators can learn about the tombstone.
 * After that it MAY be removed.
 */
export interface Tombstone {
  /**
   * [ORD ID](../index.md#ord-id) of the ORD resource/taxonomy that has been removed.
   */
  ordId?: string;
  /**
   * Group ID of the group that has been removed.
   */
  groupId?: string;
  /**
   * Group Type ID of the group type that has been removed.
   */
  groupTypeId?: string;
  /**
   * The date when the ORD resource/taxonomy was removed.
   * This is related to the `sunsetDate` that can be set to announce a resource as deprecated *before* the removal and setting of a tombstone.
   *
   * The date format MUST comply with [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339#section-5.6).
   */
  removalDate: string;
  /**
   * Optional description, notated in [CommonMark](https://spec.commonmark.org/) (Markdown).
   *
   * The description of a Tombstone MAY be added to the changelog of the removed resource by an ORD aggregator.
   */
  description?: string;
  [k: string]: any | undefined;
}
