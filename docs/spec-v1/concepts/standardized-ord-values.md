---
sidebar_position: 9
title: Standardized ORD Values
description: Registry of standardized ORD values and reserved entries.
---

# Standardized ORD Values

The ORD specification reserves the `ord:` namespace for values it defines in extensible fields.
Vendors MUST NOT define custom values in this namespace.

This page registers standardized `ord:` values and other reserved ORD entries.
A value is not standardized merely because it uses the `ord:` namespace.

## Concept IDs

| Property | Value | Meaning |
| --- | --- | --- |
| Resource definition `purpose` | `ord:ai-enrichment` | An AI-enriched representation of the same underlying resource. |
| Resource definition `purpose` | `ord:agent-security-permissions` | A representation containing agent security permission information for the same underlying resource. |
| `relationType` | `ord:orchestrates` | A workflow Capability orchestrates the target API Resource as part of a multi-step workflow. |
| `relationType` | `ord:patches` | The source ORD Overlay patches the related resource. |

No label key in the `ord:` namespace is currently standardized.
Future standardized label keys MUST be registered on this page before providers use them.

## Specification IDs

| Property | Value | Meaning |
| --- | --- | --- |
| Resource definition `type` | `ord:overlay:v1` | An ORD Overlay document. |

## Group Types

### Publication Scope

`ord:publication-scope` is the standardized Group Type for partitioning resources into independently replaceable publication sets.
It is optional.
Assigning a resource to a publication scope describes the provider's intended publication boundary, but does not itself request replacement or authorize publication or removal.

The ORD specification defines this Group Type, so providers MUST NOT publish a custom `groupTypes` definition for `ord:publication-scope`.
An ORD provider MAY define any number of Group objects of this type.
The provider chooses stable and unique Group IDs under a namespace it controls.

A Group ID has this form:

```text
ord:publication-scope:<provider-namespace>:<local-scope-id>
```

For example:

```json
{
  "groupId": "ord:publication-scope:example.provider:main",
  "groupTypeId": "ord:publication-scope",
  "title": "Main publication scope"
}
```

Every resource in a publication scope MUST reference its Group ID directly through `partOfGroups`.
Group matching is exact and non-transitive.
A resource MUST NOT reference more than one Group of this type, but MAY reference Groups of other types.

Within a given perspective and, where applicable, described system context, each publication scope used for reconciliation MUST have exactly one authoritative ORD provider.
The aggregator determines which provider is authorized to publish that scope through its own authorization and onboarding configuration.
An aggregator MUST NOT treat Group IDs or resource assignments as publication privileges or an authorization boundary.

When a transport and aggregator support complete set reconciliation and the provider or scope is configured for it, the aggregator compares a successfully retrieved complete resource set with the previously retained set for that scope.
It MUST remove previously retained resources assigned to the scope when they are absent from the complete set.
The provider MUST continue to publish the Group object when its resource set is empty so the aggregator can identify that complete empty set.

Behavior for each transport is defined by its transport rules.
The publication scope Group Type defines the set boundary independently of how a transport retrieves or submits ORD information.

#### Pull Replace Mode (WIP)

Pull replace mode is work in progress and remains to be defined with ORD Aggregator support.
The ORD specification does not currently define a provider-side way to indicate that a particular pull retrieval should replace the previously retained set.
Publishing a publication scope Group in pull content does not by itself opt that scope into replacement.

A future design could express pull replace mode in ORD Config or as an ORD Aggregator onboarding option.
Neither mechanism is specified by the ORD specification today.
Whether an aggregator supports pull replacement is its capability decision.
An onboarding option is a candidate because it can record an agreement between the provider and aggregator without adding transport behavior to provider self-description.

## Reserved Vendor and Product Entries

| Kind | ORD ID | Meaning |
| --- | --- | --- |
| Vendor | `customer:vendor:Customer:` | Ownership is attributed to the customer or user of the described system. |

No Product ORD ID is currently reserved by the ORD specification.
Future reserved Vendor or Product entries MUST be registered on this page.
