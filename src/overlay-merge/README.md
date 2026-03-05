# Overlay Merge Library (`src/overlay-merge`)

TypeScript implementation for applying ORD overlays to JSON-based metadata files.

Current scope:
- Supports selector types: `jsonPath`, `ordId`
- Supports actions: `merge`, `update`, `remove`
- Uses `jsonpath` for JSONPath evaluation

## What It Does

The library applies `patches` from an `ORDOverlay` document in order.

Selector support implemented now:
- `jsonPath`: generic JSONPath selector for JSON files
- `ordId`: selector for ORD Document resources (top-level resource arrays)

Selectors currently not implemented in this script:
- `operation`, `entityType`, `propertyType`

## Merge Semantics

Implemented patch semantics:
- `update`: replaces the selected element with `data`
- `merge`:
  - objects: deep-merged recursively
  - scalars: overwritten
  - arrays: appended (existing + incoming)
- `remove`:
  - without `data`: removes the selected element
  - with `data`: removes fields marked as `null` recursively

Example (`remove` with nested deletion):

```json
{
  "action": "remove",
  "selector": { "jsonPath": "$.info" },
  "data": { "foo": { "bar": null } }
}
```

This removes `info.foo.bar`.

## JSONPath Support

JSONPath evaluation is delegated to the `jsonpath` npm package (`jsonpath@1.2.1`).
Supported syntax is therefore whatever that library supports.

## ORD ID Selector Behavior

`ordId` selector resolves against top-level ORD Document collections (for example `apiResources`, `eventResources`, `entityTypes`, `dataProducts`, `capabilities`, ...).

It intentionally does not patch nested reference objects by default (for example `{ "ordId": "..." }` entries inside `partOfConsumptionBundles`), because those are not full resource metadata objects.

Resolution behavior:
- The implementation discovers root-level arrays of objects that contain an `ordId` field, and only scans those collections
- If `selector.resourceType` is provided, it filters candidate collections by exact collection name (or simple plural fallback by appending `s`)
- There is no hardcoded ORD resource type map in the resolver

## Library Usage

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

Options:
- `noMatchBehavior` (default `"error"`):
  - `"error"` throw when a selector matches nothing
  - `"warn"` continue and log warning
  - `"ignore"` continue silently
- `failOnNoMatch` (deprecated): `true` -> `"error"`, `false` -> `"ignore"`
- `requireTargetMatch` (default `false`): validate overlay target against `context`
- `validateDefinitionType` (default `true`): validates basic structure for known types (currently `openapi-v3`)
- `context`: expected `ordId`, `url`, `definitionType` of the file being patched
  - `url` is currently informational and not used for strict target equality checks

## CLI Script

A CLI is provided at `src/overlay-merge/cli.ts`.

After build:

```bash
node dist/overlay-merge/cli.js \
  --overlay examples/overlay/astronomy-api-openapi.overlay.json \
  --input examples/implementation/nginx-no-auth/metadata/astronomy-v1.oas3.json \
  --target-url /ord/metadata/astronomy-v1.oas3.json \
  --target-definition-type openapi-v3 \
  --output /tmp/astronomy-patched.json
```

Flags:
- `--overlay <path>` required
- `--input <path>` required
- `--output <path>` optional (otherwise writes to stdout)
- `--target-ord-id <ordId>` optional
- `--target-url <url>` optional
- `--target-definition-type <type>` optional
- `--allow-no-match` optional
- `--warn-on-no-match` optional

## Tests

Tests use Node.js built-in test runner (`node:test`) and real files from `examples/`.

Run:

```bash
npm run test:overlay-merge
```

Coverage includes:
- JSONPath patching on OpenAPI example JSON
- `ordId` selector patching on ORD Document example JSON
- no-match failure behavior

Integration-style tests also apply overlay files from `examples/overlay` to existing metadata files in `examples/`.
