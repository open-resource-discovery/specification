# ADR-0001: Internationalization Support

## Table of Contents

- [Status](#status)
- [Context](#context)
- [Decision](#decision)
  - [Sub-Options Considered for Approach 1](#sub-options-considered-for-approach-1)
  - [Core Design Principles](#core-design-principles)
  - [Schema Structure](#schema-structure)
  - [ORD Configuration Integration](#ord-configuration-integration)
  - [Translatable Properties](#translatable-properties)
  - [Handling Complex Objects (Links)](#handling-complex-objects-links)
- [Consequences](#consequences)
  - [Positive](#positive)
  - [Negative](#negative)
  - [Risks and Mitigations](#risks-and-mitigations)
- [Alternatives Considered](#alternatives-considered)
  - [Approach 2: Embed into ORD Document](#approach-2-embed-into-ord-document)
  - [Approach 3: Separate Translation File (gettext-style)](#approach-3-separate-translation-file-gettext-style)
- [Future Considerations](#future-considerations)
  - [Definition File Translation](#definition-file-translation)
  - [Adoption Strategy](#adoption-strategy)
- [References](#references)

## Status

Proposed

## Context

The Open Resource Discovery (ORD) specification currently supports only single-language descriptions for all metadata. Requirements have emerged from various stakeholders to support internationalization (i18n) for Entity Types and other top-level ORD concepts.

Currently, all ORD resources contain human-readable text in properties like `title`, `shortDescription`, and `description` that are provided in a single language (typically English). This limits the usability of ORD in multi-language environments and reduces accessibility for non-English speaking users.

The i18n requirement includes:
- Translation of user-facing text in ORD resources (Products, Packages, API Resources, Event Resources, Entity Types, etc.)
- Support for standard language codes (BCP-47)
- Compatibility with existing ORD aggregators and consumers
- Flexibility for different translation providers and lifecycles

## Decision

We will implement **Approach 1: Dedicated ORD i18n Format** with a **fixed property key set** rather than generic JSON paths.

### Sub-Options Considered for Approach 1

**Option 1A: Generic JSON Paths**
- Use JSON Pointer syntax (e.g., `"$.title"`, `"$.shortDescription"`) to target translatable properties
- More flexible but risks targeting technical fields like `$.version` or `$.ordId`
- Fragile to schema changes and requires deep ORD structure knowledge

**Option 1B: Fixed Property Keys (Selected)**
- Use predefined property names (e.g., `"title"`, `"shortDescription"`) validated against resource type
- Type-safe approach that prevents accidental translation of technical fields
- Resource type extracted from ORD ID structure for validation

### Core Design Principles

1. **Dedicated i18n Document Format**: Create a new ORD document type specifically for translations
2. **Fixed Property Keys**: Use predefined, validated property names instead of generic JSON paths
3. **ORD ID-based Targeting**: Reference resources using their ORD IDs, extracting resource type from the ID structure
4. **BCP-47 Language Codes**: Use standard language identifiers
5. **Discoverable via ORD Configuration**: Integrate i18n documents into the existing ORD discovery mechanism

### Schema Structure

```json
{
  "$schema": "https://open-resource-discovery.org/spec-v1/interfaces/Document.i18n.schema.json",
  "openResourceDiscovery": "1.15",
  "description": "Translations for ORD resources",
  "translations": [
    {
      "ordId": "sap.foo:product:ord-reference-app:",
      "values": {
        "de": {
          "title": "ORD Referenz Anwendung",
          "shortDescription": "Referenz Anwendung für Open Resource Discovery"
        },
        "fr": {
          "title": "Application de Référence ORD",
          "shortDescription": "Application de référence pour Open Resource Discovery"
        }
      }
    }
  ]
}
```

### ORD Configuration Integration

```json
{
  "openResourceDiscoveryV1": {
    "documents": [...],
    "i18n": [
      {
        "url": "/open-resource-discovery/v1/translations/main.i18n.json",
        "accessStrategies": [{"type": "open"}]
      }
    ]
  }
}
```

### Translatable Properties

The following properties will be translatable based on resource type, prioritized by end-user impact:

#### High Priority (End-User Facing)

**Universal Properties:**
- `title` - Displayed in catalogs, search results, navigation
- `shortDescription` - Key for discovery, appears in lists and cards
- `description` - Main content users read to understand resources

**Taxonomy Properties:**
- Group: `title`, `description` - Appear in navigation and taxonomies
- GroupType: `title`, `description` - Define taxonomy structure for users

#### Medium Priority (Mixed Audience)

**Resource-Specific Properties:**
- API/Event Resources: `customImplementationStandardDescription` - Helps technical decision-makers understand API contracts
- Links: `title`, `description` - User-facing when displayed in catalogs (requires array index-based identification)
- Vendor: `title` - Displayed in catalogs (though often company names that may not need translation)

#### Low Priority (Technical/Support Audience)

**Support-Oriented Properties:**
- Package: `supportInfo` - Primarily for support teams, not end-users
- Extensible objects: `extensible.description` - Technical information for developers
- Changelog: `description` - Technical change information
- Tombstone: `description` - Administrative information

**Rationale**: Properties are prioritized based on end-user visibility, business impact, and frequency of use in user-facing interfaces. Support-oriented properties serve technical audiences who typically work in English.

### Handling Complex Objects (Links)

Links present a challenge for the fixed property approach since they are arrays of objects. The most generalizable solution within the fixed property approach is array index-based targeting:

```json
{
  "ordId": "sap.foo:apiResource:astronomy:v1",
  "values": {
    "de": {
      "links[0].title": "API Dokumentation",
      "links[0].description": "Vollständige API Dokumentation"
    }
  }
}
```

**Limitation**: This approach is fragile when link arrays are reordered. The JSON path approach (Option 1A) would handle complex objects more elegantly, but the overall benefits of type safety and preventing accidental translation of technical fields still favor the fixed property approach.

**Recommendation**: For the initial implementation, focus on the core translatable properties and defer complex object translation to a future version.

## Consequences

### Positive

- **Type Safety**: Fixed property keys prevent accidental translation of technical fields
- **Validation**: Schema can enforce correct property usage per resource type
- **Flexibility**: Different providers can manage translations independently
- **Scalability**: Efficient handling of complex ORD structures
- **Integration**: Natural fit with ORD's discovery and configuration model
- **Evolution**: Can adapt as ORD adds new translatable concepts

### Negative

- **New Format**: Requires creating and maintaining a new specification
- **Tooling Gap**: No existing translation tools support this format initially
- **Implementation Complexity**: More complex for aggregators to implement than embedded approach
- **Learning Curve**: Teams need to understand ORD-specific i18n format

### Risks and Mitigations

- **Risk**: Slow adoption due to tooling gap
  - **Mitigation**: Develop translation tools or adapters for existing tools
- **Risk**: Synchronization issues between ORD documents and translations
  - **Mitigation**: Clear versioning and validation strategies

## Alternatives Considered

### Approach 2: Embed into ORD Document

**Example:**
```json
{
  "products": [
    {
      "ordId": "sap.foo:product:ord-reference-app:",
      "title": "ORD Reference App",
      "i18n": {
        "de": {
          "title": "ORD Referenz Anwendung"
        }
      }
    }
  ]
}
```

**Rejected because:**
- Significantly bloats ORD documents
- Creates overlay problems when translations come from different sources
- Increases schema complexity for every translatable entity
- Performance impact on document parsing and transfer

### Approach 3: Separate Translation File (gettext-style)

**Example:**
```json
{
  "documents": [
    {
      "url": "/open-resource-discovery/v1/documents/1-static",
      "i18n": {
        "url": "/open-resource-discovery/v1/documents/1-static.po"
      }
    }
  ]
}
```

**Rejected because:**
- Generic translation keys don't leverage ORD structure knowledge
- Harder to validate translation completeness
- Risk of key management issues
- Less type-safe than ORD-native approach

## Future Considerations

### Definition File Translation

Resource definition files (OpenAPI, AsyncAPI, EDMX, etc.) also contain translatable content. This is considered a future enhancement that could be addressed through:

- Language-specific definition files
- Translation injection at aggregator level
- Separate definition translation documents

This capability is not included in the initial i18n implementation but should be considered for future versions.

### Adoption Strategy

The prioritized property list serves as guidance for providers and consumers, but adoption will be driven by specific use cases and ecosystem needs:

**Recommended Starting Point:**
- Providers should focus on high-priority properties (title, shortDescription, description) that deliver immediate user value
- Consumers should implement support for these core properties first to maximize compatibility

**Flexible Implementation:**
- Providers may implement any subset of translatable properties based on their user base and requirements
- Consumers should gracefully handle missing translations and fall back to default language
- The ecosystem will naturally evolve as providers add translation support and consumers demonstrate demand

**Ecosystem Evolution:**
- Tooling development will emerge based on actual adoption patterns
- Definition file translation support can be added when there's demonstrated need
- Advanced features (fallback mechanisms, caching) will develop as the ecosystem matures

This approach recognizes that ORD operates in a decentralized ecosystem where adoption happens organically based on value and need.

## References

- [BCP-47 Language Tags](https://tools.ietf.org/html/bcp47)
- [CSN Interop i18n approach](https://sap.github.io/csn-interop-specification/)