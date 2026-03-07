import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";
import { promisify } from "node:util";
import { createOrdOverlay, createOverlayPatch } from "./test-helpers";

const execFileAsync = promisify(execFile);
const cliPath = resolve(__dirname, "../cli.js");

test("cli --help prints usage and the JSON-only note", async () => {
	const { stderr } = await execFileAsync(process.execPath, [cliPath, "--help"]);

	assert.match(stderr, /Usage:/);
	assert.match(stderr, /JSON files only/);
});

test("cli rejects YAML overlay files with a clear error", async () => {
	const tempDir = await mkdtemp(resolve(tmpdir(), "overlay-merge-cli-"));
	const overlayPath = resolve(tempDir, "overlay.yaml");
	const inputPath = resolve(tempDir, "input.json");

	await writeFile(overlayPath, "ordOverlay: 0.1\n", "utf8");
	await writeFile(
		inputPath,
		JSON.stringify({
			openapi: "3.0.0",
			info: {
				title: "Astronomy",
			},
		}),
		"utf8",
	);

	await assert.rejects(
		() =>
			execFileAsync(process.execPath, [
				cliPath,
				"--overlay",
				overlayPath,
				"--input",
				inputPath,
			]),
		(error: Error & { stderr?: string }) => {
			assert.match(error.stderr ?? "", /is YAML/);
			assert.match(error.stderr ?? "", /supports JSON only/);
			return true;
		},
	);
});

test("cli applies an overlay and writes JSON output to stdout", async () => {
	const tempDir = await mkdtemp(resolve(tmpdir(), "overlay-merge-cli-"));
	const overlayPath = resolve(tempDir, "overlay.json");
	const inputPath = resolve(tempDir, "input.json");

	await writeFile(
		overlayPath,
		JSON.stringify(
			createOrdOverlay({
				target: {
					definitionType: "openapi-v3",
				},
				patches: [
					createOverlayPatch({
						selector: {
							jsonPath: "$.info",
						},
						data: {
							"x-cli-tested": true,
						},
					}),
				],
			}),
			null,
			2,
		),
		"utf8",
	);

	await writeFile(
		inputPath,
		JSON.stringify(
			{
				openapi: "3.0.0",
				info: {
					title: "Astronomy",
				},
			},
			null,
			2,
		),
		"utf8",
	);

	const { stdout } = await execFileAsync(process.execPath, [
		cliPath,
		"--overlay",
		overlayPath,
		"--input",
		inputPath,
		"--target-definition-type",
		"openapi-v3",
	]);

	const merged = JSON.parse(stdout) as { info: Record<string, unknown> };
	assert.equal(merged.info["x-cli-tested"], true);
});

test("cli writes output files when --output is provided", async () => {
	const tempDir = await mkdtemp(resolve(tmpdir(), "overlay-merge-cli-"));
	const overlayPath = resolve(tempDir, "overlay.json");
	const inputPath = resolve(tempDir, "input.json");
	const outputPath = resolve(tempDir, "output.json");

	await writeFile(
		overlayPath,
		JSON.stringify(
			createOrdOverlay({
				target: {
					definitionType: "openapi-v3",
				},
				patches: [
					createOverlayPatch({
						selector: {
							jsonPath: "$.info",
						},
						data: {
							title: "Patched Title",
						},
					}),
				],
			}),
			null,
			2,
		),
		"utf8",
	);

	await writeFile(
		inputPath,
		JSON.stringify(
			{
				openapi: "3.0.0",
				info: {
					title: "Astronomy",
				},
			},
			null,
			2,
		),
		"utf8",
	);

	await execFileAsync(process.execPath, [
		cliPath,
		"--overlay",
		overlayPath,
		"--input",
		inputPath,
		"--target-definition-type",
		"openapi-v3",
		"--output",
		outputPath,
	]);

	const rendered = await readFile(outputPath, "utf8");
	const merged = JSON.parse(rendered) as { info: Record<string, unknown> };
	assert.equal(merged.info.title, "Patched Title");
});
