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
| Upload one ZIP archive                | One archive containing one or more ORD Documents and definitions | Keep the directory structure that relative `resourceDefinitions[].url` values refer to                                | Keeps definitions out of the ORD Document, but introduces an archive format, archive-specific security limits, and retries of the whole archive                                        |
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
A provider opens a submission, stages one or more standard ORD Documents and native resource definitions, and then commits the submission.
When an ORD Document is uploaded through `PUT`, the aggregator validates at least the parts that push transport relies on: the document is a JSON object, it carries `openResourceDiscovery` and `perspective`, each processed item has its identifier, and each declared resource definition has a `url` and `mediaType`.
Malformed JSON is rejected with `400`, and a document that fails this validation is rejected with `422`, without changing the staged content, the submission state, or the expiry time.
Complete content validation remains the provider's responsibility, so that aggregators are not tied to each revision of the ORD Document schema.
Staged content is not discoverable.
After commit, the aggregator validates the complete staged set asynchronously, including resource-definition completeness, reference resolution, semantic rules, the publication context, and current authorization.
It publishes valid publication units and skips units with errors.
All accepted changes of one commit become discoverable atomically.
Warnings and information messages do not prevent publication.

The minimum workflow is:

```text
POST   /v1/submissions                                      open a submission
GET    /v1/submissions/{submissionId}                       read state and summary
GET    /v1/submissions/{submissionId}/issues                read validation issues
PUT    /v1/submissions/{submissionId}/documents/{artifactId} stage or replace one ORD Document
DELETE /v1/submissions/{submissionId}/documents/{artifactId} remove one staged ORD Document
PUT    /v1/submissions/{submissionId}/resource-definitions/{artifactId} stage or replace one definition
DELETE /v1/submissions/{submissionId}/resource-definitions/{artifactId} remove one staged definition
POST   /v1/submissions/{submissionId}/commit                validate and publish accepted units atomically
DELETE /v1/submissions/{submissionId}                       discard a submission
```

### Artifacts

The provider assigns each staged artifact an ID that is unique within the submission.
Using `PUT` makes uploads and corrections idempotent without giving an ORD Document a persistent identity.
Each identifier of ORD information can be staged only once per submission; an upload that would duplicate one is rejected with `422`, so the aggregator never has to choose between two copies.
A resource-definition request carries the definition in its native format and identifies the ORD resource and the exact `resourceDefinitions[].url` value that declare it.
During push, the URL only serves as an association key; the aggregator does not fetch it from the provider.

### ORD Provider and Publication Context

Each submission belongs to the ORD provider identified by its authenticated credential and to exactly one publication context.
The ORD provider is the technical integration behind the authenticated client, as agreed during onboarding.
Several ORD providers can together describe one application or service, using push or pull transport, as long as their contributions do not overlap.
The publication context consists of one authorized publication target and one perspective, including any required system version or aggregator-issued system instance ID.
The aggregator resolves the target from authoritative onboarding and authentication information rather than from an additional request field.
One ORD provider can publish for several separately onboarded applications or services, but each submission is scoped to exactly one authorized target.
The aggregator validates the submitted context and the claims in the documents against its authoritative state.
Permission to publish particular ORD ID namespaces is checked separately from the ORD provider's identity.

The aggregator records the ORD provider and publication context of every published item and resource definition.
This lets a later `replace` identify the ORD provider's complete contribution in that context.

### Publication Modes

A submission declares its publication mode when it is opened; the default is `merge`.
`replace` must be selected explicitly, because it gives omission a destructive meaning.
In `replace` mode, the staged set is the ORD provider's complete current contribution in the publication context.
On a successful commit, the aggregator removes that ORD provider's prior contributions in the context that are absent from the staged set.
The provider therefore does not need to track removed resources or publish tombstones for them.
Tombstones in a `replace` submission are ignored, so providers can stage the same ORD Documents they serve through pull transport.
This is the only exception to the general rule that removals require tombstones.
To remove its entire contribution in the context, the provider stages at least one valid ORD Document that contains no ORD resources or taxonomy and commits it in `replace` mode.
A staged publication unit that is skipped because of an error is not treated as omitted, so its previously published contribution remains unchanged.
A complete replacement cannot be split into a sequence of partial `replace` submissions, because each successful commit would remove everything omitted from that submission.

In `merge` mode, the aggregator adds or updates the accepted units and does not treat omission as removal.
Tombstones remain available for explicit removals in `merge` mode and in other transport modes.
A push tombstone affects only matching contributions of the ORD provider in the submission's publication context.
This API does not define finer-grained replacement boundaries within one ORD provider's contribution to one publication context, and request data does not grant authority to change a contribution.

Providers typically use `replace` for upgrades and periodic full reconciliation, `merge` for routine changes and hot fixes, and `merge` with tombstones for removals they track explicitly.
A provider that does not track deletions uses `replace`, so that the aggregator can derive removals from its complete current inventory.

### Publication Units

Each top-level ORD information object is one publication unit.
For an ORD resource that declares resource definitions, the unit also contains every definition it declares.
If the resource or one of its definitions changes, the provider resubmits the resource with all of its definitions and its Package, while unrelated resources can be omitted.
Previously published definitions or Packages do not complete a staged resource.
Because resources inherit properties from their Package, the Package must be staged in the same submission, also in `merge` mode.
This keeps commit validation self-contained: each resource is validated against the exact Package it inherits from, and validating the same revision again gives the same result.
A resource whose Package is skipped or not staged is skipped as well, with an error that names the Package.

### Validation Outcome

An error that can be confined to one publication unit skips that complete unit, including all definitions declared by an invalid resource.
The aggregator publishes all remaining valid units together and reports every issue.
The submission is then `processed` and cannot be processed again, so correcting skipped units requires a new submission.
An error that cannot be confined to one publication unit, such as a document-level semantic or authorization error, is a submission-wide error.
It fails the complete commit, leaves the previously published state unchanged, and moves the submission to `rejected`.
A `rejected` submission can be corrected until it expires.
Replacing or removing a staged artifact makes it ready for another commit.
Committing a `rejected` submission without changes validates the same revision again, which helps when the failure depends on state outside the submission.
While a submission is editable, the provider keeps its submission ID and artifact IDs.
If the provider loses this state, it discards the submission and starts a new one rather than risk publishing outdated staged artifacts.

An opt-in `strict` mode, in which any error would fail the complete commit, was considered and not included.
In a highly connected metadata graph, blocking every resource because one of them has an error does more harm than skipping the affected part.

### Concurrent Submissions

An ORD provider can have at most one active submission per publication context; `open`, `validating`, and `rejected` submissions are active.
A request to open another one is rejected with `409 Conflict`, and the problem details identify the active submission so that the provider can continue or discard it.
This serializes the commits of one ORD provider to one publication context.
Because the publication context includes the target, the same ORD provider can have active submissions for different onboarded targets at the same time.
Without this rule, a `replace` submission opened before a `merge` hot fix and committed after it would remove that hot fix.
Optimistic concurrency control, such as a base revision checked at commit, was not chosen, because it adds state to every submission for a case that serialization already prevents.

### Lifecycle, Status, and Issues

A submission is `open`, `validating`, `rejected`, or `processed`.
The aggregator defines and communicates an inactivity timeout and returns the current expiry time with the submission.
The recommended default is 15 minutes, extended whenever a successful staging operation changes the submission content.
Expiry is suspended during validation, and a failed validation starts a new inactivity period, so that the provider has time to inspect and correct the submission.
When an `open` or `rejected` submission reaches its expiry time without changes, the aggregator discards its staged content.
Operations on an expired submission return `410 Gone` while the aggregator keeps a marker for it, and `404 Not Found` after that marker is removed.
A `processed` submission remains readable for a retention period chosen by the aggregator, recommended to be at least 24 hours, so that providers can read the issues of skipped units.
After that period, it is handled like an expired submission, and the `410 Gone` problem details state whether the submission expired or was processed.
The retention period is up to the aggregator, but the responses are standardized, so that clients can handle both cases in the same way.

The status endpoint reports counts and the lifecycle state.
The issues endpoint reports all errors, warnings, and information messages.
An issue about one publication unit identifies the staged artifact through `artifactId` and the unit through exactly one of `ordId`, `groupId`, or `groupTypeId`, and adds `definitionUrl` when it concerns a resource definition.
A submission-wide issue uses `artifactKind: submission` and carries no unit identifier.

### Authentication and Onboarding

Every operation uses HTTPS and authentication.
Each credential identifies exactly one ORD provider in authoritative aggregator state, and that ORD provider can publish for multiple onboarded applications or services.
Each submission must resolve to exactly one authorized target and perspective; if the target is ambiguous, the aggregator rejects the submission at creation.
An aggregator can further restrict a credential to particular publication targets, perspectives, system versions, system instances, or ORD ID namespaces.
The aggregator authorizes each operation against the ORD provider, the publication context, and any additional restrictions configured for the credential.
During onboarding, the aggregator communicates the machine-to-machine authentication mechanism, how credentials are issued, and the API base URL.
The onboarding information also states the supported request content encodings, maximum encoded and decoded artifact sizes, aggregate decoded submission size, artifact counts, active submissions per ORD provider, concurrency, rate limits, and decompression limits.
These limits must allow an onboarded provider to publish its complete contribution in one submission.

### Consequences

- ✅ ORD Documents remain transport-neutral, and resource definitions remain in their native media types.
- ✅ Errors in one publication unit do not block independent valid resources.
- ✅ A resource and every definition it declares are always accepted or skipped together.
- ✅ Providers can correct a `rejected` submission and commit it again.
- ✅ With `replace`, the aggregator derives removals from a complete current state, so the ORD provider does not need to track individual deletions or publish tombstones.
- ✅ Asynchronous validation does not keep an upload request open while a large submission is processed.
- ✅ Status, validation issues, expiry, and discard behavior are interoperable.
- ✅ Aggregators do not need to follow every ORD Document schema revision to accept uploads.
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
