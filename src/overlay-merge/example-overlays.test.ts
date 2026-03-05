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

test("applies operation selector (OpenAPI) overlay example to OpenAPI metadata example", async () => {
  const overlay = (await loadJson("examples/overlay/astronomy-api-openapi.overlay.json")) as ORDOverlay;
  const target = (await loadJson("examples/implementation/nginx-no-auth/metadata/astronomy-v1.oas3.json")) as JSONValue;

  const merged = applyOverlayToDocument(target, overlay, {
    requireTargetMatch: true,
    context: {
      ordId: "sap.foo:apiResource:astronomy:v1",
      definitionType: "openapi-v3",
    },
  }) as Record<string, unknown>;

  const paths = merged.paths as Record<string, Record<string, Record<string, unknown>>>;
  const deprecatedOp = paths["/constellations/by-abbreviation/{abbreviation}"]?.get;
  assert.ok(deprecatedOp, "operation getConstellationByAbbreviation should exist");
  assert.equal(deprecatedOp.deprecated, true);
  assert.equal(typeof deprecatedOp["x-deprecation-notice"], "string");

  const components = merged.components as Record<string, unknown>;
  const schemas = components.schemas as Record<string, Record<string, unknown>>;
  const magnitude = (schemas.Star.properties as Record<string, Record<string, unknown>>).magnitude;
  assert.equal(typeof magnitude.description, "string");
  assert.equal(magnitude["x-sap-visibility"], "public");

  assert.ok((schemas.Constellation as Record<string, unknown>).externalDocs, "Constellation should have externalDocs");
});

test("applies operation selector (A2A) overlay example to A2A Agent Card example", async () => {
  const overlay = (await loadJson("examples/overlay/dispute-agent-a2a.overlay.json")) as ORDOverlay;
  const target = (await loadJson("examples/definitions/DisputeResolutionAgentcard.json")) as JSONValue;

  const merged = applyOverlayToDocument(target, overlay, {
    requireTargetMatch: true,
    context: {
      ordId: "sap.foo:apiResource:FICADisputeResolutionAgent:v1",
      definitionType: "a2a-agent-card",
    },
  }) as Record<string, unknown>;

  const skills = merged.skills as Array<Record<string, unknown>>;

  const resolutionSkill = skills.find((s) => s.id === "dispute-case-resolution");
  assert.ok(resolutionSkill, "dispute-case-resolution skill should exist");
  assert.ok(typeof resolutionSkill.description === "string" && resolutionSkill.description.includes("Prerequisites"));
  assert.ok(Array.isArray(resolutionSkill.examples), "examples should be a merged array");

  const recalcSkill = skills.find((s) => s.id === "invoice-recalculation");
  assert.ok(recalcSkill, "invoice-recalculation skill should exist");
  assert.ok(typeof recalcSkill.description === "string" && recalcSkill.description.includes("deterministic"));

  const legacySkill = skills.find((s) => s.id === "legacy-dispute-lookup");
  assert.equal(legacySkill, undefined, "legacy-dispute-lookup skill should have been removed");
});
