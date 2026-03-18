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
| `actions[].description` | *(lost)* | ORD overlay patches have no per-patch description field |

When `update` and `remove` are both present on a single action, two patches are generated in order (merge first, remove second), matching the OpenAPI Overlay spec's semantics.

### OData v2 Enrichment → ORD Overlay

Patch data is expressed in **CSDL JSON annotation format** as required by the ORD overlay spec for OData targets.

| Source field | ORD selector | ORD annotation data |
|---|---|---|
| `entityTypes[].{summary, description}` | `entityType: "[ns.]TypeName"` | `@Core.Description`, `@Core.LongDescription` |
| `entityTypes[].properties[].{summary, description}` | `propertyType: "PropName"` + `entityType` | `@Core.Description`, `@Core.LongDescription` |
| `complexTypes[].{summary, description}` | `entityType: "[ns.]TypeName"` | `@Core.Description`, `@Core.LongDescription` |
| `complexTypes[].properties[].{summary, description}` | `propertyType: "PropName"` + `entityType` | `@Core.Description`, `@Core.LongDescription` |
| `entitySets[].{summary, description}` | `entitySet: "[ns.]EntitySetName"` | `@Core.Description`, `@Core.LongDescription` |
| `functionImports[].{summary, description}` | `operation: "[ns.]FunctionImportName"` | `@Core.Description`, `@Core.LongDescription` |
| `functionImports[].parameters[].{summary, description}` | `parameter: "ParamName"` + `operation` | `@Core.Description`, `@Core.LongDescription` |
| `*.tags` | *(lost)* | No standard OData vocabulary term — see [Issue 1](#issue-1--no-vocabulary-term-for-tags-lossy-mapping) |

**Namespace handling:**
OData v2 enrichment files do not embed a namespace. Pass `odataNamespace` to generate namespace-qualified selectors (e.g. `SFSF.EC.Customer`). Without it, unqualified names are used and resolved by scanning all Schema elements.

**EDMX `FunctionImport` resolution:**
For `edmx` targets, the `operation` selector first searches Schema-level `Action`/`Function` elements. If no match is found, it falls back to searching `EntityContainer` for `FunctionImport` elements. OData v2 `functionImports` are therefore fully supported for EDMX targets.

### OData v4 Enrichment → ORD Overlay

| Source field | ORD selector | ORD annotation data |
|---|---|---|
| Root `{summary, description}` (service level) | `namespace: "namespace"` | `@Core.Description`, `@Core.LongDescription` |
| `entityTypes[].{summary, description}` | `entityType: "ns.TypeName"` | `@Core.Description`, `@Core.LongDescription` |
| `entityTypes[].properties[].{summary, description}` | `propertyType: "PropName"` + `entityType` | `@Core.Description`, `@Core.LongDescription` |
| `complexTypes[].{summary, description}` | `entityType: "ns.TypeName"` | `@Core.Description`, `@Core.LongDescription` |
| `complexTypes[].properties[].{summary, description}` | `propertyType: "PropName"` + `entityType` | `@Core.Description`, `@Core.LongDescription` |
| `entitySets[].{summary, description}` | `entitySet: "EntitySetName"` | `@Core.Description`, `@Core.LongDescription` |
| `enumTypes[].{summary, description}` | `entityType: "ns.EnumTypeName"` | `@Core.Description`, `@Core.LongDescription` |
| `enumTypes[].members[].{summary, description}` | `propertyType: "MemberName"` + `entityType` | `@Core.Description`, `@Core.LongDescription` |
| `actions[].{summary, description}` | `operation: "ns.ActionName"` | `@Core.Description`, `@Core.LongDescription` |
| `actions[].parameters[].{summary, description}` | `parameter: "ParamName"` + `operation` | `@Core.Description`, `@Core.LongDescription` |
| `actions[].returnType.{summary, description}` | `returnType: true` + `operation` | `@Core.Description`, `@Core.LongDescription` |
| `functions[].{summary, description}` | `operation: "ns.FunctionName"` | `@Core.Description`, `@Core.LongDescription` |
| `functions[].parameters[].{summary, description}` | `parameter: "ParamName"` + `operation` | `@Core.Description`, `@Core.LongDescription` |
| `functions[].returnType.{summary, description}` | `returnType: true` + `operation` | `@Core.Description`, `@Core.LongDescription` |
| `actionImports[]` | *(skipped — use `actions[]`)* | See [Issue 2](#issue-2--actionimportsfunctionimports-are-entitycontainer-aliases) |
| `functionImports[]` | *(skipped — use `functions[]`)* | See [Issue 2](#issue-2--actionimportsfunctionimports-are-entitycontainer-aliases) |
| `*.tags` | *(lost)* | No standard OData vocabulary term — see [Issue 1](#issue-1--no-vocabulary-term-for-tags-lossy-mapping) |

---

## Remaining Model Mismatches

The following issues remain after the current implementation. Each represents either a **lossy mapping** or a **structural limitation** of the source format.

---

### Issue 1 — No vocabulary term for tags (lossy mapping)

**Affects:** All `tags` arrays in OData v2 and v4 enrichment formats

**Problem:**
Both KG enrichment formats include a `tags` array on most elements (EntityType, EntitySet, FunctionImport, Action, Function, ComplexType). There is no standard OData vocabulary term (in `Core`, `Capabilities`, `Common`, `UI`, etc.) that maps to an array of free-form string tags.

**Impact:** Tags are discarded with a `lost-information` warning.

**Options:**
1. Define a custom vocabulary term (e.g. `@sap.core:Tags`) and accept it as an annotation key in patch data.
2. Map tags to ORD resource labels using an `ordId` selector on the wrapping ORD resource.

---

### Issue 2 — ActionImports/FunctionImports are EntityContainer aliases

**Affects:** OData v4 enrichment `actionImports[]` and `functionImports[]`

**Problem:**
In OData v4, `ActionImport` and `FunctionImport` are convenience aliases in `EntityContainer` for the underlying Schema-level `Action`/`Function`. They do not carry their own type definition — they simply expose a named binding. Enriching an import is therefore equivalent to enriching the underlying operation.

**Recommendation:** Enrich `actions[]`/`functions[]` directly instead of `actionImports[]`/`functionImports[]`.

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

