---
title: Embedded Access Strategy
description: Resource definition is embedded inline in the ORD document (push transport).
sidebar_position: 1
---

# Embedded Access Strategy

> **Status**: Draft Proposal (WIP)
>
> This access strategy is part of the [Push Transport](../../spec-v1/index.md#push-transport) proposal.

## Description

The `embedded` access strategy indicates that the resource definition content is provided inline within the ORD document itself, rather than being fetched from an external URL.

This is specifically designed for [push transport](../../spec-v1/index.md#push-transport) scenarios where:

- The ORD provider pushes the complete ORD document including all resource definitions to an aggregator
- The aggregator does not need to make additional requests to fetch resource definitions
- All metadata is self-contained in a single push request

The `accessStrategy`.`type` value for it is: `embedded`.

## How It Works

When a `resourceDefinition` uses the `embedded` access strategy:

1. The `url` field still contains the logical path/identifier for the resource definition
2. The actual content is provided in the document-level `definitions` property
3. The `url` value is used as the key to look up the content in `definitions`

### Example

```json
{
  "openResourceDiscovery": "1.15",
  "apiResources": [
    {
      "ordId": "sap.foo:apiResource:myApi:v1",
      "resourceDefinitions": [
        {
          "type": "openapi-v3",
          "mediaType": "application/json",
          "url": "/api/my-api/openapi.json",
          "accessStrategies": [
            {
              "type": "embedded"
            }
          ]
        }
      ]
    }
  ],
  "definitions": {
    "/api/my-api/openapi.json": "{\"openapi\":\"3.0.0\",\"info\":{\"title\":\"My API\",\"version\":\"1.0.0\"},\"paths\":{}}"
  }
}
```

## Provider Implementation

The ORD provider MUST:

- Set `accessStrategies[].type` to `embedded` for any resource definition whose content is included inline
- Include the resource definition content in the top-level `definitions` property
- Use the same URL path as the key in `definitions` that is referenced in `resourceDefinitions[].url`
- Encode the content as a string (preserving original formatting)

## Aggregator / Consumer Implementation

The ORD aggregator or consumer MUST:

- Recognize `embedded` as an access strategy type
- Look up the content in the `definitions` property using the `url` as the key
- NOT attempt to fetch the URL externally when `embedded` is specified
- Parse the string content according to the `mediaType` specified

## When to Use

Use the `embedded` access strategy when:

- Pushing ORD documents to an aggregator (push transport)
- Integrating ORD publishing into CI/CD pipelines
- The provider cannot or does not want to host resource definitions at accessible URLs
- You want to ensure atomic updates of metadata and definitions together

## Comparison with `open`

| Aspect | `open` | `embedded` |
|--------|--------|------------|
| Content location | External URL | Inline in document |
| Fetch required | Yes | No |
| Transport mode | Pull | Push |
| Self-contained | No | Yes |
