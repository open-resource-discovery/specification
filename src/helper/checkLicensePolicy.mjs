import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));

assert.equal(
	packageJson.license,
	"Apache-2.0",
	"The npm package must remain Apache-2.0",
);

const packOutput = execFileSync(
	"npm",
	["pack", "--dry-run", "--json", "--ignore-scripts"],
	{ encoding: "utf8" },
);
const [packResult] = JSON.parse(packOutput);
const packagedPaths = new Set(packResult.files.map(({ path }) => path));

const requiredPaths = [
	"README.md",
	"LICENSE",
	"License.md",
	"LICENSES/Apache-2.0.txt",
	"LICENSES/Community-Spec-1.0.txt",
	"package.json",
	"dist/index.js",
	"dist/index.d.ts",
	"dist/generated/spec/v1/schemas/Configuration.schema.json",
	"dist/generated/spec/v1/schemas/Document.schema.json",
	"dist/generated/spec/v1/schemas/OrdOverlay.schema.json",
];

for (const requiredPath of requiredPaths) {
	assert.ok(
		packagedPaths.has(requiredPath),
		`npm package is missing required file: ${requiredPath}`,
	);
}

for (const markdownPath of ["README.md", "License.md"]) {
	const markdown = fs.readFileSync(markdownPath, "utf8");
	const relativeLinkPattern = /\]\(\.\/([^#)]+)(?:#[^)]+)?\)/g;

	for (const match of markdown.matchAll(relativeLinkPattern)) {
		const linkedPath = match[1];
		assert.ok(
			packagedPaths.has(linkedPath),
			`${markdownPath} links to ${linkedPath}, but the npm package omits it`,
		);
	}
}

console.log(
	"License policy check passed: the npm package is Apache-2.0 and includes its complete license material.",
);
