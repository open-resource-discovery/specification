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

### Deep Dive: ORD Configuration vs. Attached Resource Definition

Overlays can be distributed either through the ORD Configuration endpoint or by attaching them as `ord:overlay:v1` resource definitions to a resource.
Those options are not interchangeable in practice, because they imply different ownership and publication models.

The strongest discriminator is ownership:
if the overlay is created by a different ORD Provider than the one describing the target resource,
there is in practice no way to attach that overlay as a resource definition of the foreign resource.
In that case, ORD Configuration is the viable distribution mechanism.

#### Prefer ORD Configuration when

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

- ORD Configuration is more flexible for independent publishers, cross-resource overlays, and separate release cycles
- attached resource definitions are easier to understand when the overlay is just another producer-owned artifact of the same resource
- ORD Configuration makes provenance and authorization more important, because overlays may come from outside the original resource provider
- attached overlays reduce indirection, but only work when the publisher controls the target resource entry

Rule of thumb:

- use attached resource definitions for producer-owned, resource-local overlays
- use ORD Configuration for externally managed, cross-resource, or ORD-level overlays

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
