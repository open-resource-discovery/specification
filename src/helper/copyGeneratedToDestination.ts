import fs from "fs-extra";
import { log } from "./log";

export async function copyGeneratedToDestination(): Promise<void> {
  try {
    log.info("Starting file copy operations...");

    // Create docs/spec-v1/interfaces/ directory and copy individual files (excluding examples directory)
    await fs.ensureDir("docs/spec-v1/interfaces/");

    // Copy Configuration.md and Document.md files individually
    await fs.copy("./src/generated/spec/v1/docs/Configuration.md", "docs/spec-v1/interfaces/Configuration.md");
    await fs.copy("./src/generated/spec/v1/docs/Document.md", "docs/spec-v1/interfaces/Document.md");

    // Create docs/spec-v1/examples/ directory and copy examples specifically
    await fs.ensureDir("docs/spec-v1/examples/");
    await fs.copy("./src/generated/spec/v1/docs/examples", "docs/spec-v1/examples/");

    // Create docs/spec-v1/diagrams/ directory and copy files
    await fs.ensureDir("docs/spec-v1/diagrams/");
    await fs.copy("./src/generated/spec/v1/plugin/mermaidDiagram", "docs/spec-v1/diagrams/");

    // Create static/spec-v1/interfaces/ directory and copy files
    await fs.ensureDir("static/spec-v1/interfaces/");
    await fs.copy("./src/generated/spec/v1/schemas", "static/spec-v1/interfaces/");

    // Copy DocumentAPI.oas3.yaml file
    await fs.copy("./spec/v1/DocumentAPI.oas3.yaml", "static/spec-v1/interfaces/DocumentAPI.oas3.yaml");

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
    await fs.copy("./src/generated/spec/v1/plugin/ums/MetadataType", "static/spec-v1/interfaces/ums/MetadataType/");

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
