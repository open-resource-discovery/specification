---
sidebar_position: 2
description: How versioning and lifecycle management work for ORD resources.
---

# Versioning and Lifecycle

## Overview

ORD uses two complementary mechanisms to track the state of a resource over time:

- **`version`**: A full [Semantic Versioning 2.0.0](https://semver.org/) string (e.g. `1.4.2`) that expresses the precise state of the resource definition.
- **`<majorVersion>` in the ORD ID**: An integer fragment (e.g. `v1`, `v2`) that encodes whether a breaking change has been introduced, forming a stable identity for each major generation of a resource.
- **`releaseStatus`**: Reflects the maturity and stability commitment of the resource contract (`development`, `beta`, `active`, `deprecated`, `sunset`).

Together, these allow aggregators and consumers to track resource evolution without breaking existing integrations.

## Versioning

### The `version` Field

The `version` field MUST follow [Semantic Versioning 2.0.0](https://semver.org/):

| Change type | Example | Meaning |
|---|---|---|
| Patch (`1.0.x`) | `1.0.1` | Bug fixes, documentation updates — no API contract changes |
| Minor (`1.x.0`) | `1.1.0` | New optional capabilities added in a backward-compatible way |
| Major (`x.0.0`) | `2.0.0` | Breaking changes — existing consumers may need to adapt |

The `version` SHOULD be updated whenever the resource definition changes in a way that is relevant to consumers. If runtime customizations or extensions lead to a changed resource definition, a build number SHOULD be appended (e.g. `1.2.3+build.42`).

If the resource definition file also contains a version number (e.g. [OpenAPI `info.version`](https://spec.openapis.org/oas/v3.1.1.html#info-object)), it SHOULD be kept in sync with the resource `version` to avoid inconsistencies.

**Scope of version increments:** A version change is only relevant if the ORD resource or taxonomy itself changed. If a resource inside a `Package` changes but the `Package` definition did not, the `Package` version does not need to be incremented.

**Extension changes:** If a resource has been extended by a user (tenant-specific customization), that change MUST be indicated via `lastUpdate` — the `version` MUST NOT be bumped for extension changes. See [Tracking Changes with `lastUpdate`](#tracking-changes-with-lastupdate) below.

### The `<majorVersion>` in the ORD ID

The `<majorVersion>` fragment in the [ORD ID](../index.md#ord-id) (e.g. `v1`, `v2`) signals a breaking change in the API contract. It is part of the resource's permanent identity.

**The primary trigger for incrementing `<majorVersion>` is a breaking change to the resource.** Breaking changes include:

- Removing or renaming fields or endpoints
- Changing the type or semantics of required parameters
- Altering fundamental behavior in a way consumers cannot adapt to without code changes

When `<majorVersion>` is incremented, the resource gets a new ORD ID — it becomes a distinct successor resource. The previous resource retains its original ORD ID and continues to exist until it is explicitly deprecated and eventually sunset.

**Non-breaking changes MUST NOT increment `<majorVersion>`.** The updated resource replaces the current one under the same ORD ID.

**REST API alignment:** If the REST API expresses its version in the URL path (e.g. `/v2/`), `<majorVersion>` SHOULD match it.

### Relationship between `version` and ORD ID `<majorVersion>`

In the ideal case these two are synchronized: when the `version` major increments (e.g. from `1.x.x` to `2.0.0`), `<majorVersion>` also increments (e.g. from `v1` to `v2`). This is the expected and recommended behavior.

However, strict enforcement creates an unresolvable conflict with the ORD ID stability requirement. Two scenarios can cause a divergence:

1. **No breaking change, but semver major was bumped** — release train policies, monorepo tooling, or internal conventions cause teams to increment the semver major without any change to the API contract. Forcing a new ORD ID here would rename an unchanged resource for no consumer-facing reason.
2. **A breaking change occurred, but no new resource was created** — the provider didn't follow best practice and kept the old resource instead of creating a successor. Forcing an ORD ID change here would compound the provider's mistake: the breaking change already happened, and renaming the resource ID on top of it breaks every downstream consumer who references it.

In both cases, changing a published ORD ID is **more harmful** than the mismatch itself, because:

- **ORD IDs MUST be stable** — changing a published ORD ID breaks downstream consumers who reference it by ID (see [ORD ID Construction](../index.md#ord-id-construction)).
- The purpose of `<majorVersion>` is to track *breaking API changes*, not to mirror an organizational semver decision.

**Practical rule:** Increment `<majorVersion>` when you introduce a breaking API change and create a new resource. The semver major in `version` is a strong signal and SHOULD be kept in sync, but when they conflict, prefer ORD ID stability.

Validators SHOULD warn when `version` major and `<majorVersion>` are out of sync, as this is most often an unintentional error. However, because legitimate divergence exists, a mismatch alone MUST NOT be treated as a hard validation failure.

### Exception for `development` and `beta` Resources

Resources with `releaseStatus: development` or `releaseStatus: beta` may introduce breaking changes without incrementing `<majorVersion>`. These statuses communicate instability, so consumers should not expect stability guarantees.

### Tracking Changes with `lastUpdate`

The `lastUpdate` field (RECOMMENDED) records when the last change to the resource or its definitions occurred (RFC 3339 date-time).

It serves a different purpose from `version`:

- `version` expresses the semantic state of the API contract.
- `lastUpdate` tells aggregators when to re-fetch resource definition files.

If a resource has attached definitions, either `version` or `lastUpdate` MUST be defined and updated whenever those definitions change, so that ORD aggregators know to re-fetch them.

For extension changes (tenant-specific customizations), `lastUpdate` is the correct signal — `version` MUST NOT be bumped for these.

### Changelog Entries

The `changelogEntries` property (available on API Resources, Event Resources, Entity Types, Integration Dependencies, and Agents) allows providers to document a human-readable history of version and lifecycle changes directly in the ORD document.

Each entry records:
- `version` — the version this entry describes
- `releaseStatus` — the release status at that version
- `date` — the date of the change (RFC 3339 date only)
- `description` — a CommonMark description of what changed
- `url` (optional) — a link to a more detailed external changelog

## Lifecycle

### Lifecycle States

Resources progress through the following lifecycle states via the [`releaseStatus`](../interfaces/Document.md#api-resource_releasestatus) property:

| State | Meaning |
|---|---|
| `development` | Unreleased and under active development. The API contract is unstable and may change at any time. Not intended for consumption outside the development team. |
| `beta` | Released but without final stability guarantees. Breaking changes may occur at any time without notice or a deprecation period. Suitable for early adopters and feedback gathering. |
| `active` | Stable and production-ready. Breaking changes will only be introduced through proper deprecation cycles or new major versions. |
| `deprecated` | Still functional but scheduled for removal. No new consumers should depend on it. |
| `sunset` | Decommissioned and no longer available at runtime. This entry exists for historical reference only. |

Note that [`visibility`](../interfaces/Document.md#api-resource_visibility) and `releaseStatus` are independent concerns: visibility controls *who* can see the resource (`public`, `internal`, or `private`), while release status controls the *stability* of the API contract. For example, a `public` resource can have `releaseStatus: beta`, meaning it is visible to external consumers but without stability guarantees.

### Deprecation

Once a newer resource succeeds an older one, the old resource SHOULD be deprecated by setting `releaseStatus` to `deprecated`. Deprecation is a deliberate signal to consumers that migration should begin.

When deprecating a resource:

- A `deprecationDate` SHOULD be provided — this records when the resource was set as deprecated.
- A `sunsetDate` SHOULD be provided if already known — this is when the resource will actually be decommissioned. These are two distinct dates.
- `successors` MUST be referenced if successor resources exist.

Conversely, if `successors` is set on a resource, that resource SHOULD have its `releaseStatus` set to `deprecated`.

Deprecation does not automatically imply sunset. A resource can remain in `deprecated` state for an extended period while consumers migrate. These are separate decisions.

### Sunset and Tombstones

When a resource is decommissioned:

- `releaseStatus` MUST be set to `sunset`, and a `sunsetDate` MUST be provided.
- A [`Tombstone`](../interfaces/Document.md#ord-document_tombstones) MUST be added to the ORD document. Aggregators need this to distinguish an intentional removal from a temporary unavailability or publishing error.
- The resource MAY be removed from the ORD document entirely, but keeping it with `releaseStatus: sunset` allows historical reference.

## Visual Overview

![IDs, Version and Lifecycle](/img/versioning-and-lifecycle.drawio.svg "IDs, Version and Lifecycle")
