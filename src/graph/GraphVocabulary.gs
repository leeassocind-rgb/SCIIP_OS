/* ==========================================================
   SCIIP_OS
   Module: Graph
   File: GraphVocabulary.gs

   Purpose:
   Canonical SCIIP graph vocabulary.

   Governs:

   - Node Types
   - Edge Types
   - Relationship Definitions

   Source of Truth:
   GitHub

   Runtime:
   Google Apps Script
========================================================== */

/**
 * Canonical SCIIP node types.
 */
const SCIIP_NODE_TYPES = {

  ASSET: 'ASSET',

  PROPERTY: 'PROPERTY',

  ADDRESS: 'ADDRESS',

  PARCEL: 'PARCEL',

  CAMPUS: 'CAMPUS',

  CITY: 'CITY',

  ZIP: 'ZIP',

  OWNER: 'OWNER',

  TENANT: 'TENANT',

  BROKER: 'BROKER',

  LEASE: 'LEASE',

  SALE: 'SALE',

  LISTING: 'LISTING',

  EVENT: 'EVENT',

  TIMELINE: 'TIMELINE'
};

/**
 * Canonical SCIIP edge types.
 */
const SCIIP_EDGE_TYPES = {

  OWNS: 'OWNS',

  LEASES: 'LEASES',

  LISTED_BY: 'LISTED_BY',

  LOCATED_IN: 'LOCATED_IN',

  PART_OF: 'PART_OF',

  HAS_ADDRESS: 'HAS_ADDRESS',

  HAS_PARCEL: 'HAS_PARCEL',

  HAS_EVENT: 'HAS_EVENT',

  HAS_TIMELINE: 'HAS_TIMELINE',

  RELATED_TO: 'RELATED_TO'
};

/**
 * Returns all node types.
 *
 * @returns {Object}
 */
function sciipGetNodeTypes() {
  return SCIIP_NODE_TYPES;
}

/**
 * Returns all edge types.
 *
 * @returns {Object}
 */
function sciipGetEdgeTypes() {
  return SCIIP_EDGE_TYPES;
}

/**
 * Returns true if node type is valid.
 *
 * @param {string} nodeType
 * @returns {boolean}
 */
function sciipIsValidNodeType(nodeType) {
  return Object
    .values(SCIIP_NODE_TYPES)
    .indexOf(nodeType) >= 0;
}

/**
 * Returns true if edge type is valid.
 *
 * @param {string} edgeType
 * @returns {boolean}
 */
function sciipIsValidEdgeType(edgeType) {
  return Object
    .values(SCIIP_EDGE_TYPES)
    .indexOf(edgeType) >= 0;
}

/**
 * Validates node creation.
 *
 * @param {string} nodeType
 */
function sciipValidateNodeType(nodeType) {
  if (!sciipIsValidNodeType(nodeType)) {
    throw new Error(
      'Invalid node type: ' +
      nodeType
    );
  }
}

/**
 * Validates edge creation.
 *
 * @param {string} edgeType
 */
function sciipValidateEdgeType(edgeType) {
  if (!sciipIsValidEdgeType(edgeType)) {
    throw new Error(
      'Invalid edge type: ' +
      edgeType
    );
  }
}

/**
 * Returns vocabulary statistics.
 *
 * @returns {Object}
 */
function sciipVocabularyStats() {
  return {
    nodeTypes:
      Object.keys(
        SCIIP_NODE_TYPES
      ).length,

    edgeTypes:
      Object.keys(
        SCIIP_EDGE_TYPES
      ).length,

    generatedAt:
      sciipNowIso()
  };
}