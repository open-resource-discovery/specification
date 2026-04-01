## Appendix

### Deep Dive: Overlays vs. Resource Definition Visibility

When additional metadata should only be visible to a narrower audience, two main approaches exist:

- publish a separate overlay that patches the target metadata for that audience
- publish multiple resource definitions of the same resource with different [`API Resource Definition.visibility`](../../spec-v1/interfaces/Document.md#api-resource-definition_visibility) settings

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
- the overlay patches ORD resource metadata itself rather than only one attached definition file
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

## Open TODOs

**Aggregator behavior and compatibility:**

- Decide how to indicate use-case-specific overlays when multiple overlays exist for the same target.

**OData selectors:**

- Define the implementation roadmap for `entityType` and `propertyType` selector support in the reference merge library.
- Decide whether OData overlays should be restricted to annotation-only patches (i.e. `data` keys MUST follow the `@TermName` convention). In practice, all meaningful OData enrichments are vocabulary annotations, and allowing arbitrary structural changes could produce invalid CSDL output. Restricting to annotations would also make the patch intent more explicit and aid validation. Note: OData patching/merging almost certainly operates at the annotation level — but it is not entirely clear whether `remove` or structural changes to non-annotation elements should also be supported (e.g. deprecating or removing an operation from a CSDL description).
- Decide whether the `entityType` selector should target only the EntityType/ComplexType definition, or also the EntitySet in the EntityContainer (or both). Currently only the EntityType definition is targeted. EntitySet-level annotations (e.g. `Capabilities`) sit on the EntitySet, not the EntityType, and are not reachable via the current selector — `jsonPath` is the current fallback for those cases.
- Consider aligning OData selectors with the standard [OData CSDL Annotation Target](https://oasis-tcs.github.io/odata-specs/odata-csdl-xml/odata-csdl-xml.html#Target) syntax. OData defines a well-specified path grammar for identifying any CSDL element as an annotation target (e.g. `MyService.MyEntityType/MyProperty`, `MyService.MyEntityContainer/MyEntitySet`). Using this as the native OData selector format would piggyback on an existing standard and avoid inventing a parallel addressing scheme. The trade-off is that consumers and implementors need deeper OData knowledge to construct and interpret selectors correctly, compared to the current named-key approach.
Reference: [OData CSDL XML 4.01](https://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/odata-csdl-xml-v4.01.html).
- Not sure if we need fully qualified selectors, maybe we can support both and only require fully qualified selectors in cases where it's ambiguous.

**Selectors in General**:

Use [@EntityRelationship](https://sap.github.io/csn-interop-specification/spec-v1/extensions/entity-relationship) annotations if available as selector for EntityType or PropertyType?
