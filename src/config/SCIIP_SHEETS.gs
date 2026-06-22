/* ==========================================================
   SCIIP_OS
   Module: Config
   File: SCIIP_SHEETS.gs

   Purpose:
   Centralized sheet registry.

   All sheet references should resolve through
   SCIIP.SHEETS.

========================================================== */

if (!SCIIP.SHEETS) {
  SCIIP.SHEETS = {};
}

Object.assign(SCIIP.SHEETS, {

  ASSET_REGISTRY:
    'ASSET_REGISTRY',

  PROPERTY_CANDIDATES:
    'PROPERTY_CANDIDATES',

  PROPERTY_ALIAS:
    'PROPERTY_ALIAS',

  PROPERTY_EVENTS:
    'PROPERTY_EVENTS',

  ASSET_TIMELINE:
    'ASSET_TIMELINE',

  WORK_QUEUE:
    'WORK_QUEUE',

  GRAPH_NODE:
    'GRAPH_NODE',

  GRAPH_EDGE:
    'GRAPH_EDGE',

  CAMPUS_REGISTRY:
    'CAMPUS_REGISTRY'
});