:::caution Alpha
This specification is in **alpha** and subject to change.
:::

Use Resource Definition Overlays to patch or overlay resource definition files such as OpenAPI, OData CSDL, AsyncAPI, or MCP Agent Cards — without modifying the original file.

This allows external parties (e.g. platform teams, ORD aggregators) to add or override metadata in resource definition files without modifying the originals. This is especially useful when the ownership or lifecycle of the target file differs from the overlay.

Concept-level selectors (`operationId`, `entityTypeId`, `propertyId`) are preferred over structural selectors (`jsonPath`) as they remain valid across format versions (e.g. OpenAPI 3.0 → 3.1, OData CSDL XML → JSON).

## Overlay Document Metadata

Overlay-level metadata is defined directly on the root object (no `info` wrapper).  
Use these optional root properties to provide context:

- `description`: Human-readable Markdown description of the overlay document itself.
- `describedSystemType`: System type context for which the overlay applies.
- `describedSystemVersion`: System version context for which the overlay applies.
- `describedSystemInstance`: System instance context for which the overlay applies.
- `visibility`: Discovery visibility (`public`, `internal`, or `private`) for the overlay metadata.

## Referencing from ORD Documents

Resource Definition Overlay files are referenced from ORD documents using a `resourceDefinitions` entry with type `ord:resourceDefinitionOverlay:v0`:

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
      "type": "ord:resourceDefinitionOverlay:v0",
      "mediaType": "application/json",
      "url": "/ord/overlays/my-api.overlay.json",
      "accessStrategies": [{ "type": "open" }]
    }
  ]
}
```
