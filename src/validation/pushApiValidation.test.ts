import { before, describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import Ajv from "ajv/dist/2020";
import type { ValidateFunction } from "ajv";
import addFormats from "ajv-formats";

interface OpenApi {
  components: {
    schemas: Record<string, object>;
    responses: Record<string, { content: Record<string, { schema: object }> }>;
  };
  paths: Record<
    string,
    Record<
      string,
      { description: string; responses: Record<string, { $ref?: string }> }
    >
  >;
}

let openapi: OpenApi;
let contextValidator: ValidateFunction;
let requestValidator: ValidateFunction;
let issueValidator: ValidateFunction;
let unsupportedFormatValidator: ValidateFunction;
let documentSchema: {
  properties: Record<string, { items?: { $ref?: string } }>;
  definitions: Record<string, { properties?: Record<string, unknown> }>;
};

before(async () => {
  const { loadYaml } = await import(
    "@open-resource-discovery/spec-toolkit/dist/util/yaml.js"
  );
  openapi = loadYaml(
    fs.readFileSync("./spec/v1/AggregatorPushAPI.oas3.yaml", "utf8"),
  ) as OpenApi;
  documentSchema = JSON.parse(
    fs.readFileSync(
      "./src/generated/spec/v1/schemas/Document.schema.json",
      "utf8",
    ),
  );
  const ajv = new Ajv({ strict: false, allErrors: true });
  addFormats(ajv);
  const id = "https://example.org/AggregatorPushAPI.oas3.yaml";
  ajv.addSchema({ components: openapi.components }, id);
  const component = (name: string) =>
    ajv.compile({ $ref: `${id}#/components/schemas/${name}` });
  contextValidator = component("PublicationContext");
  requestValidator = component("CreateSubmissionRequest");
  issueValidator = component("ValidationIssue");
  unsupportedFormatValidator = ajv.compile({
    $ref:
      id +
      "#/components/responses/UnsupportedMediaType/content/application~1problem+json/schema",
  });
});

describe("Push OpenAPI 3.1 contract", () => {
  for (const perspective of [
    "system-type",
    "system-version",
    "system-instance",
    "system-independent",
  ]) {
    for (const version of [false, true]) {
      for (const instance of [false, true]) {
        it(`${perspective}, version=${version}, instance=${instance}`, () => {
          const context = {
            perspective,
            ...(version ? { systemVersion: "1.0.0" } : {}),
            ...(instance ? { systemInstanceId: "tenant-42" } : {}),
          };
          const valid =
            (!version || perspective === "system-version") &&
            (!instance || perspective === "system-instance");
          assert.equal(contextValidator(context), valid);
          for (const publicationMode of [undefined, "merge", "replace"]) {
            assert.equal(
              requestValidator({
                context,
                ...(publicationMode ? { publicationMode } : {}),
              }),
              valid,
            );
          }
        });
      }
    }
  }

  it("allows credential-derived versions and instances without requiring request fields", () => {
    for (const perspective of ["system-version", "system-instance"])
      assert.ok(contextValidator({ perspective }));
  });

  it("requires a perspective and preserves identity field bounds", () => {
    for (const context of [
      {},
      { perspective: "unknown" },
      { perspective: "system-version", systemVersion: "" },
      { perspective: "system-instance", systemInstanceId: "" },
      { perspective: "system-instance", systemInstanceId: "a".repeat(256) },
      { perspective: "system-type", target: "request-supplied-authority" },
    ])
      assert.equal(contextValidator(context), false);
    assert.ok(
      contextValidator({
        perspective: "system-instance",
        systemInstanceId: "a".repeat(255),
      }),
    );
  });

  it("documents creation's unsupported media type and encoding errors", () => {
    assert.equal(
      openapi.paths["/v1/submissions"].post.responses["415"].$ref,
      "#/components/responses/UnsupportedMediaType",
    );
    for (const kind of ["content-encoding", "media-type"]) {
      assert.ok(
        unsupportedFormatValidator({
          type: `https://example.org/problems/unsupported-${kind}`,
          title: "Unsupported Media Type",
          status: 415,
        }),
      );
    }
  });

  it("covers every schema collection that declares resource definition entries", () => {
    const labels: Record<string, string> = {
      entityTypes: "Entity Types",
      capabilities: "Capabilities",
      overlays: "Overlays",
    };
    const descriptions = [
      openapi.paths["/v1/submissions/{submissionId}/documents/{artifactId}"].put
        .description,
      openapi.paths[
        "/v1/submissions/{submissionId}/resource-definitions/{artifactId}"
      ].put.description,
      fs
        .readFileSync("./docs/spec-v1/index.md", "utf8")
        .split("\n")
        .find((line) => line.includes("a **definition entry**")),
    ];
    const covered = new Set<string>();
    for (const [collection, property] of Object.entries(
      documentSchema.properties,
    )) {
      const name = property.items?.$ref?.split("/").at(-1);
      if (!name) continue;
      const properties = documentSchema.definitions[name]?.properties;
      if (properties?.definitions === undefined) continue;
      assert.ok(
        labels[collection],
        `Undocumented definition-bearing collection: ${collection}`,
      );
      covered.add(collection);
      for (const description of descriptions)
        assert.ok(description?.includes(labels[collection]), collection);
    }
    assert.deepEqual([...covered].sort(), Object.keys(labels).sort());
  });

  it("distinguishes unit-local, artifact-level, and submission-wide diagnostics", () => {
    const base = { severity: "error", message: "Validation failed" };
    for (const field of ["ordId", "groupId", "groupTypeId"]) {
      assert.ok(
        issueValidator({
          ...base,
          artifactKind: "document",
          artifactId: "doc",
          [field]: "unit",
        }),
      );
      assert.equal(
        issueValidator({
          ...base,
          artifactKind: "submission",
          [field]: "unit",
        }),
        false,
      );
    }
    assert.ok(
      issueValidator({
        ...base,
        artifactKind: "document",
        artifactId: "doc",
        jsonPointer: "/perspective",
      }),
    );
    assert.ok(issueValidator({ ...base, artifactKind: "submission" }));
    assert.equal(issueValidator({ ...base, artifactKind: "document" }), false);
    assert.equal(
      issueValidator({
        ...base,
        artifactKind: "document",
        artifactId: "doc",
        ordId: "unit",
        groupId: "group",
      }),
      false,
    );
    assert.equal(
      issueValidator({
        ...base,
        artifactKind: "resource-definition",
        artifactId: "definition",
      }),
      false,
    );
    assert.ok(
      issueValidator({
        ...base,
        artifactKind: "resource-definition",
        artifactId: "definition",
        definitionUrl: "/api.json",
      }),
    );
  });
});
