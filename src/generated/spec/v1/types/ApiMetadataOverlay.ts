// AUTO-GENERATED definition files. Do not modify directly.

/**
 * Describes a metadata overlay for API resources.
 */
export interface APIMetadataOverlay {
  /**
   * Optional [URL](https://tools.ietf.org/html/rfc3986) to the API Metadata Overlay schema (defined as a JSON Schema).
   * If provided, this enables code intelligence and validation in supported editors (like VSCode) and tools.
   */
  $schema?: (string | "https://open-resource-discovery.org/spec-extension/models/ApiMetadataOverlay.schema.json#") &
    string;
  /**
   * Version of the API Metadata Overlay specification.
   */
  apiMetadataOverlay: "1.0";
  [k: string]: unknown | undefined;
}
