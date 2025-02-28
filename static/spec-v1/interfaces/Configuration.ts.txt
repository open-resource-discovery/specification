// AUTO-GENERATED definition files. Do not modify directly.

/**
 * The ORD configuration response will indicate that ORD is available for the given host and how to proceed with the discovery.
 *
 * Most notably, the ORD configuration will tell an ORD consumer which ORD documents are available and where/how they can be accessed.
 *
 * The configuration endpoint is a [Well-Known URI](https://tools.ietf.org/html/rfc8615#section-3) discovery mechanism.
 */
export interface ORDConfiguration {
  /**
   * Optional URL to the ORD document schema (defined as JSON Schema).
   * If given, this enables code intelligence and validation in supported editors (like VSCode) and tools.
   */
  $schema?: (
    | string
    | "https://open-resource-discovery.github.io/specification/spec-v1/interfaces/Configuration.schema.json#"
  ) &
    string;
  /**
   * Optional [base URL](../index.md#def-base-url) that can be used to resolve the relative URLs to the ORD Documents.
   *
   * The `baseUrl` MUST not contain a leading slash.
   *
   * If you do not provide this property, the base URL is assumed to be the URL of the config endpoint without `/.well-known/open-resource-discovery` suffix.
   * This implies that either a `baseUrl` or only absolute URLs MUST be provided when no standardized well-known URI is used.
   * If both a `baseUrl` and a well-known URI is provided, the explicit `baseUrl` takes precedence.
   */
  baseUrl?: string;
  openResourceDiscoveryV1: ORDV1Support;
}
/**
 * The existence of this version indicates that Open Resource Discovery is supported in Version 1.x
 */
export interface ORDV1Support {
  /**
   * List of all ORD documents that can be retrieved.
   *
   * While it is possible to describe everything in one big ORD document, for bigger services/use cases it might be preferable to split the information into multiple documents.
   *
   * For more details how to implement this correctly, please refer to the [ORD configuration endpoint](../index.md#ord-configuration-endpoint) section and the [considerations on the granularity of ORD documents](../index.md#considerations-on-the-granularity-of-ord-documents).
   */
  documents?: ORDV1DocumentDescription[];
}
/**
 * Describes an [ORD Document](../index.md#ord-document) that is available for pull transport consumption.
 */
export interface ORDV1DocumentDescription {
  /**
   * URL or relative URL to the ORD document (provided by an ORD document endpoint).
   *
   * It is RECOMMENDED to provide a relative URL (to `baseUrl`).
   * If a `baseUrl` is given, the relative URLs will be resolved with it.
   *
   * If the URL is not relative to the system providing this information or no well-known URI is used,
   * either the baseUrl or a full URL to the document MUST be provided.
   */
  url: string;
  /**
   * Whether the information in the ORD document is **system instance aware**.
   *
   * This is the case when the provided ORD document potentially differs between **system instances**.
   * Please note that if a system does not support multi-tenancy, most likely each system instance has its own
   * URL and different system instances could even be deployed in a different state (version).
   * If those conditions apply, `systemInstanceAware` MUST be set to true.
   *
   * An ORD aggregator that represents a system instance aware perspective MUST fetch a system instance aware ORD document,
   * not just once per system type but once per **system instance**.
   *
   * Please note that you can define system instance awareness also on the level of an ORD resource.
   * It is even possible and valid to have an ORD document that is NOT system instance aware to contain resources that are.
   * This can be the case because the resource is described in separate resource definition formats which would change,
   * while the ORD document itself would not change (the links to the resource definition files stay the same).
   *
   * If some ORD information is **system instance aware** and some is not,
   * we RECOMMEND to split the information into separate documents and mark their system instance awareness accordingly.
   */
  systemInstanceAware?: boolean;
  /**
   * List of supported access strategies for retrieving the metadata from the ORD provider.
   *
   * An ORD Consumer/ORD Aggregator MAY freely choose any of the listed strategies.
   *
   * @minItems 1
   */
  accessStrategies: [AccessStrategy, ...AccessStrategy[]];
}
/**
 * Defines the [access strategy](../../spec-extensions/access-strategies/) for accessing the ORD documents from the ORD provider.
 */
export interface AccessStrategy {
  /**
   * Defines the authentication/authorization strategy through which the referenced ORD Documents can be accessed.
   */
  type: "open" | "sap:oauth-client-credentials:v1" | "sap:cmp-mtls:v1" | "sap.businesshub:basic-auth:v1" | "custom";
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
