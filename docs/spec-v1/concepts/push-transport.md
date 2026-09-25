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
It does not change validation strictness or atomicity.

### Routine Changes, Hot Fixes, and Transports

Use `merge` when the provider knows which resources changed.
Stage each changed ORD resource together with every resource definition it declares.
Unrelated resources may be omitted and remain published.

This pattern avoids sending a complete inventory for small daily changes, hot fixes, or transported development content.
The provider needs durable bookkeeping of successfully published resource bundles to determine what changed.

### Known Removals

Use `merge` with tombstones when the provider knows which previously published ORD IDs were removed.
The tombstones remove matching contributions only inside the submission's replacement boundary.

This pattern is appropriate when a source system or publishing pipeline records deletions explicitly.

### Upgrades and Full Reconciliation

Use `replace` when the provider publishes a complete current inventory for a replacement boundary.
This is useful after a major upgrade, for periodic reconciliation, or when many resources changed together.
The aggregator derives removals by comparing the successfully validated submission with prior contributions inside that boundary.

Use a `scopeId` when several independently operated providers contribute to the same application or when one provider partitions its publication into independently replaceable sets.
An unscoped replacement affects all contributions from that publisher in the publication context and requires separate authorization.

### Providers Without Deletion Bookkeeping

Use scoped `replace` when the provider can enumerate its complete current state but cannot reliably identify which previously published resources were deleted.
Omitted contributions are removed only after the replacement validates successfully.
This avoids requiring tombstones for deletions the provider no longer remembers.

## Removing a Complete Contribution

The protocol requires every committed submission to contain at least one valid ORD Document.
To remove everything previously published inside a replacement boundary, stage a valid ORD Document for the publication context that contains no ORD information to retain and commit it in `replace` mode.

A scoped empty replacement removes only contributions attributed to that publisher, publication context, and scope.
An unscoped empty replacement removes all contributions from that publisher across its scopes in the publication context and requires provider-wide replacement authorization.
Neither form removes contributions owned by another publisher or delegator.

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
