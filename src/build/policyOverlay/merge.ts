// Resolves `extends` inheritance into a single flattened, provenance-tagged rule
// list per policy level.
//
// Algorithm:
//   * ancestry — depth-first over `extends`, de-duplicated in `extends` order,
//     with the level itself appended last. e.g. core extends [base, documentation]
//     and documentation extends [base] => ancestry = [base, documentation, core].
//   * rules — walk the ancestry in order and append each level's OWN rules (because
//     the ancestry is already de-duplicated, taking only OWN rules avoids counting a
//     transitively-shared ancestor twice). A rule whose id already exists is a
//     last-wins override that keeps the inherited rule's position.
//   * conflict — if two ancestors that are incomparable in the ancestry DAG
//     (neither is an ancestor of the other) author the same rule id and the level
//     itself does not override it, the resolution is ambiguous => error. A linear
//     override chain (one contributor extends the other) is resolved by last-wins.
//
// Each resulting rule is tagged `inheritedFrom` ("self" or the authoring policyId).

import type { CompiledRule, PolicyOverlay } from "./types";

export interface MergedLevel {
  overlay: PolicyOverlay;
  /** Resolved ancestry in application order, ending with this level's own policyId. */
  ancestry: string[];
  /** Flattened, inheritance-resolved rules in application order. */
  rules: CompiledRule[];
}

function resolveAncestry(
  policyId: string,
  byPolicyId: Map<string, PolicyOverlay>,
  stack: string[],
  errors: string[],
): string[] {
  const overlay = byPolicyId.get(policyId);
  if (!overlay) return [policyId];

  if (stack.includes(policyId)) {
    errors.push(`extends cycle detected: ${[...stack, policyId].join(" -> ")}`);
    return [policyId];
  }

  const result: string[] = [];
  for (const parent of overlay.extends ?? []) {
    if (!byPolicyId.has(parent)) {
      errors.push(`${policyId}: extends unknown policyId "${parent}".`);
      continue;
    }
    for (const ancestor of resolveAncestry(
      parent,
      byPolicyId,
      [...stack, policyId],
      errors,
    )) {
      if (!result.includes(ancestor)) result.push(ancestor);
    }
  }
  if (!result.includes(policyId)) result.push(policyId);
  return result;
}

/**
 * Flatten every overlay's inheritance into a MergedLevel.
 * Throws a single aggregated Error on cycles, unknown parents, or unresolved id collisions.
 */
export function mergeOverlays(
  byPolicyId: Map<string, PolicyOverlay>,
): Map<string, MergedLevel> {
  const errors: string[] = [];
  const merged = new Map<string, MergedLevel>();

  for (const [policyId, overlay] of byPolicyId) {
    const ancestry = resolveAncestry(policyId, byPolicyId, [], errors);
    const ownIds = new Set(overlay.rules.map((r) => r.id));

    // `a` is an ancestor of `b` when it appears in b's resolved ancestry.
    const isAncestorOf = (a: string, b: string): boolean =>
      a !== b && resolveAncestry(b, byPolicyId, [], []).includes(a);

    // Detect collisions: a rule id authored by more than one ancestor that the
    // level does not override itself. A linear override chain (one contributor is
    // an ancestor of another) is NOT a collision — ancestry-order last-wins
    // resolves it deterministically. Only contributors that are mutually
    // incomparable in the ancestry DAG are a genuine, ambiguous collision.
    const contributorsById = new Map<string, string[]>();
    for (const ancestorId of ancestry) {
      if (ancestorId === policyId) continue;
      const ancestor = byPolicyId.get(ancestorId);
      if (!ancestor) continue;
      for (const rule of ancestor.rules) {
        const list = contributorsById.get(rule.id) ?? [];
        list.push(ancestorId);
        contributorsById.set(rule.id, list);
      }
    }
    for (const [ruleId, contributors] of contributorsById) {
      if (contributors.length <= 1 || ownIds.has(ruleId)) continue;
      // Keep only "maximal" contributors: those no other contributor descends from.
      const maximal = contributors.filter(
        (c) => !contributors.some((other) => isAncestorOf(c, other)),
      );
      if (maximal.length > 1) {
        errors.push(
          `${policyId}: rule id "${ruleId}" is contributed by unrelated parents ` +
            `(${maximal.join(", ")}) with no override in this level.`,
        );
      }
    }

    // Build the flattened rule list. A Map keyed by id preserves the first
    // insertion position while letting later contributors overwrite the value.
    const ordered = new Map<string, CompiledRule>();
    for (const ancestorId of ancestry) {
      const ancestor = byPolicyId.get(ancestorId);
      if (!ancestor) continue;
      const isSelf = ancestorId === policyId;
      for (const rule of ancestor.rules) {
        ordered.set(rule.id, {
          ...rule,
          inheritedFrom: isSelf ? "self" : ancestorId,
          sourceTitle: ancestor.shortTitle,
        });
      }
    }

    merged.set(policyId, { overlay, ancestry, rules: [...ordered.values()] });
  }

  if (errors.length > 0) {
    throw new Error(
      `Policy overlay inheritance failed (${errors.length} error(s)):\n  - ${errors.join("\n  - ")}`,
    );
  }

  return merged;
}
