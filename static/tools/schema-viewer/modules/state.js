/**
 * Shared state for the Schema Viewer
 */

const urlParams = new URLSearchParams(window.location.search);
const showLabelsParam = urlParams.get('labels');
const initialDensity = urlParams.get('density') || 'normal';

export const state = {
  schema: null,
  nodes: new Map(),
  links: [],
  displayedNodes: new Set(),
  displayedLinks: [],
  selectedNode: null,
  selectedLink: null,
  simulation: null,
  svg: null,
  g: null,
  zoom: null,
  showLabels: showLabelsParam === null ? true : showLabelsParam === 'true',
  edgeLabels: null,
  linkLayer: null,
  labelLayer: null,
  nodeLayer: null,
  density: initialDensity,
  sidebarTooltips: [], // Track sidebar tooltip instances
  headerTooltipsInitialized: false,
  // Callbacks for module orchestration
  onNodeSelect: null,
  onLinkSelect: null,
  currentSchemaName: 'Document',
};
