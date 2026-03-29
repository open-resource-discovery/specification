import { describe, it } from "node:test";
import assert from "node:assert";
import { rewriteSchemaRelativeLinks } from "./rewriteGeneratedSchemaLinks";

const BASE = "https://open-resource-discovery.org";
// The caller passes the schema's specific docs page path (parent dir + schema name)
const DOCS_BASE = "/spec-v1/interfaces/Document";

describe("rewriteSchemaRelativeLinks", () => {
	// For DOCS_BASE = "/spec-v1/interfaces/Document", the parent dir is "/spec-v1/interfaces".
	// So "../" goes up to "/spec-v1", and "../../" goes up to "/".

	it("rewrites relative link with .md extension and anchor", () => {
		const input = `[ORD Document](../index.md#ord-document)`;
		const result = rewriteSchemaRelativeLinks(input, DOCS_BASE);
		assert.strictEqual(
			result,
			`[ORD Document](${BASE}/spec-v1/index#ord-document)`,
		);
	});

	it("rewrites relative link without .md extension", () => {
		const input = `[perspectives](../concepts/perspectives)`;
		const result = rewriteSchemaRelativeLinks(input, DOCS_BASE);
		assert.strictEqual(
			result,
			`[perspectives](${BASE}/spec-v1/concepts/perspectives)`,
		);
	});

	it("rewrites relative link navigating two levels up", () => {
		const input = `[policy levels](../../spec-extensions/policy-levels/)`;
		const result = rewriteSchemaRelativeLinks(input, DOCS_BASE);
		assert.strictEqual(
			result,
			`[policy levels](${BASE}/spec-extensions/policy-levels)`,
		);
	});

	it("rewrites relative link with anchor but no .md extension", () => {
		const input = `[Compatibility](../concepts/compatibility#breaking-changes)`;
		const result = rewriteSchemaRelativeLinks(input, DOCS_BASE);
		assert.strictEqual(
			result,
			`[Compatibility](${BASE}/spec-v1/concepts/compatibility#breaking-changes)`,
		);
	});

	it("leaves absolute https URLs unchanged", () => {
		const input = `[SemVer](https://semver.org/)`;
		const result = rewriteSchemaRelativeLinks(input, DOCS_BASE);
		assert.strictEqual(result, input);
	});

	it("leaves absolute http URLs unchanged", () => {
		const input = `[schema](http://json-schema.org/draft-07/schema#)`;
		const result = rewriteSchemaRelativeLinks(input, DOCS_BASE);
		assert.strictEqual(result, input);
	});

	it("leaves JSON Schema $ref anchors (#/) unchanged", () => {
		const input = `[ref](#/definitions/ApiResource)`;
		const result = rewriteSchemaRelativeLinks(input, DOCS_BASE);
		assert.strictEqual(result, input);
	});

	it("rewrites pure fragment links against the docs base path", () => {
		const input = `[section](#ord-id)`;
		const result = rewriteSchemaRelativeLinks(input, DOCS_BASE);
		assert.strictEqual(
			result,
			`[section](${BASE}/spec-v1/interfaces/Document#ord-id)`,
		);
	});

	it("handles multiple links in one string", () => {
		const input = `See [perspectives](../index.md#perspectives) and [policy levels](../../spec-extensions/policy-levels/).`;
		const result = rewriteSchemaRelativeLinks(input, DOCS_BASE);
		assert.strictEqual(
			result,
			`See [perspectives](${BASE}/spec-v1/index#perspectives) and [policy levels](${BASE}/spec-extensions/policy-levels).`,
		);
	});

	it("does not alter non-link content", () => {
		const input = `Plain text with no links.`;
		const result = rewriteSchemaRelativeLinks(input, DOCS_BASE);
		assert.strictEqual(result, input);
	});
});
