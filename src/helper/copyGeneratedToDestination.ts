import fs from "fs-extra";
import { parseDocument } from "yaml";
import { log } from "./log";

type JsonObject = Record<string, unknown>;

const documentSchemaPath =
	"./src/generated/spec/v1/schemas/Document.schema.json";
const aggregatorPushApiSourcePath = "./spec/v1/AggregatorPushAPI.oas3.yaml";
const aggregatorPushApiDestinationPath =
	"./static/spec-v1/interfaces/AggregatorPushAPI.oas3.yaml";
const documentSchemaReference = "./Document.schema.json";

function isJsonObject(value: unknown): value is JsonObject {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isTopLevelItemCollection(schema: unknown): schema is JsonObject {
	if (!isJsonObject(schema) || schema.type !== "array") {
		return false;
	}

	const items = schema.items;
	return (
		isJsonObject(items) &&
		typeof items.$ref === "string" &&
		items.$ref.startsWith("#/definitions/")
	);
}

function escapeJsonPointerSegment(value: string): string {
	return value.replaceAll("~", "~0").replaceAll("/", "~1");
}

export function derivePushDocumentEnvelope(
	documentSchema: unknown,
): JsonObject {
	if (
		!isJsonObject(documentSchema) ||
		!isJsonObject(documentSchema.properties)
	) {
		throw new Error("Generated ORD Document schema has no properties object.");
	}

	const properties = Object.fromEntries(
		Object.entries(documentSchema.properties).map(([name, schema]) => [
			name,
			isTopLevelItemCollection(schema)
				? { ...schema, items: {} }
				: {
						$ref: `${documentSchemaReference}#/properties/${escapeJsonPointerSegment(name)}`,
					},
		]),
	);
	const required = Array.isArray(documentSchema.required)
		? [...documentSchema.required]
		: [];
	if (!required.includes("perspective")) {
		required.push("perspective");
	}

	return {
		type: "object",
		description:
			"Admission schema for a pushed ORD Document. It validates document-level fields and array framing only. Each array entry is validated independently against its corresponding ORD Document schema definition during processing, allowing invalid items to be reported without rejecting otherwise valid items.",
		required,
		additionalProperties: documentSchema.additionalProperties,
		...(documentSchema["x-recommended"] === undefined
			? {}
			: { "x-recommended": documentSchema["x-recommended"] }),
		properties,
	};
}

async function generateAggregatorPushApi(): Promise<void> {
	const [documentSchema, source] = await Promise.all([
		fs.readJson(documentSchemaPath) as Promise<unknown>,
		fs.readFile(aggregatorPushApiSourcePath, "utf8"),
	]);
	const openApiDocument = parseDocument(source);

	if (openApiDocument.errors.length > 0) {
		throw new Error(
			`Cannot parse Aggregator Push API: ${openApiDocument.errors.join("; ")}`,
		);
	}
	if (
		openApiDocument.getIn([
			"components",
			"schemas",
			"PushDocumentEnvelope",
			"x-derived-from",
		]) !== documentSchemaReference
	) {
		throw new Error(
			"Aggregator Push API is missing the PushDocumentEnvelope generation marker.",
		);
	}

	openApiDocument.setIn(
		["components", "schemas", "PushDocumentEnvelope"],
		derivePushDocumentEnvelope(documentSchema),
	);
	await fs.outputFile(
		aggregatorPushApiDestinationPath,
		openApiDocument.toString({ flowCollectionPadding: false, lineWidth: 0 }),
	);
}

export async function copyGeneratedToDestination(): Promise<void> {
	try {
		log.info("Starting file copy operations...");

		// Create docs/spec-v1/interfaces/ directory and copy individual files (excluding examples directory)
		await fs.ensureDir("docs/spec-v1/interfaces/");

		// Copy Configuration.md and Document.md files individually
		await fs.copy(
			"./src/generated/spec/v1/docs/Configuration.md",
			"docs/spec-v1/interfaces/Configuration.md",
		);
		await fs.copy(
			"./src/generated/spec/v1/docs/Document.md",
			"docs/spec-v1/interfaces/Document.md",
		);
		await fs.copy(
			"./src/generated/spec/v1/docs/OrdOverlay.md",
			"docs/spec-v1/interfaces/OrdOverlay.md",
		);

		// Create docs/spec-v1/examples/ directory and copy examples specifically
		await fs.ensureDir("docs/spec-v1/examples/");
		await fs.copy(
			"./src/generated/spec/v1/docs/examples",
			"docs/spec-v1/examples/",
		);

		// Create docs/spec-v1/diagrams/ directory and copy files
		await fs.ensureDir("docs/spec-v1/diagrams/");
		await fs.copy(
			"./src/generated/spec/v1/plugin/mermaidDiagram",
			"docs/spec-v1/diagrams/",
		);

		// Create static/spec-v1/interfaces/ directory and copy files
		await fs.ensureDir("static/spec-v1/interfaces/");
		await fs.copy(
			"./src/generated/spec/v1/schemas",
			"static/spec-v1/interfaces/",
		);

		// Copy DocumentAPI.oas3.yaml file
		await fs.copy(
			"./spec/v1/DocumentAPI.oas3.yaml",
			"static/spec-v1/interfaces/DocumentAPI.oas3.yaml",
		);
		await generateAggregatorPushApi();

		// Create UMS directories and copy files
		const umsDirectories = [
			"static/spec-v1/interfaces/ums/AbstractMetadataType/",
			"static/spec-v1/interfaces/ums/AbstractTypeMapping/",
			"static/spec-v1/interfaces/ums/MetadataType/",
		];

		for (const dir of umsDirectories) {
			await fs.ensureDir(dir);
		}

		await fs.copy(
			"./src/generated/spec/v1/plugin/ums/AbstractMetadataType",
			"static/spec-v1/interfaces/ums/AbstractMetadataType/",
		);
		await fs.copy(
			"./src/generated/spec/v1/plugin/ums/AbstractTypeMapping",
			"static/spec-v1/interfaces/ums/AbstractTypeMapping/",
		);
		await fs.copy(
			"./src/generated/spec/v1/plugin/ums/MetadataType",
			"static/spec-v1/interfaces/ums/MetadataType/",
		);

		log.info("Files copied successfully.");
	} catch (error) {
		log.error("Error copying files:", error);
		process.exit(1);
	}
}

// Run the function if this script is executed directly
if (require.main === module) {
	copyGeneratedToDestination();
}
