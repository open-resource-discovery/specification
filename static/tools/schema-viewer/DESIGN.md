# ORD Schema Explorer - Design Document

This document outlines the design and implementation details of the **ORD Schema Explorer**, an interactive visualization tool for the Open Resource Discovery (ORD) Document specification.

## 1. Objective
Create a self-contained web application that visualizes the JSON Schema of the ORD Document as a force-directed graph, enabling developers to explore the complex relationships (compositions and associations) between ORD resources.

The explorer is designed to integrate seamlessly with the main ORD Docusaurus site, sharing its visual language and branding.

## 2. Core Requirements & Implementation

### 2.1 Schema Parsing
The application parses `Document.schema.json` and `Configuration.schema.json` and extracts:
- **Nodes**: Each definition in the schema becomes a node.
- **Relationships**:
    - **Composition**: Defined by `$ref` in JSON Schema. Represented as solid teal-blue lines (`#1e8f95`).
    - **Association**: Defined by the custom `x-association-target` attribute. Represented as solid teal lines (`#32bcac`).
- **Metadata**: Stores descriptions, property types, and custom `x-` attributes for display in the sidebar.

### 2.2 Visual Representation
- **Force-Directed Layout**: Uses D3.js `forceSimulation` for a dynamic, interactive graph.
- **Node Categorization**: Based on the `x-ums-type` hint and node names:
    - **Root Resource**: 🔵 Blue (`#58a6ff`) - Central entry point (e.g., ORD Document).
    - **Subentity**: 🟣 Purple (`#a371f7`) - Resources categorized as `embedded` or `custom`.
    - **External Ownership**: � Orange (`#f78166`) - Resources with `ignore` type whose ID starts with "System".
    - **Ephemeral**: 🔘 Grey (`#6e7681`) - Other `ignore` resources (e.g., Tombstone, Vendor).
- **Reflexive Links (Self-Links)**: Relationships where a resource references itself (recursive structures) are rendered as curved arcs to ensure visibility.
- **Layering**: Nodes are always layered above edge labels and lines to ensure readability.
- **Edge Labels**: Labels show the JSON property name. Labels are small and use a light font weight to reduce visual noise. The `[]` notation has been removed for a cleaner look.

### 2.3 User Interface
- **Docusaurus Branding**: Features the official ORD logo, teal color accents, and Inter-based typography.
- **Top Controls**:
    - **Schema Selection**: Switch between Document and Configuration schemas.
    - **Depth Slider**: Sets the initial explosion level of the graph.
    - **Density Selector**: Toggles simulation forces between **Compact**, **Normal**, and **Sparse** to manage graph sprawl.
    - **Labels Toggle**: Show/hide property names on edges.
    - **Fit Button**: Smoothly pans and zooms the viewport to fit all displayed nodes.
    - **Reset/Expand Buttons**: Reset to root or show the entire schema hierarchy.
- **Sidebar**:
    - **Dynamic Context**: Switches between **Node Details** and **Relationship Details**.
    - **Tooltips**: Hovering over properties or relations in the sidebar reveals the full schema description as a tooltip.
    - **Connectivity**: For edges, shows the Source and Target nodes with interactive links to navigate between them.

### 2.4 Interaction Model
- **Single Click (Node)**: Selects a node, highlights it, and opens its details in the sidebar.
- **Double Click (Node)**: Expands all immediate forward and reverse relationships for that node.
- **Single Click (Edge)**: Selects a relationship, highlights it with a glow, and shows its description and connectivity in the sidebar.
- **URL Synchronization**: The application state (selected schema, depth, density, and label visibility) is persisted in URL parameters for easy sharing.
- **Stability**: Automatic viewport centering is disabled during node selection to preserve the user's focus; manual "Fit" is used instead.

## 3. Technical Stack
- **Languages**: HTML5, CSS3 (Vanilla), JavaScript (ES Modules).
- **Libraries**: [D3.js (v7)](https://d3js.org/) for graph rendering and simulation.
- **Integration**: Designed to run as a static tool within a Docusaurus project (`/static/tools/`).

---

## 4. Implementation Details (Logic Flow)
1. **Fetch**: Loads the requested JSON Schema file.
2. **Parse**: Maps definitions into a `nodes` map.
3. **Map Categories**: `mapUmsType(type, id, isRoot)` assigns the internal category based on the UMS hint and naming conventions.
4. **Extract Relations**: Scans properties for `$ref` and `x-association-target`, storing them as an array within each node object.
5. **D3 Rendering**:
    - Layers are managed by appending `<g>` elements for links, labels, and nodes in sequence.
    - `allLinks.attr('d', ...)` handles both straight lines (standard edges) and arcs (self-links).
6. **Force Simulation**:
    - Updates `charge`, `linkDistance`, and `collision` radius based on the selected `density` level.
7. **Selection Management**:
    - Centralized `selectNode(id)` and `selectLink(id)` functions update the state, graph classes, and sidebar HTML.

---

## 5. Roadmap & Future Improvements

### Alpha 1 Accomplishments
- [x] Docusaurus theme parity and compact header.
- [x] Dedicated "External Ownership" and "Ephemeral" categories.
- [x] Interactive edge selection and sidebar details.
- [x] Sidebar hover tooltips for descriptions.
- [x] Variable density control (Compact/Normal/Sparse).
- [x] Self-link visualization (Arcs).
- [x] Manual "Fit to View" control.
- [x] **SVG Export**: Export the current view as a standalone SVG file.

### Upcoming
- [ ] **Search**: Integrated search bar for finding nodes by name or property.
- [ ] **Raw Schema View**: Toggle in sidebar to see the source JSON Schema for the selected item.
- [x] **Highlight Related**: Hovering a node highlights all its incoming/outgoing edges.
