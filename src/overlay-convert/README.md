# Overlay Converter (`src/overlay-convert`)

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

// Inspect warnings for lost/unsupported information
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
| `actions[].remove = false` | (skipped) | No-op in both specs |
| `info.title` / `info.version` | `overlay.description` | Embedded as text prefix |
| `extends` | `target.url` | Only when no explicit `target` option is provided |
| `actions[].description` | *(lost)* | ORD overlay patches have no description field |

When `update` and `remove` are both present on a single action, two patches are generated in order (merge first, remove second), matching the OpenAPI Overlay spec's semantics.

### OData v2 Enrichment → ORD Overlay

Patch data is expressed in **CSDL JSON annotation format** as required by the ORD overlay spec for OData targets.

| Source field | ORD selector | ORD annotation data |
|---|---|---|
| `entityTypes[].{summary, description}` | `entityType: "[ns.]TypeName"` | `@Core.Description`, `@Core.LongDescription` |
| `entityTypes[].properties[].{summary, description}` | `propertyType: "PropName"` + `entityType` | `@Core.Description`, `@Core.LongDescription` |
| `complexTypes[].{summary, description}` | `entityType: "[ns.]TypeName"` | `@Core.Description`, `@Core.LongDescription` |
| `complexTypes[].properties[].{summary, description}` | `propertyType: "PropName"` + `entityType` | `@Core.Description`, `@Core.LongDescription` |
| `functionImports[].{summary, description}` | `operation: "[ns.]FunctionImportName"` | `@Core.Description`, `@Core.LongDescription` |
| `entitySets[]` | *(unsupported — skipped)* | See Issue 1 |
| `*.tags` | *(lost — skipped)* | See Issue 4 |
| `functionImports[].parameters[]` | *(unsupported — skipped)* | See Issue 3 |

### OData v4 Enrichment → ORD Overlay

| Source field | ORD selector | ORD annotation data |
|---|---|---|
| `entityTypes[].{summary, description}` | `entityType: "ns.TypeName"` | `@Core.Description`, `@Core.LongDescription` |
| `entityTypes[].properties[].{summary, description}` | `propertyType: "PropName"` + `entityType` | `@Core.Description`, `@Core.LongDescription` |
| `complexTypes[].{summary, description}` | `entityType: "ns.TypeName"` | `@Core.Description`, `@Core.LongDescription` |
| `complexTypes[].properties[].{summary, description}` | `propertyType: "PropName"` + `entityType` | `@Core.Description`, `@Core.LongDescription` |
| `actions[].{summary, description}` | `operation: "ns.ActionName"` | `@Core.Description`, `@Core.LongDescription` |
| `functions[].{summary, description}` | `operation: "ns.FunctionName"` | `@Core.Description`, `@Core.LongDescription` |
| `root.{summary, description}` (service level) | *(unsupported — skipped)* | See Issue 5 |
| `entitySets[]` | *(unsupported — skipped)* | See Issue 1 |
| `enumTypes[]` | *(unsupported — skipped)* | See Issue 6 |
| `actionImports[]` | *(unsupported — skipped)* | See Issue 2 |
| `functionImports[]` | *(unsupported — skipped)* | See Issue 2 |
| `*.tags` | *(lost — skipped)* | See Issue 4 |
| `actions[].parameters[]` / `functions[].parameters[]` | *(unsupported — skipped)* | See Issue 3 |
| `actions[].returnType` / `functions[].returnType` | *(unsupported — skipped)* | See Issue 7 |

---

## Model Mismatches and Issues

The following issues were identified when converting from the KG enrichment formats to the ORD overlay model. Each issue represents either a **gap in the ORD Overlay spec** (spec extension needed) or a **lossy mapping** (information cannot be represented).

---

### Issue 1 — No `entitySet` selector (spec gap)

**Affects:** OData v2 enrichment `entitySets[]`, OData v4 enrichment `entitySets[]`

**Problem:**
The ORD overlay specification does not provide a concept-level selector for `EntitySet` elements. The `entityType` selector explicitly targets the *type definition* (EntityType, not EntitySet), as stated in the spec:

> "For OData, `entityType` targets the EntityType definition — not the EntitySet in the container."

`EntitySet` elements live inside the `EntityContainer` in EDMX. The existing concept-level selectors (`entityType`, `propertyType`, `operation`) only address elements in the schema-level type system.

A `jsonPath` fallback would work for CSDL JSON targets, but not for EDMX XML targets (since `jsonPath` is not supported by `applyOverlayToEdmxDocument`).

**Impact:**
Entity set enrichment (summary, description, tags) cannot be converted without losing information. This is the most impactful gap for the KG integration, as entity sets are a primary entry point for client developers.

**Suggested fix:**
Add an `entitySet` selector type to the ORD Overlay spec:
```json
{
  "action": "merge",
  "selector": { "entitySet": "EmployeeSet" },
  "data": {
    "@Core.Description": "Collection of employees",
    "@Core.LongDescription": "..."
  }
}
```
The EDMX implementation would need to resolve `EntitySet` elements inside `EntityContainer`.

---

### Issue 2 — Import elements in EntityContainer not selectable (spec gap)

**Affects:** OData v2 enrichment `functionImports[]`, OData v4 enrichment `actionImports[]` and `functionImports[]`

**Problem:**
In OData v2, `FunctionImport` is defined inside `EntityContainer` in the Schema. In OData v4, `ActionImport` and `FunctionImport` are also in `EntityContainer`, while the actual `Action` and `Function` definitions live at the Schema level.

The ORD overlay `operation` selector for EDMX targets only resolves Schema-level `Action` and `Function` elements (see `findEdmxOperation` in `src/overlay-merge/edmx.ts`). It does not search `EntityContainer` for `FunctionImport`.

**For OData v2:** The enrichment format only has `functionImports` (there are no Schema-level Actions/Functions in OData v2). All function enrichment would be in `functionImports`.
This converter **generates `operation` selector patches** for OData v2 `functionImports`, but **emits a `needs-spec-extension` warning** because the existing EDMX implementation will not resolve them.

**For OData v4:** The same function/action can be described via either `functions[]`/`actions[]` (Schema-level, directly convertible) or `functionImports[]`/`actionImports[]` (EntityContainer aliases, not convertible). The converter skips imports and warns to use the corresponding Schema-level entry instead.

**Suggested fix for OData v2:**
Extend `findEdmxOperation` in `src/overlay-merge/edmx.ts` to also search `EntityContainer` for `FunctionImport` elements when the Schema-level search yields no results.

---

### Issue 3 — No parameter-level selector (spec gap)

**Affects:** OData v2 `functionImports[].parameters[]`, OData v4 `actions[].parameters[]` and `functions[].parameters[]`

**Problem:**
The ORD overlay specification has no parameter-level selector. Parameters are sub-elements of operations (Actions, Functions, FunctionImports) and require a dedicated selector to be addressable independently.

The `operation` selector targets the entire operation object. While it is *possible* to include parameter-level annotations inside an `operation` patch (since the patch data is merged into the matched element), the EDMX merge implementation would need to navigate into `<Parameter>` child elements — which is not currently supported.

**Impact:**
Parameter enrichment (summary, description) is lost during conversion.

**Suggested fix:**
Add a `parameter` selector type to the ORD Overlay spec:
```json
{
  "action": "merge",
  "selector": {
    "operation": "com.example.Svc.TerminateEmployee",
    "parameter": "EmployeeId"
  },
  "data": {
    "@Core.Description": "Target employee identifier"
  }
}
```

---

### Issue 4 — No vocabulary term for tags (lossy mapping)

**Affects:** All `tags` arrays in OData v2 and v4 enrichment formats

**Problem:**
Both KG enrichment formats include a `tags` array on most elements (EntityType, EntitySet, FunctionImport, Action, Function, ComplexType). There is no standard OData vocabulary term (in `Core`, `Capabilities`, `Common`, `UI`, etc.) that directly maps to an array of free-form string tags.

**Impact:**
Tags cannot be losslessly represented in CSDL JSON annotation format. The conversion discards them with a `lost-information` warning.

**Suggested options:**
1. Define a custom vocabulary term (e.g. `@sap.core:Tags`) and use it as the annotation key in patch data.
2. Map tags to `@UI.QuickInfo` (single string, lossy) or `@Core.AlternativeAlias` (wrong semantics).
3. Store tags as ORD resource-level labels in the ORD overlay by patching the ORD resource metadata using an `ordId` selector — but this would require the tags to be visible at the ORD metadata level rather than in the format-specific file.

---

### Issue 5 — No Schema-level selector (spec gap)

**Affects:** OData v4 enrichment root `summary` and `description` fields (service-level metadata)

**Problem:**
The OData v4 enrichment format describes the *service* itself at the root level with `summary`, `description`, and `namespace`. In OData CSDL, these would be annotations on the `Schema` element (targeted by namespace). There is no ORD overlay concept-level selector for a Schema element.

A `jsonPath` workaround is possible for CSDL JSON targets:
```json
{
  "selector": { "jsonPath": "$['com.sap.HRService']" },
  "data": {
    "@Core.Description": "SAP HR Service",
    "@Core.LongDescription": "..."
  }
}
```
But this JSONPath is format-specific and fragile between CSDL JSON and EDMX XML.

**Suggested fix:**
Add a `namespace` or `schema` concept-level selector to the ORD Overlay spec, allowing Schema-level patching without JSONPath dependency.

---

### Issue 6 — No `enumType` selector (spec gap)

**Affects:** OData v4 enrichment `enumTypes[]` and `enumTypes[].members[]`

**Problem:**
The ORD overlay `entityType` selector resolves `EntityType` and `ComplexType` elements only. `EnumType` is a distinct element type in EDMX/CSDL JSON and is not included in the current selector resolution.

**Impact:**
Enum type and enum member enrichment (summary, description) cannot be converted.

**Suggested fix:**
Extend the `entityType` selector to also resolve `EnumType` elements, or add a dedicated `enumType` selector with an optional `member` sub-selector.

---

### Issue 7 — No return-type selector (spec gap)

**Affects:** OData v4 enrichment `actions[].returnType` and `functions[].returnType`

**Problem:**
In OData CSDL, a `ReturnType` is a child element of an `Action` or `Function`. There is no concept-level selector that can target the return type element independently of its parent operation.

**Impact:**
Return type enrichment (summary, description) is lost during conversion.

**Suggested fix:**
Extend the `operation` selector patch semantics to optionally include return type annotation data, or add a sub-concept like `returnType: true` alongside `operation`.

---

## Conversion Warning Categories

| Warning type | Meaning |
|---|---|
| `unsupported-concept` | The source concept cannot be represented as a valid ORD overlay patch without extending the spec. The element is skipped. |
| `lost-information` | Information is structurally dropped and cannot be round-tripped (e.g. tags, per-action descriptions). |
| `needs-spec-extension` | A partial conversion is generated but its correctness depends on a future ORD overlay spec or implementation enhancement (e.g. OData v2 FunctionImport `operation` patches). |
