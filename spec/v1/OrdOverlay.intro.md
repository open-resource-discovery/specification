
:::caution[Alpha]
This specification is in **alpha** and subject to change.
:::

The **ORD Overlay** is an optional ORD model extension that allows patching referenced resource definition files
(e.g. OpenAPI, AsyncAPI, OData CSDL, MCP/A2A Agent Cards) without modifying the original source files.

```json
{
  "ordOverlay": "0.1",
  "target": { "ordId": "sap.foo:apiResource:astronomy:v1", "definitionType": "openapi-v3" },
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

## Distribution

Decision guidance for choosing a distribution mode is collected in the
[Appendix: ORD Document Resource vs. Attached Resource Definition](#deep-dive-ord-document-resource-vs-attached-resource-definition).

### Attached to an ORD Resource

Overlays can also be attached directly to an API or Event resource as a `resourceDefinitions` entry with type `ord:overlay:v1`.
This keeps the overlay co-located with the resource it patches and is convenient when the same ORD Provider owns both.

A single resource can have multiple overlays with different `purpose` values.
This allows independent concerns (e.g. AI enrichment, platform governance) to be managed by different teams
without conflicting with each other or the original definition.

Within the same aggregation scope, each overlay applied to a given resource SHOULD have a unique `purpose`.
If two overlays share the same `purpose` on the same resource, behavior is implementation-defined — consumers
SHOULD treat this as a configuration error. When a consumer applies multiple overlays to the same target,
the processing order is not defined by this specification and MUST be established by the aggregator or provider.

```json
{
  "apiResources": [{
    "ordId": "sap.foo:apiResource:astronomy:v1",
    "resourceDefinitions": [
      { "type": "openapi-v3", "url": "/ord/metadata/my-api.oas3.json", "visibility": "public" },
      { "type": "edmx", "url": "/ord/metadata/my-api.edmx.xml", "visibility": "public" },
      { "type": "ord:overlay:v1", "url": "/ord/overlays/ai-enrichment.overlay.json", "visibility": "public", "purpose": "ord:ai-enrichment" },
      { "type": "ord:overlay:v1", "url": "/ord/overlays/governance.overlay.json", "visibility": "internal", "purpose": "foo.bar:governance" }
    ]
  }]
}
```

### As an ORD Document Resource

Overlays can be described as standalone `OrdOverlayResource` entries inside an [ORD Document](../../spec-v1/index.md#ord-document).
This is the preferred approach for cross-cutting overlays that are not tightly coupled to a single resource,
or for overlays managed by a different team than the resource provider.

The ORD Overlay Resource acts as any other ORD resource: it has its own `ordId`, `version`, `releaseStatus`, and `visibility`,
and references the actual overlay file via a `definitions` entry with `type: ord:overlay:v1`.

```json
{
  "overlays": [
    {
      "ordId": "sap.foo:overlay:astronomy-api-ai-enrichment:v1",
      "title": "Astronomy API AI Enrichment Overlay",
      "version": "1.0.0",
      "releaseStatus": "active",
      "visibility": "public",
      "relatedApiResources": [
        { "ordId": "sap.foo:apiResource:astronomy:v1", "relationType": "ord:patches" }
      ],
      "definitions": [
        {
          "type": "ord:overlay:v1",
          "mediaType": "application/json",
          "url": "/ord/overlays/ai-enrichment.overlay.json",
          "purpose": "ord:ai-enrichment"
        }
      ]
    }
  ]
}
```

## Target Resolution

The optional [`target`](#overlay-target) object narrows which document the overlay applies to.
When omitted, all patches in the file are context-free and each patch's [`selector`](#overlay-selector) alone identifies the element.
Omitting `target` is only appropriate when the association between the overlay and its target definition file
is established by external convention (e.g. a pipeline that always merges a fixed overlay into a fixed file).
For all other cases, specifying `target.ordId` is strongly recommended to make patch resolution unambiguous.

Key fields on `target`:

| Field | Purpose |
|---|---|
| `ordId` | Identifies the ORD resource whose attached definition file is being patched. Used together with `url` or `definitionType` to disambiguate. |
| `url` | Direct URL to the specific metadata definition file (e.g. an OpenAPI JSON file). |
| `definitionType` | Declares the format of the file (e.g. `openapi-v3`, `a2a-agent-card`). Disambiguates when a resource has multiple definitions attached. |

Example of ambiguity: an OData API resource may expose both `edmx` and `openapi-v3` definitions.
Provide `definitionType` and/or `url` to make the concrete patch target explicit.


## Selectors

Each [patch](#overlay-patch) identifies the element to patch using exactly one [selector](#overlay-selector).
Concept-level selectors are preferred over `jsonPath` because they are resilient to structural format changes
(e.g. OpenAPI 3.0 → 3.1, OData CSDL XML → JSON).

Available selectors:
- [`root`](#overlay-selector-by-root) — document-level metadata and top-level sections
- [`operation`](#overlay-selector-by-operation) — OpenAPI, MCP, A2A, OData Actions/Functions
- [`entityType`](#overlay-selector-by-entity-type) — OData EntityTypes, CSN Interop entities
- [`complexType`](#overlay-selector-by-complex-type) — OData ComplexTypes
- [`enumType`](#overlay-selector-by-enum-type) — OData EnumTypes
- [`entitySet`](#overlay-selector-by-entity-set) — OData EntitySets
- [`namespace`](#overlay-selector-by-namespace) — OData Schema namespace
- [`propertyType`](#overlay-selector-by-property-type) — OData/CSN properties (requires `entityType`, `complexType`, or `enumType`)
- [`parameter`](#overlay-selector-by-parameter) — OData/OpenAPI parameters (requires `operation`)
- [`returnType`](#overlay-selector-by-return-type) — OData return types (requires `operation`)
- [`jsonPath`](#overlay-selector-by-jsonpath) — generic fallback for any JSON/YAML location

Use `root` for document-level merges such as OpenAPI `info`, `components`, or ORD top-level properties.

See each selector's definition for detailed format mappings and usage.

## Patch Actions

Each [patch](#overlay-patch) specifies an [`action`](#overlay-patch), a [`selector`](#overlay-selector), and a [`data`](#overlay-patch-value) value.
The full semantics of each action (`update`, `merge`, `remove`) are defined on the [`action`](#overlay-patch) field.

Key points:
- **`data` is required for `merge` and `update`**: `remove` omits `data` when the selected element should be removed entirely.
- **`remove` semantics**:
  - Omit `data` to remove the entire selected element.
  - Provide `data` with `null`-valued properties to remove only those specific fields.
  - `data` MUST NOT be `null`, an empty object `{}`, or an empty array `[]` — these are invalid and will be rejected by conformant tooling.
- **`merge` behavior**: arrays are appended, not replaced. To fully replace an array, use two ordered patches — first `remove` the array field with `data: { "arrayField": null }`, then `merge` the new value.

## Validation

Overlays assume the target document is already valid for its native format.
The merge tool does not fully re-validate target formats.
After applying an overlay, validate the merged output with the corresponding format-specific tooling.

See [Compatibility Expectations](#compatibility-expectations) for rules on what overlays may and may not change.

## Tooling

A reference implementation for merging, validating, and converting ORD Overlays is provided as a separate package.
It supports all selector types and patch actions defined in this specification, including EDMX XML targets.

The tooling package will be linked here once published.

## ORD Aggregator Expectations

An ORD Aggregator SHOULD enforce that overlay sources are permitted to patch the target metadata.
Without such enforcement, consumers could be exposed to unauthorized metadata changes through overlay processing.

An ORD Aggregator SHOULD support merging ORD Overlays into the resource definitions centrally,
so that individual consumers do not need to implement overlay processing themselves.

When an ORD Aggregator performs the merge, it SHOULD produce a new resource definition entry with the merged content.
The new entry takes over the `type` from the original resource definition,
the `visibility` from the overlay document,
and the `purpose` from the overlay's definition entry.

## Overlay Document Metadata

Note on `perspective`: unlike its use in ORD Documents (which scopes transport),
`perspective` on an overlay declares *where the patch should be applied* — at system-type, system-version, or system-instance level.
See the field description for details.

## Outlook: Patching ORD Resource Metadata Directly

A future version of the ORD Overlay specification may introduce a dedicated `ordId` selector that allows
patching ORD resource metadata itself (e.g. title, description, visibility, tags on an API Resource or Event Resource)
without requiring a separate resource definition file as the patch target.

This capability is not included in version 0.1 to limit scope and allow the overlay model to mature
on resource definition patching first. When introduced, it will enable use cases such as:

- Enriching ORD resource descriptions or documentation links centrally
- Adding classification tags or AI-related metadata at the ORD resource level
- Adjusting visibility or lifecycle metadata through overlay governance workflows
