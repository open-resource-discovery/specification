// AUTO-GENERATED definition files. Do not modify directly.

/**
 * ⚠️ ALPHA: This specification is in alpha and subject to change.
 *
 * Describes a metadata overlay for ORD resources.
 * Allows to enrich or annotate ORD resources with additional metadata like group assignments or labels,
 * without modifying the original ORD documents.
 * Incompatible ORD-level changes are not allowed.
 */
export interface ORDOverlay {
  /**
   * Optional [URL](https://tools.ietf.org/html/rfc3986) to the ORD Overlay schema (defined as a JSON Schema).
   * If provided, this enables code intelligence and validation in supported editors (like VSCode) and tools.
   */
  $schema?: (string | "https://open-resource-discovery.org/spec-extension/models/OrdOverlay.schema.json#") & string;
  /**
   * Version of the ORD Overlay specification.
   */
  ordOverlay: "0.1";
  [k: string]: unknown | undefined;
}
