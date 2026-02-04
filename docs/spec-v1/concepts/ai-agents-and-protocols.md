---
sidebar_position: 5
description: AI Agents and related protocols in ORD.
title: AI Agents and Protocols
---

# AI Agents and Protocols

> 🚧 Please note that the [Agents](../interfaces/Document#agent) concept is still in development and contains <span className="feature-status-beta">BETA</span> properties and will get further extended.

## Agents

> An [Agent](../interfaces/Document#agent) is an **autonomous software entity** capable of task execution, described through high quality **metadata** that can be accessed through a central catalog ([ORD Aggregator](../#ord-aggregator)).

To understand how Agents fit into the ORD landscape, it is helpful to distinguish between their abstract definition and their technical realization.

In ORD, an **Agent** is primarily a conceptual, "product-like" entity, similar to a [Data Product](./data-product.md).
It represents a distinct capability or functional unit that can be discovered, understood, and managed independent of its specific deployment or invocation mechanism.

### Key Characteristics

-   **Generic vs. AI Agents:** ORD defines a generic Agent resource type representing any autonomous software entity capable of task execution.
    An Agent in ORD is not necessarily an AI Agent; the concept is broad enough to cover rule-based automation, legacy bots, and other autonomous systems.
-   **Primary Use Case:** The design focus is currently on **AI Agents**—intelligent systems often integrated with Large Language Models (LLMs) that can interpret natural language, reason about complex scenarios, and operate in conversational mode or automated workflows.
-   **Metadata Focus:** The Agent resource focuses on high-level metadata: ownership, intended use cases (e.g., "Financial Dispute Resolution"), constraints, and capabilities.
-   **Separation of Concerns:** A key design principle is the clear separation between agent planning or existence and API exposure / implementation.
    This allows modeling agents that are currently planned, or exist and act within a system but may not expose an external API.

### Technical Realization

From a technical perspective, an Agent is simply a specialized type of application logic running within a **[System](../index.md#system-instance)**.

-   **Deployment:** An Agent is deployed as a [system](../index.md#system-instance), or as part of a system.
    A single system can host one or multiple agents.
-   **Instantiation:** While the "Agent Resource" describes the *type* or *class* of the agent (Design Time), the running software represents an *instance* of that agent (Runtime).
    -   *See [System Landscape Model](./system-landscape-model.md) for more on the distinction between Systems, Tenants, and Resources.*

![AI Agent Overview](/img/ord-ai-agent.drawio.svg "AI Agent Overview")

## Agent Example

The following example shows how an Agent is described in an ORD Document:

```json
{
  "agents": [
    {
      "ordId": "sap.foo:agent:disputeAgent:v1",
      "title": "Dispute Resolution Agent",
      "shortDescription": "AI agent specialized in financial dispute case resolution",
      "description": "A longer description of this Agent with **markdown**...",
      "version": "1.0.3",
      "visibility": "public",
      "releaseStatus": "active",
      "partOfPackage": "sap.foo:package:ord-reference-app:v1",
      "partOfProducts": ["sap:product:S4HANA_OD:"],

      // Which Entity Types does the agent work with?
      "relatedEntityTypes": [
        "sap.foo:entityType:DisputeCase:v1",
        "sap.foo:entityType:DisputeResolution:v1"
      ],

      // What API(s) can be used to interact with the agent?
      "exposedApiResources": [
        {"ordId": "sap.foo:apiResource:DisputeResolutionAgent:v1"}
      ],

      // What external resources does the agent depend on?
      "integrationDependencies": [
        "sap.foo:integrationDependency:DisputeCaseManagement:v1"
      ],

      // Assigning the agent to Groups / Taxonomy (e.g., LLM Model used) with more structure and governance
      "partOfGroups": ["sap.aicore:llmModel:sap.aicore:anthropic--claude-3.7-sonnet"],

      // Extensible properties via labels
      "labels": {
        "interactionMode": ["conversational", "system-triggered"]
      },
      "tags": ["finance", "billing", "dispute-resolution", "ai-agent"],
      // ...
    }
  ]
}
```

Key aspects of this example:
- **`ordId`**: A globally unique identifier for the agent
- **`exposedApiResources`**: Links to the API(s) through which the agent can be invoked (e.g., an A2A API)
- **`integrationDependencies`**: Declares what external resources the agent requires to function
- **`relatedEntityTypes`**: Documents which domain bjebusiness entities the agent operates on
- **`labels`**: Extensible key-value pairs for additional metadata like LLM models used

## Connectivity & Protocols

The ORD Agent resource acts as a central hub that connects to other ORD concepts to define how to interact with it and what it needs to function.

ORD supports the discovery of **AI-Native Protocols**.
These are API protocols specifically designed for simple consumption by LLMs and AI Agents, well-supported by the emerging AI ecosystem, and optimized for this use case.

```mermaid
graph TD
    classDef concept fill:#e1f5fe,stroke:#01579b,stroke-width:2px;
    classDef tech fill:#f3e5f5,stroke:#4a148c,stroke-width:2px;
    classDef dep fill:#fff3e0,stroke:#e65100,stroke-width:2px;

    Agent["Agent<br/>(Product-like Concept)"]:::concept
    System["System / Application"]:::tech
    API["API Resource<br/>(Interaction Contract)"]:::tech
    Dep["Integration Dependency<br/>(Required External Data/Tools)"]:::dep

    System -- Hosts --> Agent
    Agent -- Exposes --> API
    Agent -- Requires --> Dep

    API -.->|Protocol: A2A| A2A[A2A Protocol]
    Dep -.->|Protocol: MCP| MCP[MCP Server]
    Dep -.->|Generic| Other["Other Resources (APIs, Events, etc.)"]
```

### Exposing Capabilities (Interaction)

Once an agent is implemented, there must be a defined contract for interacting with it.
In ORD, this is modeled by linking the Agent to an **[API Resource](../interfaces/Document#api-resource)**.

-   **A2A (Agent-to-Agent):** While ORD is protocol-agnostic, the [Agent2Agent (A2A) Protocol](https://a2a-protocol.org/latest/) is the primary AI-Native Protocol for this purpose.
    It enables seamless communication and collaboration between AI agents through standardized agent card definitions.
-   **Discovery:** This link allows consumers to find the technical interface (e.g., the A2A JSON schema or OpenAPI spec) required to send messages to the agent.

Here's an example of an A2A API Resource linked to an agent:

```json
{
  "apiResources": [
    {
      "ordId": "sap.foo:apiResource:DisputeResolutionAgent:v1",
      "title": "Dispute Resolution Agent",
      "apiProtocol": "a2a",  // Indicates this is an A2A protocol API
      "resourceDefinitions": [
        {
          "type": "a2a-agent-card",
          "mediaType": "application/json",
          "url": "/definitions/DisputeResolutionAgentcard.json",
          "accessStrategies": [{ "type": "open" }]
        }
      ],
      // Which Entity Types does this agent API expose?
      "exposedEntityTypes": [
        { "ordId": "sap.foo:entityType:DisputeCase:v1" },
        { "ordId": "sap.foo:entityType:DisputeResolution:v1" }
      ],
      // ...
    }
  ]
}
```

The `resourceDefinitions` with type `a2a-agent-card` points to the full A2A Agent Card, which contains detailed capability information like skills, input/output modes, and security schemes.

### Consuming Capabilities (Dependencies)

Agents rarely work in isolation.
They often need to access real-world data or invoke business functions.
This is modeled using **[Integration Dependencies](../interfaces/Document#integration-dependency)**.

-   **MCP (Model Context Protocol):** A common pattern is for an Agent to depend on an [MCP Server](https://modelcontextprotocol.io/docs/getting-started/intro).
    The Integration Dependency declares this requirement, allowing the runtime environment to provision the necessary connections to data sources and tools.
-   **Other Resources:** Agents are not limited to AI-native protocols.
    They can also depend on any other [ORD resource](../index.md#ord-resource), such as **[API Resources](../interfaces/Document#api-resource)** (REST, OData, GraphQL) or **[Event Resources](../interfaces/Document#event-resource)**, to interact with existing business systems.
-   **Agent Chaining:** Agents can also have dependencies on other Agents, forming complex workflows.

Here's an example of an Integration Dependency for an agent:

```json
{
  "integrationDependencies": [
    {
      "ordId": "sap.foo:integrationDependency:DisputeCaseManagement:v1",
      "title": "Dispute Case Management Integration",
      "shortDescription": "Integration dependency for dispute case management system",
      "mandatory": true,
      "aspects": [
        {
          "title": "Case Management API Access",
          "description": "Access to dispute case management APIs",
          "mandatory": true,
          "apiResources": [
            { "ordId": "sap.bar:apiResource:DisputeResolutionAPI:v1" }
          ]
        }
      ]
      // ...
    }
  ]
}
```

## Use Cases

Describing agents in ORD enables several key scenarios:

-   **Dynamic Agent Discovery:** AI orchestrators can dynamically discover available agents in a system landscape to extend their capabilities.
-   **Agent Catalogs:** Central catalogs can index and display agents, enabling users to find and understand available AI capabilities.
-   **Landscape Planning:** Understand the agent landscape across systems, including which agents depend on which resources.
    Supports static catalogs (what is offered) and dynamic landscapes (what is actually running and available).
-   **Dependency Management:** Explicitly modeling what an agent requires (via Integration Dependencies) supports automatic provisioning and understanding of dependency relationships.
-   **Code-Based Agent Discovery:** Developers building code-based agents can discover and consume other agents programmatically.

## Current Status

The AI Agents concept in ORD is currently in **Beta status** and may undergo refinements based on community feedback.

### What's Included

- Core agent properties: identity, versioning, visibility, release status, ownership
- Relationships to API Resources via `exposedApiResources`
- Relationships to dependencies via `integrationDependencies`
- Links to related Entity Types via `relatedEntityTypes`
- Extensibility via `labels` and `tags` for evolving properties

### Extensibility Approach

Given the rapidly evolving AI ecosystem, ORD takes a conservative approach to adding new properties:

-   **[Groups](./grouping-and-bundling.md#groups):** The recommended mechanism for adding taxonomy to agents.
    Groups allow defining custom **Group Types** (e.g., "LLM Model", "Process Area") and assigning agents to specific groups.
    This approach is more structured and governed than labels, supporting both global taxonomies and application-specific groupings.
    For example, an agent could be assigned to an LLM model group like `sap.aicore:llmModel:sap.aicore:anthropic--claude-3.7-sonnet`.
-   **Labels:** For simpler key-value metadata that is still being validated, labels can be used.
    This allows for experimentation without committing to a stable schema.
-   **Tags:** Free-form tags for folksonomy-style categorization (e.g., `["finance", "billing", "ai-agent"]`).

### Examples

Example implementations are available in the ORD specification repository:
- `examples/documents/document-agents.json` — Complete ORD document with agent definitions
- `examples/definitions/DisputeResolutionAgentcard.json` — A2A Agent Card example
