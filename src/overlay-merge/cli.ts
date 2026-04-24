/**
 * ORD Overlay Merge CLI
 *
 * NOTE: This script has been "vibe-coded" with AI assistance and has not yet
 * undergone extensive manual review or QA. It is intended to validate the
 * ORD Overlay specification and approach under realistic conditions.
 *
 * The plan is to move this tooling to a separate project once the specification
 * stabilizes. Use with appropriate caution in production environments.
 *
 * For issues or feedback, please open an issue in the repository.
 */

import { readFile, writeFile } from "node:fs/promises";
import { extname, resolve } from "node:path";
import YAML from "yaml";
import type { ORDOverlay } from "../generated/spec/v1/types";
import { applyOverlayToEdmxDocument } from "./edmx";
import { applyOverlayToDocument } from "./merge";
import {
	isJSONObject,
	type JSONValue,
	type OverlayMergeContext,
	OverlayMergeError,
} from "./types";
import {
	emitOverlayValidationWarnings,
	throwOnOverlayValidationErrors,
	validateOverlayInput,
} from "./validation";

type FileFormat = "json" | "yaml" | "xml";

interface ParsedArguments {
	overlayPath: string;
	inputPath: string;
	outputPath?: string;
	noMatchBehavior: "error" | "warn" | "ignore";
	context: OverlayMergeContext;
	dryRun: boolean;
}

async function main(): Promise<void> {
	const args = parseArguments(process.argv.slice(2));

	const overlayResult = await readStructuredFile(resolve(args.overlayPath));
	const overlay = overlayResult.data as unknown as ORDOverlay;

	const validation = validateOverlayInput(overlay, { context: args.context });
	throwOnOverlayValidationErrors(validation.errors);
	emitOverlayValidationWarnings(validation.warnings, (message) =>
		process.stderr.write(`${message}\n`),
	);

	const inputResult = await readStructuredFile(resolve(args.inputPath));
	const inputDocument = inputResult.data;

	// Determine output format: use input file format by default
	const outputFormat = inputResult.format;

	if (args.dryRun) {
		process.stderr.write(
			`[dry-run] Overlay validation passed. Would apply ${overlay.patches.length} patch(es) to ${args.inputPath}.\n`,
		);
		process.stderr.write(`[dry-run] Input format: ${inputResult.format}\n`);
		process.stderr.write(`[dry-run] Output format: ${outputFormat}\n`);
		if (args.outputPath !== undefined) {
			process.stderr.write(
				`[dry-run] Output would be written to: ${args.outputPath}\n`,
			);
		} else {
			process.stderr.write(`[dry-run] Output would be written to: stdout\n`);
		}
		return;
	}

	let rendered: string;
	if (outputFormat === "xml") {
		// EDMX/XML input: use the EDMX-specific merge function
		const merged = applyOverlayToEdmxDocument(
			inputDocument as string,
			overlay,
			{
				noMatchBehavior: args.noMatchBehavior,
			},
		);
		rendered = merged;
	} else {
		// JSON/YAML input: use the standard merge function
		const merged = applyOverlayToDocument(inputDocument as JSONValue, overlay, {
			noMatchBehavior: args.noMatchBehavior,
			requireTargetMatch: true,
			context: args.context,
			validateOverlaySemantics: false,
		});
		rendered = renderOutput(merged, outputFormat);
	}

	if (args.outputPath !== undefined) {
		await writeFile(resolve(args.outputPath), rendered, "utf8");
		return;
	}

	process.stdout.write(rendered);
}

interface FileReadResult {
	data: JSONValue | string;
	format: FileFormat;
}

async function readStructuredFile(path: string): Promise<FileReadResult> {
	const content = await readFile(path, "utf8");
	const extension = extname(path).toLowerCase();

	// Determine format from extension
	if (extension === ".xml" || extension === ".edmx") {
		return { data: content, format: "xml" };
	}

	const format: FileFormat =
		extension === ".yaml" || extension === ".yml" ? "yaml" : "json";

	let parsed: unknown;
	if (format === "yaml") {
		try {
			parsed = YAML.parse(content);
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			throw new OverlayMergeError(
				`Failed to parse YAML file ${path}: ${message}`,
			);
		}
	} else {
		try {
			parsed = JSON.parse(content);
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			throw new OverlayMergeError(
				`Failed to parse JSON file ${path}: ${message}`,
			);
		}
	}

	if (!isJsonValue(parsed)) {
		throw new OverlayMergeError(
			`File ${path} does not contain valid structured data.`,
		);
	}

	return { data: parsed, format };
}

function renderOutput(data: JSONValue, format: FileFormat): string {
	if (format === "yaml") {
		return YAML.stringify(data, { indent: 2 });
	}

	return `${JSON.stringify(data, null, 2)}\n`;
}

function parseArguments(argv: string[]): ParsedArguments {
	const parsed: ParsedArguments = {
		overlayPath: "",
		inputPath: "",
		noMatchBehavior: "error",
		context: {},
		dryRun: false,
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
			parsed.context.definitionType = expectValue(
				argv,
				++index,
				"--target-definition-type",
			);
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

		if (argument === "--dry-run") {
			parsed.dryRun = true;
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

	if (
		typeof value === "string" ||
		typeof value === "number" ||
		typeof value === "boolean"
	) {
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
	process.stderr.write(`ORD Overlay Merge CLI\n\n`);
	process.stderr.write(`Usage:\n`);
	process.stderr.write(
		`  node dist/overlay-merge/cli.js --overlay <overlay.json|yaml> --input <target> [options]\n\n`,
	);
	process.stderr.write(`Options:\n`);
	process.stderr.write(
		`  --output <path>                  Write output file instead of stdout\n`,
	);
	process.stderr.write(
		`  --target-ord-id <ordId>          Validate overlay.target.ordId against this value\n`,
	);
	process.stderr.write(
		`  --target-url <url>               Provide target URL context (currently informational)\n`,
	);
	process.stderr.write(
		`  --target-definition-type <type>  Validate overlay.target.definitionType against this value\n`,
	);
	process.stderr.write(
		`  --allow-no-match                 Do not fail if a patch selector has no matches\n`,
	);
	process.stderr.write(
		`  --warn-on-no-match               Warn instead of failing if a patch selector has no matches\n`,
	);
	process.stderr.write(
		`  --dry-run                        Validate overlay and input without applying changes\n`,
	);
	process.stderr.write(
		`  --help                           Print this help\n\n`,
	);
	process.stderr.write(`Supported input formats:\n`);
	process.stderr.write(
		`  .json, .yaml, .yml               JSON or YAML documents (OpenAPI, CSDL JSON, ORD, etc.)\n`,
	);
	process.stderr.write(
		`  .xml, .edmx                      OData EDMX XML documents\n\n`,
	);
	process.stderr.write(`Format detection:\n`);
	process.stderr.write(
		`  Input format (JSON/YAML) is auto-detected from file extension (.json, .yaml, .yml).\n`,
	);
	process.stderr.write(
		`  Output format matches the input file format by default.\n`,
	);
}

main().catch((error: unknown) => {
	const message = error instanceof Error ? error.message : String(error);
	process.stderr.write(`overlay-merge failed: ${message}\n`);
	process.exit(1);
});
