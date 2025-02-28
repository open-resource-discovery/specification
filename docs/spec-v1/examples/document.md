# Example Document Files

### ./examples/document-1.json

> Source Code: [./examples/document-1.json](https://github.com/open-resource-discovery/specification/blob/main/examples/document-1.json)

```yaml
{
  "$schema": "https://open-resource-discovery.github.io/specification/spec-v1/interfaces/Document.schema.json",
  "openResourceDiscovery": "1.9",
  "description": "Example based on ORD Reference App",
  "policyLevels": ["sap:core:v1"],
  "products": [
    {
      "ordId": "sap.foo:product:ord-reference-app:",
      "title": "ORD Reference App",
      "vendor": "sap:vendor:SAP:",
      "shortDescription": "Open Resource Discovery Reference Application"
    }
  ],
  "packages": [
    {
      "ordId": "sap.foo:package:ord-reference-app:v0",
      "title": "Open Resource Discovery Reference Application",
      "shortDescription": "This is a reference application for the Open Resource Discovery standard",
      "description": "This reference application demonstrates how Open Resource Discovery (ORD) can be implemented, demonstrating different resources and discovery aspects",
      "version": "0.3.0",
      "policyLevels": ["sap:core:v1"],
      "partOfProducts": ["sap.foo:product:ord-reference-app:"],
      "vendor": "sap:vendor:SAP:",
      "tags": ["reference application"],
      "labels": {
        "customLabel": ["labels are more flexible than tags as you can define your own keys"]
      },
      "documentationLabels": {
        "Some Aspect": ["Markdown Documentation [with links](#)", "With multiple values"]
      }
    }
  ],
  "consumptionBundles": [
    {
      "ordId": "sap.foo:consumptionBundle:noAuth:v1",
      "title": "Unprotected resources",
      "shortDescription": "Bundle of unprotected resources",
      "description": "This Consumption Bundle contains all resources of the reference app which are unprotected and do not require authentication",
      "version": "1.0.0",
      "lastUpdate": "2022-12-19T15:47:04+00:00"
    }
  ],
  "apiResources": [
    {
      "ordId": "sap.foo:apiResource:astronomy:v1",
      "title": "Astronomy API",
      "shortDescription": "The API allows you to discover...",
      "description": "A longer description of this API with **markdown** \n## headers\n etc...",
      "version": "1.0.3",
      "lastUpdate": "2022-12-19T15:47:04+00:00",
      "visibility": "public",
      "releaseStatus": "active",
      "systemInstanceAware": false,
      "policyLevels": ["sap.foo:custom:v1"],
      "partOfPackage": "sap.foo:package:ord-reference-app:v1",
      "partOfConsumptionBundles": [
        {
          "ordId": "sap.foo:consumptionBundle:noAuth:v1"
        }
      ],
      "partOfGroups": ["sap.foo:groupTypeAbc:sap.foo:groupAssignmentValue"],
      "apiProtocol": "rest",
      "apiResourceLinks": [
        {
          "type": "api-documentation",
          "url": "/swagger-ui.html?urls.primaryName=Astronomy%20V1%20API"
        }
      ],
      "resourceDefinitions": [
        {
          "type": "openapi-v3",
          "mediaType": "application/json",
          "url": "/ord/metadata/astronomy-v1.oas3.json",
          "accessStrategies": [
            {
              "type": "open"
            }
          ]
        }
      ],
      "entryPoints": ["/astronomy/v1"],
      "extensible": {
        "supported": "no"
      }
    }
  ],
  "eventResources": [
    {
      "ordId": "sap.foo:eventResource:ExampleEventResource:v1",
      "title": "Event Example",
      "shortDescription": "Simple Event Example",
      "description": "Example long description",
      "version": "1.2.1",
      "lastUpdate": "2022-12-19T15:47:04+00:00",
      "releaseStatus": "beta",
      "partOfPackage": "sap.foo:package:SomePackage:v1",
      "visibility": "public",
      "resourceDefinitions": [
        {
          "type": "asyncapi-v2",
          "mediaType": "application/json",
          "url": "/some/path/asyncApi2.json",
          "accessStrategies": [
            {
              "type": "open"
            }
          ]
        }
      ],
      "extensible": {
        "supported": "no"
      }
    },
    {
      "ordId": "sap.foo:eventResource:BillingDocumentEvents:v1",
      "title": "Billing Document Events",
      "shortDescription": "Informs a remote system about created, changed, and canceled billing documents",
      "description": "Billing document is an umbrella term for invoices, credit memos, debit memos, pro forma invoices, and their respective cancellation documents. The following events are available for billing document:\n      Billing document canceled\n      Billing document changed\n      Billing Document created",
      "version": "1.0.0",
      "lastUpdate": "2022-12-19T15:47:04+00:00",
      "releaseStatus": "active",
      "partOfPackage": "sap.foo:package:SomePackage:v1",
      "visibility": "public",
      "resourceDefinitions": [
        {
          "type": "asyncapi-v2",
          "mediaType": "application/json",
          "url": "/api/eventCatalog.json",
          "accessStrategies": [
            {
              "type": "open"
            }
          ]
        }
      ],
      "extensible": {
        "supported": "no"
      }
    }
  ],
  "capabilities": [
    {
      "ordId": "sap.foo.bar:capability:mdi:v1",
      "title": "Master Data Integration Capability",
      "type": "sap.mdo:mdi-capability:v1",
      "shortDescription": "Short description of capability",
      "description": "Optional, longer description",
      "version": "1.0.0",
      "lastUpdate": "2023-01-26T15:47:04+00:00",
      "releaseStatus": "active",
      "visibility": "public",
      "partOfPackage": "sap.foo.bar:package:SomePackage:v1",
      "definitions": [
        {
          "type": "sap.mdo:mdi-capability-definition:v1",
          "mediaType": "application/json",
          "url": "/capabilities/foo.bar.json",
          "accessStrategies": [
            {
              "type": "open"
            }
          ]
        }
      ]
    }
  ],
  "groups": [
    {
      "groupId": "sap.foo:groupTypeAbc:sap.foo:groupAssignmentValue",
      "groupTypeId": "sap.foo:groupTypeAbc",
      "title": "Title of group assignment / instance"
    }
  ],
  "groupTypes": [
    {
      "groupTypeId": "sap.foo:groupTypeAbc",
      "title": "Title of group type"
    }
  ],
  "tombstones": [
    {
      "ordId": "sap.foo:apiResource:astronomy:v0",
      "removalDate": "2020-12-02T14:12:59Z"
    }
  ]
}

```

### ./examples/document-data-product.json

> Source Code: [./examples/document-data-product.json](https://github.com/open-resource-discovery/specification/blob/main/examples/document-data-product.json)

```yaml
{
  "$schema": "https://open-resource-discovery.github.io/specification/spec-v1/interfaces/Document.schema.json",
  "openResourceDiscovery": "1.9",
  "policyLevels": ["sap:core:v1"],
  "products": [
    {
      "ordId": "sap:product:SampleProduct:",
      "title": "Some Sample Product for Data Product Evaluation in Business Accelerator Hub",
      "shortDescription": "The next generation digital core designed to help you run simple in a digital economy.",
      "vendor": "sap:vendor:SAP:"
    }
  ],
  "packages": [
    {
      "ordId": "sap.xref:package:SomePackageDataProduct:v1",
      "title": "Sample Package DP",
      "shortDescription": "Sample Package for Data Product Evaluation in Business Accelerator Hub",
      "description": "...",
      "version": "1.0.0",
      "vendor": "sap:vendor:SAP:",
      "partOfProducts": ["sap:product:SampleProduct:"]
    },
    {
      "ordId": "sap.xref:package:SomePackageIntegrationDependencies:v1",
      "title": "Sample Package Integration Dependencies",
      "shortDescription": "Sample Package for Data Product Evaluation in Business Accelerator Hub",
      "description": "...",
      "version": "1.0.0",
      "vendor": "sap:vendor:SAP:",
      "partOfProducts": ["sap:product:SampleProduct:"]
    },
    {
      "ordId": "sap.xref:package:SomePackageAPIs:v1",
      "title": "Sample Package APIs",
      "shortDescription": "Sample Package for Data Product Evaluation in Business Accelerator Hub",
      "description": "...",
      "version": "1.0.0",
      "vendor": "sap:vendor:SAP:",
      "partOfProducts": ["sap:product:SampleProduct:"]
    },
    {
      "ordId": "sap.xref:package:SomePackageEvents:v1",
      "title": "Sample Package Events",
      "shortDescription": "Sample Package for Data Product Evaluation in Business Accelerator Hub",
      "description": "...",
      "version": "1.0.0",
      "vendor": "sap:vendor:SAP:",
      "partOfProducts": ["sap:product:SampleProduct:"]
    }
  ],
  "consumptionBundles": [
    {
      "ordId": "sap.foo:consumptionBundle:someAuth:v1",
      "title": "Protected with some auth",
      "shortDescription": "Bundle of resources that...",
      "description": "This Consumption Bundle contains all resources that share the same authentication method and access scope",
      "version": "1.0.0",
      "lastUpdate": "2022-12-19T15:47:04+00:00"
    }
  ],
  "dataProducts": [
    {
      "ordId": "sap.xref:dataProduct:Customer:v1",
      "localId": "Customer",
      "correlationIds": ["sap.xref:foo:bar"],
      "title": "Customer",
      "shortDescription": "A deprecated DP example",
      "description": "The Customer data product offers access to all customers. And can be very long ........",
      "partOfPackage": "sap.xref:package:SomePackageDataProduct:v1",
      "visibility": "public",
      "releaseStatus": "deprecated",
      "version": "1.9.0",
      "lastUpdate": "2020-12-08T15:47:04+00:00",
      "deprecationDate": "2020-12-08T15:47:04+00:00",
      "sunsetDate": "2022-01-08T15:47:04+00:00",
      "successors": ["sap.xref:dataProduct:Customer:v2"],
      "type": "primary",
      "category": "business-object",
      "outputPorts": [
        {
          "ordId": "sap.xref:apiResource:Customer:v1"
        }
      ],
      "responsible": "sap:ach:CIC-DP-CO"
    },
    {
      "ordId": "sap.xref:dataProduct:Customer:v2",
      "localId": "Customer",
      "correlationIds": ["sap.xref:foo:bar"],
      "title": "Customer",
      "shortDescription": "A minimal DP example",
      "description": "The Customer data product offers access to all customers. And can be very long ........",
      "partOfPackage": "sap.xref:package:SomePackageDataProduct:v1",
      "visibility": "public",
      "releaseStatus": "active",
      "version": "2.1.0",
      "lastUpdate": "2022-12-19T15:47:04+00:00",
      "type": "primary",
      "category": "business-object",
      "outputPorts": [
        {
          "ordId": "sap.xref:apiResource:Customer:v1"
        }
      ],
      "responsible": "sap:ach:CIC-DP-CO"
    },
    {
      "ordId": "sap.xref:dataProduct:CustomerOrder:v1",
      "localId": "CustomerOrder",
      "correlationIds": ["sap.xref:foo:bar"],
      "title": "Customer Order",
      "shortDescription": "The full example",
      "description": "The data product Customer Order offers access to all online and offline orders submitted by customers. It provides a customer view on the orders. For fulfillment-specific aspects please refer to the data product Fulfillment Order.",
      "partOfPackage": "sap.xref:package:SomePackageDataProduct:v1",
      "lastUpdate": "2022-12-19T15:47:04+00:00",
      "visibility": "public",
      "version": "1.4.0",
      "releaseStatus": "active",
      "changelogEntries": [
        {
          "date": "2020-04-29",
          "description": "## Changelog\n...",
          "releaseStatus": "active",
          "version": "1.1.3",
          "url": "https://www.sap.com/foo/bar"
        },
        {
          "date": "2022-04-29",
          "description": "## Changelog\n...",
          "releaseStatus": "active",
          "version": "1.2.3",
          "url": "https://www.sap.com/foo/bar"
        }
      ],
      "type": "derived",
      "category": "business-object",
      "entityTypes": ["sap.odm:entityType:CustomerOrder:v1", "sap.odm:entityType:RetailTransaction:v1"],
      "inputPorts": [
        {
          "ordId": "sap.xref:integrationDependency:CustomerOrder:v1"
        }
      ],
      "outputPorts": [
        {
          "ordId": "sap.xref:apiResource:CustomerOrderHeaderSQLPort:v1"
        },
        {
          "ordId": "sap.xref:apiResource:CustomerOrderDeltaSharing:v1"
        },
        {
          "ordId": "sap.xref:apiResource:CustomerOrderRest:v1"
        },
        {
          "ordId": "sap.xref:eventResource:CustomerOrder:v1"
        }
      ],
      "responsible": "sap:ach:CIC-DP-CO",
      "dataProductLinks": [
        {
          "type": "support",
          "url": "https://example.com/some/absolute/url"
        },
        {
          "type": "service-level-agreement",
          "url": "https://example.com/some/absolute/url"
        },
        {
          "type": "payment",
          "url": "https://example.com/some/absolute/url"
        },
        {
          "type": "custom",
          "customType": "sap:some-custom-definition-format-type:v1",
          "url": "https://example.com/some/absolute/url"
        }
      ],
      "links": [
        {
          "title": "Greatest DP of all time",
          "description": "This gives you an overview how a customer is using the data product.\n",
          "url": "https://blogs.sap.com/2018/04/11/testing-of-s4hana-inventory-management-odata-apis-via-sap-api-hub/"
        }
      ],
      "industry": ["Retail", "Consumer Products"],
      "lineOfBusiness": ["Sales"],
      "tags": ["CustomerOrder", "Order", "Online Sales", "Offline Sales"],
      "labels": {
        "label-key-1": ["label-value-1", "label-value-2"]
      },
      "documentationLabels": {
        "Scope Items": [
          "[Basic Bank Account Management (BFA)](https://rapid.sap.com/bp/#/scopeitems/BFA \\\" Link To BP \\\")"
        ]
      },
      "systemInstanceAware": true
    }
  ],
  "integrationDependencies": [
    {
      "ordId": "sap.xref:integrationDependency:CustomerOrder:v1",
      "localId": "CustomerOrder",
      "title": "Customer Order Integration Needs",
      "shortDescription": "Integration dependency to realize customer order data product",
      "description": "This integration dependency describes all the necessary aspects needed for the custom order data product to get data from. ...",
      "partOfPackage": "sap.xref:package:SomePackageIntegrationDependencies:v1",
      "version": "1.2.3",
      "lastUpdate": "2022-12-19T15:47:04+00:00",
      "visibility": "public",
      "releaseStatus": "active",
      "mandatory": true,
      "aspects": [
        {
          "title": "RawCustomerOrder",
          "description": "Raw Custom Order Data (For this test case the API reference is not part of this ORD document and will eventually be uploaded to Business Accelerator Hub!)",
          "mandatory": true,
          "supportMultipleProviders": true,
          "apiResources": [
            {
              "ordId": "sap.s4:apiResource:RawCustomerOrderData:v1"
            }
          ],
          "eventResources": [
            {
              "ordId": "sap.xref:eventResource:RawCustomerOrder:v1",
              "minVersion": "1.3.0",
              "subset": [
                {
                  "eventType": "sap.xref.Order.OrderTransferred.v1"
                }
              ]
            },
            {
              "ordId": "sap.xref:eventResource:RawCustomerOrder:v2",
              "subset": [
                {
                  "eventType": "sap.xref.Order.OrderTransferred.v2"
                }
              ]
            }
          ]
        },
        {
          "title": "RetailTransaction",
          "description": "Optional aspect to include retail transactions as customer orders (in this test case the alternative is between different APIs that can be used to injest data",
          "mandatory": false,
          "apiResources": [
            {
              "ordId": "sap.xref:apiResource:RetailTransactionOData:v1",
              "minVersion": "1.3.3"
            },
            {
              "ordId": "sap.xref:apiResource:RetailTransactionSQL:v2"
            }
          ]
        }
      ]
    }
  ],
  "apiResources": [
    {
      "ordId": "sap.xref:apiResource:CSN_EXPOSURE:v1",
      "title": "CSN EXPOSURE Endpoint",
      "shortDescription": "Exposing CSN",
      "description": "Internal CSN Exposure API",
      "version": "1.2.3",
      "lastUpdate": "2022-12-19T15:47:04+00:00",
      "releaseStatus": "active",
      "apiProtocol": "rest",
      "visibility": "internal",
      "partOfPackage": "sap.xref:package:SomePackageAPIs:v1",
      "partOfConsumptionBundles": [
        {
          "ordId": "sap.foo:consumptionBundle:someAuth:v1"
        }
      ],
      "entryPoints": ["./CSN_EXPOSURE"],
      "implementationStandard": "sap:csn-exposure:v1",
      "resourceDefinitions": [
        {
          "type": "openapi-v3",
          "mediaType": "application/json",
          "url": "/api/csn_exposure-oa3.json",
          "accessStrategies": [
            {
              "type": "open"
            }
          ]
        }
      ],
      "extensible": {
        "supported": "no"
      }
    },
    {
      "ordId": "sap.xref:apiResource:RetailTransactionSQL:v2",
      "localId": "RetailTransactionSQL",
      "title": "Retail Transactions",
      "shortDescription": "Exposing Retail Transactions...",
      "description": "Retail Transactions SQL API",
      "version": "2.2.3",
      "releaseStatus": "active",
      "lastUpdate": "2022-12-19T15:47:04+00:00",
      "visibility": "public",
      "partOfPackage": "sap.xref:package:SomePackageAPIs:v1",
      "partOfConsumptionBundles": [
        {
          "ordId": "sap.foo:consumptionBundle:someAuth:v1"
        }
      ],
      "entryPoints": ["sap://my.lob.data.platform.endpoint:30015"],
      "apiProtocol": "sap-sql-api-v1",
      "resourceDefinitions": [
        {
          "type": "sap-sql-api-definition-v1",
          "mediaType": "application/json",
          "url": "/api/retail-transaction-sql-v1.json",
          "accessStrategies": [
            {
              "type": "open"
            }
          ]
        }
      ],
      "implementationStandard": "sap:hana-cloud-sql:v1",
      "supportedUseCases": ["data-federation"],
      "entityTypeMappings": [
        {
          "entityTypeTargets": [
            {
              "ordId": "sap.odm:entityType:RetailTransaction:v1"
            }
          ]
        },
        {
          "apiModelSelectors": [
            {
              "type": "json-pointer",
              "jsonPointer": "#/components/schemas/RETAIL/TRANSACTIONS"
            }
          ],
          "entityTypeTargets": [
            {
              "correlationId": "sap.csnexposure:entity:RetailTransaction"
            }
          ]
        }
      ],
      "apiResourceLinks": [
        {
          "type": "api-documentation",
          "url": "/some/relative/url"
        },
        {
          "type": "authentication",
          "url": "https://example.com/some/absolute/url"
        },
        {
          "type": "service-level-agreement",
          "url": "https://example.com/some/absolute/url"
        }
      ],
      "extensible": {
        "supported": "manual",
        "description": "API can be extended by custom fields on the following business contexts (field usage for this API needs to be selected):\r\n* Procurement: Purchasing Document (MM_PURDOC_HEADER)\r\n* Procurement: Purchasing Document Item (MM_PURDOC_ITEM)\r\n\r\n[How to add an extension field to an API](https://help.sap.com/viewer/9a281eac983f4f688d0deedc96b3c61c/latest/en-US/57909455bf7c4fdd8bcf48d76c1eae33.html)"
      },
      "countries": ["DE", "US"],
      "lineOfBusiness": ["Sales"],
      "industry": ["Retail", "Consumer Products"],
      "tags": ["Commerce"],
      "labels": {
        "label-key-1": ["label-value-1", "label-value-2"]
      },
      "documentationLabels": {
        "Expected Access Performance ": ["free text/markdown"]
      }
    },
    {
      "ordId": "sap.xref:apiResource:RetailTransactionOData:v1",
      "localId": "RetailTransactionOData",
      "title": "Retail Transactions",
      "shortDescription": "Exposing Retail Transactions...",
      "description": "Retail Transactions OData API",
      "version": "1.2.3",
      "releaseStatus": "active",
      "lastUpdate": "2022-12-19T15:47:04+00:00",
      "visibility": "public",
      "partOfPackage": "sap.xref:package:SomePackageAPIs:v1",
      "partOfConsumptionBundles": [
        {
          "ordId": "sap.foo:consumptionBundle:someAuth:v1"
        }
      ],
      "entryPoints": ["sap://my.lob.data.platform.endpoint:30015"],
      "apiProtocol": "odata-v2",
      "resourceDefinitions": [
        {
          "type": "openapi-v3",
          "mediaType": "application/json",
          "url": "/api/customer-order-openapi/oas3.json",
          "accessStrategies": [
            {
              "type": "open"
            }
          ]
        },
        {
          "type": "edmx",
          "mediaType": "application/xml",
          "url": "/api/customer-order-edmx.xml",
          "accessStrategies": [
            {
              "type": "open"
            }
          ]
        }
      ],
      "entityTypeMappings": [
        {
          "entityTypeTargets": [
            {
              "ordId": "sap.odm:entityType:CustomerOrder:v1"
            }
          ]
        },
        {
          "apiModelSelectors": [
            {
              "type": "json-pointer",
              "jsonPointer": "#/components/schemas/CUSTOMER-ORDER/CUSTOMER_ORDER_HEADER"
            }
          ],
          "entityTypeTargets": [
            {
              "correlationId": "sap.csnexposure:entity:CustomerOrder"
            }
          ]
        }
      ],
      "extensible": {
        "supported": "no"
      }
    },
    {
      "ordId": "sap.xref:apiResource:CustomerOrderHeaderSQLPort:v1",
      "localId": "CustomerOrderHeaderSQLPort",
      "title": "Customer Order",
      "shortDescription": "Exposing Customer Order...",
      "description": "Customer Order SQL API ...",
      "version": "1.2.3",
      "releaseStatus": "active",
      "visibility": "public",
      "partOfPackage": "sap.xref:package:SomePackageAPIs:v1",
      "partOfConsumptionBundles": [
        {
          "ordId": "sap.foo:consumptionBundle:someAuth:v1"
        }
      ],
      "entryPoints": ["sap://my.lob.data.platform.endpoint:30015"],
      "apiProtocol": "sap-sql-api-v1",
      "resourceDefinitions": [
        {
          "type": "sap-sql-api-definition-v1",
          "mediaType": "application/json",
          "url": "/api/customer-order-sql-v1.json",
          "accessStrategies": [
            {
              "type": "open"
            }
          ]
        }
      ],
      "implementationStandard": "sap:hana-cloud-sql:v1",
      "supportedUseCases": ["data-federation"],
      "entityTypeMappings": [
        {
          "entityTypeTargets": [
            {
              "ordId": "sap.odm:entityType:CustomerOrder:v1"
            }
          ]
        },
        {
          "apiModelSelectors": [
            {
              "type": "json-pointer",
              "jsonPointer": "#/components/schemas/CUSTOMER-ORDER/ORDER-HEADER"
            }
          ],
          "entityTypeTargets": [
            {
              "correlationId": "sap.csnexposure:entity:CustomerOrder"
            }
          ]
        }
      ],
      "apiResourceLinks": [
        {
          "type": "api-documentation",
          "url": "/some/relative/url"
        },
        {
          "type": "authentication",
          "url": "https://example.com/some/absolute/url"
        },
        {
          "type": "service-level-agreement",
          "url": "https://example.com/some/absolute/url"
        }
      ],
      "extensible": {
        "supported": "no"
      },
      "countries": ["DE", "US"],
      "lineOfBusiness": ["Sales"],
      "industry": ["Retail", "Consumer Products"],
      "tags": ["Commerce"],
      "labels": {
        "label-key-1": ["label-value-1", "label-value-2"]
      },
      "documentationLabels": {
        "Expected Access Performance ": ["free text/markdown"]
      }
    },
    {
      "ordId": "sap.xref:apiResource:CustomerOrderDeltaSharing:v1",
      "localId": "CustomerOrderDeltaSharing",
      "title": "Customer Order",
      "shortDescription": "Exposing Customer Order...",
      "description": "Customer Order Delta Sharing API ...",
      "version": "1.2.3",
      "releaseStatus": "active",
      "visibility": "public",
      "partOfPackage": "sap.xref:package:SomePackageAPIs:v1",
      "partOfConsumptionBundles": [
        {
          "ordId": "sap.foo:consumptionBundle:someAuth:v1"
        }
      ],
      "entryPoints": ["sap://my.lob.data.platform.endpoint:30015"],
      "apiProtocol": "delta-sharing",
      "implementationStandard": "sap:delta-sharing:v1",
      "supportedUseCases": ["streaming"],
      "entityTypeMappings": [
        {
          "entityTypeTargets": [
            {
              "ordId": "sap.odm:entityType:CustomerOrder:v1"
            }
          ]
        }
      ],
      "apiResourceLinks": [
        {
          "type": "api-documentation",
          "url": "/some/relative/url"
        },
        {
          "type": "authentication",
          "url": "https://example.com/some/absolute/url"
        },
        {
          "type": "service-level-agreement",
          "url": "https://example.com/some/absolute/url"
        }
      ],
      "extensible": {
        "supported": "no"
      },
      "countries": ["DE", "US"],
      "lineOfBusiness": ["Sales"],
      "industry": ["Retail", "Consumer Products"],
      "tags": ["Commerce"],
      "labels": {
        "label-key-1": ["label-value-1", "label-value-2"]
      },
      "documentationLabels": {
        "Expected Access Performance ": ["free text/markdown"]
      }
    },
    {
      "ordId": "sap.xref:apiResource:CustomerOrderRest:v1",
      "localId": "CustomerOrderRest",
      "title": "Customer Order",
      "shortDescription": "Exposing Customer Order...",
      "description": "Customer Order Rest API ...",
      "version": "1.2.3",
      "releaseStatus": "active",
      "visibility": "public",
      "partOfPackage": "sap.xref:package:SomePackageAPIs:v1",
      "partOfConsumptionBundles": [
        {
          "ordId": "sap.foo:consumptionBundle:someAuth:v1"
        }
      ],
      "entryPoints": ["sap://my.lob.data.platform.endpoint:30015"],
      "apiProtocol": "rest",
      "resourceDefinitions": [
        {
          "type": "openapi-v3",
          "mediaType": "application/json",
          "url": "/api/customer-order-oas3.json",
          "accessStrategies": [
            {
              "type": "open"
            }
          ]
        }
      ],
      "supportedUseCases": ["snapshot"],
      "entityTypeMappings": [
        {
          "entityTypeTargets": [
            {
              "ordId": "sap.odm:entityType:CustomerOrder:v1"
            }
          ]
        },
        {
          "apiModelSelectors": [
            {
              "type": "json-pointer",
              "jsonPointer": "#/components/schemas/CUSTOMER-ORDER/ORDER-HEADER"
            }
          ],
          "entityTypeTargets": [
            {
              "correlationId": "sap.csnexposure:entity:CustomerOrder"
            }
          ]
        }
      ],
      "apiResourceLinks": [
        {
          "type": "api-documentation",
          "url": "/some/relative/url"
        },
        {
          "type": "authentication",
          "url": "https://example.com/some/absolute/url"
        },
        {
          "type": "service-level-agreement",
          "url": "https://example.com/some/absolute/url"
        }
      ],
      "extensible": {
        "supported": "no"
      },
      "countries": ["DE", "US"],
      "lineOfBusiness": ["Sales"],
      "industry": ["Retail", "Consumer Products"],
      "tags": ["Commerce"],
      "labels": {
        "label-key-1": ["label-value-1", "label-value-2"]
      },
      "documentationLabels": {
        "Expected Access Performance ": ["free text/markdown"]
      }
    }
  ],
  "eventResources": [
    {
      "ordId": "sap.xref:eventResource:RawCustomerOrder:v1",
      "version": "1.3.3",
      "title": "Raw Customer Order events",
      "shortDescription": "Exposing raw events",
      "description": "Some longer description understanding that this event is exposing raw Customer Order events",
      "releaseStatus": "active",
      "lastUpdate": "2022-12-19T15:47:04+00:00",
      "visibility": "public",
      "partOfPackage": "sap.xref:package:SomePackageEvents:v1",
      "resourceDefinitions": [
        {
          "type": "asyncapi-v2",
          "url": "/some/url/events/eventCatalog.json",
          "mediaType": "application/json"
        }
      ],
      "entityTypeMappings": [
        {
          "entityTypeTargets": [
            {
              "ordId": "sap.odm:entityType:CustomerOrder:v1"
            }
          ]
        }
      ],
      "extensible": {
        "supported": "no"
      }
    },
    {
      "ordId": "sap.xref:eventResource:RawCustomerOrder:v2",
      "version": "2.2.3",
      "title": "Raw Customer Order events",
      "shortDescription": "Exposing raw events",
      "description": "Some longer description understanding that this event is exposing raw Customer Order events",
      "releaseStatus": "active",
      "lastUpdate": "2022-12-19T15:47:04+00:00",
      "visibility": "public",
      "partOfPackage": "sap.xref:package:SomePackageEvents:v1",
      "resourceDefinitions": [
        {
          "type": "asyncapi-v2",
          "url": "/some/url/events/eventCatalog2.json",
          "mediaType": "application/json"
        }
      ],
      "entityTypeMappings": [
        {
          "entityTypeTargets": [
            {
              "ordId": "sap.odm:entityType:CustomerOrder:v1"
            }
          ]
        }
      ],
      "extensible": {
        "supported": "no"
      }
    },
    {
      "ordId": "sap.xref:eventResource:CustomerOrder:v1",
      "version": "1.2.3",
      "title": "Aggregated Customer Order events",
      "shortDescription": "Exposing events",
      "description": "Some longer description understanding that this event is exposing Customer Order events",
      "releaseStatus": "active",
      "lastUpdate": "2022-12-19T15:47:04+00:00",
      "visibility": "public",
      "partOfPackage": "sap.xref:package:SomePackageEvents:v1",
      "resourceDefinitions": [
        {
          "type": "asyncapi-v2",
          "url": "/some/url/events/eventCatalog2.json",
          "mediaType": "application/json"
        }
      ],
      "entityTypeMappings": [
        {
          "entityTypeTargets": [
            {
              "ordId": "sap.odm:entityType:CustomerOrder:v1"
            }
          ]
        }
      ],
      "extensible": {
        "supported": "no"
      }
    }
  ]
}

```

### ./examples/document-entity-type-mapping.json

> Source Code: [./examples/document-entity-type-mapping.json](https://github.com/open-resource-discovery/specification/blob/main/examples/document-entity-type-mapping.json)

```yaml
{
  "$schema": "https://open-resource-discovery.github.io/specification/spec-v1/interfaces/Document.schema.json",
  "openResourceDiscovery": "1.9",
  "description": "This Example demonstrates the Entity Type Mapping feature",
  "policyLevels": ["sap:core:v1"],
  "apiResources": [
    {
      "ordId": "sap.s4:apiResource:SomeODataAPI:v2",
      "title": "Some OData API",
      "shortDescription": "...",
      "description": "Some long description",
      "version": "2.1.2",
      "systemInstanceAware": true,
      "releaseStatus": "active",
      "lastUpdate": "2023-08-03T10:14:26.941Z",
      "apiProtocol": "odata-v4",
      "partOfPackage": "sap.s4:package:SAPS4HANACloud:v1",
      "partOfConsumptionBundles": [
        {
          "ordId": "sap.foo:consumptionBundle:someAuth:v1"
        }
      ],
      "visibility": "public",
      "extensible": {
        "supported": "no"
      },
      "resourceDefinitions": [
        {
          "type": "openapi-v3",
          "mediaType": "text/yaml",
          "url": "/definitions/catalog.svc/APIContent.APIs('API_RFQ_PROCESS_SRV')/$value?type=yaml",
          "accessStrategies": [
            {
              "type": "open"
            }
          ]
        },
        {
          "type": "edmx",
          "mediaType": "application/xml",
          "url": "/definitions/catalog.svc/APIContent.APIs('API_RFQ_PROCESS_SRV')/$value?type=edmx",
          "accessStrategies": [
            {
              "type": "open"
            }
          ]
        }
      ],
      "entryPoints": ["/API_RFQ_PROCESS_SRV/v1"],
      "entityTypeMappings": [
        {
          "apiModelSelectors": [
            {
              "type": "odata",
              "entitySetName": "A_OperationalAcctgDocItemCube"
            }
          ],
          "entityTypeTargets": [
            {
              "ordId": "sap.odm:entityType:WorkforcePerson:v1"
            },
            {
              "correlationId": "sap.s4:csnEntity:WorkForcePersonView_v1"
            },
            {
              "correlationId": "sap.s4:csnEntity:sap.odm.JobDetails_v1"
            }
          ]
        }
      ]
    },
    {
      "ordId": "sap.foo:apiResource:PLAIN_REST:v1",
      "title": "Some plain REST API",
      "shortDescription": "...",
      "description": "Some long description",
      "version": "1.1.2",
      "apiProtocol": "rest",
      "partOfPackage": "sap.foo:package:SomePackage:v1",
      "partOfConsumptionBundles": [
        {
          "ordId": "sap.foo:consumptionBundle:someAuth:v1"
        }
      ],
      "releaseStatus": "active",
      "lastUpdate": "2023-08-03T10:14:26.941Z",
      "visibility": "public",
      "extensible": {
        "supported": "no"
      },
      "resourceDefinitions": [
        {
          "type": "openapi-v3",
          "mediaType": "text/yaml",
          "url": "/definitions/catalog.svc/APIContent.APIs('API_RFQ_PROCESS_SRV')/$value?type=yaml",
          "accessStrategies": [
            {
              "type": "open"
            }
          ]
        }
      ],
      "entryPoints": ["/path/to/api/v1"],
      "entityTypeMappings": [
        {
          "apiModelSelectors": [
            {
              "type": "json-pointer",
              "jsonPointer": "#/objects/schemas/WorkForcePersonRead"
            },
            {
              "type": "json-pointer",
              "jsonPointer": "#/objects/schemas/WorkForcePersonUpdate"
            },
            {
              "type": "json-pointer",
              "jsonPointer": "#/objects/schemas/WorkForcePersonCreate"
            }
          ],
          "entityTypeTargets": [
            {
              "ordId": "sap.odm:entityType:WorkforcePerson:v1"
            },
            {
              "correlationId": "sap.s4:csnEntity:WorkForcePersonView_v1"
            }
          ]
        }
      ]
    }
  ],
  "eventResources": [
    {
      "ordId": "sap.foo.bar:eventResource:ExampleEventResource:v1",
      "title": "Event Example",
      "shortDescription": "Simple Event Example",
      "description": "Example long description",
      "version": "1.2.1",
      "lastUpdate": "2023-08-03T10:14:26.941Z",
      "releaseStatus": "beta",
      "partOfPackage": "sap.s4:package:SAPS4HANACloudBusinessEvents:v1",
      "visibility": "public",
      "extensible": {
        "supported": "no"
      },
      "resourceDefinitions": [
        {
          "type": "asyncapi-v2",
          "mediaType": "application/json",
          "url": "/definitions/asyncApi2.json",
          "accessStrategies": [
            {
              "type": "open"
            }
          ]
        }
      ],
      "entityTypeMappings": [
        {
          "apiModelSelectors": [
            {
              "type": "json-pointer",
              "jsonPointer": "#/components/messages/sap_odm_finance_costobject_CostCenter_Created_v1/payload"
            }
          ],
          "entityTypeTargets": [
            {
              "ordId": "sap.odm:entityType:CostCenter:v1"
            },
            {
              "correlationId": "sap.s4:csnEntity:CostCenter_v1"
            }
          ]
        }
      ]
    }
  ],
  "entityTypes": []
}

```

### ./examples/document-entity-types.json

> Source Code: [./examples/document-entity-types.json](https://github.com/open-resource-discovery/specification/blob/main/examples/document-entity-types.json)

```yaml
{
  "$schema": "https://open-resource-discovery.github.io/specification/spec-v1/interfaces/Document.schema.json",
  "openResourceDiscovery": "1.9",
  "description": "Example for entity types as they will be exposed by ODM",
  "policyLevels": ["sap:core:v1"],
  "packages": [
    {
      "ordId": "sap.odm:package:OdmEntities:v1",
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
      "ordId": "sap.odm:entityType:BusinessPartner:v1",
      "localId": "BusinessPartner",
      "level": "aggregate",
      "title": "Business Partner",
      "shortDescription": "Person, an organization, or a group of persons or organizations.",
      "description": "A business partner is a person, an organization, or a group of persons or organizations in which a company has a business interest.",
      "version": "1.0.0",
      "lastUpdate": "2023-03-18T15:30:04+00:00",
      "partOfPackage": "sap.odm:package:OdmEntities:v1",
      "visibility": "public",
      "links": [],
      "releaseStatus": "active",
      "relatedEntityTypes": [
        {
          "ordId": "sap.vdm.sot:entityType:BusinessPartner:v1"
        }
      ]
    }
  ]
}

```

### ./examples/document-special-protocols.json

> Source Code: [./examples/document-special-protocols.json](https://github.com/open-resource-discovery/specification/blob/main/examples/document-special-protocols.json)

```yaml
{
  "$schema": "https://open-resource-discovery.github.io/specification/spec-v1/interfaces/Document.schema.json",
  "openResourceDiscovery": "1.9",
  "description": "This ORD Document example contains more special examples, like custom SAP protocols",
  "policyLevels": ["sap:core:v1"],
  "consumptionBundles": [
    {
      "ordId": "sap.foo:consumptionBundle:basicAuth:v1",
      "title": "BasicAuth protected resources",
      "shortDescription": "Bundle of protected resources",
      "description": "This Consumption Bundle contains all resources of the reference app which share the same BasicAuth access and identity realm",
      "version": "1.0.0",
      "lastUpdate": "2022-12-19T15:47:04+00:00",
      "credentialExchangeStrategies": [
        {
          "type": "custom",
          "customType": "sap.foo:basicAuthCredentialExchange:v1",
          "customDescription": "The BasicAuth credentials must be created and retrieved manually.\nPlease refer to the documentation on the [ORD Reference App API access](https://pages.github.com/SAP/open-resource-discovery-reference-application/blob/master/docs/README.md#api-access)."
        }
      ]
    }
  ],
  "apiResources": [
    {
      "ordId": "sap.foo:apiResource:someRfcAPI:v1",
      "title": "Some RFC API",
      "shortDescription": "...",
      "description": "Some long description",
      "version": "1.0.0",
      "lastUpdate": "2022-12-19T15:47:04+00:00",
      "visibility": "internal",
      "releaseStatus": "active",
      "systemInstanceAware": true,
      "partOfPackage": "sap.foo:package:ord-reference-app:v1",
      "apiProtocol": "sap-rfc",
      "partOfConsumptionBundles": [
        {
          "ordId": "sap.foo:consumptionBundle:basicAuth:v1"
        }
      ],
      "entryPoints": ["/some/rfc/api/url/v1"],
      "resourceDefinitions": [
        {
          "type": "sap-rfc-metadata-v1",
          "mediaType": "application/xml",
          "url": "/some/url/to/metadata.xml",
          "accessStrategies": [
            {
              "type": "open"
            }
          ]
        }
      ],
      "extensible": {
        "supported": "no"
      }
    },
    {
      "ordId": "sap.foo:apiResource:someApeAPI:v1",
      "title": "Some APE API",
      "shortDescription": "...",
      "description": "Some long description",
      "version": "1.0.0",
      "lastUpdate": "2022-12-19T15:47:04+00:00",
      "visibility": "internal",
      "releaseStatus": "active",
      "systemInstanceAware": true,
      "partOfPackage": "sap.foo:package:ord-reference-app:v1",
      "apiProtocol": "websocket",
      "direction": "mixed",
      "implementationStandard": "sap:ape-api:v1",
      "partOfConsumptionBundles": [
        {
          "ordId": "sap.foo:consumptionBundle:basicAuth:v1"
        }
      ],
      "extensible": {
        "supported": "no"
      }
    },
    {
      "ordId": "sap.foo:apiResource:someCdiAPI:v1",
      "title": "Some APE API",
      "shortDescription": "...",
      "description": "Some long description",
      "version": "1.0.0",
      "lastUpdate": "2022-12-19T15:47:04+00:00",
      "visibility": "internal",
      "releaseStatus": "active",
      "systemInstanceAware": true,
      "partOfPackage": "sap.foo:package:ord-reference-app:v1",
      "partOfConsumptionBundles": [
        {
          "ordId": "sap.foo:consumptionBundle:basicAuth:v1"
        }
      ],
      "apiProtocol": "odata-v4",
      "direction": "inbound",
      "entryPoints": ["/some/ape/api/url/v1"],
      "implementationStandard": "sap:cdi-api:v1",
      "resourceDefinitions": [
        {
          "type": "edmx",
          "mediaType": "application/xml",
          "url": "/path/to/metadata.edmx",
          "accessStrategies": [
            {
              "type": "open"
            }
          ]
        },
        {
          "type": "openapi-v3",
          "mediaType": "application/json",
          "url": "/path/to/metadata.json",
          "accessStrategies": [
            {
              "type": "open"
            }
          ]
        }
      ],
      "extensible": {
        "supported": "no"
      }
    }
  ]
}

```


