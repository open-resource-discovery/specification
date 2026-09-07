---
status: proposed
date: 2026-09-06
depends-on:
  - ./001-add-push-transport-alongside-pull.md
  - ./002-use-eventually-consistent-resource-isolated-ingestion.md
  - ./003-link-pushed-resource-definitions-by-resource-and-context.md
  - ./004-authorize-pushes-by-credential-bound-publication-subject.md
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

- **Required:** the two endpoints below process requests synchronously and return validation results; document requests are identity-less, definition requests are idempotent, and request-wide errors use Problem Details.
- **Optional v1 optimizations:** standard HTTP conditional requests, strong ETags, and `Content-Digest` can be used without changing the push protocol.
- **Future extension:** a submission resource could group uploads, expose asynchronous validation status, and define an explicit commit boundary. Version 1 defines no submission or operations endpoint.

The minimum version-1 API has these paths relative to an implementation-defined base URL:

```text
POST   /v1/documents
PUT    /v1/resource-definitions{?perspective,ordId,url,systemVersion,systemInstanceId}
```

The aggregator communicates its base URL during onboarding or through its own discovery mechanism. For example, it could use `https://aggregator.example.org/ord-push`; the `/v1` paths are standardized.

`POST /v1/documents` accepts one standard ORD Document as an identity-less envelope. It has no path or query parameters and creates no document resource. Credentials and document content determine the publication context. Omitting an item from a later document does not remove it; providers use ORD tombstones instead. Retrying a request may repeat processing but does not create duplicate ORD resources.

The HTTP verbs reflect whether the target has an identity: a document does not, so it is submitted with `POST`; the definition association from [ADR 003](./003-link-pushed-resource-definitions-by-resource-and-context.md) does, so `PUT` can replace it idempotently.

`PUT /v1/resource-definitions` stores native definition bytes. A provider replaces a definition by uploading new bytes to the same association. Implementations SHOULD support strong `ETag`, `If-None-Match: *`, and `If-Match`; `Content-Digest` MAY provide transfer integrity and aid deduplication.

The minimum contract has no operation to withdraw one definition. Providers replace its bytes or retire the resource and its definitions through ORD tombstones.

A document request returns `200 OK` with an `applied`, `stale`, or `rejected` outcome for every top-level item. The aggregator MUST first validate against currently available content. A definition request returns `201 Created` for a new association or `200 OK` for a replacement, with an `applied`, `pending`, `stale`, or `rejected` result. HTTP status describes request processing, not each item's outcome.

Request-wide failures use RFC 9457 Problem Details (`application/problem+json`). An optional `issues` extension provides portable error, warning, and information fields. Aggregators MAY add validator-specific extension members; clients MUST ignore unknown extensions.

Providers SHOULD keep ORD documents within 2 MB (2,000,000 bytes). An aggregator MUST accept documents up to and including that size and MAY support a larger documented limit. ORD defines no baseline size limit for resource definitions because some formats cannot be divided across files; an aggregator MAY set and MUST document its own limit.

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

### One POST containing documents and definitions

- ✅ Can send all related bytes in one request.
- ⚠️ Requires a wrapper or multipart profile and makes one large or failed definition expensive to retry.

### Submission resource

- ✅ A future extension could group uploads, support asynchronous validation and status, and define an explicit commit boundary.
- ⚠️ It would need lifecycle, expiry, commit, retry, failure, and cleanup semantics, so it is not part of the version-1 API.

## More Information

- [HTTP Semantics, RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html)
- [Problem Details for HTTP APIs, RFC 9457](https://www.rfc-editor.org/rfc/rfc9457.html)
