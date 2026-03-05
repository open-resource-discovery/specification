:::caution Alpha
This specification is in **alpha** and subject to change.
:::

The **ORD Overlay** is an optional ORD model extension that allows patching both ORD resource metadata
and referenced resource definition files (e.g. OpenAPI, AsyncAPI, OData CSDL, MCP/A2A Agent Cards)
without modifying the original source files.

## Distribution

Overlays can be distributed in two ways:

1. **Via the [ORD Configuration Endpoint](../../spec-v1/index.md#ord-configuration-endpoint)** — published independently of any single resource; suitable for cross-cutting overlays that also patch ORD resource metadata itself.
2. **Attached to an API or Event resource** — registered as a `resourceDefinitions` entry with type `ord:overlay:v1` on the resource it belongs to.

See [Referencing from ORD Documents](#referencing-from-ord-documents) below for a code example.

## Target Resolution

The optional [`target`](#overlaytarget) object narrows which document the overlay applies to.
When omitted, all patches in the file are context-free and each patch's [`selector`](#selector) alone identifies the element. When overlays are applied local only, the necessary context is often implicit, so `target` can be omitted for brevity.

Key fields on `target`:

| Field | Purpose |
|---|---|
| `ordId` | Identifies the ORD resource being patched (API, Event, Data Product, …). Selects the ORD resource metadata itself. |
| `url` | Direct URL to the specific metadata definition file (e.g. an OpenAPI JSON file). |
| `definitionType` | Declares the format of the file (e.g. `openapi-v3`, `a2a-agent-card`). Disambiguates when a resource has multiple definitions attached. |

Example of ambiguity: an OData API resource may expose both `edmx` and `openapi-v3` definitions.
Provide `definitionType` and/or `url` to make the concrete patch target explicit.

For overlays that only patch ORD metadata via [`selector.ordId`](#selectorbyordid), `target` may be omitted.
Multiple resources can be patched in a single file using multiple patches with different selector `ordId` values.

## Selectors

Each [patch](#patch) identifies the element to patch using exactly one [selector](#selector).
Concept-level selectors are preferred over `jsonPath` because they are resilient to structural format changes
(e.g. OpenAPI 3.0 → 3.1, OData CSDL XML → JSON).

| Selector | Level | Supported formats |
|---|---|---|
| [`ordId`](#selectorbyordid) | Resource | ORD resource metadata |
| [`operation`](#selectorbyoperation) | Operation | OpenAPI (`openapi-v2/v3/v3.1+`), MCP (Specification ID), A2A Agent Card (`a2a-agent-card`) |
| [`entityType`](#selectorbyentitytype) | Entity type | OData (`edmx`, `csdl-json`) |
| [`propertyType`](#selectorbypropertytype) | Property | OData (`edmx`, `csdl-json`) |
| [`jsonPath`](#selectorbyjsonpath) | Any location | Any JSON/YAML metadata file (generic fallback) |

The [`operation`](#selectorbyoperation) selector maps to different identifiers depending on the format:

- **OpenAPI** → `operationId` of an HTTP operation in `paths.{path}.{method}`
- **MCP** (any [Specification ID](../../spec-v1/index.md#specification-id)) → `tools[].name`
- **A2A Agent Card** → `skills[].id`

When `definitionType` is not provided, the implementation auto-detects the format by trying OpenAPI → MCP → A2A in order.
Using the `operation` selector with a named format constant that has no operation support (e.g. `edmx`, `asyncapi-v2`) raises an error.

## Patch Actions

Each [patch](#patch) specifies an [`action`](#patch) and a [`selector`](#selector), plus an optional [`data`](#patchvalue) value.
The full semantics of each action (`update`, `merge`, `append`, `remove`) are defined on the [`action`](#patch) field.

Key point for `merge`: arrays are appended, not replaced.
To fully replace an array, use two ordered patches — first `remove` the array, then `merge` the new value.

## Validation

Overlays assume the target document is already valid for its native format.
The merge tool does not fully re-validate target formats.
After applying an overlay, validate the merged output with the corresponding format-specific tooling.

## Overlay Document Metadata

Optional top-level fields scope an overlay to a specific system context:

- [`describedSystemType`](#overlaysystemtype), [`describedSystemVersion`](#overlaysystemversion), [`describedSystemInstance`](#overlaysysteminstance) — narrow the overlay to a particular system type, version, or instance.
- [`visibility`](#visibility) — controls who can discover this overlay document (`public`, `internal`, `private`).
- [`description`](#-2) — human-readable Markdown description of the overlay document itself.
- [`ordId`](#-3) — optional stable ORD ID for this overlay, using pattern `*:overlay:*:v*`.

## Referencing from ORD Documents

ORD Overlay files can be referenced from ORD documents using a `resourceDefinitions` entry with type `ord:overlay:v1`:

```json
{
  "resourceDefinitions": [
    {
      "type": "openapi-v3",
      "mediaType": "application/json",
      "url": "/ord/metadata/my-api.oas3.json",
      "accessStrategies": [{ "type": "open" }]
    },
    {
      "type": "ord:overlay:v1",
      "mediaType": "application/json",
      "url": "/ord/overlays/my-api.overlay.json",
      "accessStrategies": [{ "type": "open" }]
    }
  ]
}
```

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
