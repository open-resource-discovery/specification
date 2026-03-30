import fs from "fs-extra";
import path from "node:path";
import { log } from "./log";

/**
 * Exports all relevant markdown documentation to a flat folder for NotebookLM.
 * Files are prepended with their directory structure to maintain context.
 */
export async function exportForNotebookLM(): Promise<void> {
	const outputDir = "src/generated/llm-notebook";

	// List of relevant documents to export
	const documents = [
		// Core documentation
		{ src: "README.md", prefix: "00_" },
		{ src: "CHANGELOG.md", prefix: "01_" },
		{ src: "CONTRIBUTING.md", prefix: "02_" },
		{ src: "docs/disclaimer.md", prefix: "03_" },

		// Introduction and overview
		{ src: "docs/introduction.mdx", prefix: "10_intro_" },
		{ src: "docs/overview/index.md", prefix: "11_overview_" },
		{ src: "docs/ecosystem/index.mdx", prefix: "12_ecosystem_" },

		// Specification core
		{ src: "docs/spec-v1/index.md", prefix: "20_spec-v1_" },
		{ src: "docs/spec-v1/interfaces/Configuration.md", prefix: "21_interface_" },
		{ src: "docs/spec-v1/interfaces/Document.md", prefix: "22_interface_" },

		// Concepts
		{ src: "docs/spec-v1/concepts/ai-agents-and-protocols.md", prefix: "30_concept_" },
		{ src: "docs/spec-v1/concepts/compatibility.md", prefix: "31_concept_" },
		{ src: "docs/spec-v1/concepts/data-product.md", prefix: "32_concept_" },
		{ src: "docs/spec-v1/concepts/grouping-and-bundling.md", prefix: "33_concept_" },
		{ src: "docs/spec-v1/concepts/integration-dependency.md", prefix: "34_concept_" },
		{ src: "docs/spec-v1/concepts/perspectives.md", prefix: "35_concept_" },
		{ src: "docs/spec-v1/concepts/system-landscape-model.md", prefix: "36_concept_" },

		// Examples (generated)
		{ src: "docs/spec-v1/examples/configuration-1.md", prefix: "40_example_" },
		{ src: "docs/spec-v1/examples/document-1.md", prefix: "41_example_" },
		{ src: "docs/spec-v1/examples/document-agents.md", prefix: "42_example_" },
		{ src: "docs/spec-v1/examples/document-data-product.md", prefix: "43_example_" },
		{ src: "docs/spec-v1/examples/document-entity-types.md", prefix: "44_example_" },
		{ src: "docs/spec-v1/examples/document-integration-dependencies.md", prefix: "45_example_" },
		{ src: "docs/spec-v1/examples/document-poc.md", prefix: "46_example_" },
		{ src: "docs/spec-v1/examples/document-special-protocols.md", prefix: "47_example_" },

		// Extensions
		{ src: "docs/spec-extensions/index.md", prefix: "50_spec-extensions_overview_" },
		{ src: "docs/spec-extensions/policy-levels/sap-base-v1.md", prefix: "51_policy-level_" },
		{ src: "docs/spec-extensions/policy-levels/sap-core-v1.md", prefix: "52_policy-level_" },
		{ src: "docs/spec-extensions/policy-levels/sap-dp-v1.md", prefix: "53_policy-level_" },
		{ src: "docs/spec-extensions/access-strategies/open.md", prefix: "54_access-strategy_" },
		{ src: "docs/spec-extensions/access-strategies/basic-auth.md", prefix: "55_access-strategy_" },
		{ src: "docs/spec-extensions/access-strategies/sap-businesshub-basic-v1.md", prefix: "56_access-strategy_" },
		{ src: "docs/spec-extensions/access-strategies/sap-cmp-mtls-v1.md", prefix: "57_access-strategy_" },
		{ src: "docs/spec-extensions/access-strategies/sap-oauth-client-credentials-v1.md", prefix: "58_access-strategy_" },
		{ src: "docs/spec-extensions/group-types/sap.md", prefix: "59_group-type_" },

		// Help & FAQ
		{ src: "docs/help/faq/index.md", prefix: "60_faq_" },
		{ src: "docs/help/faq/why-ord.md", prefix: "61_faq_" },
		{ src: "docs/help/faq/adopt-ord-as-provider.md", prefix: "62_faq_" },
	];

	try {
		log.info("Starting NotebookLM export...");

		// Clean and recreate output directory
		await fs.remove(outputDir);
		await fs.ensureDir(outputDir);
		log.info(`Created output directory: ${outputDir}`);

		let successCount = 0;
		let skippedCount = 0;
		const skippedFiles: string[] = [];

		// Copy each document with the appropriate prefix
		for (const doc of documents) {
			const srcPath = path.join(process.cwd(), doc.src);

			// Check if source file exists
			if (!(await fs.pathExists(srcPath))) {
				log.warn(`Skipping missing file: ${doc.src}`);
				skippedCount++;
				skippedFiles.push(doc.src);
				continue;
			}

			// Generate output filename: prefix + original filename
			const originalFilename = path.basename(doc.src);
			const outputFilename = `${doc.prefix}${originalFilename}`;
			const destPath = path.join(outputDir, outputFilename);

			// Copy the file
			await fs.copy(srcPath, destPath);
			successCount++;
		}

		log.info(`\nExport completed successfully!`);
		log.info(`Exported ${successCount} files to ${outputDir}`);

		if (skippedCount > 0) {
			log.warn(`\nSkipped ${skippedCount} missing files:`);
			for (const file of skippedFiles) {
				log.warn(`  - ${file}`);
			}
			log.warn(`\nThese files may need to be generated first by running: npm run generate`);
		}

		log.info(`\nYou can now upload all files from ${outputDir} to NotebookLM.`);
	} catch (error) {
		log.error("Error exporting files for NotebookLM:", error);
		process.exit(1);
	}
}

// Run the function if this script is executed directly
if (require.main === module) {
	exportForNotebookLM();
}
