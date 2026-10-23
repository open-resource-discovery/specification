---
sidebar_position: 9
title: Standardized ORD Identifiers
description: Registry of identifiers and keys standardized or reserved by the ORD specification.
---

# Standardized ORD Identifiers

The ORD specification reserves the `ord:` namespace for identifiers it defines in extensible fields.
Vendors MUST NOT define custom values in this namespace.

This page registers standardized `ord:` identifiers and other reserved ORD entries.
An identifier is not standardized merely because it uses the `ord:` namespace.

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

No Group Type in the `ord:` namespace is currently standardized.
Future standardized Group Types MUST be registered on this page before providers use them.

## Reserved Vendor and Product Entries

| Kind | ORD ID | Meaning |
| --- | --- | --- |
| Vendor | `customer:vendor:Customer:` | Ownership is attributed to the customer or user of the described system. |

No Product ORD ID is currently reserved by the ORD specification.
Future reserved Vendor or Product entries MUST be registered on this page.
