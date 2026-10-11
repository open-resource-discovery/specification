---
title: Generic Relationships (Draft)
description: Proposed directed relationships between ORD resources and elements of their native definitions.
---

# Generic Relationships

:::warning Draft proposal

This is a proposal for a future release, not part of the published ORD 1.16 contract.
The schema is marked beta for review. A release version must be assigned before
this change is merged. The `ord:` predicates below are candidates for
standardization, rather than a finalized vocabulary.

:::

## Problem and scope

ORD already describes resources and many useful associations. For example,
`exposedEntityTypes` connects an API to an Entity Type; `relatedApiResources`
connects a Capability to APIs; Integration Dependencies select operations; and
ORD Overlays select native definition elements.

These mechanisms answer different questions. A related API does not identify
which operation implements a capability or whether that operation reads or
modifies a business concept. A dependency describes an integration requirement;
an overlay changes a definition. Neither is a general semantic assertion.

This proposal adds one reusable relationship representation:

**source → relationType → target**

The endpoints can be whole ORD resources, exact native definition elements, or
external metadata concepts. The operation signature stays in OpenAPI, OData,
MCP, or the appropriate native contract. An operation may become a node in an
aggregator's index without becoming another published ORD resource.

## Publication and ownership

The proposed `relationships` property is a document-level list. It supports:

1. **Provider-owned assertions.** An application publishes relationships involving
   its own resources and definitions.
2. **Curated assertions.** A customer or architecture authority publishes a
   separate ORD Document describing mappings between resources across systems.
   It owns those assertions, not the underlying resources.

A relationships-only ORD Document can use the existing document discovery and
access mechanisms. Its publisher and publication context must be supplied by
the existing provider/configuration/perspective machinery; this proposal does
not introduce a new transport or treat an arbitrary public JSON file as trusted.

The publisher MUST give each assertion a distinct, stable `localId` within its
document. Aggregators MUST retain the document URL, publisher identity, customer
scope, perspective, and described-system context. They MUST NOT merge assertions
solely because `localId` or an endpoint ORD ID has the same text.

The same claim can be made by several publishers. Consumers MUST retain the
origins independently. Contradictory claims MUST NOT silently overwrite each
other or modify the authoritative resource contract. A removed assertion is
removed from that publisher/document snapshot; it is not a global retraction of
other publishers' assertions.

:::note Publication decision for review

A document-level list avoids repeating a different relationship shape on every
resource. A resource-owned convenience property could be added later with the
same endpoint semantics. Whether independently curated sets need a separately
identifiable ORD resource is an open design question; this draft does not require
one to make the basic mechanism reviewable.

:::

## Exact references to native elements

An ORD endpoint begins with `ordId`. If it selects a definition element, it also
provides:

- `resourceVersion`: the exact version of the authoritative ORD resource;
- `definition.type` and `definition.url`: one definition actually published by
  that resource, with its URL resolved to an absolute URL;
- `element`: one exact native selector;
- optionally `definition.sha256`: a digest of the definition file's bytes.

Relative definition URLs are resolved against the **referenced provider's**
document/base URL before publication in the relationship. Resolving a foreign
provider's URL against the relationship publisher would identify a different file.

| Selector | Scope and interpretation |
| --- | --- |
| `operation` | OpenAPI `operationId`, MCP tool name, A2A skill ID, or namespace-qualified OData action/function name or signature. It aligns with the existing ORD Overlay operation selector vocabulary. |
| `jsonPointer` | A non-root RFC 6901 pointer to exactly one element of a JSON/YAML definition. For OpenAPI without `operationId`, it can point to a path/method object. It is not a JSONPath expression. |
| `nativeId` | An identifier whose scope and matching rules are defined by a native format profile, such as a CSN entity name, BPMN task ID, DMN decision ID, or Arazzo `workflowId`. Unsupported profiles remain unresolved. |

OData overloads require a signature if the qualified name alone matches more than
one declaration. An A2A skill is an advertised task ability; referring to it does
not turn it into an independently callable API operation. OData entity-set CRUD
requires a suitable contract-element profile; an action selector alone does not
address every possible interaction.

### Runtime-discovered definitions

This draft's `definition` reference selects a definition file published by the
resource. For MCP, `operation` identifies a tool within such a provider-published
tool-definition snapshot, using an agreed custom definition type. ORD 1.16 does
not standardize a static MCP definition type. A bare MCP tool name is not enough
to resolve a contract from an arbitrary live `tools/list` response: the response
can depend on the server, caller, and discovery state.

A runtime-definition reference profile should establish retrieval, identity,
snapshot/version semantics, and access scope before claiming interoperable live
MCP resolution. This is a follow-up decision, not an implied capability of the
file-based reference. The same principle applies to other dynamically advertised
interfaces.

An external `uri` can instead identify an ontology concept or a model element
outside ORD. It is an identity reference and does not require fetching the URI.
External URIs MUST NOT trigger unrestricted retrieval. Endpoints describe
metadata concepts and definitions, not individual purchase orders or other
business-instance records.

### Resolution rules

A consumer that reports a relationship as resolved MUST:

1. Resolve the ORD ID in the applicable customer and publication context.
2. Match the requested `resourceVersion`, if supplied.
3. Match the definition type and effective absolute URL against authoritative
   resource metadata; an arbitrary URL in a claim is not a new authoritative contract.
4. Verify a supplied digest, and apply the definition's native parsing rules.
5. Match exactly one element. Zero matches are unresolved; several are ambiguous.
6. Retain the publisher, resource version, selected definition, and resolution result.

Inaccessible, unsupported, ambiguous, missing, and version-mismatched endpoints
MUST remain distinguishable. Consumers MUST NOT guess a match by string similarity,
discard unresolved claims as if they were false, or present stale matches as current.
An endpoint without `element` refers to the resource itself and does not imply
selection of all its operations.

## Proposed standard predicates

These initial candidates cover a small navigable path from an available interface
to its business purpose and affected entity. The relation is directed from source
to target. None is symmetric or transitive; consumers MUST NOT infer equality,
permissions, or additional links from these predicates alone.

| Candidate | Intended source | Intended target | Assertion and limits |
| --- | --- | --- | --- |
| `ord:implementsCapability` | API, agent, workflow/skill capability, or exact native element | ORD Capability | The source realizes the target's ability or feature. It does not imply that their contracts, permissions, or lifecycle are identical. |
| `ord:readsEntityType` | Exact native interface element | ORD Entity Type | The source declares read access to instances of the concept. It does not promise complete representation, current data, caller permission, or freedom from other effects. |
| `ord:modifiesEntityType` | Exact native interface element | ORD Entity Type | The source declares possible creation, modification, deletion, or a state transition. Detailed effects, concurrency, reversibility, and transaction semantics remain in native contracts and applications. |
| `ord:representsConcept` | Entity/schema element in a model definition | ORD Entity Type or externally identified concept | The element represents that concept in a particular model. It does not establish record identity, schema equivalence, equivalent domain rules, or a lossless transformation. |

This table defines semantic endpoint restrictions that require semantic validation;
JSON Schema verifies the structural reference shape. Validation tooling can check
the endpoint categories once the authoritative resources/definitions are available.

Consumers SHOULD index inverse traversal rather than require producers to publish
inverse copies. For example, find implementations by traversing incoming
`ord:implementsCapability` edges. This does not make the predicate symmetric.

Custom predicates MUST use an owner-controlled Concept ID namespace, define their
direction and permitted endpoint categories, and document their meaning. Unknown
predicates MUST be preserved without an invented interpretation. Vendors MUST NOT
mint their own `ord:` predicates.

### Candidates to evaluate through implementation experience

- `automatesProcessStep`: workflow element → BPMN task;
- `usesDecision`: process/workflow element → DMN decision;
- `governedBy`: interface/process element → a policy definition;
- more precise read/write/effect predicates when a concrete consumer needs them.

These are intentionally not additional standardized `ord:` values in this draft.
Process and policy links need agreed element resolution and clear responsibilities.
Identity/equivalence predicates should be coordinated with existing `related*`
semantics and the separate [same-as proposal](https://github.com/open-resource-discovery/specification/pull/119).

## Example: capability → operation → business concept

The following is a **fragment of the proposed document schema**, not a valid
fragment of the released ORD 1.16 schema. All names and URLs are fictional.

```json
{
  "relationships": [
    {
      "localId": "release-implements-release-capability",
      "source": {
        "ordId": "example.erp:apiResource:Procurement:v1",
        "resourceVersion": "1.4.0",
        "definition": {
          "type": "openapi-v3",
          "url": "https://erp.example.com/metadata/procurement-openapi.json"
        },
        "element": { "operation": "releaseOrder" }
      },
      "relationType": "ord:implementsCapability",
      "target": { "ordId": "example.procurement:capability:OrderRelease:v1" },
      "visibility": "internal"
    },
    {
      "localId": "release-modifies-order",
      "source": {
        "ordId": "example.erp:apiResource:Procurement:v1",
        "resourceVersion": "1.4.0",
        "definition": {
          "type": "openapi-v3",
          "url": "https://erp.example.com/metadata/procurement-openapi.json"
        },
        "element": { "operation": "releaseOrder" }
      },
      "relationType": "ord:modifiesEntityType",
      "target": { "ordId": "example.procurement:entityType:PurchaseOrder:v1" },
      "visibility": "internal",
      "description": "Declares a release transition; the application enforces approval and caller authorization."
    }
  ]
}
```

An aggregator can find the native operation related to an order-release capability,
follow its declared entity effect, and retrieve the correct contract. It still
needs record-key mappings, runtime instance/tenant resolution, fresh state, and
application authorization before an actual invocation.

If the OpenAPI operation has no `operationId`, its element selector could be:

```json
{ "jsonPointer": "/paths/~1orders~1{id}~1release/post" }
```

An external business-process task could be referenced as:

```json
{ "uri": "https://architecture.example.com/models/approval-v2.bpmn#ReleaseOrder" }
```

The fragment's local IDs, document identity, resource versions and publication
context are retained with the indexed edges. They are not deployment addresses.

## Coexistence with existing mechanisms

| Existing mechanism | Responsibility retained |
| --- | --- |
| `exposedEntityTypes`, `relatedEntityTypes`, `relatedApiResources`, `relatedEventResources`, `relatedCapabilities` | Existing resource associations and their specific semantics. |
| Integration Dependency aspects and subsets | Required integration resources/operations and AND/OR choices. |
| ORD Overlays | Patching or enriching definitions using existing native selectors. |
| Compatibility relationships | Declared compatibility with another interface contract. |
| Document perspectives and described-system metadata | Static/customer/system-instance publication and resolution context. |
| CSN Interop `EntityRelationship` annotations | Native conceptual entity/property mapping conventions. |

Aggregators MAY project specialized links into a common index when their direction,
endpoints, and semantics are preserved. They MUST NOT treat a general `related`
association as an implementation or modification claim. Duplicate assertions
from different mechanisms/publishers remain attributable to their sources.

When an authoritative native model already expresses a conceptual mapping, consumers
can index that mapping directly. A generic assertion is useful for cross-format or
independently curated mappings; publishing a duplicate is not required.

## Access, trust, and lifecycle

Visibility describes the audience for the assertion, not permission to execute
the referenced interface. Providers and aggregators MUST enforce metadata access
and MUST NOT expose restricted relationship/endpoint information through an
otherwise visible traversal or index entry.

The claim is attributable to its publisher. It is not necessarily accepted by
the endpoint owners. Consumers need their own trust/review rules, must preserve
conflicts, and must check authoritative runtime rules for actual actions.

An LLM may propose a relationship, but a publisher needs a defined acceptance
process before distributing it as an asserted relationship. A richer interoperable
provenance/review profile, confidence semantics, and cryptographic signing are
follow-up topics rather than implied guarantees of this structural model.

## Decisions before stabilization

1. Confirm document-level publication and independently curated assertion ownership.
2. Assign the release version and experimental-to-stable migration policy.
3. Agree exact native-element profiles, especially OData CRUD and non-JSON formats.
   Include a profile for runtime-discovered tool definitions before claiming live MCP resolution.
4. Validate the four proposed predicates with producers and at least one consumer.
5. Define semantic validation and assertion access behavior across resource owners.
6. Confirm whether a digest is sufficient for consumers that need immutable references.

## References

- [ORD identifiers](./identifiers.md), [Integration Dependencies](./integration-dependency.md), and [Perspectives](./perspectives.md).
- [ORD Overlay selectors](../interfaces/OrdOverlay.md#overlay-selector-by-operation).
- [CSN EntityRelationship](https://sap.github.io/csn-interop-specification/spec-v1/extensions/entity-relationship).
- [JSON Pointer, RFC 6901](https://www.rfc-editor.org/rfc/rfc6901).
- [OpenAPI](https://spec.openapis.org/oas/latest.html), [MCP tools](https://modelcontextprotocol.io/specification/latest/server/tools), and [A2A Agent Skills](https://a2a-protocol.org/latest/specification/).
