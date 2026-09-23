import { cp, mkdir } from "node:fs/promises";
import { log } from "./log";

export async function copyGeneratedToDestination(): Promise<void> {
  try {
    log.info("Starting file copy operations...");

    // Create docs/spec-v1/interfaces/ directory and copy individual files (excluding examples directory)
    await mkdir("docs/spec-v1/interfaces/", { recursive: true });

    // Copy Configuration.md and Document.md files individually
    await cp(
      "./src/generated/spec/v1/docs/Configuration.md",
      "docs/spec-v1/interfaces/Configuration.md",
    );
    await cp(
      "./src/generated/spec/v1/docs/Document.md",
      "docs/spec-v1/interfaces/Document.md",
    );
    await cp(
      "./src/generated/spec/v1/docs/OrdOverlay.md",
      "docs/spec-v1/interfaces/OrdOverlay.md",
    );

    // Create docs/spec-v1/examples/ directory and copy examples specifically
    await mkdir("docs/spec-v1/examples/", { recursive: true });
    await cp(
      "./src/generated/spec/v1/docs/examples",
      "docs/spec-v1/examples/",
      { recursive: true },
    );

    // Create docs/spec-v1/diagrams/ directory and copy files
    await mkdir("docs/spec-v1/diagrams/", { recursive: true });
    await cp(
      "./src/generated/spec/v1/plugin/mermaidDiagram",
      "docs/spec-v1/diagrams/",
      { recursive: true },
    );

    // Create static/spec-v1/interfaces/ directory and copy files
    await mkdir("static/spec-v1/interfaces/", { recursive: true });
    await cp("./src/generated/spec/v1/schemas", "static/spec-v1/interfaces/", {
      recursive: true,
    });
    await cp(
      "./src/generated/spec/v1/types/Configuration.ts",
      "static/spec-v1/interfaces/Configuration.ts.txt",
    );
    await cp(
      "./src/generated/spec/v1/types/Document.ts",
      "static/spec-v1/interfaces/Document.ts.txt",
    );
    await cp(
      "./src/generated/spec/v1/plugin/tabular/Ord Configuration.csv",
      "static/spec-v1/interfaces/Configuration.csv",
    );
    await cp(
      "./src/generated/spec/v1/plugin/tabular/Ord Configuration.xlsx",
      "static/spec-v1/interfaces/Configuration.xlsx",
    );
    await cp(
      "./src/generated/spec/v1/plugin/tabular/Ord Document.csv",
      "static/spec-v1/interfaces/Document.csv",
    );
    await cp(
      "./src/generated/spec/v1/plugin/tabular/Ord Document.xlsx",
      "static/spec-v1/interfaces/Document.xlsx",
    );

    // Copy DocumentAPI.oas3.yaml file
    await cp(
      "./spec/v1/DocumentAPI.oas3.yaml",
      "static/spec-v1/interfaces/DocumentAPI.oas3.yaml",
    );

    // Create UMS directories and copy files
    const umsDirectories = [
      "static/spec-v1/interfaces/ums/AbstractMetadataType/",
      "static/spec-v1/interfaces/ums/AbstractTypeMapping/",
      "static/spec-v1/interfaces/ums/MetadataType/",
    ];

    for (const dir of umsDirectories) {
      await mkdir(dir, { recursive: true });
    }

    await cp(
      "./src/generated/spec/v1/plugin/ums/AbstractMetadataType",
      "static/spec-v1/interfaces/ums/AbstractMetadataType/",
      { recursive: true },
    );
    await cp(
      "./src/generated/spec/v1/plugin/ums/AbstractTypeMapping",
      "static/spec-v1/interfaces/ums/AbstractTypeMapping/",
      { recursive: true },
    );
    await cp(
      "./src/generated/spec/v1/plugin/ums/MetadataType",
      "static/spec-v1/interfaces/ums/MetadataType/",
      { recursive: true },
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
