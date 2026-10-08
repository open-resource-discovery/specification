import assert from "node:assert/strict";
import test from "node:test";
import {
  globMatches,
  licenseForPath,
  readPackResult,
} from "./checkLicensePolicy.mjs";

test("the last matching root annotation wins regardless of precedence", () => {
  const annotations = [
    { paths: ["**"], precedence: "aggregate", license: "Apache-2.0" },
    {
      paths: ["docs/**"],
      precedence: "override",
      license: "Community-Spec-1.0",
    },
    {
      paths: ["docs/example.md"],
      precedence: "aggregate",
      license: "Apache-2.0",
    },
  ];
  assert.equal(licenseForPath("docs/example.md", annotations), "Apache-2.0");
  assert.equal(
    licenseForPath("docs/standard.md", annotations),
    "Community-Spec-1.0",
  );
});

test("REUSE recursive globs include files at zero directory depth", () => {
  assert.ok(globMatches("docs/standard.md", "docs/**/*.md"));
  assert.ok(globMatches("docs/concepts/standard.md", "docs/**/*.md"));
  assert.ok(!globMatches("docs/concepts/standard.md", "docs/*.md"));
  assert.ok(!globMatches("docs/x.md", "docs/?.md"));
  assert.ok(globMatches("docs/?.md", "docs/?.md"));
});

test("npm 11 and npm 12 pack output resolve to the same package", () => {
  const result = {
    name: "@open-resource-discovery/specification",
    files: [{ path: "LICENSE" }],
  };
  assert.deepEqual(readPackResult(JSON.stringify([result])), result);
  assert.deepEqual(
    readPackResult(JSON.stringify({ [result.name]: result })),
    result,
  );
});

test("malformed or multiple pack results cannot pass the license check", () => {
  assert.throws(() => readPackResult("{}"), /exactly one npm package/);
  assert.throws(
    () => readPackResult('[{"files": []}, {"files": []}]'),
    /exactly one npm package/,
  );
  assert.throws(
    () => readPackResult('[{"error": "pack failed"}]'),
    /file list/,
  );
});
