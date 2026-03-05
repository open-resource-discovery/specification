:::caution Alpha
This specification is in **alpha** and subject to change.
:::

The **ORD Overlay** is an optional ORD model extension that allows patching both ORD resource metadata
and referenced resource definition files (e.g. OpenAPI, AsyncAPI, OData CSDL, MCP/A2A Agent Cards)
without modifying the original source files.

```json
{
  "$schema": "https://open-resource-discovery.org/spec-extension/models/OrdOverlay.schema.json#",
  "ordOverlay": "0.1",
  "target": { "definitionType": "openapi-v3" },
  "patches": [
    {
      "action": "merge",
      "selector": { "operation": "getBusinessPartner" },
      "data": {
        "summary": "Retrieve a Business Partner by ID",
        "description": "Returns the full profile of a business partner including addresses, roles, and tax data.\nUsed in order-to-cash and procurement processes."
      }
    }
  ]
}
```

## Distribution

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
  "resourceDefinitions": [
    { "type": "openapi-v3", "url": "/ord/metadata/my-api.oas3.json", "accessStrategies": [{ "type": "open" }] },
    { "type": "ord:overlay:v1", "url": "/ord/overlays/my-api.overlay.json", "accessStrategies": [{ "type": "open" }] }
  ]
}
```

## Target Resolution

The optional [`target`](#overlay-target) object narrows which document the overlay applies to.
When omitted, all patches in the file are context-free and each patch's [`selector`](#selector) alone identifies the element.

Key fields on `target`:

| Field | Purpose |
|---|---|
| `ordId` | Identifies the ORD resource being patched (API, Event, Data Product, …). Selects the ORD resource metadata itself. |
| `url` | Direct URL to the specific metadata definition file (e.g. an OpenAPI JSON file). |
| `definitionType` | Declares the format of the file (e.g. `openapi-v3`, `a2a-agent-card`). Disambiguates when a resource has multiple definitions attached. |

Example of ambiguity: an OData API resource may expose both `edmx` and `openapi-v3` definitions.
Provide `definitionType` and/or `url` to make the concrete patch target explicit.

For overlays that only patch ORD metadata via [`selector.ordId`](#selector-by-ord-id), `target` may be omitted.
Multiple resources can be patched in a single file using multiple patches with different selector `ordId` values.

## Selectors

Each [patch](#patch) identifies the element to patch using exactly one [selector](#selector).
Concept-level selectors are preferred over `jsonPath` because they are resilient to structural format changes
(e.g. OpenAPI 3.0 → 3.1, OData CSDL XML → JSON).

| Selector | Level | Supported formats |
|---|---|---|
| [`ordId`](#selector-by-ord-id) | Resource | ORD resource metadata |
| [`operation`](#selector-by-operation) | Operation | OpenAPI (`openapi-v2/v3/v3.1+`), MCP (MCP Server Card), A2A Agent Card (`a2a-agent-card`) |
| [`entityType`](#selector-by-entity-type) | Entity type | OData (`edmx`, `csdl-json`) |
| [`propertyType`](#selector-by-property-type) | Property | OData (`edmx`, `csdl-json`) |
| [`jsonPath`](#selector-by-jsonpath) | Any location | Any JSON/YAML metadata file (generic fallback) |

The [`operation`](#selector-by-operation) selector maps to different identifiers depending on the format:

- **OpenAPI** → `operationId` of an HTTP operation in `paths.{path}.{method}`
- **MCP** (any [Specification ID](../../spec-v1/index.md#specification-id)) → `tools[].name`
- **A2A Agent Card** → `skills[].id`

When `definitionType` is not provided, the implementation auto-detects the format by trying OpenAPI → MCP → A2A in order.
Using the `operation` selector with a named format constant that has no operation support (e.g. `edmx`, `asyncapi-v2`) raises an error.

## Patch Actions

Each [patch](#patch) specifies an [`action`](#patch) and a [`selector`](#selector), plus an optional [`data`](#patch-value) value.
The full semantics of each action (`update`, `merge`, `append`, `remove`) are defined on the [`action`](#patch) field.

Key point for `merge`: arrays are appended, not replaced.
To fully replace an array, use two ordered patches — first `remove` the array, then `merge` the new value.

## Validation

Overlays assume the target document is already valid for its native format.
The merge tool does not fully re-validate target formats.
After applying an overlay, validate the merged output with the corresponding format-specific tooling.

## Overlay Document Metadata

Optional top-level fields scope an overlay to a specific system context:

- [`describedSystemType`](#overlay-system-type), [`describedSystemVersion`](#overlay-system-version), [`describedSystemInstance`](#overlay-system-instance) — narrow the overlay to a particular system type, version, or instance.
- [`visibility`](#visibility) — controls who can discover this overlay document (`public`, `internal`, `private`).
- `description` — human-readable Markdown description of the overlay document itself.
- `ordId` — optional stable ORD ID for this overlay, using pattern `*:overlay:*:v*`.

## Open TODOs

**Overlay `ordId`:**

- Do we need this field at all?
- If overlays are published via the configuration endpoint without direct ORD resource context, what should their stable ID be?
- Should this be mandatory or optional?

**Target resolution model:**

- Decide what should be optional vs mandatory on `target`.
- Review cleanup after discussion: some transparency-oriented fields may be dropped again.

**OData `operation` selector:**

- Best current guess: map selector `operation` to OData operation names — schema-level `Action`/`Function` (prefer fully-qualified names), or container-level `ActionImport`/`FunctionImport` when exposed via entity container.
- Needs validation with OData experts.
- See [OData CSDL XML 4.01](https://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/odata-csdl-xml-v4.01.html).
