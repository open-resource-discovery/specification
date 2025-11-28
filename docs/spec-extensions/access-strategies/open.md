---
title: Open Access Strategy
description: Access without mandatory authentication and authorization.
sidebar_position: 0
---

# Open Access Strategy

## Description

The `open` access strategy indicates that there is no mandatory authentication and authorization to access the information. A regular HTTP GET call will be sufficient as the information are _unprotected_.

Whether this is a valid choice depends on the security considerations that the ORD providers are subject to.

The `accessStrategy`.`type` value for it is: `open`.

## Optional Tenant HTTP Headers

It may be necessary to indicate which tenant the information are requested for.
This becomes necessary when the ORD Provider is multi-tenant and the metadata it provides is different across those tenants (system instance aware).

The HTTP headers are optional and will only be sent by the ORD Aggregator if they are applicable and known by it.

If the ORD Provider has metadata that is different per tenant and it understands the provided tenant IDs, it MUST return the ORD related information and metadata for the chosen tenant.

> ℹ Please note that according to [RFC 7230 Section 3.2](https://www.rfc-editor.org/rfc/rfc7230#section-3.2) HTTP headers are case insensitive.

### Local-Tenant-Id

The local tenant ID is the ID that the system instance itself created and uses to identify its tenants.
It is passed along as a `Local-Tenant-Id` header.

```http
GET /.well-known/open-resource-discovery/document/1
Content-Type: application/json
Local-Tenant-Id: 000023
```

### Global-Tenant-Id

The global tenant ID is a globally unique ID for a system instance (tenant). The scope of uniqueness is within the connected aggregator.
It is passed along as a `Global-Tenant-Id` header.

```http
GET /.well-known/open-resource-discovery/document/1
Content-Type: application/json
Global-Tenant-Id: c6c80b52-ecc1-47f8-9303-0d55fb67fd41
```

### General Remarks

> ℹ If the metadata is not different across tenants (system instance unaware), the response is static and the same across tenants.
> In this case, this should be indicated via `systemInstanceAware`: `false` to avoid unnecessary requests for each tenant.
