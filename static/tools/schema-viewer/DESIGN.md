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
    - **Association**: Defined by the custom `x-association-target` attribute. Represented as dashed teal lines (`#32bcac`).
- **Metadata**: Stores descriptions, property types, and custom `x-` attributes for display in the sidebar.
- **Edge Display Strategy**: Edges are added during depth-based expansion as nodes are discovered. Self-loops (reflexive relationships where source === target) work naturally within this approach: when expanding a node with a self-reference, the edge is added during the initial pass, and recursion is skipped since the target is already displayed.

### 2.2 Visual Representation
- **Force-Directed Layout**: Uses D3.js `forceSimulation` for a dynamic, interactive graph.
- **Node Categorization**: Based on the `x-ums-type` hint and node names:
    - **Root Resource**: 🔵 Blue (`#58a6ff`) - Central entry point (e.g., ORD Document).
    - **Subentity**: 🟢 Green/Teal (`#1bc97e`) - Resources categorized as `embedded` or `custom`. *Changed from purple (`#a371f7`) to green/teal for better visual distinction and accessibility.*
    - **External Ownership**: 🟠 Orange (`#f78166`) - Resources with `ignore` type whose ID starts with "System".
    - **Ephemeral**: 🔘 Grey (`#6e7681`) - Other `ignore` resources (e.g., Tombstone, Vendor).
- **Reflexive Links (Self-Links)**: Relationships where a resource references itself (recursive structures) are rendered as curved arcs with a loop size of 50px. Edge labels are positioned at `(x+55, y-5)` to prevent overlap with the node.
- **Layering**: SVG groups are ordered as: links → labels → nodes. This ensures nodes are always clickable and visible above edges.
- **Edge Labels**: Labels show the JSON property name. Labels are small (8px) and use a light font weight to reduce visual noise. The `[]` notation has been removed for a cleaner look. Labels can be toggled via the header control.
- **Dimming Effect**: When hovering over a node, non-connected nodes and edges are dimmed to 0.2 opacity (reduced from 0.3 for better visibility of dimmed elements).

### 2.3 User Interface
- **Docusaurus Branding**: Features the official ORD logo, teal color accents, and Inter-based typography.
- **Top Controls**:
    - **Schema Selection**: Switch between Document and Configuration schemas.
    - **Depth Slider**: Sets the initial explosion level of the graph.
    - **Density Selector**: Toggles simulation forces between **Compact**, **Normal**, and **Sparse** to manage graph sprawl.
    - **Labels Toggle**: Show/hide property names on edges.
    - **Action Buttons** (icon-only with Tippy.js tooltips):
        - **Export**: Download current view as standalone SVG file.
        - **Reset**: Return to initial graph state (root only).
        - **Fit**: Smoothly pan and zoom to fit all displayed nodes.
        - **Expand All**: Recursively expand entire schema hierarchy.
- **Sidebar**:
    - **Dynamic Context**: Switches between **Node Details** and **Relationship Details**.
    - **Tooltips**: Tippy.js-powered rich tooltips on hover for relation items, displaying full schema descriptions.
    - **Connectivity**: For edges, shows the Source and Target nodes with interactive links to navigate between them.

### 2.4 Interaction Model
- **Single Click (Node)**: Selects a node and opens its details in the sidebar. Clicking the *same* node again expands all immediate forward and reverse relationships for that node.
- **Single Click (Edge)**: Selects a relationship, highlights it with a glow, and shows its description and connectivity in the sidebar.
- **Single Click (Background)**: Deselects the current node/edge. The click handler uses DOM tree traversal to check if the click target or any of its ancestors have the 'node' or 'link' class, preventing accidental deselection when clicking on nodes.
- **Hover (Node)**: Highlights incoming and outgoing edges, dims all other nodes and edges to 0.2 opacity.
- **Sidebar Relations**:
  - Relation items show a visual indicator (filled dot for composition, filled dot for association).
  - Items already in the graph are shown with reduced opacity (0.6) to provide visual feedback.
  - Property names are clickable to view the edge details.
  - Target node names are clickable to navigate to that node.
  - Tooltips (via Tippy.js) display full schema descriptions with markdown rendering.
- **URL Synchronization**: The application state (selected schema, depth, density, and label visibility) is persisted in URL parameters for easy sharing.
- **Stability**: Automatic viewport centering is disabled during node selection to preserve the user's focus; manual "Fit" is used instead.

## 3. Technical Stack
- **Languages**: HTML5, CSS3 (Vanilla), JavaScript (ES Modules).
- **Libraries**:
    - [D3.js (v7)](https://d3js.org/) for graph rendering and simulation.
    - [Popper.js](https://popper.js.org/) for tooltip positioning.
    - [Tippy.js](https://atomiks.github.io/tippyjs/) for rich tooltip interactions.
    - [Marked.js](https://marked.js.org/) for markdown parsing in sidebar content.
- **Integration**: Designed to run as a static tool within a Docusaurus project (`/static/tools/`).

---

## 4. Implementation Details (Logic Flow)
1. **Fetch**: Loads the requested JSON Schema file.
2. **Parse**: Maps definitions into a `nodes` map.
3. **Map Categories**: `mapUmsType(type, id, isRoot)` assigns the internal category based on the UMS hint and naming conventions.
4. **Extract Relations**: Scans properties for `$ref` and `x-association-target`, storing them as an array within each node object.
5. **Expansion Logic**: The `expandNode()` function recursively adds nodes and their edges during depth-based expansion. For each relation, the edge is added and then the target node is recursively expanded (if not already displayed). This naturally handles self-loops: the edge is added during the relation scan, and recursion is skipped when the target equals the source.
6. **D3 Rendering**:
    - Layers are managed by appending `<g>` elements in order: links → edge labels → nodes.
    - `allLinks.attr('d', ...)` handles both straight lines (standard edges) and arcs (self-links using `loopSize = 50`).
    - Edge labels are positioned along the edge path, with special handling for self-loops.
7. **Force Simulation**:
    - Updates `charge`, `linkDistance`, and `collision` radius based on the selected `density` level.
    - Configs: Compact (-400, 150, 60), Normal (-800, 200, 80), Sparse (-1500, 350, 120).
8. **Selection Management**:
    - Centralized `selectNode(id)` and `selectLink(id)` functions update the state, graph classes, and sidebar HTML.
    - SVG click events check the DOM path to distinguish background clicks from node/edge clicks.
9. **Tooltip Initialization**:
    - Tippy.js instances are attached to button elements with `data-tooltip` attributes after DOM updates.
    - Sidebar relation items get rich markdown-formatted tooltips using Marked.js.
10. **Marked.js Compatibility**:
    - The `configureMarked()` function handles both old (parameters-based) and new (v5+ object-based) Marked.js APIs.
    - The link renderer checks if the first argument is an object and destructures accordingly: `{ href, title, text }` vs `(href, title, text)`.
    - This ensures compatibility across different CDN versions.

---

## 5. Roadmap & Future Improvements

### Alpha 1 Accomplishments
- [x] Docusaurus theme parity and compact header.
- [x] Dedicated "External Ownership" and "Ephemeral" categories.
- [x] Interactive edge selection and sidebar details.
- [x] Tippy.js-powered rich tooltips on sidebar relation items.
- [x] Variable density control (Compact/Normal/Sparse).
- [x] Self-link visualization (Arcs with 50px loop size).
- [x] Manual "Fit to View" control.
- [x] Icon-only action buttons with tooltips.
- [x] Markdown rendering in descriptions (via Marked.js).
- [x] Internal link support for cross-references between nodes.
- [x] "View Spec" links to the detailed documentation.
- [x] Clickable relations in sidebar (property name to view link, target to navigate).
- [x] Fixed marked.js API compatibility (v5+ object-based link renderer).
- [x] Fixed SVG click event handling to prevent sidebar reset on node clicks.
- [x] Updated subentity color from purple to green/teal for better visual distinction.
- [x] Improved dimming effect (0.2 opacity for better visibility).
- [x] Self-loop support with special handling to ensure reflexive relationships are visible.
- [x] Self-loop edge positioning refinements (50px arc, labels at x+55/y-5) to prevent overlap.

### Known Issues
- [ ] **SVG Export**: Export functionality exists but download behavior needs testing across different browsers.

### Upcoming Features
- [ ] **URL-based node selection**: Add query param to specify which node should be initially selected (deep linking).
- [ ] **Search**: Integrated search bar for finding nodes by name or property.
- [ ] **Raw Schema View**: Toggle in sidebar to see the source JSON Schema for the selected item.
---

## 6. Key Technical Decisions & Challenges

### 6.1 Edge Display Strategy
**Design Decision**: Edges are shown only during explicit expansion operations (depth-based expansion or clicking relations in the sidebar). This prevents visual overload when nodes are added to the graph.

**Self-Loop Handling**: Self-referencing relationships (where source === target) require special handling because the standard expansion logic skips already-displayed nodes. The `expandNode()` function includes a special case that detects self-loops and ensures the edge is added even though the target node is already present.

**Trade-off**: This approach keeps the graph cleaner and more manageable, but means that edges between separately-added nodes won't appear automatically. Users must explicitly expand relationships to see connections. This design prioritizes clarity over completeness.

### 6.2 Marked.js API Compatibility
**Problem**: The CDN version of Marked.js (v5+) changed the link renderer API from parameter-based `(href, title, text)` to object-based `{ href, title, text }`. This caused a `TypeError: href.startsWith is not a function` error when the renderer tried to use the object as a string.

**Solution**: Modified `configureMarked()` to detect and handle both API versions:
```javascript
renderer.link = function(arg1, arg2, arg3) {
    let href, title, text;
    if (typeof arg1 === 'object' && arg1 !== null) {
        // v5+ API: object-based
        ({ href, title, text } = arg1);
    } else {
        // Old API: parameter-based
        href = arg1;
        title = arg2;
        text = arg3;
    }
    // ... rest of logic
};
```

**Impact**: The application now works with both old and new Marked.js versions, ensuring backward and forward compatibility.

### 6.3 SVG Event Handling
**Problem**: Clicking on SVG background elements (like the `<g>` groups) would trigger deselection even when clicking on nodes, because D3's `event.stopPropagation()` doesn't prevent parent SVG element handlers from firing.

**Solution**: Implemented DOM tree traversal in the SVG click handler:
```javascript
svg.on('click', function(event) {
    let element = event.target;
    while (element && element !== svg.node()) {
        if (element.classList &&
            (element.classList.contains('node') ||
             element.classList.contains('link'))) {
            return; // Don't deselect
        }
        element = element.parentElement;
    }
    deselectAll(); // Only deselect on true background click
});
```

**Impact**: Clicking on nodes no longer accidentally triggers deselection, improving user experience.

### 6.4 Color Scheme Rationale
**Decision**: Changed subentity nodes from purple (`#a371f7`) to green/teal (`#1bc97e`).

**Reasoning**:
- Purple was too similar to blue at certain screen brightness levels
- Green/teal provides better visual distinction from the blue root nodes
- The chosen green is in the same teal family as the edge colors, creating visual harmony
- Improved accessibility and readability

### 6.5 Self-Loop Rendering
**Challenge**: Self-referencing relationships (e.g., a Package that contains other Packages) need to be visible and labeled clearly.

**Implementation**:
- Loop size: 50px arc radius (increased from 35px to prevent label overlap)
- Label position: Offset to `(x+55, y-5)` relative to the node center
- Arc calculation: Uses D3 path commands to create a smooth circular arc

**Trade-offs**: Larger loops take more space but ensure labels are readable and don't overlap with the node itself.

### 6.6 Dimming Interaction Feedback
**Decision**: Reduced dimming opacity from 0.3 to 0.2.

**Reasoning**:
- 0.3 made dimmed elements too faint, especially edges
- 0.2 still clearly indicates "not focused" while maintaining visibility
- Users can still see the overall graph structure while focusing on specific relationships

### 6.7 Force Simulation Density Levels
**Design**: Three preset configurations (Compact, Normal, Sparse) with carefully tuned parameters.

**Parameters**:
- **Compact**: strength: -400, distance: 150, collision: 60 (for dense schemas)
- **Normal**: strength: -800, distance: 200, collision: 80 (default, balanced)
- **Sparse**: strength: -1500, distance: 350, collision: 120 (for detailed exploration)

**Rationale**: Different schemas have different complexity levels. Providing presets allows users to optimize the layout for their specific use case without exposing low-level D3 force parameters.

### 6.8 Sidebar Relation Visual Feedback
**Design**: Relations already in the graph show with 0.6 opacity.

**Reasoning**:
- Provides immediate visual feedback on what's already visible
- Helps users understand the current graph state
- Reduces confusion about which relations can be added vs. already present

---
