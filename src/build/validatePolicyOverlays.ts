// Standalone CI validator for the policy-level overlays. Two independent checks,
// both using Ajv (JSON Schema 2020-12):
//
//   1. The schema document itself (policy-overlay.schema.json) is valid against
//      the JSON Schema 2020-12 meta-schema, and declares that dialect.
//   2. Every `*.overlay.yaml` file validates against that schema (plus the
//      cross-file/semantic invariants enforced by loadOverlays).
//
// Run via `npm run validate:policy`. Exits non-zero (failing CI) on any problem.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import Ajv2020 from "ajv/dist/2020";
import { loadOverlays } from "./policyOverlay/loadOverlays";

const DIR = "spec-extension/policy-levels";
const SCHEMA_FILE = "policy-overlay.schema.json";
const DIALECT_2020 = "https://json-schema.org/draft/2020-12/schema";

/** Check #1: the schema is a well-formed JSON Schema 2020-12 document. */
function validateSchemaDocument(): void {
  const schemaPath = join(DIR, SCHEMA_FILE);
  const schema = JSON.parse(readFileSync(schemaPath, "utf8")) as {
    $schema?: string;
  };

  if (schema.$schema !== DIALECT_2020) {
    throw new Error(
      `${SCHEMA_FILE}: "$schema" must be "${DIALECT_2020}" (JSON Schema 2020-12), found "${schema.$schema ?? "<missing>"}".`,
    );
  }

  // validateSchema checks the document against the 2020-12 meta-schema; compile
  // additionally confirms every keyword/$ref resolves and the schema is usable.
  // (Default options only: an explicit `strict: true` would enable Ajv's own
  // `strictRequired` lint, which flags valid 2020-12 `not/anyOf/required` guards.)
  const ajv = new Ajv2020({ allErrors: true });
  if (!ajv.validateSchema(schema)) {
    const details = (ajv.errors ?? [])
      .map((e) => `${e.instancePath || "/"} ${e.message ?? "is invalid"}`)
      .join("\n  - ");
    throw new Error(
      `${SCHEMA_FILE} is not valid JSON Schema 2020-12:\n  - ${details}`,
    );
  }
  ajv.compile(schema);
  console.log(`✓ ${SCHEMA_FILE} is valid JSON Schema 2020-12`);
}

/** Check #2: every overlay validates against the schema. */
function validateOverlays(): void {
  const { overlays } = loadOverlays(DIR);
  console.log(
    `✓ ${overlays.length} overlay file(s) valid against ${SCHEMA_FILE}`,
  );
}

function main(): void {
  try {
    validateSchemaDocument();
    validateOverlays();
  } catch (error) {
    console.error(
      `\nPolicy overlay validation failed:\n${error instanceof Error ? error.message : String(error)}`,
    );
    process.exit(1);
  }
}

main();
