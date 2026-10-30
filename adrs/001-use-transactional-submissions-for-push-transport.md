---
date: 2026-09-23
---

# Use transactional submissions for push transport

## Context and Problem Statement

ORD currently standardizes pull transport through the ORD Provider API.
Some providers can publish metadata when it changes but cannot or do not want to operate a continuously reachable API.
A standardized push transport must carry ORD Documents and resource definitions in various formats without changing the transport-neutral ORD Document format.
It must also let a provider publish a complete current state that can span several ORD Documents and resource definitions.
If every upload were published immediately, consumers could see incomplete combinations, and providers would have to track and tombstone every resource they had ever published.
Because several independently operated ORD providers can contribute metadata for the same application, replacing a complete state also needs a clear boundary for what each ORD provider owns.

## Decision Drivers

- Keep the ORD Document and resource-definition formats unchanged.
- Let providers stage several ORD Documents and resource definitions through separate requests.
- Keep an ORD information object and all resource definitions it declares together as one consistent publication unit.
- Let independent valid publication units succeed when another unit is invalid.
- Let providers correct and retry a `rejected` submission.
- Support replacing a complete state without removing contributions of another ORD provider.
- Provide asynchronous status and complete validation results.
- Limit how long abandoned submissions occupy aggregator storage.
- Keep authentication technology and onboarding implementation-specific.

## Options Considered

| Option                                | Transaction boundary                                             | Handling of definitions and paths                                                                                     | Main trade-offs                                                                                                                                                                        |
| ------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Embed definitions in the ORD Document | One ORD Document                                                 | Extend the ORD Document to carry native or encoded definition content                                                 | One request and HTTP compression are sufficient, but the ORD Document format and its accepted size limit must change, and several ORD Documents cannot be published as one atomic unit |
| Upload one ZIP archive                | One archive containing one or more ORD Documents and definitions | Keep the directory structure that relative definition URLs refer to                                                   | Keeps definitions out of the ORD Document, but introduces an archive format, archive-specific security limits, and retries of the whole archive                                        |
| **Stage a submission and commit it**  | One ORD information object and its definitions                   | Upload unchanged ORD Documents and native definitions separately, and associate each definition with its declared URL | Supports several idempotent uploads and isolates errors per resource without a new container format, but requires temporary state on the aggregator and lifecycle operations           |

With the embedded option, the ORD Document itself carries the upload.
HTTP content coding already provides request compression, so no separate compression feature would be needed, but aggregators would have to accept much larger ORD Documents.
The transaction boundary also cannot cover metadata that is split across several ORD Documents.

With the ZIP option, the archive carries the upload.
Relative definition URLs resolve to entries in the archive's folder structure.
To correct one artifact, providers must rebuild and resend the complete archive.
Aggregators must define limits and protections for archive expansion, entry paths, duplicate entries, and compressed payloads.

With the submission option, an explicit commit triggers publication.
It keeps the ORD Document and native resource-definition formats, lets providers retry individual artifacts, and validates a complete staged set that was uploaded through several requests.
The aggregator skips invalid publication units and publishes the remaining valid units atomically.

## Decision Outcome

Chosen option: **standardize optional push transport as a transactional submission resource**.

An aggregator that supports push transport implements the versioned ORD Aggregator Push API.
A provider opens a submission, stages standard ORD Documents and native resource definitions through separate requests, and then commits the submission.
The aggregator validates the staged revision asynchronously and publishes all accepted publication units atomically.
Staged content is not discoverable.
The normative rules are defined in the [Push Transport](https://open-resource-discovery.org/spec-v1/#push-transport) section of the specification and in the [ORD Aggregator Push API](../spec/v1/AggregatorPushAPI.oas3.yaml).
This ADR records the decisions and their reasons.

### Staging and Validation

The provider assigns artifact IDs, which are unique per artifact collection in the submission.
Using `PUT` makes uploads and corrections idempotent without giving an ORD Document a persistent identity.
A resource-definition upload names the ORD resource and the exact URL of its definition entry; during push, the URL only serves as an association key and is not fetched.

At upload, the aggregator validates at least the parts that push transport relies on, such as identifiers, `perspective`, and the `url` and `mediaType` of definition entries.
It MAY validate more.
Complete content validation remains the provider's responsibility, so that aggregators are not tied to each revision of the ORD Document schema.
Commit then decides validity for the complete staged revision, including references, semantic rules, the publication context, and current authorization.

Each identifier of ORD information can be staged only once per submission.
An upload that would duplicate one, or that would add a tombstone for staged ORD information in `merge` mode, is rejected with `422`, because staged artifacts have no reliable order and the aggregator should not have to choose between conflicting entries at commit.

### Publication Units and Partial Acceptance

Each top-level ORD information object is one publication unit.
For an ORD resource, the unit also contains every resource definition it declares, so a resource is never published with an incomplete or outdated set of definitions.
Previously published definitions do not complete a staged resource.

The Package of a staged resource must be staged in the same submission, also in `merge` mode.
Staging the Package fixes the inheritance input used to validate the resource; authorization and other external checks still use the aggregator's current state.
This is always possible, because a Package and all its resources must be described by the same ORD provider.

Commit publishes every valid publication unit and skips units with errors.
In a highly connected metadata graph, blocking every resource because one of them has an error does more harm than skipping the affected part.
Only an error that cannot be confined to one publication unit fails the complete commit and leaves the submission editable for correction.

### ORD Provider, Publication Context, and Modes

Each submission belongs to the ORD provider identified by its credential and to exactly one publication context: one authorized target and one perspective.
The aggregator resolves the target from onboarding and authentication information rather than from a request field, because request data must not establish authority.
The aggregator records the ORD provider and publication context of every published contribution, so that a later `replace` can identify that ORD provider's complete contribution.

`merge` is the default, and `replace` must be selected explicitly, because it gives omission a destructive meaning.
In `replace` mode, the aggregator removes the ORD provider's prior contributions in the context that are absent from the submission, so providers that cannot track deletions do not need tombstones.
This is the only exception to the general rule that removals require tombstones.
Tombstones in a `replace` submission are not processed, so providers can stage the same ORD Documents they serve through pull transport.
A skipped unit is not treated as omitted, so an error never removes previously published information.

### Concurrent Submissions

An ORD provider can have at most one active submission per publication context.
This serializes its commits to that context: without it, a `replace` submission opened before a `merge` hot fix and committed after it would remove that hot fix.
Optimistic concurrency control, such as a base revision checked at commit, was not chosen, because it adds state to every submission for a case that serialization already prevents.

### Lifecycle and Onboarding

Editable submissions expire after an inactivity timeout, and processed submissions are retained for a limited period, so that abandoned state does not occupy aggregator storage indefinitely.
Status, issue, and expiry responses are standardized, so that clients can handle them interoperably.
Authentication technology, credentials, and operational limits are communicated during onboarding and are not standardized.
The limits must allow an onboarded provider to publish its complete contribution in one submission, because a replacement cannot be split.

### Out of Scope for the First Version

- **All-or-nothing (`strict`) validation:** an opt-in mode in which any error fails the complete commit was considered and not included, for the reason given under partial acceptance.
- **Publication scopes finer than the ORD provider:** replacing only part of one ORD provider's contribution in a publication context is not defined.
  This concern is shared with pull transport and is decided separately in [PR #236](https://github.com/open-resource-discovery/specification/pull/236), based on the options compared in [issue #234](https://github.com/open-resource-discovery/specification/issues/234).
- **Handover between ORD providers:** how ORD information moves from one ORD provider to another, for example when a system switches from pull to push transport, is not defined.
  An aggregator may allow a takeover or require a dedicated handover, for example by removing the content from the original ORD provider first.

### Consequences

- ✅ ORD Documents remain transport-neutral, and resource definitions remain in their native media types.
- ✅ Errors in one publication unit do not block independent valid resources.
- ✅ A resource and every definition it declares are always accepted or skipped together.
- ✅ Providers can correct a `rejected` submission and commit it again.
- ✅ With `replace`, the aggregator derives removals from a complete current state, so the ORD provider does not need to track individual deletions or publish tombstones.
- ✅ Asynchronous validation does not keep an upload request open while a large submission is processed.
- ✅ Status, validation issues, expiry, and discard behavior are interoperable.
- ✅ Aggregators do not need to follow every ORD Document schema revision to accept uploads.
- ✅ Push and pull can use the same ORD Documents, including their tombstones.
- ⚠️ Aggregators must operate temporary storage and a submission lifecycle.
- ⚠️ A document that passes upload can still fail at commit, so providers should validate their content before uploading it.
- ⚠️ Aggregators must document supported content encodings and capacity limits, so that providers can plan submissions that fit.
- ⚠️ Aggregators must record the ORD provider and publication context of every published contribution.
- ⚠️ Providers cannot require several dependent publication units to be published only together; a valid unit is published even if a related unit is skipped.
- ⚠️ Providers must poll for the `processed` or `rejected` result of a commit.
- ⚠️ An ORD provider must finish or discard a submission before opening the next one for the same publication context.

## More Information

- [ORD Aggregator Push API](../spec/v1/AggregatorPushAPI.oas3.yaml)
- [PR #79 review discussion](https://github.com/open-resource-discovery/specification/pull/79)
- [HTTP Semantics, RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html)
- [Digest Fields, RFC 9530](https://www.rfc-editor.org/rfc/rfc9530.html)
- [Problem Details for HTTP APIs, RFC 9457](https://www.rfc-editor.org/rfc/rfc9457.html)
