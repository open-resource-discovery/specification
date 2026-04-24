:::caution Beta
This specification is in **beta** and subject to change.
:::

The **ORD Overlay** is an optional ORD model extension that allows patching both ORD resource metadata
and referenced resource definition files (e.g. OpenAPI, AsyncAPI, OData CSDL, MCP/A2A Agent Cards)
without modifying the original source files.

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
[Appendix: ORD Configuration vs. Attached Resource Definition](#deep-dive-ord-configuration-vs-attached-resource-definition).

### Via the ORD Configuration Endpoint

Overlays can be listed directly in the [ORD Configuration Endpoint](../../spec-v1/index.md#ord-configuration-endpoint) under `openResourceDiscoveryV1.overlays`.
This is the preferred approach for cross-cutting overlays that are not tied to a single resource, or when patching ORD resource metadata itself.

```json
{
  "openResourceDiscoveryV1": {
    "overlays": [
      { "url": "/ord/overlays/my-api.overlay.json", "accessStrategies": [{ "type": "open" }] }
    ]
  }
}
```

### Attached to an ORD Resource

Overlays can also be attached directly to an API or Event resource as a `resourceDefinitions` entry with type `ord:overlay:v1`.
This keeps the overlay co-located with the resource it patches.

```json
{
  "apiResources": [{
    "ordId": "sap.foo:apiResource:astronomy:v1",
    "resourceDefinitions": [
      { "type": "openapi-v3", "url": "/ord/metadata/my-api.oas3.json", "visibility": "public" },
      { "type": "ord:overlay:v1", "url": "/ord/overlays/my-api.overlay.json", "visibility": "internal" }
    ]
  }]
}
```

## Target Resolution

The optional [`target`](#overlay-target) object narrows which document the overlay applies to.
When omitted, all patches in the file are context-free and each patch's [`selector`](#overlay-selector) alone identifies the element.

Key fields on `target`:

| Field | Purpose |
|---|---|
| `ordId` | Identifies the ORD resource being patched (API, Event, Data Product, …). Selects the ORD resource metadata itself. |
| `url` | Direct URL to the specific metadata definition file (e.g. an OpenAPI JSON file). |
| `definitionType` | Declares the format of the file (e.g. `openapi-v3`, `a2a-agent-card`). Disambiguates when a resource has multiple definitions attached. |

Example of ambiguity: an OData API resource may expose both `edmx` and `openapi-v3` definitions.
Provide `definitionType` and/or `url` to make the concrete patch target explicit.

For overlays that only patch ORD metadata via [`selector.ordId`](#overlay-selector-by-ord-id), `target` may be omitted.
Multiple resources can be patched in a single file using multiple patches with different selector `ordId` values.

## Selectors

Each [patch](#overlay-patch) identifies the element to patch using exactly one [selector](#overlay-selector).
Concept-level selectors are preferred over `jsonPath` because they are resilient to structural format changes
(e.g. OpenAPI 3.0 → 3.1, OData CSDL XML → JSON).

Available selectors:
- [`root`](#overlay-selector-by-root) — document-level metadata and top-level sections
- [`ordId`](#overlay-selector-by-ord-id) — ORD resource metadata
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
- **`data` is always required**: All patch actions require the `data` field.
- **`remove` semantics**:
  - `data: {}` (empty object) removes the entire selected element.
  - `data` with `null`-valued properties uses JSON Merge Patch semantics to remove only those specific fields.
- **`merge` behavior**: arrays are appended, not replaced. To fully replace an array, use two ordered patches — first `remove` the array field with `data: { "arrayField": null }`, then `merge` the new value.

## Validation

Overlays assume the target document is already valid for its native format.
The merge tool does not fully re-validate target formats.
After applying an overlay, validate the merged output with the corresponding format-specific tooling.

## ORD Aggregator Expectations

An ORD Aggregator MUST apply overlays that patch ORD resource metadata when building its ORD Discovery API and related indexes.
This is necessary so that ORD-level overlay changes are reflected in discovery responses, filtering, searching, and similar aggregator behavior.

An ORD Aggregator SHOULD enforce that overlay sources are permitted to patch the target metadata.
Without such enforcement, consumers could be exposed to unauthorized metadata changes through overlay processing.

## Overlay Document Metadata

Note on `perspective`: unlike its use in ORD Documents (which scopes transport),
`perspective` on an overlay declares *where the patch should be applied* — at system-type, system-version, or system-instance level.
See the field description for details.
