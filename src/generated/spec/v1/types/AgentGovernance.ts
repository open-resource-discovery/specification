// AUTO-GENERATED definition files. Do not modify directly.

/**
 * Agent Governance is a model extension for ORD that provides governance metadata for AI agents and MCP servers.
 *
 * It intentionally separates governance concerns (ownership, verification status) from the core agent/MCP
 * resource description. This allows different teams and systems to manage governance data independently —
 * for example, the team that registers an MCP server in ORD is different from the team (e.g. SAP AI Agent Hub)
 * that verifies and governs it.
 *
 * An `AgentGovernance` record references its target resource via `target.ordId` and can be published
 * by a different system than the one that published the original agent or MCP server resource.
 */
export interface AgentGovernance {
  /**
   * Optional [URL](https://tools.ietf.org/html/rfc3986) to the Agent Governance schema (defined as a JSON Schema).
   * If provided, this enables code intelligence and validation in supported editors (like VSCode) and tools.
   */
  $schema?: (string | "https://open-resource-discovery.org/spec-extension/v1/AgentGovernance.schema.json") & string;
  /**
   * Version of the Agent Governance specification used to describe this record.
   */
  agentGovernance: "0.1";
  /**
   * Unique [ORD ID](../../spec-v1/index.md#ord-id) for this Agent Governance record.
   *
   * The resource type segment MUST be `agentGovernance`.
   */
  ordId: string;
  /**
   * Optional, but RECOMMENDED indicator when (date-time) the last change to the resource (including its definitions) happened.
   *
   * The date format MUST comply with [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339#section-5.6).
   *
   * When retrieved from an ORD aggregator, `lastUpdate` will be reliable there and reflect either the provider based update time or the aggregator processing time.
   * Therefore consumers MAY rely on it to detect changes to the metadata and the attached resource definition files.
   *
   * If the resource has attached definitions, either the `version` or `lastUpdate` property MUST be defined and updated to let the ORD aggregator know that they need to be fetched again.
   *
   * Together with `perspectives`, this property SHOULD be used to optimize the metadata crawling process of the ORD aggregators.
   */
  lastUpdate?: string;
  target: AgentGovernanceTarget;
  mainContact?: MainContact;
  /**
   * Indicates whether this agent or MCP server has been verified and approved for use.
   *
   * This flag is set by the AI Agent Hub. Consumers such as Integration Suite and the
   * Agent Gateway can use this flag to filter which agents are allowed to run in
   * production environments.
   */
  verified?: boolean;
  /**
   * Indicates whether mining has been activated for this agent or MCP server.
   *
   * This flag is set by the AI Agent Hub alongside `verified`. While `verified` indicates
   * approval for use, `miningActivated` controls whether the agent's usage data is actively
   * collected and analyzed.
   */
  miningActivated?: boolean;
}
/**
 * The resource this governance record applies to.
 *
 * This can reference an [Agent](../../spec-v1/interfaces/Document.md#agent) resource
 * or an [API Resource](../../spec-v1/interfaces/Document.md#api-resource) of type MCP server.
 */
export interface AgentGovernanceTarget {
  /**
   * [ORD ID](../../spec-v1/index.md#ord-id) of the governed agent or MCP server.
   */
  ordId: string;
}
/**
 * The main contact responsible for this agent or MCP server from a governance perspective.
 *
 * This is a customer-side contact — the person an Enterprise Architect can reach out to
 * when reviewing agents in the SAP AI Agent Hub. It is NOT the SAP IP owner of the agent.
 *
 * - For **SAP Standard agents**: set by the IT Admin during provisioning in SAP for Me.
 * - For **custom agents**: defaults to the person who deployed the agent.
 *
 * A single contact is used for Phase 1 . A more detailed split into
 * `technicalOwner` and `businessOwner` is planned for a future version.
 *
 * Required for EU AI Act compliance, incident response, and cost allocation.
 */
export interface MainContact {
  /**
   * Full name of the main contact person.
   */
  name?: string;
  /**
   * Email address of the main contact person.
   *
   * This is the most critical field — if only one attribute can be captured, it MUST be this one.
   */
  contactEmail: string;
}
