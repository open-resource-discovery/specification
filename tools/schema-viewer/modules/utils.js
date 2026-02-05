/**
 * Utility functions for the Schema Viewer
 */

import { SCHEMA_BASE_URL } from './config.js';
import { state } from './state.js';

/**
 * Update URL parameters without reloading
 */
export function updateURL(params) {
  const newUrl = new URL(window.location);

  // If we specify a node, remove link and vice versa
  if (params.node) newUrl.searchParams.delete('link');
  if (params.link) newUrl.searchParams.delete('node');

  // If params is empty object, clear both
  if (Object.keys(params).length === 0) {
    newUrl.searchParams.delete('node');
    newUrl.searchParams.delete('link');
  }

  for (const [key, value] of Object.entries(params)) {
    if (value === null) {
      newUrl.searchParams.delete(key);
    } else {
      newUrl.searchParams.set(key, value);
    }
  }
  window.history.replaceState(null, '', newUrl);
}

/**
 * Format a name from camelCase/PascalCase to readable format
 */
export function formatName(name) {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

/**
 * Escape HTML to prevent XSS
 */
export function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  const div = document.createElement('div');
  div.textContent = String(text);
  return div.innerHTML;
}

/**
 * Convert text to URL-friendly slug
 */
export function toSlug(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start
    .replace(/-+$/, ''); // Trim - from end
}

/**
 * Generate a deep link to the original interface documentation
 */
export function getDocUrl(currentSchemaName, nodeId, property = null) {
  let url = `${SCHEMA_BASE_URL}${currentSchemaName}`; // Base URL
  const node = state.nodes.get(nodeId);

  let nodeSlug = '';
  try {
    if (nodeId === currentSchemaName) {
      const useTitle = state.schema?.title ? state.schema.title : nodeId;
      nodeSlug = toSlug(useTitle);
    } else {
      // Use definition title if available, otherwise format the ID
      const title = node?.rawSchema?.title || formatName(nodeId);
      nodeSlug = toSlug(title);
    }

    if (property) {
      // Anchors for properties are nodeSlug_propertyNameLower
      url += `#${nodeSlug}_${property.toLowerCase()}`;
    } else {
      url += `#${nodeSlug}`;
    }
  } catch (e) {
    console.warn('Error generating doc url:', e);
  }
  return url;
}

/**
 * Serialize the current SVG graph to a string, including necessary styles
 */
export function serializeSVG() {
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
        .node.dimmed { opacity: 0.2; }
        .link.dimmed { opacity: 0.2; }
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
export function triggerDownload(url, filename) {
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
export function exportAsSVG(currentSchemaName) {
  const svgData = serializeSVG();
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  const now = new Date();
  const timestamp = now
    .toISOString()
    .replace(/T/, '_')
    .replace(/:/g, '-')
    .slice(0, 16);

  triggerDownload(
    url,
    `${timestamp}_ord-schema-${currentSchemaName.toLowerCase()}.svg`,
  );
  URL.revokeObjectURL(url);
}

/**
 * Copy text to clipboard with feedback
 */
export function copyToClipboard(text, buttonEl) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      const textSpan = buttonEl.querySelector('.copy-text');
      const originalText = textSpan.textContent;
      textSpan.textContent = 'Copied!';
      buttonEl.classList.add('copied');

      setTimeout(() => {
        textSpan.textContent = originalText;
        buttonEl.classList.remove('copied');
      }, 2000);
    })
    .catch((err) => {
      console.error('Failed to copy:', err);
      const textSpan = buttonEl.querySelector('.copy-text');
      textSpan.textContent = 'Failed';
      setTimeout(() => {
        textSpan.textContent = 'Copy';
      }, 2000);
    });
}
