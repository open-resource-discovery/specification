# Scope

The Open Resource Discovery (ORD) standard provides a technology-agnostic, machine-readable protocol for applications and services to **self-describe their exposed resources and capabilities** and for those descriptions to be **discovered and aggregated** across organizational and product boundaries. ORD covers both static reference documentation and runtime, tenant-specific landscape views.

The ORD standard defines a "resource" as any discrete, uniquely addressable capability or asset that a system exposes for consumption, including (but not limited to) APIs, Events, Entity Types, Data Products, Integration Dependencies, Capabilities, Packages, Consumption Bundles, and Groups, together with the supporting taxonomy (Vendor, Product, Industry, Line of Business, Tags, Labels) and identity (ORD ID, namespace) used to describe them.

## In Scope

This Working Group is focused specifically on establishing and promoting activities focused on:

1. An **information model** — the structure, attributes, relationships, identity scheme, and taxonomy used by ORD documents to describe resources and their context (APIs, Events, Entity Types, Data Products, Integration Dependencies, Capabilities, Packages, Consumption Bundles, Groups, and the related metadata).
2. A **discovery and transport protocol** — the ORD Configuration endpoint (`.well-known/open-resource-discovery`), ORD Documents, the ORD Discovery API offered by aggregators, and the behaviors required of the ORD Provider, ORD Aggregator, and ORD Consumer roles.
3. **Access strategies and security** — the standardized mechanisms by which ORD documents and the resources they reference are accessed (authentication/authorization access strategies, visibility scopes).
4. **Versioning, lifecycle, and policy levels** — rules for evolving the specification, marking compatibility, and declaring conformance levels (including extensible policy-level definitions) for ORD documents and their referenced resources.
5. **Validation rules** — normative correctness and consistency rules for ORD documents, expressed via JSON Schema and supporting documentation.
6. An **extensibility framework** — extension points such as custom types, labels, extensibility attributes, ORD Overlays, and registered extensions (e.g., access strategies, policy levels, group types) that allow the specification to evolve without breaking existing implementations.
7. **Guidelines and conventions** — best practices for adopting ORD, structuring ORD information, and integrating ORD with adjacent metadata standards.

## Out of Scope

The Working Group's activities do not include:

1. The internal definition of resource description formats that ORD references rather than replaces (e.g., OpenAPI, AsyncAPI, OData EDMX/CSDL, GraphQL SDL, JSON Schema, CSN Interop). ORD describes how to identify, link to, and contextualize such artifacts; it does not govern their internal grammars.
2. The implementation of ORD Providers, Aggregators, or Consumers, including any specific software, libraries, SDKs, server frameworks, validators, or UI tooling. Such implementations are the responsibility of separate projects that build on top of the protocol defined herein.
3. The operation of any specific ORD aggregator instance, registry, or catalog (e.g., the SAP Business Accelerator Hub, the Unified Customer Landscape, or any global namespace registry). These are products and services that may use ORD but are governed independently.
4. The definition of vendor- or product-specific taxonomy values, custom types, labels, or extensions contributed by third parties. These may be registered alongside the specification but are not subject to the patent commitments of the core specification.
5. Tool-specific behaviors, performance characteristics, or operational concerns of any implementation.
6. The semantics of the underlying business domains, business processes, or APIs being described. ORD is a metadata protocol, not a domain model.

## Scope Changes

Any changes to this scope apply prospectively and are not retroactive.
