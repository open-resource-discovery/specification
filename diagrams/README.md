# Diagrams across the specification and presentation

The specification site uses React and the [presentation](https://github.com/open-resource-discovery/presentation) uses Vue. Their layouts serve different reading contexts: responsive documents and a fixed slide canvas.

## Shared graph data

[`unified-metadata.json`](./unified-metadata.json) is the canonical source for the connected metadata graph's nodes, labels, coordinates, and relationships. It was extracted from the presentation's `UnifiedMetadataDiagram.vue`. Coordinates are percentages; `width` is the node width at `layoutWidth`.

Both renderers draw SVG lines between these coordinates and place HTML labels at the same coordinates. Keep SVG `preserveAspectRatio="none"` and `vector-effect: non-scaling-stroke` so lines follow the responsive HTML positions without stretching their stroke widths. Keep opaque node backgrounds above the lines.

The introduction uses the React component, while the front page uses the provider diagram. The presentation vendors the JSON under `data/diagrams/`; builds do not depend on a sibling checkout or a network request. After changing this file, run in the presentation checkout:

```sh
npm run sync:diagrams
npm run check:diagrams
# For another checkout location:
npm run sync:diagrams -- --spec-root=/path/to/specification
```

This check detects data drift, not visual correctness. Visually inspect both renderers after any data or CSS change, including a narrow documentation viewport and both site themes.

## Other diagram counterparts

These ports still have separate implementations. Use this mapping when changing or converting them, and compare the rendered diagrams, including connector endpoints and arrow meanings.

| React export in `src/components/OrdDiagrams/index.tsx` | Vue component in `components/` | Presentation route |
| --- | --- | --- |
| `SilosDiagram` | `SilosDiagram.vue` | `metadata-silos` |
| `AlignmentDiagram` | `AlignmentDiagram.vue` | `metadata-alignment` |
| `UnifiedMetadataDiagram` | `UnifiedMetadataDiagram.vue` | `unified-metadata-view` |
| `ProviderDiagram` | `ProviderDiagram.vue` | `self-description` |
| `RolesDiagram` | `RolesDiagram.vue` | `ord-roles` |
| `DiscoveryFlowDiagram` | `DiscoveryFlowDiagram.vue` | `pull-overview` |
| `DataModelDiagram` | `DataModelDiagram.vue` | `information-model` |
| `PerspectivesDiagram` | `PerspectivesDiagram.vue` | `perspectives-overview` |
| `LandscapeDiagram` | `LandscapeDiagram.vue` | `connected-landscape` |
| `NamespaceDiagram` | `NamespaceConceptDiagram.vue` | `namespace-concept` |
| `OrdIdDiagram` | `OrdIdDiagram.vue` | `ord-identifiers` |
| `IdentifierTypesDiagram` | `IdentifierTypesDiagram.vue` | `related-identifiers` |
| `GroupingPackagingDiagram` | `GroupingPackagingDiagram.vue` | `grouping-packaging` |
| `LifecycleDiagram` | `LifecycleDiagram.vue` | `versioning-lifecycle` |
| `ApiLifecycleDiagram` | `ApiLifecycleDiagram.vue` | `api-lifecycle` |
| `PerspectiveResolutionSummaryDiagram` | `PerspectiveResolutionDiagram.vue` | `perspective-resolution` |
| `PullSequenceDiagram` | `PullSequenceDiagram.vue` | `pull-sequence` |
| `IntegrationScenarioDiagram` | Presentation-native scenario diagrams | `connected-landscape` |
| `AgentConnectivityDiagram` | `AiDiscoveryDiagram.vue` | `ai-discovery` |
| `AiEnrichmentDiagram` | `AiEnrichmentDiagram.vue` | `ai-enrichment` |
| `OverlayDiagram` | `OverlayDiagram.vue` | `ord-overlays` |
| `SapArchitectureDiagram` | `SapArchitectureDiagram.vue` | `sap-case-study` |

When another connector-heavy diagram changes, extract its node and edge data using the same pattern. Keep the wrappers and typography native to their framework. For a static illustration that needs no responsive text or interaction, a shared SVG can also be appropriate. Avoid generating one framework's whole component from the other: template conversion alone does not preserve layout or connector geometry.
