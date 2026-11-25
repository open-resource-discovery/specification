import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readdirSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

test("the packed package follows its Node.js compatibility policy", (t) => {
  const expectedSupport = process.env.EXPECT_SUPPORTED;
  assert.ok(expectedSupport === "true" || expectedSupport === "false", "Set EXPECT_SUPPORTED to true or false");

  const artifactDirectory = fileURLToPath(new URL(".", import.meta.url));
  const packages = readdirSync(artifactDirectory).filter((name) => name.endsWith(".tgz"));
  assert.equal(packages.length, 1, "Expected exactly one npm package in the artifact");

  const consumer = mkdtempSync(join(tmpdir(), "specification-consumer-"));
  t.after(() => rmSync(consumer, { recursive: true, force: true }));
  const install = spawnSync(
    "npm",
    [
      "install",
      "--engine-strict",
      "--ignore-scripts",
      "--offline",
      "--no-audit",
      "--no-fund",
      "--json",
      join(artifactDirectory, packages[0]),
    ],
    { cwd: consumer, encoding: "utf-8" },
  );
  if (install.error) throw install.error;

  if (expectedSupport === "false") {
    assert.equal(install.status, 1, `Expected npm to reject this Node.js version: ${install.stderr}`);
    assert.equal(JSON.parse(install.stdout).error?.code, "EBADENGINE");
    return;
  }

  assert.equal(install.status, 0, install.stderr);
  const require = createRequire(join(consumer, "package.json"));
  const schemas = require("@open-resource-discovery/specification");
  for (const name of ["ordDocumentSchema", "ordConfigurationSchema", "ordOverlaySchema"]) {
    assert.equal(typeof schemas[name]?.$schema, "string", `Missing public schema export: ${name}`);
  }
});
