## Appendix

### Deep Dive: Overlays vs. Resource Definition Visibility

When additional metadata should only be visible to a narrower audience, two main approaches exist:

- publish a separate overlay that patches the target metadata for that audience
- publish multiple resource definitions of the same resource with different [`API Resource Definition.visibility`](../../spec-v1/interfaces/Document.md#api-resource-definition_visibility) settings

These approaches solve related but not identical problems:

- resource-definition visibility controls who can access a concrete published resource definition file
- overlays control how additional metadata can be layered onto an existing target without changing that original source

The overlay approach is better when the enriched information is managed by a different team, follows a different lifecycle, or should stay clearly separated from the original resource definition source.
It also allows multiple overlays for the same target, for example for different internal use cases, governance layers, or enrichment profiles.

The tradeoff is that overlays decouple the enrichment from the original source document, which can introduce sync and lifecycle issues.
If the enrichment originates from the same team and the same source system that already publishes the resource definition, it can be more reliable to publish the resource definition twice instead:

- a public definition
- an internal definition with additional metadata enrichments

That duplicated resource-definition approach keeps the information self-contained in the original format and remains fully compatible for consumers that do not understand overlays.
With overlays, aggregator-side patching is not universally implied yet; if an aggregator does not apply them, a consumer would need to understand overlays and patch them in on its own.

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

#### Operational considerations

- overlays improve separation of concerns, but they add a second source of truth
- overlays can be easier to audit organizationally, because they make enrichment ownership explicit
- overlays can also introduce ordering, conflict-resolution, and provenance questions once multiple overlays target the same metadata
- duplicated resource definitions reduce consumer complexity, but they increase publisher-side duplication and consistency obligations
- visibility and overlays can be combined: a definition may already have narrowed visibility, and an additional overlay may further enrich only that narrower audience's view

#### Practical recommendation

If the enriched information comes from the same application or service team that already owns the resource definition, prefer publishing multiple resource definitions with different visibility.
If the enriched information comes from a separate governance, enablement, or platform team, overlays are often the better fit.

A pragmatic rule of thumb:

- use resource-definition visibility for authoritative producer-owned variants
- use overlays for additive, externally managed, or use-case-specific enrichment layers

### Deep Dive: ORD Configuration vs. Attached Resource Definition

Overlays can be distributed either through the ORD Configuration endpoint or by attaching them as `ord:overlay:v1` resource definitions to a resource.
Those options are not interchangeable in practice, because they imply different ownership and publication models.

#### Prefer ORD Configuration when

- the overlay is created by someone other than the original resource provider
- the overlay patches ORD resource metadata itself rather than only one attached definition file
- the overlay is cross-cutting and applies to multiple resources
- the overlay should be published independently from the lifecycle of one concrete API or Event resource
- the overlay provider needs its own publication channel and cannot modify the target resource entry

This is especially important for third-party or platform-managed overlays.
If the overlay is created by a different ORD Provider than the one describing the target resource, there is in practice no way to attach that overlay as a resource definition of the foreign resource, because the resource entry belongs to that other provider.
In such cases, ORD Configuration is the viable distribution mechanism.

#### Prefer attaching as a resource definition when

- the same ORD Provider owns both the target resource and the overlay
- the overlay belongs to the resource as part of the producer-owned metadata package
- consumers should discover the overlay directly next to the resource definition it patches
- the overlay lifecycle is tightly coupled to one specific API or Event resource
- the producer wants the co-location to be explicit in the resource metadata itself

#### Tradeoffs

- ORD Configuration is more flexible for independent publishers, cross-resource overlays, and separate release cycles
- attached resource definitions are easier to understand when the overlay is just another producer-owned artifact of the same resource
- ORD Configuration makes provenance and authorization more important, because overlays may come from outside the original resource provider
- attached overlays reduce indirection, but only work when the publisher controls the target resource entry

#### Practical recommendation

If the overlay is producer-owned and tightly bound to one resource, attaching it as a resource definition is usually the cleaner model.
If the overlay is managed externally, spans multiple resources, or patches ORD-level metadata, publish it via ORD Configuration.

## Open TODOs

**Aggregator behavior and compatibility:**

- Clarify expectations towards ORD Aggregators regarding overlay patching behavior.
- Decide how to indicate use-case-specific overlays when multiple overlays exist for the same target.

**Overlay `ordId`:**

- Decide whether the overlay document itself needs a stable `ordId`.
- If overlays are published only via the configuration endpoint, define what that stable ID should represent.
- Decide whether `ordId` stays optional or becomes mandatory.

**Target resolution and matching:**

- Decide what should be optional vs mandatory on `target`.
- Decide whether transparency-oriented fields such as `url` and `correlationIds` stay in the model.
- Align the spec-level target identifiers with reference merge behavior, especially when `requireTargetMatch` is enabled.

**Extension model naming:**

- Decide how model extensions should avoid interface-name collisions with ORD core models.
- Confirm whether extension-local definitions should always use an explicit prefix such as `Overlay...`.

**Patch value model:**

- Decide whether `PatchValue` should remain an explicit JSON-type union or become a truly unconstrained value (`unknown` / `any`) once the toolkit supports that shape cleanly.
- Decide whether `null` should be supported as an explicit standalone patch value outside `remove` masks.

**OData selectors:**

- Validate the `operation` selector mapping with OData experts.
- Best current guess: map selector `operation` to schema-level `Action`/`Function` names, preferring fully-qualified names, or to container-level `ActionImport`/`FunctionImport` names when exposed via the entity container.
- Define the implementation roadmap for `entityType` and `propertyType` selector support in the reference merge library.

Reference: [OData CSDL XML 4.01](https://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/odata-csdl-xml-v4.01.html).
