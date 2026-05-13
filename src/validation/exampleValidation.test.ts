import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs/promises";
import path from "node:path";
import Ajv from "ajv";
import addFormats from "ajv-formats";

/**
 * Tests that validate example files against their JSON schemas.
 * This test suite dynamically discovers examples and validates them.
 */

interface SchemaMapping {
	schemaName: string;
	schemaPath: string;
	examplesPath: string;
	filePattern?: RegExp;
}

// Define schema to examples mappings
const schemaMappings: SchemaMapping[] = [
	{
		schemaName: "Configuration",
		schemaPath: "./src/generated/spec/v1/schemas/Configuration.schema.json",
		examplesPath: "./examples/configuration",
		filePattern: /\.json$/,
	},
	{
		schemaName: "Document",
		schemaPath: "./src/generated/spec/v1/schemas/Document.schema.json",
		examplesPath: "./examples/documents",
		filePattern: /\.json$/,
	},
];

/**
 * Read and parse a JSON file
 */
async function readJsonFile(filePath: string): Promise<unknown> {
	const content = await fs.readFile(filePath, "utf-8");
	return JSON.parse(content);
}

/**
 * Get all example files from a directory
 */
async function getExampleFiles(
	dirPath: string,
	pattern: RegExp = /\.json$/,
): Promise<string[]> {
	try {
		const files = await fs.readdir(dirPath);
		return files
			.filter((file) => pattern.test(file))
			.map((file) => path.join(dirPath, file));
	} catch (_error) {
		// Directory doesn't exist or isn't readable
		return [];
	}
}

/**
 * Create an AJV validator with formats support
 */
function createValidator() {
	const ajv = new Ajv({
		strict: false, // Allow custom keywords like x-ums-type
		allErrors: true,
		verbose: true,
	});
	addFormats(ajv);
	return ajv;
}

/**
 * Main test suite
 */
describe("Example Validation", async () => {
	// Create a test suite for each schema
	for (const mapping of schemaMappings) {
		await describe(`${mapping.schemaName} Examples`, async () => {
			// Load schema
			let schema: unknown;
			try {
				schema = await readJsonFile(mapping.schemaPath);
			} catch (error) {
				await it(`should have a valid schema file at ${mapping.schemaPath}`, () => {
					assert.fail(`Failed to load schema: ${error}`);
				});
				return;
			}

			// Get all example files
			const exampleFiles = await getExampleFiles(
				mapping.examplesPath,
				mapping.filePattern,
			);

			if (exampleFiles.length === 0) {
				await it(`should have at least one example in ${mapping.examplesPath}`, () => {
					assert.fail("No example files found");
				});
				return;
			}

			// Create validator
			const ajv = createValidator();
			const validate = ajv.compile(schema as object);

			// Test each example file
			for (const exampleFile of exampleFiles) {
				const exampleName = path.basename(exampleFile);

				await it(`should validate ${exampleName}`, async () => {
					// Load example
					let example: unknown;
					try {
						example = await readJsonFile(exampleFile);
					} catch (error) {
						assert.fail(`Failed to load example ${exampleFile}: ${error}`);
					}

					// Validate
					const valid = validate(example);

					if (!valid) {
						const errors = validate.errors || [];
						const errorMessages = errors
							.map(
								(err) =>
									`  - ${err.instancePath || "/"}: ${err.message} (${JSON.stringify(err.params)})`,
							)
							.join("\n");

						assert.fail(
							`Validation failed for ${exampleFile}:\n${errorMessages}`,
						);
					}

					assert.ok(valid, `${exampleFile} should be valid`);
				});
			}
		});
	}

	// Additional test: verify all examples have $schema property pointing to correct URL
	await describe("Schema References", async () => {
		for (const mapping of schemaMappings) {
			const exampleFiles = await getExampleFiles(
				mapping.examplesPath,
				mapping.filePattern,
			);

			for (const exampleFile of exampleFiles) {
				const exampleName = path.basename(exampleFile);

				await it(`${exampleName} should reference the correct $schema URL`, async () => {
					const example = (await readJsonFile(exampleFile)) as Record<
						string,
						unknown
					>;

					if (typeof example.$schema === "string") {
						// Verify schema URL matches the expected pattern
						const expectedSchemaPattern =
							mapping.schemaName === "Configuration" ||
							mapping.schemaName === "Document"
								? `spec-v1/interfaces/${mapping.schemaName}.schema.json`
								: `spec-extension/models/${mapping.schemaName}.schema.json`;

						assert.ok(
							example.$schema.includes(expectedSchemaPattern),
							`${exampleFile}: Expected $schema to contain "${expectedSchemaPattern}" but got "${example.$schema}"`,
						);
					}
					// Note: $schema is optional in JSON Schema, so we don't fail if it's missing
				});
			}
		}
	});
});
