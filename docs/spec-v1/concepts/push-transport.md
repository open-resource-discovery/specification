---
sidebar_position: 8
title: Push Transport Guidance
description: Operational guidance for choosing ORD push publication modes and planning submission boundaries.
---

# Push Transport Guidance

The normative push protocol is defined in the [ORD specification](../index.md#push-transport) and the [ORD Aggregator Push API](../interfaces/aggregator-push-api.mdx).
This page provides non-normative guidance for applying that protocol to common publication lifecycles.

## Publisher Publication Scope

During onboarding, the aggregator associates each publisher with exactly one registered [ORD namespace](../index.md#namespaces) and zero or more [Group IDs](./grouping-and-bundling.md#groups).
A namespace can have zero or more associated publishers.
These associations define the publisher's publication scope. Namespace and Group ID matching are exact.
The registered namespace is the outer boundary of that scope; Group IDs cannot extend publication privileges beyond it.

Within its namespace, a publisher has publication privileges for every Group object, every ORD entity without a group association, and every resource associated with at least one of the publisher's Group IDs.
Group matching is direct and non-transitive.
Publication privileges for a new resource are evaluated from its staged state. Updating an existing resource requires both its retained and staged states to be inside the publisher's publication scope.
The aggregator checks publication privileges during commit and again immediately before publication.

Publishers with overlapping publication scopes can update or remove the same information regardless of which publisher supplied it previously.
The aggregator therefore does not need publisher-of-origin bookkeeping.

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
The tombstones remove matching ORD information only inside the publisher's current publication scope and publication context.

This pattern is appropriate when a source system or publishing pipeline records deletions explicitly.

### Upgrades and Full Reconciliation

Use `replace` when the provider publishes a complete current inventory for one or more explicitly selected Group IDs. Declare those targets in `scope` when opening the submission.
This is useful after a major upgrade, for periodic reconciliation, or when many resources changed together.
The aggregator derives removals by comparing the successfully validated submission with previously published ORD information inside that boundary.

The replacement boundary is the publication context intersected with the publisher's exact registered namespace and resources directly associated with at least one target Group ID.
For a resource associated with multiple groups, one matching target Group ID places the complete resource inside the boundary. Omitting it removes the resource even when it is also associated with non-target groups.
Each target Group ID must be directly associated with the publisher. Ungrouped information and resources associated only with other Group IDs are not removed through omission.
The aggregator rejects a replacement target that is not associated with the publisher and rechecks those associations before publication.

### Providers Without Deletion Bookkeeping

Use `replace` when the provider can enumerate the complete current state of the selected Group IDs but cannot reliably identify which previously published resources were deleted.
Omitted resources are removed only after the replacement validates successfully.
This avoids requiring tombstones for deletions the provider no longer remembers.

## Removing All Resources in a Replacement Boundary

The protocol requires every committed submission to contain at least one valid ORD Document.
To remove every resource inside a replacement boundary, stage a valid ORD Document for the publication context that contains no resources to retain and commit it in `replace` mode.

An empty replacement removes all resources inside the publisher's exact registered namespace that are in the publication context and directly associated with at least one target Group ID.
This includes resources submitted by another publisher with an overlapping publication scope.
If a namespace or group association was removed, the affected information remains published until the aggregator or an administrator handles its lifecycle outside the push protocol.

This operation removes published ORD information.
It does not delete an aggregator's authoritative system-version or system-instance record, which is outside the ORD push protocol.

## Planning for Aggregator Limits

An aggregator documents its supported request content encodings and operational limits during onboarding.
These include encoded and decoded artifact size, aggregate decoded submission size, artifact count, active submissions, concurrent requests, and request rate.
The aggregator also communicates its submission inactivity timeout.

A provider should check these limits before opening a submission and should avoid creating more simultaneous submissions than necessary.
Routine changes can be divided into several independent `merge` submissions when their resource bundles do not need one atomic publication boundary.

A `replace` submission represents the complete state of its target Group IDs and cannot be divided into sequential partial replacements for the same targets without changing its meaning.
Publishers with overlapping publication scopes must coordinate replacements because each replacement treats omitted resources in the overlap as removed.
The provider and aggregator should ensure during onboarding that the limits can accommodate the complete state of the target Group IDs rather than silently splitting a replacement.

## Choosing Validation Behavior

The default `strict: false` behavior publishes valid ORD information while reporting and skipping invalid publication units.
Use this mode when one invalid resource should not delay independent valid resources from the same ORD Document or submission.
An ORD resource and all resource definitions it declares are one publication unit, so they are always accepted or skipped together.

Set `strict: true` when all staged information must advance together.
Any validation error then fails the complete commit and leaves the submission editable for correction.
Errors that prevent the aggregator from safely isolating publication units fail the complete commit regardless of the `strict` setting.
