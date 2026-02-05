/**
 * Search functionality for the Schema Viewer
 */

import {
  addRelationToGraph,
  autoAddForwardLinks,
  autoAddReverseLinks,
  updateGraph,
} from './graph.js';
import { selectLink, selectNode } from './sidebar.js';
import { state } from './state.js';

/**
 * Initialize search event listeners
 */
export function setupSearch() {
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  const clearSearch = document.getElementById('clear-search');

  if (!searchInput || !searchResults || !clearSearch) return;

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();

    if (query.length < 2) {
      searchResults.style.display = 'none';
      clearSearch.style.display = 'none';
      return;
    }

    clearSearch.style.display = 'block';
    const results = performSearch(query);
    renderResults(results);
  });

  searchInput.addEventListener('focus', () => {
    const query = searchInput.value.trim().toLowerCase();
    if (query.length >= 2) {
      searchResults.style.display = 'block';
    }
  });

  clearSearch.addEventListener('click', () => {
    searchInput.value = '';
    searchResults.style.display = 'none';
    clearSearch.style.display = 'none';
    searchInput.focus();
  });

  // Keyboard navigation
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      searchResults.style.display = 'none';
      searchInput.blur();
    }
  });

  // Global Shortcut CTRL+K
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      searchInput.focus();
    }
  });

  // Close results when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.sidebar-search')) {
      searchResults.style.display = 'none';
    }
  });
}

/**
 * Perform search in nodes and properties
 */
function performSearch(query) {
  const results = [];

  // Search in nodes (entities)
  for (const [id, node] of state.nodes) {
    const nameMatch = node.name.toLowerCase().includes(query);
    const idMatch = id.toLowerCase().includes(query);

    if (nameMatch || idMatch) {
      results.push({
        type: 'entity',
        id: id,
        name: node.name,
        color: node.color || 'var(--color-root)',
        meta: id !== node.name ? id : (node.description || '')
      });
    }

    // Search in properties
    if (node.properties) {
      for (const [propName, propDef] of Object.entries(node.properties)) {
        if (propName.toLowerCase().includes(query)) {
          // Find if it's a relation
          const relation = node.relations.find(r => r.property === propName);

          results.push({
            type: relation ? 'relation' : 'property',
            id: `${id}-${propName}`,
            name: `${node.name}.${propName}`,
            nodeId: id,
            nodeName: node.name,
            relation: relation,
            meta: propDef.description || ''
          });
        }
      }
    }
  }

  // Sort results: Entity (1) > Relation (2) > Property (3)
  return results.sort((a, b) => {
    const typeWeight = { entity: 1, relation: 2, property: 3 };
    if (typeWeight[a.type] !== typeWeight[b.type]) {
      return typeWeight[a.type] - typeWeight[b.type];
    }

    const aLower = a.name.toLowerCase();
    const bLower = b.name.toLowerCase();

    // For properties/relations, only check the part after the dot for startsWith
    const aMatchPart = a.type === 'entity' ? aLower : aLower.split('.').pop();
    const bMatchPart = b.type === 'entity' ? bLower : bLower.split('.').pop();

    const aStartsWith = aMatchPart.startsWith(query);
    const bStartsWith = bMatchPart.startsWith(query);

    if (aStartsWith && !bStartsWith) return -1;
    if (!aStartsWith && bStartsWith) return 1;

    if (aLower.length !== bLower.length) {
      return aLower.length - bLower.length;
    }

    return aLower.localeCompare(bLower);
  }).slice(0, 50);
}

/**
 * Highlight matching text
 */
function highlightMatch(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

/**
 * Render search results list
 */
function renderResults(results) {
  const searchResults = document.getElementById('search-results');
  const query = document.getElementById('search-input').value.trim();

  if (results.length === 0) {
    searchResults.innerHTML = '<div class="search-result-item" style="cursor: default; background: transparent;"><div class="result-info"><div class="result-name">No results found</div></div></div>';
  } else {
    searchResults.innerHTML = results.map(result => `
      <div class="search-result-item" data-type="${result.type}" data-id="${result.id}" data-node-id="${result.nodeId || ''}">
        <div class="result-type-icon ${result.type}" style="${result.type === 'entity' ? `background: ${result.color}; box-shadow: 0 0 5px ${result.color};` : ''}"></div>
        <div class="result-info">
          <div class="result-name">${highlightMatch(result.name, query)}</div>
          <div class="result-meta">${result.meta}</div>
        </div>
        <div class="result-tag">${result.type}</div>
      </div>
    `).join('');

    searchResults.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', () => {
        const type = item.dataset.type;
        const id = item.dataset.id;
        const nodeId = item.dataset.nodeId;
        const selectedResult = results.find(r => r.id === id);

        handleResultSelection(type, id, nodeId, selectedResult);
        searchResults.style.display = 'none';
      });
    });
  }
  searchResults.style.display = 'block';
}

/**
 * Handle selection of a search result
 */
function handleResultSelection(type, id, nodeId, result) {
  if (type === 'entity') {
    if (!state.displayedNodes.has(id)) {
      state.displayedNodes.add(id);
      autoAddReverseLinks(id);
      autoAddForwardLinks(id);
      updateGraph();
    }
    selectNode(id);
  } else if (type === 'relation') {
    if (result.relation) {
      if (!state.displayedNodes.has(nodeId)) {
        state.displayedNodes.add(nodeId);
      }
      addRelationToGraph(nodeId, result.relation);
      updateGraph();

      const linkId = `${nodeId}-${result.relation.target}-${result.relation.property}`;
      // Use small timeout to ensure D3 has created the link element
      setTimeout(() => selectLink(linkId), 50);
    }
  } else if (type === 'property') {
    if (!state.displayedNodes.has(nodeId)) {
      state.displayedNodes.add(nodeId);
      updateGraph();
    }
    selectNode(nodeId);
    // The sidebar will open and show the properties
  }
}
