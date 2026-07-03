## Appendix

### Tips: Inline Property Merging for OData Targets

When patching OData metadata (EDMX or CSDL JSON), properties can be annotated inline within their parent entity type, complex type, or enum type patch instead of using separate `propertyType` selector patches:

```json
{
  "selector": { "entityType": "OData.Demo.Customer" },
  "action": "merge",
  "data": {
    "@Core.Description": "Entity description",
    "Name": {
      "@Core.Description": "Customer name"
    },
    "Email": {
      "@Core.Description": "Email address"
    }
  }
}
```

This inline approach:
- reduces the number of patches
- keeps related annotations together
- improves readability by showing the entity structure
- works for `entityType`, `complexType`, and `enumType` selectors

### Deep Dive: Overlays vs. Resource Definition Visibility

When additional metadata should only be visible to a narrower audience, two main approaches exist:

- publish a separate overlay that patches the target metadata for that audience
- publish multiple resource definitions of the same resource with different [API Resource Definition](../../spec-v1/interfaces/Document.md#api-resource-definition) visibility settings

These approaches solve different problems:

- resource-definition visibility controls who can access a concrete published definition file
- overlays add another metadata layer without modifying the original source

#### Prefer overlays when

- the enrichment is owned by a different team than the team publishing the base resource definition
- the enrichment has a different lifecycle, approval workflow, or release cadence
- the enrichment should be optional and separable from the original source
- multiple parallel enrichments may exist for different consumers or use cases
- the original source format should remain untouched, for example because it is generated elsewhere or mirrored from another system

#### Prefer multiple resource definitions with different visibility when

- the same producer team owns both the public and internal metadata
- the enriched information is part of the authoritative source and should not drift from it
- full consumer compatibility is required without assuming overlay support
- the difference is primarily "what full definition should this audience receive?" rather than "what extra layer should be applied afterward?"
- the provider already has a reliable publishing pipeline for separate public/internal definition artifacts

#### Main tradeoff

- overlays improve separation of concerns, but they add a second source of truth and may create ordering, sync, and provenance questions
- duplicated resource definitions reduce consumer complexity and stay self-contained, but they increase publisher-side duplication and consistency obligations
- both approaches can be combined: a narrower-visibility definition may still be enriched further via overlay

Rule of thumb:

- use resource-definition visibility for authoritative producer-owned variants
- use overlays for additive, externally managed, or use-case-specific enrichment layers

### Deep Dive: ORD Document Resource vs. Attached Resource Definition

Overlays can be distributed either as a standalone `OrdOverlayResource` in an ORD Document or by attaching them as `ord:overlay:v1` resource definitions to an API or Event resource.
Those options are not interchangeable in practice, because they imply different ownership and publication models.

The strongest discriminator is ownership:
if the overlay is created by a different ORD Provider than the one describing the target resource,
there is in practice no way to attach that overlay as a resource definition of the foreign resource.
In that case, distributing it as an `OrdOverlayResource` in a separate ORD Document is the viable option.

#### Prefer an ORD Document Resource when

- the overlay is created by someone other than the original resource provider
- the overlay is cross-cutting and applies to multiple resources
- the overlay should be published independently from the lifecycle of one concrete API or Event resource
- the overlay provider needs its own publication channel and cannot modify the target resource entry

#### Prefer attaching as a resource definition when

- the same ORD Provider owns both the target resource and the overlay
- the overlay belongs to the resource as part of the producer-owned metadata package
- consumers should discover the overlay directly next to the resource definition it patches
- the overlay lifecycle is tightly coupled to one specific API or Event resource
- the producer wants the co-location to be explicit in the resource metadata itself

#### Main tradeoff

- ORD Document Resources are more flexible for independent publishers, cross-resource overlays, and separate release cycles
- attached resource definitions are easier to understand when the overlay is just another producer-owned artifact of the same resource
- ORD Document Resources make provenance and authorization more important, because overlays may come from outside the original resource provider
- attached overlays reduce indirection, but only work when the publisher controls the target resource entry

Rule of thumb:

- use attached resource definitions for producer-owned, resource-local overlays
- use ORD Document Resources for externally managed, cross-resource, or independently versioned overlays

### Appendix: Relation to the OpenAPI Initiative Overlay Specification

The [OpenAPI Initiative Overlay Specification](https://spec.openapis.org/overlay/v1.0.0.html) (OAS Overlay) inspired the overall idea of ORD Overlay:
express metadata enrichment as a separate document that patches a target file, without modifying that file.
ORD Overlay reuses that core pattern, and even preserves 1:1-compatible fields like `actions[].description` on individual patches to allow lossless round-tripping of OpenAPI-only overlays.

However, ORD Overlay is intentionally a **dedicated, ORD-opinionated model** rather than a thin wrapper around OAS Overlay.
This section explains what motivated a dedicated model and where the two specifications differ.

#### Why a dedicated ORD Overlay model

- **Multi-format targets.** OAS Overlay is defined against OpenAPI documents.
  ORD-described resources use many other metadata formats — AsyncAPI, OData EDMX and CSDL JSON, GraphQL SDL,
  A2A Agent Cards, MCP tool metadata, CSN Interop, SAP RFC / SQL API metadata, and more.
  A single overlay model that works across all these formats is a native ORD concern and not in scope for OAS Overlay.
- **Concept-level selectors instead of only JSONPath.** OAS Overlay uses JSONPath as its selector language.
  JSONPath is powerful but tightly couples the overlay to the structural layout of a specific format version.
  ORD Overlay defines concept-level selectors (`operation`, `entityType`, `entitySet`, `parameter`, `returnType`, ...)
  that are resilient to structural changes (e.g. OpenAPI 3.0 to 3.1, EDMX to CSDL JSON).
  `jsonPath` is still available as a generic fallback.
- **Integration with ORD identifiers.** ORD Overlay's `target.ordId` and `target.definitionType` connect an overlay
  directly to the ORD resource graph, so ORD Aggregators can resolve, authorize, and merge overlays without
  format-specific heuristics.
- **`purpose` and `visibility` on overlays and their patches.** ORD Overlay carries first-class `purpose`
  (e.g. `ord:ai-enrichment`, `ord:agent-security-permissions`) and `visibility` on the overlay resource definition entry.
  This enables audience-scoped variants and governance decisions that OAS Overlay does not model.
- **Explicit patch actions.** OAS Overlay expresses removal via an `remove: true` flag and updates via `update` payloads.
  ORD Overlay uses three explicit actions — `update`, `merge`, `remove` — with well-defined semantics per action
  (including JSON Merge Patch style delete via `null`), which fits the wider range of target formats better
  than a single JSONPath-driven mutation.
- **First-class publishing paths.** Overlays can be attached to an API/Event resource as a
  `resourceDefinitions` entry with `type: ord:overlay:v1`, or published as a standalone `OrdOverlayResource`
  in an ORD Document. Both paths participate in normal ORD discovery, authorization, and lifecycle handling.
- **Overlay-specific perspective.** The overlay `perspective` (`system-type`, `system-version`, `system-instance`)
  scopes *where the patch applies*, which has no analogue in OAS Overlay.

#### Where the two specifications overlap

- Both keep overlays as a separate file from the target, to preserve the original source.
- Both support enrichment (adding descriptions, annotations, examples) as the primary use case.
- ORD Overlay `patches[].description` maps 1:1 to OAS Overlay `actions[].description`, enabling
  lossless round-trip conversion for OpenAPI-only overlays.

#### Interoperability with OAS Overlay documents

Publishers who prefer authoring their overlays in the OpenAPI Initiative Overlay format can still expose them
through ORD by attaching the file as a resource definition with `type: oas-overlay-v1` on the corresponding
API resource, or by describing it via an `OrdOverlayResource` whose `definitions` entry uses that type.
This keeps OAS Overlay documents discoverable through ORD without forcing them into the ORD Overlay format.

Conversion between the two formats is possible for the OpenAPI subset of targets, but not required by this specification.

## Compatibility Expectations

Overlays SHOULD NOT change the target in incompatible ways.
The typical use case is **enrichment**: adding information that helps consumers better discover or understand the described resources.
An overlay may also add machine-readable metadata that specific use cases require (hinted at via `purpose`).

In some cases it is acceptable to **remove** parts of the metadata — for example when the intended consumer (again guided by `purpose`) should not see information that is irrelevant or confusing in their context.

As a general rule, the result after applying an overlay SHOULD be a **compatible variant** of the original:
either an enriched superset or a valid subset, but not a contradictory or structurally incompatible.

Examples of changes that are typically **appropriate**:
- Adding or improving descriptions, summaries, or documentation links
- Adding annotations or tags for classification, AI grounding, or search
- Adding metadata required by a specific consumer scenario (e.g. capability annotations)
- Removing fields that are irrelevant to a narrower audience

Examples of changes that are typically **inappropriate**:
- Changing identity fields (`ordId`, `version`, resource type)
- Altering the structural contract in ways that break existing consumers (e.g. removing required properties from a schema, changing field types)
- Contradicting the original meaning of the resource (e.g. changing a resource's title to describe something else entirely)

Enforcement of these expectations is left to ORD Aggregators and overlay governance processes.
The `purpose` field on the overlay's resource-definition entry can help aggregators decide which changes are acceptable for a given overlay source.

## Current Constraints

- Overlays replace string values as complete values. If you need to refine a summary or description, compute the final string in the patch payload and apply it with `update` or `merge`.
- The specification defines patch order within one overlay file. If multiple overlay documents apply to the same target, providers and aggregators should define and document a deterministic processing order outside this specification.
- For OData, prefer the dedicated selectors in this spec: `entityType`, `complexType`, `enumType`, `propertyType`, `entitySet`, `namespace`, `parameter`, and `returnType`.
- In OData, `entityType` targets the type definition itself. EntityContainer-bound annotations such as `Capabilities` belong on `entitySet`; use `jsonPath` only when no dedicated selector fits.
- OData patch values MUST use CSDL JSON annotation format (`@TermName` keys). After applying an overlay, validate the merged result with format-specific tooling before publication.
- Use namespace-qualified OData operation and type names whenever ambiguity is possible. ORD Overlay uses its own concept-level selector shapes; external notations such as [OData CSDL Annotation Target](https://oasis-tcs.github.io/odata-specs/odata-csdl-xml/odata-csdl-xml.html#Target) are informative background, not alternative selector syntaxes in this version.
- Selector alternatives based on source-model annotations, such as [@EntityRelationship](https://sap.github.io/csn-interop-specification/spec-v1/extensions/entity-relationship), are outside the scope of ORD Overlay 0.1.
