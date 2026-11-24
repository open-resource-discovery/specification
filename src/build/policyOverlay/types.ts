// Shared contract for the Policy-Level Overlay feature.
//
// This file is the single source of truth for the data shapes exchanged between:
//   1. the authored overlay YAML files  (spec-extension/policy-levels/*.overlay.yaml)
//   2. the build/compile step            (src/build/compilePolicyLevels.ts)
//   3. the website consumer              (src/components/PolicyOverlay/*)
//
// Keep this in sync with spec-extension/policy-levels/policy-overlay.schema.json
// (the Ajv schema that validates the authored YAML).

/** Requirement level a policy forces onto a property/definition. Omitted = note-only (keep base badge). */
export type Requirement =
  | "mandatory"
  | "recommended"
  | "optional"
  | "forbidden" // MUST NOT
  | "conditional"; // keep base badge, note explains the condition

/** Docusaurus admonition style used when rendering a note callout. */
export type Admonition = "note" | "tip" | "info" | "warning" | "danger";

/** Which part of the spec a rule attaches to. */
export type RuleScope =
  | "property" // targets explicit property anchor id(s): drives row badge + inline note
  | "propertyName" // targets every <def>_<name> anchor: drives row badge only; detail shown in panel
  | "definition" // attaches to a definition heading (### section)
  | "general"; // not bound to a property: prose page + summary panel only

export interface RuleTable {
  caption?: string;
  columns: string[];
  rows: string[][];
}

export interface RuleLink {
  text: string;
  href: string;
}

/** A rule as authored in an overlay YAML file. */
export interface OverlayRule {
  /** Unique within the merged (inheritance-resolved) rule set. Convention: <defslug>.<prop>.<what>. */
  id: string;
  scope: RuleScope;
  /** Badge to force. Omit for note-only. */
  requirement?: Requirement;

  // --- targeting: exactly one form, matching `scope` ---
  /** scope: property — explicit anchor ids, e.g. "api-resource_extensible". */
  targets?: string[];
  /** scope: propertyName — property names, e.g. ["title","shortDescription"]; expanded by the build. */
  propertyNames?: string[];
  /** scope: propertyName — anchor ids to drop from the expanded set (e.g. ["package_title"] when a definition has its own override rule). */
  excludeTargets?: string[];
  /** scope: definition — definition heading slugs, e.g. ["entity-type"]. */
  definitions?: string[];

  /** Optional grouping heading (mainly for `general` rules), e.g. "General Policies". */
  section?: string;

  // --- content ---
  title: string;
  /** CommonMark body of the note/bullet. */
  note: string;
  admonition?: Admonition;
  /** Human-readable condition for `conditional` rules, e.g. "visibility is public or internal". */
  appliesWhen?: string;
  links?: RuleLink[];
  tables?: RuleTable[];
  /** Caveats, e.g. "link titles" for "all title values (except link titles)". */
  exceptions?: string[];
}

/** A whole policy level as authored in one overlay YAML file. */
export interface PolicyOverlay {
  /** Canonical Specification-ID form, e.g. "sap:core:v1". Unique across files. Switcher value. */
  policyId: string;
  /** Must equal the filename stem, e.g. "sap-core-v1". Used for the page path and ?policy= value. */
  slug: string;
  title: string;
  /** Short label shown in the switcher dropdown, e.g. "SAP Core v1". */
  shortTitle: string;
  /** Page frontmatter description. */
  description: string;
  sidebarPosition: number;
  status: "active" | "draft";
  /** CommonMark lead paragraph rendered as the page "## Description" and in the panel. */
  summary: string;
  /** Ordered list of parent policyIds, merged before this level's own rules. */
  extends?: string[];
  rules: OverlayRule[];
}

// ---------------------------------------------------------------------------
// Compiled output: src/generated/policy-levels.json
// Pre-indexed so the client does O(1) lookups and zero inheritance math.
// ---------------------------------------------------------------------------

/** A rule after inheritance resolution, carrying provenance. */
export interface CompiledRule extends OverlayRule {
  /** policyId of the level that authored this rule, or "self". */
  inheritedFrom: string;
  /** shortTitle of the authoring level (e.g. "SAP Base v1"), resolved for display. */
  sourceTitle: string;
}

export interface CompiledLevel {
  policyId: string;
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  sidebarPosition: number;
  status: "active" | "draft";
  summary: string;
  extends: string[];
  /** Full resolved ancestry in application order, ending with this level's own policyId. */
  ancestry: string[];

  /** Badge to force per property-row anchor id. From `property`-scope rules only (genuine presence changes). */
  badgeByAnchor: Record<string, Requirement>;
  /**
   * Inline note callouts to inject under a property row, keyed by anchor id.
   * Includes `property`-scope rules and every expanded `propertyName`-scope rule,
   * so a requirement authored for e.g. "title" renders in place at every title row.
   */
  noteRulesByAnchor: Record<string, CompiledRule[]>;
  /** Note callouts to inject under a definition `###` heading, keyed by definition slug. */
  definitionRules: Record<string, CompiledRule[]>;
  /**
   * Document-wide (`general`) rules, in order. The UI injects these at the root
   * "Ord Document" section (their natural in-place home); the prose page lists them too.
   */
  generalRules: CompiledRule[];
}

export interface PolicyLevelsData {
  /** policyIds in display order (by sidebarPosition). */
  order: string[];
  levels: Record<string, CompiledLevel>;
}
