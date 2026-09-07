---
status: proposed
date: 2026-09-06
depends-on:
  - ./001-add-push-transport-alongside-pull.md
---

# Authorize pushes using publisher credentials

## Context and Problem Statement

A request can contain described-system identifiers and ORD namespaces, but those values cannot establish who may publish them. Most publication context is already present in credentials and ORD documents, while a system-instance identifier can help disambiguate a concrete instance. How should an aggregator authorize pushes without requiring one credential technology or a general publication-scope ID?

## Decision Drivers

- Keep the document endpoint free of required transport-specific context parameters.
- Do not trust identifiers merely because they occur in a request.
- Allow several credentials for the same publisher.
- Prevent one credential from publishing for unrelated system types or authorities.
- Keep described-system identity separate from ownership expressed by ORD ID namespaces.
- Support system-independent publication.

## Decision Outcome

Chosen option: **associate each credential with exactly one publisher in aggregator state**.

### Version-1 (MVP) scope

- **Required:** every operation is authenticated; each credential identifies one publisher; publisher and ORD-namespace permissions are validated separately.
- **Optional v1 choices:** aggregators choose an established machine-to-machine authentication mechanism, can issue several credentials for one publisher, and accept an optional `systemInstanceId` on system-instance document uploads.
- **Future extension:** a system-deployment perspective could represent metadata shared by several system instances, but version 1 does not define that domain concept.

For authorization, the publisher is one of:

- one described system type, identified by its `describedSystemType.systemNamespace`; or
- one system-independent publisher, identified by an authority or other owning ORD namespace.

An aggregator MAY issue several credentials for the same publisher. A credential MUST NOT authorize several described system types or independent publishers. The credentials do not select a perspective; the ORD Document or resource-definition request MUST explicitly supply it.

For a system-scoped ORD Document, the aggregator MUST verify that `describedSystemType.systemNamespace` matches the system type assigned to the credential. For a system-independent document, it MUST verify that the credential belongs to the independent publisher. It MUST also validate any version or instance context and all authorization-relevant claims against authoritative aggregator state.
For a system-instance document, the provider MAY supply an aggregator-issued `systemInstanceId`. If present, it MUST resolve to the same instance as the document content and authoritative state. If absent, those inputs MUST identify exactly one instance.

Authorization for ORD ID namespaces is separate. A described system type can publish resources whose ORD IDs use another system namespace, an authority namespace, or an authorized customer namespace. The aggregator MUST maintain and enforce the namespaces that each publisher may use. It MUST NOT assume that every ORD ID starts with the described system's namespace.

For definition requests, the publisher identified by the credentials combines with the context parameters defined by [ADR 003](./003-link-pushed-resource-definitions-by-resource-and-context.md). The aggregator issues and owns the `systemInstanceId` required for system-instance definition uploads. It remains a request parameter rather than an ORD Document property.

The API MUST use HTTPS and authenticate every operation. ORD does not mandate one credential technology. Implementations SHOULD use an established machine-to-machine mechanism such as mutual TLS, OAuth 2.0 client credentials, or certificate-bound OAuth access tokens. Credential issuance, rotation, and onboarding remain aggregator-specific.

### Consequences

- ✅ Document uploads need no transport-specific scope parameter.
- ✅ Multiple credentials can publish independently for one publisher.
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
