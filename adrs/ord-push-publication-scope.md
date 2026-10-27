## Problem

Today, ORD removes information only through explicit tombstones. Providers that can list everything they currently publish, but don't keep track of what they deleted, need the aggregator to remove information by *omission*: whatever is missing from a complete set gets removed.

That only works if the aggregator knows the boundary of the complete set. An application or service is usually onboarded at the system type level, and its information can come from several ORD providers, deployment pipelines or teams. A complete set from one of them must not remove information that another one published.

This is a transport-neutral concern. It applies to pull transport today, and push transport (#187) shares it. This issue decides how ORD defines the boundary of an independently replaceable publication set.

## Options

| | Option 1: Publication-scope Group | Option 2: Package publication mode | Option 3: ORD provider contribution |
| --- | --- | --- | --- |
| PR | #230 | #232 | #233 |
| Boundary | Resources assigned to an `ord:publication-scope` Group | Resources assigned to a Package with `publicationMode: replace` | Everything one ORD provider contributes to one perspective / described system |
| Declared in | ORD Document (Group + `partOfGroups`) | ORD Document (Package property) | Aggregator onboarding |
| New schema concept | Standardized Group Type | Package property | None |
| Granularity | Any subset, can split a Package | Whole Packages | Whole ORD provider; finer only by onboarding more ORD providers |
| Who enables replacement | Transport or onboarding (WIP) | Package declaration plus aggregator support | Onboarding |
| Boundary retrievable through the ORD model | Yes, as Group membership | Yes, as Package membership and `publicationMode` | No, aggregator-specific |

### Option 1: `ord:publication-scope` Group Type (#230)

**Pros**
- Keeps publication boundaries separate from Package catalog presentation, ownership attribution and inherited metadata.
- Can partition one Package or one ORD provider's information without changing Package assignments.
- The publication scope is explicit in the ORD model. Once an aggregator implements it, scope membership can be retrieved again through standard ORD information, for example from the ORD Discovery API, instead of being an unstandardized aggregator implementation detail.
- Providers, aggregators and tools can check membership against the same model.

**Cons**
- Adds a standardized Group Type and a second resource assignment that providers must keep consistent.
- Covers only ORD resources (`partOfGroups`). Packages, Consumption Bundles and other taxonomy still need tombstones.
- Membership alone does not enable replacement. Without a transport or onboarding binding it has no effect.

### Option 2: `Package.publicationMode` (#232)

**Pros**
- Reuses the mandatory `partOfPackage` assignment and the existing idea of Packages as resources published together.
- The replacement boundary and the intent to replace are explicit in the ORD model on the Package itself. Like option 1, they can be retrieved again through standard ORD information instead of being an aggregator implementation detail.

**Cons**
- Ties replacement boundaries to catalog Packages and their inherited metadata.
- Cannot split a Package without changing its membership, and with it the catalog behavior.
- Puts a destructive switch into the provider's self-description: editing one property turns omission into deletion.
- Moving a resource between Packages looks like a deletion when only part of the set is retrieved.
- An empty replacement set needs an empty Package, which goes against the existing advice to avoid empty Packages.
- Package assignments would have to be enforced strictly. Today the schema requires `partOfPackage` to be a valid reference, but aggregators only SHOULD check references and MAY accept dangling ones. A boundary based on Packages needs that to become a MUST for all transports.

### Option 3: ORD provider contribution, configured through onboarding (#233)

**Pros**
- No new schema concept. Providers don't need to change their documents.
- Authority and boundary come from the same place, aggregator onboarding, and ORD information can't widen either.
- ORD ID uniqueness within a perspective already keeps the contributions of different ORD providers disjoint.
- Covers resources and taxonomy alike.
- The aggregator needs to know which ORD provider contributed what anyway, so options 1 and 2 need this as well.

**Cons**
- Finer boundaries require onboarding more ORD providers (for example one per deployment pipeline), which costs setup work on the aggregator side.
- The boundary is not part of the ORD model. Which ORD provider contributed what is an unstandardized aggregator implementation detail, so providers, consumers and tools cannot retrieve it through standard ORD information, and every aggregator implements it differently.
- Moving information between ORD providers has to happen in order: remove it first, then publish it, or the aggregator reports a duplicate.

## How the options relate

Option 3 is the baseline. Every option needs the aggregator to know which ORD provider contributed what, and options 1 and 2 also require exactly one authoritative ORD provider per scope or Package. So options 1 and 2 refine option 3 within one ORD provider rather than replace it.
They also add something option 3 cannot provide on its own: an explicit, standardized representation of the boundary in the ORD model.

The decision is therefore:
1. Adopt option 3 as the baseline.
2. Decide whether ORD needs the boundary to be explicit in the ORD model, or a finer boundary *inside* one ORD provider. If so, choose option 1 or option 2, not both.

## Questions to decide

- Are there real cases where one ORD provider needs several independently replaceable sets that can't reasonably be onboarded as separate ORD providers?
- Should the replacement boundary be explicit in the ORD model and retrievable through standard ORD information, or is it fine for it to remain an aggregator implementation detail established during onboarding?
- Should the decision to replace sit with the provider (option 2) or with the transport / onboarding (options 1 and 3)?

