---
date: 2026-09-06
---

# Add a standardized push transport alongside pull transport

## Context and Problem Statement

ORD currently defines pull transport: an ORD provider exposes configuration, document, and resource-definition endpoints that an ORD aggregator retrieves. Some providers can publish metadata when it changes but cannot or do not want to operate a continuously reachable ORD Provider API. Without a standard push transport, each aggregator would define a different ingestion API. Should ORD define a push mode in addition to pull?

## Decision Drivers

- Let providers publish when metadata changes without operating an ORD Provider API.
- Let a provider publish static, design-time metadata from a CI/CD pipeline, so describing a system type or version requires no continuously running server.
- Reduce request volume: publishing on change sends updates only when they occur, rather than the aggregator repeatedly polling for changes that may not have happened.
- Allow simpler connectivity and credential setups in some topologies, where a provider can push outbound to the aggregator instead of exposing an inbound-reachable, authenticated Provider API. This is situational and not universally simpler.
- Keep ORD documents and their interpretation independent of transport.
- Make push integrations reusable across conforming aggregators.
- Preserve pull transport for providers and aggregators that prefer it, and let a provider use both.
- Support every ORD perspective and the existing validation and lifecycle semantics.

## Decision Outcome

Chosen option: **standardize optional push transport alongside pull**.

### Version-1 (MVP) scope

- **Required when push is supported:** the aggregator implements the minimum push contract defined by the ORD specification and Aggregator Push API.
- **Optional deployment choice:** a provider or aggregator can support pull, push, or both. Push does not change the ORD Document or ORD semantics.
- **Future extension:** automatic discovery of the push API and its capabilities or limits, for example through `.well-known/open-resource-discovery`, is not defined in version 1.

An ORD provider MAY publish ORD documents and their referenced resource definitions to an ORD aggregator through the ORD Aggregator Push API. An aggregator MAY support push, pull, or both. Supporting push does not require removing or changing the existing ORD Provider API.

Transport does not change ORD meaning. Push uses the standard ORD Document interface, existing perspectives, resource identities, validation rules, lifecycle rules, and visibility rules. An ORD document MUST NOT carry push-only properties. Separately pushed definition URLs are matched as described in [ADR 003](./003-link-pushed-resource-definitions-by-resource-and-context.md). Aggregators SHOULD use the same semantic processing pipeline regardless of whether content arrived through push or pull.

The aggregator communicates its API base URL to providers, for example during onboarding.

The related decisions are:

- [ADR 002](./002-use-eventually-consistent-resource-isolated-ingestion.md): consistency and failure isolation;
- [ADR 003](./003-link-pushed-resource-definitions-by-resource-and-context.md): definition identity and linkage;
- [ADR 004](./004-authorize-pushes-using-publisher-credentials.md): authorization context; and
- [ADR 005](./005-use-simple-artifact-endpoints-with-optional-optimizations.md): minimum versioned HTTP API.

### Consequences

- ✅ Providers can choose the transport that matches how they operate.
- ✅ Static, design-time metadata can be published from CI/CD without deploying a running server.
- ✅ Publishing on change can reduce request volume compared with periodic polling.
- ✅ One interoperable contract replaces aggregator-specific upload conventions.
- ✅ Existing ORD documents remain transport-neutral.
- ➖ An aggregator may process pushed and pulled content in the same way.
- ➖ Any easier connectivity or credential setup is situational, not guaranteed.
- ⚠️ Providers that support both modes have two delivery integrations to operate.
- ⚠️ Push requires aggregator availability, publisher authentication, retry handling, and handling of validation results.

## Alternatives

### Pull only

- ✅ Preserves one transport and keeps aggregators in control of retrieval timing.
- ⚠️ Every provider must expose a reachable, authenticated Provider API, so publishing static metadata from CI/CD without a running server is impossible.
- ⚠️ Aggregators poll for changes, spending requests even when nothing changed, and change propagation is bounded by the polling interval.

### Notification followed by pull

- ✅ Reduces polling while retaining the existing retrieval contract.
- ⚠️ The provider must still host the Provider API, so it does not remove the running-server requirement that push eliminates.
- ⚠️ Authentication and security must be established in both directions (the aggregator authenticating to the Provider API, and the provider authenticating to the notification receiver), which is effectively two integrations instead of one.

### Aggregator-specific push

- ✅ Each implementation can optimize for local needs.
- ⚠️ Providers cannot reuse one push integration across aggregators, which is the interoperability the chosen standard contract exists to provide.
- ⚠️ It fragments authorization, validation, and status semantics across implementations.

## More Information

- [PR #79 review discussion](https://github.com/open-resource-discovery/specification/pull/79)
