---
sidebar_position: 5
description: Detailed explanation of the Integration Dependency concept.
---

# Integration Dependency

## Summary

An **Integration Dependency** states that the described system (self) can integrate with external systems (integration target) to achieve an integration purpose.
The purpose could be to enable a certain feature or integration scenario, but it could also be a mandatory prerequisite for the described system to work.

The integration dependency includes a list of requirements, which point out which API and event resources (or other ORD concepts) are involved.
Each requirement describes one aspect / ingredient and can be used to express alternatives (OR condition) for achieving the same outcome.

See also: [Integration Dependency interface](../interfaces/Document#integration-dependency).

## Background

In a distributed and technology-agnostic system landscape it is necessary to understand which integrations can (or have to) be set up.

Up until ORD v1.6, the specification focused only on describing what capabilities and resources a system offers _to others_.
Most notably, ORD can be used to describe APIs, Events and Capabilities which can be consumed and used externally.

Knowing only this side is not enough to fully understand the integration possibilities in a distributed landscape.
What is also needed is a way to describe what a system (potentially) _can consume_ — typically implemented as integration client code against an external API contract.

Integration Dependency was introduced to describe what a system can _consume_ / "make use of" from other systems.
If this is set up and connected at run-time, it constitutes an integration.
At ORD level, only the "type-level" ability to integrate and its requirements are described — not concrete runtime instances.

> **Tip:** When the integration target resource uses a shared ORD ID, for example with an [authority namespace](../index.md#authority-namespace), a reused system namespace or an [abstract resource](./compatibility.md#abstract-ord-resources), a single dependency reference covers all system types providing that contract.
> This is simpler than listing multiple system-type-specific ORD IDs as alternatives in the aspect.
> See [Shared Taxonomy, Resources and Contracts](./shared-resources.md).

The following diagram shows how two systems can integrate with each other via APIs and Events:

<div className="img-box" style={{aspectRatio: "611/271"}}>

![Integration Dependency Problem Statement](/img/integration-dependency-ps.drawio.svg "Integration Dependency Problem Statement")

</div>

> **Figure 1:** This figure shows an integration scenario between System A and System B. System Instance A has implemented API clients against API Resources B-1 and B-2 of its integration target, as well as an event subscription (client implementation) for events from event resource B-3. It has an API Resource A-2, which the integration target uses to provide data back to System A.

## Concept

An **Integration Dependency** describes the ability to integrate with an external application or service for the purpose of achieving an integration goal or scenario. In practice this is often implemented as client integration code. It lists the API and Event interfaces that need or may be used — typically also described via ORD by the integration target system or the owner of the contract.

It is also possible to define that only a `subset` of the referenced resource is required, allowing the dependency to be expressed with minimal surface area (e.g. specific event types for SAP Event Broker subscriptions, or specific MCP tools for an agent).
Integration Dependencies are optional to provide and are mandated only by specific use cases (e.g. SAP Event Broker, Data Products, AI Agents).

<div className="img-box" style={{aspectRatio: "611/481"}}>

![Integration Dependency](/img/integration-dependency.drawio.svg "Integration Dependency")

</div>

> **Figure 2:** This figure is based on the situation in Figure 1. It shows how System Instance A not only exposes API resources, but also defines an Integration Dependency with multiple requirements referencing external resources (System Instance B). Requirement 1 can be realized by accessing either API Resource B-1 or B-2 (alternatives). Requirement 2 covers event subscription. Requirement 3 points to its own API resource, which the integration target uses to send data back to System A.

Here are some typical scenarios with additional explanations:

- The most obvious situation is to reference to an external API resource, described by the integration target system. This implies that the integration target owns the contract. The system that describes the integration dependency will likely initiate the interaction (see Requirement 1 and 2).
- The requirement can reference to an own inbound API resource. In this case the described system owns the contract and the API implementation and is therefore in the server role. The integration target system is using this API to send information to the described system that is relevant to the integration dependency (see Requirement 3).
- The requirement can reference an own outbound API or event resource. The contract is owned by the described system, but it might not act in the server role. Instead, it can interact with the integration target system according to the defined contract.

Requirements express the following additional information:

- Requirements can be optional if the application can still provide meaningful results without it being provided.
- Within a requirement there can be references to semantically equivalent API or event resources that are alternatives to each other (OR condition).
- Constraints like a minimum version of the target resource.
- Define a `subset` of the target resource that is needed — specific API operations, MCP tools, or event types. This avoids granting broader permissions than necessary, reduces subscription scope, and for agents allows the runtime to load only the relevant tool descriptions into the LLM context.
- The requirement API or event resources can be references to descriptions from another (external) application if the integration target application owns the contract and lifecycle of it. But the contract can also be owned by the described application itself.
- Additionally, it is possible to describe which Consumption Bundle is to be used for setting up trust and credentials to the target API or Event resource.
- The application could also decide to expose an API or event resource contract itself, that another (external) application needs to implement and fulfill to integrate with the application in focus.

Integration Dependencies can also be mandatory, which implies that it's a prerequisite for provisioning the described system.
They inherit the typical, shared ORD attributes that can be used to handle lifecycle, versioning, globally unique IDs, correlations and more.
Integration Dependencies are not meant to describe complete processes where multiple parties are involved. They describe the technical ingredients for integrating with ideally one type of target system for exactly one integration purpose. Overarching processes and blueprints are usually governed centrally, as they go beyond the self-description of individual systems.
Integration Dependencies describe type-level / scenario-level information, not concrete integration instances.

## Big Picture

Only the system itself knows what external requirements it has and what integration outcomes it realizes by integrating with its targets — which is why describing outward requirements fits naturally into the ORD scope.

<div className="img-box" style={{aspectRatio: "862/537"}}>

![ORD High Level Data Model](/img/ord-high-level-data-model.drawio.svg "ORD High Level Data Model")

</div>

> This figure shows a high-Level overview on ORD entities and where Integration Dependency and Requirements fit in.

## Examples with Explanation

### SAP Subscription Billing Events

```json
{
  # ...
  "integrationDependencies": [
    {
      "ordId": "sap.s4:integrationDependency:subscriptionReplication:v2",
      "version": "2.2.3",
      "title": "Subscription Billing Replication",
      "description": "Replication of Subscription Billing data into S/4",
      "mandatory": false,
      "aspects": [
        {
          "eventResources": [
            {
              "ordId": "sap.billing.sb:eventResource:SAPSubscriptionBillingBusinessEvents:v2",
              "systemTypeRestriction": ["sap.billing"],
              "subset": [
                { "eventType": "sap.billing.sb.Subscription.Created.v2" },
                { "eventType": "sap.billing.sb.Subscription.Deleted.v2" }
              ]
            }
          ]
        }
      ]
    },
  ]
```

The above example is a very simple application of the Integration Dependency of S/4HANA creating a subscription for Subscription Billing events (that are available through the SAP Event Broker intermediary). It only lists one requirement which refers to one event resource. But it states that from the event resource only a subset of event types is needed. This addresses the requirement of SAP Event Broker around "Subscription Content" and helps them to provide a UI and more automation for creating event subscriptions based on the desired integration scenario.

If we want to add more event subscriptions that are defined across more than one Event Resource, it needs to be added as another Aspect (as they are combined with AND condition).

The `systemTypeRestriction` indicates that only events published by that system type (application or service) are meant to be subscribed, further narrowing down the subscription.

### MCP Tool Subset

An agent that depends on only a subset of tools in an MCP server can use `subset` on the `apiResources` aspect entry. The `operationId` value must match the tool `name` as defined in the MCP server card.

```json
{
  "integrationDependencies": [
    {
      "ordId": "foo.myapp:integrationDependency:MyAgent-mcpDeps:v1",
      "version": "1.0.0",
      "title": "MCP Tool Dependencies for My Agent",
      "shortDescription": "MCP tools required by My Agent at runtime.",
      "mandatory": true,
      "releaseStatus": "active",
      "partOfPackage": "foo.myapp:package:MyPackage:v1",
      "aspects": [
        {
          "apiResources": [
            {
              "ordId": "foo.sometool:apiResource:SomeToolMCPServer:v1",
              "subset": [
                { "operationId": "searchProducts" },
                { "operationId": "getProductDetails" },
                { "operationId": "checkAvailability" }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

The `subset` narrows the dependency to only the listed tools, which helps consumers understand the exact surface area required and can optimize permission grants or routing.
