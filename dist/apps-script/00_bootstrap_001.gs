/** SCIIP_OS compiled bundle: 00_bootstrap_001.gs
 * sources: 7
 * generated: 2026-07-17T18:36:57.992Z
 */
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
  SPREADSHEET_ID: '1x5lXkh0l63v92tYacGe7S8vHISHycBufaLfE54dPPDk',
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

/**
 * SCIIP_OS v6.1
 * Canonical Runtime Namespace Bootstrap
 *
 * This is the single top-level owner of SCIIP_RUNTIME. Runtime modules extend
 * this object but must not redeclare or replace it.
 */
var SCIIP_RUNTIME = (typeof SCIIP_RUNTIME !== 'undefined' && SCIIP_RUNTIME)
  ? SCIIP_RUNTIME
  : {};

SCIIP_RUNTIME.NAMESPACE_VERSION = 'v6.1';
SCIIP_RUNTIME.NAMESPACE_OWNER = '000_SCIIP_RuntimeNamespace';


/**
 * SCIIP_OS v6.1 — Canonical Storage Runtime
 *
 * Compatibility-first execution facade for storage processors. All storage
 * access is routed through SCIIP_STORAGE_BACKEND when available.
 */
var SCIIP_STORAGE_RUNTIME = (function () {
  var ns = {};
  var services = {};

  ns.VERSION = 'v6.1';
  ns.MODE = 'CONTROL_PLANE_ONLY';
  ns.WORKBOOK_CELL_LIMIT = 10000000;

  function copy(source) {
    var target = {};
    source = source || {};
    Object.keys(source).forEach(function (key) { target[key] = source[key]; });
    return target;
  }

  function requireConfig(cfg) {
    var required = ['processorNumber', 'processorName', 'component', 'sourceSheet', 'targetSheet', 'statusField', 'nextAction'];
    if (!cfg || typeof cfg !== 'object') throw new Error('SCIIP_STORAGE_RUNTIME requires a configuration object.');
    required.forEach(function (key) {
      if (cfg[key] === undefined || cfg[key] === null || cfg[key] === '') throw new Error('SCIIP_STORAGE_RUNTIME missing required configuration: ' + key);
    });
    return cfg;
  }

  function dateKey() {
    var now = new Date();
    if (service('DateService') && typeof service('DateService').dateKey === 'function') return service('DateService').dateKey(now);
    return Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }

  ns.configure = function (injectedServices) {
    services = copy(injectedServices);
    if (typeof SCIIP_SERVICE_CONTAINER !== 'undefined') SCIIP_SERVICE_CONTAINER.configure(services);
    if (typeof SCIIP_STORAGE_BACKEND !== 'undefined' && SCIIP_STORAGE_BACKEND.configure) SCIIP_STORAGE_BACKEND.configure(ns.getServices());
    return ns;
  };

  ns.reset = function () {
    services = {};
    if (typeof SCIIP_SERVICE_CONTAINER !== 'undefined') SCIIP_SERVICE_CONTAINER.reset();
    if (typeof SCIIP_STORAGE_BACKEND !== 'undefined' && SCIIP_STORAGE_BACKEND.reset) SCIIP_STORAGE_BACKEND.reset();
    return ns;
  };

  ns.getServices = function () {
    var resolved = copy(services);
    if (typeof SCIIP_SERVICE_CONTAINER !== 'undefined') {
      SCIIP_SERVICE_CONTAINER.CORE_SERVICES.forEach(function (name) {
        if (!resolved[name]) resolved[name] = SCIIP_SERVICE_CONTAINER.resolve(name, true);
      });
    }
    return resolved;
  };

  function service(name) {
    if (services[name]) return services[name];
    if (typeof SCIIP_SERVICE_CONTAINER !== 'undefined') return SCIIP_SERVICE_CONTAINER.resolve(name, true);
    return null;
  }

  ns.getBackend = function () {
    if (typeof SCIIP_STORAGE_BACKEND === 'undefined') throw new Error('SCIIP_STORAGE_BACKEND is not initialized.');
    return SCIIP_STORAGE_BACKEND;
  };

  ns.useBackend = function (name) {
    ns.getBackend().use(name);
    return ns;
  };

  ns.executeStorage = function (request) {
    return ns.getBackend().execute(request);
  };

  ns.getActiveSpreadsheetSafe = function () {
    if (service('StorageService') && typeof service('StorageService').getActiveSpreadsheetSafe === 'function') return service('StorageService').getActiveSpreadsheetSafe();
    try { return SpreadsheetApp.getActiveSpreadsheet() || null; } catch (err) { return null; }
  };

  ns.getWorkbookCellCount = function (ss) {
    if (service('StorageService') && typeof service('StorageService').getWorkbookCellCount === 'function') return service('StorageService').getWorkbookCellCount(ss);
    if (!ss) return ns.WORKBOOK_CELL_LIMIT;
    try {
      var sheets = ss.getSheets();
      var total = 0;
      for (var i = 0; i < sheets.length; i++) total += sheets[i].getMaxRows() * sheets[i].getMaxColumns();
      return total;
    } catch (err) { return ns.WORKBOOK_CELL_LIMIT; }
  };

  ns.getCapacityState = function () {
    var ss = ns.getActiveSpreadsheetSafe();
    var cells = ns.getWorkbookCellCount(ss);
    return { hasActiveSpreadsheet: !!ss, workbookCells: cells, workbookCellLimit: ns.WORKBOOK_CELL_LIMIT, atOrAboveLimit: cells >= ns.WORKBOOK_CELL_LIMIT, mode: ns.MODE };
  };

  ns.buildBusinessKey = function (cfg) {
    requireConfig(cfg);
    if (service('TransactionService') && typeof service('TransactionService').buildBusinessKey === 'function') return service('TransactionService').buildBusinessKey(cfg, dateKey());
    return String(cfg.processorNumber) + '_' + String(cfg.processorName).toUpperCase() + '|EXECUTE_' + String(cfg.processorName).toUpperCase() + '|' + dateKey();
  };

  ns.buildTransactionId = function (cfg) {
    requireConfig(cfg);
    if (service('TransactionService') && typeof service('TransactionService').buildTransactionId === 'function') return service('TransactionService').buildTransactionId(cfg, dateKey());
    return 'TXN|' + cfg.processorNumber + '_' + String(cfg.processorName).toUpperCase() + '|' + cfg.targetSheet + '|' + dateKey() + '|' + new Date().getTime();
  };

  ns.executeControlPlaneOnly = function (cfg) {
    requireConfig(cfg);
    if (service('StorageService') && typeof service('StorageService').executeControlPlaneOnly === 'function') return service('StorageService').executeControlPlaneOnly(cfg, ns);
    var backendHealth = null;
    try { backendHealth = ns.getBackend().healthCheck(); } catch (err) { backendHealth = { ok: false, status: 'BACKEND_UNAVAILABLE', detail: err.message }; }
    var payload = {};
    payload[cfg.statusField] = 'SKIPPED_NO_INPUTS';
    payload.storageVersion = ns.VERSION;
    payload.storageMode = ns.MODE;
    payload.storageBackend = (typeof SCIIP_STORAGE_BACKEND !== 'undefined') ? SCIIP_STORAGE_BACKEND.getActiveName() : 'UNAVAILABLE';
    payload.backendHealth = backendHealth;
    payload.component = cfg.component;
    payload.sourceSheet = cfg.sourceSheet;
    payload.targetSheet = cfg.targetSheet;
    payload.transactionId = ns.buildTransactionId(cfg);
    payload.nextAction = cfg.nextAction;
    payload.capacityState = ns.getCapacityState();
    payload.message = 'SCIIP Storage Runtime v6.1 control-plane processor validated. No unsafe workbook write was attempted.';
    var result = { processor: String(cfg.processorNumber) + '_' + cfg.processorName, status: 'SKIPPED_NO_INPUTS', businessKey: ns.buildBusinessKey(cfg), recordsCreated: 0, recordsUpdated: 0, recordsRead: 0, processed: 0, skippedDuplicate: 0, skippedNoInputs: 1, skippedValidation: 0, errors: 0, message: JSON.stringify(payload), frameworkVersion: ns.VERSION, completedAt: new Date().toISOString() };
    if (service('LoggingService') && typeof service('LoggingService').info === 'function') service('LoggingService').info('SCIIP_STORAGE_RUNTIME_EXECUTION', result);
    return result;
  };

  return ns;
})();


/**
 * SCIIP_OS v6.1 — Permanent Storage Backend Abstraction
 *
 * One contract for Google Sheets, BigQuery, Cloud SQL, Firestore, and local
 * runtime storage. External backends fail closed until their clients are
 * explicitly injected.
 */
var SCIIP_STORAGE_BACKEND = (function () {
  var ns = {};
  var registry = {};
  var activeBackend = 'GOOGLE_SHEETS';
  var injected = {};

  ns.VERSION = 'v6.1';
  ns.CONTRACT_VERSION = '1.0';
  ns.OPERATIONS = ['healthCheck', 'read', 'query', 'write', 'append', 'upsert', 'remove', 'transaction'];

  function copy(source) {
    var target = {};
    source = source || {};
    Object.keys(source).forEach(function (key) { target[key] = source[key]; });
    return target;
  }

  function normalizeName(name) {
    return String(name || '').trim().toUpperCase();
  }

  function ensureRequest(request) {
    if (!request || typeof request !== 'object') throw new Error('SCIIP_STORAGE_BACKEND requires a request object.');
    if (!request.operation) throw new Error('SCIIP_STORAGE_BACKEND request missing operation.');
    return request;
  }

  function unsupported(name, operation, detail) {
    return {
      ok: false,
      status: 'BACKEND_UNAVAILABLE',
      backend: name,
      operation: operation,
      recordsRead: 0,
      recordsWritten: 0,
      detail: detail || 'Backend client is not configured.',
      version: ns.VERSION
    };
  }

  function requireAdapter(adapter) {
    if (!adapter || typeof adapter !== 'object') throw new Error('Storage adapter must be an object.');
    if (!adapter.name) throw new Error('Storage adapter missing name.');
    if (typeof adapter.execute !== 'function') throw new Error('Storage adapter missing execute(request, context).');
    return adapter;
  }

  ns.configure = function (services) {
    injected = copy(services);
    if (typeof SCIIP_SERVICE_CONTAINER !== 'undefined') SCIIP_SERVICE_CONTAINER.configure(injected);
    return ns;
  };

  function getInjectedServices() {
    var resolved = copy(injected);
    if (typeof SCIIP_SERVICE_CONTAINER !== 'undefined') {
      SCIIP_SERVICE_CONTAINER.CORE_SERVICES.forEach(function (name) {
        if (!resolved[name]) resolved[name] = SCIIP_SERVICE_CONTAINER.resolve(name, true);
      });
    }
    return resolved;
  }

  ns.reset = function () {
    injected = {};
    activeBackend = 'GOOGLE_SHEETS';
    return ns;
  };

  ns.register = function (adapter) {
    requireAdapter(adapter);
    registry[normalizeName(adapter.name)] = adapter;
    return ns;
  };

  ns.has = function (name) {
    return !!registry[normalizeName(name)];
  };

  ns.get = function (name) {
    var key = normalizeName(name || activeBackend);
    if (!registry[key]) throw new Error('Unknown storage backend: ' + key);
    return registry[key];
  };

  ns.use = function (name) {
    var key = normalizeName(name);
    ns.get(key);
    activeBackend = key;
    return ns;
  };

  ns.getActiveName = function () {
    return activeBackend;
  };

  ns.list = function () {
    return Object.keys(registry).sort().map(function (key) {
      var adapter = registry[key];
      return {
        name: key,
        mode: adapter.mode || 'UNKNOWN',
        persistent: adapter.persistent !== false,
        configured: typeof adapter.isConfigured === 'function' ? !!adapter.isConfigured(getInjectedServices()) : true,
        capabilities: (adapter.capabilities || []).slice()
      };
    });
  };

  ns.execute = function (request) {
    ensureRequest(request);
    var backendName = normalizeName(request.backend || activeBackend);
    var adapter = ns.get(backendName);
    var context = {
      version: ns.VERSION,
      contractVersion: ns.CONTRACT_VERSION,
      services: getInjectedServices(),
      backend: backendName
    };
    if (typeof adapter.isConfigured === 'function' && !adapter.isConfigured(context.services)) {
      return unsupported(backendName, request.operation, 'Backend exists but its client has not been injected.');
    }
    var result = adapter.execute(request, context);
    if (!result || typeof result !== 'object') throw new Error('Storage adapter returned an invalid result: ' + backendName);
    result.backend = result.backend || backendName;
    result.operation = result.operation || request.operation;
    result.version = result.version || ns.VERSION;
    return result;
  };

  ns.healthCheck = function (backend) {
    return ns.execute({ backend: backend, operation: 'healthCheck' });
  };

  function googleSheetsAdapter() {
    return {
      name: 'GOOGLE_SHEETS',
      mode: 'PERSISTENT',
      persistent: true,
      capabilities: ['healthCheck', 'read', 'query', 'write', 'append', 'upsert', 'remove', 'transaction'],
      isConfigured: function (services) {
        return !!(services.GoogleSheetsClient || (typeof SpreadsheetApp !== 'undefined'));
      },
      execute: function (request, context) {
        var client = context.services.GoogleSheetsClient;
        if (client && typeof client.execute === 'function') return client.execute(request, context);
        if (request.operation === 'healthCheck') {
          var active = null;
          try { active = SpreadsheetApp.getActiveSpreadsheet() || null; } catch (err) { active = null; }
          return { ok: true, status: 'AVAILABLE', hasActiveSpreadsheet: !!active, recordsRead: 0, recordsWritten: 0 };
        }
        return unsupported('GOOGLE_SHEETS', request.operation, 'A GoogleSheetsClient must be injected for data operations.');
      }
    };
  }

  function delegatedAdapter(name, serviceName, capabilities) {
    return {
      name: name,
      mode: 'PERSISTENT',
      persistent: true,
      capabilities: capabilities,
      isConfigured: function (services) {
        return !!(services[serviceName] && typeof services[serviceName].execute === 'function');
      },
      execute: function (request, context) {
        return context.services[serviceName].execute(request, context);
      }
    };
  }

  function localAdapter() {
    var buckets = {};
    function bucket(name) {
      name = String(name || 'default');
      if (!buckets[name]) buckets[name] = [];
      return buckets[name];
    }
    return {
      name: 'LOCAL_RUNTIME',
      mode: 'EPHEMERAL',
      persistent: false,
      capabilities: ['healthCheck', 'read', 'query', 'write', 'append', 'upsert', 'remove', 'transaction'],
      isConfigured: function () { return true; },
      execute: function (request) {
        var rows = bucket(request.collection);
        var op = request.operation;
        if (op === 'healthCheck') return { ok: true, status: 'AVAILABLE', recordsRead: 0, recordsWritten: 0 };
        if (op === 'read' || op === 'query') return { ok: true, status: 'SUCCESS', data: rows.slice(), recordsRead: rows.length, recordsWritten: 0 };
        if (op === 'write') { buckets[String(request.collection || 'default')] = (request.data || []).slice(); return { ok: true, status: 'SUCCESS', recordsRead: 0, recordsWritten: (request.data || []).length }; }
        if (op === 'append') { var values = request.data || []; Array.prototype.push.apply(rows, values); return { ok: true, status: 'SUCCESS', recordsRead: 0, recordsWritten: values.length }; }
        if (op === 'remove') { var removed = rows.length; buckets[String(request.collection || 'default')] = []; return { ok: true, status: 'SUCCESS', recordsRead: 0, recordsWritten: removed }; }
        if (op === 'transaction') {
          var operations = request.operations || [];
          var results = [];
          for (var i = 0; i < operations.length; i++) results.push(ns.execute(copyTransactionRequest(operations[i])));
          return { ok: true, status: 'SUCCESS', results: results, recordsRead: 0, recordsWritten: 0 };
        }
        return unsupported('LOCAL_RUNTIME', op, 'Operation is not implemented by the local adapter.');
      }
    };
  }

  function copyTransactionRequest(operation) {
    var request = copy(operation);
    request.backend = 'LOCAL_RUNTIME';
    return request;
  }

  ns.register(googleSheetsAdapter());
  ns.register(delegatedAdapter('BIGQUERY', 'BigQueryClient', ['healthCheck', 'read', 'query', 'write', 'append', 'upsert', 'remove', 'transaction']));
  ns.register(delegatedAdapter('CLOUD_SQL', 'CloudSqlClient', ['healthCheck', 'read', 'query', 'write', 'append', 'upsert', 'remove', 'transaction']));
  ns.register(delegatedAdapter('FIRESTORE', 'FirestoreClient', ['healthCheck', 'read', 'query', 'write', 'append', 'upsert', 'remove', 'transaction']));
  ns.register(localAdapter());

  return ns;
})();


/**
 * SCIIP_OS v6.1 — Dependency Injection Service Container
 *
 * Canonical owner for application services. New code resolves dependencies
 * through this container. Legacy globals remain reachable only through lazy
 * default adapters, preserving backward compatibility during modernization.
 */
var SCIIP_SERVICE_CONTAINER = (function () {
  'use strict';

  var ns = {};
  var registrations = {};
  var instances = {};
  var overrides = {};

  ns.VERSION = 'v6.1';
  ns.CONTRACT_VERSION = '1.0';
  ns.CORE_SERVICES = [
    'StorageService', 'GraphService', 'IdentityService', 'GISService',
    'LoggingService', 'TransactionService', 'DateService'
  ];

  function normalizeName(name) {
    var value = String(name || '').trim();
    if (!value) throw new Error('SCIIP_SERVICE_CONTAINER requires a service name.');
    return value;
  }

  function copy(source) {
    var target = {};
    source = source || {};
    Object.keys(source).forEach(function (key) { target[key] = source[key]; });
    return target;
  }

  function validateService(name, service) {
    if (!service || (typeof service !== 'object' && typeof service !== 'function')) {
      throw new Error('Invalid service implementation: ' + name);
    }
    return service;
  }

  ns.register = function (name, provider, options) {
    name = normalizeName(name);
    options = options || {};
    if (typeof provider !== 'function' && (!provider || typeof provider !== 'object')) {
      throw new Error('Service provider must be a factory function or object: ' + name);
    }
    registrations[name] = {
      provider: provider,
      singleton: options.singleton !== false,
      source: options.source || 'APPLICATION',
      contract: options.contract || null
    };
    delete instances[name];
    return ns;
  };

  ns.unregister = function (name) {
    name = normalizeName(name);
    delete registrations[name];
    delete instances[name];
    delete overrides[name];
    return ns;
  };

  ns.override = function (name, service) {
    name = normalizeName(name);
    overrides[name] = validateService(name, service);
    return ns;
  };

  ns.clearOverride = function (name) {
    delete overrides[normalizeName(name)];
    return ns;
  };

  ns.has = function (name) {
    name = normalizeName(name);
    return !!overrides[name] || !!registrations[name];
  };

  ns.resolve = function (name, optional) {
    name = normalizeName(name);
    if (overrides[name]) return overrides[name];
    var registration = registrations[name];
    if (!registration) {
      if (optional === true) return null;
      throw new Error('Service is not registered: ' + name);
    }
    if (registration.singleton && instances[name]) return instances[name];
    var service = typeof registration.provider === 'function'
      ? registration.provider(ns)
      : registration.provider;
    validateService(name, service);
    if (registration.singleton) instances[name] = service;
    return service;
  };

  ns.resolveAll = function (names) {
    var result = {};
    (names || ns.CORE_SERVICES).forEach(function (name) {
      result[name] = ns.resolve(name);
    });
    return result;
  };

  ns.configure = function (services) {
    services = services || {};
    Object.keys(services).forEach(function (name) { ns.override(name, services[name]); });
    return ns;
  };

  ns.reset = function () {
    overrides = {};
    instances = {};
    return ns;
  };

  ns.withOverrides = function (services, callback) {
    if (typeof callback !== 'function') throw new Error('withOverrides requires a callback.');
    var prior = copy(overrides);
    ns.configure(services || {});
    try { return callback(ns); }
    finally { overrides = prior; }
  };

  ns.snapshot = function () {
    return Object.keys(registrations).sort().map(function (name) {
      var registration = registrations[name];
      return {
        name: name,
        registered: true,
        overridden: !!overrides[name],
        instantiated: !!instances[name],
        singleton: registration.singleton,
        source: registration.source,
        contract: registration.contract
      };
    });
  };

  // Lazy compatibility adapters. References are evaluated only when methods run.
  ns.register('StorageService', function () {
    return {
      getBackend: function () { return SCIIP_STORAGE_BACKEND; },
      execute: function (request) { return SCIIP_STORAGE_BACKEND.execute(request); },
      healthCheck: function (backend) { return SCIIP_STORAGE_BACKEND.healthCheck(backend); },
      getActiveSpreadsheetSafe: function () {
        try { return SpreadsheetApp.getActiveSpreadsheet() || null; } catch (err) { return null; }
      },
      getWorkbookCellCount: function (ss) {
        if (!ss) return 10000000;
        try {
          var sheets = ss.getSheets();
          var total = 0;
          for (var i = 0; i < sheets.length; i++) total += sheets[i].getMaxRows() * sheets[i].getMaxColumns();
          return total;
        } catch (err) { return 10000000; }
      }
    };
  }, { source: 'COMPATIBILITY_ADAPTER', contract: 'StorageService@1.0' });

  ns.register('GraphService', function () {
    return {
      createNode: function (node) { return sciipGraphCreateNode(node); },
      createEdge: function (edge) { return sciipGraphCreateEdge(edge); },
      getNodeSheet: function () { return sciipGetGraphNodeSheet(); }
    };
  }, { source: 'COMPATIBILITY_ADAPTER', contract: 'GraphService@1.0' });

  ns.register('IdentityService', function () {
    return {
      createCanonicalIdentity: function (input) { return sciipCreateCanonicalIdentity(input); },
      resolveCandidate: function (candidate) {
        if (typeof sciipResolveIdentityCandidate === 'function') return sciipResolveIdentityCandidate(candidate);
        return sciipCreateCanonicalIdentity(candidate);
      }
    };
  }, { source: 'COMPATIBILITY_ADAPTER', contract: 'IdentityService@1.0' });

  ns.register('GISService', function () {
    return {
      createCampus: function (campus) { return sciipCreateCampus(campus); },
      getCampusSheet: function () { return sciipGetCampusSheet(); },
      bindCoordinates: function (input) {
        if (typeof sciipBindCoordinates === 'function') return sciipBindCoordinates(input);
        return input;
      }
    };
  }, { source: 'COMPATIBILITY_ADAPTER', contract: 'GISService@1.0' });

  ns.register('LoggingService', function () {
    return {
      write: function (config) { return SCIIP_RUNTIME_LOGGING.write(config); },
      info: function (event, payload) {
        return SCIIP_RUNTIME_LOGGING.info({ action: event, message: event, payload: payload || {} });
      },
      warn: function (event, payload) {
        return SCIIP_RUNTIME_LOGGING.warn({ action: event, message: event, payload: payload || {} });
      },
      error: function (event, payload) {
        return SCIIP_RUNTIME_LOGGING.error({ action: event, message: event, payload: payload || {} });
      }
    };
  }, { source: 'COMPATIBILITY_ADAPTER', contract: 'LoggingService@1.0' });

  ns.register('TransactionService', function () {
    return {
      run: function (context, payload, callback) { return SCIIP_RUNTIME_TRANSACTION_MANAGER.run(context, payload, callback); },
      buildBusinessKey: function (cfg, dateKey) {
        return String(cfg.processorNumber) + '_' + String(cfg.processorName).toUpperCase() +
          '|EXECUTE_' + String(cfg.processorName).toUpperCase() + '|' + dateKey;
      },
      buildTransactionId: function (cfg, dateKey) {
        return 'TXN|' + cfg.processorNumber + '_' + String(cfg.processorName).toUpperCase() +
          '|' + cfg.targetSheet + '|' + dateKey + '|' + new Date().getTime();
      }
    };
  }, { source: 'COMPATIBILITY_ADAPTER', contract: 'TransactionService@1.0' });

  ns.register('DateService', function () {
    return {
      now: function () { return new Date(); },
      nowIso: function () { return new Date().toISOString(); },
      dateKey: function (dateValue) {
        var date = dateValue || new Date();
        if (typeof sciipDateKey === 'function') return sciipDateKey(date);
        return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
      }
    };
  }, { source: 'COMPATIBILITY_ADAPTER', contract: 'DateService@1.0' });

  return ns;
})();

// Concise canonical alias for application composition roots.
var SCIIP_SERVICES = SCIIP_SERVICE_CONTAINER;
