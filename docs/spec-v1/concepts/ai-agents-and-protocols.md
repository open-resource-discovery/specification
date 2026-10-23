---
sidebar_position: 5
description: AI Agents and related protocols in ORD.
title: AI Agents and Protocols
---

import { AgentConnectivityDiagram, AgentExampleDiagram, AiEnrichmentDiagram } from "@site/src/components/OrdDiagrams";

# AI Agents and Protocols

> The [Agent](../interfaces/Document#agent) model contains <span className="feature-status-beta">BETA</span> properties and may evolve.

Related slides: [Interaction and dependencies](https://open-resource-discovery.github.io/presentation/ai-discovery) · [Relationship model](https://open-resource-discovery.github.io/presentation/agent-model) · [Skills and plugins](https://open-resource-discovery.github.io/presentation/skills-preview) · [AI enrichment](https://open-resource-discovery.github.io/presentation/ai-enrichment).

## Agents

An [Agent](../interfaces/Document#agent) is an **autonomous software entity** capable of task execution, described through metadata that can be accessed through a central catalog ([ORD Aggregator](../index.md#ord-aggregator)).

To understand how Agents fit into the ORD landscape, it is helpful to distinguish between their abstract definition and their technical realization.

In ORD, an **Agent** is primarily a conceptual, "product-like" entity, similar to a [Data Product](./data-product.md).
It represents a distinct capability or functional unit that can be discovered, understood, and managed independent of its specific deployment or invocation mechanism.

### Key Characteristics

-   **Generic vs. AI Agents:** ORD defines a generic Agent resource type representing any autonomous software entity capable of task execution.
    An Agent in ORD is not necessarily an AI Agent; the concept is broad enough to cover rule-based automation, legacy bots, and other autonomous systems.
-   **Primary Use Case:** The design focus is currently on **AI Agents**—intelligent systems often integrated with Large Language Models (LLMs) that can interpret natural language, reason about complex scenarios, and operate in conversational mode or automated workflows.
-   **Metadata Focus:** The Agent resource focuses on high-level metadata: ownership, intended use cases (e.g., "Order Fulfillment"), constraints, and capabilities.
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

The **Fulfillment Agent** exposes an A2A interaction API and declares requirements on external order tools, Order Created events, and optional order-assistance skills or plugins.
Skills and plugins can also declare their own requirements, such as reading order details through an MCP API.

<AgentExampleDiagram />

The central Integration Dependency box represents the shared concept.
The JSON examples below use separate dependencies for the Agent and the skill/plugin. Each provider describes its own integration requirements.
All snippets are excerpts from the [complete example documents](#example). After the Agent example, repeated generic metadata is omitted to focus on each relationship.

```json
{
  "agents": [
    {
      "ordId": "sap.foo:agent:fulfillmentAgent:v1",
      "title": "Fulfillment Agent",
      "version": "1.0.0",
      "releaseStatus": "active",
      "visibility": "public",
      "partOfPackage": "sap.foo:package:fulfillment:v1",
      "shortDescription": "Coordinates order fulfillment using external order tools, events, and optional skills",
      "description": "Processes new orders, checks their details, and updates fulfillment status. Can use an external skill to summarize an order.",
      "partOfProducts": ["sap.foo:product:Fulfillment:"],
      "relatedEntityTypes": ["foo.orders:entityType:Order:v1"],
      "exposedApiResources": [{"ordId": "sap.foo:apiResource:FulfillmentAgent:v1"}],
      "integrationDependencies": [
        "sap.foo:integrationDependency:OrderProcessing:v1",
        "sap.foo:integrationDependency:OrderAssistance:v1"
      ],
      "partOfGroups": ["sap.foo:process:sap.foo:Fulfillment"],
      "labels": {"sap.ai:interactionMode": ["conversational", "system-triggered"]},
      "tags": ["orders", "fulfillment", "ai-agent"]
    }
  ]
}
```

Key aspects of this example:
- **`ordId`**: A stable design-time identifier for the agent; runtime identity also needs the [system-instance context](../index.md#ord-id)
- **`exposedApiResources`**: Links to the API(s) through which the agent can be invoked (e.g., an A2A API)
- **`integrationDependencies`**: Declares what external resources the agent requires to function
- **`relatedEntityTypes`**: Documents which domain business entities the agent operates on
- **`labels`**: Extensible key-value pairs for additional metadata like LLM models used

## Connectivity & Protocols

The ORD Agent resource acts as a central hub that connects to other ORD concepts to define how to interact with it and what it needs to function.

ORD supports the discovery of **AI-Native Protocols**.
These are API protocols specifically designed for simple consumption by LLMs and AI Agents, well-supported by the emerging AI ecosystem, and optimized for this use case.

<AgentConnectivityDiagram />

The relationship model adds ownership, domain context, and cardinalities to the example above.
Both Agents and Capabilities, notably `agent-skill` capabilities, can declare `integrationDependencies` using the same mechanism.
Each Integration Dependency groups one or more aspects referencing API Resources, Event Resources, Capabilities, or system types.

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
      "ordId": "sap.foo:apiResource:FulfillmentAgent:v1",
      "title": "Fulfillment Agent Interaction API",
      "apiProtocol": "a2a",
      "resourceDefinitions": [
        {
          "type": "a2a-agent-card",
          "mediaType": "application/json",
          "url": "/definitions/FulfillmentAgentcard.json",
          "accessStrategies": [{"type": "open"}]
        }
      ],
      "exposedEntityTypes": [{"ordId": "foo.orders:entityType:Order:v1"}]
    }
  ]
}
```

The `resourceDefinitions` with type `a2a-agent-card` points to the full A2A Agent Card, which contains detailed capability information like skills, input/output modes, and security schemes.

### Consuming Capabilities (Dependencies)

Agents rarely work in isolation.
They often need to access real-world data, invoke business functions, or load reusable skills.
All of this is modeled using **[Integration Dependencies](../interfaces/Document#integration-dependency)**, which declare what external resources an agent requires to function.

-   **MCP (Model Context Protocol):** A common pattern is for an Agent to depend on an [MCP Server](https://modelcontextprotocol.io/docs/getting-started/intro).
    The Integration Dependency declares this requirement, allowing the runtime environment to provision the necessary connections to data sources and tools.
    When only a subset of tools is needed, the `subset` field narrows the dependency to the exact operations required (using the MCP tool's `name` as `operationId`).
    This lets an agent runtime load only the relevant tool descriptions and use the declared subset when configuring permissions.
    Declaring a subset does not grant access; runtime authentication and authorization remain separate concerns.
-   **Skills (`capabilities`):** Agents can depend on [Agent Skills](../interfaces/Document#capability) represented as Capabilities with `type: "agent-skill"`.
    Declaring the skill dependency allows a runtime to load it on demand and makes the dependency discoverable in the catalog.
-   **Other Resources:** Agents are not limited to AI-native protocols.
    They can also depend on any other [ORD resource](../index.md#ord-resource), such as **[API Resources](../interfaces/Document#api-resource)** (REST, OData, GraphQL) or **[Event Resources](../interfaces/Document#event-resource)**, to interact with existing business systems.
-   **Agent Chaining:** An Agent can depend on another Agent's interaction API by referencing its API Resource in an Integration Dependency.

The Fulfillment Agent's `OrderProcessing` dependency requires both selected MCP tools and Order Created events.
Its two mandatory aspects combine with AND. Without `subset`, the API reference covers all operations of that resource:

```json
{
  "integrationDependencies": [
    {
      "ordId": "sap.foo:integrationDependency:OrderProcessing:v1",
      "title": "Order Processing Integration",
      "mandatory": true,
      "aspects": [
        {
          "description": "Read orders and update their fulfillment status",
          "mandatory": true,
          "apiResources": [
            {
              "ordId": "foo.orders:apiResource:OrderToolsMCPServer:v1",
              "subset": [
                {"operationId": "searchOrders"},
                {"operationId": "getOrder"},
                {"operationId": "updateFulfillmentStatus"}
              ]
            }
          ]
        },
        {
          "description": "React to newly created orders",
          "mandatory": true,
          "eventResources": [{"ordId": "foo.orders:eventResource:OrderCreated:v1"}]
        }
      ]
    }
  ]
}
```

## Agent Skills, Plugins, and Workflows

ORD 1.17 standardizes Agent Skills, Agent Plugins, and Workflows as discoverable Capability types. Capabilities can also describe custom behavior.

### Agent Skills as Capabilities

Agent skills are discrete, reusable capabilities that agents can perform and may package instructions, scripts, and resources.
In ORD, these are modeled using the **[Capability](../interfaces/Document#capability)** resource type with `type: "agent-skill"`.
ORD treats skill and plugin archives as opaque, format-neutral artifacts and does not prescribe their internal layout or format version.
An `agent-skill` capability does not need to provide a definition.
If it provides one, `agent-skill-zip` is the RECOMMENDED definition type.
Capability publishers are RECOMMENDED to include the capability type in the ORD ID to prevent accidental collisions between different capability types.
They can use a sub-context namespace, as in the skill example below, or a suffix in the local identifier, as in the plugin example.

This enables:

- **Discovery:** Agents can discover and load skills on-demand through the catalog
- **Reusability:** Skills can be shared across multiple agents and systems
- **Dependency Management:** Both agents and skills can declare `integrationDependencies` on API Resources, Event Resources, or Capabilities (see [Skill Dependencies](#skill-dependencies) below).

**Example agent skill:**

```json
{
  "capabilities": [
    {
      "ordId": "foo.bar.skill:capability:orderSummarization:v1",
      "title": "Order Summarization Skill",
      "type": "agent-skill",
      "integrationDependencies": ["foo.bar:integrationDependency:OrderLookup:v1"],
      "definitions": [
        {
          "type": "agent-skill-zip",
          "mediaType": "application/zip",
          "url": "/capabilities/orderSummarization/skill.zip",
          "accessStrategies": [{"type": "open"}]
        }
      ]
    }
  ]
}
```

**Consuming agent skills:**

The Agent's optional `OrderAssistance` dependency offers two alternatives in one aspect: the standalone Order Summarization Skill, or the same named skill from the Order Management Plugin.
The skill and plugin are published by a separate provider:

```json
{
  "integrationDependencies": [
    {
      "ordId": "sap.foo:integrationDependency:OrderAssistance:v1",
      "title": "Order Assistance Integration",
      "mandatory": false,
      "aspects": [
        {
          "description": "Use either the standalone skill or the named skill in the plugin",
          "mandatory": true,
          "capabilities": [
            {"ordId": "foo.bar.skill:capability:orderSummarization:v1"},
            {
              "ordId": "foo.bar:capability:orderManagementPlugin:v1",
              "subset": [{"skillName": "orderSummarization"}]
            }
          ]
        }
      ]
    }
  ]
}
```

### Skill Dependencies

A Capability of type `agent-skill` can itself declare `integrationDependencies`, using the same mechanism as Agents and analogous to `inputPorts` on [Data Products](./data-product.md).

```json
{
  "integrationDependencies": [
    {
      "ordId": "foo.bar:integrationDependency:OrderLookup:v1",
      "title": "Order Lookup Integration",
      "mandatory": true,
      "aspects": [
        {
          "description": "Retrieve the order details to summarize",
          "mandatory": true,
          "apiResources": [
            {
              "ordId": "foo.orders:apiResource:OrderToolsMCPServer:v1",
              "subset": [{"operationId": "getOrder"}]
            }
          ]
        }
      ]
    }
  ]
}
```

The Order Summarization Skill and Order Management Plugin both reference `foo.bar:integrationDependency:OrderLookup:v1` through their own `integrationDependencies` (see their definitions above and below).
This dependency requires only the `getOrder` MCP tool.
The [example diagram](#agent-example) shows this same dependency mechanism on both Agents and Capabilities.

### Agent Plugins as Capabilities

Where an `agent-skill` describes a single discrete capability, an **agent plugin** bundles multiple agent resources (such as one or more agent skills) into a single, distributable package.
In ORD, plugins are modeled using the **[Capability](../interfaces/Document#capability)** resource type with `type: "agent-plugin"`.
An `agent-plugin` capability does not need to provide a definition.
If it provides one, `agent-plugin-zip` is the RECOMMENDED definition type.

This enables:

- **Distribution:** A set of related skills and assets can be discovered, versioned, and installed as one unit.
- **Reusability:** A plugin can be shared across multiple agents and systems, just like individual skills.
- **Dependency Management:** Like `agent-skill`, an `agent-plugin` can declare `integrationDependencies` on API Resources, Event Resources, or Capabilities (see [Skill Dependencies](#skill-dependencies) above).

When the bundle is referenced through a capability definition of type `agent-plugin-zip`, it is a ZIP archive (`mediaType: "application/zip"`) that packages the plugin's skills and assets together.
ORD intentionally remains format-neutral for plugin bundles.
It treats the archive as opaque and does not prescribe its internal layout or format version; package-format identification, versioning, and interpretation remain the responsibility of the producer and consumer.

**Depending on a plugin:**

Like any capability, an `agent-plugin` can be referenced from an Integration Dependency aspect (via `capabilities`). By default such a dependency is **coarse-grained**: it targets the plugin as a whole, so the consuming agent installs the entire plugin.

To narrow this down, a capability reference MAY carry a `subset` listing the specific skills within the plugin that are actually required (analogous to `subset` on `apiResources`/`eventResources`). The capability reference in the `OrderAssistance` aspect above selects the named skill:

```json
{
  "ordId": "foo.bar:capability:orderManagementPlugin:v1",
  "subset": [{"skillName": "orderSummarization"}]
}
```

The `skillName` values are names understood within the plugin bundle itself; ORD does not prescribe the bundle's internal layout (see above).

**Example agent plugin:**

```json
{
  "capabilities": [
    {
      "ordId": "foo.bar:capability:orderManagementPlugin:v1",
      "title": "Order Management Plugin",
      "type": "agent-plugin",
      "integrationDependencies": ["foo.bar:integrationDependency:OrderLookup:v1"],
      "definitions": [
        {
          "type": "agent-plugin-zip",
          "mediaType": "application/zip",
          "url": "/capabilities/orderManagementPlugin/plugin.zip",
          "accessStrategies": [{"type": "open"}]
        }
      ]
    }
  ]
}
```

### Workflows as Capabilities

A Capability with `type: "workflow"` describes an executable, multi-step workflow that orchestrates one or more APIs.
It can link an Arazzo document through a definition of type `arazzo-v1`.
Workflow Capabilities SHOULD list the API Resources they interact with in `relatedApiResources`, using `relationType: "ord:orchestrates"`.

The Fulfillment Workflow in the application example orchestrates the Agent's interaction API:

```json
{
  "capabilities": [
    {
      "ordId": "sap.foo:capability:fulfillmentWorkflow:v1",
      "title": "Fulfillment Workflow",
      "type": "workflow",
      "relatedApiResources": [
        {
          "ordId": "sap.foo:apiResource:FulfillmentAgent:v1",
          "relationType": "ord:orchestrates"
        }
      ],
      "definitions": [
        {
          "type": "arazzo-v1",
          "mediaType": "application/yaml",
          "url": "/definitions/fulfillment.arazzo.yaml",
          "accessStrategies": [
            {
              "type": "open"
            }
          ]
        }
      ]
    }
  ]
}
```

## AI Hints on ORD Resources

The following ORD resource types support an `aiHint` property: API Resources, Event Resources, Entity Types, Data Products, Agents, and Capabilities.

`aiHint` provides guidance specifically for AI consumers such as LLMs and agent orchestrators, and is intentionally separate from human-facing `description` and `shortDescription` fields so both can evolve independently.

<AiEnrichmentDiagram />

```json
{
  "apiResources": [
    {
      "ordId": "sap.foo:apiResource:FulfillmentAgent:v1",
      "title": "Fulfillment Agent Interaction API",
      "description": "Accepts fulfillment requests and returns task progress and outcomes.",
      "aiHint": "Provide the order ID when requesting fulfillment. Check the task outcome before retrying a request that changes fulfillment status."
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
- Extensibility via `labels` and `tags` for evolving properties

### Extensibility Approach

Given the rapidly evolving AI ecosystem, ORD takes a conservative approach to adding new properties:

-   **[Groups](./grouping-and-bundling.md#groups):** The recommended mechanism for adding taxonomy to agents.
    Groups allow defining custom **Group Types** (e.g., "LLM Model", "Process Area") and assigning agents to specific groups.
    This approach is more structured and governed than labels, supporting both global taxonomies and application-specific groupings.
    For example, an agent could be assigned to an LLM model group like `sap.aicore:llmModel:sap.aicore:anthropic--claude-3.7-sonnet`.
-   **Labels:** For simpler key-value metadata that is still being validated, labels can be used.
    This allows for experimentation without committing to a stable schema.
-   **Tags:** Free-form tags for folksonomy-style categorization (e.g., `["orders", "fulfillment", "ai-agent"]`).

## Example

The walkthrough uses two ORD Documents, each describing its own provider:

- [Fulfillment application](../examples/document-agents): the Agent, its interaction API, an orchestrating Workflow Capability, and its dependencies on external resources.
- [Order Assistance provider](../examples/document-agent-capabilities): the reusable skill and plugin, including their own Order Lookup dependency.

Both documents reference `foo.orders:apiResource:OrderToolsMCPServer:v1`; the Fulfillment application also references `foo.orders:eventResource:OrderCreated:v1` and `foo.orders:entityType:Order:v1`.
These resources belong to an external Orders provider and are intentionally referenced rather than redefined by either consumer.
The [Fulfillment Agent Card](https://github.com/open-resource-discovery/specification/blob/main/examples/definitions/FulfillmentAgentcard.json) describes the A2A interaction contract; its protocol-level skills are distinct from ORD `agent-skill` Capabilities.
