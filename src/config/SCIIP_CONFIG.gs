/* =========================================================
   SCIIP_OS v3.0 — CONFIG
   Southern California Industrial Intelligence Platform

   Centralized constants, runtime identifiers, sheet names,
   folder IDs, and migration-safe backward compatibility.

   Source of Truth: Git
   Runtime Target: Google Apps Script
========================================================= */

/**
 * SCIIP Manifest
 *
 * SCIIP is asset-driven, event-sourced, knowledge graph native,
 * GIS native, AI native, and processor driven.
 */
const SCIIP = {
  NAME: 'Southern California Industrial Intelligence Platform',
  SHORT_NAME: 'SCIIP_OS',
  VERSION: '3.0.0',
  SPREADSHEET_ID: '1x5lXkh0l63v92tYacGe7S8vHISHycBufaLfE54dPPDk'
  CORE_OBJECT: 'ASSET',
  ARCHITECTURE: 'Asset Driven | Event Sourced | Knowledge Graph',
  SOURCE_OF_TRUTH: 'Git',
  RUNTIME: 'Google Apps Script',
  REGION: 'Southern California',

  FOLDERS: {
    SUPERSHEET_BRIDGES: '1drsep3by0dvtw9nluQgFmsYWuKEimTGb',
    LEEPRO_BRIDGES: '1PN3pGmeoXxoKdTFB78t9jsZD5I66WsAW',
    SUPERSHEET_PDF_RAW: '1Rvkg_q9frw79FN9VscQNNzg8m2l4aHzN',
    SUPERSHEET_PDF_PROCESSED: '1p6LseXS3sgwgtrA4pEj5coh-P3jebem-'
  },

  SHEETS: {
    PROPERTY_REGISTRY: 'PROPERTY_REGISTRY',
    PROPERTY_ALIAS: 'PROPERTY_ALIAS',
    PROPERTY_CANDIDATES: 'PROPERTY_CANDIDATES',
    PROPERTY_EVENTS: 'PROPERTY_EVENTS',

    GRAPH_NODE: 'GRAPH_NODE',
    GRAPH_EDGE: 'GRAPH_EDGE',
    GRAPH_NODE_CANONICAL: 'GRAPH_NODE_CANONICAL',
    GRAPH_EDGE_CANONICAL: 'GRAPH_EDGE_CANONICAL',

    ASSET_PROFILE: 'ASSET_PROFILE',
    ASSET_TASKS: 'ASSET_TASKS',
    WORK_QUEUE: 'WORK_QUEUE',
    COMMAND_LOG: 'COMMAND_LOG',
    ASSET_TIMELINE: 'ASSET_TIMELINE',

    DAILY_ACTIVITY_LOG: 'DAILY_ACTIVITY_LOG',
    FILTERED_ACTIVITY: 'FILTERED_ACTIVITY',
    APPROVAL_QUEUE: 'APPROVAL_QUEUE',
    DROPPED_SUPERSHEET_ROWS: 'DROPPED_SUPERSHEET_ROWS',
    PROCESSED_BRIDGE_FILES: 'PROCESSED_BRIDGE_FILES',

    INVENTORY_REVIEW_QUEUE: 'INVENTORY_REVIEW_QUEUE',
    AVAILABILITY_CURRENT_LIVE: 'AVAILABILITY_CURRENT_LIVE',
    COMPS_HISTORY_LIVE: 'COMPS_HISTORY_LIVE',
    RATE_HISTORY: 'RATE_HISTORY',
    UPDATE_APPLY_LOG: 'UPDATE_APPLY_LOG',

    MARKET_ACTIVITY_DAILY: 'MARKET_ACTIVITY_DAILY',
    DAILY_IMPORT_SUMMARY: 'DAILY_IMPORT_SUMMARY',

    LEEPRO_REVIEW_QUEUE: 'LEEPRO_REVIEW_QUEUE',
    LEEPRO_IMPORT_LOG: 'LEEPRO_IMPORT_LOG',
    LEASE_COMPS_LIVE: 'LEASE_COMPS_LIVE',
    SALE_COMPS_LIVE: 'SALE_COMPS_LIVE',

    TENANT_INDEX: 'TENANT_INDEX',
    TENANT_ALIASES: 'TENANT_ALIASES',
    OWNER_INDEX: 'OWNER_INDEX',
    OWNER_ALIASES: 'OWNER_ALIASES',
    BROKER_INDEX: 'BROKER_INDEX',
    BROKER_ALIASES: 'BROKER_ALIASES',
    TRANSACTION_INDEX: 'TRANSACTION_INDEX'
  },

  PROCESSORS: {
    PROPERTY_CANDIDATE_PROCESSOR: '60_PropertyCandidateProcessor',
    ASSET_TIMELINE_ENGINE: '61_AssetTimelineEngine',
    PARCEL_ENGINE: '62_ParcelEngine',
    CAMPUS_ENGINE: '63_CampusEngine',
    ALIAS_PROCESSOR: '64_AliasProcessor',
    LAND_PROCESSOR: '65_LandProcessor',
    MANUAL_REVIEW_PROCESSOR: '66_ManualReviewProcessor',
    DASHBOARD_ENGINE: '67_DashboardEngine'
  }
};

/**
 * Migration-safe alias.
 *
 * Keep INDUSTRIAL_DB during v2 → v3 migration so existing
 * Apps Script files continue working while each module is
 * progressively refactored into SCIIP namespaces.
 */
const INDUSTRIAL_DB = SCIIP;

/**
 * Backward-compatible config references.
 * Preserve until all v2 imports and bridge processors are migrated.
 */
const CONFIG = {
  SUPERSHEET_BRIDGES_FOLDER_ID: SCIIP.FOLDERS.SUPERSHEET_BRIDGES
};

const LEEPRO_CONFIG = {
  LEEPRO_BRIDGES_FOLDER_ID: SCIIP.FOLDERS.LEEPRO_BRIDGES
};

/* =========================================================
   SUPERSHEET BRIDGE CONSTANTS
========================================================= */

/**
 * Expected tabs in Supersheet bridge imports.
 */
const SCIIP_EXPECTED_SUPERSHEET_TABS = [
  SCIIP.SHEETS.DAILY_ACTIVITY_LOG,
  SCIIP.SHEETS.FILTERED_ACTIVITY,
  SCIIP.SHEETS.APPROVAL_QUEUE,
  SCIIP.SHEETS.DROPPED_SUPERSHEET_ROWS
];

/**
 * Backward-compatible v2 constant.
 */
const EXPECTED_TABS = SCIIP_EXPECTED_SUPERSHEET_TABS;

/**
 * Processed bridge file log headers.
 */
const SCIIP_PROCESSED_BRIDGE_HEADERS = [
  'File_ID',
  'File_Name',
  'Processed_Timestamp',
  'Rows_Imported_Daily',
  'Rows_Imported_Filtered',
  'Rows_Imported_Approval',
  'Status',
  'Notes'
];

/**
 * Backward-compatible v2 constant.
 */
const PROCESSED_BRIDGE_HEADERS = SCIIP_PROCESSED_BRIDGE_HEADERS;
