---
sidebar_position: 6
description: Compatibility concepts in ORD
---

# Compatibility

## Summary

ORD's compatibility concept enables robust versioning and interface-based development across distributed systems. It encompasses three key aspects:

- **Semantic versioning and backward compatibility**: Resources follow semantic versioning principles, allowing consumers to safely upgrade within major versions while providers maintain flexibility to evolve their offerings.
- **Abstract resources**: Interface-only resources that define contracts without direct instantiation, similar to abstract classes in object-oriented programming.
- **The `compatibleWith` property**: Declares compatibility relationships between resources, enabling alternative implementations and standardized interface adoption.

Together, these mechanisms support flexible system integration while maintaining clear compatibility guarantees for consumers.

## Compatibility from Consumer Perspective

ORD resources follow [Semantic Versioning 2.0.0](https://semver.org/) principles. Consumers of API Resources, Event Resources, or Data Product Resources expect backward compatibility within major versions. This expectation forms the foundation of reliable system integration.

Providers can introduce compatible changes in minor and patch versions. Such changes include adding new optional fields, updating metadata, enhancing documentation, or introducing new optional functionality. These changes MUST NOT break existing consumers relying on previous versions within the same major version. Consumers can safely ignore newly added optional fields without any impact on their integration.

However, consumers may require functionality only available starting with a specific version of a resource. For example, a consumer might need a new field in an API that was introduced in version 1.2.0. In such cases, consumers can express their minimum version requirement explicitly via [`integrationDependency`](integration-dependency.md) using the `minVersion` property inside the integration dependency aspect. This declares that the consumer expects the provider to process information according to the specified minimum version.

When providers need to introduce breaking changes—such as removing fields, changing field types, altering required parameters, or modifying fundamental behavior—they MUST increment the major version number. Consumers relying on previous major versions will not be affected by such changes, as they represent distinct contracts. This allows providers to evolve their resources while maintaining support for existing consumer integrations.

## Abstract ORD Resources

Abstract ORD resources serve as interfaces, allowing others to provide resources that implement the interface by declaring compatibility with the abstract resource's contract. This enables standardization across different implementations while maintaining flexibility in how the interface is realized. Abstract resources indicate that the resource serves as an interface only and cannot be called directly. This concept mirrors the abstract keyword in programming languages like Java, where abstract classes define contracts that concrete implementations must fulfill.

The `abstract` property is available for API Resources, Event Resources, and Data Product Resources to indicate interface-only resources. When set to `true`, this boolean flag signifies that the resource is an abstract representation and cannot be instantiated or consumed directly. Instead, the abstract resource defines the contract that other concrete resources can implement through the [`compatibleWith`](#compatible-with-property) property.

Abstract resources are particularly useful in scenarios where:
- Multiple systems need to provide functionally equivalent resources following a common interface
- A standardized contract needs to be defined across different implementation contexts

## Compatible With Concept for ORD Resources

The `compatibleWith` property enables API Resources, Event Resources, and Data Product Resources to declare compatibility with other resources. This property serves two primary purposes: implementing abstract ORD resources and indicating compatibility with concrete resources.

### Purpose and Usage

Resources use `compatibleWith` to reference an interface contract (typically an abstract resource) that they implement. This serves as a declaration of compatible implementation, effectively functioning as an "implementationOf" relationship. The data that compatible resources return follow the same schema, but the actual data itself can be different. For example, if one API returns 1 record for a specific request, a compatible API could return multiple and different records, as long as they adhere to the same schema.

The `compatibleWith` property MUST contain a valid reference to an (usually external) API Resource, Event Resource, or Data Product Resource ORD ID. All resources that share the same `compatibleWith` value MAY be treated as equivalent or similar by consumer clients, as they implement the same interface contract.

Beyond implementing abstract resources, `compatibleWith` can also indicate compatibility with other concrete resources. This scenario occurs when an alternative implementation of an existing resource is provided. Within larger projects, this might involve integrating third-party solutions through proxy implementations to be compatible with requirements of existing solutions.

### Maximum Version and Contract Evolution

The `maxVersion` property specifies the maximum version of the interface contract that a resource is compatible with. This is critical for maintaining clear compatibility boundaries as interface contracts evolve over time.

Even if an interface contract evolves in a backward-compatible manner (minor or patch version increments), a resource will not automatically be compatible with versions beyond its specified `maxVersion`. This explicit boundary prevents assumptions about compatibility with future interface versions that may introduce optional features or enhancements that the implementing resource does not support.

Consider an API contract at version 1.0 that defines fields A and B. Another API resource declaring compatibility with version 1.0 means it implements exactly fields A and B, along with any tenant-specific extensions in a dedicated namespace. If the API contract changes to version 1.1 by adding optional field C, the API resource declaring compatibility with version 1.0 will not include field C. Only by adopting the contract of version 1.1 and implementing fields A, B, and C would the resource also be compatible with version 1.1 of the contract.

However, a consumer client relying on version 1.0 of the contract can still work with a resource that declares compatibility with version 1.1 of the contract. The consumer will simply use the subset of fields (A and B) defined in version 1.0, ignoring the additional field C. This demonstrates how semantic versioning enables flexible compatibility relationships while maintaining clear boundaries.

Following the [Semantic Versioning 2.0.0](https://semver.org/) standard, patch versions (x.y.Z) MUST NOT have impact on the schema or contract. Therefore, the `maxVersion` includes only the major.minor parts of a semantic version. Patch-level changes represent bug fixes and non-functional improvements that do not affect the interface contract itself.

The `maxVersion` mechanism ensures that:

- Implementing resources explicitly state which version of an interface they support
- Consumers can determine whether a resource supports the interface features they require
- Interface contract owners can evolve their contracts without breaking existing implementations
- Clear boundaries exist for compatibility relationships as systems evolve over time
