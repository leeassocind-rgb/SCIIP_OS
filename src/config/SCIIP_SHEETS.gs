/* ==========================================================
   SCIIP_OS
   Module: Config
   File: SCIIP_SHEETS.gs

   Purpose:
   Centralized SCIIP sheet registry.

   ALL sheet references in SCIIP should
   resolve through this file.

   Source of Truth:
   GitHub

   Runtime:
   Google Apps Script
========================================================== */

if (typeof SCIIP === 'undefined') {
  throw new Error(
    'SCIIP manifest must load before SCIIP_SHEETS.'
  );
}

SCIIP.SHEETS = {

  /* =====================================================
     CORE IDENTITY
  ===================================================== */

  ASSET_REGISTRY:
    'ASSET_REGISTRY',

  PROPERTY_REGISTRY:
    'PROPERTY_REGISTRY',

  PROPERTY_CANDIDATES:
    'PROPERTY_CANDIDATES',

  PROPERTY_ALIAS:
    'PROPERTY_ALIAS',

  /* =====================================================
     EVENTS
  ===================================================== */

  PROPERTY_EVENTS:
    'PROPERTY_EVENTS',

  ASSET_TIMELINE:
    'ASSET_TIMELINE',

  COMMAND_LOG:
    'COMMAND_LOG',

  /* =====================================================
     KNOWLEDGE GRAPH
  ===================================================== */

  GRAPH_NODE:
    'GRAPH_NODE',

  GRAPH_EDGE:
    'GRAPH_EDGE',

  GRAPH_NODE_CANONICAL:
    'GRAPH_NODE_CANONICAL',

  GRAPH_EDGE_CANONICAL:
    'GRAPH_EDGE_CANONICAL',

  /* =====================================================
     WORK MANAGEMENT
  ===================================================== */

  WORK_QUEUE:
    'WORK_QUEUE',

  ASSET_TASKS:
    'ASSET_TASKS',

  /* =====================================================
     GIS
  ===================================================== */

  CAMPUS_REGISTRY:
    'CAMPUS_REGISTRY',

  PARCEL_REGISTRY:
    'PARCEL_REGISTRY',

  /* =====================================================
     DASHBOARD
  ===================================================== */

  ASSET_PROFILE:
    'ASSET_PROFILE',

  DASHBOARD_METRICS:
    'DASHBOARD_METRICS',

  /* =====================================================
     LEGACY MIGRATION
  ===================================================== */

  APPROVAL_QUEUE:
    'APPROVAL_QUEUE',

  DAILY_ACTIVITY_LOG:
    'DAILY_ACTIVITY_LOG',

  FILTERED_ACTIVITY:
    'FILTERED_ACTIVITY',

  DROPPED_SUPERSHEET_ROWS:
    'DROPPED_SUPERSHEET_ROWS'
};