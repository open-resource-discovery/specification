// AUTO-GENERATED definition files. Do not modify directly.

/**
 * ⚠️ ALPHA: This specification is in alpha and subject to change.
 *
 * Describes a metadata overlay for resource definitions.
 */
export interface ResourceDefinitionOverlay {
  /**
   * Optional [URL](https://tools.ietf.org/html/rfc3986) to the Resource Definition Overlay schema (defined as a JSON Schema).
   * If provided, this enables code intelligence and validation in supported editors (like VSCode) and tools.
   */
  $schema?: (
    | string
    | "https://open-resource-discovery.org/spec-extension/models/ResourceDefinitionOverlay.schema.json#"
  ) &
    string;
  /**
   * Version of the Resource Definition Overlay specification.
   */
  resourceDefinitionOverlay: "0.1";
  [k: string]: unknown | undefined;
}
