
import { OverlayDiagram } from "@site/src/components/OrdDiagrams";

:::caution[Beta]
This specification is in **beta** and subject to change.
:::

The **ORD Overlay** is an optional ORD model extension that allows patching referenced resource definition files
(e.g. OpenAPI, AsyncAPI, OData CSDL, MCP/A2A Agent Cards) without modifying the original source files.

<OverlayDiagram />

For a guided visual walkthrough, see [ORD Overlays in the presentation](https://open-resource-discovery.github.io/presentation/ord-overlays).

The ORD Overlay concept is inspired by the [OpenAPI Initiative Overlay Specification](https://spec.openapis.org/overlay/v1.0.0.html),
which established the pattern of separating overlay content from the target definition file.
ORD Overlay adopts that core idea but is intentionally dedicated and opinionated for the ORD ecosystem:
it targets a broader set of metadata formats (not only OpenAPI), uses concept-level selectors that are resilient to
format-version differences, and integrates with ORD identifiers, `purpose`, and `visibility`.
For a detailed comparison and rationale, see
[Appendix: Relation to the OpenAPI Initiative Overlay Specification](#appendix-relation-to-the-openapi-initiative-overlay-specification).

If publishers prefer to author their overlays in the OpenAPI Initiative Overlay format directly,
they can expose them through an Overlay Resource whose `definitions` entry uses `type: oas-overlay-v1`.
See [Overlay Definition](../../spec-v1/interfaces/Document.md#overlay-definition) for details.

```json
{
  "ordOverlay": "0.1",
  "patches": [
    {
      "action": "merge",
      "selector": { "operation": "getConstellationByAbbreviation" },
      "data": {
        "summary": "Get constellation by IAU abbreviation",
        "description": "Returns full details of a constellation by its IAU abbreviation (e.g. 'Ori' for Orion). Useful for star-chart lookups and astronomy education tools."
      }
    }
  ]
}
```

## Publishing

Providers MUST publish overlays as standalone `OrdOverlayResource` entries in an
[ORD Document](../../spec-v1/index.md#ord-document), with patch files referenced through `definitions`.
This applies to every overlay, including producer-owned overlays that patch a single API or Event resource.

Attaching overlay files to API or Event `resourceDefinitions` is deprecated as of ORD 1.18.0.
The legacy `ord:overlay:v1` and `oas-overlay-v1` resource-definition types remain accepted for compatibility,
but providers MUST NOT use them for new overlay publications.
See [Overlay Publication and Migration](#deep-dive-overlay-publication-and-migration) for migration guidance.

The Overlay Resource defines one projection: its identity, lifecycle, target, visibility, and purpose.
The top-level `visibility` and `purpose` describe both the entity and its projected output.
All referenced patch files inherit the entity's visibility; definition entries cannot override visibility or purpose.

```json
{
  "overlays": [
    {
      "ordId": "sap.foo:overlay:astronomy-api-ai-enrichment:v1",
      "title": "Astronomy API AI Enrichment Overlay",
      "version": "1.0.0",
      "releaseStatus": "active",
      "visibility": "internal",
      "purpose": "ord:ai-enrichment",
      "target": {
        "ordId": "sap.foo:apiResource:astronomy:v1",
        "resourceDefinition": {
          "type": "openapi-v3",
          "mediaType": "application/json",
          "visibility": "public"
        }
      },
      "definitions": [
        {
          "type": "ord:overlay:v1",
          "mediaType": "application/json",
          "url": "/ord/overlays/ai-enrichment.overlay.json"
        },
        {
          "type": "oas-overlay-v1",
          "mediaType": "application/yaml",
          "url": "/ord/overlays/astronomy-api.overlay.yaml"
        }
      ]
    }
  ]
}
```

## Target Resolution

The required `target` belongs exclusively to the [Overlay Resource](../../spec-v1/interfaces/Document.md#overlay).
Its `ordId` selects the ORD resource whose concrete definition is patched.
The nested `resourceDefinition` identifies the input using required `type`, `mediaType`, and `visibility`.
Custom formats are identified directly by a Specification ID in `type`; `customType` is not supported.
Optional `purpose` selects a complementary input variant; omitting it selects the primary definition without a purpose.
Target visibility matches the input's effective visibility, including inheritance from its resource.
Consumers MUST resolve exactly one input definition. Zero or multiple matches MUST error.
Target visibility and purpose select the input; the entity's visibility and purpose describe the output.

Consumers resolve the target in the ORD aggregation context.
Overlay Resources MUST NOT carry `perspective`, `describedSystemType`, `describedSystemVersion`, or `describedSystemInstance`.
System context is supplied by ORD discovery and aggregation.
`relatedApiResources` and `relatedEventResources` are not supported on Overlay Resources;
the patching relationship is derived from `target.ordId`.

Patch files MUST NOT contain target, resource identity, perspective, visibility, or purpose metadata.
Native ORD Overlay files contain only `$schema` (optional), `ordOverlay`, and `patches`.
Selectors identify elements within the already selected input file.
Standalone patch-processing tools receive the input and format context from their caller.

## Definition Uniqueness and Application Order

An Overlay Resource MUST reference at least one patch file.
Each `definitions` entry MUST have a unique combination of `type` and `mediaType` within that entity.
Files may contribute different operations; they are not necessarily alternative representations of the projection.
Consumers MUST apply all files in array order, preserving the listed patch order within each file.
Each file operates on the result of the previous file. Later operations act on the already modified state.
Unsupported patch formats MUST produce an error rather than being silently skipped.

Ordering between separate Overlay Resources that affect the same input remains an aggregator or provider policy.

## Selectors

Each [patch](#overlay-patch) identifies the element to patch using exactly one [selector](#overlay-selector).
Concept-level selectors are preferred over `jsonPath` because they are resilient to structural format changes
(e.g. OpenAPI 3.0 → 3.1, OData CSDL XML → JSON).

Available selectors:
- [`root`](#overlay-selector-by-root): document-level metadata and top-level sections
- [`operation`](#overlay-selector-by-operation): OpenAPI, MCP, A2A, OData Actions/Functions
- [`entityType`](#overlay-selector-by-entity-type): OData EntityTypes, CSN Interop entities
- [`complexType`](#overlay-selector-by-complex-type): OData ComplexTypes
- [`enumType`](#overlay-selector-by-enum-type): OData EnumTypes
- [`entitySet`](#overlay-selector-by-entity-set): OData EntitySets
- [`namespace`](#overlay-selector-by-namespace): OData Schema namespace
- [`propertyType`](#overlay-selector-by-property-type): OData/CSN properties (requires `entityType`, `complexType`, or `enumType`)
- [`parameter`](#overlay-selector-by-parameter): OData/OpenAPI parameters (requires `operation`)
- [`returnType`](#overlay-selector-by-return-type): OData return types (requires `operation`)
- [`jsonPath`](#overlay-selector-by-jsonpath): generic fallback for any JSON/YAML location

Use `root` for document-level merges such as OpenAPI `info`, `components`, or ORD top-level properties.

`jsonPath` follows [RFC 9535](https://www.rfc-editor.org/rfc/rfc9535).
The [`jsonPath` selector definition](#overlay-selector-by-jsonpath) specifies the portable subset that every toolkit must support and portable overlays must use.
Toolkits may support additional features as non-portable extensions.

See each selector's definition for detailed format mappings and usage.

## Patch Actions

Each [patch](#overlay-patch) specifies an [`action`](#overlay-patch), a [`selector`](#overlay-selector), and a [`data`](#overlay-patch-value) value.
The full semantics of each action (`update`, `merge`, `remove`) are defined on the [`action`](#overlay-patch) field.

Key points:
- **`data` is required for `merge` and `update`**: `remove` omits `data` when the selected element should be removed entirely.
- **`remove` semantics**:
  - If the selector matches nothing, the action succeeds without changing the document because the requested absence already holds, and tooling should report a warning.
  - Omit `data` to remove the entire selected element.
    The document root cannot be removed: `root`, or `jsonPath: "$"`, with omitted `data` MUST error.
    Use `update` to replace the complete document explicitly.
    For EDMX, the selected structural element is preserved and its complete annotation set is removed.
  - Provide `data` with `null`-valued properties to remove only those specific fields.
    Missing fields in a matched element are ignored.
    A removal mask MAY target the document root because it preserves the document itself.
  - `data` MUST NOT be `null`, an empty object `{}`, or an empty array `[]`; conformant tooling rejects these values.
- **`merge` behavior**: arrays are appended, not replaced.
  To replace a selected array, use `update`.
  To replace an array-valued field while preserving its containing object, first `remove` the field with `data: { "arrayField": null }`, then `merge` the new value.
- **CSDL JSON concept selectors**: `merge`, `update`, and data-bearing `remove` operate on annotations while preserving structural CSDL content.
  `update` replaces the selected target's complete annotation set.
  This exception does not apply to `root` or `jsonPath`, which retain generic structural semantics.
  Structural CSDL data supplied to an OData concept-level selector is an error.
- **Selector matches**: a `merge` or `update` concept-level selector that matches nothing is an error.
  An unmatched `remove` succeeds without changing the document, which makes removal idempotent, and tooling should report a warning.
  All selectors, including the generic `jsonPath`, match only structure the target already declares; overlays do not create missing targets.
  A `jsonPath` selector may match zero or more elements.
  A zero-match `jsonPath` patch succeeds without changing the document and tooling should report a warning, regardless of the patch action.
  The patch applies to every element when `jsonPath` matches one or more.
  This is a deliberate limitation of this version because errors and warnings surface selector typos rather than silently authoring content.
  A future version may add a dedicated create action.
  See [`selector`](#overlay-selector).
- **OData targets**: overlays carry annotations in CSDL JSON `@TermName` form.
  EDMX targets are annotation-only: existing structure is annotated, new structural elements cannot be created, and `jsonPath` is unavailable for EDMX.
  OData v4 EDMX annotations use reconciled external `<Annotations Target="...">` blocks.
  Applying overlays to OData v2 EDMX is out of scope and produces an error.
  An OData v4 EDMX document may describe the model of an OData v2 API and serve as the overlay target.
  For CSDL JSON, enum-member annotations are sibling keys on the enum type.
  Updating an enum member preserves its scalar value and replaces its sibling annotations.
  Removing an enum member without `data` removes both the member and its sibling annotations.
  See [`data`](#overlay-patch-value).

## Validation

Overlays assume the target document is already valid for its native format.
Overlay tooling does not fully re-validate target formats.
After applying an overlay, validate the merged output with the corresponding format-specific tooling.
Overlay output is defined semantically, not byte-for-byte.
Tooling may change insignificant formatting, object-property order, or XML-attribute order.
Consumers MUST compare parsed content rather than serialized bytes unless a separate canonicalization profile is applied.

See [Compatibility Expectations](#compatibility-expectations) for rules on what overlays may and may not change.

## Tooling

A [patch-processing implementation](https://github.com/open-resource-discovery/overlay-tools) for merging, validating, and converting ORD Overlays is provided as a separate package.
Its integration must supply the target context from the Overlay Resource. Published tools may require updates
to support the entity-based projection model; see their respective documentation.

Additionally a [set of React components](https://github.com/open-resource-discovery/overlay-editor) for viewing Open Resource Discovery Overlay documents and a [reusable library](https://github.com/open-resource-discovery/overlay-golang) written in Go.

## ORD Aggregator Expectations

An ORD Aggregator SHOULD enforce that overlay sources are permitted to patch the target metadata.
Without such enforcement, consumers could be exposed to unauthorized metadata changes through overlay processing.

An ORD Aggregator SHOULD support merging ORD Overlays into the resource definitions centrally,
so that individual consumers do not need to implement overlay processing themselves.

When an ORD Aggregator performs the merge, it SHOULD produce a new resource definition entry with the merged content.
The new entry preserves the input definition's `type` and `mediaType`.
Its `visibility` and `purpose` MUST come from the Overlay Resource itself.
If the entity omits `purpose`, the output also has no purpose.
Aggregators MUST enforce the entity's visibility on the entity, patch files, and output, and MUST NOT
expose restricted input metadata to a broader audience without explicit authorization.

## Outlook: Patching ORD Resource Metadata Directly

A future version of the ORD Overlay specification may introduce a dedicated `ordId` selector that allows
patching ORD resource metadata itself (e.g. title, description, visibility, tags on an API Resource or Event Resource)
without requiring a separate resource definition file as the patch target.

This capability is not included in version 0.1 to limit scope and allow the overlay model to mature
on resource definition patching first. When introduced, it will enable use cases such as:

- Enriching ORD resource descriptions or documentation links centrally
- Adding classification tags or AI-related metadata at the ORD resource level
- Adjusting visibility or lifecycle metadata through overlay governance workflows
