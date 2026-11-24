---
title: "SAP Documentation Policy Level (v1.0)"
description: "SAP Documentation v1 policy level"
sidebar_position: 3
---

{/* AUTO-GENERATED from spec-extension/policy-levels/sap-documentation-v1.overlay.yaml — do not edit */}

# SAP Documentation Policy Level (v1.0) <span className="feature-status-draft" title="This feature is in DRAFT status and subject to potential changes.">DRAFT</span>

## Description

This policy level `sap:documentation:v1` is based on the [`sap:base:v1`](./sap-base-v1.md) policy level and inherits all its expectations.

This policy level is based on various SAP guidelines and rules — most of which are already established. It defines the core rules and guidelines for human-readable descriptions within metadata formats, although more specific rules and guidelines MAY be applied on top in a specific product line.

## Title Constraints

### Title length limit

All `title` values (except link titles) MUST NOT exceed 120 characters.

### Forbidden status terms in titles

All `title` values (except link titles) MUST NOT contain the term "Deprecated" or "Decommissioned". Use `releaseStatus` to indicate this instead, if available.

### Title charset

All `title` values (except link titles) SHOULD use the following charset.

| Chars | Description |
| --- | --- |
| `A-Z`, `a-z` | Latin letters |
| `0-9` | Numbers |
| ` ` | Space |
| `-` `—` `–` | Different hyphens |
| `,` | Comma |
| `(` `)` | Parentheses |

### Title charset

**package** `title` values (except link titles) SHOULD use the following charset, which adds the forward slash (`/`) to the general title charset.

| Chars | Description |
| --- | --- |
| `A-Z`, `a-z` | Latin letters |
| `0-9` | Numbers |
| ` ` | Space |
| `-` `—` `–` | Different hyphens |
| `,` | Comma |
| `(` `)` | Parentheses |
| `/` | Forward slash |

### Discouraged terms in titles

All `title` values (except link titles) SHOULD NOT contain the following terms.

| Term | Description |
| --- | --- |
| `create`<br/>`read`<br/>`delete`<br/>`update` | Operation words |
| `v1`, `v2`, etc. | Versions |

### Specially approved terms in titles

All `title` values (except link titles) MAY use the following specially approved terms.

| Approved Term | Description |
| --- | --- |
| `S/4HANA` | Approved product name |
| `country/region`<br/>`Country/Region` | Approved name |
| `G/L` | General ledger. Approved abbreviation. |

## Description Constraints

### Description must not repeat the short description

All `description` values MUST NOT contain the short description.
They are complementary to the short description and should not just be a longer replacement.

### Description length limit

The `description` MUST NOT exceed 4000 characters.
In general, more extensive documentation SHOULD NOT be put into the `description` but instead be added as (typed) links.

## Short Description Constraints

### Short description length limit

All `shortDescription` values SHOULD NOT exceed 180 characters.

### Short description must not repeat the object name

All `shortDescription` values MUST NOT repeat or start with the object name.

### Short description charset

All `shortDescription` values SHOULD use the following charset.

| Chars | Description |
| --- | --- |
| `A-Z`, `a-z` | Latin letters |
| `0-9` | Numbers |
| ` ` | Space |
| `_` | Underscores |
| `-` `—` `–` | Different hyphens |
| `.` | Fullstop (Period) |
| `,` | Comma |
| `(` `)` | Parentheses |
| `'s` | Possessive apostrophe for nouns |
| `s'` | Possessive apostrophe is added to plural proper nouns that ends in `s` |

### Specially approved terms in short descriptions

All `shortDescription` values MAY use the following specially approved terms.

| Approved Name | Description |
| --- | --- |
| `S/4HANA` | Approved product name |
| `country/region`<br/>`Country/Region` | Approved name |
| `G/L` | General ledger. Approved abbreviation. |

## Misc Constraints

### API Compatibility rules

For setting and incrementing API versions and major versions, the SAP API Compatibility rules MUST be followed.

### Deprecation date for deprecated resources

If an API or event resource has been deprecated, the `deprecationDate` MUST be provided.

_Applies when: the API or Event Resource has been deprecated_

### Changelog entry for release status changes

For all `releaseStatus` changes, a changelog entry SHOULD be created.

### Recommended taxonomy values

For the taxonomy properties `lineOfBusiness` and `industry`: Only the recommended values MUST be chosen.

### Keep existing `x-sap-` OpenAPI extensions

For OpenAPI documents which are already published on Business Accelerator Hub, the existing `x-sap-` extension properties MUST be kept even if the information is now also in the ORD Document. This is to not break end-consumers that only have access to the OpenAPI file. We MAY remove this requirement in the future, by automatically post-processing the ORD information into the OpenAPI files centrally (feature request).
