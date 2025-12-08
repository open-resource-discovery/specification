---
title: document-groups
description: Example documents for Document.
---

## Example File:  document-groups

```json
{
  "$schema": "https://open-resource-discovery.github.io/specification/spec-v1/interfaces/Document.schema.json",
  "openResourceDiscovery": "1.12",
  "description": "Example for group type and group assignments",
  "policyLevels": [],
  "groupTypes": [
    {
      "groupTypeId": "sap.xref:Process",
      "title": "SAP defined Process (Sample only!)",
      "description": "Processes that have been globally defined by SAP, e.g. Hire to Retire, Order to Cash, etc.",
      "restrictDirection": "group-to-resource",
      "restrictResourceType": ["entityType", "apiResource", "eventResource", "dataProduct"]
    }
  ],
  "groups": [
    {
      "groupId": "sap.xref:Process:sap:H2R",
      "groupTypeId": "sap.xref:Process",
      "title": "Hire to Retire",
      "members": ["sap.xref:entityType:Company:v1"]
    },
    {
      "groupId": "sap.xref:Process:sap:Retail",
      "groupTypeId": "sap.xref:Process",
      "title": "Retail",
      "members": [{ "ordId": "sap.xref:entityType:BusinessArea:v1"}, { "ordId": "sap.xref:entityType:Company:v1"}]
    }
  ]
}

```
