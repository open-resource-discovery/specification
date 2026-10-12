import { access, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { log } from "./log";

/**
 * Exports all relevant markdown documentation as a small set of thematic
 * bundles that fit within NotebookLM's source limit.
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
    { src: "docs/index.md", prefix: "11_overview_" },
    { src: "docs/ecosystem/index.mdx", prefix: "12_ecosystem_" },

    // Specification core
    { src: "docs/spec-v1/index.md", prefix: "20_spec-v1_" },
    {
      src: "docs/spec-v1/interfaces/Configuration.md",
      prefix: "21_interface_",
    },
    { src: "docs/spec-v1/interfaces/Document.md", prefix: "22_interface_" },
    { src: "docs/spec-v1/interfaces/OrdOverlay.md", prefix: "23_interface_" },
    {
      src: "docs/spec-v1/interfaces/document-api.mdx",
      prefix: "24_interface_",
    },

    // Concepts
    { src: "docs/spec-v1/concepts/identifiers.md", prefix: "30_concept_" },
    {
      src: "docs/spec-v1/concepts/versioning-and-lifecycle.md",
      prefix: "31_concept_",
    },
    {
      src: "docs/spec-v1/concepts/grouping-and-bundling.md",
      prefix: "32_concept_",
    },
    {
      src: "docs/spec-v1/concepts/system-landscape-model.md",
      prefix: "33_concept_",
    },
    { src: "docs/spec-v1/concepts/perspectives.md", prefix: "34_concept_" },
    { src: "docs/spec-v1/concepts/data-product.md", prefix: "35_concept_" },
    {
      src: "docs/spec-v1/concepts/integration-dependency.md",
      prefix: "36_concept_",
    },
    {
      src: "docs/spec-v1/concepts/ai-agents-and-protocols.md",
      prefix: "37_concept_",
    },
    {
      src: "docs/spec-v1/concepts/shared-resources.md",
      prefix: "38_concept_",
    },

    // Guides
    {
      src: "docs/spec-v1/guides/implementing-ord-natively.md",
      prefix: "39_guide_",
    },

    // Examples (generated)
    { src: "docs/spec-v1/examples/configuration-1.md", prefix: "40_example_" },
    { src: "docs/spec-v1/examples/document-1.md", prefix: "41_example_" },
    { src: "docs/spec-v1/examples/document-agents.md", prefix: "42_example_" },
    {
      src: "docs/spec-v1/examples/document-data-product.md",
      prefix: "43_example_",
    },
    {
      src: "docs/spec-v1/examples/document-entity-types.md",
      prefix: "44_example_",
    },
    {
      src: "docs/spec-v1/examples/document-integration-dependencies.md",
      prefix: "45_example_",
    },
    { src: "docs/spec-v1/examples/document-poc.md", prefix: "46_example_" },
    {
      src: "docs/spec-v1/examples/document-special-protocols.md",
      prefix: "47_example_",
    },
    {
      src: "docs/spec-v1/examples/document-overlays.md",
      prefix: "48_example_",
    },

    // Extensions
    {
      src: "docs/spec-extensions/index.md",
      prefix: "50_spec-extensions_overview_",
    },
    {
      src: "docs/spec-extensions/policy-levels/sap-base-v1.md",
      prefix: "51_policy-level_",
    },
    {
      src: "docs/spec-extensions/policy-levels/sap-core-v1.md",
      prefix: "52_policy-level_",
    },
    {
      src: "docs/spec-extensions/policy-levels/sap-dp-v1.md",
      prefix: "53_policy-level_",
    },
    {
      src: "docs/spec-extensions/policy-levels/sap-documentation-v1.md",
      prefix: "53a_policy-level_",
    },
    {
      src: "docs/spec-extensions/access-strategies/open.md",
      prefix: "54_access-strategy_",
    },
    {
      src: "docs/spec-extensions/access-strategies/basic-auth.md",
      prefix: "55_access-strategy_",
    },
    {
      src: "docs/spec-extensions/access-strategies/sap-businesshub-basic-v1.md",
      prefix: "56_access-strategy_",
    },
    {
      src: "docs/spec-extensions/access-strategies/sap-cmp-mtls-v1.md",
      prefix: "57_access-strategy_",
    },
    {
      src: "docs/spec-extensions/access-strategies/sap-oauth-client-credentials-v1.md",
      prefix: "58_access-strategy_",
    },
    {
      src: "docs/spec-extensions/group-types/sap.md",
      prefix: "59_group-type_",
    },

    // Help & FAQ
    { src: "docs/help/faq/index.md", prefix: "60_faq_" },
    { src: "docs/help/faq/why-ord.md", prefix: "61_faq_" },
    { src: "docs/help/faq/adopt-ord-as-provider.md", prefix: "62_faq_" },
  ];
  const bundles = [
    {
      filename: "01-foundations.md",
      title: "ORD Foundations",
      from: 0,
      to: 20,
    },
    { filename: "02-interfaces.md", title: "ORD Interfaces", from: 20, to: 30 },
    {
      filename: "03-concepts-and-guides.md",
      title: "ORD Concepts and Guides",
      from: 30,
      to: 40,
    },
    { filename: "04-examples.md", title: "ORD Examples", from: 40, to: 50 },
    {
      filename: "05-extensions-and-help.md",
      title: "ORD Extensions and Help",
      from: 50,
      to: Number.POSITIVE_INFINITY,
    },
  ];

  try {
    log.info("Starting NotebookLM export...");

    // Clean and recreate output directory
    await rm(outputDir, { recursive: true, force: true });
    await mkdir(outputDir, { recursive: true });
    log.info(`Created output directory: ${outputDir}`);

    let successCount = 0;
    let skippedCount = 0;
    const skippedFiles: string[] = [];

    const bundleContents = new Map(
      bundles.map((bundle) => [
        bundle.filename,
        `# ${bundle.title}\n\nThis file combines public ORD documentation for NotebookLM. Each section identifies its original source path.\n`,
      ]),
    );

    // Combine each document into its thematic bundle.
    for (const doc of documents) {
      const srcPath = path.join(process.cwd(), doc.src);

      // Check if source file exists
      try {
        await access(srcPath);
      } catch {
        log.warn(`Skipping missing file: ${doc.src}`);
        skippedCount++;
        skippedFiles.push(doc.src);
        continue;
      }

      const order = Number.parseInt(doc.prefix, 10);
      const bundle = bundles.find(
        (candidate) => order >= candidate.from && order < candidate.to,
      );
      if (!bundle) {
        throw new Error(`No NotebookLM bundle configured for: ${doc.src}`);
      }

      const content = await readFile(srcPath, "utf8");
      bundleContents.set(
        bundle.filename,
        `${bundleContents.get(bundle.filename)}\n---\n\n## Source: ${doc.src}\n\n${content.trim()}\n`,
      );
      successCount++;
    }

    for (const bundle of bundles) {
      await writeFile(
        `${outputDir}/${bundle.filename}`,
        `${bundleContents.get(bundle.filename)}\n`,
      );
    }

    log.info(`\nExport completed successfully!`);
    log.info(
      `Exported ${successCount} documents in ${bundles.length} bundles to ${outputDir}`,
    );

    if (skippedCount > 0) {
      log.warn(`\nSkipped ${skippedCount} missing files:`);
      for (const file of skippedFiles) {
        log.warn(`  - ${file}`);
      }
      log.warn(
        `\nThese files may need to be generated first by running: npm run generate`,
      );
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
