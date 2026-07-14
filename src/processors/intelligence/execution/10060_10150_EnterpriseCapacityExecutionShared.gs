/**
 * SCIIP_OS v5.5 — 10060-10150 Enterprise Capacity Execution Shared Runtime
 * Capacity-safe + spreadsheet-context-safe SCIIP_RUNTIME_PROCESSOR_BASE adapter.
 */
var SCIIP_ENTERPRISE_CAPACITY_EXECUTION = (function () {
  var ns = {};
  ns.WORKBOOK_CELL_LIMIT = 10000000;
  ns.DEFAULT_ROWS = 1;
  ns.headers = ['Timestamp','Processor','ProcessorNumber','BusinessKey','Status','SourceSheet','TargetSheet','TransactionId','RecordsCreated','RecordsUpdated','Message','NextAction'];

  ns.getSpreadsheet = function () {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    return ss || null;
  };

  ns.getTotalWorkbookCells = function (ss) {
    if (!ss) return ns.WORKBOOK_CELL_LIMIT;
    var sheets = ss.getSheets();
    var total = 0;
    for (var i = 0; i < sheets.length; i++) total += sheets[i].getMaxRows() * sheets[i].getMaxColumns();
    return total;
  };

  ns.canAddCells = function (ss, additionalCells) {
    if (!ss) return false;
    return (ns.getTotalWorkbookCells(ss) + additionalCells) <= ns.WORKBOOK_CELL_LIMIT;
  };

  ns.ensureSheetCapacitySafe = function (ss, sheetName, minRows, minColumns) {
    if (!ss) {
      return { ok:false, sheet:null, reason:'NO_ACTIVE_SPREADSHEET', message:'No active spreadsheet context is available for target sheet ' + sheetName + '. No unsafe sheet operation was attempted.' };
    }

    minRows = minRows || ns.DEFAULT_ROWS;
    minColumns = minColumns || ns.headers.length;

    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      var cellsNeeded = minRows * minColumns;
      if (!ns.canAddCells(ss, cellsNeeded)) {
        return { ok:false, sheet:null, reason:'WORKBOOK_CAPACITY_LIMIT', message:'Workbook capacity limit prevents creation or expansion of target sheet ' + sheetName + '. No unsafe sheet operation was attempted.' };
      }
      sheet = ss.insertSheet(sheetName);
      if (sheet.getMaxRows() > minRows) sheet.deleteRows(minRows + 1, sheet.getMaxRows() - minRows);
      if (sheet.getMaxColumns() > minColumns) sheet.deleteColumns(minColumns + 1, sheet.getMaxColumns() - minColumns);
      if (sheet.getMaxRows() < minRows) sheet.insertRowsAfter(sheet.getMaxRows(), minRows - sheet.getMaxRows());
      if (sheet.getMaxColumns() < minColumns) sheet.insertColumnsAfter(sheet.getMaxColumns(), minColumns - sheet.getMaxColumns());
      sheet.getRange(1, 1, 1, ns.headers.length).setValues([ns.headers]);
      return { ok:true, sheet:sheet, reason:null, message:null };
    }

    var rowsToAdd = Math.max(0, minRows - sheet.getMaxRows());
    var colsToAdd = Math.max(0, minColumns - sheet.getMaxColumns());
    var additionalCells = (rowsToAdd * sheet.getMaxColumns()) + (colsToAdd * Math.max(sheet.getMaxRows(), minRows));

    if (additionalCells > 0 && !ns.canAddCells(ss, additionalCells)) {
      return { ok:false, sheet:sheet, reason:'WORKBOOK_CAPACITY_LIMIT', message:'Workbook capacity limit prevents creation or expansion of target sheet ' + sheetName + '. No unsafe sheet operation was attempted.' };
    }

    if (rowsToAdd > 0) sheet.insertRowsAfter(sheet.getMaxRows(), rowsToAdd);
    if (colsToAdd > 0) sheet.insertColumnsAfter(sheet.getMaxColumns(), colsToAdd);
    if (sheet.getLastRow() === 0 || sheet.getRange(1, 1).getValue() === '') sheet.getRange(1, 1, 1, ns.headers.length).setValues([ns.headers]);

    return { ok:true, sheet:sheet, reason:null, message:null };
  };

  ns.buildBusinessKey = function (cfg) {
    var dateKey = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    return String(cfg.processorNumber) + '_' + String(cfg.processorName).toUpperCase() + '|EXECUTE_' + String(cfg.processorName).toUpperCase() + '|' + dateKey;
  };

  ns.findDuplicate = function (sheet, businessKey) {
    if (!sheet || sheet.getLastRow() < 2) return false;
    var values = sheet.getRange(2, 4, sheet.getLastRow() - 1, 1).getValues();
    for (var i = 0; i < values.length; i++) if (values[i][0] === businessKey) return true;
    return false;
  };

  ns.standardResult = function (cfg, status, businessKey, message, recordsCreated, skippedDuplicate) {
    var payload = {};
    payload[cfg.statusField] = status;
    payload.sourceSheet = cfg.sourceSheet;
    payload.targetSheet = cfg.targetSheet;
    payload.transactionId = 'TXN|' + cfg.processorNumber + '_' + String(cfg.processorName).toUpperCase() + '|' + cfg.targetSheet + '|' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd') + '|' + new Date().getTime();
    payload.nextAction = cfg.nextAction;
    payload.message = message;
    return { processor:String(cfg.processorNumber) + '_' + cfg.processorName, status:status, businessKey:businessKey, recordsCreated:recordsCreated || 0, recordsUpdated:0, recordsRead:0, processed:0, skippedDuplicate:skippedDuplicate || 0, skippedNoInputs:status === 'SKIPPED_NO_INPUTS' ? 1 : 0, skippedValidation:0, errors:0, message:JSON.stringify(payload), frameworkVersion:'v5.2', completedAt:new Date().toISOString() };
  };

  ns.execute = function (cfg) {
    var ss = ns.getSpreadsheet();
    var businessKey = ns.buildBusinessKey(cfg);
    var capacity = ns.ensureSheetCapacitySafe(ss, cfg.targetSheet, ns.DEFAULT_ROWS, ns.headers.length);
    if (!capacity.ok) return ns.standardResult(cfg, 'SKIPPED_NO_INPUTS', businessKey, capacity.message, 0, 0);

    var sheet = capacity.sheet;
    if (ns.findDuplicate(sheet, businessKey)) {
      return { processor:String(cfg.processorNumber) + '_' + cfg.processorName, status:'SUCCESS', businessKey:businessKey, recordsCreated:0, recordsUpdated:0, recordsRead:0, processed:0, skippedDuplicate:1, skippedNoInputs:0, skippedValidation:0, errors:0, message:'Duplicate skipped by shared runtime framework.', frameworkVersion:'v5.2', completedAt:new Date().toISOString() };
    }

    var result = ns.standardResult(cfg, 'SUCCESS', businessKey, cfg.successMessage, 1, 0);
    var payload = JSON.parse(result.message);
    sheet.appendRow([new Date(), result.processor, cfg.processorNumber, businessKey, result.status, cfg.sourceSheet, cfg.targetSheet, payload.transactionId, result.recordsCreated, result.recordsUpdated, cfg.successMessage, cfg.nextAction]);
    return result;
  };

  ns.runWithRuntimeBase = function (cfg) {
    return SCIIP_RUNTIME_PROCESSOR_BASE.run({
      processor:String(cfg.processorNumber) + '_' + cfg.processorName,
      action:'EXECUTE_' + String(cfg.processorName).toUpperCase(),
      processorNumber:cfg.processorNumber,
      processorName:cfg.processorName,
      sourceSheet:cfg.sourceSheet,
      targetSheet:cfg.targetSheet,
      businessKey:ns.buildBusinessKey(cfg),
      execute:function () { return ns.execute(cfg); }
    });
  };

  return ns;
})();
