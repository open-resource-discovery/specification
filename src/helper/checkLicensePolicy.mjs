import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
const reuseToml = fs.readFileSync("REUSE.toml", "utf8");
const communitySpecificationRevision =
  "8a05e46d768ac0525af882b619c42f3380a9e869";

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

export function globMatches(filePath, pattern) {
  let expression = "^";

  for (let index = 0; index < pattern.length; index += 1) {
    const character = pattern[index];

    if (character === "*" && pattern[index + 1] === "*") {
      if (pattern[index + 2] === "/") {
        expression += "(?:.*/)?";
        index += 2;
      } else {
        expression += ".*";
        index += 1;
      }
    } else if (character === "*") {
      expression += "[^/]*";
    } else {
      expression += character.replace(/[\\^$.[\]{}()+|?]/g, "\\$&");
    }
  }

  return new RegExp(`${expression}$`).test(filePath);
}

// Resolve the root REUSE.toml annotations only. The official REUSE validator
// separately checks headers, nested metadata, and the full specification.
export function licenseForPath(filePath, annotations = annotationBlocks) {
  const annotation = annotations.findLast(({ paths }) =>
    paths.some((pattern) => globMatches(filePath, pattern)),
  );
  assert.ok(annotation, `${filePath} must have a matching license policy`);
  // REUSE 3.3: within one TOML file, only the last matching table applies.
  return annotation.license;
}

export function readPackResult(output) {
  const parsed = JSON.parse(output);
  // npm 11 returns an array; npm 12 keys the results by package name.
  const results = Array.isArray(parsed) ? parsed : Object.values(parsed);
  assert.equal(results.length, 1, "Expected exactly one npm package");
  assert.ok(
    Array.isArray(results[0].files),
    "npm pack must return a file list",
  );
  return results[0];
}

export function checkLicensePolicy() {
  const expectedLicenseByPath = new Map([
    ["docs/spec-v1/index.md", "Community-Spec-1.0"],
    ["docs/spec-v1/concepts/versioning-and-lifecycle.md", "Community-Spec-1.0"],
    ["docs/spec-extensions/index.md", "Community-Spec-1.0"],
    ["spec/v1/OrdOverlay.intro.md", "Community-Spec-1.0"],
    ["spec/v1/Document.schema.yaml", "Community-Spec-1.0 OR Apache-2.0"],
    ["spec/v1/DocumentAPI.oas3.yaml", "Community-Spec-1.0 OR Apache-2.0"],
    ["src/generated/spec/v1/types/Document.ts", "Apache-2.0"],
    ["static/spec-v1/interfaces/DocumentAPI.oas3.yaml", "Apache-2.0"],
    [
      "static/spec-v1/interfaces/ums/MetadataType/apiresource.yaml",
      "Apache-2.0",
    ],
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

  const incorporatedCommunitySpecificationTerms = [
    {
      path: "Community_Specification_Contributor_License_Agreement.md",
      terms: [
        "01-community-specification-license-v1.md",
        "05-governance.md",
        "06-contributing.md",
      ],
    },
    {
      path: "Governance.md",
      terms: ["05-governance.md"],
    },
  ];

  for (const { path, terms } of incorporatedCommunitySpecificationTerms) {
    const document = fs.readFileSync(path, "utf8");

    for (const term of terms) {
      assert.ok(
        document.includes(
          `https://github.com/CommunitySpecification/Community_Specification/blob/${communitySpecificationRevision}/${term}`,
        ),
        `${path} must pin ${term} to the adopted Community Specification revision`,
      );
    }
  }

  const packOutput = execFileSync(
    "npm",
    ["pack", "--dry-run", "--json", "--ignore-scripts"],
    { encoding: "utf8" },
  );
  const packResult = readPackResult(packOutput);
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
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  checkLicensePolicy();
}
