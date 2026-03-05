import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { ORDOverlay } from "../generated/spec/v1/types";
import { applyOverlayToDocument } from "./merge";
import { JSONValue, OverlayMergeContext, OverlayMergeError, isJSONObject } from "./types";

interface ParsedArguments {
  overlayPath: string;
  inputPath: string;
  outputPath?: string;
  noMatchBehavior: "error" | "warn" | "ignore";
  context: OverlayMergeContext;
}

async function main(): Promise<void> {
  const args = parseArguments(process.argv.slice(2));

  const overlay = (await readJsonFile(resolve(args.overlayPath))) as ORDOverlay;
  const inputDocument = await readJsonFile(resolve(args.inputPath));

  const merged = applyOverlayToDocument(inputDocument, overlay, {
    noMatchBehavior: args.noMatchBehavior,
    requireTargetMatch: true,
    context: args.context,
  });

  const rendered = `${JSON.stringify(merged, null, 2)}\n`;

  if (args.outputPath !== undefined) {
    await writeFile(resolve(args.outputPath), rendered, "utf8");
    return;
  }

  process.stdout.write(rendered);
}

async function readJsonFile(path: string): Promise<JSONValue> {
  const content = await readFile(path, "utf8");
  const parsed = JSON.parse(content) as unknown;
  if (!isJsonValue(parsed)) {
    throw new OverlayMergeError(`File ${path} does not contain valid JSON values.`);
  }

  return parsed;
}

function parseArguments(argv: string[]): ParsedArguments {
  const parsed: ParsedArguments = {
    overlayPath: "",
    inputPath: "",
    noMatchBehavior: "error",
    context: {},
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === "--overlay") {
      parsed.overlayPath = expectValue(argv, ++index, "--overlay");
      continue;
    }

    if (argument === "--input") {
      parsed.inputPath = expectValue(argv, ++index, "--input");
      continue;
    }

    if (argument === "--output") {
      parsed.outputPath = expectValue(argv, ++index, "--output");
      continue;
    }

    if (argument === "--target-ord-id") {
      parsed.context.ordId = expectValue(argv, ++index, "--target-ord-id");
      continue;
    }

    if (argument === "--target-url") {
      parsed.context.url = expectValue(argv, ++index, "--target-url");
      continue;
    }

    if (argument === "--target-definition-type") {
      parsed.context.definitionType = expectValue(argv, ++index, "--target-definition-type");
      continue;
    }

    if (argument === "--allow-no-match") {
      parsed.noMatchBehavior = "ignore";
      continue;
    }

    if (argument === "--warn-on-no-match") {
      parsed.noMatchBehavior = "warn";
      continue;
    }

    if (argument === "--help") {
      printHelp();
      process.exit(0);
    }

    throw new OverlayMergeError(`Unknown argument: ${argument}`);
  }

  if (parsed.overlayPath.length === 0 || parsed.inputPath.length === 0) {
    printHelp();
    throw new OverlayMergeError("Both --overlay and --input are required.");
  }

  return parsed;
}

function expectValue(argv: string[], index: number, option: string): string {
  const value = argv[index];
  if (value === undefined || value.startsWith("--")) {
    throw new OverlayMergeError(`Missing value for ${option}.`);
  }

  return value;
}

function isJsonValue(value: unknown): value is JSONValue {
  if (value === null) {
    return true;
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return true;
  }

  if (Array.isArray(value)) {
    return value.every((entry) => isJsonValue(entry));
  }

  if (isJSONObject(value)) {
    return Object.values(value).every((entry) => isJsonValue(entry));
  }

  return false;
}

function printHelp(): void {
  process.stderr.write(`Usage:\n`);
  process.stderr.write(`  node dist/overlay-merge/cli.js --overlay <overlay.json> --input <target.json> [options]\n\n`);
  process.stderr.write(`Options:\n`);
  process.stderr.write(`  --output <path>                  Write output file instead of stdout\n`);
  process.stderr.write(`  --target-ord-id <ordId>          Validate overlay.target.ordId against this value\n`);
  process.stderr.write(`  --target-url <url>               Provide target URL context (currently informational)\n`);
  process.stderr.write(`  --target-definition-type <type>  Validate overlay.target.definitionType against this value\n`);
  process.stderr.write(`  --allow-no-match                 Do not fail if a patch selector has no matches\n`);
  process.stderr.write(`  --warn-on-no-match               Warn instead of failing if a patch selector has no matches\n`);
  process.stderr.write(`  --help                           Print this help\n`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`overlay-merge failed: ${message}\n`);
  process.exit(1);
});
