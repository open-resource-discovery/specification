import fs from "fs-extra";
import path from "node:path";
import { log } from "./log";

const SITE_BASE_URL = "https://open-resource-discovery.org";

/**
 * Rewrites relative Markdown links in a JSON Schema string to absolute URLs.
 * The `docsPagePath` is the URL path of the Docusaurus page for this specific
 * schema file (e.g. "/spec-v1/interfaces/Document"), which is the reference
 * point from which relative links in the source YAML were authored.
 *
 * Rules:
 * - Absolute URLs (http/https) are left unchanged.
 * - JSON Schema $ref anchors (#/definitions/...) are left unchanged.
 * - Pure fragment links (#anchor) resolve against the schema's own docs page.
 * - Relative paths are resolved from the parent directory of the docs page,
 *   matching how the markdown files reference each other in Docusaurus.
 */
export function rewriteSchemaRelativeLinks(
	content: string,
	docsPagePath: string,
): string {
	// For relative path resolution, use the directory containing the docs page.
	const docsParentPath = path.posix.dirname(docsPagePath);

	return content.replace(/\[([^\]]*)\]\(([^)]+)\)/g, (match, text, url) => {
		// Leave absolute URLs unchanged
		if (
			url.startsWith("http://") ||
			url.startsWith("https://") ||
			url.startsWith("//")
		) {
			return match;
		}
		// Leave internal JSON Schema $ref anchors unchanged
		if (url.startsWith("#/")) {
			return match;
		}

		// Separate path from fragment (#anchor)
		const hashIndex = url.indexOf("#");
		const urlPath = hashIndex !== -1 ? url.substring(0, hashIndex) : url;
		const fragment = hashIndex !== -1 ? url.substring(hashIndex) : "";

		// Pure fragment link (e.g. #package) – resolves to the schema's own docs page
		if (urlPath === "") {
			return `[${text}](${SITE_BASE_URL}${docsPagePath}${fragment})`;
		}

		// Resolve the relative path from the parent directory
		const resolvedPath = path.posix.resolve(docsParentPath, urlPath);

		// Strip .md extension (Docusaurus renders without it)
		const cleanPath = resolvedPath.replace(/\.md$/, "");

		return `[${text}](${SITE_BASE_URL}${cleanPath}${fragment})`;
	});
}

async function rewriteSchemaDir(
	dirPath: string,
	docsBasePath: string,
): Promise<void> {
	if (!(await fs.pathExists(dirPath))) {
		return;
	}
	const files = await fs.readdir(dirPath);
	const schemaFiles = files.filter((f) => f.endsWith(".schema.json"));
	for (const file of schemaFiles) {
		// Each schema file has its own docs page, e.g.:
		// "Document.schema.json" → "/spec-v1/interfaces/Document"
		const schemaBaseName = file.replace(".schema.json", "");
		const docsPagePath = `${docsBasePath}/${schemaBaseName}`;

		const filePath = path.join(dirPath, file);
		const content = await fs.readFile(filePath, "utf-8");
		const rewritten = rewriteSchemaRelativeLinks(content, docsPagePath);
		if (rewritten !== content) {
			await fs.writeFile(filePath, rewritten, "utf-8");
			log.info(`Rewrote relative links to absolute URLs in: ${file}`);
		}
	}
}

async function main(): Promise<void> {
	try {
		log.info("Rewriting relative links in generated schemas...");

		await rewriteSchemaDir(
			"./src/generated/spec/v1/schemas",
			"/spec-v1/interfaces",
		);

		log.info("Done rewriting relative links.");
	} catch (error) {
		log.error("Error rewriting schema links:", error);
		process.exit(1);
	}
}

if (require.main === module) {
	main();
}
