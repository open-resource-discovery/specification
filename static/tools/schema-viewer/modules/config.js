/**
 * Configuration and Constants for the Schema Viewer
 */

export const SCHEMA_BASE_URL = '../../spec-v1/interfaces/';

export const SCHEMAS = {
  Document: 'Document.schema.json',
  Configuration: 'Configuration.schema.json',
};

// Simulation configs for different density levels
export const DENSITY_CONFIGS = {
  compact: { strength: -400, distance: 150, collision: 60 },
  normal: { strength: -800, distance: 200, collision: 80 },
  sparse: { strength: -1500, distance: 350, collision: 120 },
  airy: { strength: -2500, distance: 500, collision: 160 },
};

// Color mapping for x-ums-type
export const TYPE_COLORS = {
  root: '#58a6ff',
  subentity: '#1bc97e',
  external_ownership: '#f78166',
  ephemeral: '#6e7681',
  default: '#8b949e',
};

export const TYPE_LABELS = {
  root: 'Root Entity',
  subentity: 'Subentity',
  external_ownership: 'External Ownership',
  ephemeral: 'Ephemeral',
  default: 'Internal',
};

// Node radius and visual weight based on type
export const TYPE_SIZES = {
  root: 28,
  subentity: 18,
  external_ownership: 18,
  ephemeral: 25,
  default: 18,
};
