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
- Preserve one ORD information object and all resource definitions it declares as one consistent publication unit.
- Let independent valid publication units succeed when another unit is invalid.
- Support opt-in all-or-nothing validation when several units must advance together.
- Let providers repair and retry a failed submission.
- Support complete-state replacement without removing contributions from another publisher.
- Provide asynchronous status and complete validation diagnostics.
- Bound the lifetime of abandoned server-side state.
- Keep authentication technology and onboarding implementation-specific.

## Options Considered

| Option | Transaction boundary | Definition and path handling | Main trade-offs |
| --- | --- | --- | --- |
| Embed definitions in the ORD Document | One ORD Document | Extend the ORD Document to carry native or encoded definition content | One request and HTTP compression are sufficient, but the ORD Document format and accepted size limit must change, and several documents cannot form one atomic publication |
| Upload one ZIP archive | One archive containing one or more ORD Documents and definitions | Preserve the directory structure addressed by relative `resourceDefinitions[].url` values | Keeps definitions out of the ORD Document, but introduces an archive format, archive-specific security limits, and whole-bundle retries |
| **Stage a submission and commit it** | One ORD information object and its definitions by default, or the complete submission in strict mode | Upload unchanged ORD Documents and native definitions separately and associate definitions with their declaring URLs | Supports several idempotent uploads, resource-level fault isolation, and opt-in all-or-nothing publication without a new container format, but requires temporary server-side state and lifecycle operations |

The embedded option makes the ORD Document itself the upload envelope.
Request compression is already provided by HTTP content coding, so a separate compression feature would not be needed, but aggregators would have to accept substantially larger ORD Documents.
Its transaction boundary cannot cover metadata split across several ORD Documents.

The ZIP option makes the archive the upload envelope.
Relative definition URLs resolve to entries in the archive's folder structure.
Providers must rebuild and resend the archive to repair one artifact, while aggregators must define limits and protections for archive expansion, entry paths, duplicate entries, and compressed payloads.

The submission option makes an explicit commit the publication trigger.
It preserves the ORD Document and native resource-definition formats, allows individual artifacts to be retried, and validates a complete staged set spanning several requests.
The aggregator can isolate invalid publication units by default or enforce one all-or-nothing transaction when the provider opts into strict validation.

## Decision Outcome

Chosen option: **standardize optional push transport as a transactional submission resource**.

An aggregator that supports push implements the versioned ORD Aggregator Push API.
A provider opens a submission, stages one or more standard ORD Documents and native resource definitions, and then commits the submission.
Staged content is not discoverable.
The aggregator validates the complete staged set asynchronously after commit.
By default, it publishes valid publication units and skips units with errors.
The provider can opt into strict validation, in which the aggregator publishes nothing when any error occurs.
All accepted changes from one commit become discoverable atomically.
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
POST   /v1/submissions/{submissionId}/commit                validate and publish accepted units atomically
DELETE /v1/submissions/{submissionId}                       discard a submission
```

The provider assigns each staged artifact an identifier that is local to the submission.
Using `PUT` makes uploads and repairs idempotent without assigning a persistent identity to an ORD Document.
The resource-definition request carries native bytes and identifies the ORD resource and exact `resourceDefinitions[].url` value that declare those bytes.
The URL is an association key during push and is not fetched from the provider.

Each submission belongs to the publisher established by its authenticated credential and exactly one publication context.
The context consists of one perspective and any required system version or aggregator-issued system instance identifier.
The aggregator validates the submitted context and document claims against authoritative state.

During onboarding, the aggregator associates every publisher with exactly one registered [ORD namespace](../docs/spec-v1/index.md#namespaces) and zero or more directly granted [Group IDs](../docs/spec-v1/concepts/grouping-and-bundling.md#groups).
One namespace can have multiple publishers.
The publisher namespace includes its descendant sub-context namespaces for push authorization, but the association does not change namespace ownership or establish general ORD ID authority.
Push deliberately does not allow that publisher to use the broader shared-resource pattern to contribute IDs outside its namespace hierarchy.
Publishing shared content in an authority namespace requires a separate authenticated publisher onboarded to exactly that authority namespace.
This transport rule does not change the general ORD ownership, reuse, or consistency semantics for shared resources.
The onboarding mechanism remains implementation-specific.

For top-level ORD information objects whose schema supports `partOfGroups`, other than the Group taxonomy object itself, a publisher can contribute an object when its ORD ID is in the publisher namespace hierarchy and its direct `partOfGroups` value either is absent or empty, or intersects the publisher's grants.
Any one matching grant is sufficient, and group membership is not resolved transitively through a Group object's own `partOfGroups` relationships.
New contributions are authorized from their staged membership. Updates require both the retained contribution and its staged replacement to be authorized, so changing publisher-controlled membership cannot grant access to an existing contribution.
Other top-level ORD information objects use their own identifier namespace: the part before the first `:` of an `ordId`, the namespace in a Group Type's `groupTypeId`, or the group-instance namespace (the third colon-delimited component) of a Group's `groupId`.
Packages, Groups, and Group Types can be published independently or accompany an authorized resource when each passes this namespace check; the Group Type referenced by a Group is checked separately from its own `groupTypeId`.
Objects without `partOfGroups`, including Vendors, Products, Consumption Bundles, and Overlays, are governed solely by that identifier-namespace rule.
The aggregator checks publisher onboarding and context when opening the submission, checks every staged unit during asynchronous commit validation, and rechecks current authorization as part of the atomic publication decision so onboarding changes take effect before publication.
An unauthorized unit is a validation error and follows default partial or strict all-or-nothing behavior, rather than causing submission creation to return `403 Forbidden`.
It attributes every published information object and resource definition to its publisher and publication context.

A submission can declare a publication mode when it is opened and defaults to `merge` when the mode is omitted.
`replace` must be selected explicitly because it gives omission destructive meaning.
For `replace`, the staged set is the authenticated publisher's complete current contribution in the publication context.
On a successful `replace` commit, the aggregator removes prior contributions inside the selected replacement boundary that are absent from the staged set.
Omission therefore expresses removal and the provider does not need to track removed resources or publish tombstones inside that boundary.
A provider can remove every prior contribution in the boundary by staging at least one valid ORD Document that contains no ORD information to retain and committing it in `replace` mode.
`merge` upserts the accepted staged set without interpreting omission as removal.
Each top-level ORD information object is one publication unit.
For an ORD resource that declares resource definitions, the unit also contains every definition it declares.
If that resource or one definition changes, the provider resubmits the resource and all of its definitions, while unrelated resources can remain omitted.
Previously published definitions do not complete a partially staged resource.
Tombstones remain available for explicit removals in `merge` mode and other transport modes.
The effect of a tombstone is limited to the same contribution boundary as the submission.
Replacement omissions and tombstones can remove only retained contributions that remain authorized by the publisher's current namespace and group grants.
Contributions that are no longer authorized remain untouched and require aggregator or administrator lifecycle handling outside the push protocol.
The contribution and replacement boundary is the stable publisher and publication context recorded by the aggregator.
Even when publishers have overlapping namespace and group permissions, replacement and tombstones never remove content attributed to another publisher.
Publisher authorization does not change ORD identity, uniqueness, or merging rules.
Providers normally use `replace` for upgrades and periodic full reconciliation, `merge` for hot fixes and transports, and `merge` plus tombstones for removals they track explicitly.
A provider that does not keep deletion bookkeeping uses `replace` so the aggregator can derive removals from its complete current inventory.
A staged publication unit that is skipped because of an error is not considered omitted by `replace`, so its previously published contribution remains unchanged.
A complete replacement cannot be split into sequential partial replacement submissions because each successful commit would remove contributions omitted from that submission.

Validation defaults to partial acceptance independently of the publication mode.
An error attributable to one publication unit skips that complete unit, including all definitions declared by an invalid resource.
The aggregator publishes all remaining valid units together and reports every issue.
A document-envelope, authorization, or other error that prevents publication units from being isolated safely fails the complete commit.
The provider can set `strict` to `true` when opening a submission.
In strict mode, any error fails the complete commit and the previously published state remains unchanged.
A failed submission remains available for correction until it expires.
A default-mode commit with only unit-local errors becomes terminal after it publishes the accepted units, so correcting skipped units requires a new submission.
Replacing or removing a staged artifact makes it eligible for another commit attempt.
The provider retains the submission ID and its submission-local artifact IDs while a submission is editable.
If it loses that state, it discards the submission and starts a new one rather than risking publication of obsolete staged artifacts.

The submission state is `open`, `validating`, `failed`, or `published`.
The aggregator defines and communicates an inactivity timeout and returns the current expiry time with the submission.
The recommended default is 15 minutes, extended whenever a successful staging operation changes the submission content.
Expiry is suspended during validation, and failed validation starts a new inactivity period so the provider has time to inspect and repair the submission.
The aggregator automatically discards staged content when an `open` or `failed` submission remains inactive until that time.
Operations on an expired submission return `410 Gone` while an expiry marker exists and `404 Not Found` after that marker is removed.
The status endpoint reports counts and lifecycle state.
The issues endpoint reports all errors, warnings, and information messages and identifies the affected staged artifact and target when available.

Every operation uses HTTPS and authentication.
Each credential identifies exactly one described system type or one system-independent publisher in authoritative aggregator state.
An aggregator can further restrict a credential to particular perspectives, system versions, or system instances.
The publisher's registered namespace and direct group grants determine which resources it can contribute.
The concrete machine-to-machine authentication mechanism, credential issuance, and API base URL are communicated by the aggregator during onboarding.
The onboarding information also states supported request content encodings, maximum encoded and decoded artifact sizes, aggregate decoded submission size, artifact counts, active submissions per publisher, concurrency, rate limits, and decompression limits.
These limits must allow an onboarded provider to publish its complete contribution in one submission.

### Consequences

- ✅ ORD Documents remain transport-neutral and definitions remain in their native media types.
- ✅ Independent valid resources are not blocked by an invalid resource in the same ORD Document or submission.
- ✅ A resource and every definition it declares are always accepted or skipped together.
- ✅ Strict submissions can make several requests form one all-or-nothing publication.
- ✅ Providers can correct a failed submission and commit it again.
- ✅ `replace` lets the aggregator derive removals from a complete current state without tombstones.
- ✅ Publisher and publication-context provenance lets independent ORD Providers replace only their own contributions to the same application.
- ✅ Asynchronous validation does not keep an upload request open while a large submission is processed.
- ✅ Status, diagnostics, expiry, and discard behavior are interoperable.
- ⚠️ Aggregators must operate temporary storage and a submission lifecycle.
- ⚠️ Aggregators must document supported content encodings and capacity limits so providers can plan submissions that fit.
- ⚠️ Aggregators must retain publisher and publication-context provenance for every published contribution.
- ⚠️ Providers that require dependent resources to advance together must opt into strict validation.
- ⚠️ Providers must poll for the terminal commit result.

## More Information

- [ORD Aggregator Push API](../spec/v1/AggregatorPushAPI.oas3.yaml)
- [PR #79 review discussion](https://github.com/open-resource-discovery/specification/pull/79)
- [HTTP Semantics, RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html)
- [Digest Fields, RFC 9530](https://www.rfc-editor.org/rfc/rfc9530.html)
- [Problem Details for HTTP APIs, RFC 9457](https://www.rfc-editor.org/rfc/rfc9457.html)
