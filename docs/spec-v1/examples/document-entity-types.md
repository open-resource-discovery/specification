---
title: document-entity-types
description: Example documents for Document.
---

## Example File:  document-entity-types

```json
{
  "$schema": "https://open-resource-discovery.github.io/specification/spec-v1/interfaces/Document.schema.json",
  "openResourceDiscovery": "1.11",
  "description": "Example for entity types as they will be exposed by ODM",
  "policyLevels": ["sap:core:v1"],
  "packages": [
    {
      "ordId": "sap.xref:package:OdmEntities:v1",
      "title": "ODM Entities",
      "shortDescription": "This package includes all aligned ODM Entities",
      "description": "The ODM Entities are governed by the ODM Governance Board. They are semantically cross-LoB aligned and provide an unambiguous taxonomy",
      "version": "1.0.0",
      "policyLevels": ["sap:core:v1"],
      "vendor": "sap:vendor:SAP:"
    }
  ],
  "entityTypes": [
    {
      "ordId": "sap.xref:entityType:BusinessPartner:v1",
      "localId": "BusinessPartner",
      "level": "aggregate",
      "title": "Business Partner",
      "shortDescription": "Person, an organization, or a group of persons or organizations.",
      "description": "A business partner is a person, an organization, or a group of persons or organizations in which a company has a business interest.",
      "version": "1.0.0",
      "lastUpdate": "2023-03-18T15:30:04+00:00",
      "partOfPackage": "sap.xref:package:OdmEntities:v1",
      "visibility": "public",
      "links": [],
      "releaseStatus": "active",
      "relatedEntityTypes": [
        {
          "ordId": "sap.vdm.sot:entityType:BusinessPartner:v1"
        }
      ],
      "partOfGroups": []
    },
    {
      "ordId": "sap.xref:entityType:BusinessArea:v1",
      "localId": "BusinessArea",
      "level": "aggregate",
      "title": "Business Area",
      "shortDescription": "A business area is an organizational unit used in external accounting that represents a specific business segment or area of responsibility in a company.",
      "description": "<p>A business area is an organizational unit used in external accounting that represents a specific business segment or area of responsibility in a company.<br>Transactions in financial accounting are assigned to business areas.</p>",
      "version": "1.0.1",
      "partOfPackage": "sap.xref:package:BusinessObjectsInternal:v1",
      "visibility": "internal",
      "releaseStatus": "active",
      "lastUpdate": "2024-12-13T14:57:56.614Z",
      "partOfGroups": ["sap.xref:Process:sap:H2R"]
    },
    {
      "ordId": "sap.xref:entityType:Company:v1",
      "localId": "Company",
      "level": "aggregate",
      "title": "Company",
      "shortDescription": "A company is a financially and legally independent, geographically unbound organizational center registered under business law.",
      "description": "<p>A company is a financially and legally independent, geographically unbound organizational center registered under business law.</p>",
      "version": "1.0.1",
      "partOfPackage": "sap.xref:package:BusinessObjectsInternal:v1",
      "visibility": "internal",
      "releaseStatus": "active",
      "lastUpdate": "2024-12-13T14:57:56.614Z",
      "partOfGroups": ["sap.xref:Process:sap:H2R", "sap.xref:Process:sap:Retail"]
    }
  ]
}

```
