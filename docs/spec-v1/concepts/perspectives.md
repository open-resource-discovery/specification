---
sidebar_position: 5
description: Metadata can be described from static or dynamic perspectives. This article explains the concept in more detail.
---

# Perspectives

> ⏩ The technical requirements of this are described in the [specification section on perspectives](../../spec-v1/index.md#perspectives).

## Overview

An application or service can be described both from a [static](../../spec-v1/index.md#static-perspective) or a [dynamic](../../spec-v1/index.md#dynamic-perspective) perspective. The configuration endpoint can point to different ORD documents that represent the information from the different perspectives.

### Static Perspective

The static perspective describes how an application or service looks like _in general_ at design-time.
This perspective is especially useful for customers, who haven't purchased a product yet and need to understand what technical capabilities they would get.
It also helps to understand the common baseline of what all systems of the same type provide and how it changes over time.

The static perspective has the following sub-levels:

- **`system-version`**: Describes the metadata for a concrete version of a [system type](../../spec-v1/index.md#system-type). Static metadata is known at design-time or deploy-time, when a new version of an application or service is developed or provisioned. This is the recommended static perspective for all new publications.
- **`system-type`**: A deprecated perspective for static metadata without a concrete system version. It is retained for backward compatibility and represents the legacy current view of the system type.

Every new static publication should identify a concrete system version, even when that version identifies an ORD publication or deployment state rather than a commercial product release.
The `latest` alias identifies the default concrete version for consumers that do not request a version.
The provider can assign the alias explicitly, or the aggregator can derive it from the greatest available version according to Semantic Versioning precedence.
But consider that also cloud software that is going through phased deployments therefore can have multiple versions active at the same time.

The static perspective describes the shared metadata of all system instances (tenants) of the same system version.
Either the metadata is always the same or it explicitly ignores the tenant-specific extensibility, configuration and any feature toggles - describing what's generic and shared.
The advantage of static metadata is that it is always available, there is no need to first provision tenants to get it. It is also a good integration contract for everything that is meant to work potentially with _any_ tenant.

At SAP, we have the [SAP Business Accelerator Hub](https://api.sap.com/) that documents the static perspective.

#### System Version Guidelines

Versions and Lifecycle is often difficult. Putting a version on a system is not always straightforward.
Here are some guidelines how to choose the correct version for the `system-version` perspective:

- If the system has explicit versions (e.g. "v1.0.1", "v2.0.0"), use these versions.
- If the system does not use SemVer, it has to be converted so that SemVer conventions apply (conservatively).
  - E.g. if the system uses simple incremental versions like "1", "2" or "2404, convert these to "1.0.0", "2.0.0", "2404.0.0" respectively.
  - E.g. if the system uses date-based versions like "2024-01-15", convert these to "2024.1.15".
- If the system is continuously delivered and has no commercial release version, assign a concrete SemVer to each immutable publication or deployment state.
  - Mark the current default version with the `latest` alias, or let the aggregator derive the alias.
  - Do not use `latest` as the value of `describedSystemVersion.version`, because tenant resolution requires a concrete version.

For the normative rules on choosing between `system-type` and `system-version`, see [Correct Use of Perspectives](../../spec-v1/index.md#correct-use-of-perspectives).

### Dynamic Perspective

The dynamic perspective describes an application or service as it really looks like, _at run-time_.
This is more precise than the static perspective, because it can reflect configuration, customization and extensions of the system instance (tenant).

In ORD, we describe this with `perspective`: `system-instance`.

The `system-instance` perspective is the correct choice, when the resource description or its metadata is actually different between system instances of the same system version.
When used, the perspective completely describes the running system instance as it is.
It is not a "diff" on the static perspective, for this we may consider introducing a specialized `system-instance-delta` perspective as optimization later.

Some examples when metadata can be dynamic:

- APIs or Events can be activated and deactivated per system instance / tenant.
- API or Event interfaces can be extended, e.g. through field extensibility.
- New resources can be created by the user of the application at run-time (typical situation for frameworks, platforms and extensible applications).
- Endpoint URLs may be dynamic

At SAP, the run-time discovery of dynamic metadata (system-instance) is handled by the [Unified Customer Landscape](../../introduction.mdx#unified-customer-landscape) in BTP.

### System Independent Perspective

Some ORD information like Taxonomies, Products and Vendors is not dependent on systems and can use the `system-independent` perspective.
They can be considered global, static content that can be shared by multiple systems.

Such content is of a "singleton" quality for the whole ORD aggregator and SHOULD not be republished by the individual systems.

> Note: Cross-system-type taxonomy, resources and contracts can be modeled either as system-scoped publications or as `system-independent` content.
> Cross-system-type resources and contracts still describe a system's capabilities and are published per system type/version/instance.
> System-independent content (Vendors, Products, global Entity Types, global Groups and Group Types) exists outside the system context entirely.
> See [Shared Taxonomy, Resources and Contracts](./shared-resources.md) for the distinction.

### How Perspectives relate to each other

The dynamic perspective is a more precise description of the system instance than the static perspective, as it can contain its customizations.
If no dynamic perspective has been published for a system instance, the static perspective can be used as the fallback.

This is depicted in the following diagram:

<div className="img-box" style={{aspectRatio: "572/377"}}>

![Perspectives to Relation](/img/ord-explicit-system-perspectives.drawio.svg "Perspectives Relation")

</div>

The `system-instance` perspective is the most specific, because a consumer could ask how a particular system instance / tenant really looks like. If there is system-instance metadata for it, we can return it directly.
If we don't have it, we need to fall back to the `system-version` layer and instead return the metadata for the version of the system instance.

Note that perspectives do not merge: when a more specific perspective is available, it completely replaces the less specific one. For example, if `system-instance` metadata is published for a resource, it fully overrides the `system-version` description of that resource — the two are not combined.

If no concrete system version is requested, the aggregator SHOULD resolve the `latest` system version (see [Static Perspective Resolution](#static-perspective-resolution) below).

A consumer can legitimately be interested in all three levels, but needs to provide a different context for each:

- If `system-instance` metadata is requested, the tenant / system instance ID needs to be specified.
- If `system-version` metadata is requested, the system type and system version must be specified.
- If static metadata without a concrete version is requested, only the system type must be specified. The aggregator resolves the `latest` version (see [Static Perspective Resolution](#static-perspective-resolution)).

### Relation to System-Instance-Aware

The `perspectives` attribute deprecates the `systemInstanceAware` attribute.

With `systemInstanceAware` it was already possible to define whether metadata was dynamic (different per system instance) or not.
But the concept did not allow to describe the same resource in different perspectives and also did not define how the perspectives build upon each other.

To migrate: replace `systemInstanceAware: true` with `perspective: "system-instance"` and split your ORD document so that static and dynamic metadata are in separate documents with their respective perspective set. See the [`perspective` property on the ORD Configuration](../../spec-v1/interfaces/Configuration.md) interface for details.

## ORD Provider Considerations

The following diagram gives an overview which perspectives need to be described by an ORD Provider:

<div className="img-box" style={{aspectRatio: "642/160"}}>

![Perspectives to Provide](/img/ord-explicit-system-persectices-flow.drawio.svg "Perspectives to Provide")

</div>

If the system has static metadata, it should explicitly use the `system-version` perspective and state its version (`describedSystemVersion`).
If the system has dynamic metadata, it should describe both perspectives completely, if possible.

If the `system-version` perspective is used, the described version MUST be provided via the ORD `describedSystemVersion`.`version` property.
The provider MAY assign the `latest` alias through `describedSystemVersion`.`aliases`.
At most one version of a system type MUST carry the `latest` alias.
All documents from the provider that describe the same system version MUST assign aliases consistently.
The `system-type` perspective is deprecated, and its version property remains optional for backward compatibility.
Ideally, ORD providers SHOULD define the `describedSystemVersion`.`version` property on both the `system-version` and `system-instance` perspectives.

The `version` becomes effectively the "join" criteria for how the dynamic metadata is associated to the version-specific static metadata.

If an aggregator supports delegated publication, the ORD Provider responsible for onboarding the described system type determines its static publication model.
An ORD Provider publishing metadata on behalf of that system type MUST use the same static perspective and concrete system versions.
Only the provider responsible for the system identity SHOULD assign the `latest` alias.

> ⏩ See also: [Correct Use of Perspectives](../../spec-v1/index.md#correct-use-of-perspectives).

## ORD Aggregator Considerations

#### Static Aggregators

Static aggregators primarily describe the `system-version` perspective.
They MAY continue to accept the deprecated `system-type` perspective for backward compatibility.

- If both static and dynamic perspectives are described, they MUST only pick the static perspectives (`system-type` or `system-version`).
- If only `system-instance` (or unspecified) perspective is available, we assume this is a generic system instance which is meant to describe all system instances as a subsidiary.
- Static perspective resolution SHOULD follow the algorithm described [below](#static-perspective-resolution).

#### Dynamic Aggregators

If the aggregator supports both static and dynamic perspectives:

- The ORD aggregator MUST be able to aggregate and store all perspectives (`system-type`, `system-version`, and `system-instance`) at the same time.
- In its ORD Discovery API for consumers, it needs to implement the inheritance / fallback behavior:
  - When `system-instance` is requested but not available, fall back to the matching `system-version`.
  - Fall back to the deprecated `system-type` perspective only when no `system-version` metadata is published for that system type.
  - Static perspective resolution (when `system-type` or `system-version` is requested) SHOULD follow the algorithm described [below](#static-perspective-resolution).

#### Static Perspective Resolution

When a consumer requests static metadata for a given system type, the aggregator SHOULD resolve what to return as follows (see also the [perspective relation diagram](#how-perspectives-relate-to-each-other)):

1. If a **specific system version is requested**, return the `system-version` perspective data for that exact version.
   If it is unavailable, return no static view and do not substitute another version.
2. If **no specific version is requested**, return the `system-version` perspective carrying the `latest` alias, if exactly one is available.
3. If no explicit `latest` alias is available, return the greatest available `system-version` according to [Semantic Versioning 2.0.0](https://semver.org/) precedence.
4. If no `system-version` metadata exists for the system type, return the deprecated `system-type` perspective as the legacy equivalent of `latest`, when available.
5. If multiple versions carry the `latest` alias, report a validation error and do not resolve the ambiguity silently.

The `latest` alias affects only unversioned static requests.
It MUST NOT affect a request for a concrete version or the resolution of a system instance whose concrete version is known.

#### Tombstone Handling across Versions

An older version of an application / service can have a resource which has been decommissioned (via a `Tombstone`) in a newer version.
The inheritance / fallback logic MUST not fall back to the now removed resource.
