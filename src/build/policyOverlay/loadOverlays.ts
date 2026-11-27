// Loads and validates every policy-level overlay YAML file in a directory.
//
// Validation happens in two layers:
//   1. Structural — each file is checked against policy-overlay.schema.json
//      (Ajv 8, JSON Schema 2020-12 dialect).
//   2. Cross-file / semantic invariants Ajv cannot express:
//        * `slug` must equal the file's stem (`sap-core-v1.overlay.yaml` -> "sap-core-v1")
//        * `policyId` must be unique across all files
//        * each `rule.id` must be unique within its own file
//
// Every error found (in any file) is collected and thrown together so authors see
// the full picture in one build run, each message prefixed with the offending file.

import { readFileSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";
import Ajv2020 from "ajv/dist/2020";
import { parse } from "yaml";
import type { PolicyOverlay } from "./types";

const OVERLAY_SUFFIX = ".overlay.yaml";
const SCHEMA_FILE = "policy-overlay.schema.json";

export interface LoadedOverlays {
  /** Parsed overlays, in filename-sorted order. */
  overlays: PolicyOverlay[];
  /** policyId -> overlay lookup. */
  byPolicyId: Map<string, PolicyOverlay>;
}

/**
 * Load, parse and validate all `*.overlay.yaml` files in `dir`.
 * The Ajv schema is read from `policy-overlay.schema.json` in the same directory.
 * Throws a single aggregated Error if anything is wrong.
 */
export function loadOverlays(
  dir = "spec-extension/policy-levels",
): LoadedOverlays {
  const ajv = new Ajv2020({ allErrors: true });
  const schema = JSON.parse(
    readFileSync(join(dir, SCHEMA_FILE), "utf8"),
  ) as object;
  const validate = ajv.compile<PolicyOverlay>(schema);

  const files = readdirSync(dir)
    .filter((f) => f.endsWith(OVERLAY_SUFFIX))
    .sort();

  const errors: string[] = [];
  const overlays: PolicyOverlay[] = [];
  const byPolicyId = new Map<string, PolicyOverlay>();
  // Track which file first claimed each policyId, for a precise duplicate message.
  const policyIdOwner = new Map<string, string>();

  for (const file of files) {
    const stem = basename(file, OVERLAY_SUFFIX);
    let parsed: unknown;
    try {
      parsed = parse(readFileSync(join(dir, file), "utf8"));
    } catch (e) {
      errors.push(`${file}: YAML parse error: ${(e as Error).message}`);
      continue;
    }

    if (!validate(parsed)) {
      for (const err of validate.errors ?? []) {
        errors.push(
          `${file}: ${err.instancePath || "/"} ${err.message ?? "is invalid"}`,
        );
      }
      continue;
    }

    const overlay = parsed as PolicyOverlay;

    // slug must equal the filename stem.
    if (overlay.slug !== stem) {
      errors.push(
        `${file}: slug "${overlay.slug}" must equal the filename stem "${stem}".`,
      );
    }

    // policyId unique across files.
    const previousOwner = policyIdOwner.get(overlay.policyId);
    if (previousOwner) {
      errors.push(
        `${file}: policyId "${overlay.policyId}" already defined in ${previousOwner}.`,
      );
    } else {
      policyIdOwner.set(overlay.policyId, file);
    }

    // rule.id unique within this file.
    const seenRuleIds = new Set<string>();
    for (const rule of overlay.rules) {
      if (seenRuleIds.has(rule.id)) {
        errors.push(`${file}: duplicate rule id "${rule.id}" within the file.`);
      }
      seenRuleIds.add(rule.id);
    }

    overlays.push(overlay);
    if (!byPolicyId.has(overlay.policyId)) {
      byPolicyId.set(overlay.policyId, overlay);
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `Policy overlay validation failed (${errors.length} error(s)):\n  - ${errors.join("\n  - ")}`,
    );
  }

  return { overlays, byPolicyId };
}
