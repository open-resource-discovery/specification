import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
const reuseToml = fs.readFileSync("REUSE.toml", "utf8");

const annotationBlocks = reuseToml
	.split(/\n\[\[annotations\]\]\s*\n/)
	.slice(1)
	.map((block) => {
		const pathArray = block.match(/^path\s*=\s*\[([\s\S]*?)^\]/m);
		const singlePath = block.match(/^path\s*=\s*"([^"]+)"/m);
		const paths = pathArray
			? [...pathArray[1].matchAll(/"([^"]+)"/g)].map((match) => match[1])
			: singlePath
				? [singlePath[1]]
				: [];
		const precedence = block.match(/^precedence\s*=\s*"([^"]+)"/m)?.[1];
		const license = block.match(
			/^SPDX-License-Identifier\s*=\s*"([^"]+)"/m,
		)?.[1];

		assert.ok(paths.length > 0, "Every REUSE annotation must declare a path");
		assert.ok(
			precedence === "aggregate" || precedence === "override",
			"Every REUSE annotation must declare aggregate or override precedence",
		);
		assert.ok(license, "Every REUSE annotation must declare a license");

		return { paths, precedence, license };
	});

function globMatches(filePath, pattern) {
	let expression = "^";

	for (let index = 0; index < pattern.length; index += 1) {
		const character = pattern[index];

		if (character === "*" && pattern[index + 1] === "*") {
			expression += ".*";
			index += 1;
		} else if (character === "*") {
			expression += "[^/]*";
		} else if (character === "?") {
			expression += "[^/]";
		} else {
			expression += character.replace(/[\\^$.[\]{}()+|]/g, "\\$&");
		}
	}

	return new RegExp(`${expression}$`).test(filePath);
}

function licenseForPath(filePath) {
	const matchingAnnotations = annotationBlocks.filter(({ paths }) =>
		paths.some((pattern) => globMatches(filePath, pattern)),
	);
	const overrides = matchingAnnotations.filter(
		({ precedence }) => precedence === "override",
	);
	const effectiveAnnotations =
		overrides.length > 0 ? overrides : matchingAnnotations;
	const effectiveLicenses = new Set(
		effectiveAnnotations.map(({ license }) => license),
	);

	assert.equal(
		effectiveLicenses.size,
		1,
		`${filePath} must resolve to exactly one effective license policy`,
	);

	return [...effectiveLicenses][0];
}

const expectedLicenseByPath = new Map([
	["docs/spec-v1/index.md", "Community-Spec-1.0"],
	["docs/spec-v1/concepts/versioning-and-lifecycle.md", "Community-Spec-1.0"],
	["docs/spec-extensions/index.md", "Community-Spec-1.0"],
	["spec/v1/OrdOverlay.intro.md", "Community-Spec-1.0"],
	["spec/v1/Document.schema.yaml", "Community-Spec-1.0 OR Apache-2.0"],
	["spec/v1/DocumentAPI.oas3.yaml", "Community-Spec-1.0 OR Apache-2.0"],
	["src/generated/spec/v1/types/Document.ts", "Apache-2.0"],
	["static/spec-v1/interfaces/DocumentAPI.oas3.yaml", "Apache-2.0"],
	["static/spec-v1/interfaces/ums/MetadataType/apiresource.yaml", "Apache-2.0"],
	["examples/documents/document-1.json", "Apache-2.0"],
	["src/helper/checkLicensePolicy.mjs", "Apache-2.0"],
	[".github/workflows/main.yml", "Apache-2.0"],
]);

for (const [filePath, expectedLicense] of expectedLicenseByPath) {
	assert.ok(
		fs.existsSync(filePath),
		`License policy representative does not exist: ${filePath}`,
	);
	assert.equal(
		licenseForPath(filePath),
		expectedLicense,
		`${filePath} must remain ${expectedLicense}`,
	);
}

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
	"License policy check passed: normative prose is Community-Spec-1.0, normative schema sources are dual-licensed, and generated/tooling/npm artifacts are Apache-2.0.",
);
