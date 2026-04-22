# Overlay Validate Library (`src/overlay-validate`)

> **⚠️ Alpha Status:** This module has been "vibe-coded" with AI assistance and has not yet undergone extensive manual review or QA. It is intended to validate the ORD Overlay specification and approach under realistic conditions. The plan is to move this tooling to a separate project once the specification stabilizes. Use with appropriate caution in production environments.

TypeScript implementation for validating ORD Overlay documents.

Current scope:
- JSON Schema validation against the generated `OrdOverlay.schema.json`
- Semantic validation for documented `MUST` constraints and `SHOULD` guidance
- Target document validation (when provided):
  - Validates all selectors match at least one element in the target
  - Detects redundant patches that would not change the target
- Supports JSON, YAML, and EDMX/XML targets

## What It Does

The library validates ORD Overlay documents at multiple levels:

1. **Schema Validation**: Ensures the overlay conforms to the `OrdOverlay` JSON Schema
2. **Semantic Validation**: Checks documented requirements (e.g., deprecated values, required context)
3. **Target Validation** (when target provided):
   - Verifies each patch selector matches at least one element
   - Detects redundant patches (update with same value, merge with no effect, etc.)

## Library Usage

### Validate overlay only (schema + semantics)

```ts
import { validateOverlay } from "@open-resource-discovery/specification/overlay-validate/validate";

const overlay = JSON.parse(fs.readFileSync('overlay.json', 'utf8'));
const result = validateOverlay(overlay);

if (!result.valid) {
  console.error('Validation errors:', result.errors);
}

if (result.warnings.length > 0) {
  console.warn('Validation warnings:', result.warnings);
}
```

### Validate overlay against a JSON/YAML target

```ts
import { validateOverlayWithTarget } from "@open-resource-discovery/specification/overlay-validate/validate";

const overlay = JSON.parse(fs.readFileSync('overlay.json', 'utf8'));
const target = JSON.parse(fs.readFileSync('openapi.json', 'utf8'));

const result = validateOverlayWithTarget(overlay, target, {
  definitionType: 'openapi-v3',
});

if (!result.valid) {
  console.error('Validation errors:', result.errors);
}

// Check for redundant patches
result.patchSummary?.forEach((summary, i) => {
  if (summary.redundant) {
    console.warn(`Patch ${i + 1} is redundant: ${summary.redundantDetails}`);
  }
});
```

### Validate overlay against an EDMX target

```ts
import { validateOverlayWithEdmxTarget } from "@open-resource-discovery/specification/overlay-validate/validate";

const overlay = JSON.parse(fs.readFileSync('overlay.json', 'utf8'));
const edmxContent = fs.readFileSync('metadata.edmx', 'utf8');

const result = validateOverlayWithEdmxTarget(overlay, edmxContent);

if (!result.valid) {
  console.error('Validation errors:', result.errors);
}
```

## Validation Result

The validation functions return an `OverlayFullValidationResult`:

```ts
interface OverlayFullValidationResult {
  valid: boolean;                           // true if no errors
  errors: OverlayValidationIssue[];         // validation errors
  warnings: OverlayValidationIssue[];       // validation warnings
  patchSummary?: PatchValidationSummary[];  // per-patch details (when target provided)
}

interface PatchValidationSummary {
  patchIndex: number;           // zero-based index
  selector: unknown;            // the patch selector
  matchCount: number;           // elements matched (-1 for EDMX)
  redundant: boolean;           // true if patch would have no effect
  redundantDetails?: string;    // explanation of redundancy
}
```

## Redundancy Detection

The validator detects redundant patches that would not change the target:

| Action | Redundancy Condition |
|--------|----------------------|
| `update` | Patch value is identical to existing value |
| `merge` | Merging would result in no changes to the target |
| `remove` | N/A (removing existing content is never redundant) |

## CLI Script

A CLI is provided at `src/overlay-validate/cli.ts` for validating overlay files.

After build:

```bash
# Validate overlay only (schema + semantics)
node dist/overlay-validate/cli.js \
  --overlay examples/overlay/openapi-astronomy-api.overlay.json

# Validate overlay against a target document
node dist/overlay-validate/cli.js \
  --overlay examples/overlay/openapi-astronomy-api.overlay.json \
  --target examples/implementation/nginx-no-auth/metadata/astronomy-v1.oas3.json \
  --target-definition-type openapi-v3

# Output as JSON
node dist/overlay-validate/cli.js \
  --overlay examples/overlay/openapi-astronomy-api.overlay.json \
  --json
```

### CLI Flags

| Flag | Required | Description |
|------|----------|-------------|
| `--overlay <path>` | yes | Path to the ORD Overlay file (JSON or YAML) |
| `--target <path>` | no | Path to the target document to validate selectors against |
| `--target-ord-id <ordId>` | no | ORD ID context for target matching |
| `--target-url <url>` | no | URL context (currently informational) |
| `--target-definition-type <type>` | no | Explicit definition type for the target |
| `--json` | no | Output validation report as JSON (to stdout) |
| `--help` | no | Print help message |

### Exit Codes

- `0`: Validation passed (may have warnings)
- `1`: Validation failed (has errors)

### Output Formats

**Text format** (default, to stderr):
```
Overlay Validation Report
========================
Overlay: examples/overlay/openapi-astronomy-api.overlay.json
Target:  examples/implementation/nginx-no-auth/metadata/astronomy-v1.oas3.json

Status: VALID

Patches: 2
  Patch #1: 1 match(es)
  Patch #2: 3 match(es)
```

**JSON format** (`--json`, to stdout):
```json
{
  "overlay": "examples/overlay/openapi-astronomy-api.overlay.json",
  "target": "examples/implementation/nginx-no-auth/metadata/astronomy-v1.oas3.json",
  "valid": true,
  "errors": [],
  "warnings": [],
  "patchSummary": [
    { "patchIndex": 0, "selector": {...}, "matchCount": 1, "redundant": false },
    { "patchIndex": 1, "selector": {...}, "matchCount": 3, "redundant": false }
  ]
}
```

## Tests

Tests use Node.js built-in test runner (`node:test`).

Run:

```bash
npm run build:ts && node --test dist/overlay-validate/**/*.test.js
```

Coverage includes:
- Overlay-only validation (schema + semantics)
- Schema error reporting for invalid overlays
- Target validation with selector matching
- Non-matching selector error reporting
- Redundant patch detection (update, merge)
- JSON output format
- YAML overlay support
- Multiple errors and warnings reporting
