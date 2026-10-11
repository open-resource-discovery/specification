---
sidebar_position: 5
description: AI Agents and related protocols in ORD.
title: AI Agents and Protocols
---

import { AgentConnectivityDiagram, AiEnrichmentDiagram } from "@site/src/components/OrdDiagrams";

# AI Agents and Protocols

> 🚧 Please note that the [Agents](../interfaces/Document#agent) concept is still in development and contains <span className="feature-status-beta">BETA</span> properties and will get further extended.

> **Visual walkthrough:** Explore [Agent interaction and dependencies](https://open-resource-discovery.github.io/presentation/ai-discovery) and [AI metadata enrichment](https://open-resource-discovery.github.io/presentation/ai-enrichment) in the ORD presentation. The Agent slide also includes explicitly marked skills and plugins proposals.

## Agents

> An [Agent](../interfaces/Document#agent) is an **autonomous software entity** capable of task execution, described through high quality **metadata** that can be accessed through a central catalog ([ORD Aggregator](../index.md#ord-aggregator)).

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

How the Agent resource links to its interaction contract and required external resources is shown in [Connectivity & Protocols](#connectivity--protocols).

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
        "sap.ai:interactionMode": ["conversational", "system-triggered"]
      },
      "tags": ["finance", "billing", "dispute-resolution", "ai-agent"],
      // ...
    }
  ]
}
```

Key aspects of this example:
- **`ordId`**: A stable design-time identifier for the agent; runtime identity also needs the [system-instance context](../index.md#ord-id)
- **`exposedApiResources`**: Links to the API(s) through which the agent can be invoked (e.g., an A2A API)
- **`integrationDependencies`**: Declares what external resources the agent requires to function
- **`relatedEntityTypes`**: Documents which domain business entities the agent operates on
- **`relatedCapabilities`**: Links the agent to named Capability resources, including the abilities it implements
- **`relatedAgents`**: Declares agent-level relationships, such as delegation to a specialist
- **`labels`**: Extensible key-value pairs for additional metadata like LLM models used

## Connectivity & Protocols

The ORD Agent resource acts as a central hub that connects to other ORD concepts to define how to interact with it and what it needs to function.

ORD supports the discovery of **AI-Native Protocols**.
These are API protocols specifically designed for simple consumption by LLMs and AI Agents, well-supported by the emerging AI ecosystem, and optimized for this use case.

<AgentConnectivityDiagram />

### Exposing Capabilities (Interaction)

If an agent exposes an interaction interface, its contract is described separately by an **[API Resource](../interfaces/Document#api-resource)**.
The Agent references that resource through the optional `exposedApiResources` property.
An Agent without an exposed interaction API can still be described in ORD.

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
    When only a subset of tools is needed, the `subset` field narrows the dependency to the exact operations required (using the tool `name` from the MCP server card as `operationId`).
    This lets an agent runtime load only the relevant tool descriptions and use the declared subset when configuring permissions.
    Declaring a subset does not grant access; runtime authentication and authorization remain separate concerns.
-   **Other Resources:** Agents are not limited to AI-native protocols.
    They can also depend on any other [ORD resource](../index.md#ord-resource), such as **[API Resources](../interfaces/Document#api-resource)** (REST, OData, GraphQL) or **[Event Resources](../interfaces/Document#event-resource)**, to interact with existing business systems.
-   **Agent Chaining:** An Agent can depend on another Agent's interaction API by referencing its API Resource in an Integration Dependency.

Here's an example of an Integration Dependency for an agent that depends on a specific set of MCP tools.
Without `subset`, the dependency would imply access to all operations of the referenced resource:

```json
{
  "integrationDependencies": [
    {
      "ordId": "foo.app1:integrationDependency:DisputeAgent-mcpDeps:v1",
      "title": "MCP Tool Dependencies for Dispute Agent",
      "shortDescription": "MCP tools required by the Dispute Agent at runtime.",
      "mandatory": true,
      "releaseStatus": "active",
      "partOfPackage": "sap.foo:package:MyPackage:v1",
      "aspects": [
        {
          "apiResources": [
            {
              "ordId": "foo.app2:apiResource:DisputeToolsMCPServer:v1",
              "subset": [
                { "operationId": "searchDisputeCases" },
                { "operationId": "getDisputeDetails" },
                { "operationId": "updateDisputeStatus" }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

## Agent-Owned Relationships

An Agent can declare two additional, typed relationships using ORD's existing
`{ ordId, relationType }` pattern. The target kind is fixed by the property: a
Capability for `relatedCapabilities`, or an Agent for `relatedAgents`.

### Implemented Capabilities

Use `relatedCapabilities` with `ord:implementsCapability` to identify a named
ability or feature that the Agent implements. A Capability resource can describe
that ability independently of a particular Agent or interaction API. This lets
catalog consumers ask **which Agents implement this Capability**, including
Agents without an exposed API and multiple Agents with different interfaces.

The same predicate can be used on the existing `Capability.relatedCapabilities`
property when a source Capability, such as a workflow, implements another
Capability's ability. It does not imply identical contracts or lifecycle.

A Capability consumed by an Agent, such as a required skill asset, belongs in its
[Integration Dependencies](./integration-dependency.md). Implementing an ability
and requiring another resource are separate statements.

### Delegation to Another Agent

Use `relatedAgents` with `ord:delegatesTo` when the source Agent delegates a task
or subtask to a particular Agent. Consumers can ask **which specialist this Agent
delegates to** without inferring delegation from an API dependency.

An API dependency establishes an integration requirement; it does not establish
that another Agent receives delegated work. Several Agents may share an API, and
an internal delegate may not expose an interaction API. A delegation declaration
therefore identifies the Agent's role rather than a protocol or operation.

When delegation requires an external interface, continue describing that
requirement through an Integration Dependency. Its API `subset.operationId` and
event `subset.eventType` provide the existing selection detail. A delegation link
does not assert that a runtime connection exists or that a task has executed.

### Example and Publication Ownership

This fictional Agent resource fragment declares an implemented business ability,
a specialist delegation, and a separate integration requirement:

```json
{
  "ordId": "example.procurement:agent:OrderResolution:v1",
  "title": "Order Resolution Agent",
  "version": "1.0.0",
  "visibility": "internal",
  "releaseStatus": "active",
  "partOfPackage": "example.procurement:package:Agents:v1",
  "relatedCapabilities": [
    {
      "ordId": "example.procurement:capability:OrderResolution:v1",
      "relationType": "ord:implementsCapability"
    }
  ],
  "relatedAgents": [
    {
      "ordId": "example.risk:agent:SupplierRisk:v1",
      "relationType": "ord:delegatesTo"
    }
  ],
  "integrationDependencies": [
    "example.procurement:integrationDependency:SupplierRiskAssessment:v1"
  ]
}
```

The Agent's publisher owns these statements about its implementation and behavior.
The referenced Capability, specialist Agent, and required interfaces retain their
own publishers and lifecycle. Their resource descriptions are published separately.

An aggregator can derive reverse navigation, such as “which Agents implement this
Capability?” or “which Agents delegate to this specialist?”. The referenced
resources do not need to publish matching inverse relationships. A reverse query
retains the original source, predicate, and publication context.

Both properties are optional and beta. If `relationType` is omitted, the link means
only “related somehow”; consumers must not infer implementation or delegation.
Custom relation types use Concept IDs and need their own documented meaning.
Schema validation checks target ID kinds and the relationship object shape;
consumers still need to resolve references and apply the predicate's source/target
semantics. Discovery metadata does not grant permission to invoke an Agent.

These relationships complement existing API/Event `exposedEntityTypes`, Agent
`exposedApiResources`, Capability-related APIs/Events, and Integration Dependencies.
They do not introduce parallel concept mappings, generic document-level assertions,
native element selectors, or independently curated claims between external resources.

## AI Hints on ORD Resources

The following ORD resource types support an `aiHint` property: API Resources, Event Resources, Entity Types, Data Products, Agents, and Capabilities.

`aiHint` provides guidance specifically for AI consumers such as LLMs and agent orchestrators, and is intentionally separate from human-facing `description` and `shortDescription` fields so both can evolve independently.

<AiEnrichmentDiagram />

```json
{
  "apiResources": [
    {
      "ordId": "sap.foo:apiResource:DisputeResolutionAgent:v1",
      "title": "Dispute Resolution Agent",
      "description": "Manages dispute cases in the system.",
      "aiHint": "Use this API to **retrieve** and **manage** dispute cases. Prefer structured JSON payloads over free-text fields when invoking tools. Do not call `DELETE /cases/{id}` unless the case status is `closed`."
    }
  ]
}
```

### Why a Separate Field?

Human-readable documentation (`description`, `shortDescription`) is written for end users and developers browsing a catalog. AI-targeted guidance has different concerns — it may include tool-use patterns, LLM-specific caveats, or instructions that would read as noise in standard docs. Keeping these separate lets both evolve independently.

### Best Practices

- **Markdown recommended**: The value SHOULD be written in [CommonMark](https://spec.commonmark.org/) Markdown.
- **Be action-oriented**: Describe *how* to use the resource (verbs, conditions, caveats), not just *what* it is — the `description` already covers that.
- **Keep it focused**: Aim for a short, dense paragraph rather than exhaustive documentation. Link to detailed docs via the `links` property.

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
- Agent-owned Capability implementation links via `relatedCapabilities`
- Agent-owned delegation links via `relatedAgents`
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
