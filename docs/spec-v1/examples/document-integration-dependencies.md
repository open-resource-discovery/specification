---
title: document-integration-dependencies
description: Example documents for Document.
---

## Example File:  document-integration-dependencies

```jsonc
{
  "$schema": "https://open-resource-discovery.github.io/specification/spec-v1/interfaces/Document.schema.json",
  "openResourceDiscovery": "1.12",
  "integrationDependencies": [
    // This is an example for a simple Integration Dependency
    // that only expresses that only declares that some events are needed together
    // This is needed for the SAP Event Broker to provide the "Subscription Content" related feature.
    {
      "ordId": "sap.s4:integrationDependency:subscriptionReplication:v2",
      "version": "2.2.3",
      "title": "Subscription Billing Replication",
      "description": "Replication of Subscription Billing data into S/4",
      "correlationIds": ["sap.s4:communicationScenario:SAP_COM_123"],
      "releaseStatus": "active",
      "visibility": "public",
      "partOfPackage": "sap.xref:package:SomePackage:v1",
      "mandatory": false,
      "lastUpdate": "2023-08-03T10:14:26.941Z",

      // Dependencies only means that an integration to the target resource is necessary
      // Data flow could be in both directions. For Data Product only the inbound data flow is really relevant
      // We likely don't need to distinguish this though because everything outbound is likely already setup (via blueprints?) and doesn't need to be put in here (e.g. Audit Log)
      // or an "internal" visibility resource
      "aspects": [
        {
          "title": "SAPSubscriptionBillingBusinessEvents Title",
          "mandatory": true,
          "eventResources": [
            {
              "ordId": "sap.billing.sb:eventResource:SAPSubscriptionBillingBusinessEvents:v2",
              "systemTypeRestriction": ["sap.billing"],
              "subset": [
                {
                  "eventType": "sap.billing.sb.Subscription.Created.v2",
                },
                {
                  "eventType": "sap.billing.sb.Subscription.Updated.v2",
                },
                {
                  "eventType": "sap.billing.sb.Subscription.Deleted.v2",
                },
              ],
            },
          ],
        },
        {
          "title": "Billing Forecast Events",
          "description": "The second aspect is interpreted as AND condition and used in case events from multiple event resources / catalog need to be subscribed",
          "mandatory": true,
          "eventResources": [
            {
              "ordId": "sap.billing.sb:eventResource:SAPSubscriptionBillingBusinessEvents_BillingForecastEvents:v1",
              "systemTypeRestriction": ["sap.billing"],
              "subset": [
                {
                  "eventType": "sap.billing.sb.billingForecast.created.v1",
                },
              ],
            },
          ],
        },
      ],
    },
    // This is an example for Data Product Input ports
    // The context is that there's a Customer Order data product which points to the Integration Dependency here as an input port.
    {
      "ordId": "sap.s4:integrationDependency:CustomerOrder:v1",
      "version": "1.2.3",
      "title": "Integration Dependency to realize Customer Order data product",
      "description": "Something",
      "mandatory": true,
      "correlationIds": ["sap.s4:communicationScenario:SAP_COM_1234"],
      "releaseStatus": "active",
      "visibility": "public",
      "partOfPackage": "sap.xref:package:SomePackage:v1",
      "lastUpdate": "2023-08-03T10:14:26.941Z",
      "aspects": [
        {
          "title": "RawCustomerOrder",
          "description": "Exchange Customer Order Data",
          "mandatory": true,
          "supportMultipleProviders": true,
          "eventResources": [
            // Please note that here
            {
              "ordId": "sap.cic:eventResource:RawCustomerOrder:v1",
              "systemTypeRestriction": ["sap.cic"],
              "subset": [
                {
                  "eventType": "sap.cic.Order.OrderTransferred.v1",
                },
              ],
            },
            {
              "ordId": "sap.cic:eventResource:RawCustomerOrder:v2",
              "subset": [
                {
                  "eventType": "sap.cic.Order.OrderTransferred.v2",
                },
              ],
            },
          ],
          "apiResources": [
            {
              "ordId": "sap.cic:apiResource:RawCustomerOrderSQL:v1",
              "minVersion": "1.3.0", // API Needs to be provided in at least version 1.3,
            },
          ],
        },
        {
          "title": "RetailTransaction",
          "description": "Test",
          "mandatory": false,
          "supportMultipleProviders": false,
          "apiResources": [
            {
              "ordId": "sap.cic:apiResource:RetailTransactionOData:v1",
              "minVersion": "1.3.0",
            },
            {
              "ordId": "sap.cic:apiResource:RetailTransactionSQL:v2",
            },
          ],
        },
      ],
    },
  ],
}

```
