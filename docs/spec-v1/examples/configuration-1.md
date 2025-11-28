---
title: configuration-1
description: Example documents for Configuration.
---

## Example File:  configuration-1

```json
{
  "$schema": "https://open-resource-discovery.github.io/specification/spec-v1/interfaces/Configuration.schema.json",
  "openResourceDiscoveryV1": {
    "documents": [
      {
        "url": "/open-resource-discovery/v1/documents/1-static",
        "perspective": "system-version",
        "accessStrategies": [
          {
            "type": "open"
          }
        ]
      },
      {
        "url": "/open-resource-discovery/v1/documents/1",
        "perspective": "system-instance",
        "accessStrategies": [
          {
            "type": "open"
          }
        ]
      },
      {
        "url": "/ord/documents/data-product.json",
        "perspective": "system-version",
        "accessStrategies": [
          {
            "type": "open"
          },
          {
            "type": "custom",
            "customType": "sap.foo:open-with-tenant-id:v1",
            "customDescription": "The metadata information is openly accessible but system instance aware.\nThe tenant is selected by providing a global or local tenant ID header."
          }
        ]
      }
    ],
    "capabilities": {
      "selector": true
    }
  }
}

```
