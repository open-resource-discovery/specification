---
title: SAP Base v1
description: "SAP Base v1 policy level"
sidebar_position: 1
---

# SAP Base Policy Level (v1.0)

## Description

This policy level (aka compliance level) `sap:base:v1` MUST be fulfilled by all SAP applications and services.
It includes the **essential** validations that ensure proper metadata discovery and aggregation.

Usually SAP applications and services will use the more complete and opinionated [`sap:core:v1`](./sap-core-v1.md) policy level.

## General Policies

### Namespaces

- All SAP [namespaces](../../spec-v1/index.md#namespaces) MUST be registered in the SAP namespace-registry.
  - All ORD resources owned by SAP MUST use the `sap` vendor namespace
  - ORD resources / extensions created by the customer MAY use the `customer` vendor namespace.

### Packages

- The vendor of a Package MUST be set and be equal to one of the allowed values: `sap:vendor:SAP:`, `customer:vendor:Customer:`.

### Misc Constraints

- Although `Vendor` is technically not validated by a policy level, we need to ensure that within SAP we don't define the SAP vendor multiple times or reference it differently.
  - The SAP `Vendor` MUST NOT be defined by any SAP application or service, as this is done centrally.
  - The correct value for a SAP vendor reference is `sap:vendor:SAP:`.
