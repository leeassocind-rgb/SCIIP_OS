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
    if (services.DateService && typeof services.DateService.dateKey === 'function') return services.DateService.dateKey(now);
    return Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }

  ns.configure = function (injectedServices) {
    services = copy(injectedServices);
    if (typeof SCIIP_STORAGE_BACKEND !== 'undefined' && SCIIP_STORAGE_BACKEND.configure) SCIIP_STORAGE_BACKEND.configure(services);
    return ns;
  };

  ns.reset = function () {
    services = {};
    if (typeof SCIIP_STORAGE_BACKEND !== 'undefined' && SCIIP_STORAGE_BACKEND.reset) SCIIP_STORAGE_BACKEND.reset();
    return ns;
  };

  ns.getServices = function () { return copy(services); };

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
    if (services.StorageService && typeof services.StorageService.getActiveSpreadsheetSafe === 'function') return services.StorageService.getActiveSpreadsheetSafe();
    try { return SpreadsheetApp.getActiveSpreadsheet() || null; } catch (err) { return null; }
  };

  ns.getWorkbookCellCount = function (ss) {
    if (services.StorageService && typeof services.StorageService.getWorkbookCellCount === 'function') return services.StorageService.getWorkbookCellCount(ss);
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
    if (services.TransactionService && typeof services.TransactionService.buildBusinessKey === 'function') return services.TransactionService.buildBusinessKey(cfg, dateKey());
    return String(cfg.processorNumber) + '_' + String(cfg.processorName).toUpperCase() + '|EXECUTE_' + String(cfg.processorName).toUpperCase() + '|' + dateKey();
  };

  ns.buildTransactionId = function (cfg) {
    requireConfig(cfg);
    if (services.TransactionService && typeof services.TransactionService.buildTransactionId === 'function') return services.TransactionService.buildTransactionId(cfg, dateKey());
    return 'TXN|' + cfg.processorNumber + '_' + String(cfg.processorName).toUpperCase() + '|' + cfg.targetSheet + '|' + dateKey() + '|' + new Date().getTime();
  };

  ns.executeControlPlaneOnly = function (cfg) {
    requireConfig(cfg);
    if (services.StorageService && typeof services.StorageService.executeControlPlaneOnly === 'function') return services.StorageService.executeControlPlaneOnly(cfg, ns);
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
    if (services.LoggingService && typeof services.LoggingService.info === 'function') services.LoggingService.info('SCIIP_STORAGE_RUNTIME_EXECUTION', result);
    return result;
  };

  return ns;
})();
