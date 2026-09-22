---
date: 2026-09-06
depends-on:
  - ./001-add-push-transport-alongside-pull.md
---

# Authorize pushes using publisher credentials

## Context and Problem Statement

A request can contain described-system identifiers and ORD namespaces, but those values cannot establish who may publish them.
Publication context can also be assigned to credentials during onboarding, while request parameters can disambiguate credentials that cover several authorized contexts.
How should an aggregator resolve and authorize pushes without requiring one credential technology or one credential per system instance?

## Decision Drivers

- Keep the document endpoint free of required transport-specific context parameters.
- Do not trust identifiers merely because they occur in a request.
- Allow several credentials for the same publisher.
- Allow credentials to be restricted to particular perspectives, system versions, or system instances without making such restrictions universal.
- Prevent one credential from publishing for unrelated system types or authorities.
- Keep described-system identity separate from ownership expressed by ORD ID namespaces.
- Support system-independent publication.

## Decision Outcome

Chosen option: **associate each credential with exactly one publisher and its authorized publication contexts in aggregator state**.

### Version-1 (MVP) scope

- **Required:** every operation is authenticated; each credential identifies one publisher; the aggregator resolves exactly one authorized publication context; publisher and ORD-namespace permissions are validated separately.
- **Optional v1 choices:** aggregators choose an established machine-to-machine authentication mechanism, can issue several credentials for one publisher, and can restrict a credential to particular perspectives, system versions, or system instances.
- **Future extension:** a system-deployment perspective could represent metadata shared by several system instances, but version 1 does not define that domain concept.

For authorization, the publisher is one of:

- one described system type, identified by its `describedSystemType.systemNamespace`; or
- one system-independent publisher, identified by an authority or other owning ORD namespace.

An aggregator MAY issue several credentials for the same publisher.
A credential MUST NOT authorize several described system types or independent publishers.
An aggregator MAY further restrict a credential to particular perspectives, system versions, or system instances.
ORD does not impose such restrictions based on the kind of publisher: for example, a customer-operated system is not universally restricted to `system-instance`, while an aggregator MAY enforce that restriction for a credential during onboarding.

For a system-scoped ORD Document, the aggregator MUST verify that `describedSystemType.systemNamespace` matches the system type assigned to the credential. For a system-independent document, it MUST verify that the credential belongs to the independent publisher. It MUST also validate the document's perspective, version or instance context, and all authorization-relevant claims against authoritative aggregator state.
For a system-instance document, the aggregator SHOULD resolve the instance from the authenticated credential context when that context identifies exactly one instance.
The provider MAY supply an aggregator-issued `systemInstanceId` to disambiguate a credential that covers several instances.
If supplied, the identifier MUST resolve to the same instance as the document content and authoritative state.
If omitted, the remaining authenticated context and document content MUST identify exactly one instance.

Authorization for ORD ID namespaces is separate. A described system type can publish resources whose ORD IDs use another system namespace, an authority namespace, or an authorized customer namespace. The aggregator MUST maintain and enforce the namespaces that each publisher may use. It MUST NOT assume that every ORD ID starts with the described system's namespace.
The aggregator also retains the provenance of each accepted contribution.
Namespace authorization does not by itself establish which publisher owns stored content: several authorized publishers or delegators may contribute metadata for the same described system, publication context, or namespace.
Any future operation that replaces or removes a publisher's complete current state MUST restrict its effect to contributions attributed to that authenticated publisher and MUST preserve contributions attributed to every other publisher or delegator.

For definition requests, the publisher and any publication-context assignments associated with the credential combine with the optional context parameters defined by [ADR 003](./003-link-pushed-resource-definitions-by-resource-and-context.md).
The aggregator issues and owns `systemInstanceId`.
It is required in a definition request only when the authenticated context does not otherwise identify exactly one system instance, and it remains a request parameter rather than an ORD Document property.

The API MUST use HTTPS and authenticate every operation. ORD does not mandate one credential technology. Implementations SHOULD use an established machine-to-machine mechanism such as mutual TLS, OAuth 2.0 client credentials, or certificate-bound OAuth access tokens. Credential issuance, rotation, and onboarding remain aggregator-specific.

### Consequences

- ✅ Document uploads need no transport-specific scope parameter.
- ✅ Multiple credentials can publish independently for one publisher.
- ✅ Aggregators can model narrowly scoped credentials without requiring one credential per system instance.
- ✅ System-independent publishers use the same authorization model.
- ➖ Aggregators choose their credential technology and onboarding process.
- ⚠️ Aggregators must maintain publisher and ORD-namespace assignments.
- ⚠️ A provider needs at least one credential per described system type or independent publisher.

## Alternatives

### Aggregator-issued publication-scope parameter

- ✅ One credential can select several explicitly authorized contexts.
- ⚠️ Adds a transport-specific identifier to every operation, duplicating context the credential and document already carry, which the chosen model removes.
- ⚠️ Permits one credential to span several system types, widening the blast radius of a leaked credential.

### Request-supplied context only

- ✅ Makes every target explicit in the request.
- ⚠️ Authorizes from payload claims, so it is unsafe unless every value is checked against server-side assignments, which is exactly the trust boundary the chosen model enforces.

### Add system deployment now

- ✅ Could identify metadata shared across instances of one deployment.
- ⚠️ Changes the ORD domain model for a concern broader than push transport, so it belongs in a separate decision rather than this authorization ADR.

## More Information

- [ADR 003: definition identity and linkage](./003-link-pushed-resource-definitions-by-resource-and-context.md)
- [ADR 005: minimum versioned HTTP API](./005-use-simple-artifact-endpoints-with-optional-optimizations.md)
- [OAuth 2.0 mutual TLS, RFC 8705](https://www.rfc-editor.org/rfc/rfc8705.html)
- [OAuth 2.0 security best current practice, RFC 9700](https://www.rfc-editor.org/rfc/rfc9700.html)
