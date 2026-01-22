---
sidebar_position: 5
description: AI Agents and related protocols in ORD.
title: AI Agents and Protocols
---

# AI Agents and Protocols

> 🚧 Please note that the [Agents](../interfaces/Document#agent) concept is still in development.

## Agents

ORD defines a generic **Agent** resource type that can model any autonomous software entity capable of task execution. While this resource type is designed to be flexible enough to describe various types of agents, it primarily aims to model **AI Agents** - intelligent agents distinguished by their integration with Large Language Models (LLMs).

AI agents can interpret natural language, reason about complex scenarios, and operate in conversational mode for human interaction or be system-triggered for automated workflows. They represent the most common and significant use case for the Agent resource type in ORD.

## Relevant API Protocols

### A2A (Agent-to-Agent) Protocol

The [Agent2Agent (A2A) Protocol](https://a2a-protocol.org/latest/) is an open standard that enables seamless communication and collaboration between AI agents. Originally developed by Google and donated to the Linux Foundation, A2A provides a common language for agent interoperability through standardized agent card definitions and interfaces.

### MCP (Model Context Protocol)

The [Model Context Protocol (MCP)](https://modelcontextprotocol.io/docs/getting-started/intro) is an open-source standard for connecting AI applications to external systems. MCP enables AI applications to connect to data sources, tools, and workflows, allowing them to access information and perform tasks beyond their core capabilities.

## Architecture Overview

### Model

![AI Agent Overview](/img/ord-ai-agent.drawio.svg "AI Agent Overview")

Agents are implemented as a dedicated ORD resource type that can model various autonomous software entities. When used for AI agents, they uniquely combine intelligent capabilities with system integration, exposing functionality through conversational interfaces while maintaining optional relationships to traditional API Resources. A key principle is the separation between agent existence as a resource and API exposure, allowing agents to be described and discovered even when they don't expose external APIs directly.

### Key Relationships

**Agent → API Resources:**
- `exposedApiResources` property links to A2A protocol APIs or other agent interfaces
- Optional relationship (agents can exist without external APIs)

**Agent → Integration Dependencies:**
- `integrationDependencies` property for external system requirements
- Models dependencies on LOB APIs, MCP Servers, and tools

**Agent → Entity Types:**
- `relatedEntityTypes` for business object relationships

## Current Status

The AI Agents concept in ORD is currently in **Beta status** and may undergo refinements based on community feedback. Example implementations are available in the ORD specification repository (see `examples/documents/document-agents.json` and `examples/definitions/DisputeResolutionAgentcard.json`).
