---
date: 2026-09-23
---

# Use transactional submissions for push transport

## Context and Problem Statement

ORD currently standardizes pull transport through the ORD Provider API.
Some providers can publish metadata when it changes but cannot or do not want to operate a continuously reachable API.
A standardized push transport must carry ORD Documents and heterogeneous resource definitions without changing the transport-neutral ORD Document format.
It must also let a provider publish a complete current state that can span several documents and definition uploads.
Publishing every upload immediately would expose incomplete combinations and would require providers to track and tombstone every resource they had published previously.
Several independently operated ORD Providers can contribute metadata for the same application, so complete-state replacement also needs an explicit ownership boundary.

## Decision Drivers

- Keep the ORD Document and resource-definition formats unchanged.
- Let providers stage several documents and definitions through separate requests.
- Validate the staged set as a whole and never expose a partially accepted update.
- Let providers repair and retry a failed submission.
- Support complete-state replacement without removing contributions from another publisher or provider scope.
- Provide asynchronous status and complete validation diagnostics.
- Bound the lifetime of abandoned server-side state.
- Keep authentication technology and onboarding implementation-specific.

## Options Considered

| Option | Transaction boundary | Definition and path handling | Main trade-offs |
| --- | --- | --- | --- |
| Embed definitions in the ORD Document | One ORD Document | Extend the ORD Document to carry native or encoded definition content | One request and HTTP compression are sufficient, but the ORD Document format and accepted size limit must change, and several documents cannot form one atomic publication |
| Upload one ZIP archive | One archive containing one or more ORD Documents and definitions | Preserve the directory structure addressed by relative `resourceDefinitions[].url` values | Keeps definitions out of the ORD Document, but introduces an archive format, archive-specific security limits, and whole-bundle retries |
| **Stage a submission and commit it** | All artifacts staged in one submission | Upload unchanged ORD Documents and native definitions separately and associate definitions with their declaring URLs | Supports several idempotent uploads and atomic publication without a new container format, but requires temporary server-side state and lifecycle operations |

The embedded option makes the ORD Document itself the upload envelope.
Request compression is already provided by HTTP content coding, so a separate compression feature would not be needed, but aggregators would have to accept substantially larger ORD Documents.
Its transaction boundary cannot cover metadata split across several ORD Documents.

The ZIP option makes the archive the upload envelope.
Relative definition URLs resolve to entries in the archive's folder structure.
Providers must rebuild and resend the archive to repair one artifact, while aggregators must define limits and protections for archive expansion, entry paths, duplicate entries, and compressed payloads.

The submission option makes an explicit commit the transaction boundary.
It preserves the ORD Document and native resource-definition formats, allows individual artifacts to be retried, and can atomically publish a complete state spanning several requests.

## Decision Outcome

Chosen option: **standardize optional push transport as a transactional submission resource**.

An aggregator that supports push implements the versioned ORD Aggregator Push API.
A provider opens a submission, stages one or more standard ORD Documents and native resource definitions, and then commits the submission.
Staged content is not discoverable.
The aggregator validates the complete staged set asynchronously after commit and publishes it atomically only when it contains no validation errors.
Warnings and information messages do not prevent publication.

The minimum workflow is:

```text
POST   /v1/submissions                                      open a submission
GET    /v1/submissions/{submissionId}                       read state and summary
GET    /v1/submissions/{submissionId}/issues                read validation diagnostics
PUT    /v1/submissions/{submissionId}/documents/{artifactId} stage or replace one ORD Document
DELETE /v1/submissions/{submissionId}/documents/{artifactId} remove one staged ORD Document
PUT    /v1/submissions/{submissionId}/resource-definitions/{artifactId} stage or replace one definition
DELETE /v1/submissions/{submissionId}/resource-definitions/{artifactId} remove one staged definition
POST   /v1/submissions/{submissionId}/commit                validate and publish atomically
DELETE /v1/submissions/{submissionId}                       discard a submission
```

The provider assigns each staged artifact an identifier that is local to the submission.
Using `PUT` makes uploads and repairs idempotent without assigning a persistent identity to an ORD Document.
The resource-definition request carries native bytes and identifies the ORD resource and exact `resourceDefinitions[].url` value that declare those bytes.
The URL is an association key during push and is not fetched from the provider.

Each submission belongs to the publisher established by its authenticated credential and exactly one publication context.
The context consists of one perspective and any required system version or aggregator-issued system instance identifier.
The aggregator validates the submitted context and document claims against authoritative state.
Permission to publish particular ORD ID namespaces is checked separately from publisher identity.

A submission can identify an optional `scopeId`.
The scope ID is a stable, opaque identifier for one contribution set registered by the aggregator during onboarding.
It is not an ORD namespace, because a namespace expresses identifier authority and can be used by several authorized publishers or delegators.
The aggregator must authorize the credential for the selected scope independently of ORD ID namespace permissions.
It must attribute every published item and resource definition to its publisher, publication context, and either its scope ID or the unscoped contribution set.

A submission can declare a publication mode when it is opened and defaults to `merge` when the mode is omitted.
`replace` must be selected explicitly because it gives omission destructive meaning.
For `replace` with a `scopeId`, the staged set is the complete current contribution of that scope in the publication context.
For `replace` without a `scopeId`, the staged set is the complete current contribution of the publisher across all of its scopes in the publication context.
The aggregator must permit an unscoped replacement only when the credential is authorized to replace the publisher's complete contribution.
On a successful `replace` commit, the aggregator removes prior contributions inside the selected replacement boundary that are absent from the staged set.
Omission therefore expresses removal and the provider does not need to track removed resources or publish tombstones inside that boundary.
`merge` atomically upserts the staged set without interpreting omission as removal.
When `merge` includes a `scopeId`, the aggregator records that scope as contribution provenance so a later scoped replacement can remove the contribution safely.
Tombstones remain available for explicit removals in `merge` mode and other transport modes.
The effect of a tombstone is limited to the same replacement boundary as the submission.
An unscoped tombstone therefore requires the same provider-wide authorization as an unscoped replacement.
The replacement boundary is the stable publisher, publication context, and optional scope ID recorded by the aggregator.
It is not an ORD Document, credential, or ORD namespace.
Scoped replacement never removes content attributed to another scope, publisher, or delegator.
Scopes partition provenance but do not change ORD identity, uniqueness, or merging rules.

Commit validation is strict in every publication mode.
If any staged document, resource, definition, relationship, or authorization check has an error, the entire commit fails and the previously published state remains unchanged.
The failed submission remains available for correction until it expires.
Replacing or removing a staged artifact makes it eligible for another commit attempt.
The provider retains the submission ID and its submission-local artifact IDs while a submission is editable.
If it loses that state, it discards the submission and starts a new one rather than risking publication of obsolete staged artifacts.

The submission state is `open`, `validating`, `failed`, or `published`.
The aggregator returns an expiry time when the submission is created.
It automatically discards staged content if an `open` or `failed` submission is not committed successfully before that time.
The status endpoint reports counts and lifecycle state.
The issues endpoint reports all errors, warnings, and information messages and identifies the affected staged artifact and target when available.

Every operation uses HTTPS and authentication.
Each credential identifies exactly one described system type or one system-independent publisher in authoritative aggregator state.
An aggregator can further restrict a credential to particular perspectives, system versions, system instances, scope IDs, or ORD ID namespaces.
Provider-wide unscoped replacement is a separate authorization from replacement within one scope ID.
The concrete machine-to-machine authentication mechanism, credential issuance, and API base URL are communicated by the aggregator during onboarding.

### Consequences

- ✅ ORD Documents remain transport-neutral and definitions remain in their native media types.
- ✅ Several requests can form one atomic publication.
- ✅ Providers can correct a failed submission and commit it again.
- ✅ `replace` lets the aggregator derive removals from a complete current state without tombstones.
- ✅ Scope IDs let independent ORD Providers replace only their own contributions to the same application.
- ✅ Asynchronous validation does not keep an upload request open while a large submission is processed.
- ✅ Status, diagnostics, expiry, and discard behavior are interoperable.
- ⚠️ Aggregators must operate temporary storage and a submission lifecycle.
- ⚠️ Aggregators must retain scope provenance for every published contribution.
- ⚠️ One error blocks publication of otherwise valid staged content.
- ⚠️ Providers must poll for the terminal commit result.

## More Information

- [ORD Aggregator Push API](../spec/v1/AggregatorPushAPI.oas3.yaml)
- [PR #79 review discussion](https://github.com/open-resource-discovery/specification/pull/79)
- [HTTP Semantics, RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html)
- [Problem Details for HTTP APIs, RFC 9457](https://www.rfc-editor.org/rfc/rfc9457.html)
