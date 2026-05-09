---
sidebar_position: 2
description: How versioning and lifecycle management work for ORD resources.
---

# Versioning and Lifecycle

## Overview

ORD uses two complementary mechanisms to track the state of a resource over time:

- **`version`**: A full [Semantic Versioning 2.0.0](https://semver.org/) string (e.g. `1.4.2`) that expresses the precise state of the resource definition.
- **`<majorVersion>` in the ORD ID**: An integer fragment (e.g. `v1`, `v2`) that encodes whether a breaking change has been introduced, forming a stable identity for each major generation of a resource.
- **`releaseStatus`**: Reflects the maturity and stability commitment of the resource contract (`beta`, `active`, `deprecated`, `sunset`).

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

### The `<majorVersion>` in the ORD ID

The `<majorVersion>` fragment in the [ORD ID](../index.md#ord-id) (e.g. `v1`, `v2`) signals a breaking change in the API contract. It is part of the resource's permanent identity.

**The primary trigger for incrementing `<majorVersion>` is a breaking change to the resource.** Breaking changes include:

- Removing or renaming fields or endpoints
- Changing the type or semantics of required parameters
- Altering fundamental behavior in a way consumers cannot adapt to without code changes

When `<majorVersion>` is incremented, the resource gets a new ORD ID — it becomes a distinct successor resource. The previous resource retains its original ORD ID and continues to exist until it is explicitly deprecated and eventually sunset.

**Non-breaking changes MUST NOT increment `<majorVersion>`.** The updated resource replaces the current one under the same ORD ID.

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

### Exception for `beta` Resources

Resources with `releaseStatus: beta` may introduce breaking changes without incrementing `<majorVersion>`. The `beta` status itself communicates instability, so consumers should not expect stability guarantees and should not be surprised by breaking changes.

## Lifecycle

### Lifecycle States

Resources progress through the following lifecycle states via the [`releaseStatus`](../interfaces/Document.md#api-resource_releasestatus) property:

| State | Meaning |
|---|---|
| `beta` | Unstable, not suitable for production. Breaking changes may be introduced without a new major version. |
| `active` | Stable and production-ready. Breaking changes require a new major version and a new ORD ID. |
| `deprecated` | Scheduled for removal. Consumers should migrate to a successor. |
| `sunset` | Decommissioned. The resource is no longer available. |

Note that [`visibility`](../interfaces/Document.md#api-resource_visibility) and `releaseStatus` are independent concerns: visibility controls *who* can see the resource (`public`, `internal`, or `private`), while release status controls the *stability* of the API contract. For example, a `public` resource can have `releaseStatus: beta`, meaning it is visible to external consumers but without stability guarantees.

### Deprecation

Once a newer resource succeeds an older one, the old resource SHOULD be deprecated by setting `releaseStatus` to `deprecated`. Deprecation is a deliberate signal to consumers that migration should begin.

When deprecating a resource:

- A `deprecationDate` SHOULD be provided.
- `successors` MUST be referenced if successor resources exist.
- A `sunsetDate` MAY be set to signal the planned removal date.

Deprecation does not automatically imply sunset. A resource can remain in `deprecated` state for an extended period while consumers migrate. These are separate decisions.

### Sunset and Tombstones

When a resource is decommissioned, it:

- MUST be removed from ORD or have `releaseStatus` set to `sunset`.
- MUST have a [`Tombstone`](../interfaces/Document.md#ord-document_tombstones) entry added to the ORD document, so aggregators know the resource was intentionally removed rather than accidentally dropped.

The `Tombstone` is critical for aggregators: without it, they cannot distinguish an intentional removal from a temporary unavailability or a publishing error.

## Visual Overview

![IDs, Version and Lifecycle](/img/versioning-and-lifecycle.drawio.svg "IDs, Version and Lifecycle")
