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

[`overlay.json`](./overlay.json) holds the shared overlay scope, semantic-selector guidance, maturity note, and processing steps. Both renderers consume this content; `sync:diagrams` and `check:diagrams` also cover its vendored presentation copy. Keep example markup and typography native to each renderer.

[`agent-example.json`](./agent-example.json) holds the exemplary Agent diagram's nodes, labels, and connector geometry. Both renderers consume it. The walkthrough's JSON excerpts and source documents use the same Fulfillment Agent scenario; external dependencies remain references to their owning providers.

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
| `AgentExampleDiagram` | `AiDiscoveryDiagram.vue` | `ai-discovery` |
| `AgentConnectivityDiagram` | `AgentModelDiagram.vue` | `agent-model` |
| `AiEnrichmentDiagram` | `AiEnrichmentDiagram.vue` | `ai-enrichment` |
| `OverlayDiagram` | `OverlayDiagram.vue` | `ord-overlays` |
| `SapArchitectureDiagram` | `SapArchitectureDiagram.vue` | `sap-case-study` |

When another connector-heavy diagram changes, extract its node and edge data using the same pattern. Keep the wrappers and typography native to their framework. For a static illustration that needs no responsive text or interaction, a shared SVG can also be appropriate. Avoid generating one framework's whole component from the other: template conversion alone does not preserve layout or connector geometry.

## Retained Draw.io sources

Three active Draw.io SVGs are shared byte-for-byte with the presentation: [`system.drawio.svg`](../static/img/system-landscape/system.drawio.svg) (`landscape-model`), [`integration-dependency.drawio.svg`](../static/img/integration-dependency.drawio.svg) (`integration-dependencies`), and [`ord-ai-agent.drawio.svg`](../static/img/ord-ai-agent.drawio.svg) (`agent-model`). The presentation's `sync:diagrams` and `check:diagrams` commands cover all three assets. Keep their embedded editable source and rendered styling aligned; styling changes should preserve node bounds, labels, and connector routing.

The specification is the source of truth for every Draw.io diagram. Edit its SVG here, including the embedded editable model, then sync any presentation copy from this checkout. The Data Product slide uses a separate, simplified native Vue diagram; it does not embed the detailed [`data-product-model.drawio.svg`](../static/img/data-product-model.drawio.svg).

[`ord-ai-agent.drawio.svg`](../static/img/ord-ai-agent.drawio.svg) is the Agent relationship model used by `AgentConnectivityDiagram` in the specification and `AgentModelDiagram.vue` in the presentation. It follows the Data Product model's rounded cards and inset fields, with one box per concept and cardinality labels instead of stacked copies. Capability references explicitly include Agent Skills, Plugins, and Workflows as examples. Update the editable model and rendered SVG together when changing the model. The `ai-discovery` slide retains its exemplary native `AiDiscoveryDiagram.vue` diagram.

All Draw.io SVGs, including retained references, use this palette. These fills are stronger than the native diagrams' pale card surfaces so dense diagrams remain readable. Preserve text size, layout, arrow routing, dashed lines, and meaningful stroke weights. Use rounded corners for standalone cards; keep table cells, attached UML compartments, and flowchart shapes intact. Diagrams keep a white surface in both site themes.

| Accent | Fill | Outline |
| --- | --- | --- |
| Teal | `#cfe9e3` | `#46988d` |
| Blue | `#d5e5f6` | `#5c8fb9` |
| Coral | `#f3d8cc` | `#bd8069` |
| Violet | `#e5daf1` | `#9676b3` |
| Lime | `#dfebcd` | `#829e5e` |
| Neutral | `#e9eef3` | `#8799a6` (cards), `#9aabb7` (containers) |
| Warning | `#f3e5ba` | `#b19142` |

Use `#0a0f12` for text, `#5a6a73` for muted text and connectors, and `#758995` for secondary connectors. Keep colored lifecycle arrows meaningful. In role diagrams, use blue for Providers, violet for Aggregators, and lime for Consumers, and update their legends together. Reserve amber for warning outcomes rather than successful results.

Preserve distinctions between background categories. In the high-level model, document surfaces are white, grouping containers use `#f6f8fa`, transport-content compartments and their legend use `#e9eef3`, and the explanatory note uses `#f3f8fd`. Keep the blue ORD-owned and teal externally owned entity colors separate.

For UML class diagrams, use distinct accent headers with white attribute compartments and matching outlines. Keep connectors dark enough to read alongside the class borders, without changing their paths or arrow meanings.

The following editable Draw.io SVGs are retained as historical or detailed references even though the documentation currently renders code-native replacements:

- [`integration-dependency-ps.drawio.svg`](../static/img/integration-dependency-ps.drawio.svg)
- [`ord-explicit-system-persectices-flow.drawio.svg`](../static/img/ord-explicit-system-persectices-flow.drawio.svg)
- [`ord-metadata-integration-target-architecture.drawio.svg`](../static/img/ord-metadata-integration-target-architecture.drawio.svg)
- [`versioning-and-lifecycle.drawio.svg`](../static/img/versioning-and-lifecycle.drawio.svg)

Do not remove these files solely because they are not embedded in a documentation page.
