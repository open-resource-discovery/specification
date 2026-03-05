import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { ORDOverlay } from "../generated/spec/v1/types";
import { applyOverlayToDocument } from "./merge";
import { JSONValue, OverlayMergeError } from "./types";

const repositoryRoot = resolve(__dirname, "../../");

async function loadJson(relativePath: string): Promise<unknown> {
  const content = await readFile(resolve(repositoryRoot, relativePath), "utf8");
  return JSON.parse(content) as unknown;
}

test("applies JSONPath-based merge, update and remove patches to a JSON metadata file", async () => {
  const openApiSource = (await loadJson(
    "examples/implementation/nginx-no-auth/metadata/astronomy-v1.oas3.json",
  )) as JSONValue;

  const overlay = {
    ordOverlay: "0.1",
    target: {
      url: "/ord/metadata/astronomy-v1.oas3.json",
      definitionType: "openapi-v3",
    },
    patches: [
      {
        action: "merge",
        selector: {
          jsonPath: "$.info",
        },
        data: {
          "x-overlay-note": "metadata enriched",
        },
      },
      {
        action: "merge",
        selector: {
          jsonPath: "$",
        },
        data: {
          tags: ["overlay-tag"],
        },
      },
      {
        action: "remove",
        selector: {
          jsonPath: "$.info",
        },
        data: {
          description: null,
        },
      },
      {
        action: "update",
        selector: {
          jsonPath: "$.servers[0]",
        },
        data: {
          url: "https://example.invalid/astronomy/v1",
        },
      },
      {
        action: "remove",
        selector: {
          jsonPath: "$.paths",
        },
      },
    ],
  } as unknown as ORDOverlay;

  const merged = applyOverlayToDocument(openApiSource, overlay, {
    context: {
      url: "/ord/metadata/astronomy-v1.oas3.json",
      definitionType: "openapi-v3",
    },
    requireTargetMatch: true,
  }) as Record<string, unknown>;

  const info = merged.info as Record<string, unknown>;
  assert.equal(info["x-overlay-note"], "metadata enriched");
  assert.equal("description" in info, false);

  assert.deepEqual(merged.tags, ["overlay-tag"]);
  assert.deepEqual(merged.servers, [{ url: "https://example.invalid/astronomy/v1" }]);
  assert.equal("paths" in merged, false);
});

test("applies ordId selectors to ORD document resources", async () => {
  const documentSource = (await loadJson("examples/documents/document-1.json")) as Record<string, JSONValue>;
  documentSource.customArrayWithoutOrdId = [{ id: "foo", title: "bar" }];
  documentSource.simpleScalarArray = ["a", "b", "c"];

  const overlay = {
    ordOverlay: "0.1",
    target: {
      ordId: "sap.foo:apiResource:astronomy:v1",
    },
    patches: [
      {
        action: "merge",
        selector: {
          ordId: "sap.foo:apiResource:astronomy:v1",
        },
        data: {
          shortDescription: "Overlay short description",
          labels: {
            source: ["overlay"],
          },
        },
      },
      {
        action: "remove",
        selector: {
          ordId: "sap.foo:apiResource:astronomy:v1",
          resourceType: "apiResources",
        },
        data: {
          description: null,
          extensible: {
            supported: null,
          },
        },
      },
      {
        action: "remove",
        selector: {
          ordId: "sap.foo:eventResource:ExampleEventResource:v1",
        },
      },
    ],
  } as unknown as ORDOverlay;

  const merged = applyOverlayToDocument(documentSource as JSONValue, overlay, {
    context: {
      ordId: "sap.foo:apiResource:astronomy:v1",
    },
    requireTargetMatch: true,
  }) as Record<string, unknown>;

  const apiResources = merged.apiResources as Array<Record<string, unknown>>;
  const astronomyApi = apiResources.find((entry) => entry.ordId === "sap.foo:apiResource:astronomy:v1");

  assert.ok(astronomyApi);
  assert.equal(astronomyApi.shortDescription, "Overlay short description");
  assert.equal("description" in astronomyApi, false);
  assert.deepEqual(astronomyApi.labels, { source: ["overlay"] });
  assert.deepEqual(astronomyApi.extensible, {});

  const eventResources = merged.eventResources as Array<Record<string, unknown>>;
  assert.equal(eventResources.length, 1);
  assert.equal(eventResources[0].ordId, "sap.foo:eventResource:BillingDocumentEvents:v1");
  assert.deepEqual(merged.customArrayWithoutOrdId, [{ id: "foo", title: "bar" }]);
  assert.deepEqual(merged.simpleScalarArray, ["a", "b", "c"]);
});

test("accepts singular resourceType hints that pluralize to 'ies'", () => {
  const source = {
    capabilities: [
      {
        ordId: "sap.foo:capability:catalog-search:v1",
        title: "Catalog Search",
      },
    ],
  } as JSONValue;

  const overlay = {
    ordOverlay: "0.1",
    patches: [
      {
        action: "merge",
        selector: {
          ordId: "sap.foo:capability:catalog-search:v1",
          resourceType: "capability",
        },
        data: {
          description: "Overlay enriched capability",
        },
      },
    ],
  } as unknown as ORDOverlay;

  const merged = applyOverlayToDocument(source, overlay) as Record<string, unknown>;
  const capabilities = merged.capabilities as Array<Record<string, unknown>>;
  assert.equal(capabilities[0].description, "Overlay enriched capability");
});

test("appends text to selected string fields", async () => {
  const openApiSource = (await loadJson(
    "examples/implementation/nginx-no-auth/metadata/astronomy-v1.oas3.json",
  )) as JSONValue;

  const overlay = {
    ordOverlay: "0.1",
    target: {
      definitionType: "openapi-v3",
    },
    patches: [
      {
        action: "append",
        selector: {
          jsonPath: "$.info.description",
        },
        data: " Additional overlay details.",
      },
    ],
  } as unknown as ORDOverlay;

  const merged = applyOverlayToDocument(openApiSource, overlay) as Record<string, unknown>;
  const info = merged.info as Record<string, unknown>;
  assert.equal(info.description, "This is just a sample API Additional overlay details.");
});

test("fails append when selected value is not a string", async () => {
  const openApiSource = (await loadJson(
    "examples/implementation/nginx-no-auth/metadata/astronomy-v1.oas3.json",
  )) as JSONValue;

  const overlay = {
    ordOverlay: "0.1",
    target: {
      definitionType: "openapi-v3",
    },
    patches: [
      {
        action: "append",
        selector: {
          jsonPath: "$.servers[0]",
        },
        data: " invalid",
      },
    ],
  } as unknown as ORDOverlay;

  assert.throws(() => applyOverlayToDocument(openApiSource, overlay), OverlayMergeError);
});

test("fails append when data is not a string", async () => {
  const openApiSource = (await loadJson(
    "examples/implementation/nginx-no-auth/metadata/astronomy-v1.oas3.json",
  )) as JSONValue;

  const overlay = {
    ordOverlay: "0.1",
    target: {
      definitionType: "openapi-v3",
    },
    patches: [
      {
        action: "append",
        selector: {
          jsonPath: "$.info.description",
        },
        data: {
          text: " invalid",
        },
      },
    ],
  } as unknown as ORDOverlay;

  assert.throws(() => applyOverlayToDocument(openApiSource, overlay), OverlayMergeError);
});

test("throws when selector has no match by default", async () => {
  const openApiSource = (await loadJson(
    "examples/implementation/nginx-no-auth/metadata/astronomy-v1.oas3.json",
  )) as JSONValue;

  const overlay = {
    ordOverlay: "0.1",
    target: {
      definitionType: "openapi-v3",
    },
    patches: [
      {
        action: "merge",
        selector: {
          jsonPath: "$.does.not.exist",
        },
        data: {
          foo: "bar",
        },
      },
    ],
  } as unknown as ORDOverlay;

  assert.throws(() => applyOverlayToDocument(openApiSource, overlay), OverlayMergeError);
});

test("does not use URL equality for target matching", async () => {
  const openApiSource = (await loadJson(
    "examples/implementation/nginx-no-auth/metadata/astronomy-v1.oas3.json",
  )) as JSONValue;

  const overlay = {
    ordOverlay: "0.1",
    target: {
      url: "/ord/metadata/astronomy-v1.oas3.json",
      definitionType: "openapi-v3",
    },
    patches: [
      {
        action: "merge",
        selector: {
          jsonPath: "$.info",
        },
        data: {
          "x-url-check": "disabled",
        },
      },
    ],
  } as unknown as ORDOverlay;

  const merged = applyOverlayToDocument(openApiSource, overlay, {
    requireTargetMatch: true,
    context: {
      url: "/completely/different/path.json",
      definitionType: "openapi-v3",
    },
  }) as Record<string, unknown>;

  const info = merged.info as Record<string, unknown>;
  assert.equal(info["x-url-check"], "disabled");
});

test("validates openapi-v3 targets by document content", () => {
  const notOpenApiV3 = {
    openapi: "2.0.0",
    info: {
      title: "Legacy API",
      version: "1.0.0",
    },
  } as JSONValue;

  const overlay = {
    ordOverlay: "0.1",
    target: {
      definitionType: "openapi-v3",
    },
    patches: [
      {
        action: "merge",
        selector: {
          jsonPath: "$.info",
        },
        data: {
          "x-should-not-apply": true,
        },
      },
    ],
  } as unknown as ORDOverlay;

  assert.throws(() => applyOverlayToDocument(notOpenApiV3, overlay), OverlayMergeError);
});

test("warns instead of throwing when configured for no-match warnings", async () => {
  const openApiSource = (await loadJson(
    "examples/implementation/nginx-no-auth/metadata/astronomy-v1.oas3.json",
  )) as JSONValue;

  const overlay = {
    ordOverlay: "0.1",
    target: {
      definitionType: "openapi-v3",
    },
    patches: [
      {
        action: "merge",
        selector: {
          jsonPath: "$.does.not.exist",
        },
        data: {
          foo: "bar",
        },
      },
    ],
  } as unknown as ORDOverlay;

  const warnings: string[] = [];
  const originalWarn = console.warn;
  console.warn = (message?: unknown): void => {
    warnings.push(String(message));
  };

  try {
    const merged = applyOverlayToDocument(openApiSource, overlay, {
      noMatchBehavior: "warn",
    });
    assert.deepEqual(merged, openApiSource);
  } finally {
    console.warn = originalWarn;
  }

  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /did not match any target element/);
});
