/**
 * Schema Parsing Logic for the Schema Viewer
 */

import { formatName } from './utils.js';

/**
 * Parse the JSON Schema and extract all definitions
 */
export function parseSchema(schema, schemaName) {
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
    recommended: schema['x-recommended'] || [],
    relations: [],
    examples: schema.examples || (schema.example ? [schema.example] : []),
    xProperties: extractXProperties(schema),
    rawSchema: schema, // Store the original schema
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
      recommended: def['x-recommended'] || [],
      relations: [],
      examples: def.examples || (def.example ? [def.example] : []),
      xProperties: extractXProperties(def),
      rawSchema: def, // Store the original definition
    };
    nodes.set(name, node);
  }

  // Extract relationships from root
  extractRelations(rootNode, schema.properties || {}, nodes);

  // Extract relationships from each definition
  for (const [name, node] of nodes) {
    if (name !== rootId) {
      const def = definitions[name];
      if (def?.properties) {
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
 * Map x-ums-type to internal categories
 */
function mapUmsType(type, id, isRoot = false) {
  // For root nodes, respect the actual x-ums-type from the schema
  // If no type specified for root, default to 'root'
  if (isRoot && !type) return 'root';

  if (type === 'embedded' || type === 'custom') return 'subentity';
  if (type === 'ignore') {
    if (id?.startsWith('System')) return 'external_ownership';
    return 'ephemeral';
  }
  return type || 'root';
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
          description: propDef.description || '',
        });
      }
    }

    // Check for array items with $ref
    if (propDef.items?.$ref) {
      const target = extractRefTarget(propDef.items.$ref);
      if (target && allNodes.has(target)) {
        sourceNode.relations.push({
          type: 'composition',
          target: target,
          property: propName,
          isArray: true,
          description: propDef.description || '',
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
            description: propDef.description || '',
          });
        }
      }
    }

    // Check for array items with x-association-target
    if (propDef.items?.['x-association-target']) {
      for (const assocTarget of propDef.items['x-association-target']) {
        const target = extractAssociationTarget(assocTarget);
        if (target && allNodes.has(target)) {
          sourceNode.relations.push({
            type: 'association',
            target: target,
            property: propName,
            isArray: true,
            via: assocTarget,
            description:
              propDef.items?.description || propDef.description || '',
          });
        }
      }
    }
  }
}

/**
 * Extract definition name from a $ref path
 */
export function extractRefTarget(ref) {
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
