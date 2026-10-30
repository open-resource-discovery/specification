---
sidebar_position: 8
title: Push Transport Guidance
description: Operational guidance for choosing ORD push publication modes and planning submission boundaries.
---

# Push Transport Guidance

> 🚧 Push transport is an <span className="feature-status-alpha">ALPHA</span> feature proposed in [specification PR #187](https://github.com/open-resource-discovery/specification/pull/187) and may still change in breaking ways.

The normative push protocol is defined in the [ORD specification](../index.md#push-transport) and the [ORD Aggregator Push API](../interfaces/aggregator-push-api.mdx).
This page gives non-normative guidance on how to apply that protocol to common publication scenarios.

## Choosing a Publication Mode

The publication mode determines whether omitting information removes it.
In both modes, the accepted changes are applied atomically.

### Routine Changes and Hot Fixes

Use `merge` when the provider knows which resources have changed.
Stage each changed ORD resource together with its Package and every resource definition it declares.
Unchanged resources can be omitted and remain published.

This avoids sending a complete inventory for small daily changes, hot fixes, or changes delivered through a transport management system.
To determine what has changed, the provider needs to keep a durable record of the publication units it has published successfully.

### Known Removals

Use `merge` with tombstones when the provider knows which previously published ORD IDs have been removed.
These tombstones remove only matching contributions of the submitting ORD provider in the submission's publication context.

This pattern fits when a source system or publishing pipeline records deletions explicitly.

### Upgrades and Full Reconciliation

Use `replace` when the provider publishes its complete current contribution for one publication context.
This is useful after a major upgrade, for periodic reconciliation, or when many resources have changed at once.
The aggregator derives removals by comparing the validated submission with the ORD provider's prior contributions in the same publication context.
To make this possible, the aggregator records the ORD provider and publication context of every accepted contribution, including those published in `merge` mode.

### Providers Without Deletion Tracking

Use `replace` when the provider can list its complete current contribution but cannot reliably tell which previously published resources were deleted.
The aggregator removes omitted contributions only after the replacement has been validated successfully.
The provider therefore does not need tombstones for deletions it no longer knows about.
Tombstones in a `replace` submission are ignored, so the provider can stage the same ORD Documents it serves through pull transport.

## Removing a Complete Contribution

Every committed submission must contain at least one valid ORD Document.
To remove everything that the ORD provider has published in a publication context, stage a valid ORD Document for that context that contains no ORD resources or taxonomy, and commit it in `replace` mode.

Such an empty replacement removes only that ORD provider's contributions in that publication context.
It also does not delete the aggregator's own record of the system version or system instance, which is outside the scope of the ORD push protocol.

## Combining Push and Pull

An application or service can be described by several ORD providers.
For example, one part can be submitted from a deployment pipeline through push transport, while another part is served through an ORD Provider API and retrieved through pull transport.
This works the same way as an application that is described by several pull-based ORD providers.

One ORD provider can also publish for multiple separately onboarded applications or services.
The aggregator resolves each submission to one authorized publication target and perspective, based on onboarding and authentication information.
Each target has its own active submission, replacement boundary, and tombstone scope, even when the ORD provider is the same.
The request's `context` object does not contain a field for selecting the target.

The contributions of these ORD providers must not overlap, because each ORD ID is described at most once within a perspective.
A push submission, including one in `replace` mode, changes only the contribution of the submitting ORD provider.
To move ORD information from one ORD provider to another, first remove it from the original ORD provider, then publish it from the new one.

## Planning for Aggregator Limits

During onboarding, an aggregator documents its supported request content encodings and operational limits.
These include encoded and decoded artifact size, aggregate decoded submission size, artifact count, active submissions, concurrent requests, and request rate.
The aggregator also communicates its submission inactivity timeout and how long it retains processed submissions for reading their status and issues.

A provider should check these limits before it opens a submission.
An ORD provider can have only one active submission per publication context, so it must commit or discard a submission before it opens the next one for that context.
Routine changes can be split into several `merge` submissions that are committed one after another, as long as their publication units do not need to be published together atomically.

A `replace` submission represents the ORD provider's complete contribution in its publication context.
It cannot be split into a sequence of partial replacements, because each commit would remove everything omitted from that submission.
The provider and aggregator should therefore make sure during onboarding that the complete contribution fits within the aggregator's documented limits.

## Validation at Staging and Commit

When an ORD Document is staged through `PUT`, the aggregator validates at least the parts that push transport relies on: the body is a JSON object, `openResourceDiscovery` and `perspective` are present, each processed collection is an array whose items have an identifier, and every declared resource definition has a `url` and a `mediaType` of type string.
Malformed JSON is rejected with `400`, and a document that fails these checks is rejected with `422`.
The aggregator does not have to validate the rest of the document at this point; complete content validation is the provider's responsibility.
A failed upload does not change the staged content, the submission state, or the expiry time.
Correct or remove the failing objects and upload the document again before committing.

Commit validates the complete staged content, including resource definitions, references, semantic rules, the publication context, and current authorization.
The aggregator publishes all valid ORD information and reports and skips publication units that have errors.
A resource with a semantic error or a missing definition therefore does not hold back independent valid resources in the same ORD Document or submission.
An ORD resource and all resource definitions it declares form one publication unit, so they are always accepted or skipped together.

An error that cannot be confined to one publication unit is a submission-wide error.
It fails the complete commit, and the submission remains editable so that the provider can correct it.
