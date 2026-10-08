---
sidebar_position: 2
description: How versioning, compatibility, and lifecycle management work for ORD resources.
---

import { ApiLifecycleDiagram, LifecycleDiagram } from "@site/src/components/OrdDiagrams";

# Versioning and Lifecycle

> **Visual walkthrough:** Explore [versioning and lifecycle](https://open-resource-discovery.github.io/presentation/versioning-lifecycle) and the [API lifecycle example](https://open-resource-discovery.github.io/presentation/api-lifecycle) in the ORD presentation.

## Overview

ORD uses three complementary signals to track the state of a resource over time:

- **`version`**: A full [Semantic Versioning 2.0.0](https://semver.org/) string (e.g. `1.4.2`) that expresses the precise state of the resource definition.
- **`<majorVersion>` in the ORD ID**: An integer fragment (e.g. `v1`, `v2`) that encodes whether a breaking change has been introduced, forming a stable identity for each major generation of a resource.
- **`releaseStatus`**: Reflects the maturity and stability commitment of the resource contract (`development`, `beta`, `active`, `deprecated`, `sunset`).

Together, these allow aggregators and consumers to track resource evolution without breaking existing integrations.

<LifecycleDiagram />

## Versioning

### The Version Field

The `version` field MUST follow [Semantic Versioning 2.0.0](https://semver.org/):

| Change type | Example | Meaning |
|---|---|---|
| Patch (`1.0.x`) | `1.0.1` | Bug fixes and documentation updates with no API contract changes |
| Minor (`1.x.0`) | `1.1.0` | New optional capabilities added in a backward-compatible way |
| Major (`x.0.0`) | `2.0.0` | Breaking changes that may require existing consumers to adapt |

The `version` SHOULD be updated whenever the resource definition changes in a way that is relevant to consumers.
If runtime customizations or extensions lead to a changed resource definition, a build metadata suffix SHOULD be appended, for example `1.2.3+build.42`.

If the resource definition file also contains a version number (e.g. [OpenAPI `info.version`](https://spec.openapis.org/oas/v3.1.1.html#info-object)), it SHOULD match the resource `version` whenever possible.
If the native version does not follow SemVer, it MUST be converted to valid SemVer for ORD, preserving its ordering and compatibility semantics as closely as possible.
Simple normalization (e.g. `v1.2` to `1.2.0`) is appropriate when the native scheme already carries SemVer meaning; other schemes need a mapping based on the resource's compatibility changes.

**Scope of version increments:** A version change is only relevant if the ORD resource or taxonomy itself changed. If a resource inside a `Package` changes but the `Package` definition did not, the `Package` version does not need to be incremented.

**Extension changes:** If a resource has been extended by a user (tenant-specific customization), that change MUST be indicated via `lastUpdate`.
The `version` MUST NOT be bumped for extension changes.
See [Tracking Changes with `lastUpdate`](#tracking-changes-with-lastupdate) below.

### The majorVersion Fragment in the ORD ID

The `<majorVersion>` fragment in the [ORD ID](./identifiers.md#ord-id) (e.g. `v1`, `v2`) signals a breaking change in the API contract. It is part of the resource's permanent identity.

**The primary trigger for incrementing `<majorVersion>` is a breaking change to the resource.** Breaking changes include:

- Removing or renaming fields or endpoints
- Changing the type or semantics of required parameters
- Altering fundamental behavior in a way consumers cannot adapt to without code changes

When `<majorVersion>` is incremented, the resource gets a new ORD ID and becomes a distinct successor resource.
The previous resource retains its original ORD ID and continues to exist until it is explicitly deprecated and eventually sunset.

**Non-breaking changes MUST NOT increment `<majorVersion>`.** The updated resource replaces the current one under the same ORD ID.

**REST API alignment:** If the REST API expresses its version in the URL path (e.g. `/v2/`), `<majorVersion>` SHOULD match it.

### Relationship Between version and ORD ID majorVersion

In the ideal case these two are synchronized: when the `version` major increments (e.g. from `1.x.x` to `2.0.0`), `<majorVersion>` also increments (e.g. from `v1` to `v2`). This is the expected and recommended behavior.

However, strict enforcement creates an unresolvable conflict with the ORD ID stability requirement. Two scenarios can cause a divergence:

1. **No breaking change, but semver major was bumped:** Release train policies, monorepo tooling, or internal conventions cause teams to increment the semver major without any change to the API contract. Forcing a new ORD ID here would rename an unchanged resource for no consumer-facing reason.
2. **A breaking change occurred, but no new resource was created:** The provider didn't follow best practice and kept the old resource instead of creating a successor. Forcing an ORD ID change here would compound the provider's mistake because the breaking change already happened, and renaming the resource ID on top of it breaks every downstream consumer who references it.

In both cases, changing a published ORD ID is **more harmful** than the mismatch itself, because:

- **ORD IDs MUST be stable.** Changing a published ORD ID breaks downstream consumers who reference it by ID (see [ORD ID Construction](./identifiers.md#ord-id-construction)).
- The purpose of `<majorVersion>` is to track *breaking API changes*, not to mirror an organizational semver decision.

**Practical rule:** Increment `<majorVersion>` when you introduce a breaking API change and create a new resource. The semver major in `version` is a strong signal and SHOULD be kept in sync, but when they conflict, prefer ORD ID stability.

Validators SHOULD warn when `version` major and `<majorVersion>` are out of sync, as this is most often an unintentional error. However, because legitimate divergence exists, a mismatch alone MUST NOT be treated as a hard validation failure.

### Exception for Development and Beta Resources

Resources with `releaseStatus: development` or `releaseStatus: beta` may introduce breaking changes without incrementing `<majorVersion>`. These statuses communicate instability, so consumers should not expect stability guarantees.

### Tracking Changes with lastUpdate

The [`lastUpdate`](../interfaces/Document.md#api-resource_lastupdate) field (RECOMMENDED) records when the last change to the resource or its definitions occurred.

It serves a different purpose from `version`: while `version` expresses the semantic state of the API contract, `lastUpdate` tells aggregators when to re-fetch resource definition files. If a resource has attached definitions, either `version` or `lastUpdate` MUST be defined and updated whenever those definitions change.

For extension changes (tenant-specific customizations), `lastUpdate` is the correct signal.
The `version` MUST NOT be bumped for these changes.

### Changelog Entries

The [`changelogEntries`](../interfaces/Document.md#changelog-entry) property allows providers to document a human-readable history of version and lifecycle changes directly in the ORD document. See the schema documentation for the full structure.

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

Once a newer resource succeeds an older one, the old resource SHOULD be deprecated by setting [`releaseStatus`](../interfaces/Document.md#api-resource_releasestatus) to `deprecated`. Deprecation is a deliberate signal to consumers that migration should begin.

- A [`deprecationDate`](../interfaces/Document.md#api-resource_deprecationdate) SHOULD be provided. This records when the resource was set as deprecated.
- A [`sunsetDate`](../interfaces/Document.md#api-resource_sunsetdate) SHOULD be provided if already known. This is when the resource will actually be decommissioned. These are two distinct dates.
- [`successors`](../interfaces/Document.md#api-resource_successors) MUST be referenced if successor resources exist. Conversely, if `successors` is set, the resource SHOULD be deprecated.

Deprecation does not automatically imply sunset. A resource can remain in `deprecated` state for an extended period while consumers migrate.

### Sunset and Tombstones

When an ORD resource has been decommissioned or an ORD taxonomy is no longer used:

- It MUST be removed from ORD or, when the concept supports `releaseStatus`, set to `sunset`.
- A [`Tombstone`](../interfaces/Document.md#ord-document_tombstones) MUST be added to the ORD document. Aggregators need this to distinguish an intentional removal from a temporary unavailability or publishing error.
- A resource that remains in the document with `releaseStatus: sunset` MUST provide a `sunsetDate`.

### Visual Overview

<ApiLifecycleDiagram />

## Compatibility

### Summary

ORD's compatibility concept enables robust versioning and interface-based development across distributed systems.
It encompasses three key aspects:

- **Semantic versioning and backward compatibility**: Resources follow semantic versioning principles, allowing consumers to safely upgrade within major versions while providers maintain flexibility to evolve their offerings.
- **Abstract resources**: Interface-only resources that define contracts without direct instantiation, similar to abstract classes in object-oriented programming.
- **The `compatibleWith` property**: Declares compatibility relationships between resources, enabling alternative implementations and standardized interface adoption.

Together, these mechanisms support flexible system integration while maintaining clear compatibility guarantees for consumers.

### Compatibility from Consumer Perspective

ORD resources follow [Semantic Versioning 2.0.0](https://semver.org/) principles.
Consumers of API Resources, Event Resources, or Data Product Resources expect backward compatibility within major versions.
This expectation forms the foundation of reliable system integration.

Providers can introduce compatible changes in minor and patch versions.
Such changes include adding new optional fields, updating metadata, enhancing documentation, or introducing new optional functionality.
These changes MUST NOT break existing consumers relying on previous versions within the same major version.
Consumers can safely ignore newly added optional fields without any impact on their integration.

However, consumers may require functionality only available starting with a specific version of a resource.
For example, a consumer might need a new field in an API that was introduced in version 1.2.0.
In such cases, consumers can express their minimum version requirement explicitly via [`integrationDependency`](integration-dependency.md) using the `minVersion` property inside the integration dependency aspect.
This declares that the consumer expects the provider to process information according to the specified minimum version.

When providers need to introduce breaking changes, such as removing fields, changing field types, altering required parameters, or modifying fundamental behavior, they MUST increment the major version number.
Consumers relying on previous major versions will not be affected by such changes, as they represent distinct contracts.
This allows providers to evolve their resources while maintaining support for existing consumer integrations.

### Abstract ORD Resources

Abstract ORD resources serve as interfaces, allowing others to provide resources that implement the interface by declaring compatibility with the abstract resource's contract.
This enables standardization across different implementations while maintaining flexibility in how the interface is realized.
Abstract resources indicate that the resource serves as an interface only and cannot be called directly.
This concept mirrors the abstract keyword in programming languages like Java, where abstract classes define contracts that concrete implementations must fulfill.

The `abstract` property is available for API Resources, Event Resources, and Data Product Resources to indicate interface-only resources.
When set to `true`, this boolean flag signifies that the resource is an abstract representation and cannot be instantiated or consumed directly.
Instead, the abstract resource defines the contract that other concrete resources can implement through the [`compatibleWith`](#compatible-with-concept-for-ord-resources) property.

Abstract resources are particularly useful in scenarios where:

- Multiple systems need to provide functionally equivalent resources following a common interface
- A standardized contract needs to be defined across different implementation contexts

An abstract resource can be system-owned, authority-owned or published as system-independent content, depending on who governs the interface contract.
See [Shared Taxonomy, Resources and Contracts](./shared-resources.md#abstract-resources-and-compatiblewith) for how abstract resources relate to shared ORD IDs.

### Compatible With Concept for ORD Resources

The `compatibleWith` property enables API Resources, Event Resources, and Data Product Resources to declare compatibility with other resources.
This property serves two primary purposes: implementing abstract ORD resources and indicating compatibility with concrete resources.

#### Purpose and Usage

Resources use `compatibleWith` to reference an interface contract (typically an abstract resource) that they implement.
This serves as a declaration of compatible implementation, effectively functioning as an "implementationOf" relationship.
The data that compatible resources return follow the same schema, but the actual data itself can be different.
For example, if one API returns 1 record for a specific request, a compatible API could return multiple and different records, as long as they adhere to the same schema.

The `compatibleWith` property MUST contain a valid reference to an (usually external) API Resource, Event Resource, or Data Product Resource ORD ID.
All resources that share the same `compatibleWith` value MAY be treated as equivalent or similar by consumer clients, as they implement the same interface contract.

Beyond implementing abstract resources, `compatibleWith` can also indicate compatibility with other concrete resources.
This scenario occurs when an alternative implementation of an existing resource is provided.
Within larger projects, this might involve integrating third-party solutions through proxy implementations to be compatible with requirements of existing solutions.

#### Maximum Version and Contract Evolution

The `maxVersion` property specifies the maximum version of the interface contract that a resource is compatible with.
This is critical for maintaining clear compatibility boundaries as interface contracts evolve over time.

The `maxVersion` is the version that a developer has known and was probably the latest available version of the interface contract at the time of implementation.
It indicates that the resource fully implements and supports the specified version of the contract.

Even if an interface contract evolves in a backward-compatible manner (minor or patch version increments), a resource will not automatically be compatible with versions beyond its specified `maxVersion`.
This explicit boundary prevents assumptions about compatibility with future interface versions that may introduce optional features or enhancements that the implementing resource does not support.

Consider an API contract at version 1.0 that defines fields A and B.
Another API resource declaring compatibility with version 1.0 means it implements exactly fields A and B, along with any tenant-specific extensions in a dedicated namespace.
If the API contract changes to version 1.1 by adding optional field C, the API resource declaring compatibility with version 1.0 will not include field C.
Only by adopting the contract of version 1.1 and implementing fields A, B, and C would the resource also be compatible with version 1.1 of the contract.

However, a consumer client relying on version 1.0 of the contract can still work with a resource that declares compatibility with version 1.1 of the contract.
The consumer will simply use the subset of fields (A and B) defined in version 1.0, ignoring the additional field C.
This demonstrates how semantic versioning enables flexible compatibility relationships while maintaining clear boundaries.

Following the [Semantic Versioning 2.0.0](https://semver.org/) standard, patch versions (x.y.Z) MUST NOT have impact on the schema or contract.
Therefore, the `maxVersion` includes only the major.minor parts of a semantic version.
Patch-level changes represent bug fixes and non-functional improvements that do not affect the interface contract itself.

The `maxVersion` mechanism ensures that:

- Implementing resources explicitly state which version of an interface they support
- Consumers can determine whether a resource supports the interface features they require
- Interface contract owners can evolve their contracts without breaking existing implementations
- Clear boundaries exist for compatibility relationships as systems evolve over time
