---
sidebar_position: 8
title: Push Transport Guidance
description: Operational guidance for choosing ORD push publication modes and planning submission boundaries.
---

# Push Transport Guidance

The normative push protocol is defined in the [ORD specification](../index.md#push-transport) and the [ORD Aggregator Push API](../interfaces/aggregator-push-api.mdx).
This page provides non-normative guidance for applying that protocol to common publication lifecycles.

## Publication Scopes

The standardized [`ord:publication-scope`](./standardized-ord-values.md#publication-scope) Group Type partitions resources into independently replaceable sets.
The concept is optional and is only needed for complete-state replacement.
Each provider chooses stable Group IDs of this type and assigns resources to them directly through `partOfGroups`.

A publication scope does not grant permission to publish or remove ORD information.
The aggregator applies its authorization model independently.

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
The tombstones remove matching ORD information only when the publisher is authorized to remove it in the publication context.

This pattern is appropriate when a source system or publishing pipeline records deletions explicitly.

### Upgrades and Full Reconciliation

Use `replace` when the provider publishes a complete current inventory for one or more explicitly selected publication scope Group IDs.
Declare those targets in `scope` when opening the submission.
This is useful after a major upgrade, for periodic reconciliation, or when many resources changed together.
The aggregator derives removals by comparing the successfully validated submission with previously published ORD information inside that boundary.

The replacement boundary is the publication context intersected with resources directly associated with at least one target Group ID.
Stage the Group object for every target scope in the same submission.
Every staged resource must belong directly to at least one target Group ID.
Each resource can belong to only one publication scope, although it can belong to other Group Types.
Group matching is exact and non-transitive.
The Group IDs select replacement boundaries, not authorization boundaries.
Each publication scope has one authoritative publisher in the publication context, so a different publisher cannot replace it without an explicit reassignment outside the protocol.

### Providers Without Deletion Bookkeeping

Use `replace` when the provider can enumerate the complete current state of the selected Group IDs but cannot reliably identify which previously published resources were deleted.
Omitted resources are removed only after the replacement validates successfully.
This avoids requiring tombstones for deletions the provider no longer remembers.

## Removing All Resources in a Replacement Boundary

The protocol requires every committed submission to contain at least one valid ORD Document.
To remove every resource inside a replacement boundary, stage a valid ORD Document for the publication context that contains the target Group object but no resources assigned to it and commit it in `replace` mode.

An empty replacement removes all resources in the publication context that are directly associated with at least one target Group ID.
The aggregator still rejects any removal that the publisher is not authorized to perform.

This operation removes published ORD information.
It does not delete an aggregator's authoritative system-version or system-instance record, which is outside the ORD push protocol.

## Planning for Aggregator Limits

An aggregator documents its supported request content encodings and operational limits during onboarding.
These include encoded and decoded artifact size, aggregate decoded submission size, artifact count, active submissions, concurrent requests, and request rate.
The aggregator also communicates its submission inactivity timeout.

A provider should check these limits before opening a submission and should avoid creating more simultaneous submissions than necessary.
Routine changes can be divided into several independent `merge` submissions when their resource bundles do not need one atomic publication boundary.

A `replace` submission represents the complete state of its target Group IDs and cannot be divided into sequential partial replacements for the same targets without changing its meaning.
The provider and aggregator should ensure during onboarding that the limits can accommodate the complete state of the target Group IDs rather than silently splitting a replacement.

## Choosing Validation Behavior

The default `strict: false` behavior publishes valid ORD information while reporting and skipping invalid publication units.
Use this mode when one invalid resource should not delay independent valid resources from the same ORD Document or submission.
An ORD resource and all resource definitions it declares are one publication unit, so they are always accepted or skipped together.

Set `strict: true` when all staged information must advance together.
Any validation error then fails the complete commit and leaves the submission editable for correction.
Errors that prevent the aggregator from safely isolating publication units fail the complete commit regardless of the `strict` setting.
