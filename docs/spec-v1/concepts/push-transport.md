---
sidebar_position: 8
title: Push Transport Guidance
description: Operational guidance for choosing ORD push publication modes and planning submission boundaries.
---

# Push Transport Guidance

The normative push protocol is defined in the [ORD specification](../index.md#push-transport) and the [ORD Aggregator Push API](../interfaces/aggregator-push-api.mdx).
This page provides non-normative guidance for applying that protocol to common publication lifecycles.

## Choosing a Publication Mode

The publication mode determines whether omission means removal.
It is independent of the submission's `strict` validation setting.
Accepted changes are applied atomically in both publication modes.

### Routine Changes, Hot Fixes, and Transports

Use `merge` when the provider knows which resources changed.
Stage each changed ORD resource together with every resource definition it declares.
Unrelated resources may be omitted and remain published.

This pattern avoids sending a complete inventory for small daily changes, hot fixes, or transported development content.
The provider needs durable bookkeeping of successfully published resource bundles to determine what changed.

### Known Removals

Use `merge` with tombstones when the provider knows which previously published ORD IDs were removed.
The tombstones remove matching contributions only inside the submission's contribution boundary.

This pattern is appropriate when a source system or publishing pipeline records deletions explicitly.

### Upgrades and Full Reconciliation

Use `replace` when the provider publishes a complete current inventory for a replacement boundary.
This is useful after a major upgrade, for periodic reconciliation, or when many resources changed together.
The aggregator derives removals by comparing the successfully validated submission with prior contributions inside that boundary.

The replacement boundary is the authenticated publisher and publication context.
The aggregator retains that provenance for every contribution, so independently operated publishers can contribute to the same application without allowing one publisher's replacement to remove another's content.

During onboarding, the aggregator associates each publisher with exactly one registered [ORD namespace](../index.md#namespaces), including its descendant sub-context namespaces, and zero or more directly granted [Group IDs](./grouping-and-bundling.md#groups).
Several publishers can be associated with the same namespace.
Push publishers cannot use the broader shared-resource model to contribute IDs outside that namespace hierarchy.
An authority or other shared namespace needs its own authenticated publisher onboarded to exactly that namespace; this transport restriction does not change the general ORD semantics for shared information.
For top-level ORD information objects that support `partOfGroups`, other than the Group taxonomy object itself, the publisher can contribute ungrouped resources in its namespace hierarchy and resources whose direct group assignments match at least one of its grants.
Multiple grants are alternatives, not cumulative requirements, and nested group relationships do not grant access transitively.
The staged membership authorizes a new contribution. An update must be authorized from both the retained and staged membership, so changing `partOfGroups` cannot be used to take over an existing contribution.
Other first-class ORD information is namespace-authorized from its own ID: the namespace before the first `:` of an `ordId`, the namespace in `groupTypeId` for a Group Type, and the group-instance namespace (the third colon-delimited component of `groupId`) for a Group.
Such information can be published independently or accompany an authorized resource when it passes its own namespace check; a group grant does not by itself authorize those objects or unrelated content.
Submission creation checks publisher onboarding and the publication context.
The aggregator checks staged content during commit validation and rechecks current authorization as part of the atomic publication decision, so a grant removed after the submission was opened or validated cannot be used by a later publication.
An unauthorized unit is skipped in the default validation mode and fails the complete commit in strict mode.

### Providers Without Deletion Bookkeeping

Use `replace` when the provider can enumerate its complete current state but cannot reliably identify which previously published resources were deleted.
Omitted contributions are removed only after the replacement validates successfully.
This avoids requiring tombstones for deletions the provider no longer remembers.

## Removing a Complete Contribution

The protocol requires every committed submission to contain at least one valid ORD Document.
To remove everything previously published inside a replacement boundary, stage a valid ORD Document for the publication context that contains no ORD information to retain and commit it in `replace` mode.

An empty replacement removes only contributions attributed to that publisher and publication context.
It does not remove contributions owned by another publisher, even when both publishers have the same namespace or group permissions.
Omission and tombstones can remove only contributions that the publisher is still authorized to manage.
If a namespace or group grant was withdrawn, the affected contribution remains published until the aggregator or an administrator handles its lifecycle outside the push protocol.

This operation removes published ORD contributions.
It does not delete an aggregator's authoritative system-version or system-instance record, which is outside the ORD push protocol.

## Planning for Aggregator Limits

An aggregator documents its supported request content encodings and operational limits during onboarding.
These include encoded and decoded artifact size, aggregate decoded submission size, artifact count, active submissions, concurrent requests, and request rate.
The aggregator also communicates its submission inactivity timeout.

A provider should check these limits before opening a submission and should avoid creating more simultaneous submissions than necessary.
Routine changes can be divided into several independent `merge` submissions when their resource bundles do not need one atomic publication boundary.

A `replace` submission represents the complete state of its replacement boundary and cannot be divided into sequential partial replacements without changing its meaning.
The provider and aggregator should ensure during onboarding that the limits can accommodate the publisher's complete contribution rather than silently splitting a replacement.

## Choosing Validation Behavior

The default `strict: false` behavior publishes valid ORD information while reporting and skipping invalid publication units.
Use this mode when one invalid resource should not delay independent valid resources from the same ORD Document or submission.
An ORD resource and all resource definitions it declares are one publication unit, so they are always accepted or skipped together.

Set `strict: true` when all staged information must advance together.
Any validation error then fails the complete commit and leaves the submission editable for correction.
Errors that prevent the aggregator from safely isolating publication units fail the complete commit regardless of the `strict` setting.
