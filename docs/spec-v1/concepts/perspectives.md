---
sidebar_position: 5
description: Metadata can be described from static or dynamic perspectives. This article explains the concept in more detail.
---

# Perspectives

> ⏩ The technical requirements of this are described in the [specification section on perspectives](../../spec-v1/index.md#perspectives).

## Overview

An application or service can be described both from a static or a dynamic perspective. The configuration endpoint can point to different ORD documents that represent the information from the different perspectives.

### Static Perspective

The static `system-version` or `system-type` perspective describes how an application or services looks like _in general_ at design-time.
This perspective is especially useful for customers, who haven't purchased a product yet and need to understand what technical capabilities they would get.
It also helps to understand the common baseline of what all systems of the same type provide and how it changes over time.

In ORD, we describe this with `perspective`: `system-version`, to hint at the fact that the static metadata is usually version dependent.
Static metadata is known at design-time or deploy-time, when a new version of an application or service is developed or provisioned.
For cloud software with continuous delivery, the version may not be explicit or of interest to the consumer, a fallback to a "latest" version may be needed.
But consider that also cloud software that is going through phased deployments therefore can have multiple versions active at the same time.

In the case that the system is not versioned (continuous delivery) or resources do not relate to a system directly, the `system-type` perspective can be used.
The `system-type` information apply no matter which system version or instance is used.

The static perspective describes the shared metadata of all system instances (tenants) of the same system version or version independent.
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
- If the system is continuously delivered and does not have explicit versions at all, use the `system-type` perspective instead.
  - However, consider that you may still have different releases rolled out over time and on different stages. If this causes a problem, use `system-version` with below conventions.
  - Alternatively, use a fixed `1.0.0` version and overwrite it with every new release.

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

At SAP, the run-time discovery of dynamic metadata (system-installation) is handled by the [Unified Customer Landscape](../../introduction.mdx#unified-customer-landscape) in BTP.

### System Independent Perspective

Some ORD information like Taxonomies, Products and Vendors is not dependent on systems and can use the `system-independent` perspective.
They can be considered global, static content that can be shared by multiple systems.

Such content is of a "singleton" quality for the whole ORD aggregator and SHOULD not be republished by the individual systems.

### How Perspectives relate to each other

The dynamic perspective is a more precise description of the system instance than the static perspective, as it can contain its customizations.
If no dynamic perspective has been published for a system instance, the static perspective can be used as the fallback.

This is depicted in the following diagram:

![Perspectives to Relation](/img/ord-explicit-system-perspectives.drawio.svg "Perspectives Relation")

The `system-instance` perspective is the most specific, because a consumer could ask how a particular system instance / tenant really looks like. If there is system-instance metadata for it, we can return it directly.
If we don't have it, we need to fall back to the `system-version` layer and instead return the metadata for the version of the system instance.

If we don't know the version of a system, we can introduce a "virtual" `system-type` perspective that doesn't have to be explicitly published.
The aggregator can treat the latest `system-version` as the `system-type` perspective and return it to represent the system type overall.

A consumer can legitimately be interested in all three levels, but he needs to provide a different context for each:

- If `system-instance` metadata is requested, the tenant / system instance ID needs to be specified
- If `system-version` metadata is requested, the system type and system version must be specified.
- If `system-type` metadata is requested, only the system type must be specified and the latest system version is returned.

### Relation to System-Instance-Aware

The `perspectives` attribute deprecates the `systemInstanceAware` attribute.

With `systemInstanceAware` it was already possible to define whether metadata was dynamic (different per system instance) or not.
But the concept did not allow to describe the same resource in different perspectives and also did not define how the perspectives build upon each other.

## ORD Provider Considerations

The following diagram gives an overview which perspectives need to be described by an ORD Provider:

![Perspectives to Provide](/img/ord-explicit-system-persectices-flow.drawio.svg "Perspectives to Provide")

If the system has only static metadata, it should explicitly use the `system-version` perspective and state its version (`describedSystemVersion`).
If the system has dynamic metadata, it should describe both perspectives completely, if possible.

> ⏩ See also: [Correct Use of Perspectives](../../spec-v1/index.md#correct-use-of-perspectives).

## ORD Aggregator Considerations

#### Static Aggregators

Static aggregators describe the static perspectives: `system-type` and/or `system-version`.

- If both static and dynamic perspectives are described, it MUST only pick the static perspectives (`system-type` or `system-version`)
- If only `system-instance` (or unspecified) perspective is available, we assume this is a generic system instance which is meant to describe all system instances as a subsidiary
- When aggregating `system-type` perspective, the aggregator MAY derive it from the latest `system-version` if not explicitly provided

#### Dynamic Aggregators

If the aggregator supports both static and dynamic perspectives:

- The ORD aggregator must be able to aggregate and store all perspectives (`system-type`, `system-version`, and `system-instance`) at the same time.
- In its ORD Discovery API for consumers, it needs to implement the inheritance / fallback behavior:
  - When `system-instance` is requested but not available, fall back to `system-version`
  - When `system-version` is requested but not available (or version is unknown), fall back to `system-type`
  - The aggregator MAY derive `system-type` from the latest `system-version` if not explicitly provided

If the `system-version` perspective is used, the described version MUST be provided via the ORD `describedSystemVersion`.`version` property.
For the `system-type` perspective, the version property is NOT required as this perspective is version-independent.
Ideally, ORD providers SHOULD define the `describedSystemVersion`.`version` property on both the `system-version` and `system-instance` perspectives.

The `version` becomes effectively the "join" criteria for how the dynamic metadata is associated to the version-specific static metadata.

Some additional considerations that need to be looked into:

- An older version of an application / service can have a resource which has been decommissioned (via a `Tombstone`) in a newer version.
  - The inheritance / fallback logic MUST not fall back to the now removed resource.
