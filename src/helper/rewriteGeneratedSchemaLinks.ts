import fs from "fs-extra";
import path from "node:path";
import { log } from "./log";

interface SpecToolkitConfig {
	outputPath: string;
}

function readSpecToolkitConfig(): SpecToolkitConfig {
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	return require("../../spec-toolkit.config.json") as SpecToolkitConfig;
}

function readSiteBaseUrl(): string {
	// Extract the `url` field from docusaurus.config.js via a targeted regex,
	// avoiding a full JS eval of the config module.
	const configPath = path.resolve(__dirname, "../../docusaurus.config.js");
	const content = fs.readFileSync(configPath, "utf-8");
	const match = content.match(/\burl:\s*["']([^"']+)["']/);
	if (!match) {
		throw new Error(`Could not extract 'url' from ${configPath}`);
	}
	return match[1];
}

/**
 * Derives the docs page path for a schema file from its own $id field.
 * e.g. $id "https://example.org/spec-v1/interfaces/Document.schema.json#"
 *      + siteBaseUrl "https://example.org"
 *   → docsPagePath "/spec-v1/interfaces/Document"
 */
function docsPagePathFromSchemaId(
	schemaContent: string,
	siteBaseUrl: string,
): string | null {
	let parsed: Record<string, unknown>;
	try {
		parsed = JSON.parse(schemaContent) as Record<string, unknown>;
	} catch {
		return null;
	}
	const id = parsed["$id"];
	if (typeof id !== "string") return null;
	const normalized = id.replace(/#$/, "").replace(/\.schema\.json$/, "");
	if (!normalized.startsWith(siteBaseUrl)) return null;
	return normalized.slice(siteBaseUrl.length);
}

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
	siteBaseUrl: string,
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
			return `[${text}](${siteBaseUrl}${docsPagePath}${fragment})`;
		}

		// Resolve the relative path from the parent directory
		const resolvedPath = path.posix.resolve(docsParentPath, urlPath);

		// Strip .md extension (Docusaurus renders without it)
		// Strip trailing /index (Docusaurus serves index.md at the directory URL)
		const cleanPath = resolvedPath.replace(/\.md$/, "").replace(/\/index$/, "");

		return `[${text}](${siteBaseUrl}${cleanPath}${fragment})`;
	});
}

async function rewriteSchemaDir(
	dirPath: string,
	siteBaseUrl: string,
): Promise<void> {
	if (!(await fs.pathExists(dirPath))) {
		return;
	}
	const files = await fs.readdir(dirPath);
	const schemaFiles = files.filter((f) => f.endsWith(".schema.json"));
	for (const file of schemaFiles) {
		const filePath = path.join(dirPath, file);
		const content = await fs.readFile(filePath, "utf-8");

		// Derive the docs page path from the schema's own $id — it is the
		// canonical source of where this schema is served.
		const docsPagePath = docsPagePathFromSchemaId(content, siteBaseUrl);
		if (!docsPagePath) {
			log.info(`Skipping ${file}: could not derive docs page path from $id`);
			continue;
		}

		const rewritten = rewriteSchemaRelativeLinks(
			content,
			siteBaseUrl,
			docsPagePath,
		);
		if (rewritten !== content) {
			await fs.writeFile(filePath, rewritten, "utf-8");
			log.info(`Rewrote relative links to absolute URLs in: ${file}`);
		}
	}
}

async function main(): Promise<void> {
	try {
		log.info("Rewriting relative links in generated schemas...");

		const toolkitConfig = readSpecToolkitConfig();
		const siteBaseUrl = readSiteBaseUrl();
		const schemasDir = path.join(toolkitConfig.outputPath, "schemas");

		await rewriteSchemaDir(schemasDir, siteBaseUrl);

		log.info("Done rewriting relative links.");
	} catch (error) {
		log.error("Error rewriting schema links:", error);
		process.exit(1);
	}
}

if (require.main === module) {
	main();
}
