/**
 * Graph Rendering and Management for the Schema Viewer (D3.js)
 */

import { state } from './state.js';
import { TYPE_COLORS, DENSITY_CONFIGS } from './config.js';

/**
 * Initialize the graph starting from a specific node
 */
export function initializeGraph(depth = 1, startNodeId = null) {
  state.displayedNodes.clear();
  state.displayedLinks = [];

  // Choose starting node: provided ID, or from URL, or default root
  const urlParams = new URLSearchParams(window.location.search);
  const effectiveStartNode =
    startNodeId || urlParams.get('node') || state.currentSchemaName;

  if (depth === 0) {
    state.displayedNodes.add(effectiveStartNode);
  } else {
    expandNode(effectiveStartNode, depth);
  }

  updateGraph();
}

/**
 * Expand a node and its relations up to a certain depth
 */
export function expandNode(nodeId, depth = 1) {
  if (!state.nodes.has(nodeId)) return;

  state.displayedNodes.add(nodeId);

  if (depth <= 0) return;

  const node = state.nodes.get(nodeId);
  for (const relation of node.relations) {
    if (state.nodes.has(relation.target)) {
      const linkId = `${nodeId}-${relation.target}-${relation.property}`;
      const existingLink = state.displayedLinks.find(
        (l) =>
          l.source === nodeId &&
          l.target === relation.target &&
          l.property === relation.property,
      );

      if (!existingLink) {
        state.displayedLinks.push({
          id: linkId,
          source: nodeId,
          target: relation.target,
          type: relation.type,
          property: relation.property,
          isArray: relation.isArray,
          via: relation.via,
        });
      }

      // Recursively expand if target is new
      if (!state.displayedNodes.has(relation.target)) {
        expandNode(relation.target, depth - 1);
      }
    }
  }
}

/**
 * Get reverse relationships - nodes that reference the given node
 */
export function getReverseRelations(nodeId) {
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
          description: relation.description,
        });
      }
    }
  }

  return reverseRelations;
}

/**
 * Auto-add reverse relationship links for nodes already in the graph
 */
export function autoAddReverseLinks(nodeId) {
  const reverseRelations = getReverseRelations(nodeId);
  let addedLinks = false;

  for (const reverse of reverseRelations) {
    if (state.displayedNodes.has(reverse.source)) {
      const linkId = `${reverse.source}-${nodeId}-${reverse.property}`;
      const existingLink = state.displayedLinks.find((l) => l.id === linkId);

      if (!existingLink) {
        state.displayedLinks.push({
          id: linkId,
          source: reverse.source,
          target: nodeId,
          type: reverse.type,
          property: reverse.property,
          isArray: reverse.isArray,
          via: reverse.via,
        });
        addedLinks = true;
      }
    }
  }

  return addedLinks;
}

/**
 * Auto-add forward relationship links from the node to nodes already in the graph
 */
export function autoAddForwardLinks(nodeId) {
  if (!state.nodes.has(nodeId)) return false;
  const node = state.nodes.get(nodeId);
  let addedLinks = false;

  for (const relation of node.relations) {
    if (state.displayedNodes.has(relation.target)) {
      const linkId = `${nodeId}-${relation.target}-${relation.property}`;
      const existingLink = state.displayedLinks.find((l) => l.id === linkId);

      if (!existingLink) {
        state.displayedLinks.push({
          id: linkId,
          source: nodeId,
          target: relation.target,
          type: relation.type,
          property: relation.property,
          isArray: relation.isArray,
          via: relation.via,
        });
        addedLinks = true;
      }
    }
  }

  return addedLinks;
}

/**
 * Add a specific relation to the graph
 */
export function addRelationToGraph(sourceId, relation) {
  const isNewNode = !state.displayedNodes.has(relation.target);

  if (isNewNode) {
    state.displayedNodes.add(relation.target);
  }

  const linkId = `${sourceId}-${relation.target}-${relation.property}`;
  const existingLink = state.displayedLinks.find((l) => l.id === linkId);

  if (!existingLink) {
    state.displayedLinks.push({
      id: linkId,
      source: sourceId,
      target: relation.target,
      type: relation.type,
      property: relation.property,
      isArray: relation.isArray,
      via: relation.via,
    });
  }

  if (isNewNode) {
    autoAddReverseLinks(relation.target);
  }

  updateGraph();
  if (state.onNodeSelect) state.onNodeSelect(relation.target);
}

/**
 * Add a reverse relation to the graph
 */
export function addReverseRelationToGraph(targetId, sourceId, property, type) {
  const sourceNode = state.nodes.get(sourceId);
  if (!sourceNode) return;

  const relation = sourceNode.relations.find(
    (r) => r.target === targetId && r.property === property && r.type === type,
  );

  if (!relation) return;

  if (!state.displayedNodes.has(sourceId)) {
    state.displayedNodes.add(sourceId);
  }

  const linkId = `${sourceId}-${targetId}-${property}`;
  const existingLink = state.displayedLinks.find((l) => l.id === linkId);

  if (!existingLink) {
    state.displayedLinks.push({
      id: linkId,
      source: sourceId,
      target: targetId,
      type: relation.type,
      property: relation.property,
      isArray: relation.isArray,
      via: relation.via,
    });
  }

  updateGraph();
  if (state.onNodeSelect) state.onNodeSelect(sourceId);
}

/**
 * Expand all immediate relations (forward and reverse) for a node
 */
export function expandAllNeighbors(nodeId) {
  let added = false;

  const node = state.nodes.get(nodeId);
  if (node?.relations) {
    for (const relation of node.relations) {
      if (state.nodes.has(relation.target)) {
        if (!state.displayedNodes.has(relation.target)) {
          state.displayedNodes.add(relation.target);
          added = true;
        }

        const linkId = `${nodeId}-${relation.target}-${relation.property}`;
        const existingLink = state.displayedLinks.find((l) => l.id === linkId);

        if (!existingLink) {
          state.displayedLinks.push({
            id: linkId,
            source: nodeId,
            target: relation.target,
            type: relation.type,
            property: relation.property,
            isArray: relation.isArray,
            via: relation.via,
          });
          added = true;
        }
      }
    }
  }

  const reverseRelations = getReverseRelations(nodeId);
  for (const reverse of reverseRelations) {
    if (!state.displayedNodes.has(reverse.source)) {
      state.displayedNodes.add(reverse.source);
      added = true;
    }

    const linkId = `${reverse.source}-${nodeId}-${reverse.property}`;
    const existingLink = state.displayedLinks.find((l) => l.id === linkId);

    if (!existingLink) {
      state.displayedLinks.push({
        id: linkId,
        source: reverse.source,
        target: nodeId,
        type: reverse.type,
        property: reverse.property,
        isArray: reverse.isArray,
        via: reverse.via,
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
export function updateGraph() {
  const container = document.getElementById('graph-container');
  if (!container) return;
  const width = container.clientWidth;
  const height = container.clientHeight;

  // Convert displayed nodes to array with positions
  const nodeData = Array.from(state.displayedNodes).map((id) => {
    const node = state.nodes.get(id);
    const existing = state.simulation?.nodes().find((n) => n.id === id);
    return {
      id: node.id,
      name: node.name,
      umsType: node.umsType,
      x: existing?.x || width / 2 + (Math.random() - 0.5) * 100,
      y: existing?.y || height / 2 + (Math.random() - 0.5) * 100,
      vx: existing?.vx || 0,
      vy: existing?.vy || 0,
    };
  });

  // Create link data with node references
  const linkData = state.displayedLinks.map((link) => ({
    ...link,
    source: nodeData.find((n) => n.id === (link.source.id || link.source)) || link.source,
    target: nodeData.find((n) => n.id === (link.target.id || link.target)) || link.target,
  }));

  // Update simulation
  if (!state.simulation) {
    const config = DENSITY_CONFIGS[state.density] || DENSITY_CONFIGS.normal;
    state.simulation = d3
      .forceSimulation()
      .force(
        'link',
        d3
          .forceLink()
          .id((d) => d.id)
          .distance(config.distance),
      )
      .force('charge', d3.forceManyBody().strength(config.strength))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(config.collision));
  } else {
    const config = DENSITY_CONFIGS[state.density] || DENSITY_CONFIGS.normal;
    state.simulation.force('link').distance(config.distance);
    state.simulation.force('charge').strength(config.strength);
    state.simulation.force('collision').radius(config.collision);
  }

  state.simulation.nodes(nodeData).force('link').links(linkData);

  // Draw links
  const links = state.linkLayer.selectAll('.link').data(linkData, (d) => d.id);

  links.exit().remove();

  const linksEnter = links
    .enter()
    .append('path')
    .attr('class', (d) => `link ${d.type}`)
    .attr('marker-end', (d) => `url(#arrow-${d.type})`)
    .on('click', (event, d) => {
      event.stopPropagation();
      if (state.onLinkSelect) state.onLinkSelect(d.id);
    });

  const allLinks = links.merge(linksEnter);
  allLinks.classed('selected', (d) => d.id === state.selectedLink);

  // Draw edge labels
  const edgeLabels = state.labelLayer
    .selectAll('.edge-label')
    .data(linkData, (d) => d.id);

  edgeLabels.exit().remove();

  const edgeLabelsEnter = edgeLabels
    .enter()
    .append('text')
    .attr('class', 'edge-label')
    .attr('dy', -5)
    .attr('text-anchor', 'middle')
    .text((d) => d.property);

  edgeLabelsEnter.classed('hidden', !state.showLabels);
  state.edgeLabels = edgeLabels.merge(edgeLabelsEnter);

  // Draw nodes
  const nodes = state.nodeLayer.selectAll('.node').data(nodeData, (d) => d.id);

  nodes.exit().remove();

  const nodesEnter = nodes
    .enter()
    .append('g')
    .attr('class', 'node')
    .call(
      d3
        .drag()
        .on('start', dragStarted)
        .on('drag', dragged)
        .on('end', dragEnded),
    )
    .on('click', (event, d) => {
      event.stopPropagation();
      if (state.selectedNode === d.id) {
        expandAllNeighbors(d.id);
      } else {
        if (state.onNodeSelect) state.onNodeSelect(d.id);
      }
    })
    .on('mouseenter', (_event, d) => {
      const connectedNodeIds = new Set();
      connectedNodeIds.add(d.id);
      state.linkLayer.selectAll('.link').each((l) => {
        if ((l.source.id || l.source) === d.id)
          connectedNodeIds.add(l.target.id || l.target);
        if ((l.target.id || l.target) === d.id)
          connectedNodeIds.add(l.source.id || l.source);
      });

      state.linkLayer
        .selectAll('.link')
        .classed(
          'highlighted',
          (l) =>
            (l.source.id || l.source) === d.id ||
            (l.target.id || l.target) === d.id,
        )
        .classed(
          'dimmed',
          (l) =>
            (l.source.id || l.source) !== d.id &&
            (l.target.id || l.target) !== d.id,
        );

      state.nodeLayer
        .selectAll('.node')
        .classed('dimmed', (n) => !connectedNodeIds.has(n.id));
    })
    .on('mouseleave', () => {
      state.linkLayer
        .selectAll('.link')
        .classed('highlighted', false)
        .classed('dimmed', false);
      state.nodeLayer.selectAll('.node').classed('dimmed', false);
    });

  nodesEnter
    .append('circle')
    .attr('r', (d) => (d.id === state.currentSchemaName ? 24 : 18))
    .attr('fill', (d) => TYPE_COLORS[d.umsType] || TYPE_COLORS.default)
    .attr('stroke', (d) => TYPE_COLORS[d.umsType] || TYPE_COLORS.default)
    .attr('stroke-opacity', 0.3);

  nodesEnter
    .append('text')
    .attr('dy', (d) => (d.id === state.currentSchemaName ? 40 : 34))
    .attr('text-anchor', 'middle')
    .text((d) => d.name);

  const allNodes = nodes.merge(nodesEnter);
  allNodes.classed('selected', (d) => d.id === state.selectedNode);

  state.simulation.on('tick', () => {
    allLinks.attr('d', (d) => {
      if ((d.source.id || d.source) === (d.target.id || d.target)) {
        const x = d.source.x;
        const y = d.source.y;
        const loopSize = 50;
        return `M ${x} ${y} C ${x + loopSize} ${y - loopSize * 1.5}, ${x + loopSize * 1.5} ${y + loopSize}, ${x} ${y}`;
      }
      return `M ${d.source.x} ${d.source.y} L ${d.target.x} ${d.target.y}`;
    });

    if (state.edgeLabels) {
      state.edgeLabels
        .attr('x', (d) => {
          if ((d.source.id || d.source) === (d.target.id || d.target)) return d.source.x + 55;
          return (d.source.x + d.target.x) / 2;
        })
        .attr('y', (d) => {
          if ((d.source.id || d.source) === (d.target.id || d.target)) return d.source.y - 5;
          return (d.source.y + d.target.y) / 2;
        });
    }

    allNodes.attr('transform', (d) => `translate(${d.x}, ${d.y})`);
  });

  state.simulation.alpha(0.3).restart();
}

/**
 * Zoom and pan the graph to fit all displayed nodes
 */
export function zoomToFit() {
  if (!state.g || state.displayedNodes.size === 0) return;

  const container = document.getElementById('graph-container');
  const width = container.clientWidth;
  const height = container.clientHeight;

  const bounds = state.g.node().getBBox();
  if (bounds.width === 0 || bounds.height === 0) return;

  const scale = 0.85 / Math.max(bounds.width / width, bounds.height / height);
  const cappedScale = Math.min(Math.max(scale, 0.2), 2);

  const midX = bounds.x + bounds.width / 2;
  const midY = bounds.y + bounds.height / 2;

  const transform = d3.zoomIdentity
    .translate(width / 2 - cappedScale * midX, height / 2 - cappedScale * midY)
    .scale(cappedScale);

  state.svg.transition().duration(750).call(state.zoom.transform, transform);
}

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
