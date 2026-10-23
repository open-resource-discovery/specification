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
The tombstones remove matching contributions only from the submitting ORD provider in the submission's publication context.

This pattern is appropriate when a source system or publishing pipeline records deletions explicitly.

### Upgrades and Full Reconciliation

Use `replace` when the provider publishes its complete current contribution for one publication context.
This is useful after a major upgrade, for periodic reconciliation, or when many resources changed together.
The aggregator derives removals by comparing the successfully validated submission with that ORD provider's prior contributions in the same context.
It must retain ORD provider and context provenance for accepted `merge` publications so later `replace` operations can identify the ORD provider's complete contribution.

### Providers Without Deletion Bookkeeping

Use `replace` when the provider can enumerate its complete current contribution but cannot reliably identify which previously published resources were deleted.
Omitted contributions are removed only after the replacement validates successfully.
This avoids requiring tombstones for deletions the provider no longer remembers.

## Removing a Complete Contribution

The protocol requires every committed submission to contain at least one valid ORD Document.
To remove everything previously published by this ORD provider in a publication context, stage a valid ORD Document for the context that contains no ORD information to retain and commit it in `replace` mode.

An empty replacement removes only contributions attributed to that ORD provider in that context.
It does not remove contributions owned by another ORD provider or published in another context.

This operation removes published ORD contributions.
It does not delete an aggregator's authoritative system-version or system-instance record, which is outside the ORD push protocol.

## Combining Push and Pull

An application or service can be described by several ORD providers.
For example, one part can be submitted from a deployment pipeline through push transport while another part is served through an ORD Provider API and retrieved through pull transport.
This works the same way as an application described by several pull-based ORD providers.

The contributions of these ORD providers must not overlap, because each ORD ID is described at most once within a perspective.
A push submission, including one in `replace` mode, changes only the contribution of the submitting ORD provider.
To move ORD information from one ORD provider to another, remove it from the first ORD provider before the second one publishes it.

## Planning for Aggregator Limits

An aggregator documents its supported request content encodings and operational limits during onboarding.
These include encoded and decoded artifact size, aggregate decoded submission size, artifact count, active submissions, concurrent requests, and request rate.
The aggregator also communicates its submission inactivity timeout and how long it retains published submissions for status and diagnostics.

A provider should check these limits before opening a submission.
An ORD provider can have only one active submission per publication context, so it commits or discards a submission before opening the next one for that context.
Routine changes can be divided into several `merge` submissions, committed one after another, when their resource bundles do not need one atomic publication boundary.

A `replace` submission represents the ORD provider's complete contribution in its publication context and cannot be divided into sequential partial replacements without changing its meaning.
The provider and aggregator should ensure during onboarding that this complete contribution fits within the aggregator's documented limits.

## Choosing Validation Behavior

The default `strict: false` behavior publishes valid ORD information while reporting and skipping invalid publication units.
Use this mode when one invalid resource should not delay independent valid resources from the same ORD Document or submission.
An ORD resource and all resource definitions it declares are one publication unit, so they are always accepted or skipped together.

Set `strict: true` when all staged information must advance together.
Any validation error then fails the complete commit and leaves the submission editable for correction.
Errors that prevent the aggregator from safely isolating publication units fail the complete commit regardless of the `strict` setting.
