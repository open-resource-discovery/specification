/**
 * ORD Schema Viewer - Main Application Entry Point
 * Orchestrates modules and handles high-level initialization.
 */

import { state } from './modules/state.js';
import { SCHEMAS, SCHEMA_BASE_URL } from './modules/config.js';
import {
  updateURL,
  escapeHtml,
  exportAsSVG,
  copyToClipboard,
} from './modules/utils.js';
import { parseSchema } from './modules/parser.js';
import {
  initializeGraph,
  updateGraph,
  zoomToFit,
  addRelationToGraph,
  addReverseRelationToGraph,
} from './modules/graph.js';
import {
  configureMarked,
  selectNode,
  selectLink,
  setupTooltips,
} from './modules/sidebar.js';

// URL state
const urlParams = new URLSearchParams(window.location.search);
let currentSchemaName = urlParams.get('schema') || 'Document';

if (!SCHEMAS[currentSchemaName]) {
  currentSchemaName = 'Document';
}

const initialDepth = parseInt(urlParams.get('depth'), 10) || 1;

/**
 * Global callback bundle for sidebar and graph interactions
 * This avoids circular dependencies between modules.
 */
state.onNodeSelect = (id) => selectNode(id);
state.onLinkSelect = (id) => selectLink(id);
state.currentSchemaName = currentSchemaName;

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
    const depth = parseInt(depthSlider?.value || 1, 10);

    const urlParams = new URLSearchParams(window.location.search);
    const nodeParam = urlParams.get('node');
    const linkParam = urlParams.get('link');

    initializeGraph(depth);

    if (nodeParam) {
      selectNode(nodeParam);
    } else if (linkParam) {
      // Re-initialize link selection logic
      const parts = linkParam.split('-');
      if (parts.length >= 3) {
        const sourceId = parts[0];
        const targetId = parts[1];
        const property = parts.slice(2).join('-');

        let changed = false;
        if (!state.displayedNodes.has(sourceId)) {
          state.displayedNodes.add(sourceId);
          changed = true;
        }
        if (!state.displayedNodes.has(targetId)) {
          state.displayedNodes.add(targetId);
          changed = true;
        }

        const existingLink = state.displayedLinks.find((l) => l.id === linkParam);
        if (!existingLink) {
          const sourceNode = state.nodes.get(sourceId);
          if (sourceNode) {
            const relation = sourceNode.relations.find(
              (r) => r.target === targetId && r.property === property,
            );
            if (relation) {
              state.displayedLinks.push({
                id: linkParam,
                source: sourceId,
                target: targetId,
                type: relation.type,
                property: relation.property,
                isArray: relation.isArray,
                via: relation.via,
              });
              changed = true;
            }
          }
        }

        if (changed) updateGraph();
        selectLink(linkParam);
      }
    } else {
      document.getElementById('sidebar').classList.add('collapsed');
      document.getElementById('sidebar-content').innerHTML =
        '<p class="empty-state">Click on a node in the graph to see its details</p>';
    }
  } catch (error) {
    console.error('Failed to load schema:', error);
    const msg = escapeHtml(error.message || 'Unknown error');
    document.getElementById('sidebar-content').innerHTML = `
            <div class="error-state" style="padding: 20px; color: #ff6b6b; background: rgba(255,107,107,0.1); border-radius: 8px;">
                <h4>Failed to load schema</h4>
                <p>${msg}</p>
                <p style="font-size: 11px; opacity: 0.7; margin-top: 10px;">URL: ${escapeHtml(url)}</p>
            </div>
        `;
  }
}

function handleInternalLink(targetRef) {
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
    if (!state.displayedNodes.has(nodeId)) {
      state.displayedNodes.add(nodeId);
      updateGraph();
    }
    selectNode(nodeId);
  }
}

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
      const newDepth = parseInt(depthSlider.value, 10);
      initializeGraph(newDepth);
      const newUrl = new URL(window.location);
      newUrl.searchParams.set('depth', newDepth);
      window.history.replaceState(null, '', newUrl);
    });
  }

  // Edge Labels Toggle
  const labelBtn = document.getElementById('toggle-labels-btn');
  if (labelBtn) {
    labelBtn.classList.toggle('active', state.showLabels);
    labelBtn.addEventListener('click', () => {
      state.showLabels = !state.showLabels;
      labelBtn.classList.toggle('active', state.showLabels);

      if (state.edgeLabels) {
        state.edgeLabels.classed('hidden', !state.showLabels);
      }
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
      const newUrl = new URL(window.location);
      newUrl.searchParams.set('density', state.density);
      window.history.replaceState(null, '', newUrl);
    });
  }

  // Export Button
  document.getElementById('export-btn')?.addEventListener('click', () => {
    exportAsSVG(currentSchemaName);
  });

  // Schema Selection
  const schemaSelect = document.getElementById('schema-select');
  if (schemaSelect) {
    schemaSelect.value = currentSchemaName;
    schemaSelect.addEventListener('change', (e) => {
      const newSchemaName = e.target.value;
      state.selectedNode = null;
      state.selectedLink = null;
      state.currentSchemaName = newSchemaName;
      loadSchema(newSchemaName);
      const newUrl = new URL(window.location);
      newUrl.searchParams.set('schema', newSchemaName);
      newUrl.searchParams.delete('node');
      newUrl.searchParams.delete('link');
      window.history.pushState({ schema: newSchemaName }, '', newUrl);
    });
  }

  window.addEventListener('popstate', (e) => {
    if (e.state?.schema) {
      schemaSelect.value = e.state.schema;
      loadSchema(e.state.schema);
    }
  });

  // Reset button
  document.getElementById('reset-btn').addEventListener('click', () => {
    const depthSlider = document.getElementById('depth-slider');
    const depthValue = document.getElementById('depth-value');

    // Reset depth to 1
    if (depthSlider) depthSlider.value = 1;
    if (depthValue) depthValue.textContent = 1;

    state.selectedNode = null;
    state.selectedLink = null;
    updateURL({ depth: 1 });

    initializeGraph(1, state.currentSchemaName);
    document.getElementById('sidebar-content').innerHTML =
      '<p class="empty-state">Click on a node in the graph to see its details</p>';
  });

  // Expand all button
  document.getElementById('expand-all-btn').addEventListener('click', () => {
    const depthSlider = document.getElementById('depth-slider');
    const depthValue = document.getElementById('depth-value');

    // Set depth to 5
    if (depthSlider) depthSlider.value = 5;
    if (depthValue) depthValue.textContent = 5;

    updateURL({ depth: 5 });
    initializeGraph(5);
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
  state.svg.on('click', (event) => {
    const target = event.target;
    const isSvgBackground =
      target.tagName === 'svg' ||
      (target.tagName === 'g' && target === state.g.node());
    if (!isSvgBackground) {
      return;
    }
    state.selectedNode = null;
    state.selectedLink = null;
    state.g.selectAll('.node').classed('selected', false);
    state.g.selectAll('.link').classed('selected', false);
    document.getElementById('sidebar').classList.add('collapsed');
    updateURL({});
  });

  window.addEventListener('resize', () => {
    if (state.simulation) {
      const container = document.getElementById('graph-container');
      state.simulation
        .force(
          'center',
          d3.forceCenter(container.clientWidth / 2, container.clientHeight / 2),
        )
        .alpha(0.3)
        .restart();
    }
  });

  // Sidebar link delegation
  document.getElementById('sidebar-content').addEventListener('click', (e) => {
    const link = e.target.closest('.internal-link');
    if (link) {
      e.preventDefault();
      handleInternalLink(link.dataset.target);
    }
  });
}

// Global functions for inline HTML (keeping compatibility)
window.copyNodeSchema = (nodeId) => {
  const node = state.nodes.get(nodeId);
  if (!node || !node.rawSchema) return;
  const schemaJson = JSON.stringify(node.rawSchema, null, 2);
  const button = event.target.closest('.copy-btn');
  copyToClipboard(schemaJson, button);
};

async function init() {
  try {
    configureMarked();

    state.svg = d3.select('#graph-svg');
    const defs = state.svg.append('defs');

    // Arrow markers
    defs
      .append('marker')
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

    defs
      .append('marker')
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
    state.linkLayer = state.g.append('g').attr('class', 'links-layer');
    state.labelLayer = state.g.append('g').attr('class', 'labels-layer');
    state.nodeLayer = state.g.append('g').attr('class', 'nodes-layer');

    state.zoom = d3
      .zoom()
      .scaleExtent([0.1, 8])
      .on('zoom', (event) => {
        state.g.attr('transform', event.transform);
      });

    state.svg.call(state.zoom);

    setupEventListeners();
    setupTooltips();

    await loadSchema(currentSchemaName);
  } catch (error) {
    console.error('Initialization error:', error);
  }
}

init();
