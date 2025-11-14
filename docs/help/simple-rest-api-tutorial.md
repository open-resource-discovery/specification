---
title: "Tutorial: Exposing REST APIs with OpenAPI via ORD"
sidebar_position: 2
description: A step-by-step guide to making your backend REST APIs discoverable through the ORD protocol using OpenAPI specifications.
---

# Tutorial: Exposing REST APIs with OpenAPI via ORD

This tutorial walks you through the simplest and most common use case for ORD: making your backend application's REST APIs discoverable by publishing an ORD Document that references your existing OpenAPI specifications.

## What You'll Learn

By the end of this tutorial, you'll be able to:

- Create an ORD Document that describes your REST APIs
- Link your existing OpenAPI specifications to ORD
- Expose the ORD Document via a standard endpoint
- Make your APIs discoverable to ORD consumers

## Prerequisites

Before starting, you should have:

- A backend application with one or more REST APIs
- An OpenAPI specification (v2.0, v3.0, or v3.1) for your APIs
- The ability to add a static JSON file and endpoint to your application

## Overview

ORD (Open Resource Discovery) enables automated discovery and consumption of your APIs. The basic flow is:

1. **Create an ORD Document** - A JSON file describing your APIs
2. **Reference your OpenAPI specs** - Link to your existing API definitions
3. **Expose the ORD endpoint** - Make the document available at `/.well-known/open-resource-discovery`
4. **Consumers discover your APIs** - Tools and platforms can now find and use your APIs automatically

## Step 1: Create Your ORD Document

An [ORD Document](../../spec-v1/interfaces/Document.md) is a JSON file that contains metadata about your APIs and other resources. Start with this basic structure:

```json
{
  "$schema": "https://sap.github.io/open-resource-discovery/spec-v1/interfaces/Document.schema.json",
  "openResourceDiscovery": "1.9",
  "description": "ORD document for My Application APIs",
  "products": [
    {
      "ordId": "sap.com:product:MyProduct:",
      "title": "My Product"
    }
  ],
  "packages": [
    {
      "ordId": "sap.com:package:MyPackage:v1",
      "title": "My API Package",
      "shortDescription": "Core APIs for My Application",
      "version": "1.0.0",
      "vendor": "sap.com:vendor:SAP:"
    }
  ],
  "apiResources": [],
  "consumptionBundles": []
}
```

:::tip
Replace `sap.com` with your organization's namespace. Learn more about [ORD ID namespaces](../../spec-v1/index.md#ord-id).
:::

## Step 2: Define Your API Resource

Add your REST API to the `apiResources` array. Here's an example for a simple REST API:

```json
{
  "ordId": "sap.com:apiResource:MyAPI:v1",
  "title": "My REST API",
  "shortDescription": "API for managing customer data",
  "description": "This API provides endpoints for creating, reading, updating, and deleting customer records.",
  "version": "1.2.0",
  "releaseStatus": "active",
  "visibility": "public",
  "partOfPackage": "sap.com:package:MyPackage:v1",
  "apiProtocol": "rest",
  "resourceDefinitions": [
    {
      "type": "openapi-v3",
      "mediaType": "application/json",
      "url": "/api/openapi.json",
      "accessStrategies": [
        {
          "type": "open"
        }
      ]
    }
  ],
  "entryPoints": [
    "/api/v1/customers"
  ]
}
```

### Key Properties Explained

- **`ordId`**: Globally unique identifier following the [ORD ID format](../../spec-v1/index.md#ord-id)
- **`title`** and **`shortDescription`**: Human-readable names for your API
- **`version`**: Your API version using [semantic versioning](../../spec-v1/index.md#version-and-versioning)
- **`releaseStatus`**: Lifecycle stage (`beta`, `active`, `deprecated`, or `sunset`)
- **`visibility`**: Who can use this API (`public`, `internal`, or `private`)
- **`partOfPackage`**: Links to a package for grouping related resources
- **`apiProtocol`**: The protocol type - use `rest` for REST APIs
- **`resourceDefinitions`**: Links to your OpenAPI specification (see Step 3)
- **`entryPoints`**: Base URLs where the API is accessible

Learn more about [API Resources](../../spec-v1/interfaces/Document.md#api-resource) in the specification.

## Step 3: Link Your OpenAPI Specification

The `resourceDefinitions` array tells consumers where to find your API's technical specification. For OpenAPI:

```json
"resourceDefinitions": [
  {
    "type": "openapi-v3",
    "mediaType": "application/json",
    "url": "/api/openapi.json",
    "accessStrategies": [
      {
        "type": "open"
      }
    ]
  }
]
```

### Choosing the Right Type

- **`openapi-v3`**: For OpenAPI 3.0.x specifications
- **`openapi-v3.1+`**: For OpenAPI 3.1 or newer
- **`openapi-v2`**: For Swagger 2.0 / OpenAPI 2.0

### Access Strategies

The `accessStrategies` field defines how to access the resource definition:

- **`open`**: No authentication required (publicly accessible)
- **`sap:cds-api-key:v1`**: Requires API key authentication
- **Custom strategies**: See [Access Strategies](../../spec-extensions/access-strategies/)

Learn more about [Resource Definitions](../../spec-v1/interfaces/Document.md#resource-definition).

## Step 4: Add a Consumption Bundle (Optional but Recommended)

[Consumption Bundles](../../spec-v1/interfaces/Document.md#consumption-bundle) group APIs that should be consumed together and define how to access them:

```json
{
  "ordId": "sap.com:consumptionBundle:MyBundle:v1",
  "title": "My API Bundle",
  "shortDescription": "Standard access to My APIs",
  "version": "1.0.0",
  "credentialsExchangeStrategies": [
    {
      "type": "custom",
      "customType": "sap.com:credential-exchange:v1",
      "customDescription": "OAuth 2.0 Client Credentials Flow"
    }
  ]
}
```

Then reference it in your API resource:

```json
{
  "ordId": "sap.com:apiResource:MyAPI:v1",
  // ... other properties ...
  "partOfConsumptionBundles": [
    {
      "ordId": "sap.com:consumptionBundle:MyBundle:v1"
    }
  ]
}
```

## Step 5: Expose the ORD Document

Make your ORD Document available at the well-known endpoint. You have two options:

### Option A: Configuration Document (Recommended)

Create a configuration file at `/.well-known/open-resource-discovery`:

```json
{
  "$schema": "https://sap.github.io/open-resource-discovery/spec-v1/interfaces/Configuration.schema.json",
  "openResourceDiscoveryV1": {
    "documents": [
      {
        "url": "/ord/document.json",
        "accessStrategies": [
          {
            "type": "open"
          }
        ]
      }
    ]
  }
}
```

Then serve your ORD Document at `/ord/document.json`.

### Option B: Direct Document

Serve the ORD Document directly at `/.well-known/open-resource-discovery` (must have `Content-Type: application/json`).

Learn more about [ORD Configuration](../../spec-v1/index.md#ord-configuration).

## Complete Example

Here's a complete ORD Document for a simple REST API:

```json
{
  "$schema": "https://sap.github.io/open-resource-discovery/spec-v1/interfaces/Document.schema.json",
  "openResourceDiscovery": "1.9",
  "description": "ORD document for Customer Management API",
  "products": [
    {
      "ordId": "example.com:product:CustomerManagement:",
      "title": "Customer Management System"
    }
  ],
  "packages": [
    {
      "ordId": "example.com:package:CustomerAPI:v1",
      "title": "Customer API Package",
      "shortDescription": "APIs for customer data management",
      "description": "Comprehensive set of APIs for managing customer information, including CRUD operations and search capabilities.",
      "version": "1.0.0",
      "vendor": "example.com:vendor:ExampleCorp:",
      "partOfProducts": ["example.com:product:CustomerManagement:"]
    }
  ],
  "consumptionBundles": [
    {
      "ordId": "example.com:consumptionBundle:CustomerAPIAccess:v1",
      "title": "Customer API Access",
      "shortDescription": "Standard access to Customer APIs",
      "version": "1.0.0"
    }
  ],
  "apiResources": [
    {
      "ordId": "example.com:apiResource:CustomerAPI:v1",
      "title": "Customer Management API",
      "shortDescription": "REST API for customer data operations",
      "description": "This API provides comprehensive customer management capabilities including creating new customer records, retrieving customer information, updating customer details, and deleting customers. It supports pagination, filtering, and sorting.",
      "version": "1.2.3",
      "releaseStatus": "active",
      "visibility": "public",
      "partOfPackage": "example.com:package:CustomerAPI:v1",
      "partOfConsumptionBundles": [
        {
          "ordId": "example.com:consumptionBundle:CustomerAPIAccess:v1"
        }
      ],
      "apiProtocol": "rest",
      "resourceDefinitions": [
        {
          "type": "openapi-v3",
          "mediaType": "application/json",
          "url": "/api/v1/openapi.json",
          "accessStrategies": [
            {
              "type": "open"
            }
          ]
        }
      ],
      "entryPoints": [
        "/api/v1/customers"
      ],
      "extensible": {
        "supported": "no"
      }
    }
  ]
}
```

## Testing Your ORD Document

1. **Validate the JSON**: Ensure your document is valid JSON
2. **Schema validation**: Validate against the [Document schema](https://sap.github.io/open-resource-discovery/spec-v1/interfaces/Document.schema.json)
3. **Test the endpoint**: Verify `/.well-known/open-resource-discovery` is accessible
4. **Check your OpenAPI link**: Ensure the URL in `resourceDefinitions` returns your OpenAPI spec

:::tip
Use tools like `curl` to test your endpoints:
```bash
curl https://your-app.com/.well-known/open-resource-discovery
curl https://your-app.com/api/v1/openapi.json
```
:::

## Next Steps

Now that you have a basic ORD Document:

- **Add more APIs**: Include all your REST APIs in the `apiResources` array
- **Describe Events**: Add [Event Resources](../../spec-v1/interfaces/Document.md#event-resource) if you have asynchronous events
- **Define Entity Types**: Document your [data models](../../spec-v1/interfaces/Document.md#entity-type)
- **Set up aggregation**: Enable discovery through [ORD Aggregators](../../spec-v1/index.md#ord-aggregator)
- **Explore advanced features**: Check out [specification extensions](../../spec-extensions/) for additional capabilities

## Additional Resources

- [ORD Specification](../../spec-v1/index.md)
- [Document Interface Reference](../../spec-v1/interfaces/Document.md)
- [Example ORD Documents](../../spec-v1/examples/)
- [FAQ: How to Adopt ORD as Provider](./faq/adopt-ord-as-provider.md)
- [Access Strategies](../../spec-extensions/access-strategies/)

## Common Questions

**Q: Can I have multiple APIs in one ORD Document?**
A: Yes! Add multiple objects to the `apiResources` array.

**Q: Do I need to create the OpenAPI spec specifically for ORD?**
A: No, just reference your existing OpenAPI specification. ORD works with your current API documentation.

**Q: What if my OpenAPI spec requires authentication to access?**
A: Use appropriate [access strategies](../../spec-extensions/access-strategies/) in the `resourceDefinitions` to specify how to authenticate.

**Q: Can I use ORD with OData or GraphQL APIs?**
A: Yes! Use `apiProtocol: "odata-v2"`, `"odata-v4"`, or `"graphql"` and the corresponding definition types (`edmx`, `csdl-json`, or `graphql-sdl`).

**Q: Where should I host the ORD Document?**
A: Host it on the same domain as your application, accessible via the `/.well-known/open-resource-discovery` endpoint.
