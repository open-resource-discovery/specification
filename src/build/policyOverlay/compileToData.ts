// Turns the merged (inheritance-resolved) rule lists into the pre-indexed
// CompiledLevel structures written to src/generated/policy-levels.json, so the
// website consumer does O(1) lookups and zero inheritance math at runtime.
//
// This is also the anchor-integrity gate: every property/definition/propertyName
// target is validated against the AnchorUniverse derived from the real schema +
// Document.md. Any dangling target across any level fails the whole build with a
// single, enumerated error.

import type { AnchorUniverse } from "./anchors";
import type { MergedLevel } from "./merge";
import type { CompiledLevel, CompiledRule, Requirement } from "./types";

interface DanglingTarget {
  policyId: string;
  ruleId: string;
  badTarget: string;
}

function pushRule(
  map: Record<string, CompiledRule[]>,
  key: string,
  rule: CompiledRule,
): void {
  const list = map[key] ?? [];
  list.push(rule);
  map[key] = list;
}

/**
 * Compile every merged level into a CompiledLevel. Collects every dangling target
 * across every level and throws a single error listing {policyId, ruleId, badTarget}.
 */
export function compileToData(
  merged: Map<string, MergedLevel>,
  anchors: AnchorUniverse,
): Map<string, CompiledLevel> {
  const compiled = new Map<string, CompiledLevel>();
  const dangling: DanglingTarget[] = [];
  const seenDangling = new Set<string>();

  const reportDangling = (
    policyId: string,
    ruleId: string,
    badTarget: string,
  ): void => {
    const key = `${policyId}|${ruleId}|${badTarget}`;
    if (seenDangling.has(key)) return;
    seenDangling.add(key);
    dangling.push({ policyId, ruleId, badTarget });
  };

  for (const [policyId, level] of merged) {
    const badgeByAnchor: Record<string, Requirement> = {};
    const noteRulesByAnchor: Record<string, CompiledRule[]> = {};
    const definitionRules: Record<string, CompiledRule[]> = {};
    const generalRules: CompiledRule[] = [];
    const propertyNameGroups: CompiledRule[] = [];
    const constraintAnchorSet = new Set<string>();
    const seenPropertyNameRuleIds = new Set<string>();

    for (const rule of level.rules) {
      switch (rule.scope) {
        case "property": {
          for (const target of rule.targets ?? []) {
            if (!anchors.propertyAnchors.has(target)) {
              reportDangling(policyId, rule.id, target);
              continue;
            }
            if (rule.requirement) badgeByAnchor[target] = rule.requirement;
            pushRule(noteRulesByAnchor, target, rule);
          }
          break;
        }
        case "propertyName": {
          for (const name of rule.propertyNames ?? []) {
            const expanded = anchors.propertyNameIndex.get(name);
            if (!expanded) {
              reportDangling(policyId, rule.id, name);
              continue;
            }
            // propertyName rules are VALUE-format constraints, not presence
            // requirements, so they do NOT drive the OPTIONAL/MANDATORY presence
            // badge (that would misleadingly render a required property as e.g.
            // OPTIONAL). Instead they mark affected rows; detail lives in the panel.
            for (const anchor of expanded) constraintAnchorSet.add(anchor);
          }
          if (!seenPropertyNameRuleIds.has(rule.id)) {
            seenPropertyNameRuleIds.add(rule.id);
            propertyNameGroups.push(rule);
          }
          break;
        }
        case "definition": {
          for (const def of rule.definitions ?? []) {
            if (!anchors.definitionAnchors.has(def)) {
              reportDangling(policyId, rule.id, def);
              continue;
            }
            pushRule(definitionRules, def, rule);
          }
          break;
        }
        case "general": {
          generalRules.push(rule);
          break;
        }
        default:
          break;
      }
    }

    compiled.set(policyId, {
      policyId: level.overlay.policyId,
      slug: level.overlay.slug,
      title: level.overlay.title,
      shortTitle: level.overlay.shortTitle,
      description: level.overlay.description,
      sidebarPosition: level.overlay.sidebarPosition,
      status: level.overlay.status,
      summary: level.overlay.summary,
      extends: level.overlay.extends ?? [],
      ancestry: level.ancestry,
      badgeByAnchor,
      constraintAnchors: [...constraintAnchorSet],
      noteRulesByAnchor,
      definitionRules,
      generalRules,
      propertyNameGroups,
    });
  }

  if (dangling.length > 0) {
    const lines = dangling.map(
      (d) =>
        `${d.policyId} / rule "${d.ruleId}" -> unknown target "${d.badTarget}"`,
    );
    throw new Error(
      `Policy overlay anchor check failed (${dangling.length} dangling target(s)):\n  - ${lines.join("\n  - ")}`,
    );
  }

  return compiled;
}
