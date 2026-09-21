---
date: 2026-09-06
depends-on:
  - ./001-add-push-transport-alongside-pull.md
---

# Use eventually consistent, resource-isolated push ingestion

## Context and Problem Statement

An ORD document can describe many related resources, and several sources may contribute to one application's metadata. Treating a whole document (or the document and all referenced definitions) as one transaction would let one failure block unrelated updates and would require coordination across requests. Partial publication is therefore a normal state, not merely an error condition.

Pull already retrieves an ORD document and each definition separately, allowing temporary dangling references. Push should preserve this eventual consistency while defining interoperable failure isolation and reporting. What should succeed or fail together?

## Decision Drivers

- Keep the unit of change small enough for scalable replication and partial publication.
- Match the existing rule that cross-resource references may temporarily dangle.
- Prevent one faulty resource or definition from blocking unrelated resources.
- Preserve observable validation problems rather than silently hiding them.

## Decision Outcome

Chosen option: **independently accept artifacts and publish valid items with partial failure isolated per item**.

### Version-1 (MVP) scope

- **Required:** each request is processed synchronously against currently available content; failures are isolated per top-level item after request-wide checks; stored content is revalidated when related content changes.
- **Optional v1 behavior:** an aggregator can retain a last valid resource or Package after an invalid item update, but it must report that fallback as stale.
- **Future extension:** a publication cycle could identify several document POSTs as one complete set, while a transactional submission resource could additionally stage uploads, expose asynchronous status, and define an explicit commit boundary. Version 1 defines neither extension.

After request-wide checks, the aggregator validates and reports each item independently. It applies valid items and rejects or retains stale versions of invalid ones. Resource publication is not atomic across a document, its items, and its definitions.

The specification distinguishes three stages:

1. **Request acceptance** checks authentication, authorization, media type, framing, and safe receipt.
2. **Validation** parses the artifact, establishes its publication context, checks document-level constraints, and validates each top-level item or uploaded definition against currently available content.
3. **Resource publication** updates the discoverable state of each item with its available dependencies.

A malformed body, unsupported ORD version, unauthorized publisher, invalid document context, or invalid top-level array structure is a request-wide failure. Once the envelope is safe to process, the aggregator MUST validate each top-level item independently. An item-level schema or semantic error MUST NOT prevent otherwise valid, independent items from being updated.

Before returning a success response, the aggregator MUST complete validation against currently available content. A document response MUST report whether each top-level item was applied, retained as stale, or rejected.

A valid resource MAY be published while a referenced definition is missing or invalid; the dangling link MUST be reported. The aggregator MUST revalidate stored content when related content changes. If a resource update is invalid, the aggregator SHOULD retain its last valid version and mark it stale. A resource that has never been valid MUST NOT be exposed as valid.

A resource-definition request contains one definition. If it has any validation error, the aggregator rejects the request as a whole and leaves previously accepted bytes unchanged. A valid definition can be accepted as pending when its relationship to an ORD resource cannot yet be verified.

Version 1 requires the aggregator to revalidate pending content when related content arrives but does not define how a provider observes a later outcome.
Whether providers should resubmit a pending definition, use aggregator-specific diagnostics, or use a future standard status resource remains an open question.

For each ORD item or definition association, the last accepted update wins. Version 1 does not infer chronological order from document content. `stale` means that a previous valid item was retained after an invalid update; it does not mean that an older update was detected.

Package inheritance follows the same model but is not push-specific: an aggregator MAY use the last valid Package for existing dependent resources, but MUST report the stale fallback; a new dependent resource without a valid Package remains unresolved.

Because ingestion is per-item and no push carries a delta or a "complete set" marker, there is no operation that atomically replaces a whole perspective. A later document that omits an item does not retract it. To fully replace a perspective, a provider upserts the intended items and MUST tombstone every previously published item that should no longer exist; the aggregator does not treat absence from a push as removal. Reconciling against the prior published set is therefore the provider's responsibility.

This places a standing synchronization burden on the provider for the entire lifetime of the publishing scope. When a resource disappears at the source (an API is disabled, a plugin is uninstalled, a feature is toggled off), the provider must independently detect that removal and emit the matching tombstone. A missed removal is not self-correcting: the aggregator has no way to know the item is gone and will serve stale content indefinitely, and the two states can drift further apart with every subsequent partial push. Getting this right requires the provider to durably track exactly what it has ever published and diff it against current reality on every change, which is precisely the reconciliation logic a full-replacement operation would otherwise absorb.

A future scoped current-state replacement operation could let a provider declare the complete state it currently owns, with the aggregator deriving removals by set difference.
Its target would be the contributions attributed to one authenticated publisher in exactly one publication context, not an ORD Document, because the document is only an identity-less envelope.
The aggregator would need to retain contribution provenance independently of ORD ID namespace authorization.
A namespace may narrow an authorized replacement scope, but it cannot establish ownership by itself: another publisher or delegator may contribute metadata for the same described system, publication context, or authorized namespace.
Replacing one publisher's state MUST NOT remove those contributions.
The operation would also need to define how validation failures affect replacement.

The existing `POST /v1/documents` operation could be extended without assigning identities to ORD Documents.
The provider would associate every document in a complete-state publication with one publication-cycle identifier and, after all documents were processed successfully, send an explicit completion signal.
During the cycle, the aggregator would record which contributions in the replacement scope were observed.
On completion, it would remove previously stored contributions in that scope that were not observed.
A rejected request would not complete the cycle, and an abandoned cycle would expire without causing removals.
This reuses the per-item processing model, but it still requires new cycle identity, completion, concurrency, retry, and expiry semantics that version 1 does not define.

Another possible design is a submission resource with an explicit "complete set" or commit boundary, for example *begin → declare the current set → commit*.
This is an illustrative variant rather than the standardized implementation, but it fits the requirement better when uploads and removals need to become visible atomically.
A submission can stage all ORD Documents and resource definitions, validate the complete set, and retain the previous published state until commit succeeds.
A companion "delete all content in a publishing scope" operation is only coherent inside such a transactional boundary (drop-then-add within one commit); offered as a bare stateless call it would create a window where the scope is empty and could leave it empty on a failed follow-up.
The absence of any standardized current-state replacement is a real limitation of the per-item model chosen for v1.

### Consequences

- ✅ Simple providers can upload documents and definitions independently.
- ✅ Transient ordering and partial failures converge without blocking unrelated resources.
- ✅ Every request receives its processing result directly.
- ⚠️ Discovery can temporarily contain dangling links or valid versions from different upload times.
- ⚠️ Aggregators must track item status, stale state, and cross-artifact revalidation.
- ⚠️ Fully replacing a perspective requires the provider to tombstone removed items itself; absence from a push is never removal. An explicit full-replacement primitive is deferred to a future publication-cycle or submission extension.
- ⚠️ Tombstones must be emitted correctly for every removal over the whole lifetime of the publishing scope. A missed tombstone (a resource disabled or uninstalled without one) leaves stale content that never self-corrects, so providers carry standing reconciliation logic that a transactional replace-set operation would remove.

## Alternatives

### Atomic document and definitions

- ✅ Accepted documents never contain dangling definition links.
- ⚠️ Definitions cannot always fit in one request, and one invalid item would block unrelated updates.

### Submission resource with explicit commit

This is not only a later add-on: adopting it from the start is a genuine alternative to the chosen per-item model, making transactional submit-then-commit the v1 baseline instead of eventual consistency. A concrete sketch of the endpoints is in [ADR 005](./005-use-simple-artifact-endpoints-with-optional-optimizations.md#sketch-of-a-future-submission-extension-non-normative).
The endpoint sketch records one design variant discussed during review; it is not a commitment to that API shape.

- ✅ Could group several uploads, expose asynchronous validation status, and provide a multi-request consistency boundary.
- ✅ Makes full-perspective replacement a first-class operation: the provider declares the complete current set within one commit and the aggregator derives removals by set difference, so providers no longer maintain lifetime tombstone reconciliation. A scoped "delete all content" is coherent here as a drop-then-add inside the same commit, without a window where the scope is left empty.
- ✅ Fits multi-document providers better than adding replacement semantics to one document request and can keep the previous published state visible until the whole replacement is valid.
- ⚠️ Requires lifecycle, retention, commit, retry, failure, and cleanup semantics up front, so it is a larger v1 surface than the two artifact endpoints.
- ⚠️ Diverges from pull, which is itself eventually consistent and per-artifact; the per-item model keeps push and pull aligned, so this was chosen as the v1 baseline and the submission model deferred rather than ruled out.
- ➕ Not mutually exclusive with the chosen model: because a submission would stage the same document and definition uploads and only add a commit boundary, it can be layered on later as an additive option without changing the per-item endpoints. The baseline stays simple, and providers that need atomic replacement opt into submissions when the extension exists.

### Reconcile through the ORD Discovery API

- ✅ A provider that can query the ORD IDs it previously published could compare them with its current state and generate tombstones for the difference.
- ⚠️ The ORD Discovery API is a consumer-facing interface and its contract is not standardized, so making it part of the publication workflow would couple an interoperable push API to aggregator-specific query and projection features.
- ⚠️ The result must be restricted to contributions attributed to the authenticated publisher in exactly one publication context. A namespace filter or merged discovery result is not a safe deletion inventory when several publishers or delegators contribute metadata to the same context.
- ⚠️ A read-then-write sequence can race with concurrent updates and still requires the provider to implement reconciliation. It does not provide the semantics of one scoped current-state replacement.

### Aggregator-specific behavior

- ✅ Each implementation can choose its own behavior.
- ⚠️ Providers cannot rely on consistent failure and visibility behavior across aggregators.

## More Information

- [ADR 003: definition identity and linkage](./003-link-pushed-resource-definitions-by-resource-and-context.md)
- [ADR 005: minimum versioned HTTP API](./005-use-simple-artifact-endpoints-with-optional-optimizations.md)
