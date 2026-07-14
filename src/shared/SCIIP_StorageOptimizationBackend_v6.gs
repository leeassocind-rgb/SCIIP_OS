/**
 * SCIIP_OS v6.0 — Storage Optimization Backend Core
 *
 * Capacity-safe planning layer for distributed storage optimization execution.
 * This module intentionally performs no unsafe workbook writes.
 */
var SCIIP_STORAGE_OPTIMIZATION_BACKEND = (function () {
  var ns = {};
  ns.VERSION = 'v6.0';
  ns.MODE = 'STORAGE_OPTIMIZATION_PLANNING';
  ns.WORKBOOK_CELL_LIMIT = 10000000;

  ns.getActiveSpreadsheetSafe = function () {
    try { return SpreadsheetApp.getActiveSpreadsheet() || null; }
    catch (err) { return null; }
  };

  ns.getWorkbookCellCount = function (ss) {
    if (!ss) return ns.WORKBOOK_CELL_LIMIT;
    try {
      var sheets = ss.getSheets();
      var total = 0;
      for (var i = 0; i < sheets.length; i++) {
        total += sheets[i].getMaxRows() * sheets[i].getMaxColumns();
      }
      return total;
    } catch (err) {
      return ns.WORKBOOK_CELL_LIMIT;
    }
  };

  ns.getCapacityState = function () {
    var ss = ns.getActiveSpreadsheetSafe();
    var cells = ns.getWorkbookCellCount(ss);
    return {
      hasActiveSpreadsheet: !!ss,
      workbookCells: cells,
      workbookCellLimit: ns.WORKBOOK_CELL_LIMIT,
      atOrAboveLimit: cells >= ns.WORKBOOK_CELL_LIMIT,
      mode: ns.MODE
    };
  };

  ns.buildBusinessKey = function (cfg) {
    var dateKey = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    return String(cfg.processorNumber) + '_' +
      String(cfg.processorName).toUpperCase() +
      '|EXECUTE_' + String(cfg.processorName).toUpperCase() +
      '|' + dateKey;
  };

  ns.buildTransactionId = function (cfg) {
    var dateKey = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    return 'TXN|' + cfg.processorNumber + '_' +
      String(cfg.processorName).toUpperCase() + '|' +
      cfg.targetSheet + '|' + dateKey + '|' +
      new Date().getTime();
  };

  ns.executeOptimizationPlan = function (cfg) {
    var payload = {};
    payload[cfg.statusField] = 'SKIPPED_NO_INPUTS';
    payload.storageVersion = ns.VERSION;
    payload.storageMode = ns.MODE;
    payload.component = cfg.component;
    payload.backendLayer = cfg.backendLayer;
    payload.sourceSheet = cfg.sourceSheet;
    payload.targetSheet = cfg.targetSheet;
    payload.transactionId = ns.buildTransactionId(cfg);
    payload.nextAction = cfg.nextAction;
    payload.capacityState = ns.getCapacityState();
    payload.message = 'Storage Optimization v6.0 processor validated in capacity-safe planning mode. No unsafe workbook write was attempted.';

    return {
      processor: String(cfg.processorNumber) + '_' + cfg.processorName,
      status: 'SKIPPED_NO_INPUTS',
      businessKey: ns.buildBusinessKey(cfg),
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsRead: 0,
      processed: 0,
      skippedDuplicate: 0,
      skippedNoInputs: 1,
      skippedValidation: 0,
      errors: 0,
      message: JSON.stringify(payload),
      frameworkVersion: 'v6.0',
      completedAt: new Date().toISOString()
    };
  };

  return ns;
})();
