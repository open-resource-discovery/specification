// Dev-time hot reload for policy levels.
//
// The policy pages and `src/generated/policy-levels.json` are generated from the
// overlay files in `spec-extension/policy-levels/`. In `docusaurus start` nothing
// re-runs that compiler when an overlay changes. This plugin watches the overlays
// (via getPathsToWatch) and recompiles in loadContent, so Docusaurus hot-reloads
// the regenerated JSON (the switcher) and the regenerated `.md` policy pages.
//
// Production builds already regenerate via the explicit `generate` pipeline, so this
// plugin only recompiles in development to avoid writing files mid-build.

const fs = require("node:fs");
const path = require("node:path");

/** @returns {import('@docusaurus/types').Plugin} */
module.exports = function policyLevelsWatchPlugin(context) {
  const siteDir = context.siteDir;
  const overlayDir = path.join(siteDir, "spec-extension", "policy-levels");
  const compilerPath = path.join(
    siteDir,
    "dist",
    "build",
    "compilePolicyLevels.js",
  );

  return {
    name: "policy-levels-watch",

    getPathsToWatch() {
      return [
        path.join(overlayDir, "*.overlay.yaml"),
        path.join(overlayDir, "policy-overlay.schema.json"),
      ];
    },

    async loadContent() {
      // Build/CI already compiles via `generate`; only recompile in dev.
      if (process.env.NODE_ENV === "production") return;
      if (!fs.existsSync(compilerPath)) {
        console.warn(
          "[policy-levels-watch] dist compiler not found — run `npm run generate` once so hot reload can recompile overlays.",
        );
        return;
      }
      try {
        // Required once; the exported function re-reads the overlays on every call.
        const { compilePolicyLevels } = require(compilerPath);
        compilePolicyLevels();
      } catch (error) {
        console.error(
          "[policy-levels-watch] overlay recompile failed:",
          error instanceof Error ? error.message : error,
        );
      }
    },
  };
};
