// Schema configuration
const SCHEMA_BASE_URL = '../../spec-v1/interfaces/';
const SCHEMAS = {
    'Document': 'Document.schema.json',
    'Configuration': 'Configuration.schema.json'
};

// URL parameter handling
const urlParams = new URLSearchParams(window.location.search);
let currentSchemaName = urlParams.get('schema') || 'Document';

// Ensure the schema name is valid, otherwise fallback to Document
if (!SCHEMAS[currentSchemaName]) {
    currentSchemaName = 'Document';
}

const initialDepth = parseInt(urlParams.get('depth')) || 1;
const initialDensity = urlParams.get('density') || 'normal';
const showLabelsParam = urlParams.get('labels');

// Simulation configs for different density levels
const DENSITY_CONFIGS = {
    'compact': { strength: -400, distance: 150, collision: 60 },
    'normal': { strength: -800, distance: 200, collision: 80 },
    'sparse': { strength: -1500, distance: 350, collision: 120 }
};

// Color mapping for x-ums-type
const TYPE_COLORS = {
    'root': '#58a6ff',
    'subentity': '#a371f7',
    'external_ownership': '#f78166',
    'ephemeral': '#6e7681',
    'default': '#8b949e'
};

const TYPE_LABELS = {
    'root': 'Root Entity',
    'subentity': 'Subentity',
    'external_ownership': 'External Ownership',
    'ephemeral': 'Ephemeral',
    'default': 'Internal'
};

// State management
const state = {
    schema: null,
    nodes: new Map(),
    links: [],
    displayedNodes: new Set(),
    displayedLinks: [],
    selectedNode: null,
    simulation: null,
    svg: null,
    g: null,
    zoom: null,
    showLabels: showLabelsParam === null ? true : showLabelsParam === 'true',
    edgeLabels: null,
    linkLayer: null,
    labelLayer: null,
    nodeLayer: null,
    selectedLink: null,
    density: initialDensity
};

// ===================================
// Schema Parsing
// ===================================

/**
 * Parse the JSON Schema and extract all definitions
 */
function parseSchema(schema, schemaName) {
    const definitions = schema.definitions || {};
    const nodes = new Map();

    // Create the root node
    const rootId = schemaName;
    const rootName = schema.title || `ORD ${schemaName}`;

    const rootNode = {
        id: rootId,
        name: rootName,
        type: 'root',
        umsType: mapUmsType(schema['x-ums-type'] || 'root', rootId, true),
        description: schema.description || '',
        properties: schema.properties || {},
        required: schema.required || [],
        relations: [],
        xProperties: extractXProperties(schema)
    };
    nodes.set(rootId, rootNode);

    // Parse all definitions
    for (const [name, def] of Object.entries(definitions)) {
        const node = {
            id: name,
            name: formatName(name),
            type: def.type || 'object',
            umsType: mapUmsType(def['x-ums-type'] || 'default', name),
            title: def.title || name,
            description: def.description || '',
            properties: def.properties || {},
            required: def.required || [],
            relations: [],
            xProperties: extractXProperties(def)
        };
        nodes.set(name, node);
    }

    // Extract relationships from root
    extractRelations(rootNode, schema.properties || {}, nodes);

    // Extract relationships from each definition
    for (const [name, node] of nodes) {
        if (name !== rootId) {
            const def = definitions[name];
            if (def && def.properties) {
                extractRelations(node, def.properties, nodes);
            }
        }
    }

    return nodes;
}

/**
 * Extract x- prefixed properties from a schema object
 */
function extractXProperties(obj) {
    const xProps = {};
    for (const [key, value] of Object.entries(obj)) {
        if (key.startsWith('x-') && key !== 'x-ums-type') {
            xProps[key] = value;
        }
    }
    return xProps;
}

/**
 * Format a name from camelCase/PascalCase to readable format
 */
function formatName(name) {
    return name
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
}

/**
 * Map x-ums-type to internal categories
 */
function mapUmsType(type, id, isRoot = false) {
    if (isRoot) return 'root';
    if (type === 'embedded' || type === 'custom') return 'subentity';
    if (type === 'ignore') {
        if (id && id.startsWith('System')) return 'external_ownership';
        return 'ephemeral';
    }
    return type;
}

/**
 * Extract relationships from properties
 */
function extractRelations(sourceNode, properties, allNodes) {
    for (const [propName, propDef] of Object.entries(properties)) {
        // Check for direct $ref (composition)
        if (propDef.$ref) {
            const target = extractRefTarget(propDef.$ref);
            if (target && allNodes.has(target)) {
                sourceNode.relations.push({
                    type: 'composition',
                    target: target,
                    property: propName,
                    isArray: false,
                    description: propDef.description || ''
                });
            }
        }

        // Check for array items with $ref
        if (propDef.items && propDef.items.$ref) {
            const target = extractRefTarget(propDef.items.$ref);
            if (target && allNodes.has(target)) {
                sourceNode.relations.push({
                    type: 'composition',
                    target: target,
                    property: propName,
                    isArray: true,
                    description: propDef.description || ''
                });
            }
        }

        // Check for x-association-target (association)
        if (propDef['x-association-target']) {
            for (const assocTarget of propDef['x-association-target']) {
                const target = extractAssociationTarget(assocTarget);
                if (target && allNodes.has(target)) {
                    sourceNode.relations.push({
                        type: 'association',
                        target: target,
                        property: propName,
                        isArray: false,
                        via: assocTarget,
                        description: propDef.description || ''
                    });
                }
            }
        }

        // Check for array items with x-association-target
        if (propDef.items && propDef.items['x-association-target']) {
            for (const assocTarget of propDef.items['x-association-target']) {
                const target = extractAssociationTarget(assocTarget);
                if (target && allNodes.has(target)) {
                    sourceNode.relations.push({
                        type: 'association',
                        target: target,
                        property: propName,
                        isArray: true,
                        via: assocTarget,
                        description: (propDef.items && propDef.items.description) || propDef.description || ''
                    });
                }
            }
        }
    }
}

/**
 * Extract definition name from a $ref path
 */
function extractRefTarget(ref) {
    const match = ref.match(/#\/definitions\/(\w+)/);
    return match ? match[1] : null;
}

/**
 * Extract definition name from an x-association-target path
 */
function extractAssociationTarget(target) {
    const match = target.match(/#\/definitions\/(\w+)/);
    return match ? match[1] : null;
}

/**
 * Get reverse relationships - nodes that reference the given node
 */
function getReverseRelations(nodeId) {
    const reverseRelations = [];

    for (const [sourceId, sourceNode] of state.nodes) {
        if (sourceId === nodeId) continue;

        for (const relation of sourceNode.relations) {
            if (relation.target === nodeId) {
                reverseRelations.push({
                    source: sourceId,
                    sourceName: sourceNode.name,
                    type: relation.type,
                    property: relation.property,
                    isArray: relation.isArray,
                    via: relation.via,
                    description: relation.description
                });
            }
        }
    }

    return reverseRelations;
}

/**
 * Auto-add reverse relationship links for nodes already in the graph
 */
function autoAddReverseLinks(nodeId) {
    const reverseRelations = getReverseRelations(nodeId);
    let addedLinks = false;

    for (const reverse of reverseRelations) {
        // Only add if source node is already displayed
        if (state.displayedNodes.has(reverse.source)) {
            const linkId = `${reverse.source}-${nodeId}-${reverse.property}`;
            const existingLink = state.displayedLinks.find(l => l.id === linkId);

            if (!existingLink) {
                state.displayedLinks.push({
                    id: linkId,
                    source: reverse.source,
                    target: nodeId,
                    type: reverse.type,
                    property: reverse.property,
                    isArray: reverse.isArray,
                    via: reverse.via
                });
                addedLinks = true;
            }
        }
    }

    return addedLinks;
}

/**
 * Add a reverse relation to the graph (clicking from "Referenced By" section)
 */
function addReverseRelationToGraph(targetId, sourceId, property, type) {
    const sourceNode = state.nodes.get(sourceId);
    if (!sourceNode) return;

    const relation = sourceNode.relations.find(r =>
        r.target === targetId && r.property === property && r.type === type
    );

    if (!relation) return;

    if (!state.displayedNodes.has(sourceId)) {
        state.displayedNodes.add(sourceId);
    }

    const linkId = `${sourceId}-${targetId}-${property}`;
    const existingLink = state.displayedLinks.find(l => l.id === linkId);

    if (!existingLink) {
        state.displayedLinks.push({
            id: linkId,
            source: sourceId,
            target: targetId,
            type: relation.type,
            property: relation.property,
            isArray: relation.isArray,
            via: relation.via
        });
    }

    updateGraph();
    selectNode(sourceId);
}

// ===================================
// Graph Management
// ===================================

/**
 * Initialize the graph starting from the Document root
 */
function initializeGraph(depth = 1) {
    state.displayedNodes.clear();
    state.displayedLinks = [];

    // Start with the root node of the selected schema
    expandNode(currentSchemaName, depth);

    updateGraph();
}

/**
 * Expand a node and its relations up to a certain depth
 */
function expandNode(nodeId, depth = 1) {
    if (!state.nodes.has(nodeId)) return;

    state.displayedNodes.add(nodeId);

    if (depth <= 0) return;

    const node = state.nodes.get(nodeId);
    for (const relation of node.relations) {
        if (state.nodes.has(relation.target)) {
            // Add the link if not already present
            const linkId = `${nodeId}-${relation.target}-${relation.property}`;
            const existingLink = state.displayedLinks.find(l =>
                l.source === nodeId && l.target === relation.target && l.property === relation.property
            );

            if (!existingLink) {
                state.displayedLinks.push({
                    id: linkId,
                    source: nodeId,
                    target: relation.target,
                    type: relation.type,
                    property: relation.property,
                    isArray: relation.isArray,
                    via: relation.via
                });
            }

            // Recursively expand
            if (!state.displayedNodes.has(relation.target)) {
                expandNode(relation.target, depth - 1);
            }
        }
    }
}

/**
 * Add a specific relation to the graph
 */
function addRelationToGraph(sourceId, relation) {
    const isNewNode = !state.displayedNodes.has(relation.target);

    if (isNewNode) {
        state.displayedNodes.add(relation.target);
    }

    const linkId = `${sourceId}-${relation.target}-${relation.property}`;
    const existingLink = state.displayedLinks.find(l => l.id === linkId);

    if (!existingLink) {
        state.displayedLinks.push({
            id: linkId,
            source: sourceId,
            target: relation.target,
            type: relation.type,
            property: relation.property,
            isArray: relation.isArray,
            via: relation.via
        });
    }

    // Auto-add reverse links if the target node is new
    if (isNewNode) {
        autoAddReverseLinks(relation.target);
    }

    updateGraph();
    selectNode(relation.target);
}

/**
 * Expand all immediate relations (forward and reverse) for a node
 */
function expandAllNeighbors(nodeId) {
    let added = false;

    // 1. Expand outgoing relations
    const node = state.nodes.get(nodeId);
    if (node && node.relations) {
        for (const relation of node.relations) {
            if (state.nodes.has(relation.target)) {
                if (!state.displayedNodes.has(relation.target)) {
                    state.displayedNodes.add(relation.target);
                    added = true;
                }

                const linkId = `${nodeId}-${relation.target}-${relation.property}`;
                const existingLink = state.displayedLinks.find(l => l.id === linkId);

                if (!existingLink) {
                    state.displayedLinks.push({
                        id: linkId,
                        source: nodeId,
                        target: relation.target,
                        type: relation.type,
                        property: relation.property,
                        isArray: relation.isArray,
                        via: relation.via
                    });
                    added = true;
                }
            }
        }
    }

    // 2. Expand incoming relations (reverse)
    const reverseRelations = getReverseRelations(nodeId);
    for (const reverse of reverseRelations) {
        if (!state.displayedNodes.has(reverse.source)) {
            state.displayedNodes.add(reverse.source);
            added = true;
        }

        const linkId = `${reverse.source}-${nodeId}-${reverse.property}`;
        const existingLink = state.displayedLinks.find(l => l.id === linkId);

        if (!existingLink) {
            state.displayedLinks.push({
                id: linkId,
                source: reverse.source,
                target: nodeId,
                type: reverse.type,
                property: reverse.property,
                isArray: reverse.isArray,
                via: reverse.via
            });
            added = true;
        }
    }

    if (added) {
        updateGraph();
    }
}

/**
 * Update the D3 graph visualization
 */
function updateGraph() {
    const container = document.getElementById('graph-container');
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Convert displayed nodes to array with positions
    const nodeData = Array.from(state.displayedNodes).map(id => {
        const node = state.nodes.get(id);
        const existing = state.simulation?.nodes().find(n => n.id === id);
        return {
            id: node.id,
            name: node.name,
            umsType: node.umsType,
            x: existing?.x || width / 2 + (Math.random() - 0.5) * 100,
            y: existing?.y || height / 2 + (Math.random() - 0.5) * 100,
            vx: existing?.vx || 0,
            vy: existing?.vy || 0
        };
    });

    // Create link data with node references
    const linkData = state.displayedLinks.map(link => ({
        ...link,
        source: nodeData.find(n => n.id === link.source) || link.source,
        target: nodeData.find(n => n.id === link.target) || link.target
    }));

    // Update simulation
    if (!state.simulation) {
        const config = DENSITY_CONFIGS[state.density] || DENSITY_CONFIGS.normal;
        state.simulation = d3.forceSimulation()
            .force('link', d3.forceLink().id(d => d.id).distance(config.distance))
            .force('charge', d3.forceManyBody().strength(config.strength))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide().radius(config.collision));
    } else {
        const config = DENSITY_CONFIGS[state.density] || DENSITY_CONFIGS.normal;
        state.simulation.force('link').distance(config.distance);
        state.simulation.force('charge').strength(config.strength);
        state.simulation.force('collision').radius(config.collision);
    }

    state.simulation
        .nodes(nodeData)
        .force('link').links(linkData);

    // Draw links
    const links = state.linkLayer.selectAll('.link')
        .data(linkData, d => d.id);

    links.exit().remove();

    const linksEnter = links.enter()
        .append('path')
        .attr('class', d => `link ${d.type}`)
        .attr('marker-end', d => `url(#arrow-${d.type})`)
        .on('click', (event, d) => {
            event.stopPropagation();
            selectLink(d.id);
        });

    const allLinks = links.merge(linksEnter);

    // Update selection state for links
    allLinks.classed('selected', d => d.id === state.selectedLink);

    // Draw edge labels
    const edgeLabels = state.labelLayer.selectAll('.edge-label')
        .data(linkData, d => d.id);

    edgeLabels.exit().remove();

    const edgeLabelsEnter = edgeLabels.enter()
        .append('text')
        .attr('class', 'edge-label')
        .attr('dy', -5)
        .attr('text-anchor', 'middle')
        .text(d => d.property);

    // Initial visibility based on state
    edgeLabelsEnter.classed('hidden', !state.showLabels);

    state.edgeLabels = edgeLabels.merge(edgeLabelsEnter);

    // Draw nodes
    const nodes = state.nodeLayer.selectAll('.node')
        .data(nodeData, d => d.id);

    nodes.exit().remove();

    const nodesEnter = nodes.enter()
        .append('g')
        .attr('class', 'node')
        .call(d3.drag()
            .on('start', dragStarted)
            .on('drag', dragged)
            .on('end', dragEnded))
        .on('click', (event, d) => {
            event.stopPropagation();
            if (state.selectedNode === d.id) {
                expandAllNeighbors(d.id);
            } else {
                selectNode(d.id);
            }

            // Re-initialize tooltips if sidebar was updated
            setupTooltips();
        })
        .on('mouseenter', (event, d) => {
            // Find connected nodes
            const connectedNodeIds = new Set();
            connectedNodeIds.add(d.id);
            state.linkLayer.selectAll('.link').each(l => {
                if ((l.source.id || l.source) === d.id) connectedNodeIds.add(l.target.id || l.target);
                if ((l.target.id || l.target) === d.id) connectedNodeIds.add(l.source.id || l.source);
            });

            // Highlight incoming and outgoing edges
            state.linkLayer.selectAll('.link')
                .classed('highlighted', l => (l.source.id || l.source) === d.id || (l.target.id || l.target) === d.id)
                .classed('dimmed', l => (l.source.id || l.source) !== d.id && (l.target.id || l.target) !== d.id);

            // Dim other nodes, but keep connected nodes visible
            state.nodeLayer.selectAll('.node')
                .classed('dimmed', n => !connectedNodeIds.has(n.id));
        })
        .on('mouseleave', () => {
            // Remove highlighting and dimming
            state.linkLayer.selectAll('.link').classed('highlighted', false).classed('dimmed', false);
            state.nodeLayer.selectAll('.node').classed('dimmed', false);
        });

    nodesEnter.append('circle')
        .attr('r', d => d.id === currentSchemaName ? 24 : 18)
        .attr('fill', d => TYPE_COLORS[d.umsType] || TYPE_COLORS.default)
        .attr('stroke', d => TYPE_COLORS[d.umsType] || TYPE_COLORS.default)
        .attr('stroke-opacity', 0.3);

    nodesEnter.append('text')
        .attr('dy', d => d.id === currentSchemaName ? 40 : 34)
        .attr('text-anchor', 'middle')
        .text(d => d.name);

    const allNodes = nodes.merge(nodesEnter);

    // Update selection state
    allNodes.classed('selected', d => d.id === state.selectedNode);

    // Update simulation tick
    state.simulation.on('tick', () => {
        allLinks.attr('d', d => {
            if (d.source.id === d.target.id) {
                const x = d.source.x;
                const y = d.source.y;
                const loopSize = 35;
                return `M ${x} ${y} C ${x + loopSize} ${y - loopSize * 1.5}, ${x + loopSize * 1.5} ${y + loopSize}, ${x} ${y}`;
            }
            return `M ${d.source.x} ${d.source.y} L ${d.target.x} ${d.target.y}`;
        });

        if (state.edgeLabels) {
            state.edgeLabels
                .attr('x', d => {
                    if (d.source.id === d.target.id) return d.source.x + 40;
                    return (d.source.x + d.target.x) / 2;
                })
                .attr('y', d => {
                    if (d.source.id === d.target.id) return d.source.y;
                    return (d.source.y + d.target.y) / 2;
                });
        }

        allNodes.attr('transform', d => `translate(${d.x}, ${d.y})`);
    });

    state.simulation.alpha(0.3).restart();
}

/**
 * Zoom and pan the graph to fit all displayed nodes
 */
function zoomToFit() {
    if (!state.g || state.displayedNodes.size === 0) return;

    const container = document.getElementById('graph-container');
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Get the bounding box of the graph content
    const bounds = state.g.node().getBBox();
    if (bounds.width === 0 || bounds.height === 0) return;

    const scale = 0.85 / Math.max(bounds.width / width, bounds.height / height);
    const cappedScale = Math.min(Math.max(scale, 0.2), 2); // Avoid extreme zoom

    const midX = bounds.x + bounds.width / 2;
    const midY = bounds.y + bounds.height / 2;

    const transform = d3.zoomIdentity
        .translate(width / 2 - cappedScale * midX, height / 2 - cappedScale * midY)
        .scale(cappedScale);

    state.svg.transition()
        .duration(750)
        .call(state.zoom.transform, transform);
}

// ===================================
// Drag handlers
// ===================================

function dragStarted(event, d) {
    if (!event.active) state.simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
}

function dragEnded(event, d) {
    if (!event.active) state.simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}

// ===================================
// Sidebar Management
// ===================================

/**
 * Select a node and show its details in the sidebar
 */
function selectNode(nodeId) {
    state.selectedNode = nodeId;
    state.selectedLink = null;
    const node = state.nodes.get(nodeId);

    if (!node) return;

    // Auto-add reverse links for this node
    const addedLinks = autoAddReverseLinks(nodeId);
    if (addedLinks) {
        updateGraph();
    }

    // Update node/link selection in graph
    state.g.selectAll('.node').classed('selected', d => d.id === nodeId);
    state.g.selectAll('.link').classed('selected', false);

    // Update sidebar
    const sidebar = document.getElementById('sidebar');
    const title = document.getElementById('sidebar-title');
    const content = document.getElementById('sidebar-content');

    sidebar.classList.remove('collapsed');
    title.textContent = node.name;

    content.innerHTML = renderNodeDetails(node);

    // Add event listeners for forward relation clicks
    // Add event listeners for forward relation clicks
    content.querySelectorAll('.relation-item:not(.reverse)').forEach(item => {
        // Property name click -> select link
        const nameSpan = item.querySelector('.relation-name-clickable');
        if (nameSpan) {
            nameSpan.addEventListener('click', (e) => {
                e.stopPropagation();
                const targetId = item.dataset.target;
                const property = item.dataset.property;

                // Find existing link in displayed links
                const link = state.displayedLinks.find(l =>
                    (l.source.id === nodeId || l.source === nodeId) &&
                    (l.target.id === targetId || l.target === targetId) &&
                    l.property === property
                );

                if (link) {
                    selectLink(link.id);
                } else {
                    // If not displayed, add it first then select
                    const relation = node.relations.find(r => r.target === targetId && r.property === property);
                    if (relation) {
                        addRelationToGraph(nodeId, relation);
                        // After adding, find and select
                        setTimeout(() => {
                            const newLink = state.displayedLinks.find(l =>
                                (l.source.id === nodeId || l.source === nodeId) &&
                                (l.target.id === targetId || l.target === targetId) &&
                                l.property === property
                            );
                            if (newLink) selectLink(newLink.id);
                        }, 50);
                    }
                }
            });
        }

        // Target type click -> navigate to node
        const targetSpan = item.querySelector('.relation-target-clickable');
        if (targetSpan) {
            targetSpan.addEventListener('click', (e) => {
                e.stopPropagation();
                const targetId = item.dataset.target;

                // Add relation if not exists, then select node
                const property = item.dataset.property;
                const relation = node.relations.find(r => r.target === targetId && r.property === property);

                if (relation) {
                   const linkExists = state.displayedLinks.some(l =>
                        (l.source.id === nodeId || l.source === nodeId) &&
                        (l.target.id === targetId || l.target === targetId) &&
                        l.property === property
                    );

                    if (!linkExists) {
                        addRelationToGraph(nodeId, relation);
                    }
                }

                selectNode(targetId);
            });
        }
    });

    // Add event listeners for reverse relation clicks
    content.querySelectorAll('.relation-item.reverse').forEach(item => {
        // Property name click -> select link
        const nameSpan = item.querySelector('.relation-name-clickable');
        if (nameSpan) {
            nameSpan.addEventListener('click', (e) => {
                e.stopPropagation();
                const sourceId = item.dataset.source;
                const property = item.dataset.property;

                const link = state.displayedLinks.find(l =>
                    (l.source.id === sourceId || l.source === sourceId) &&
                    (l.target.id === nodeId || l.target === nodeId) &&
                    l.property === property
                );

                if (link) {
                    selectLink(link.id);
                } else {
                    const type = item.dataset.type;
                    addReverseRelationToGraph(nodeId, sourceId, property, type);
                    setTimeout(() => {
                         const newLink = state.displayedLinks.find(l =>
                            (l.source.id === sourceId || l.source === sourceId) &&
                            (l.target.id === nodeId || l.target === nodeId) &&
                            l.property === property
                        );
                        if (newLink) selectLink(newLink.id);
                    }, 50);
                }
            });
        }

        // Source node click -> navigate to node
        const sourceSpan = item.querySelector('.relation-target-clickable');
        if (sourceSpan) {
            sourceSpan.addEventListener('click', (e) => {
                e.stopPropagation();
                const sourceId = item.dataset.source;
                const property = item.dataset.property;
                const type = item.dataset.type;

                const linkExists = state.displayedLinks.some(l =>
                    (l.source.id === sourceId || l.source === sourceId) &&
                    (l.target.id === nodeId || l.target === nodeId) &&
                    l.property === property
                );

                if (!linkExists) {
                    addReverseRelationToGraph(nodeId, sourceId, property, type);
                }
                selectNode(sourceId);
            });
        }
    });
}

function selectLink(linkId) {
    state.selectedLink = linkId;
    state.selectedNode = null;

    const link = state.displayedLinks.find(l => l.id === linkId);
    if (!link) return;

    // Update graph selection
    state.g.selectAll('.node').classed('selected', false);
    state.g.selectAll('.link').classed('selected', d => d.id === linkId);

    // Update sidebar
    const sidebar = document.getElementById('sidebar');
    const title = document.getElementById('sidebar-title');
    const content = document.getElementById('sidebar-content');

    sidebar.classList.remove('collapsed');
    title.textContent = `Relation: ${link.property}`;

    content.innerHTML = renderLinkDetails(link);

    // Add event listeners for source/target navigation
    content.querySelectorAll('.node-nav-link').forEach(item => {
        item.addEventListener('click', () => {
            selectNode(item.dataset.node);
        });
    });
}

/**
 * Render link details HTML
 */
function renderLinkDetails(link) {
    const sourceNode = state.nodes.get(link.source.id || link.source);
    const targetNode = state.nodes.get(link.target.id || link.target);

    let html = '';

    // Type badge (Composition vs Association)
    html += `
        <div class="section" style="display: flex; justify-content: space-between; align-items: center;">
            <span class="node-type-badge ${link.type}">${link.type.toUpperCase()}</span>
            <a href="${getDocUrl(link.source.id || link.source, link.property)}" target="_blank" class="doc-link" title="Open Interface Documentation" style="display: flex; align-items: center; gap: 4px; color: var(--color-accent); text-decoration: none; font-size: 12px;">
                <span>View Spec</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            </a>
        </div>
    `;

    // Description (if we can find it)
    let description = '';
    if (sourceNode) {
        const relation = sourceNode.relations.find(r => r.property === link.property && r.target === (targetNode ? targetNode.id : link.target));
        if (relation) description = relation.description;
    }

    if (description) {
        html += `
            <div class="section">
                <h3 class="section-title">Description</h3>
                <div class="description markdown-body">${marked.parse(description)}</div>
            </div>
        `;
    }

    // Connections List
    html += `
        <div class="section">
            <h3 class="section-title">Connections</h3>
            <ul class="relation-list">
    `;

    // Source Node Item
    const sourceColor = sourceNode ? (TYPE_COLORS[sourceNode.umsType] || TYPE_COLORS['default']) : TYPE_COLORS['default'];

    html += `
        <li class="relation-item node-nav-link" data-node="${sourceNode ? sourceNode.id : link.source}" title="Go to Source Node">
            <span class="relation-indicator" style="background-color: ${sourceColor}"></span>
            <span class="relation-name" style="flex: 1; color: var(--color-text-primary); border-bottom: none;">${sourceNode ? sourceNode.name : link.source}</span>
            <span class="relation-type-name" style="flex: 0 0 auto; color: var(--color-text-secondary); font-size: 11px;">Source</span>
        </li>
    `;

    // Target Node Item
    const targetColor = targetNode ? (TYPE_COLORS[targetNode.umsType] || TYPE_COLORS['default']) : TYPE_COLORS['default'];

    html += `
        <li class="relation-item node-nav-link" data-node="${targetNode ? targetNode.id : link.target}" title="Go to Target Node">
            <span class="relation-indicator" style="background-color: ${targetColor}"></span>
            <span class="relation-name" style="flex: 1; color: var(--color-text-primary); border-bottom: none;">${targetNode ? targetNode.name : link.target}</span>
            <span class="relation-type-name" style="flex: 0 0 auto; color: var(--color-text-secondary); font-size: 11px;">Target</span>
        </li>
    `;

    html += `
            </ul>
        </div>
    `;

    return html;
}
function renderNodeDetails(node) {
    let html = '';

    // Node type badge
    html += `
        <div class="section" style="display: flex; justify-content: space-between; align-items: center;">
            <span class="node-type-badge ${node.umsType}">${TYPE_LABELS[node.umsType] || node.umsType}</span>
            <a href="${getDocUrl(node.id)}" target="_blank" class="doc-link" title="Open Interface Documentation" style="display: flex; align-items: center; gap: 4px; color: var(--color-accent); text-decoration: none; font-size: 12px;">
                <span>View Spec</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            </a>
        </div>
    `;

    // Description
    if (node.description) {
        html += `
            <div class="section">
                <h3 class="section-title">Description</h3>
                <div class="description markdown-body">${marked.parse(node.description)}</div>
            </div>
        `;
    }

    // Forward Relations (outgoing)
    if (node.relations.length > 0) {
        html += `
            <div class="section">
                <h3 class="section-title">→ Relates To (${node.relations.length})</h3>
                <ul class="relation-list">
        `;

        for (const relation of node.relations) {
            const targetNode = state.nodes.get(relation.target);
            const hasLink = state.displayedLinks.some(l =>
                (l.source === node.id || l.source.id === node.id) &&
                (l.target === relation.target || l.target.id === relation.target) &&
                l.property === relation.property
            );

            const tooltipAttr = relation.description ? `data-tippy-content="${escapeHtml(relation.description)}"` : '';

            // Determine color based on target node type
            const targetColor = targetNode ? (TYPE_COLORS[targetNode.umsType] || TYPE_COLORS['default']) : TYPE_COLORS['default'];

            html += `
                <li class="relation-item ${hasLink ? 'in-graph' : ''}"
                    data-target="${relation.target}"
                    data-property="${relation.property}"
                    data-type="${relation.type}"
                    ${tooltipAttr}>
                    <span class="relation-name relation-name-clickable" title="View Link Details" style="cursor: pointer">${relation.property}${relation.isArray ? '[]' : ''}</span>
                    <span class="relation-type-name relation-target-clickable" title="Go to Node" style="cursor: pointer; display: flex; align-items: center;">
                        <span class="relation-indicator" style="background-color: ${targetColor}; margin-right: 6px;"></span>
                        <span style="color: var(--color-text-primary)">${targetNode ? targetNode.name : relation.target}</span>
                    </span>
                </li>
            `;
        }

        html += `
                </ul>
            </div>
        `;
    }

    // Reverse Relations (incoming - referenced by)
    const reverseRelations = getReverseRelations(node.id);
    if (reverseRelations.length > 0) {
        html += `
            <div class="section">
                <h3 class="section-title">← Inverse Relations (${reverseRelations.length})</h3>
                <ul class="relation-list">
        `;

        for (const reverse of reverseRelations) {
            const hasLink = state.displayedLinks.some(l =>
                (l.source === reverse.source || l.source.id === reverse.source) &&
                (l.target === node.id || l.target.id === node.id) &&
                l.property === reverse.property
            );

            const tooltipAttr = reverse.description ? `data-tippy-content="${escapeHtml(reverse.description)}"` : '';

            // Determine color based on source node type logic (we need to look up the source node)
            const sourceNode = state.nodes.get(reverse.source);
            const sourceColor = sourceNode ? (TYPE_COLORS[sourceNode.umsType] || TYPE_COLORS['default']) : TYPE_COLORS['default'];

            html += `
                <li class="relation-item reverse ${hasLink ? 'in-graph' : ''}"
                    data-source="${reverse.source}"
                    data-property="${reverse.property}"
                    data-type="${reverse.type}"
                    ${tooltipAttr}>
                    <span class="relation-name relation-target-clickable" title="Go to Node" style="cursor: pointer; display: flex; align-items: center;">
                        <span class="relation-indicator" style="background-color: ${sourceColor}; margin-right: 6px;"></span>
                        ${reverse.sourceName}
                    </span>
                    <span class="relation-type-name relation-name-clickable" title="View Link Details" style="cursor: pointer">${reverse.property}${reverse.isArray ? '[]' : ''}</span>
                </li>
            `;
        }

        html += `
                </ul>
            </div>
        `;
    }

    // Properties
    const propertyKeys = Object.keys(node.properties);
    if (propertyKeys.length > 0) {
        html += `
            <div class="section">
                <h3 class="section-title">Properties (${propertyKeys.length})</h3>
                <div class="properties-table">
        `;

        for (const key of propertyKeys) {
            const prop = node.properties[key];
            const type = getPropertyType(prop);
            const isRequired = node.required.includes(key);

            // Try to find a description: direct, or via ref
            let description = prop.description;
            if (!description && prop.$ref) {
                 // Attempt to resolve ref to find description
                 const refName = extractRefTarget(prop.$ref);
                 const refNode = state.nodes.get(refName || '');
                 if (refNode) description = refNode.description;
            }

            const tooltipAttr = description ? `data-tippy-content="${escapeHtml(description)}"` : '';

            html += `
                <div class="property-row" ${tooltipAttr}>
                    <div class="property-key">${key}${isRequired ? ' *' : ''}</div>
                    <div class="property-value code">${type}</div>
                </div>
            `;
        }

        html += `
                </div>
            </div>
        `;
    }

    // X-Properties
    const xPropKeys = Object.keys(node.xProperties);
    if (xPropKeys.length > 0) {
        html += `
            <div class="section">
                <h3 class="section-title">Extended Properties</h3>
                <div class="properties-table">
        `;

        for (const key of xPropKeys) {
            const value = node.xProperties[key];
            html += `
                <div class="property-row">
                    <div class="property-key">${key}</div>
                    <div class="property-value">${formatPropertyValue(value)}</div>
                </div>
            `;
        }

        html += `
                </div>
            </div>
        `;
    }

    return html;
}

/**
 * Get a simplified type string for a property
 */
function getPropertyType(prop) {
    if (prop.$ref) {
        return extractRefTarget(prop.$ref) || 'ref';
    }
    if (prop.type === 'array' && prop.items) {
        if (prop.items.$ref) {
            return `${extractRefTarget(prop.items.$ref) || 'ref'}[]`;
        }
        return `${prop.items.type || 'any'}[]`;
    }
    if (prop.type) {
        return prop.type;
    }
    if (prop.anyOf || prop.oneOf) {
        return 'union';
    }
    return 'any';
}

/**
 * Format a property value for display
 */
function formatPropertyValue(value) {
    if (typeof value === 'string') {
        return escapeHtml(value);
    }
    if (Array.isArray(value)) {
        return escapeHtml(value.join(', '));
    }
    if (typeof value === 'object') {
        return escapeHtml(JSON.stringify(value));
    }
    return String(value);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===================================
// Event Handlers
// ===================================

function setupEventListeners() {
    // Depth slider
    const depthSlider = document.getElementById('depth-slider');
    const depthValue = document.getElementById('depth-value');

    if (depthSlider) {
        depthSlider.value = initialDepth;
        if (depthValue) depthValue.textContent = initialDepth;

        depthSlider.addEventListener('input', () => {
            depthValue.textContent = depthSlider.value;
        });

        depthSlider.addEventListener('change', () => {
            const newDepth = parseInt(depthSlider.value);
            initializeGraph(newDepth);

            // Update URL
            const newUrl = new URL(window.location);
            newUrl.searchParams.set('depth', newDepth);
            window.history.replaceState(null, '', newUrl);
        });
    }

    // Edge Labels Toggle
    const labelCheckbox = document.getElementById('show-labels');
    if (labelCheckbox) {
        labelCheckbox.checked = state.showLabels;
        labelCheckbox.addEventListener('change', (e) => {
            state.showLabels = e.target.checked;
            if (state.edgeLabels) {
                state.edgeLabels.classed('hidden', !state.showLabels);
            }

            // Update URL
            const newUrl = new URL(window.location);
            newUrl.searchParams.set('labels', state.showLabels);
            window.history.replaceState(null, '', newUrl);
        });
    }

    // Density Selection
    const densitySelect = document.getElementById('density-select');
    if (densitySelect) {
        densitySelect.value = state.density;
        densitySelect.addEventListener('change', (e) => {
            state.density = e.target.value;
            updateGraph();

            // Update URL
            const newUrl = new URL(window.location);
            newUrl.searchParams.set('density', state.density);
            window.history.replaceState(null, '', newUrl);
        });
    }

    // Export Button
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            exportAsSVG();
        });
    }

    // Schema Selection
    const schemaSelect = document.getElementById('schema-select');
    if (schemaSelect) {
        // Set initial dropdown value based on URL
        schemaSelect.value = currentSchemaName;

        schemaSelect.addEventListener('change', (e) => {
            const newSchemaName = e.target.value;
            loadSchema(newSchemaName);

            // Update URL query param without reloading page
            const newUrl = new URL(window.location);
            newUrl.searchParams.set('schema', newSchemaName);
            window.history.pushState({ schema: newSchemaName }, '', newUrl);
        });
    }

    // Handle back/forward navigation
    window.addEventListener('popstate', (e) => {
        if (e.state && e.state.schema) {
            schemaSelect.value = e.state.schema;
            loadSchema(e.state.schema);
        }
    });

    // Reset button
    document.getElementById('reset-btn').addEventListener('click', () => {
        const depthSlider = document.getElementById('depth-slider');
        initializeGraph(parseInt(depthSlider.value));
        state.selectedNode = null;
        document.getElementById('sidebar-content').innerHTML = '<p class="empty-state">Click on a node in the graph to see its details</p>';
    });

    // Expand all button
    document.getElementById('expand-all-btn').addEventListener('click', () => {
        initializeGraph(10); // Large depth to expand all
    });

    // Fit button
    document.getElementById('fit-btn').addEventListener('click', () => {
        zoomToFit();
    });

    // Close sidebar
    document.getElementById('close-sidebar').addEventListener('click', () => {
        document.getElementById('sidebar').classList.add('collapsed');
        state.selectedNode = null;
        state.g.selectAll('.node').classed('selected', false);
    });

    // Click on empty space to deselect
    state.svg.on('click', () => {
        state.selectedNode = null;
        state.selectedLink = null;
        state.g.selectAll('.node').classed('selected', false);
        state.g.selectAll('.link').classed('selected', false);
        document.getElementById('sidebar').classList.add('collapsed');
    });

    // Window resize
    window.addEventListener('resize', () => {
        if (state.simulation) {
            const container = document.getElementById('graph-container');
            state.simulation
                .force('center', d3.forceCenter(container.clientWidth / 2, container.clientHeight / 2))
                .alpha(0.3)
                .restart();
        }
    });

    // Handle internal links in sidebar (markdown content)
    const sidebarContent = document.getElementById('sidebar-content');
    if (sidebarContent) {
        sidebarContent.addEventListener('click', (e) => {
            const link = e.target.closest('.internal-link');
            if (link) {
                e.preventDefault();
                const targetId = link.dataset.target;
                handleInternalLink(targetId);
            }
        });
    }
}

// ===================================
// Tooltips
// ===================================

// ===================================
// Tooltips & Markdown
// ===================================

/**
 * Configure marked.js renderer to handle links
 */
function configureMarked() {
    const renderer = new marked.Renderer();
    const originalLink = renderer.link.bind(renderer);

    renderer.link = function(href, title, text) {
        if (!href) return originalLink(href, title, text);

        // 1. Handle internal anchor links (e.g. #vendor)
        if (href.startsWith('#')) {
            const targetId = href.substring(1);
            return `<a href="#" class="internal-link" data-target="${targetId}" title="${title || ''}">${text}</a>`;
        }

        // 2. Handle relative links
        // We assume links are relative to the schema file location (spec-v1/interfaces/)
        // We interpret them relative to the viewer location (static/tools/schema-viewer/)
        // The path from viewer to schema dir is ../../spec-v1/interfaces/
        if (!href.startsWith('http') && !href.startsWith('https') && !href.startsWith('mailto:')) {
            let newHref = `../../spec-v1/interfaces/${href}`;
            // Remove .md extension to match Docusaurus clean URLs
            newHref = newHref.replace(/\.md($|#)/, '$1');
            return `<a href="${newHref}" title="${title || ''}" target="_blank">${text}</a>`;
        }

        // Default behavior for absolute links
        return originalLink(href, title, text);
    };

    marked.use({ renderer });
}

/**
 * Handle clicks on internal links to nodes
 */
function handleInternalLink(targetRef) {
    // Find the node ID (case-insensitive search)
    let nodeId = null;
    if (state.nodes.has(targetRef)) {
        nodeId = targetRef;
    } else {
        const lowerRef = targetRef.toLowerCase();
        for (const id of state.nodes.keys()) {
            if (id.toLowerCase() === lowerRef) {
                nodeId = id;
                break;
            }
        }
    }

    if (nodeId) {
        // Ensure node is visible
        if (!state.displayedNodes.has(nodeId)) {
            state.displayedNodes.add(nodeId);
            // If it's a new node, maybe add its relations too?
            // For now, just adding the node itself is safer to avoid explosion.
            // But we should probably add reverse links so it's connected.
            autoAddReverseLinks(nodeId);
            updateGraph();
        }
        selectNode(nodeId);
    } else {
        console.warn(`Could not find node for reference: ${targetRef}`);
    }
}

/**
 * Generate a deep link to the original interface documentation
 */
function getDocUrl(nodeId, property = null) {
    // Determine the base schema URL component
    // Assuming the file structure ../../spec-v1/interfaces/{SchemaName}
    let url = `../../spec-v1/interfaces/${currentSchemaName}`;
    let nodeSlug = '';

    try {
        if (nodeId === currentSchemaName) {
            // Root node: use schema title to match Docusaurus slug (e.g. "ORD Document" -> "ord-document")
            // Fallback to nodeId if title missing
            const useTitle = state.schema && state.schema.title ? state.schema.title : nodeId;
            nodeSlug = toSlug(useTitle);
        } else {
            // Sub-definitions: format name (split CamelCase) and slugify
            // e.g. "ApiResource" -> "Api Resource" -> "api-resource"
            nodeSlug = toSlug(formatName(nodeId));
        }

        // Add property part if exists
        if (property) {
            // Property anchor format: node-slug_property-name (underscore separator)
            // e.g. "api-resource_ordid"
            url += `#${nodeSlug}_${property.toLowerCase()}`;
        } else {
             // Node anchor format: node-slug
             // e.g. "api-resource"
             url += `#${nodeSlug}`;
        }
    } catch (e) {
        console.warn('Error generating doc url:', e);
        return url;
    }

    return url;
}

function toSlug(text) {
    if (!text) return '';
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start
        .replace(/-+$/, '');            // Trim - from end
}

function setupTooltips() {
    // Initialize iconic button tooltips (header)
    tippy('[data-tooltip]', {
        content: (reference) => reference.getAttribute('data-tooltip'),
        theme: 'light',
        placement: 'bottom',
        animation: 'scale',
    });

    // Initialize property description tooltips (sidebar)
    // We use a delegate approach or re-init on sidebar update.
    // For simplicity, we'll select elements with data-tippy-content that are property rows
    tippy('.property-row[data-tippy-content], .relation-item[data-tippy-content]', {
        content(reference) {
            const markdown = reference.getAttribute('data-tippy-content');
            if (!markdown) return '';
            return marked.parse(markdown);
        },
        allowHTML: true,
        theme: 'light',
        placement: 'left',
        maxWidth: 350,
        interactive: true,
        appendTo: document.body,
    });
}

// ===================================
// Export Functionality
// ===================================

/**
 * Serialize the current SVG graph to a string, including necessary styles
 */
function serializeSVG() {
    const svgEl = document.getElementById('graph-svg');
    const clone = svgEl.cloneNode(true);

    // Add explicitly defined styles to the clone
    const styleEl = document.createElement('style');
    styleEl.textContent = `
        svg { background-color: #1b1b1f; font-family: "Inter", sans-serif; }
        .node circle { stroke-width: 2px; }
        .node text { font-size: 11px; fill: #dfdfd6; }
        .link { stroke-opacity: 0.6; stroke-width: 2px; fill: none; }
        .link.composition { stroke: #1e8f95; }
        .link.association { stroke: #32bcac; }
        .edge-label { font-size: 8px; fill: #6a6a71; }

        /* Highlight states */
        .node.dimmed { opacity: 0.3; }
        .link.dimmed { opacity: 0.3; }
        .link.highlighted { opacity: 1; stroke-width: 2.5px; }
        .link.selected { opacity: 1; stroke-width: 3px; stroke: #dfdfd6; }
        .node.selected circle { stroke: #dfdfd6; stroke-width: 4px; }
    `;
    clone.prepend(styleEl);

    const serializer = new XMLSerializer();
    return serializer.serializeToString(clone);
}

/**
 * Trigger a browser download of a file
 */
function triggerDownload(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Export current view as SVG
 */
function exportAsSVG() {
    const svgData = serializeSVG();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const now = new Date();
    const timestamp = now.toISOString().replace(/T/, '_').replace(/:/g, '-').slice(0, 16);

    triggerDownload(url, `${timestamp}_ord-schema-${currentSchemaName.toLowerCase()}.svg`);
    URL.revokeObjectURL(url);
}

// ===================================
// Initialization
// ===================================

async function loadSchema(schemaName) {
    currentSchemaName = schemaName;
    const url = SCHEMA_BASE_URL + SCHEMAS[schemaName];

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const schemaData = await response.json();

        state.schema = schemaData;
        state.nodes = parseSchema(schemaData, schemaName);

        const depthSlider = document.getElementById('depth-slider');
        initializeGraph(parseInt(depthSlider?.value || 1));

        // Reset sidebar
        document.getElementById('sidebar').classList.add('collapsed');
        document.getElementById('sidebar-content').innerHTML = '<p class="empty-state">Click on a node in the graph to see its details</p>';
    } catch (error) {
        console.error('Failed to load schema:', error);
        document.getElementById('sidebar-content').innerHTML = `
            <div class="error-state" style="padding: 20px; color: #ff6b6b; background: rgba(255,107,107,0.1); border-radius: 8px;">
                <h4>Failed to load schema</h4>
                <p>${error.message}</p>
                <p style="font-size: 11px; opacity: 0.7; margin-top: 10px;">URL: ${url}</p>
            </div>
        `;
    }
}


async function init() {
    try {
        // Configure Markdown renderer
        configureMarked();

        // Initialize SVG
        const container = document.getElementById('graph-container');
        state.svg = d3.select('#graph-svg');

        // Add arrow markers for links
        const defs = state.svg.append('defs');

        // Composition arrow (teal-blue)
        defs.append('marker')
            .attr('id', 'arrow-composition')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 28)
            .attr('refY', 0)
            .attr('markerWidth', 6)
            .attr('markerHeight', 6)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M0,-5L10,0L0,5')
            .attr('fill', '#1e8f95');

        // Association arrow (teal)
        defs.append('marker')
            .attr('id', 'arrow-association')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 28)
            .attr('refY', 0)
            .attr('markerWidth', 6)
            .attr('markerHeight', 6)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M0,-5L10,0L0,5')
            .attr('fill', '#32bcac');

        state.g = state.svg.append('g');

        // Add layers for strict z-index control (last appended is on top)
        state.linkLayer = state.g.append('g').attr('class', 'links-layer');
        state.labelLayer = state.g.append('g').attr('class', 'labels-layer');
        state.nodeLayer = state.g.append('g').attr('class', 'nodes-layer');

        // Setup zoom
        state.zoom = d3.zoom()
            .scaleExtent([0.1, 8])
            .on('zoom', (event) => {
                state.g.attr('transform', event.transform);
            });

        state.svg.call(state.zoom);

        // Setup listeners
        setupEventListeners();

        // Initialize tooltips
        setupTooltips();

        // Load initial schema
        await loadSchema(currentSchemaName);

        // If depth was changed from default 1, we need to re-initialize or set slider
        // The loadSchema calls initializeGraph(sliderValue), which is now correct since we set slider.value
        // but let's ensure it's explicitly done if needed.

    } catch (error) {
        console.error('Initialization error:', error);
    }
}

// Start the application
init();
