---
sidebar_position: 9
title: Standardized ORD Values
description: Registry of values and entries reserved by the ORD specification.
---

# Standardized ORD Values

ORD provides extensible identifiers and taxonomy concepts so that vendors can define their own values.
The `ord` namespace is reserved for values standardized by the ORD specification itself.
Vendors MUST NOT define custom values in this namespace.

This page is the registry for standardized `ord:` values and reserved ORD entries.
Values not listed here are not defined by the ORD specification, even if they use the `ord` namespace.

## Concept IDs

| Property | Value | Meaning |
| --- | --- | --- |
| Resource definition `purpose` | `ord:ai-enrichment` | An AI-enriched representation of the same underlying resource. |
| Resource definition `purpose` | `ord:agent-security-permissions` | A representation containing agent security permission information for the same underlying resource. |
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
It is optional and has no effect unless a provider and aggregator use complete-state replacement.
It does not grant publication privileges and MUST NOT be interpreted as an authorization boundary.

The ORD specification defines the Group Type, so providers MUST NOT redefine it as a `GroupType` object.
An ORD provider MAY define any number of Group objects of this type.
The provider chooses the final Concept ID in each Group ID under a namespace it controls and is responsible for keeping it stable and unique.

The Group ID has this form:

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

Resources in the replaceable set MUST reference the Group ID directly through `partOfGroups`.
Matching is exact and non-transitive.
A resource MUST NOT reference more than one Group of this type.
This makes publication scopes a partition and prevents overlapping replacement boundaries.
Within one publication context, each publication scope MUST have exactly one authoritative ORD provider.
An aggregator MUST reject publication of or replacement against the same scope by another provider unless the scope was explicitly reassigned outside the transport protocol.

An aggregator MAY support complete-state reconciliation for pull transport.
When it does, publishing a Group of this type opts that Group into complete-state reconciliation.
After successfully retrieving the complete set of ORD Documents for a publication context, the aggregator MUST remove previously retained resources assigned to that Group when they are absent from the retrieved set.
The provider MUST continue to publish the Group object when its resource set becomes empty so that the aggregator can identify the empty replacement boundary.

For push transport, the provider selects one or more publication scope Group IDs explicitly in the `scope` property of a `replace` submission.
The provider MUST stage the corresponding Group objects in that submission.
Merely staging or assigning a publication scope Group MUST NOT make a `merge` submission destructive.
See [Push Transport Guidance](./push-transport.md) for the complete replacement rules.

## Reserved Vendor and Product Entries

| Kind | ORD ID | Meaning |
| --- | --- | --- |
| Vendor | `customer:vendor:Customer:` | Ownership is attributed to the customer or user of the described system. |

No Product ORD ID is currently reserved by the ORD specification.
Future reserved Vendor or Product entries MUST be registered on this page.
