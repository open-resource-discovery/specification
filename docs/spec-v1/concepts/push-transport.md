---
sidebar_position: 8
title: Push Transport Guidance
description: Operational guidance for choosing ORD push publication modes and planning submission boundaries.
---

# Push Transport Guidance

> 🚧 Push transport is an <span className="feature-status-alpha">ALPHA</span> feature and may still change in breaking ways.

The normative push protocol is defined in the [ORD specification](../index.md#push-transport) and the [ORD Aggregator Push API](../interfaces/aggregator-push-api.mdx).
This page gives non-normative guidance on how to apply that protocol to common publication scenarios.

## Choosing a Publication Mode

The publication mode determines whether omitting information removes it.
For example, if units `A` and `B` were published before and the provider now stages only `A`:

- `merge` keeps `B` published.
- `replace` removes `B`.
- If `B` is staged but skipped because of an error, it stays published in both modes.

### Routine Changes and Hot Fixes

Use `merge` when the provider knows which resources have changed.
Stage each changed ORD resource together with its Package and every resource definition it declares.
Unchanged resources can be omitted and remain published.

This avoids sending a complete inventory for small daily changes, hot fixes, or changes delivered through a transport management system.
To determine what has changed, the provider needs to keep a durable record of the publication units it has published successfully.

### Known Removals

Use `merge` with tombstones when the provider knows which previously published ORD IDs have been removed, for example because a source system or publishing pipeline records deletions explicitly.
These tombstones remove only matching contributions of the submitting ORD provider in the submission's publication context.

### Complete Inventory

Use `replace` when the provider publishes its complete current contribution for one publication context.
This fits after a major upgrade, for periodic reconciliation, when many resources have changed at once, or when the provider cannot reliably tell which previously published resources were deleted.
The aggregator derives removals by comparing the validated submission with the ORD provider's prior contributions in the same publication context, so the provider needs no tombstones.
Tombstones in a `replace` submission are not processed, so the provider can stage the same ORD Documents it serves through pull transport.

## Removing a Complete Contribution

Every committed submission must contain at least one valid ORD Document.
To remove everything that the ORD provider has published in a publication context, stage a valid ORD Document for that context that contains no ORD resources or taxonomy, and commit it in `replace` mode.

Such an empty replacement removes only that ORD provider's contributions in that publication context.
It also does not delete the aggregator's own record of the system version or system instance, which is outside the scope of the ORD push protocol.

## Combining Push and Pull

An application or service can be described by several ORD providers.
For example, one part can be submitted from a deployment pipeline through push transport, while another part is served through an ORD Provider API and retrieved through pull transport.
This works the same way as an application that is described by several pull-based ORD providers.
One ORD provider can also publish for several separately onboarded applications or services, as described in [Publication Context and Removal](../index.md#publication-context-and-removal).

The contributions of these ORD providers must not overlap, because each ORD ID is described at most once within a perspective.
A push submission, including one in `replace` mode, changes only the contribution of the submitting ORD provider.
How ORD information is handed over from one ORD provider to another, for example when a system switches from pull to push transport, is not defined yet.
An aggregator may allow the new ORD provider to take over the content, or require a dedicated handover, for example by removing the content from the original ORD provider first.

## Planning for Aggregator Limits

Check the aggregator's [documented limits](../index.md#operational-limits-timeouts-retries-and-rate-limiting) before opening a submission.
An ORD provider can have only one active submission per publication context, so it must commit or discard a submission before it opens the next one for that context.
Routine changes can be split into several `merge` submissions that are committed one after another, as long as their publication units do not need to be published together atomically.

A `replace` submission represents the ORD provider's complete contribution in its publication context.
It cannot be split into a sequence of partial replacements, because each commit would remove everything omitted from that submission.
The provider and aggregator should therefore make sure during onboarding that the complete contribution fits within the aggregator's documented limits.

## Validation at Staging and Commit

Upload checks that a document can be staged; commit validates the complete staged revision.
A successful upload therefore does not guarantee publication, so validate ORD Documents and resource definitions locally before uploading them.
After commit, read all issues, because a `processed` submission can contain skipped units.
See [Staging](../index.md#staging) and [Commit Validation and Outcome](../index.md#commit-validation-and-outcome) for the exact rules.
