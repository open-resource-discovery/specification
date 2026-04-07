# Agent Governance

Agent Governance is a model extension for ORD that provides governance metadata for AI agents and MCP servers.

It intentionally separates governance concerns (ownership, verification status) from the core agent/MCP resource description. This allows different teams and systems to manage governance data independently — for example, the team that registers an MCP server in ORD may be different from the team (e.g. SAP AI Agent Hub) that verifies and governs it.

An `AgentGovernance` record references its target resource via `target.ordId` and can be published by a different system than the one that published the original agent or MCP server resource.

> 🚧 **Note:** This extension is currently under development.
