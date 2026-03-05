:::caution Alpha
This specification is in **alpha** and subject to change.
:::

The **ORD Overlay** is an optional ORD model extension.

An overlay can optionally have its own `ordId` with pattern `*:overlay:*:v*`.

TODO (Overlay `ordId`):

- Do we need this?
- If overlays are published/discovered via the configuration endpoint without direct ORD resource context, what should their stable ID be?
- Should this be mandatory or optional?

Overlay files can be provided via the [ORD Configuration Endpoint](../../spec-v1/index.md#ord-configuration-endpoint).
In this case, they can be published independently of a particular resource and can also patch metadata on ORD resource level itself.

Alternatively, an overlay can be attached to APIs or events as an additional `resourceDefinitions` file for a concrete resource.
The registered resource definition type is `ord:overlay:v1`.

Overlays can patch on both levels:

- ORD resource level metadata
- referenced resource definition level metadata

The patch format is intentionally unopinionated and can patch any JSON/YAML-based file.
In addition, it explicitly supports patching API, event, and data model metadata through concept-level selectors (`operation`, `entityType`, `propertyType`).
When patching ORD resources themselves, the ORD ID becomes the selector (`ordId`).

Selector support by metadata format:

- `operation`: OpenAPI (`openapi-v2`, `openapi-v3`, `openapi-v3.1+`) and MCP metadata files.
  For OpenAPI this maps to `operationId`. For MCP this maps to Tool `name`
  ([MCP Tool Name](https://modelcontextprotocol.io/specification/2025-11-25/schema#tool-name)).
- `entityType` and `propertyType`: OData (`edmx` for v2/v4 and `csdl-json` for v4).
- `jsonPath`: generic fallback for any JSON/YAML-based metadata file, including OpenAPI and MCP.

On `target`, `definitionType` can optionally declare the metadata definition type being patched.
It accepts:

- Any valid [Specification ID](../../spec-v1/index.md#specification-id)
- Values reused from API/Event/Capability resource definition `type` fields
  (for example `openapi-v3`, `asyncapi-v2`, `edmx`, `csdl-json`, `sap.mdo:mdi-capability-definition:v1`, `ord:overlay:v1`)

The literal `custom` is deprecated for `definitionType`. Use a concrete [Specification ID](../../spec-v1/index.md#specification-id) instead.

Target resolution notes:

- `target` is optional context metadata for target resolution.
- `ordId` in `target` selects the ORD resource metadata itself.
- If the patch is meant for a resource definition file (not only ORD-level metadata),
  `ordId` alone can be ambiguous when the resource has multiple definitions.
- Use `url` and/or `definitionType` to make the concrete definition file explicit.
  Example: one OData API can expose both `edmx` and `openapi-v3` definitions.
- For overlays that only patch ORD-level metadata via selector `ordId`, `target` may be omitted
  (or provided as an empty object). In this mode, multiple resources can be patched by multiple
  patch entries using different selector `ordId` values.
- If the ORD document URL is known, `target.url` can still be provided as informational context.

TODO (target resolution model):

- Decide what should be optional vs mandatory.
- Review cleanup after discussion: this proposal adds transparency-oriented fields; some may be dropped again.

TODO (OData operations):

- Best current guess for selector `operation` in OData:
  use schema-level `Action` / `Function` names (prefer fully-qualified names),
  or entity-container `ActionImport` / `FunctionImport` names when the operation is container-exposed.
  This still needs expert validation.
  See [OData CSDL XML 4.01](https://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/odata-csdl-xml-v4.01.html).

Concept-level selectors are preferred over structural selectors (`jsonPath`) because they are more resilient to format evolution (for example OpenAPI 3.0 to 3.1, or OData CSDL XML to JSON).

Validation assumption:

- Overlays and overlay application assume the target document is already valid for its native format.
- The merge tool does not fully validate target metadata formats.
- After applying overlays, the resulting merged document should be validated again with the target format's validator/tooling.

Patch action semantics for `append`:

- `data` must be a string.
- The selected value must be a string/text field.
- The `data` string is appended to the selected string.
- Typical use-case: extend an existing `description` without replacing it.

Patch action semantics for `merge`:

- Objects are deep-merged recursively.
- Scalar values are overwritten by values from `data`.
- Arrays are appended (`data` items are added after existing items).
- Existing properties not mentioned in `data` are preserved.

To fully replace an array, use two ordered patches:

1. Remove the array at the selected location.
2. Merge the new array value.

Patch action semantics for `remove`:

- Without `data`: remove the full element selected by `selector`.
- With `data`: remove fields that are set to `null`
  (recursively, including nested fields; JSON Merge Patch-style delete semantics), for example:
  `data: { "foo": { "bar": null } }`.

## Overlay Document Metadata

- `description`: Human-readable Markdown description of the overlay document itself.
- `describedSystemType`: System type context for which the overlay applies.
- `describedSystemVersion`: System version context for which the overlay applies.
- `describedSystemInstance`: System instance context for which the overlay applies.
- `visibility`: Discovery visibility (`public`, `internal`, or `private`) for the overlay metadata.

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
