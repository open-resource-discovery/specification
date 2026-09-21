---
date: 2026-09-06
depends-on:
  - ./001-add-push-transport-alongside-pull.md
  - ./002-use-eventually-consistent-resource-isolated-ingestion.md
  - ./003-link-pushed-resource-definitions-by-resource-and-context.md
  - ./004-authorize-pushes-using-publisher-credentials.md
---

# Use simple versioned artifact endpoints

## Context and Problem Statement

The related decisions define push semantics, but providers still need an interoperable HTTP contract for documents, definitions, retries, validation results, errors, and large uploads. ORD documents have no identity, while resource definitions belong to addressable ORD resources. Which operations and behaviors belong in the version-1 API?

## Decision Drivers

- Treat an ORD Document as an identity-less transport envelope.
- Make definition replacement and retry idempotent.
- Return a complete processing result with each request.
- Set a useful document-size baseline without assuming limits for definition formats.
- Let each aggregator choose and communicate its API base URL.

## Decision Outcome

Chosen option: **post document envelopes and put individual definition associations**.

### Version-1 (MVP) scope

- **Required:** the two endpoints below process requests synchronously and return validation results; document requests are identity-less, definition requests are idempotent, and request-wide errors use Problem Details. Publication context is inferred from authenticated state where unambiguous and supplied explicitly only as needed.
- **Optional v1 optimizations:** `Idempotency-Key`, standard HTTP conditional requests, strong ETags, `Content-Digest`, and physical byte deduplication can be used without changing resource identity or publication semantics.
- **Future extensions:** a publication cycle could identify several document POSTs as one complete set, while a submission resource could additionally stage uploads, expose asynchronous validation status, and define an explicit commit boundary. Aggregator self-description could advertise the push endpoint, capabilities, and implementation limits. Version 1 defines none of these extensions.

The minimum version-1 API has these paths relative to an implementation-defined base URL:

```text
POST   /v1/documents{?systemInstanceId}
PUT    /v1/resource-definitions{?perspective,ordId,url,systemVersion,systemInstanceId}
```

The aggregator communicates its base URL during onboarding or through its own discovery mechanism. For example, it could use `https://aggregator.example.org/ord-push`; the `/v1` paths are standardized.

`POST /v1/documents` accepts one standard ORD Document as an identity-less envelope and creates no document resource. The document MUST explicitly include its perspective. Credentials and document content determine the publication context. For `system-instance`, an optional aggregator-issued `systemInstanceId` can identify the same context used by definition uploads. If omitted, the remaining context MUST identify exactly one instance; the parameter MUST NOT be used for another perspective. Omitting an item from a later document does not remove it; providers use ORD tombstones instead. Retrying a request may repeat processing but does not create duplicate ORD resources.
Submitting the same ORD ID again updates that ORD item directly. It does not require a GET or DELETE of the earlier envelope.

The HTTP verbs reflect whether the target has an identity: a document does not, so it is submitted with `POST`; the definition association from [ADR 003](./003-link-pushed-resource-definitions-by-resource-and-context.md) does, so `PUT` can replace it idempotently.

`PUT /v1/resource-definitions` stores native definition bytes.
The request always identifies the resource and exact definition URL.
It MAY omit `perspective`, `systemVersion`, or `systemInstanceId` when the authenticated credential context determines exactly one applicable value; otherwise, it MUST supply enough context to identify one authorized association.
A provider replaces a definition by uploading new bytes to the same association. Implementations SHOULD support strong `ETag`, `If-None-Match: *`, and `If-Match`; a verified `Content-Digest` MAY provide transfer integrity and aid deduplication.

The minimum contract has no operation to withdraw one definition. Providers replace its bytes or retire the resource and its definitions through ORD tombstones.

A document request returns `200 OK` with an `applied`, `stale`, or `rejected` outcome for every top-level item. The aggregator MUST first validate against currently available content. An accepted definition request returns `201 Created` for a new association or `200 OK` for a replacement, with an `applied` or `pending` result. A definition with any validation error is rejected as a whole with `422 Unprocessable Content`, and previously accepted bytes remain unchanged. This includes a definition for a known resource that does not declare the supplied exact URL or a compatible media type.

For each ORD item or definition association, the last accepted update wins. Version 1 does not infer chronological order from document content. `stale` only describes a previous valid document item retained after an invalid update.

Request-wide failures use RFC 9457 Problem Details (`application/problem+json`). An optional `issues` extension provides portable error, warning, and information fields. Aggregators MAY add validator-specific extension members; clients MUST ignore unknown extensions.
Providers MUST inspect the response body even after a successful HTTP status and MUST treat every `rejected` or `stale` item as an unsuccessful update.
They SHOULD retain or expose the returned diagnostics until the source metadata or publication configuration is corrected.
Providers SHOULD retry transient transport and server failures with backoff, but SHOULD NOT retry unchanged requests that failed validation or authorization.
How diagnostics reach a developer or operator is implementation-specific.

Providers SHOULD keep ORD documents within 2 MB (2,000,000 bytes). An aggregator MUST accept documents up to and including that size and MAY support a larger documented limit. ORD defines no baseline size limit for resource definitions because some formats cannot be divided across files; an aggregator MAY set and MUST document its own limit. A future aggregator self-description could advertise these limits.

### Consequences

- ✅ Document publication requires one parameter-free request.
- ✅ Definition uploads are independently replaceable and retryable.
- ✅ Providers receive validation results without polling a status resource.
- ⚠️ A provider can need one request per changed definition.
- ⚠️ Retrying a document POST can repeat processing, although it does not duplicate ORD resources.

## Alternatives

### PUT documents by client-assigned ID

- ✅ Makes document replacement and HTTP retries idempotent.
- ⚠️ Gives an identity to an otherwise identity-less envelope and requires client ID and deletion semantics.

### Complete-state replacement across document POST requests

This differs from replacing an ORD Document.
The target would be the complete set of contributions attributed to the authenticated publisher in exactly one publication context, and omission from the completed set would mean removal.
It could support providers that always know their current resources but do not retain a history from which to create tombstones.

A provider whose state spans several ORD Documents could continue uploading every document through `POST /v1/documents`.
Each request would carry the same publication-cycle identifier, and the provider would send an explicit completion signal after all document requests had succeeded.
The aggregator would mark contributions observed during that cycle and, on completion, remove previously stored contributions in the same replacement scope that were not observed.
The cycle identifier and completion mechanism are deliberately not specified by the version-1 API.

- ✅ Reuses the selected document upload and per-item processing model and does not assign an identity to each ORD Document.
- ✅ Lets the aggregator derive removals without a provider-side read-diff-tombstone cycle.
- ⚠️ Must define the exact replacement scope, contribution provenance, cycle identity, completion, failure handling, concurrency, retries, and expiry. A namespace can narrow the scope but cannot establish ownership because another publisher or delegator may contribute content for the same system, context, or namespace.
- ⚠️ Applying document updates before completion preserves eventual consistency but does not provide atomic replacement. Delaying their visibility until completion effectively introduces staging and converges on the submission alternative below.
- ⚠️ Resource definitions are uploaded separately, so the design must decide whether completion covers only ORD items or also waits for all definition uploads.

### One POST containing documents and definitions

A single request would carry the ORD Document and its definitions together. The bytes could travel as `multipart/mixed` parts keyed by `url`, or inline via the document `definitions` map from [ADR 003](./003-link-pushed-resource-definitions-by-resource-and-context.md).

- ✅ Sends all related bytes in one request, so a document never briefly dangles against a not-yet-uploaded definition.
- ⚠️ Requires a wrapper or multipart profile to define, version, and validate, on top of the inline-shape drawbacks in [ADR 003](./003-link-pushed-resource-definitions-by-resource-and-context.md).
- ⚠️ The response is still per-item (see [ADR 002](./002-use-eventually-consistent-resource-isolated-ingestion.md)), so batching does not simplify failure handling; and one large or invalid definition makes the whole request expensive to retry.

### Submission resource

- ✅ A future extension could group uploads, support asynchronous validation and status, and define an explicit commit boundary.
- ⚠️ It would need lifecycle, expiry, commit, retry, failure, and cleanup semantics, so it is not part of the version-1 API.

#### Sketch of a future submission extension (non-normative)

Not chosen for version 1 (see [ADR 002](./002-use-eventually-consistent-resource-isolated-ingestion.md), where adopting it from the start is weighed as an alternative baseline).
The following endpoint sketch records one possible design discussed during review; it is illustrative and is not the standardized implementation.
A submission would be a staging area: uploads made against it would not be discoverable until commit, and commit would publish them atomically.

```text
POST   /v1/submissions{?scope}         open a submission → { submissionId }
POST   /v1/submissions/{id}/documents            stage a document (same body as /v1/documents)
PUT    /v1/submissions/{id}/resource-definitions stage a definition (same params as /v1/resource-definitions)
POST   /v1/submissions/{id}/commit{?mode}         publish atomically; mode=replace treats the staged set as complete
DELETE /v1/submissions/{id}                       abandon; discard all staged uploads
```

With `mode=replace`, the aggregator derives removals by set difference against the current published state of the scope, so providers no longer emit per-resource tombstones to retract items. The extension owes the semantics v1 avoids: submission expiry, commit atomicity and retry, and cleanup of abandoned or expired submissions.

Because staging reuses the same document and definition bodies, this is additive rather than a replacement: the direct `/v1/documents` and `/v1/resource-definitions` endpoints keep working unchanged, and a provider opts into submissions only when it needs an atomic commit boundary.

## More Information

- [HTTP Semantics, RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html)
- [Problem Details for HTTP APIs, RFC 9457](https://www.rfc-editor.org/rfc/rfc9457.html)
