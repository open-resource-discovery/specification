# Overlay Merge Library (`src/overlay-merge`)

> **⚠️ Alpha Status:** This module has been "vibe-coded" with AI assistance and has not yet undergone extensive manual review or QA. It is intended to validate the ORD Overlay specification and approach under realistic conditions. The plan is to move this tooling to a separate project once the specification stabilizes. Use with appropriate caution in production environments.

TypeScript implementation for applying ORD overlays to metadata files.

Current scope:
- Supports all selector types: `jsonPath`, `ordId`, `operation`, `entityType`, `propertyType`, `entitySet`, `namespace`, `parameter`, `returnType`
- Supports all patch actions: `merge`, `update`, `remove`
- JSON-based targets (`csdl-json`, `sap-csn-interop-effective-v1`, OpenAPI, A2A, MCP, ORD Document, …) via `applyOverlayToDocument`
- EDMX XML targets (`edmx`) via `applyOverlayToEdmxDocument` (uses `fast-xml-parser`)
- Validates overlay input against the generated `OrdOverlay` JSON Schema
- Emits semantic validation errors for documented `MUST` constraints and warnings for documented `SHOULD` guidance

Validation assumption:
- The input target document is assumed to already be valid for its native metadata format.
- This merge tool does not fully validate target metadata formats.
- Validate the merged output again with the target format-specific tooling.

Current CLI limitation:
- The CLI uses `applyOverlayToDocument` and therefore does not support EDMX XML targets. Use the library API (`applyOverlayToEdmxDocument`) directly for EDMX files.

## What It Does

The library applies `patches` from an `ORDOverlay` document in order.

### Selector support

| Selector | Supported formats | Notes |
|---|---|---|
| `jsonPath` | Any JSON/YAML document | Generic fallback; not supported for EDMX targets |
| `ordId` | ORD Document | Scans top-level resource collections |
| `operation` | OpenAPI, MCP, A2A Agent Card, CSDL JSON, EDMX | See format details below |
| `entityType` | CSDL JSON, EDMX, CSN Interop | Qualified or unqualified names |
| `complexType` | CSDL JSON, EDMX | OData ComplexTypes by namespace-qualified name |
| `enumType` | CSDL JSON, EDMX | OData EnumTypes by namespace-qualified name |
| `propertyType` | CSDL JSON, EDMX, CSN Interop | Pair with `entityType`, `complexType`, or `enumType` |
| `entitySet` | CSDL JSON, EDMX | Targets EntitySet in EntityContainer |
| `namespace` | CSDL JSON, EDMX | Targets Schema namespace for service-level annotations |
| `parameter` | OpenAPI, CSDL JSON, EDMX | Requires `operation` context |
| `returnType` | CSDL JSON, EDMX | Requires `operation` context |

**`operation` selector by format:**
- OpenAPI (`openapi-v2`, `openapi-v3`, `openapi-v3.1+`): matches `operationId` in `paths.{path}.{method}`
- MCP (Specification ID, e.g. `sap.foo:my-server:v1`): matches `tools[].name`
- A2A Agent Card (`a2a-agent-card`): matches `skills[].id`
- CSDL JSON (`csdl-json`): matches Action or Function overload arrays by local or namespace-qualified name
- EDMX (`edmx`): same name resolution via `applyOverlayToEdmxDocument`
- Without `definitionType`: auto-detection tries OpenAPI → MCP → A2A in order

**`entityType` selector by format:**
- `csdl-json`: resolves the `EntityType` entry inside the namespace object (e.g. `root["OData.Demo"]["Customer"]`). Supports both qualified (`OData.Demo.Customer`) and unqualified (`Customer`) names.
- `edmx`: resolves `EntityType` XML elements by `@_Name`, supporting qualified or unqualified names. Use via `applyOverlayToEdmxDocument`.
- `sap-csn-interop-effective-v1`: resolves a `definitions` entry by its fully qualified key (e.g. `AirlineService.Airline`).

**`complexType` and `enumType` selectors:**
- `csdl-json`: resolves `ComplexType` or `EnumType` entries inside the namespace object by namespace-qualified name.
- `edmx`: resolves `ComplexType` or `EnumType` XML elements by `@_Name`. Use via `applyOverlayToEdmxDocument`.

**`propertyType` selector by format:**
- `csdl-json`: resolves a non-`$`-prefixed key on the matched entity type object.
- `edmx`: resolves a `Property` or `NavigationProperty` child element by `@_Name`. Use via `applyOverlayToEdmxDocument`.
- `sap-csn-interop-effective-v1`: resolves an entry in the `elements` map of the matched definition.
- Always pair with `entityType` to avoid ambiguity when the same property name exists on multiple types.

## EDMX Patch Data Format

For EDMX targets the patch `data` MUST be expressed in **CSDL JSON annotation format** regardless of whether the actual file is EDMX XML. The `applyOverlayToEdmxDocument` function converts these to `<Annotation>` XML child elements on the matched element.

Annotation key convention: `@TermName` (e.g. `@Core.Description`, `@Core.Revisions`).

Value mapping to XML:
| CSDL JSON value | XML output |
|---|---|
| `string` | `<String>…</String>` |
| `true` / `false` | `Bool="true"` / `Bool="false"` attribute |
| integer | `Int="…"` attribute |
| decimal | `Decimal="…"` attribute |
| `[{ … }]` array of objects | `<Collection><Record><PropertyValue …/></Record></Collection>` |
| `{ "@EnumMember": "…" }` | `<EnumMember>…</EnumMember>` |
| plain object | `<Record><PropertyValue …/></Record>` |

See: https://docs.oasis-open.org/odata/odata-csdl-json/v4.01/odata-csdl-json-v4.01.html

## CSN Interop Patch Data Format

For CSN Interop targets (`sap-csn-interop-effective-v1`), the patch `data` is plain CSN JSON merged directly into the matched definition or element object. Use the `doc` field for human-readable descriptions and `@AnnotationName` keys for vocabulary annotations (e.g. `@EndUserText.label`, `@Semantics.text`).

## TODO / Open Decisions

- `target.url` is currently informational and not used for strict target matching.
- Decide whether strict URL matching should be defaulted, optional, or profile-specific.
- Evaluate whether the `jsonpath` npm package (CommonJS-only) should be replaced with a native ESM alternative.
- For EDMX: EntitySet-level patching (e.g. Capabilities annotations on the container) is not covered by the `entityType` selector; use `jsonPath` or a dedicated selector extension for those cases.
- For CSDL JSON `entityType` selector: ambiguous unqualified names (same local name in multiple namespaces) will match all of them; prefer qualified names for precision.
- TODO: move overlay validation into a separate project once the overlay merge tooling is split out of this repository.

## Merge Semantics

- `update`: replaces the selected element with `data`
- `merge`:
  - objects: deep-merged recursively; existing keys not in `data` are preserved
  - scalars: overwritten by `data`
  - arrays: incoming items appended after existing items
- `remove`:
  - without `data`: removes the selected element entirely
  - with `data`: removes fields set to `null` recursively (JSON Merge Patch–style)

To fully replace an existing array, use two ordered patches: first `remove` the array, then `merge` the new content.

## JSONPath Support

JSONPath evaluation is delegated to the `jsonpath` npm package (`jsonpath@1.2.1`).

## ORD ID Selector Behavior

`ordId` resolves against top-level ORD Document collections (e.g. `apiResources`, `eventResources`, `dataProducts`, …). It does not patch nested reference objects (e.g. `{ "ordId": "…" }` entries inside `partOfConsumptionBundles`).

Resolution: the implementation discovers root-level arrays whose entries contain an `ordId` field, derives the resource type from the ordId itself, and uses simple collection-name fallbacks (`s` suffix, `y → ies`).

## Library Usage

### JSON-based targets

```ts
import { applyOverlayToDocument } from "@open-resource-discovery/specification";

const merged = applyOverlayToDocument(targetDocument, overlay, {
  noMatchBehavior: "error",
  requireTargetMatch: true,
  context: {
    ordId: "sap.foo:apiResource:astronomy:v1",
    definitionType: "openapi-v3",
  },
});
```

### EDMX XML targets

```ts
import { applyOverlayToEdmxDocument } from "@open-resource-discovery/specification/overlay-merge/edmx";

const patchedXml = applyOverlayToEdmxDocument(xmlString, overlay, {
  noMatchBehavior: "error",
});
```

The function accepts the raw XML string and returns a formatted XML string with annotations injected.

### Options (both APIs)

| Option | Default | Description |
|---|---|---|
| `noMatchBehavior` | `"error"` | `"error"` throws, `"warn"` logs, `"ignore"` silently skips unmatched patches |
| `requireTargetMatch` | `false` | Validates overlay `target` metadata against `context` |
| `validateDefinitionType` | `true` | Validates basic target document structure for known `definitionType` values |
| `validateOverlaySemantics` | `true` | Validates selector/action support before applying |
| `context` | — | Expected `ordId`, `url`, `definitionType` of the file being patched |

## CLI Script

A CLI is provided at `src/overlay-merge/cli.ts` for JSON and YAML targets.

After build:

```bash
node dist/overlay-merge/cli.js \
  --overlay examples/overlay/openapi-astronomy-api.overlay.json \
  --input examples/implementation/nginx-no-auth/metadata/astronomy-v1.oas3.json \
  --target-url /ord/metadata/astronomy-v1.oas3.json \
  --target-definition-type openapi-v3 \
  --output /tmp/astronomy-patched.json
```

Flags:
| Flag | Required | Description |
|---|---|---|
| `--overlay <path>` | yes | Path to the ORD Overlay file (JSON or YAML) |
| `--input <path>` | yes | Path to the target file to patch (JSON or YAML) |
| `--output <path>` | no | Output path (defaults to stdout) |
| `--target-ord-id <ordId>` | no | ORD ID context for target matching |
| `--target-url <url>` | no | URL context (currently informational) |
| `--target-definition-type <type>` | no | Explicit definition type for the target |
| `--allow-no-match` | no | Continue silently when a selector has no match |
| `--warn-on-no-match` | no | Warn (stderr) when a selector has no match |
| `--dry-run` | no | Validate overlay and input without applying changes |

**Format detection:** Input format (JSON/YAML) is auto-detected from file extension (`.json`, `.yaml`, `.yml`). Output format matches the input file format by default.

## Tests

Tests use Node.js built-in test runner (`node:test`) and real files from `examples/` and `src/overlay-merge/tests/fixtures/`.

Run:

```bash
npm run test:overlay-merge
```

Coverage includes:
- JSONPath patching on OpenAPI example JSON
- `ordId` selector patching on ORD Document example JSON
- `operation` selector on OpenAPI, MCP, and A2A Agent Card examples
- `entityType` + `propertyType` selectors on CSN Interop (`airline.csn-interop.json`)
- `entityType` + `propertyType` + `operation` selectors on CSDL JSON (`ExampleService.csdl.json`)
- `entityType` + `propertyType` + `operation` selectors on EDMX XML (`ExampleService.edmx.xml`) via `applyOverlayToEdmxDocument`
- no-match failure and warning behavior
- overlay schema validation
- semantic MUST/SHOULD validation and definition-type compatibility checks
