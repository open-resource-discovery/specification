import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const repositoryRoot = resolve(__dirname, "../../../");

// Fixtures live in src/, not dist/ — JSON files are not emitted by tsc.
const fixturesDir = resolve(
	repositoryRoot,
	"src/overlay-convert/tests/fixtures",
);

export async function loadRepoFixture<T = unknown>(
	relativePath: string,
): Promise<T> {
	const content = await readFile(resolve(repositoryRoot, relativePath), "utf8");
	return JSON.parse(content) as T;
}

export async function loadLocalFixture<T = unknown>(
	fixtureName: string,
): Promise<T> {
	const content = await readFile(resolve(fixturesDir, fixtureName), "utf8");
	return JSON.parse(content) as T;
}
