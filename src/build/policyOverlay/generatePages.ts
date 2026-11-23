// Regenerates the human-readable prose page for each policy level from its OWN
// (non-inherited) rules plus its summary. These pages live at
// docs/spec-extensions/policy-levels/<slug>.md and are fully overwritten here, so
// each gets an AUTO-GENERATED banner warning authors to edit the overlay instead.
//
// Layout (mirrors the hand-written pages this replaces):
//   frontmatter (title / description / sidebar_position)
//   # <title>            (+ DRAFT span when status: draft)
//   ## Description       (from summary)
//   ## <section>         rules grouped by rule.section (first-seen order), where
//   ### <rule.title> ... `section` defaults to "General Policies" for general rules
//                        and "Context Specific Policies" for the other scopes.

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import type { OverlayRule, PolicyOverlay, RuleTable } from "./types";

const DRAFT_SPAN =
  '<span className="feature-status-draft" title="This feature is in DRAFT status and subject to potential changes.">DRAFT</span>';

const DEFAULT_SECTION = "General Policies";
const CONTEXT_SECTION = "Context Specific Policies";

function renderTable(table: RuleTable): string {
  const parts: string[] = [];
  if (table.caption) parts.push(`_${table.caption}_\n`);
  parts.push(`| ${table.columns.join(" | ")} |`);
  parts.push(`| ${table.columns.map(() => "---").join(" | ")} |`);
  for (const row of table.rows) {
    parts.push(`| ${row.join(" | ")} |`);
  }
  return parts.join("\n");
}

/** Render a rule's body (everything under its heading): note, condition, tables, links. */
function renderRuleBody(rule: OverlayRule): string {
  const blocks: string[] = [rule.note.trim()];
  if (rule.appliesWhen) blocks.push(`_Applies when: ${rule.appliesWhen}_`);
  for (const table of rule.tables ?? []) blocks.push(renderTable(table));
  if (rule.links && rule.links.length > 0) {
    blocks.push(rule.links.map((l) => `- [${l.text}](${l.href})`).join("\n"));
  }
  return blocks.join("\n\n");
}

function renderRule(rule: OverlayRule): string {
  return `### ${rule.title}\n\n${renderRuleBody(rule)}`;
}

function renderPage(overlay: PolicyOverlay): string {
  const out: string[] = [];

  // Frontmatter — JSON-quote strings so colons/quotes stay valid YAML scalars.
  out.push(
    [
      "---",
      `title: ${JSON.stringify(overlay.title)}`,
      `description: ${JSON.stringify(overlay.description)}`,
      `sidebar_position: ${overlay.sidebarPosition}`,
      "---",
    ].join("\n"),
  );

  out.push(
    `{/* AUTO-GENERATED from spec-extension/policy-levels/${overlay.slug}.overlay.yaml — do not edit */}`,
  );

  const draftSuffix = overlay.status === "draft" ? ` ${DRAFT_SPAN}` : "";
  out.push(`# ${overlay.title}${draftSuffix}`);

  out.push(`## Description\n\n${overlay.summary.trim()}`);

  // Group ALL rules by section (first-seen order). `section` is honored for every
  // scope; general rules fall back to "General Policies" and the other scopes to
  // "Context Specific Policies". This keeps a rule's authored section grouping
  // (e.g. documentation's "Title Constraints") and prevents a general rule whose
  // section is "Context Specific Policies" from emitting a duplicate H2.
  const sectionOrder: string[] = [];
  const bySection = new Map<string, OverlayRule[]>();
  for (const rule of overlay.rules) {
    const fallback =
      rule.scope === "general" ? DEFAULT_SECTION : CONTEXT_SECTION;
    const section = rule.section ?? fallback;
    if (!bySection.has(section)) {
      bySection.set(section, []);
      sectionOrder.push(section);
    }
    bySection.get(section)?.push(rule);
  }
  for (const section of sectionOrder) {
    const rules = bySection.get(section) ?? [];
    out.push(`## ${section}\n\n${rules.map(renderRule).join("\n\n")}`);
  }

  return `${out.join("\n\n")}\n`;
}

/** Regenerate the prose page for every overlay into `dir`. */
export function generatePages(
  overlays: PolicyOverlay[],
  dir = "docs/spec-extensions/policy-levels",
): string[] {
  const written: string[] = [];
  for (const overlay of overlays) {
    const path = join(dir, `${overlay.slug}.md`);
    writeFileSync(path, renderPage(overlay));
    written.push(path);
  }
  return written;
}
