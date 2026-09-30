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

Every `replace` submission requires a `scopeId`.
The scope ensures that replacement affects only one onboarded contribution set when several independently operated providers contribute to the same application or one provider partitions its publication into independently replaceable sets.
Providers should register each scope ID with the aggregator during onboarding before using it.
The aggregator checks that the authenticated push client is authorized to publish both for the application or other publication context and for the selected scope.
Prefer a registered [ORD namespace](../index.md#namespaces) that reflects the component or team responsible for the publishing scope.
A component within one system will normally use a registered sub-context namespace, while a cross-system organizational owner can use an authority namespace.

### Providers Without Deletion Bookkeeping

Use scoped `replace` when the provider can enumerate its complete current state but cannot reliably identify which previously published resources were deleted.
Omitted contributions are removed only after the replacement validates successfully.
This avoids requiring tombstones for deletions the provider no longer remembers.

## Removing a Complete Contribution

The protocol requires every committed submission to contain at least one valid ORD Document.
To remove everything previously published inside a replacement boundary, stage a valid ORD Document for the publication context that contains no ORD information to retain and commit it in `replace` mode.

A scoped empty replacement removes only contributions attributed to that publisher, publication context, and scope.
It does not remove contributions owned by another publisher or delegator.

This operation removes published ORD contributions.
It does not delete an aggregator's authoritative system-version or system-instance record, which is outside the ORD push protocol.

## Planning for Aggregator Limits

An aggregator documents its supported request content encodings and operational limits during onboarding.
These include encoded and decoded artifact size, aggregate decoded submission size, artifact count, active submissions, concurrent requests, and request rate.
The aggregator also communicates its submission inactivity timeout.

A provider should check these limits before opening a submission and should avoid creating more simultaneous submissions than necessary.
Routine changes can be divided into several independent `merge` submissions when their resource bundles do not need one atomic publication boundary.

A `replace` submission represents the complete state of its replacement boundary and cannot be divided into sequential partial replacements without changing its meaning.
Providers should choose scope boundaries that make complete replacement practical within the aggregator's documented limits.
The provider and aggregator should resolve an insufficient replacement limit during onboarding rather than silently splitting the replacement.

## Choosing Validation Behavior

The default `strict: false` behavior publishes valid ORD information while reporting and skipping invalid publication units.
Use this mode when one invalid resource should not delay independent valid resources from the same ORD Document or submission.
An ORD resource and all resource definitions it declares are one publication unit, so they are always accepted or skipped together.

Set `strict: true` when all staged information must advance together.
Any validation error then fails the complete commit and leaves the submission editable for correction.
Errors that prevent the aggregator from safely isolating publication units fail the complete commit regardless of the `strict` setting.
