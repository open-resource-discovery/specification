// Orchestrates the policy-level compile/validate/generate build step.
//
// Pipeline:
//   1. Build the AnchorUniverse from the generated Document.md + Document.schema.json.
//   2. Load + schema-validate every overlay YAML (+ cross-file invariants).
//   3. Resolve `extends` inheritance into flattened, provenance-tagged rule lists.
//   4. Compile into pre-indexed CompiledLevels (fails on any dangling anchor target).
//   5. Write src/generated/policy-levels.json (PolicyLevelsData).
//   6. Regenerate the prose page for each level.
//
// Run automatically from the `postgenerate` npm script. Exits non-zero on any error.

import { writeFileSync } from "node:fs";
import { log } from "../helper/log";
import { buildAnchorUniverse } from "./policyOverlay/anchors";
import { compileToData } from "./policyOverlay/compileToData";
import { generatePages } from "./policyOverlay/generatePages";
import { loadOverlays } from "./policyOverlay/loadOverlays";
import { mergeOverlays } from "./policyOverlay/merge";
import type { CompiledLevel, PolicyLevelsData } from "./policyOverlay/types";

const DOCUMENT_MD = "docs/spec-v1/interfaces/Document.md";
const DOCUMENT_SCHEMA = "src/generated/spec/v1/schemas/Document.schema.json";
const OVERLAY_DIR = "spec-extension/policy-levels";
const OUTPUT_JSON = "src/generated/policy-levels.json";
const PAGES_DIR = "docs/spec-extensions/policy-levels";

export function compilePolicyLevels(): void {
  log.info("Compiling policy levels...");

  const anchors = buildAnchorUniverse(DOCUMENT_MD, DOCUMENT_SCHEMA);
  log.info(
    `  anchor universe: ${anchors.propertyAnchors.size} property, ${anchors.definitionAnchors.size} definition anchors`,
  );

  const { overlays, byPolicyId } = loadOverlays(OVERLAY_DIR);
  log.info(`  loaded ${overlays.length} overlay file(s)`);

  const merged = mergeOverlays(byPolicyId);
  const compiled = compileToData(merged, anchors);

  // Assemble PolicyLevelsData with display order by sidebarPosition (policyId as tiebreaker).
  const order = [...compiled.values()]
    .sort(
      (a, b) =>
        a.sidebarPosition - b.sidebarPosition ||
        a.policyId.localeCompare(b.policyId),
    )
    .map((level) => level.policyId);
  const levels: Record<string, CompiledLevel> = {};
  for (const policyId of order) {
    const level = compiled.get(policyId);
    if (level) levels[policyId] = level;
  }
  const data: PolicyLevelsData = { order, levels };

  writeFileSync(OUTPUT_JSON, `${JSON.stringify(data, null, 2)}\n`);
  log.info(`  wrote ${OUTPUT_JSON} (${order.length} level(s))`);

  const written = generatePages(overlays, PAGES_DIR);
  log.info(`  regenerated ${written.length} prose page(s)`);
  log.info("Policy levels compiled successfully.");
}

// Run the function if this script is executed directly.
if (require.main === module) {
  try {
    compilePolicyLevels();
  } catch (error) {
    log.error(
      "Error compiling policy levels:",
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  }
}
