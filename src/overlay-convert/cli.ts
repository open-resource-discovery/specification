/**
 * ORD Overlay Convert CLI
 *
 * Converts enrichment files (OData v2/v4, OpenAPI Overlay) to ORD Overlay format.
 *
 * NOTE: This script has been "vibe-coded" with AI assistance and has not yet
 * undergone extensive manual review or QA. It is intended to validate the
 * ORD Overlay specification and approach under realistic conditions.
 */

import { readFile, writeFile } from "node:fs/promises";
import { basename, dirname, extname, resolve } from "node:path";
import { convertODataV2EnrichmentToOrd } from "./convert-odata-v2";
import { convertODataV4EnrichmentToOrd } from "./convert-odata-v4";
import { convertOpenApiOverlayToOrd } from "./convert-openapi-overlay";
import type {
	ConversionResult,
	ConvertOptions,
	ODataV2Enrichment,
	ODataV4Enrichment,
	OpenApiOverlay,
} from "./types";

type SourceFormat = "odatav2" | "odatav4" | "openapi-overlay";

interface ParsedArguments {
	inputPath: string;
	outputPath?: string;
	format?: SourceFormat;
	definitionType?: string;
	odataNamespace?: string;
	ordId?: string;
	description?: string;
}

async function main(): Promise<void> {
	const args = parseArguments(process.argv.slice(2));

	const content = await readFile(resolve(args.inputPath), "utf8");
	let parsed: unknown;
	try {
		parsed = JSON.parse(content);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		throw new Error(`Failed to parse JSON file ${args.inputPath}: ${message}`);
	}

	const format = args.format ?? detectFormat(parsed);
	if (format === undefined) {
		throw new Error(
			`Could not detect source format. Use --format to specify (odatav2, odatav4, openapi-overlay).`,
		);
	}

	const options: ConvertOptions = {};
	if (args.definitionType !== undefined) {
		options.target = { definitionType: args.definitionType };
	}
	if (args.odataNamespace !== undefined) {
		options.odataNamespace = args.odataNamespace;
	}
	if (args.ordId !== undefined) {
		options.ordId = args.ordId;
	}
	if (args.description !== undefined) {
		options.description = args.description;
	}

	let result: ConversionResult;
	switch (format) {
		case "odatav2":
			result = convertODataV2EnrichmentToOrd(
				parsed as ODataV2Enrichment,
				options,
			);
			break;
		case "odatav4":
			result = convertODataV4EnrichmentToOrd(
				parsed as ODataV4Enrichment,
				options,
			);
			break;
		case "openapi-overlay":
			result = convertOpenApiOverlayToOrd(parsed as OpenApiOverlay, options);
			break;
	}

	// Emit warnings to stderr
	for (const warning of result.warnings) {
		process.stderr.write(
			`[warning] ${warning.type}: ${warning.message}${warning.field ? ` (${warning.field})` : ""}\n`,
		);
	}

	const output = `${JSON.stringify(result.overlay, null, 2)}\n`;

	if (args.outputPath !== undefined) {
		await writeFile(resolve(args.outputPath), output, "utf8");
		process.stderr.write(`Written: ${args.outputPath}\n`);
		return;
	}

	process.stdout.write(output);
}

function detectFormat(parsed: unknown): SourceFormat | undefined {
	if (typeof parsed !== "object" || parsed === null) {
		return undefined;
	}

	const obj = parsed as Record<string, unknown>;

	// OData v4 enrichment has protocol: "odatav4"
	if (obj.protocol === "odatav4") {
		return "odatav4";
	}

	// OData v2 enrichment has protocol: "odatav2"
	if (obj.protocol === "odatav2") {
		return "odatav2";
	}

	// OpenAPI Overlay has "overlay" version field and "actions" array
	if (typeof obj.overlay === "string" && Array.isArray(obj.actions)) {
		return "openapi-overlay";
	}

	return undefined;
}

function parseArguments(argv: string[]): ParsedArguments {
	const parsed: ParsedArguments = {
		inputPath: "",
	};

	for (let index = 0; index < argv.length; index += 1) {
		const argument = argv[index];

		if (argument === "--format") {
			const value = expectValue(argv, ++index, "--format");
			if (!["odatav2", "odatav4", "openapi-overlay"].includes(value)) {
				throw new Error(
					`Invalid format: ${value}. Must be odatav2, odatav4, or openapi-overlay.`,
				);
			}
			parsed.format = value as SourceFormat;
			continue;
		}

		if (argument === "--output" || argument === "-o") {
			parsed.outputPath = expectValue(argv, ++index, "--output");
			continue;
		}

		if (argument === "--definition-type") {
			parsed.definitionType = expectValue(argv, ++index, "--definition-type");
			continue;
		}

		if (argument === "--namespace") {
			parsed.odataNamespace = expectValue(argv, ++index, "--namespace");
			continue;
		}

		if (argument === "--ord-id") {
			parsed.ordId = expectValue(argv, ++index, "--ord-id");
			continue;
		}

		if (argument === "--description") {
			parsed.description = expectValue(argv, ++index, "--description");
			continue;
		}

		if (argument === "--help" || argument === "-h") {
			printHelp();
			process.exit(0);
		}

		// Positional argument: input file
		if (!argument.startsWith("-") && parsed.inputPath.length === 0) {
			parsed.inputPath = argument;
			continue;
		}

		throw new Error(`Unknown argument: ${argument}`);
	}

	if (parsed.inputPath.length === 0) {
		printHelp();
		throw new Error("Input file path is required.");
	}

	// Default output path: same directory, .overlay.json extension
	if (parsed.outputPath === undefined) {
		const dir = dirname(parsed.inputPath);
		const base = basename(parsed.inputPath, extname(parsed.inputPath));
		// Remove common suffixes like .llm, .enrichment
		const cleanBase = base.replace(/\.(llm|enrichment)$/i, "");
		parsed.outputPath = resolve(dir, `${cleanBase}.overlay.json`);
	}

	return parsed;
}

function expectValue(argv: string[], index: number, option: string): string {
	const value = argv[index];
	if (value === undefined || value.startsWith("-")) {
		throw new Error(`Missing value for ${option}.`);
	}
	return value;
}

function printHelp(): void {
	process.stderr.write(`ORD Overlay Convert CLI\n\n`);
	process.stderr.write(`Usage:\n`);
	process.stderr.write(
		`  node dist/overlay-convert/cli.js <input.json> [options]\n\n`,
	);
	process.stderr.write(`Options:\n`);
	process.stderr.write(
		`  -o, --output <path>           Output file path (default: <input>.overlay.json)\n`,
	);
	process.stderr.write(
		`  --format <format>             Source format: odatav2, odatav4, openapi-overlay (auto-detected)\n`,
	);
	process.stderr.write(
		`  --definition-type <type>      Set target.definitionType (e.g., edmx, csdl-json)\n`,
	);
	process.stderr.write(
		`  --namespace <namespace>       OData namespace for qualified selectors\n`,
	);
	process.stderr.write(
		`  --ord-id <ordId>              Set ordId in overlay output\n`,
	);
	process.stderr.write(
		`  --description <text>          Set description in overlay output\n`,
	);
	process.stderr.write(`  -h, --help                    Print this help\n\n`);
	process.stderr.write(`Examples:\n`);
	process.stderr.write(`  node dist/overlay-convert/cli.js enrichment.json\n`);
	process.stderr.write(
		`  node dist/overlay-convert/cli.js enrichment.json --definition-type edmx\n`,
	);
	process.stderr.write(
		`  node dist/overlay-convert/cli.js enrichment.json -o output.overlay.json\n`,
	);
}

main().catch((error: unknown) => {
	const message = error instanceof Error ? error.message : String(error);
	process.stderr.write(`overlay-convert failed: ${message}\n`);
	process.exit(1);
});
