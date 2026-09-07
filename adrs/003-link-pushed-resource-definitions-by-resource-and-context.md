---
status: proposed
date: 2026-09-06
depends-on:
  - ./001-add-push-transport-alongside-pull.md
  - ./002-use-eventually-consistent-resource-isolated-ingestion.md
---

# Link pushed resource definitions by resource and publication context

## Context and Problem Statement

ORD Documents and resource definitions are distinct artifacts. An ORD Document follows the ORD schema, while definitions use their own schemas and media types, such as JSON, XML, or GraphQL SDL. A push protocol must transmit and associate these heterogeneous artifacts. Combining them would require a new container format or changes to the ORD Document schema.

An ORD resource links to a definition by URL, but the same ORD ID or URL can occur in different system-type, system-version, or system-instance perspectives. How should push represent and associate a definition with the intended resource and context?

## Decision Drivers

- Keep the ORD Document transport-neutral and definitions in their native formats.
- Identify the target resource and perspective unambiguously, regardless of arrival order.
- Retain the mandatory URL as the relationship in the ORD Document.
- Permit reuse of bytes without merging ownership or publication context.
- Avoid a separate publication manifest.

## Decision Outcome

Chosen option: **identify each upload by its ORD resource, URL reference, and publication context**.

### Version-1 (MVP) scope

- **Required:** definitions stay in their native format; every upload identifies its perspective, ORD resource, exact URL reference, and any required version or instance context.
- **Optional v1 optimizations:** an aggregator can reuse an upload for matching URLs and use `Content-Digest` or internal byte deduplication, without merging resource associations or authorization.
- **Future extensions:** none are proposed by this decision; a container or publication manifest would require a separate protocol decision.

The credentials identify the publisher as defined by [ADR 004](./004-authorize-pushes-using-publisher-credentials.md). Every request supplies `perspective`, `ordId`, and `url`, where `url` is the exact URI-reference string used in the ORD Document. The perspective determines the remaining context:

- `system-type` and `system-independent` require no additional parameter;
- `system-version` requires `systemVersion`, equal to `describedSystemVersion.version`; and
- `system-instance` requires an aggregator-issued `systemInstanceId`.

`systemVersion` and `systemInstanceId` MUST NOT be supplied for other perspectives.
Requiring `systemInstanceId` avoids inference from the aggregator's current state: a request that identifies one instance today could become ambiguous when another instance is added.

The ORD Document remains the source of truth. After normal query-parameter decoding, the aggregator MUST verify that the identified resource in that context contains exactly the supplied `url` string and declares a compatible media type. It does not resolve or normalize the value for this comparison. Request parameters express the intended relationship but do not create it, so a definition-first upload receives a `pending` result until the relationship can be verified against a document.

Within one exact publication context, matching URL-reference strings denote the same definition bytes. An aggregator MAY reuse one upload for all such references, but it retains a separate relationship for each ORD resource. References that require different bytes MUST use different URL-reference strings.

Definition URLs are opaque association keys in push transport and MAY use any URI-reference form accepted by the ORD Document schema, including document-relative values. The aggregator MUST expose an accepted definition through a resolvable URL when serving aggregated ORD content. This exception does not make other document-relative URLs resolvable in a pushed document.

An aggregator MAY use a verified `Content-Digest` to help identify equal bytes for physical deduplication, including across publication contexts. Deduplication MUST NOT merge resource associations, authorization, visibility, retention, or lifecycle.

### Consequences

- ✅ Existing ORD documents remain transport-neutral.
- ✅ The aggregator can distinguish the same ORD ID and URL across perspectives.
- ✅ One upload can serve resources that share a URL in the same publication context.
- ➖ Definition-first uploads can remain pending until their relationship is known.
- ⚠️ Providers must send relationship parameters in addition to the native definition bytes.
- ⚠️ Providers need an aggregator-issued ID for system-instance uploads.
- ⚠️ A definition URL is matched as an exact string, so equivalent but differently written URI references identify different associations.

## Alternatives

### Embedded definitions (previous proposal)

- ✅ A provider can submit a document and its definitions in one request.
- ⚠️ Definition bytes increase document size and are duplicated when several references share them.
- ⚠️ A document can contain several resources, so it still needs a per-item failure policy.
- ⚠️ Changes the transport-neutral ORD Document interface, which [ADR 001](./001-add-push-transport-alongside-pull.md) requires to stay unchanged.

### URL reference and context only

- ✅ Uses the existing mandatory URL and permits one upload for shared URLs.
- ⚠️ Cannot identify the intended resource when several resources share a URL or anchor a definition-first upload to a future resource.

### External publication manifest

- ✅ Can describe all artifacts and hashes in one object.
- ⚠️ Adds a second source of relationship truth and a new protocol object to define, version, and validate.


## More Information

- [ADR 005: minimum versioned HTTP API](./005-use-simple-artifact-endpoints-with-optional-optimizations.md)
- [PR #79 review discussion](https://github.com/open-resource-discovery/specification/pull/79)
- [`Content-Digest`, RFC 9530](https://www.rfc-editor.org/rfc/rfc9530.html)
