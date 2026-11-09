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
let uploadProblemValidator: ValidateFunction;
let issuePageValidator: ValidateFunction;
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
  issuePageValidator = component("IssuePage");
  uploadProblemValidator = ajv.compile({
    $ref:
      id +
      "#/components/responses/UnprocessableContent/content/application~1problem+json/schema",
  });
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
            ...(instance
              ? { systemInstances: [{ localId: "tenant-42" }] }
              : {}),
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
      { perspective: "system-instance", systemInstances: [{ localId: "" }] },
      {
        perspective: "system-instance",
        systemInstances: [{ localId: "a".repeat(256) }],
      },
      { perspective: "system-type", target: "request-supplied-authority" },
    ])
      assert.equal(contextValidator(context), false);
    assert.ok(
      contextValidator({
        perspective: "system-instance",
        systemInstances: [{ localId: "a".repeat(255) }],
      }),
    );
  });

  it("accepts shared tenant batches using each ORD identity form", () => {
    for (const publicationMode of ["merge", "replace"]) {
      assert.ok(
        requestValidator({
          publicationMode,
          context: {
            perspective: "system-instance",
            systemInstances: [
              { localId: "tenant-42" },
              { globalId: "c6c80b52-ecc1-47f8-9303-0d55fb67fd41" },
              { correlationIds: ["sap.cld:tenant:741234567"] },
              {
                localId: "tenant-43",
                globalId: "global-43",
                correlationIds: ["sap.cld:tenant:43"],
              },
            ],
          },
        }),
      );
    }
  });

  it("rejects empty, malformed, duplicate, and legacy instance selections", () => {
    for (const systemInstances of [
      [],
      [{}],
      ["tenant-42"],
      [{ localId: "" }],
      [{ globalId: "" }],
      [{ globalId: "a".repeat(256) }],
      [{ correlationIds: [] }],
      [{ correlationIds: ["invalid"] }],
      [{ correlationIds: [`sap.cld:tenant:${"a".repeat(256)}`] }],
      [{ localId: "tenant-42", extra: "unknown" }],
      [{ localId: "tenant-42" }, { localId: "tenant-42" }],
    ]) {
      assert.equal(
        contextValidator({ perspective: "system-instance", systemInstances }),
        false,
      );
    }
    assert.equal(
      contextValidator({
        perspective: "system-instance",
        systemInstanceId: "tenant-42",
      }),
      false,
    );
  });

  it("keeps instance identity bounds aligned with the ORD Document", () => {
    const identity = openapi.components.schemas.SystemInstanceIdentity as {
      properties: Record<
        string,
        { maxLength?: number; items?: { pattern?: string; maxLength?: number } }
      >;
    };
    const instance = documentSchema.definitions.SystemInstance
      .properties as typeof identity.properties;
    for (const field of ["localId", "globalId"])
      assert.equal(
        identity.properties[field].maxLength,
        instance[field].maxLength,
      );
    assert.equal(
      identity.properties.correlationIds.items?.pattern,
      instance.correlationIds.items?.pattern,
    );
    assert.equal(
      identity.properties.correlationIds.items?.maxLength,
      instance.correlationIds.items?.maxLength,
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

  it("supports upload-time context rejection with artifact-level diagnostics", () => {
    assert.equal(
      openapi.paths["/v1/submissions/{submissionId}/documents/{artifactId}"].put
        .responses["422"].$ref,
      "#/components/responses/UnprocessableContent",
    );
    const issue = {
      severity: "error",
      code: "publication.context",
      message: "The document does not match the authorized context",
      artifactKind: "document",
      artifactId: "doc",
      jsonPointer: "/describedSystemVersion/version",
    };
    assert.ok(issueValidator(issue));
    assert.ok(
      uploadProblemValidator({
        type: "https://example.org/problems/invalid-document-context",
        title: "Unprocessable Content",
        status: 422,
        issues: [issue],
      }),
    );
  });

  it("supports rejected Package-removal outcomes with unit and submission diagnostics", () => {
    const items = [
      {
        severity: "error",
        message: "The staged resource's Package is missing",
        artifactKind: "document",
        artifactId: "doc",
        ordId: "example:apiResource:resource:v1",
        jsonPointer: "/apiResources/0/partOfPackage",
      },
      {
        severity: "error",
        code: "publication.package-removal",
        message: "Removal would break a retained resource's Package reference",
        artifactKind: "submission",
      },
    ];
    for (const item of items) assert.ok(issueValidator(item));
    assert.ok(issuePageValidator({ submissionStatus: "rejected", items }));
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
