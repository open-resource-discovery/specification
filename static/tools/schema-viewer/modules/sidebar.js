/**
 * Sidebar Rendering and Interaction for the Schema Viewer
 */

import { state } from './state.js';
import { TYPE_COLORS, TYPE_LABELS } from './config.js';
import { escapeHtml, getDocUrl, updateURL } from './utils.js';
import { extractRefTarget } from './parser.js';
import { addRelationToGraph, addReverseRelationToGraph, getReverseRelations } from './graph.js';

/**
 * Configure tagged markdown renderer
 */
export function configureMarked() {
  const renderer = new marked.Renderer();

  renderer.link = (linkData, ...args) => {
    let href, title, text;
    if (typeof linkData === 'object' && linkData !== null && 'href' in linkData) {
      href = linkData.href || '';
      title = linkData.title || '';
      text = linkData.text || '';
    } else {
      href = linkData || '';
      title = args[0] || '';
      text = args[1] || '';
    }

    const escapedHref = escapeHtml(href);
    const escapedTitle = escapeHtml(title);
    const escapedText = escapeHtml(text);
    const titleAttr = title ? ` title="${escapedTitle}"` : '';

    if (href.startsWith('#')) {
      return `<a href="#" class="internal-link" data-target="${escapeHtml(href.substring(1))}"${titleAttr}>${escapedText}</a>`;
    }

    if (!href.startsWith('http') && !href.startsWith('https') && !href.startsWith('mailto:')) {
      let newHref = `../../spec-v1/interfaces/${href}`;
      newHref = newHref.replace(/\.md($|#)/, '$1');
      return `<a href="${escapeHtml(newHref)}"${titleAttr} target="_blank">${escapedText}</a>`;
    }

    return `<a href="${escapedHref}"${titleAttr} target="_blank" rel="noopener noreferrer">${escapedText}</a>`;
  };

  marked.use({ renderer });
}

/**
 * Select a node and show its details in the sidebar
 */
export function selectNode(nodeId) {
  state.selectedNode = nodeId;
  state.selectedLink = null;
  const node = state.nodes.get(nodeId);

  if (!node) return;

  updateURL({ node: nodeId });

  state.g.selectAll('.node').classed('selected', (d) => d.id === nodeId);
  state.g.selectAll('.link').classed('selected', false);

  const sidebar = document.getElementById('sidebar');
  const title = document.getElementById('sidebar-title');
  const content = document.getElementById('sidebar-content');

  sidebar.classList.remove('collapsed');
  title.textContent = node.name;

  content.innerHTML = renderNodeDetails(node);
  setupSidebarInteractions(node, content);
}

/**
 * Select a link and show its details in the sidebar
 */
export function selectLink(linkId) {
  state.selectedLink = linkId;
  state.selectedNode = null;

  const link = state.displayedLinks.find((l) => l.id === linkId);
  if (!link) return;

  state.g.selectAll('.node').classed('selected', false);
  state.g.selectAll('.link').classed('selected', (d) => d.id === linkId);

  updateURL({ link: linkId });

  const sidebar = document.getElementById('sidebar');
  const title = document.getElementById('sidebar-title');
  const content = document.getElementById('sidebar-content');

  sidebar.classList.remove('collapsed');
  title.textContent = `Relation: ${link.property}`;

  content.innerHTML = renderLinkDetails(link);

  content.querySelectorAll('.node-nav-link').forEach((item) => {
    item.addEventListener('click', () => {
      selectNode(item.dataset.node);
    });
  });

  setupTooltips();
}

function setupSidebarInteractions(node, content) {
  content.querySelectorAll('.relation-item:not(.reverse)').forEach((item) => {
    const targetId = item.dataset.target;
    const property = item.dataset.property;

    item.querySelector('.relation-name-clickable')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const link = state.displayedLinks.find(
        (l) =>
          (l.source.id === node.id || l.source === node.id) &&
          (l.target.id === targetId || l.target === targetId) &&
          l.property === property,
      );

      if (link) {
        selectLink(link.id);
      } else {
        const relation = node.relations.find((r) => r.target === targetId && r.property === property);
        if (relation) {
          addRelationToGraph(node.id, relation);
          setTimeout(() => {
            const newLink = state.displayedLinks.find(
              (l) =>
                (l.source.id === node.id || l.source === node.id) &&
                (l.target.id === targetId || l.target === targetId) &&
                l.property === property,
            );
            if (newLink) selectLink(newLink.id);
          }, 50);
        }
      }
    });

    item.querySelector('.relation-target-clickable')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const linkExists = state.displayedLinks.some(
        (l) =>
          (l.source.id === node.id || l.source === node.id) &&
          (l.target.id === targetId || l.target === targetId) &&
          l.property === property,
      );

      if (!linkExists) {
        const relation = node.relations.find((r) => r.target === targetId && r.property === property);
        if (relation) addRelationToGraph(node.id, relation);
      }
      selectNode(targetId);
    });
  });

  content.querySelectorAll('.relation-item.reverse').forEach((item) => {
    const sourceId = item.dataset.source;
    const property = item.dataset.property;
    const type = item.dataset.type;

    item.querySelector('.relation-name-clickable')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const link = state.displayedLinks.find(
        (l) =>
          (l.source.id === sourceId || l.source === sourceId) &&
          (l.target.id === node.id || l.target === node.id) &&
          l.property === property,
      );

      if (link) {
        selectLink(link.id);
      } else {
        addReverseRelationToGraph(node.id, sourceId, property, type);
        setTimeout(() => {
          const newLink = state.displayedLinks.find(
            (l) =>
              (l.source.id === sourceId || l.source === sourceId) &&
              (l.target.id === node.id || l.target === node.id) &&
              l.property === property,
          );
          if (newLink) selectLink(newLink.id);
        }, 50);
      }
    });

    item.querySelector('.relation-target-clickable')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const linkExists = state.displayedLinks.some(
        (l) =>
          (l.source.id === sourceId || l.source === sourceId) &&
          (l.target.id === node.id || l.target === node.id) &&
          l.property === property,
      );

      if (!linkExists) {
        addReverseRelationToGraph(node.id, sourceId, property, type);
      }
      selectNode(sourceId);
    });
  });

  content.querySelectorAll('.property-key-clickable').forEach((item) => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const property = item.dataset.property;
      const targetId = item.dataset.target;

      const link = state.displayedLinks.find(
        (l) =>
          (l.source.id === node.id || l.source === node.id) &&
          (l.target.id === targetId || l.target === targetId) &&
          l.property === property,
      );

      if (link) {
        selectLink(link.id);
      } else {
        const relation = node.relations.find((r) => r.target === targetId && r.property === property);
        if (relation) {
          addRelationToGraph(node.id, relation);
          setTimeout(() => {
            const newLink = state.displayedLinks.find(
              (l) =>
                (l.source.id === node.id || l.source === node.id) &&
                (l.target.id === targetId || l.target === targetId) &&
                l.property === property,
            );
            if (newLink) selectLink(newLink.id);
          }, 50);
        }
      }
    });
  });

  setupTooltips();
}

function renderNodeDetails(node) {
  let html = '';
  const docUrl = escapeHtml(getDocUrl(state.currentSchemaName, node.id));

  // Badge and Doc Link
  html += `
    <div class="section" style="display: flex; justify-content: space-between; align-items: center;">
      <span class="node-type-badge ${node.umsType}">${TYPE_LABELS[node.umsType] || node.umsType}</span>
      <a href="${docUrl}" target="_blank" class="doc-link" title="Open Interface Documentation" style="display: flex; align-items: center; gap: 4px; color: var(--color-accent); text-decoration: none; font-size: 12px;">
        <span>View Spec</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
      </a>
    </div>
  `;

  if (node.description) {
    html += `
      <div class="section">
        <h3 class="section-title">Description</h3>
        <div class="description markdown-body">${marked.parse(node.description)}</div>
      </div>
    `;
  }

  // Forward Relations
  if (node.relations.length > 0) {
    html += `
      <div class="section">
        <h3 class="section-title">→ Relates To (${node.relations.length})</h3>
        <ul class="relation-list">
    `;
    for (const relation of node.relations) {
      const targetNode = state.nodes.get(relation.target);
      const hasLink = state.displayedLinks.some(
        (l) =>
          (l.source === node.id || l.source.id === node.id) &&
          (l.target === relation.target || l.target.id === relation.target) &&
          l.property === relation.property,
      );
      const targetColor = targetNode ? TYPE_COLORS[targetNode.umsType] || TYPE_COLORS.default : TYPE_COLORS.default;
      const tooltipAttr = relation.description ? `data-tippy-content="${escapeHtml(relation.description)}"` : '';

      html += `
        <li class="relation-item ${hasLink ? 'in-graph' : ''}" data-target="${escapeHtml(relation.target)}" data-property="${escapeHtml(relation.property)}" data-type="${escapeHtml(relation.type)}" ${tooltipAttr}>
          <span class="relation-name relation-name-clickable" title="View Link Details" style="cursor: pointer">${escapeHtml(relation.property)}${relation.isArray ? '[]' : ''}</span>
          <span class="relation-type-name relation-target-clickable" title="Go to Node" style="cursor: pointer; display: flex; align-items: center;">
            <span class="relation-indicator" style="background-color: ${targetColor}; margin-right: 6px;"></span>
            <span style="color: var(--color-text-primary)">${escapeHtml(targetNode ? targetNode.name : relation.target)}</span>
          </span>
        </li>
      `;
    }
    html += `</ul></div>`;
  }

  // Search for Reverse Relations
  const reverseRelations = getReverseRelations(node.id);
  if (reverseRelations.length > 0) {
    html += `
      <div class="section">
        <h3 class="section-title">← Inverse Relations (${reverseRelations.length})</h3>
        <ul class="relation-list">
    `;
    for (const reverse of reverseRelations) {
      const hasLink = state.displayedLinks.some(
        (l) =>
          (l.source === reverse.source || l.source.id === reverse.source) &&
          (l.target === node.id || l.target.id === node.id) &&
          l.property === reverse.property,
      );
      const sourceNode = state.nodes.get(reverse.source);
      const sourceColor = sourceNode ? TYPE_COLORS[sourceNode.umsType] || TYPE_COLORS.default : TYPE_COLORS.default;
      const tooltipAttr = reverse.description ? `data-tippy-content="${escapeHtml(reverse.description)}"` : '';

      html += `
        <li class="relation-item reverse ${hasLink ? 'in-graph' : ''}" data-source="${escapeHtml(reverse.source)}" data-property="${escapeHtml(reverse.property)}" data-type="${escapeHtml(reverse.type)}" ${tooltipAttr}>
          <span class="relation-name relation-target-clickable" title="Go to Node" style="cursor: pointer; display: flex; align-items: center;">
            <span class="relation-indicator" style="background-color: ${sourceColor}; margin-right: 6px;"></span>
            ${escapeHtml(reverse.sourceName)}
          </span>
          <span class="relation-type-name relation-name-clickable" title="View Link Details" style="cursor: pointer">${escapeHtml(reverse.property)}${reverse.isArray ? '[]' : ''}</span>
        </li>
      `;
    }
    html += `</ul></div>`;
  }

  // Properties
  const propertyKeys = Object.keys(node.properties);
  if (propertyKeys.length > 0) {
    html += `<div class="section"><h3 class="section-title">Properties (${propertyKeys.length})</h3><div class="properties-table">`;
    for (const key of propertyKeys) {
      const prop = node.properties[key];
      const type = getPropertyType(prop);
      const isRequired = node.required.includes(key);

      let description = prop.description;
      if (!description && prop.$ref) {
        const refName = extractRefTarget(prop.$ref);
        const refNode = state.nodes.get(refName || '');
        if (refNode) description = refNode.description;
      }

      const relation = node.relations.find((r) => r.property === key);
      const hasRelation = !!relation;
      const tooltipAttr = description ? `data-tippy-content="${escapeHtml(description)}"` : '';

      let marker = '';
      if (isRequired) {
        marker = ' <span class="mandatory-marker" title="Mandatory">*</span>';
      } else if (node.recommended?.includes(key)) {
        marker = ' <span class="recommended-marker" title="Recommended">*</span>';
      }

      html += `
        <div class="property-row" ${tooltipAttr}>
          <div class="property-key ${hasRelation ? 'property-key-clickable' : ''}" ${hasRelation ? `data-property="${escapeHtml(key)}" data-target="${escapeHtml(relation.target)}"` : ''} style="${hasRelation ? 'cursor: pointer; text-decoration: underline; text-decoration-style: dotted;' : ''}" ${hasRelation ? 'title="Click to view link"' : ''}>${escapeHtml(key)}${marker}</div>
          <div class="property-value code">${escapeHtml(type)}</div>
        </div>
      `;
    }
    html += `</div></div>`;
  }

  // Extended Properties
  const xPropKeys = Object.keys(node.xProperties);
  if (xPropKeys.length > 0) {
    html += `<div class="section"><h3 class="section-title">Extended Properties</h3><div class="properties-table">`;
    for (const key of xPropKeys) {
      html += `
        <div class="property-row">
          <div class="property-key">${escapeHtml(key)}</div>
          <div class="property-value">${escapeHtml(JSON.stringify(node.xProperties[key]))}</div>
        </div>
      `;
    }
    html += `</div></div>`;
  }

  // Examples
  if (node.examples && node.examples.length > 0) {
    html += `<div class="section"><h3 class="section-title">Examples</h3>`;
    node.examples.forEach((example, index) => {
      const exampleJson = JSON.stringify(example, null, 2);
      html += `
        <div class="json-schema-section" style="margin-top: var(--space-sm);">
          <div class="collapsible-header" onclick="this.parentElement.classList.toggle('expanded')">
            <h4 style="margin: 0; font-size: 12px; cursor: pointer; user-select: none; color: var(--color-text-secondary);"><span class="collapse-icon">▶</span> Example ${node.examples.length > 1 ? index + 1 : ''}</h4>
            <button class="copy-btn" onclick="event.stopPropagation(); window.copyNearestCode(this);" title="Copy Example">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              <span class="copy-text">Copy</span>
            </button>
          </div>
          <div class="collapsible-content">
            <pre class="schema-code"><code>${escapeHtml(exampleJson)}</code></pre>
          </div>
        </div>
      `;
    });
    html += `</div>`;
  }

  // JSON Schema
  if (node.rawSchema) {
    const schemaJson = JSON.stringify(node.rawSchema, null, 2);
    html += `
      <div class="section json-schema-section">
        <div class="collapsible-header" onclick="this.parentElement.classList.toggle('expanded')">
          <h3 class="section-title" style="margin: 0; cursor: pointer; user-select: none;"><span class="collapse-icon">▶</span> JSON Schema</h3>
          <button class="copy-btn" onclick="event.stopPropagation(); window.copyNodeSchema('${escapeHtml(node.id)}');" title="Copy JSON Schema">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            <span class="copy-text">Copy</span>
          </button>
        </div>
        <div class="collapsible-content">
          <pre class="schema-code"><code>${escapeHtml(schemaJson)}</code></pre>
        </div>
      </div>
    `;
  }

  return html;
}

function renderLinkDetails(link) {
  const sourceNode = state.nodes.get(link.source.id || link.source);
  const targetNode = state.nodes.get(link.target.id || link.target);
  const docUrl = escapeHtml(getDocUrl(state.currentSchemaName, link.source.id || link.source, link.property));

  let html = `
    <div class="section" style="display: flex; justify-content: space-between; align-items: center;">
      <span class="node-type-badge ${link.type}">${escapeHtml(link.type).toUpperCase()}</span>
      <a href="${docUrl}" target="_blank" class="doc-link" title="Open Interface Documentation" style="display: flex; align-items: center; gap: 4px; color: var(--color-accent); text-decoration: none; font-size: 12px;">
        <span>View Spec</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
      </a>
    </div>
  `;

  let description = '';
  if (sourceNode) {
    const relation = sourceNode.relations.find((r) => r.property === link.property && r.target === (targetNode ? targetNode.id : (link.target.id || link.target)));
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

  const sourceColor = sourceNode ? TYPE_COLORS[sourceNode.umsType] || TYPE_COLORS.default : TYPE_COLORS.default;
  const targetColor = targetNode ? TYPE_COLORS[targetNode.umsType] || TYPE_COLORS.default : TYPE_COLORS.default;

  html += `
    <div class="section">
      <h3 class="section-title">Connections</h3>
      <ul class="relation-list">
        <li class="relation-item node-nav-link" data-node="${escapeHtml(sourceNode ? sourceNode.id : link.source)}" title="Go to Source Node">
          <span class="relation-indicator" style="background-color: ${sourceColor}"></span>
          <span class="relation-name" style="flex: 1; color: var(--color-text-primary); border-bottom: none;">${escapeHtml(sourceNode ? sourceNode.name : link.source)}</span>
          <span class="relation-type-name" style="flex: 0 0 auto; color: var(--color-text-secondary); font-size: 11px;">Source</span>
        </li>
        <li class="relation-item node-nav-link" data-node="${escapeHtml(targetNode ? targetNode.id : link.target)}" title="Go to Target Node">
          <span class="relation-indicator" style="background-color: ${targetColor}"></span>
          <span class="relation-name" style="flex: 1; color: var(--color-text-primary); border-bottom: none;">${escapeHtml(targetNode ? targetNode.name : link.target)}</span>
          <span class="relation-type-name" style="flex: 0 0 auto; color: var(--color-text-secondary); font-size: 11px;">Target</span>
        </li>
      </ul>
    </div>
  `;

  return html;
}

function getPropertyType(prop) {
  if (prop.$ref) return extractRefTarget(prop.$ref) || 'ref';
  if (prop.type === 'array' && prop.items) {
    if (prop.items.$ref) return `${extractRefTarget(prop.items.$ref) || 'ref'}[]`;
    return `${prop.items.type || 'any'}${prop.items.format ? ` (${prop.items.format})` : ''}[]`;
  }
  return prop.type ? `${prop.type}${prop.format ? ` (${prop.format})` : ''}` : (prop.anyOf || prop.oneOf ? 'union' : 'any');
}

export function setupTooltips() {
  if (!state.headerTooltipsInitialized) {
    tippy('[data-tooltip]', {
      content: (reference) => reference.getAttribute('data-tooltip'),
      theme: 'dark-custom',
      placement: 'right',
      animation: 'scale',
    });
    state.headerTooltipsInitialized = true;
  }

  destroySidebarTooltips();

  const instances = tippy('.property-row[data-tippy-content], .relation-item[data-tippy-content]', {
    content(reference) {
      const markdown = reference.getAttribute('data-tippy-content');
      return markdown ? marked.parse(markdown) : '';
    },
    allowHTML: true,
    theme: 'dark-custom',
    placement: 'left',
    maxWidth: 350,
    interactive: true,
    appendTo: document.body,
  });

  state.sidebarTooltips = Array.isArray(instances) ? instances : [instances];
}

function destroySidebarTooltips() {
  state.sidebarTooltips.forEach((instance) => instance.destroy());
  state.sidebarTooltips = [];
}
