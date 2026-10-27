---
title: SAP Documentation v1
description: "SAP Documentation v1 policy level"
sidebar_position: 2
---

# SAP Documentation Policy Level (v1.0)

### Description

This policy level `sap:documentation:v1` is based on the [`sap:base:v1`](./sap-base-v1.md) policy level and inherits all its expectations.

This policy level is based on various SAP guidelines and rules — most of which are already established. It defines the core rules and guidelines for human-readable descriptions within metadata formats, although more specific rules and guidelines MAY be applied on top in a specific product line.


## Title Constraints

The following constraints apply in addition to the constraints defined in the [ORD Document](../../spec-v1/interfaces/Document.md).

- All `title` values (except link titles) MUST NOT exceed 120 characters
- All `title` values (except link titles) MUST NOT contain the term "Deprecated" or "Decommissioned". Use `releaseStatus` to indicate this instead, if available.
- All `title` values (except link titles) SHOULD use the following charset:

  | Chars        | Description       |
  | ------------ | ----------------- |
  | `A-Z`, `a-z` | Latin letters     |
  | `0-9`        | Numbers           |
  | ` `          | Space             |
  | `-` `—` `–`  | Different hyphens |
  | `,`          | Comma             |
  | `(` `)`      | Parentheses       |

- **package** `title` values MAY use the following additional characters:

  | Char | Description   |
  | ---- | ------------- |
  | `/`  | Forward slash |

- All `title` values (except link titles) SHOULD NOT contain the following terms:

  | Term                                          | Description     |
  | --------------------------------------------- | --------------- |
  | `create`<br/>`read`<br/>`delete`<br/>`update` | Operation words |
  | `v1`, `v2`, etc.                              | Versions        |

- All `title` values (except link titles) MAY use the following specially approved terms:

  | Approved Term                         | Description                            |
  | ------------------------------------- | -------------------------------------- |
  | `S/4HANA`                             | Approved product name                  |
  | `country/region`<br/>`Country/Region` | Approved name                          |
  | `G/L`                                 | General ledger. Approved abbreviation. |

## Description Constraints

The following constraints apply in addition to the constraints defined in the [ORD Document](../../spec-v1/interfaces/Document.md).

- All `description` values MUST NOT contain the short description.
  They are complementary to the short description and should not just be a longer replacement.
- The `description` MUST NOT exceed 4000 characters.
  In general, more extensive documentation SHOULD NOT be put into the `description` but instead be added as (typed) links.

## Short Description Constraints

The following constraints apply in addition to the constraints defined in the [ORD Document](../../spec-v1/interfaces/Document.md).

- All `shortDescription` values SHOULD NOT exceed 180 characters.
- All `shortDescription` values MUST NOT repeat or start with the object name.
- All `shortDescription` values SHOULD use the following charset:

  | Chars        | Description                                                            |
  | ------------ | ---------------------------------------------------------------------- |
  | `A-Z`, `a-z` | Latin letters                                                          |
  | `0-9`        | Numbers                                                                |
  | ` `          | Space                                                                  |
  | `_`          | Underscores                                                            |
  | `-` `—` `–`  | Different hyphens                                                      |
  | `.`          | Fullstop (Period)                                                      |
  | `,`          | Comma                                                                  |
  | `(` `)`      | Parentheses                                                            |
  | `'s`         | Possessive apostrophe for nouns                                        |
  | `s'`         | Possessive apostrophe is added to plural proper nouns that ends in `s` |

- All `shortDescription` values MAY use the following specially approved terms:

  | Approved Name                         | Description                            |
  | ------------------------------------- | -------------------------------------- |
  | `S/4HANA`                             | Approved product name                  |
  | `country/region`<br/>`Country/Region` | Approved name                          |
  | `G/L`                                 | General ledger. Approved abbreviation. |

## Misc Constraints

- For setting and incrementing API versions and major versions, the SAP API Compatibility rules MUST be followed.
- If an API or event resource has been deprecated, the `deprecationDate` MUST be provided.
- For all `releaseStatus` changes, a changelog entry SHOULD be created.
- For the taxonomy properties `lineOfBusiness` and `industry`: Only the recommended values MUST be chosen.
- Although `Vendor` is technically not validated by a policy level, we need to ensure that within SAP we don't define the SAP vendor multiple times or reference it differently.
  - The SAP `Vendor` MUST NOT be defined by any SAP application or service, as this is done centrally.
  - The correct value for a SAP vendor reference is `sap:vendor:SAP:`.
- For OpenAPI documents which are already published on Business Accelerator Hub, the existing `x-sap-` extension properties MUST be kept even if the information is now also in the ORD Document. This is to not break end-consumers that only have access to the OpenAPI file. We MAY remove this requirement in the future, by automatically post-processing the ORD information into the OpenAPI files centrally (feature request).
