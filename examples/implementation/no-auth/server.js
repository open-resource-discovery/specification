// This is a minimalist implementation of the ORD Spec
// It covers the ORD document, the document endpoint and the .well-known Configuration
// It works without external dependencies and only relies on the Node.js standard library

// ⚠ This implementation makes the following assumptions and simplifications:
// * All information is public and there is NO authentication / authorization!
// * There is no distinction between system instances and no multi-tenancy considered!
//   This assumes all system instances behave the same from ORD perspective
//
// Please note that it is usually not advisable to manually create ORD documents.
// Instead they should be automatically created or derived from internal metadata or reflections.

const crypto = require("crypto");
const http = require("http");

// Configuration
const port = 8080;
const wellKnownUrl = "/.well-known/open-resource-discovery"; // This path MUST be identical in any implementation
const ordConfig = {
  openResourceDiscoveryV1: {
    documents: [
      {
        url: "/ord/documents/1.json",
        accessStrategies: [
          {
            type: "open",
          },
        ],
      },
    ],
  },
};

// Here we load the metadata files at server startup (statically).
// If the metadata is calculated / changed at runtime, the retrieval / calculation of it needs to be done per request
const openDiscoveryDocument1 = require("../../examples/document-1.json");
const openApiDocument = require("../nginx-no-auth/metadata/astronomy-v1.oas3.json");

const requestListener = function (req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "private, max-age=360");

  if (req.method === "GET" && req.url === wellKnownUrl) {
    jsonResponse(req, res, ordConfig);
  } else if (req.method === "GET" && req.url.startsWith(ordConfig.openResourceDiscoveryV1.documents[0].url)) {
    jsonResponse(req, res, openDiscoveryDocument1);
  } else if (req.method === "GET" && req.url.startsWith("/ord/metadata/astronomy-v1.oas3.json")) {
    jsonResponse(req, res, openApiDocument);
  } else {
    res.writeHead(404).end(
      JSON.stringify({
        error: {
          code: "NOT_FOUND",
          message: "Requested resource not found.",
        },
      }),
    );
  }
};

http.createServer(requestListener).listen(port);

console.info(`> ORD Configuration:   http://localhost:${port}${wellKnownUrl}`);
console.info(`> ORD document 1:      http://localhost:${port}${ordConfig.openResourceDiscoveryV1.documents[0].url}`);
console.info(`> OpenAPI example:     http://localhost:${port}/ord/metadata/astronomy-v1.oas3.json`);

//////////////////////////////////////////////////
// HELPER FUNCTIONS                             //
//////////////////////////////////////////////////

function jsonResponse(req, res, jsonObject) {
  // OPTIONAL: Create an hash for the JSON response and send it as an ETag
  const jsonObjectHash = crypto.createHash("sha256").update(JSON.stringify(jsonObject)).digest("hex");
  res.setHeader("ETag", `"${jsonObjectHash}"`); // RECOMMENDED eTag hash

  if (req.headers["if-none-match"] === `"${jsonObjectHash}"`) {
    // OPTIONAL: ETag 304 response handling. This may be done automatically by an HTTP framework / server
    res.writeHead(304).end();
  } else {
    res.writeHead(200).end(JSON.stringify(jsonObject));
  }
}
