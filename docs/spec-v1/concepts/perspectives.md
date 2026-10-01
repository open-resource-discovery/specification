---
sidebar_position: 5
description: Metadata can be described from static or dynamic perspectives. This article explains the concept in more detail.
---

# Perspectives

> ⏩ The technical requirements of this are described in the [specification section on perspectives](../../spec-v1/index.md#perspectives).

## Overview

An application or service can be described both from a [static](../../spec-v1/index.md#static-perspective) or a [dynamic](../../spec-v1/index.md#dynamic-perspective) perspective. The configuration endpoint can point to different ORD documents that represent the information from the different perspectives.

> **Consumer principle:** Consumers request an effective view of a tenant or system without needing to know how an ORD provider publishes the underlying metadata.
> For a tenant, the effective view describes that tenant or uses the applicable static fallback when no tenant perspective is published.
> For static metadata, a consumer can request a specific system version or the latest effective static view.
> The aggregator selects one applicable complete perspective; it does not combine resources from different static perspectives.

### Static Perspective

The static perspective describes how an application or service looks like _in general_ at design-time.
This perspective is especially useful for customers, who haven't purchased a product yet and need to understand what technical capabilities they would get.
It also helps to understand the common baseline of what all systems of the same type provide and how it changes over time.
Static ORD documents MUST NOT contain tenant context or tenant-specific customizations.

The static perspective has two publication options:

- **`system-version`**: Describes static metadata associated with a specific version of a [system type](../../spec-v1/index.md#system-type).
  Use distinct versions when consumers need to distinguish system releases.
- **`system-type`**: Describes version-independent static metadata for a system type without distinguishing [system versions](../../spec-v1/index.md#system-version).
  It may also serve as the complete current static view when treating every system instance as running the latest view is sufficient.

A system type MAY publish static metadata through either perspective or both.
Each published perspective is a complete view of its scope.
When a `system-version` perspective is selected, a resource omitted from it is not available in that version and MUST NOT be filled in from `system-type`.
See [ORD Provider Considerations](#ord-provider-considerations) for the complete selection guidance.

The static perspective describes the shared metadata of all system instances (tenants) of the same system version or version independent.
The metadata describes only what is generic and shared, independently of tenant-specific extensibility, configuration, and feature toggles.
The advantage of static metadata is that it can be published and aggregated without first provisioning tenants. It is also a good integration contract for everything that is meant to work potentially with _any_ tenant.

At SAP, we have the [SAP Business Accelerator Hub](https://api.sap.com/) that documents the static perspective.

#### System Version Guidelines

System versioning and lifecycle management are often difficult. Putting a version on a system is not always straightforward.
Here are some guidelines how to choose the correct version for the `system-version` perspective:

- If the system has explicit versions (e.g. "v1.0.1", "v2.0.0"), use these versions.
- If the system does not use SemVer, it has to be converted so that SemVer conventions apply (conservatively).
  - E.g. if the system uses simple incremental versions like "1", "2" or "2404", convert these to "1.0.0", "2.0.0", "2404.0.0" respectively.
  - E.g. if the system uses date-based versions like "2024-01-15", convert these to "2024.1.15".
- If the system is continuously delivered and treating every system instance as running the latest static view is sufficient, use `system-type` or use `system-version` with a fixed version such as `1.0.0`.
  When using a fixed system version, keep `describedSystemVersion.version` unchanged and replace the published view with every release.
- If multiple versions of the same application are deployed at the same time in one environment tier, such as production, use distinct `system-version` values for those releases.

For the normative rules on choosing between `system-type` and `system-version`, see [Correct Use of Perspectives](../../spec-v1/index.md#correct-use-of-perspectives).

### Dynamic Perspective

The dynamic perspective describes an application or service as it really looks like, _at run-time_.
This is more precise than the static perspective, because it can reflect configuration, customization and extensions of the system instance (tenant).

In ORD, we describe this with `perspective`: `system-instance`.

The `system-instance` perspective is the correct choice when the resource description or its metadata is actually different between system instances of the same system version.
When used, the perspective completely describes the running system instance as it is.
It is not a "diff" on the static perspective, for this we may consider introducing a specialized `system-instance-delta` perspective as optimization later.

Some examples when metadata can be dynamic:

- APIs or Events can be activated and deactivated per system instance / tenant.
- API or Event interfaces can be extended, e.g. through field extensibility.
- New resources can be created by the user of the application at run-time (typical situation for frameworks, platforms and extensible applications).
- Endpoint URLs may be dynamic.

At SAP, the run-time discovery of dynamic metadata (system-instance) is handled by the [Unified Customer Landscape](../../introduction.mdx#unified-customer-landscape) in BTP.

### System Independent Perspective

Some ORD information like Taxonomies, Products and Vendors is not dependent on systems and can use the `system-independent` perspective.
They can be considered global, static content that can be shared by multiple systems.
System-independent ORD documents MUST NOT contain system or tenant context or system-specific or tenant-specific customizations.

Such content is of a "singleton" quality for the whole ORD aggregator and SHOULD not be republished by the individual systems.
It can therefore be published once globally instead of being repeated in system-scoped perspectives.

> Note: Cross-system-type taxonomy, resources and contracts can be modeled either as system-scoped publications or as `system-independent` content.
> Cross-system-type resources and contracts still describe a system's capabilities and are published per system type/version/instance.
> System-independent content (Vendors, Products, global Entity Types, global Groups and Group Types) exists outside the system context entirely.
> See [Shared Taxonomy, Resources and Contracts](./shared-resources.md) for the distinction.

### How Perspectives Relate to Each Other

The dynamic perspective is a more precise description of the system instance than the static perspective, as it can contain its customizations.
If no dynamic perspective has been published for a system instance, the static perspective can be used as the fallback.

The following diagram shows how an aggregator resolves a request:

<div className="img-box" style={{aspectRatio: "1260/1360"}}>

![Perspective resolution](/img/perspective-resolution.svg "Perspective resolution")

</div>

The diagram focuses on the consumer-visible resolution path and omits retrieval, validation, and other processing failures.
Green results mean that the resource was found, yellow results mean that the selected view was resolved successfully but the resource was not found, and red results mean that resource availability cannot be determined because a required perspective is unavailable.
If a published `system-instance` perspective omits the requested ORD ID, the resource is not available on that system instance and MUST NOT be filled in from static metadata.

The `system-instance` perspective is the most specific because it describes how a particular system instance or tenant looks at run-time.
All documents published for the same perspective and scope are considered together.
For example, all `system-instance` documents for one tenant collectively form that tenant's complete dynamic view.
Publication, availability, and completeness MUST be determined independently for each tenant.
A `system-instance` perspective published or available for one tenant says nothing about another tenant.

In this context, a perspective is **published** for a scope when the applicable ORD configuration identifies one or more documents for that perspective and scope.
A published perspective is **available** when the aggregator has successfully processed a complete valid result from those documents, either from the latest retrieval or a retained valid copy.
An available perspective may be **empty**, meaning that its complete view contains no resources.
Perspective availability applies to the complete view and is distinct from whether a particular ORD ID is present in that view.

When a complete `system-instance` perspective is published for a tenant, it replaces the effective static view for that tenant.
A requested ORD ID omitted from that complete tenant view represents a resource that is not available on the tenant and MUST NOT be filled in from static metadata.
Only when no `system-instance` perspective is published for the tenant may the aggregator fall back to the effective static view.

The two static perspectives are alternative complete views.
The `system-type` perspective provides a version-independent view, while each `system-version` perspective describes one complete version-specific view.
When a `system-version` perspective is selected, the aggregator uses only that view.
A missing ORD ID is not found in that version, even if it is present in `system-type` or another system version.

When a specific version is requested, that `system-version` perspective MUST exist before the requested ORD ID is looked up.
If it does not exist, the aggregator reports the view as unavailable instead of substituting `system-type` or another version.
When resolving a tenant fallback for a known tenant system version, the exact `system-version` perspective MUST be available before the requested ORD ID is looked up.
If it does not exist or is unavailable, the aggregator reports the static view as unavailable instead of substituting `system-type` or another system version.
For a static request without a specific version, the aggregator selects the latest stable `system-version` when available; if no stable `system-version` exists, it uses `system-type` alone (see [Static Perspective Resolution](#static-perspective-resolution) below).

A consumer can legitimately be interested in all three system-scoped levels, but needs to provide a different context for each:

- If `system-instance` metadata is requested, the tenant / system instance ID needs to be specified.
- If `system-version` metadata is requested, the system type and system version must be specified.
- If `system-type` metadata is requested, only the system type must be specified. The aggregator resolves what to return (see [Static Perspective Resolution](#static-perspective-resolution)).

#### Effective System-Instance Resolution

An aggregator that serves tenant-aware requests MUST determine whether a complete `system-instance` perspective is published before it filters for an individual ORD ID.
It MUST NOT use the absence of a requested ORD ID from a complete tenant view as a reason to continue to a static perspective.
An empty but successfully retrieved complete tenant view is still a valid description of that scope.

The resolution works as follows:

1. If a complete `system-instance` perspective is published for the tenant and is available, use only that view.
   Return the requested resource when present and return not found when the ORD ID is absent.
2. If a complete `system-instance` perspective is published but unavailable because of validation, authorization, transport, or another retrieval failure, report the tenant view as unavailable.
   Do not fall back to static metadata.
3. Only when no `system-instance` perspective is published, resolve the applicable static view.
4. If the tenant's system version is known, select that exact `system-version` perspective.
   If it does not exist or is unavailable, report the static view as unavailable and MUST NOT substitute `system-type` or another system version.
   If it exists but omits the requested ORD ID, return not found.
5. If the tenant's system version is unknown, select the latest stable `system-version` perspective when available.
6. If a `system-version` perspective is selected, use only that complete view and return not found when the requested ORD ID is absent.
7. If the tenant's system version is unknown and no stable `system-version` perspective exists, use the complete `system-type` view when available.
   Return not found when the ORD ID is absent from that view.

After selecting the complete tenant view or the applicable static view, the aggregator may filter it for a requested ORD ID.
Filtering earlier is a valid optimization only when it produces the same result.

A published `system-instance` perspective does not become absent merely because its latest retrieval fails validation, authorization, or transport.
The aggregator SHOULD retain the last valid tenant view with suitable staleness information or report the tenant view as unavailable.
It MUST NOT silently fall back to static metadata after such a failure because the static view may expose resources that are not available on the tenant.

The `system-independent` perspective is outside this resolution chain.
Consumers can retrieve that global content separately, but its presence does not indicate that a resource is available on a particular system or tenant.

Until an ORD Discovery API exposes the resolved effective tenant view, a consumer that implements this algorithm itself MUST determine perspective availability independently of any ORD ID filter.
A filtered query with no matching resources cannot distinguish an unavailable perspective from a complete perspective in which the resource is intentionally absent.
If the Discovery API does not expose that distinction, the consumer cannot safely perform tenant fallback and SHOULD request an aggregator-level resolution capability instead.
The target Discovery API behavior is to return the complete effective tenant view so consumers do not need to understand provider-side publication choices, perspective selection, or future transport optimizations.

### Relation to System-Instance-Aware

The `perspective` attribute deprecates the `systemInstanceAware` attribute.

With `systemInstanceAware` it was already possible to define whether metadata was dynamic (different per system instance) or not.
But the concept did not allow the same resource to be described in different perspectives and did not define how those perspectives are selected or used as fallbacks.

To migrate: replace `systemInstanceAware: true` with `perspective: "system-instance"` and split your ORD document so that static and dynamic metadata are in separate documents with their respective perspective set. See the [`perspective` property on the ORD Configuration](../../spec-v1/interfaces/Configuration.md) interface for details.

## ORD Provider Considerations

An ORD provider that describes a system MUST publish static metadata using `system-type`, `system-version`, or both.
For static metadata, providers SHOULD prefer `system-type` unless consumers need version-accurate lookup or a history of versioned metadata.
The provider can choose perspectives as follows:

<div className="img-box" style={{aspectRatio: "1160/440"}}>

![Provider perspective selection](/img/provider-perspective-selection.svg "Provider perspective selection")

</div>

Using `system-type` gives consumers one current static view, simplifies lookup, and avoids persisting a complete metadata snapshot for every system version.
Use `system-version` when multiple versions of the same application are deployed at the same time in one environment tier and consumers must resolve the metadata of the particular deployed release.
Queryable metadata history is an additional reason to choose `system-version`, even when only one version is deployed at a time.
Choose the static perspective as follows:

1. If metadata differs per tenant, additionally publish a complete `system-instance` perspective for each tenant.
2. If multiple versions of the same application are deployed at the same time in one environment tier, publish a `system-version` perspective for each distinguishable release.
3. A provider MAY also choose `system-version` when consumers need to query historical metadata by system version.
4. Otherwise, publish the complete current static view through `system-type`.
5. A continuously delivered system MAY alternatively publish all static metadata through `system-version` with a fixed `describedSystemVersion.version`.
   When using the fixed-version approach, the version MUST remain unchanged so each release replaces the previously published view.
6. A provider MAY use both static perspectives.
   Each perspective MUST completely describe its scope; a `system-version` perspective cannot rely on resources from `system-type`.

Content that is independent of systems, rather than only independent of system versions, SHOULD use the `system-independent` perspective.
If the system has dynamic metadata, the provider MUST additionally publish a complete `system-instance` perspective.

If the `system-version` perspective is used, the described version MUST be provided via the ORD `describedSystemVersion`.`version` property.
For the `system-type` perspective, the version property is NOT required as this perspective is version-independent.
Ideally, ORD providers SHOULD define the `describedSystemVersion`.`version` property on both the `system-version` and `system-instance` perspectives.

When `system-version` is used as the static view, the `version` is effectively the join criterion that associates dynamic metadata with the matching version-specific static metadata.

> ⏩ See also: [Correct Use of Perspectives](../../spec-v1/index.md#correct-use-of-perspectives).

## ORD Aggregator Considerations

#### Static Aggregators

Static aggregators collect and serve the `system-type` and/or `system-version` perspectives for a given system type.

- If both static and dynamic perspectives are described, they MUST only pick the static perspectives (`system-type` or `system-version`).
- If no static perspective is available, the static aggregator has no applicable view.
  It MUST NOT reinterpret an explicit or defaulted `system-instance` perspective as static metadata.
- Static perspective resolution MUST follow the algorithm described [below](#static-perspective-resolution).

Retaining versioned metadata and making it queryable is a desirable aggregator quality when providers publish `system-version` perspectives.
An aggregator MAY optimize storage and lookup, provided that requested versions remain independently resolvable and the observable resolution behavior is unchanged.

#### Dynamic Aggregators

If the aggregator supports both static and dynamic perspectives:

- The ORD aggregator MUST be able to aggregate and resolve all published perspectives (`system-type`, `system-version`, and `system-instance`) at the same time.
- In its ORD Discovery API for consumers, it needs to implement the [effective system-instance resolution](#effective-system-instance-resolution) behavior.
  - When a complete `system-instance` perspective is published for a tenant, return only that view.
  - Only when no `system-instance` perspective is published, fall back to the effective static view.
  - Do not fall back merely because an ORD ID is absent from a complete tenant view.
  - Static perspective resolution (when `system-type` or `system-version` is requested) MUST follow the algorithm described [below](#static-perspective-resolution).

#### Static Perspective Resolution

When a consumer requests static metadata (i.e. `system-type` or `system-version` perspective) for a given system type, the aggregator MUST resolve what to return as follows (see also the [perspective resolution diagram](#how-perspectives-relate-to-each-other)):

1. If a **specific system version is requested**, select that exact `system-version` perspective.
   If it is unavailable, return no static view and MUST NOT substitute `system-type` or another system version.
2. If **no specific version is requested**, select the **latest stable `system-version`** perspective when available.
   The aggregator MUST exclude versions with a Semantic Versioning prerelease identifier and determine the greatest remaining version using [Semantic Versioning 2.0.0](https://semver.org/) precedence, not lexical ordering, publication time, or `lastUpdate`.
   A prerelease system version may be selected only when explicitly requested.
   A provider MUST NOT publish multiple available system-version perspectives whose versions have equal Semantic Versioning precedence and differ only in build metadata.
   If an aggregator encounters that ambiguity, it MUST report that no unambiguous latest static view is available instead of selecting one arbitrarily.
3. If a `system-version` perspective is selected, use only that complete view.
   Return the requested resource when present and return not found when the ORD ID is absent.
   Do not fall through to `system-type` or another system version.
4. If no specific version was requested and no stable `system-version` perspective exists, use the complete `system-type` view when available.
   Return the requested resource when present and return not found when the ORD ID is absent.
5. If neither an applicable `system-version` nor `system-type` perspective is available, return no static view.

This resolution ensures that resources introduced in newer versions are not incorrectly reported as available in older versions.

#### Tombstone Handling across Versions

An older version of an application / service can have a resource which has been decommissioned (via a `Tombstone`) in a newer version.
Static resolution MUST NOT select an older system version to resurrect a resource that is tombstoned in the selected view.

The `system-independent` perspective is outside static resolution.
Consumers can retrieve global content separately, but it does not serve as fallback evidence that a resource belongs to a system type or version.
