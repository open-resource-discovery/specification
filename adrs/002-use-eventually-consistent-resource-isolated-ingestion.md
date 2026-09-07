---
status: proposed
date: 2026-09-06
depends-on:
  - ./001-add-push-transport-alongside-pull.md
---

# Use eventually consistent, resource-isolated push ingestion

## Context and Problem Statement

An ORD document can describe many related resources, and several sources may contribute to one application's metadata. Treating a whole document—or the document and all referenced definitions—as one transaction would let one failure block unrelated updates and would require coordination across requests. Partial publication is therefore a normal state, not merely an error condition.

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
- **Optional v1 behavior:** an aggregator can retain a last valid resource, definition, or Package after an invalid update, but it must report that fallback as stale.
- **Future extension:** a submission resource could group uploads, expose asynchronous status, and define an explicit commit boundary. Version 1 defines none of those semantics.

After request-wide checks, the aggregator validates and reports each item independently. It applies valid items and rejects or retains stale versions of invalid ones. Resource publication is not atomic across a document, its items, and its definitions.

The specification distinguishes three stages:

1. **Request acceptance** checks authentication, authorization, media type, framing, and safe receipt.
2. **Validation** parses the artifact, establishes its publication context, checks document-level constraints, and validates each top-level item or uploaded definition against currently available content.
3. **Resource publication** updates the discoverable state of each item with its available dependencies.

A malformed body, unsupported ORD version, unauthorized publisher, or invalid document context is a request-wide failure. Once a document is parsed and assigned to its context, validation and publication SHOULD be isolated per top-level item. One invalid resource or definition MUST NOT prevent otherwise valid, independent resources from being updated.

Before returning a success response, the aggregator MUST complete validation against currently available content. A document response MUST report whether each top-level item was applied, retained as stale, or rejected.

A valid resource MAY be published while a referenced definition is missing or invalid; the dangling link MUST be reported. The aggregator MUST revalidate stored content when related content changes. If a resource or definition update is invalid, the aggregator SHOULD retain its last valid version and mark it stale. A resource or definition that has never been valid MUST NOT be exposed as valid.

Package inheritance follows the same model but is not push-specific: an aggregator MAY use the last valid Package for existing dependent resources, but MUST report the stale fallback; a new dependent resource without a valid Package remains unresolved.

### Consequences

- ✅ Simple providers can upload documents and definitions independently.
- ✅ Transient ordering and partial failures converge without blocking unrelated resources.
- ✅ Every request receives its processing result directly.
- ⚠️ Discovery can temporarily contain dangling links or valid versions from different upload times.
- ⚠️ Aggregators must track item status, stale state, and cross-artifact revalidation.

## Alternatives

### Atomic document and definitions

- ✅ Accepted documents never contain dangling definition links.
- ⚠️ Definitions cannot always fit in one request, and one invalid item would block unrelated updates.

### Submission resource with explicit commit

- ✅ Could group several uploads, expose asynchronous validation status, and provide a multi-request consistency boundary.
- ⚠️ Requires lifecycle, retention, commit, retry, failure, and cleanup semantics, so it belongs in a future extension rather than the version-1 API.

### Aggregator-specific behavior

- ✅ Each implementation can choose its own behavior.
- ⚠️ Providers cannot rely on consistent failure and visibility behavior across aggregators.

## More Information

- [ADR 003: definition identity and linkage](./003-link-pushed-resource-definitions-by-resource-and-context.md)
- [ADR 005: minimum versioned HTTP API](./005-use-simple-artifact-endpoints-with-optional-optimizations.md)
