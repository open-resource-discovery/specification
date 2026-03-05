import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { ORDOverlay } from "../generated/spec/v1/types";
import { applyOverlayToDocument } from "./merge";
import { JSONValue } from "./types";

const repositoryRoot = resolve(__dirname, "../../");

async function loadJson(relativePath: string): Promise<unknown> {
  const content = await readFile(resolve(repositoryRoot, relativePath), "utf8");
  return JSON.parse(content) as unknown;
}

test("applies JSONPath overlay example to OpenAPI metadata example", async () => {
  const overlay = (await loadJson("examples/overlay/astronomy-api-openapi-jsonpath.overlay.json")) as ORDOverlay;
  const target = (await loadJson("examples/implementation/nginx-no-auth/metadata/astronomy-v1.oas3.json")) as JSONValue;

  const merged = applyOverlayToDocument(target, overlay, {
    requireTargetMatch: true,
    context: {
      url: "/ord/metadata/astronomy-v1.oas3.json",
      definitionType: "openapi-v3",
    },
  }) as Record<string, unknown>;

  const info = merged.info as Record<string, unknown>;
  assert.equal(info["x-overlay-note"], "Overlay applied from example file");
  assert.equal("description" in info, false);

  assert.deepEqual(merged.servers, [{ url: "https://overlay.example.invalid/astronomy/v1" }]);
});

test("applies ORD document overlay example to ORD document metadata example", async () => {
  const overlay = (await loadJson("examples/overlay/document-1-ord.overlay.json")) as ORDOverlay;
  const target = (await loadJson("examples/documents/document-1.json")) as JSONValue;

  const merged = applyOverlayToDocument(target, overlay, {
    requireTargetMatch: true,
    context: {
      url: "/examples/documents/document-1.json",
    },
  }) as Record<string, unknown>;

  const apiResources = merged.apiResources as Array<Record<string, unknown>>;
  const astronomyApi = apiResources.find((entry) => entry.ordId === "sap.foo:apiResource:astronomy:v1");

  assert.ok(astronomyApi);
  assert.equal(astronomyApi.shortDescription, "Astronomy API (overlay-enriched)");
  assert.equal("description" in astronomyApi, false);
  assert.deepEqual(astronomyApi.labels, { overlay: ["ord-document-example"] });

  const eventResources = merged.eventResources as Array<Record<string, unknown>>;
  const billingEvents = eventResources.find((entry) => entry.ordId === "sap.foo:eventResource:BillingDocumentEvents:v1");

  assert.ok(billingEvents);
  assert.deepEqual(billingEvents.labels, { overlay: ["billing-events"] });
});
