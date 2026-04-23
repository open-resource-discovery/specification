/**
 * ORD Overlay Validate CLI
 *
 * Command-line interface for validating ORD Overlay files.
 * Validates overlay schema/semantics and optionally validates
 * selector matching against a target document.
 *
 * NOTE: This script has been "vibe-coded" with AI assistance and has not yet
 * undergone extensive manual review or QA. It is intended to validate the
 * ORD Overlay specification and approach under realistic conditions.
 *
 * For issues or feedback, please open an issue in the repository.
 */

import { readFile } from "node:fs/promises";
import { extname, resolve } from "node:path";
import YAML from "yaml";
import type { ORDOverlay } from "../generated/spec/v1/types";
import {
	isJSONObject,
	type JSONValue,
	type OverlayMergeContext,
	OverlayMergeError,
} from "../overlay-merge/types";
import {
	type OverlayFullValidationResult,
	type OverlayValidationIssue,
	type PatchValidationSummary,
	validateOverlay,
	validateOverlayWithEdmxTarget,
	validateOverlayWithTarget,
} from "./validate";

type FileFormat = "json" | "yaml" | "xml";

interface ParsedArguments {
	overlayPath: string;
	targetPath?: string;
	context: OverlayMergeContext;
	outputFormat: "text" | "json";
}

interface ValidationReport {
	overlay: string;
	target?: string | undefined;
	valid: boolean;
	errors: OverlayValidationIssue[];
	warnings: OverlayValidationIssue[];
	patchSummary?: PatchValidationSummary[] | undefined;
}

async function main(): Promise<void> {
	const args = parseArguments(process.argv.slice(2));

	// Load and parse overlay file
	const overlayResult = await readStructuredFile(resolve(args.overlayPath));
	if (overlayResult.format === "xml") {
		const report: ValidationReport = {
			overlay: args.overlayPath,
			target: args.targetPath,
			valid: false,
			errors: [
				{
					level: "error",
					path: "$",
					message: "Overlay file must be JSON or YAML, not XML.",
				},
			],
			warnings: [],
		};
		outputReport(report, args.outputFormat);
		process.exit(1);
	}

	const overlay = overlayResult.data as ORDOverlay;

	let validationResult: OverlayFullValidationResult;

	if (args.targetPath !== undefined) {
		// Validate with target
		const targetResult = await readStructuredFile(resolve(args.targetPath));
		const definitionType =
			args.context?.definitionType ??
			(typeof overlay.target?.definitionType === "string"
				? overlay.target.definitionType
				: undefined);

		if (targetResult.format === "xml") {
			validationResult = validateOverlayWithEdmxTarget(
				overlay,
				targetResult.data as string,
				{ context: args.context },
			);
		} else {
			validationResult = validateOverlayWithTarget(
				overlay,
				targetResult.data as JSONValue,
				{ context: args.context, definitionType },
			);
		}
	} else {
		// Validate overlay only
		validationResult = validateOverlay(overlay, { context: args.context });
	}

	const report: ValidationReport = {
		overlay: args.overlayPath,
		target: args.targetPath,
		valid: validationResult.valid,
		errors: validationResult.errors,
		warnings: validationResult.warnings,
		patchSummary: validationResult.patchSummary,
	};

	outputReport(report, args.outputFormat);

	if (!report.valid) {
		process.exit(1);
	}
}

function outputReport(report: ValidationReport, format: "text" | "json"): void {
	if (format === "json") {
		process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
		return;
	}

	// Text format output
	const lines: string[] = [];

	lines.push(`Overlay Validation Report`);
	lines.push(`========================`);
	lines.push(`Overlay: ${report.overlay}`);
	if (report.target !== undefined) {
		lines.push(`Target:  ${report.target}`);
	}
	lines.push(``);

	if (report.errors.length === 0 && report.warnings.length === 0) {
		lines.push(`Status: VALID`);
		if (report.patchSummary !== undefined) {
			lines.push(``);
			lines.push(`Patches: ${report.patchSummary.length}`);
			report.patchSummary.forEach((summary) => {
				const matchInfo =
					summary.matchCount >= 0 ? `${summary.matchCount} match(es)` : "N/A";
				lines.push(`  Patch #${summary.patchIndex + 1}: ${matchInfo}`);
			});
		}
	} else {
		lines.push(`Status: ${report.valid ? "VALID (with warnings)" : "INVALID"}`);
		lines.push(``);

		if (report.errors.length > 0) {
			lines.push(`Errors (${report.errors.length}):`);
			report.errors.forEach((error) => {
				lines.push(`  - ${error.path}: ${error.message}`);
			});
			lines.push(``);
		}

		if (report.warnings.length > 0) {
			lines.push(`Warnings (${report.warnings.length}):`);
			report.warnings.forEach((warning) => {
				lines.push(`  - ${warning.path}: ${warning.message}`);
			});
			lines.push(``);
		}

		if (report.patchSummary !== undefined) {
			lines.push(`Patch Summary:`);
			report.patchSummary.forEach((summary) => {
				const matchInfo =
					summary.matchCount >= 0 ? `${summary.matchCount} match(es)` : "N/A";
				const redundantInfo = summary.redundant ? " [REDUNDANT]" : "";
				lines.push(
					`  Patch #${summary.patchIndex + 1}: ${matchInfo}${redundantInfo}`,
				);
			});
		}
	}

	process.stderr.write(`${lines.join("\n")}\n`);
}

interface FileReadResult {
	data: JSONValue | string;
	format: FileFormat;
}

async function readStructuredFile(path: string): Promise<FileReadResult> {
	const content = await readFile(path, "utf8");
	const extension = extname(path).toLowerCase();

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

function parseArguments(argv: string[]): ParsedArguments {
	const parsed: ParsedArguments = {
		overlayPath: "",
		context: {},
		outputFormat: "text",
	};

	for (let index = 0; index < argv.length; index += 1) {
		const argument = argv[index];

		if (argument === "--overlay") {
			parsed.overlayPath = expectValue(argv, ++index, "--overlay");
			continue;
		}

		if (argument === "--target") {
			parsed.targetPath = expectValue(argv, ++index, "--target");
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

		if (argument === "--json") {
			parsed.outputFormat = "json";
			continue;
		}

		if (argument === "--help") {
			printHelp();
			process.exit(0);
		}

		throw new OverlayMergeError(`Unknown argument: ${argument}`);
	}

	if (parsed.overlayPath.length === 0) {
		printHelp();
		throw new OverlayMergeError("--overlay is required.");
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
	process.stderr.write(`ORD Overlay Validate CLI\n\n`);
	process.stderr.write(`Usage:\n`);
	process.stderr.write(
		`  node dist/overlay-validate/cli.js --overlay <overlay.json|yaml> [options]\n\n`,
	);
	process.stderr.write(`Options:\n`);
	process.stderr.write(
		`  --target <path>                  Target document to validate selectors against\n`,
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
		`  --json                           Output validation report as JSON\n`,
	);
	process.stderr.write(
		`  --help                           Print this help\n\n`,
	);
	process.stderr.write(`Validation Modes:\n`);
	process.stderr.write(
		`  Overlay only:    Validates overlay schema and semantics\n`,
	);
	process.stderr.write(
		`  Overlay + target: Also validates that selectors match and detects redundant patches\n\n`,
	);
	process.stderr.write(`Exit Codes:\n`);
	process.stderr.write(`  0: Validation passed (may have warnings)\n`);
	process.stderr.write(`  1: Validation failed (has errors)\n`);
}

main().catch((error: unknown) => {
	const message = error instanceof Error ? error.message : String(error);
	process.stderr.write(`overlay-validate failed: ${message}\n`);
	process.exit(1);
});
