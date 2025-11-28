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

## Problem Statement

In a distributed and technology-agnostic system landscape we need to understand which integrations can (or have to) be setup.

Up until ORD v1.6, the specification focused only on describing what capabilities and resources a system offers _to others_.
Most notably, ORD can be used to describe APIs, Events and Capabilities which can be consumed and used externally.

If we only know this side, we cannot fully understand the integration possibilities in a distributed and technology-agnostic system landscape.
What we are missing, is not only to describe what a systems _offers_, but also describe what it (potentially) _can consume_.
This is usually implemented as integration client code (usually against an external or assumed target API contract).

Therefore, we introduced Integration Dependency as a means to describe what a system can an _consume_ / "make use of" from other systems.
If this is setup and connected at run-time, we call this an integration.
But at ORD level, we're only describing the "type-level" ability to integrate and what dependencies and requirements that entails.

The following diagram shows how two systems can integrate with each other via APIs and Events:

![Integration Dependency Problem Statement](/img/integration-dependency-ps.drawio.svg "Integration Dependency Problem Statement")

> **Figure 1:** This figure shows an integration scenario between System A and System B. System Instance A has implemented API clients against API Resources B-1 and B-2 of its integration target, as well as an event subscription (client implementation) for events from event resource B-3. It has an API Resource A-2, which the integration target uses to provide data back to System A.

## Proposed Solution

We introduce a new ORD resource type **Integration Dependency**. It can be used to describe the ability, and therefore dependency to integrate with an external application / service for the purpose of achieving an integration goal (or scenario). In practice, this is often implemented as client integration code. This includes listing **Requirements** what API and Event interfaces need or may be used. Typically, these are also described via ORD by the integration target system or the owner of the API or Event contract.

In addition, it is also possible to further define that only a subset of the depended resources is necessary for the integration, allowing us to be more precise when necessary (e.g., for the SAP Event Broker use case).
With the proposed solution we can handle SAP Event Broker and Data Product related requirements with a shared, generic concept. In general, Integration Dependencies are optional to be provided and will only be mandated through specific use cases, e.g., SAP Event Broker or Data Products.

![Integration Dependency](/img/integration-dependency.drawio.svg "Integration Dependency")

> **Figure 2:** This figure is based on the situation in Figure 1. It shows how System Instance A not only exposes API resources, but also defines an Integration Dependency with multiple requirements referencing external resources (System Instance B). Requirement 1 can be realized by accessing either API Resource B-1 or B-2 (alternatives). Requirement 2 covers event subscription. Requirement 3 points to its own API resource, which the integration target uses to send data back to System A.

Here are some typical scenarios with additional explanations:

- The most obvious situation is to reference to an external API resource, described by the integration target system. This implies that the integration target owns the contract. The system that describes the integration dependency will likely initiate the interaction (see Requirement 1 and 2).
- The requirement can reference to an own inbound API resource. In this case the described system owns the contract and the API implementation and is therefore in the server role. The integration target system is using this API to send information to the described system that is relevant to the integration dependency (see Requirement 3).
- The requirement can reference an own outbound API or event resource. The contract is owned by the described system, but it might not act in the server role. Instead, it can interact with the integration target system according to the defined contract.

Requirements express the following additional information:

- Requirements can be optional if the application can still provide meaningful results without it being provided.
- Within a requirement there can be references to semantically equivalent API or event resources that are alternatives to each other (OR condition).
- Constraints like a minimum version of the target resource.
- Define a subset of the target resource that is needed. This helps in some situations to not give out wider rights or create more subscriptions than necessary.
- The requirement API or event resources can be references to descriptions from another (external) application if the integration target application owns the contract and lifecycle of it. But the contract can also be owned by the described application itself.
- Additionally, it is possible to describe which Consumption Bundle is to be used for setting up trust and credentials to the target API or Event resource.
- The application could also decide to expose an API or event resource contract itself, that another (external) application needs to implement and fulfill to integrate with the application in focus.

Integration Dependencies can also be mandatory, which implies that it's a prerequisite for provisioning the described system.
They inherit the typical, shared ORD attributes that can be used to handle lifecycle, versioning, globally unique IDs, correlations and more.
Integration Dependencies are not meant to describe complete processes, where multiple parties are involved. They are only meant to describe the technical ingredients that are involved in integrating with ideally only one type of target systems for exactly one integration purpose. Overarching information like processes and blueprints are usually governed and defined centrally as they go beyond just pure self-description of individual systems.
Also be aware that Integration Dependencies and Requirements are describing a type-level / "scenario-level" information. This proposal does not cover describing concrete integration instances. In our current target picture, we would prefer integrations to be setup via centralized tools like URM and UCL . In theory ORD could also be used to describe integration instances if only the application / service knows them itself (no central setup) – but this is out of scope of this proposal.

## Big Picture

We think describing such outward requirements fits well into the ORD scope, because only the system itself knows what external requirements it has and what integration outcomes / scenarios it realizes by integrating with the requirement targets.

![ORD High Level Data Model](/img/ord-high-level-data-model.drawio.svg "ORD High Level Data Model")

> This figure shows a high-Level overview on ORD entities and where Integration Dependency and Requirements fit in.

## Examples with Explanation

### SAP Subscription Billing Events

```yaml
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

In the future, we may need to extend the Integration Dependency with knowledge about whether it has been instantiated (or "enabled"). This becomes necessary when outside parties need to learn about whether the Integration Dependency has already been enabled for them or not. Whether this should be done via ORD protocol is not clear and needs further clarification.

Let's explore the target picture together with blueprint driven provisioning and Unified Resource Manager for SAP defined processes: In the solution blueprint architects with the knowledge of the overall process define that there needs to be an integration between S/4 and SAP Event Broker that events from Subscription Billing needs to be transferred. This results in URM resources that setup the integration channel between S/4 and Event Broker as well as with Subscription Billing and Event Broker. In the last step Event Broker takes the information from the integration dependency in ORD that this specific S/4 tenant needs to consume a set of specific subscription billing events.
