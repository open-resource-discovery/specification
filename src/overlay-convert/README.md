# Overlay Converter (`src/overlay-convert`)

> **⚠️ Alpha Status:** This module has been "vibe-coded" with AI assistance and has not yet undergone extensive manual review or QA. It is intended to validate the ORD Overlay specification and approach under realistic conditions. The plan is to move this tooling to a separate project once the specification stabilizes. Use with appropriate caution in production environments.

TypeScript module for converting existing overlay/enrichment formats into the **ORD Overlay** format.

Three source formats are supported:

| Source format | Converter function | Source schema |
|---|---|---|
| [Standard OpenAPI Overlay spec v1.x](https://spec.openapis.org/overlay/v1.1.0.html) | `convertOpenApiOverlayToOrd` | `overlay: "1.x.x"` |
| OData v2 Enrichment (KG integration format) | `convertODataV2EnrichmentToOrd` | `tmp/cto-api-docs/integration/kg/odatav2/schemas/enrichment.json` |
| OData v4 Enrichment (KG integration format) | `convertODataV4EnrichmentToOrd` | `tmp/cto-api-docs/integration/kg/odatav4/schemas/enrichment.json` |

## Usage

```typescript
import {
  convertOpenApiOverlayToOrd,
  convertODataV2EnrichmentToOrd,
  convertODataV4EnrichmentToOrd,
} from "./overlay-convert";

const { overlay, warnings } = convertOpenApiOverlayToOrd(sourceOverlay, {
  target: { ordId: "sap.foo:apiResource:my-api:v1", definitionType: "openapi-v3" },
  ordId: "sap.foo:overlay:my-api:v1",
});

// Inspect warnings for lost or unsupported information
for (const w of warnings) {
  console.warn(`[${w.type}] ${w.message}`);
}
```

`ConvertOptions` (shared by all three converters):

| Option | Description |
|---|---|
| `target` | `target` block for the ORD overlay document |
| `ordId` | ORD ID for the overlay document |
| `description` | Description for the overlay document (overrides auto-derived text) |
| `odataNamespace` | OData namespace for selectors (required for v2; overrides namespace from v4 document) |

## Format Mapping

### OpenAPI Overlay → ORD Overlay

| OpenAPI Overlay field | ORD Overlay field | Notes |
|---|---|---|
| `actions[].target` (JSONPath) | `patches[].selector.jsonPath` | 1:1 mapping |
| `actions[].update` | `patches[].action = "merge"` + `patches[].data` | 1:1 semantics |
| `actions[].remove = true` | `patches[].action = "remove"` + `patches[].data = {}` | |
| `actions[].remove = false` | *(skipped)* | No-op in both specs |
| `info.title` / `info.version` | `overlay.description` | Embedded as text prefix |
| `extends` | `target.url` | Only when no explicit `target` option is provided |
| `actions[].description` | `patches[].description` | 1:1 mapping — purely informational, no effect on patch application |

When `update` and `remove` are both present on a single action, two patches are generated in order (merge first, remove second). The `description` is attached to the first patch (the `merge`).

### OData v2 Enrichment → ORD Overlay

Patch data is expressed in **CSDL JSON annotation format** as required by the ORD overlay spec for OData targets.

| Source field | ORD selector | ORD annotation data |
|---|---|---|
| `entityTypes[].{summary, description}` | `entityType: "[ns.]TypeName"` | `@Core.Description`, `@Core.LongDescription` |
| `entityTypes[].tags` | — | `patch.meta.tags` (out-of-band) |
| `entityTypes[].properties[].{summary, description}` | `propertyType: "PropName"` + `entityType` | `@Core.Description`, `@Core.LongDescription` |
| `complexTypes[].{summary, description}` | `entityType: "[ns.]TypeName"` | `@Core.Description`, `@Core.LongDescription` |
| `complexTypes[].tags` | — | `patch.meta.tags` (out-of-band) |
| `complexTypes[].properties[].{summary, description}` | `propertyType: "PropName"` + `entityType` | `@Core.Description`, `@Core.LongDescription` |
| `entitySets[].{summary, description}` | `entitySet: "[ns.]EntitySetName"` | `@Core.Description`, `@Core.LongDescription` |
| `entitySets[].tags` | — | `patch.meta.tags` (out-of-band) |
| `functionImports[].{summary, description}` | `operation: "[ns.]FunctionImportName"` | `@Core.Description`, `@Core.LongDescription` |
| `functionImports[].tags` | — | `patch.meta.tags` (out-of-band) |
| `functionImports[].parameters[].{summary, description}` | `parameter: "ParamName"` + `operation` | `@Core.Description`, `@Core.LongDescription` |

**Namespace handling:**
OData v2 enrichment files do not embed a namespace. Pass `odataNamespace` to generate namespace-qualified selectors (e.g. `SFSF.EC.Customer`). Without it, unqualified names are used and resolved by scanning all Schema elements.

**EDMX `FunctionImport` resolution:**
For `edmx` targets, the `operation` selector first searches Schema-level `Action`/`Function` elements. If no match is found, it falls back to searching `EntityContainer` for `FunctionImport` elements. OData v2 `functionImports` are therefore fully supported for EDMX targets.

### OData v4 Enrichment → ORD Overlay

| Source field | ORD selector | ORD annotation data |
|---|---|---|
| Root `{summary, description}` (service level) | `namespace: "namespace"` | `@Core.Description`, `@Core.LongDescription` |
| `entityTypes[].{summary, description}` | `entityType: "ns.TypeName"` | `@Core.Description`, `@Core.LongDescription` |
| `entityTypes[].tags` | — | `patch.meta.tags` (out-of-band) |
| `entityTypes[].properties[].{summary, description}` | `propertyType: "PropName"` + `entityType` | `@Core.Description`, `@Core.LongDescription` |
| `complexTypes[].{summary, description}` | `entityType: "ns.TypeName"` | `@Core.Description`, `@Core.LongDescription` |
| `complexTypes[].tags` | — | `patch.meta.tags` (out-of-band) |
| `complexTypes[].properties[].{summary, description}` | `propertyType: "PropName"` + `entityType` | `@Core.Description`, `@Core.LongDescription` |
| `entitySets[].{summary, description}` | `entitySet: "EntitySetName"` | `@Core.Description`, `@Core.LongDescription` |
| `entitySets[].tags` | — | `patch.meta.tags` (out-of-band) |
| `enumTypes[].{summary, description}` | `entityType: "ns.EnumTypeName"` | `@Core.Description`, `@Core.LongDescription` |
| `enumTypes[].members[].{summary, description}` | `propertyType: "MemberName"` + `entityType` | `@Core.Description`, `@Core.LongDescription` |
| `actions[].{summary, description}` | `operation: "ns.ActionName"` | `@Core.Description`, `@Core.LongDescription` |
| `actions[].tags` | — | `patch.meta.tags` (out-of-band) |
| `actions[].parameters[].{summary, description}` | `parameter: "ParamName"` + `operation` | `@Core.Description`, `@Core.LongDescription` |
| `actions[].returnType.{summary, description}` | `returnType: true` + `operation` | `@Core.Description`, `@Core.LongDescription` |
| `functions[].{summary, description}` | `operation: "ns.FunctionName"` | `@Core.Description`, `@Core.LongDescription` |
| `functions[].tags` | — | `patch.meta.tags` (out-of-band) |
| `functions[].parameters[].{summary, description}` | `parameter: "ParamName"` + `operation` | `@Core.Description`, `@Core.LongDescription` |
| `functions[].returnType.{summary, description}` | `returnType: true` + `operation` | `@Core.Description`, `@Core.LongDescription` |
| `actionImports[]` | merged onto `actions[]` patch | See [ActionImport/FunctionImport merging](#actionimportfunctionimport-merging) |
| `functionImports[]` | merged onto `functions[]` patch | See [ActionImport/FunctionImport merging](#actionimportfunctionimport-merging) |

---

## Remaining Model Mismatches

The following issues remain after the current implementation. Each represents either a **lossy mapping** or a **structural limitation** of the source format.

---

### ActionImport/FunctionImport merging

**Affects:** OData v4 enrichment `actionImports[]` and `functionImports[]`

**Background:**
In OData v4, `ActionImport` and `FunctionImport` are convenience aliases in `EntityContainer` for an underlying Schema-level `Action`/`Function`. They carry no separate type definition and should not be annotated independently — the OData spec recommends annotating the Schema-level operation directly.

In practice, an enrichment file may have descriptions on both `actions[]` and `actionImports[]` for the same operation, or only on the import (when the LLM annotated the container-level alias rather than the schema element).

**Merge policy (applied per import):**

| Situation | Converter behaviour | Warning emitted |
|---|---|---|
| Matching `actions[]`/`functions[]` patch exists, descriptions are identical | No change to existing patch | None |
| Matching `actions[]`/`functions[]` patch exists, descriptions differ | Existing op patch is kept unchanged (op is authoritative); import description is discarded | `lost-information` — includes both description texts so the difference is visible |
| Matching `actions[]`/`functions[]` patch exists, import has tags the op does not | Tags are merged onto the existing patch `meta.tags` | None |
| No matching `actions[]`/`functions[]` entry (import is the only source) | A new operation patch is generated from the import description using the `operation` selector | `needs-spec-extension` — recommends moving the enrichment to `actions[]`/`functions[]` |

**Recommendation:** Enrich `actions[]`/`functions[]` directly. Use `actionImports[]`/`functionImports[]` only if no Schema-level entry exists.

---

## Conversion Warning Categories

| Warning type | Meaning |
|---|---|
| `unsupported-concept` | The source concept has no equivalent ORD overlay representation; the element is skipped. |
| `lost-information` | Information is structurally dropped and cannot be round-tripped (e.g. free-form tags). |
| `needs-spec-extension` | A partial conversion is generated but its correctness depends on a future spec or implementation change. |

---

## Selector Reference

The ORD overlay concept-level selectors used by the converters:

| Selector | Supported formats | What it targets |
|---|---|---|
| `jsonPath` | All JSON/YAML formats | Any node via JSONPath expression |
| `ordId` | ORD documents | An ORD resource (API, Event, Data Product, ...) by its ORD ID |
| `operation` | OpenAPI, MCP, A2A, OData CSDL | An HTTP operation (by `operationId`), MCP tool (by `name`), A2A skill (by `id`), or OData Action/Function (by namespace-qualified name). For EDMX: also searches EntityContainer FunctionImport when no Schema-level match is found. |
| `entityType` | OData CSDL, CSN Interop | An EntityType, ComplexType, or **EnumType** (by namespace-qualified name for OData; by fully-qualified definitions key for CSN) |
| `propertyType` | OData CSDL, CSN Interop | A Property, NavigationProperty, or **EnumType Member** (unqualified name; requires `entityType` context) |
| `entitySet` | OData CSDL (`edmx`, `csdl-json`) | An EntitySet inside EntityContainer (by name) |
| `namespace` | OData CSDL (`edmx`, `csdl-json`) | The Schema/namespace element itself (for service-level annotations) |
| `parameter` | OpenAPI, OData CSDL (`edmx`, `csdl-json`) | An operation parameter by name; requires `operation` context |
| `returnType` | OData CSDL (`edmx`, `csdl-json`) | The ReturnType element of an Action or Function; requires `operation` context and `returnType: true` |

