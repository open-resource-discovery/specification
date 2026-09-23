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

## Decision Drivers

- Keep the ORD Document and resource-definition formats unchanged.
- Let providers stage several documents and definitions through separate requests.
- Validate the staged set as a whole and never expose a partially accepted update.
- Let providers repair and retry a failed submission.
- Support complete-state replacement without removing contributions from another publisher.
- Provide asynchronous status and complete validation diagnostics.
- Bound the lifetime of abandoned server-side state.
- Keep authentication technology and onboarding implementation-specific.

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

A submission declares a publication mode when it is opened.
`replace` treats the staged set as the publisher's complete current contribution in that publication context.
On a successful `replace` commit, the aggregator removes prior contributions in that scope that are absent from the staged set.
`merge` atomically upserts the staged set without interpreting omission as removal.
In both modes, the replacement boundary is the stable publisher and publication context recorded by the aggregator.
It is not an ORD Document, credential, or namespace.
Content attributed to another publisher or delegator is never removed.

Commit validation is strict in every publication mode.
If any staged document, resource, definition, relationship, or authorization check has an error, the entire commit fails and the previously published state remains unchanged.
The failed submission remains available for correction until it expires.
Replacing or removing a staged artifact makes it eligible for another commit attempt.

The submission state is `open`, `validating`, `failed`, or `published`.
The aggregator returns an expiry time when the submission is created.
It automatically discards staged content if an `open` or `failed` submission is not committed successfully before that time.
The status endpoint reports counts and lifecycle state.
The issues endpoint reports all errors, warnings, and information messages and identifies the affected staged artifact and target when available.

Every operation uses HTTPS and authentication.
Each credential identifies exactly one described system type or one system-independent publisher in authoritative aggregator state.
An aggregator can further restrict a credential to particular perspectives, system versions, system instances, or ORD ID namespaces.
The concrete machine-to-machine authentication mechanism, credential issuance, and API base URL are communicated by the aggregator during onboarding.

### Consequences

- ✅ ORD Documents remain transport-neutral and definitions remain in their native media types.
- ✅ Several requests can form one atomic publication.
- ✅ Providers can correct a failed submission and commit it again.
- ✅ `replace` lets the aggregator derive removals from a complete current state.
- ✅ Asynchronous validation does not keep an upload request open while a large submission is processed.
- ✅ Status, diagnostics, expiry, and discard behavior are interoperable.
- ⚠️ Aggregators must operate temporary storage and a submission lifecycle.
- ⚠️ One error blocks publication of otherwise valid staged content.
- ⚠️ Providers must poll for the terminal commit result.

## Alternatives

### Stateless document and definition endpoints

This model would process `POST /v1/documents` and `PUT /v1/resource-definitions` independently.

- ✅ Each request can return immediate validation feedback.
- ⚠️ Related artifacts become visible at different times.
- ⚠️ A provider must retain publication history and emit every required tombstone because omission cannot mean removal.
- ⚠️ Adding an atomic complete-state boundary later would introduce a second ingestion model.

### Embed or package definitions with an ORD Document

- ✅ One request can carry related artifacts.
- ⚠️ Inline definitions change the ORD Document and encode heterogeneous or binary formats poorly.
- ⚠️ ZIP or multipart containers add another format and still do not naturally represent a complete state spanning several requests.

### Pull transport only

- ✅ Preserves one transport and keeps aggregators in control of retrieval timing.
- ⚠️ Every provider must expose a reachable ORD Provider API, including providers that only publish static metadata from CI/CD.

## More Information

- [ORD Aggregator Push API](../spec/v1/AggregatorPushAPI.oas3.yaml)
- [PR #79 review discussion](https://github.com/open-resource-discovery/specification/pull/79)
- [HTTP Semantics, RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html)
- [Problem Details for HTTP APIs, RFC 9457](https://www.rfc-editor.org/rfc/rfc9457.html)
