/* ==========================================================
   SCIIP_OS
   Module: Config
   File: SCIIP_VOCABULARY.gs

   Purpose:
   Centralized SCIIP vocabulary registry.

   Governs:

   • Node Types
   • Edge Types
   • Event Types
   • Command Types

   All vocabulary definitions should live here.

   Source of Truth:
   GitHub

   Runtime:
   Google Apps Script
========================================================== */

if (typeof SCIIP === 'undefined') {
  throw new Error(
    'SCIIP manifest must load before SCIIP_VOCABULARY.'
  );
}

SCIIP.VOCABULARY = {

/* ==========================================================
   NODE TYPES
========================================================== */

NODE_TYPES: {

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
},

/* ==========================================================
   EDGE TYPES
========================================================== */

EDGE_TYPES: {

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
},

/* ==========================================================
   EVENT TYPES
========================================================== */

EVENT_TYPES: {

  ASSET_CREATED:
    'ASSET_CREATED',

  ASSET_UPDATED:
    'ASSET_UPDATED',

  ASSET_MERGED:
    'ASSET_MERGED',

  CANDIDATE_CREATED:
    'CANDIDATE_CREATED',

  ALIAS_CREATED:
    'ALIAS_CREATED',

  GRAPH_NODE_CREATED:
    'GRAPH_NODE_CREATED',

  GRAPH_EDGE_CREATED:
    'GRAPH_EDGE_CREATED',

  PROPERTY_OBSERVED:
    'PROPERTY_OBSERVED'
},

/* ==========================================================
   COMMAND TYPES
========================================================== */

COMMAND_TYPES: {

  CREATE_ASSET:
    'CREATE_ASSET',

  UPDATE_ASSET:
    'UPDATE_ASSET',

  MERGE_ASSET:
    'MERGE_ASSET',

  CREATE_CANDIDATE:
    'CREATE_CANDIDATE',

  CREATE_ALIAS:
    'CREATE_ALIAS',

  CREATE_GRAPH_NODE:
    'CREATE_GRAPH_NODE',

  CREATE_GRAPH_EDGE:
    'CREATE_GRAPH_EDGE',

  RECORD_OBSERVATION:
    'RECORD_OBSERVATION'
}

};

/* ==========================================================
   HELPERS
========================================================== */

function sciipGetNodeTypes() {
  return SCIIP.VOCABULARY.NODE_TYPES;
}

function sciipGetEdgeTypes() {
  return SCIIP.VOCABULARY.EDGE_TYPES;
}

function sciipGetEventTypes() {
  return SCIIP.VOCABULARY.EVENT_TYPES;
}

function sciipGetCommandTypes() {
  return SCIIP.VOCABULARY.COMMAND_TYPES;
}

function sciipIsValidNodeType(nodeType) {
  return Object.values(
    SCIIP.VOCABULARY.NODE_TYPES
  ).includes(nodeType);
}

function sciipIsValidEdgeType(edgeType) {
  return Object.values(
    SCIIP.VOCABULARY.EDGE_TYPES
  ).includes(edgeType);
}

function sciipIsValidEventType(eventType) {
  return Object.values(
    SCIIP.VOCABULARY.EVENT_TYPES
  ).includes(eventType);
}

function sciipIsValidCommandType(commandType) {
  return Object.values(
    SCIIP.VOCABULARY.COMMAND_TYPES
  ).includes(commandType);
}

function sciipValidateNodeType(nodeType) {

  if (!sciipIsValidNodeType(nodeType)) {

    throw new Error(
      'Invalid Node Type: ' +
      nodeType
    );
  }
}

function sciipValidateEdgeType(edgeType) {

  if (!sciipIsValidEdgeType(edgeType)) {

    throw new Error(
      'Invalid Edge Type: ' +
      edgeType
    );
  }
}

function sciipValidateEventType(eventType) {

  if (!sciipIsValidEventType(eventType)) {

    throw new Error(
      'Invalid Event Type: ' +
      eventType
    );
  }
}

function sciipValidateCommandType(commandType) {

  if (!sciipIsValidCommandType(commandType)) {

    throw new Error(
      'Invalid Command Type: ' +
      commandType
    );
  }
}

function sciipVocabularyStats() {

  return {

    nodeTypes:
      Object.keys(
        SCIIP.VOCABULARY.NODE_TYPES
      ).length,

    edgeTypes:
      Object.keys(
        SCIIP.VOCABULARY.EDGE_TYPES
      ).length,

    eventTypes:
      Object.keys(
        SCIIP.VOCABULARY.EVENT_TYPES
      ).length,

    commandTypes:
      Object.keys(
        SCIIP.VOCABULARY.COMMAND_TYPES
      ).length,

    generatedAt:
      sciipNowIso()
  };
}