/**
 * SCIIP_OS v5.5 — Enterprise Intelligence Execution Shared Helpers
 * Range: 7760–7850
 */
var SCIIP_ENTERPRISE_INTELLIGENCE_EXECUTION = SCIIP_ENTERPRISE_INTELLIGENCE_EXECUTION || {};
(function(ns) {
  ns.VERSION = 'v5.5-enterprise-intelligence-7850';
  ns.headers = function() {
    return ['Business_Key','Processor_Number','Processor_Name','Enterprise_Intelligence_Layer','Source_Sheet','Target_Sheet','Status','Enterprise_Context_Count','Knowledge_Sync_Score','Fusion_Score','Governance_Readiness_Score','Optimization_Score','Decision_Coordination_Score','Publishing_Readiness_Score','Enterprise_Action','Runtime_Payload_JSON','Runtime_Result_JSON','Transaction_ID','Created_At'];
  };
  ns.nowIso = function() { return new Date().toISOString(); };
  ns.todayKey = function() { return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'); };
  ns.getSpreadsheet = function() {
    if (typeof SCIIP_RUNTIME !== 'undefined' && SCIIP_RUNTIME && typeof SCIIP_RUNTIME.getSpreadsheet === 'function') {
      var runtimeSpreadsheet = SCIIP_RUNTIME.getSpreadsheet();
      if (runtimeSpreadsheet) return runtimeSpreadsheet;
    }
    if (typeof SCIIP !== 'undefined' && SCIIP && SCIIP.SPREADSHEET_ID) return SpreadsheetApp.openById(SCIIP.SPREADSHEET_ID);
    if (typeof SCIIP_CONFIG !== 'undefined' && SCIIP_CONFIG && SCIIP_CONFIG.SPREADSHEET_ID) return SpreadsheetApp.openById(SCIIP_CONFIG.SPREADSHEET_ID);
    var active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
    throw new Error('No spreadsheet available for Enterprise Intelligence Execution.');
  };
  ns.ensureSheet = function(ss, sheetName, headers) {
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) sheet = ss.insertSheet(sheetName);
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.setFrozenRows(1);
      return sheet;
    }
    var existing = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), headers.length)).getValues()[0];
    headers.forEach(function(header) {
      if (existing.indexOf(header) === -1) sheet.getRange(1, sheet.getLastColumn() + 1).setValue(header);
    });
    return sheet;
  };
  ns.readObjects = function(sheet) {
    if (!sheet || sheet.getLastRow() < 2) return [];
    var values = sheet.getDataRange().getValues();
    var headers = values.shift();
    return values.filter(function(row) { return row.join('').toString().trim() !== ''; }).map(function(row) {
      var obj = {};
      headers.forEach(function(h, i) { obj[h] = row[i]; });
      return obj;
    });
  };
  ns.hasBusinessKey = function(sheet, key) {
    if (!sheet || sheet.getLastRow() < 2) return false;
    return sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues().some(function(row) { return String(row[0]) === String(key); });
  };
  ns.businessKey = function(cfg) {
    return [cfg.processorNumber + '_' + String(cfg.processorName).toUpperCase(), 'EXECUTE_' + String(cfg.processorName).toUpperCase(), ns.todayKey()].join('|');
  };
  ns.transactionId = function(cfg) {
    return ['TXN', cfg.processorNumber + '_' + String(cfg.processorName).toUpperCase(), cfg.targetSheet, ns.todayKey(), Date.now()].join('|');
  };
  ns.score = function(cfg, sourceRows) {
    var sourceCount = sourceRows ? sourceRows.length : 0;
    var base = cfg.processorNumber - 7700;
    return {
      enterpriseContextCount: Math.max(1, sourceCount),
      knowledgeSyncScore: Math.min(100, 64 + Math.floor(base / 3)),
      fusionScore: Math.min(100, 66 + Math.floor(base / 4)),
      governanceReadinessScore: Math.min(100, 62 + Math.floor(base / 4)),
      optimizationScore: Math.min(100, 68 + Math.floor(base / 3)),
      decisionCoordinationScore: Math.min(100, 65 + Math.floor(base / 4)),
      publishingReadinessScore: Math.min(100, 63 + Math.floor(base / 5))
    };
  };
  ns.appendRecord = function(sheet, headers, record) {
    sheet.appendRow(headers.map(function(h) { return record[h] !== undefined ? record[h] : ''; }));
  };
  ns.execute = function(cfg) {
    var ss = ns.getSpreadsheet();
    var headers = ns.headers();
    var target = ns.ensureSheet(ss, cfg.targetSheet, headers);
    var sourceRows = ns.readObjects(ss.getSheetByName(cfg.sourceSheet));
    var key = ns.businessKey(cfg);
    var txn = ns.transactionId(cfg);
    if (ns.hasBusinessKey(target, key)) {
      return ns.result(cfg, 'SUCCESS', key, txn, 0, 0, 1, sourceRows, 'Duplicate business key skipped safely.');
    }
    var scores = ns.score(cfg, sourceRows);
    var action = cfg.layer + ' produced for enterprise intelligence review.';
    var payload = {
      processorNumber: cfg.processorNumber,
      processorName: cfg.processorName,
      enterpriseLayer: cfg.layer,
      sourceSheet: cfg.sourceSheet,
      targetSheet: cfg.targetSheet,
      sourceRecordCount: sourceRows.length,
      enterpriseContextCount: scores.enterpriseContextCount,
      knowledgeSyncScore: scores.knowledgeSyncScore,
      fusionScore: scores.fusionScore,
      governanceReadinessScore: scores.governanceReadinessScore,
      optimizationScore: scores.optimizationScore,
      decisionCoordinationScore: scores.decisionCoordinationScore,
      publishingReadinessScore: scores.publishingReadinessScore,
      enterpriseAction: action,
      generatedAt: ns.nowIso(),
      frameworkVersion: ns.VERSION
    };
    var rr = {
      status: 'SUCCESS',
      businessKey: key,
      targetSheet: cfg.targetSheet,
      recordsCreated: 1,
      recordsRead: sourceRows.length,
      transactionId: txn,
      nextAction: cfg.nextAction
    };
    ns.appendRecord(target, headers, {
      'Business_Key': key,
      'Processor_Number': cfg.processorNumber,
      'Processor_Name': cfg.processorName,
      'Enterprise_Intelligence_Layer': cfg.layer,
      'Source_Sheet': cfg.sourceSheet,
      'Target_Sheet': cfg.targetSheet,
      'Status': 'SUCCESS',
      'Enterprise_Context_Count': scores.enterpriseContextCount,
      'Knowledge_Sync_Score': scores.knowledgeSyncScore,
      'Fusion_Score': scores.fusionScore,
      'Governance_Readiness_Score': scores.governanceReadinessScore,
      'Optimization_Score': scores.optimizationScore,
      'Decision_Coordination_Score': scores.decisionCoordinationScore,
      'Publishing_Readiness_Score': scores.publishingReadinessScore,
      'Enterprise_Action': action,
      'Runtime_Payload_JSON': JSON.stringify(payload),
      'Runtime_Result_JSON': JSON.stringify(rr),
      'Transaction_ID': txn,
      'Created_At': ns.nowIso()
    });
    return ns.result(cfg, 'SUCCESS', key, txn, 1, 0, 0, sourceRows, cfg.successMessage);
  };
  ns.result = function(cfg, status, key, txn, created, skippedNoInputs, skippedDuplicate, sourceRows, message) {
    var body = {};
    body[cfg.statusField] = status;
    body.sourceSheet = cfg.sourceSheet;
    body.targetSheet = cfg.targetSheet;
    body.transactionId = txn;
    body.nextAction = cfg.nextAction;
    body.message = message;
    return {
      processor: cfg.processorNumber + '_' + cfg.processorName,
      status: status,
      businessKey: key,
      recordsCreated: created,
      recordsUpdated: 0,
      recordsRead: sourceRows ? sourceRows.length : 0,
      processed: created,
      skippedDuplicate: skippedDuplicate,
      skippedNoInputs: skippedNoInputs,
      skippedValidation: 0,
      errors: 0,
      message: JSON.stringify(body),
      frameworkVersion: ns.VERSION,
      completedAt: ns.nowIso()
    };
  };
  ns.runWithRuntimeBase = function(cfg) {
    var processorId = cfg.processorNumber + '_' + cfg.processorName;
    var actionId = 'EXECUTE_' + String(cfg.processorName).toUpperCase();
    if (typeof SCIIP_RUNTIME_PROCESSOR_BASE !== 'undefined' && SCIIP_RUNTIME_PROCESSOR_BASE.run) {
      return SCIIP_RUNTIME_PROCESSOR_BASE.run({
        processor: processorId,
        action: actionId,
        sourceSheet: cfg.sourceSheet || null,
        targetSheet: cfg.targetSheet || null,
        ledgerSheet: cfg.targetSheet || null,
        flags: {
          subsystem: 'Enterprise Intelligence Execution',
          processorNumber: cfg.processorNumber,
          duplicateSafe: true,
          skipSafe: true,
          eventSourced: true,
          transactionAware: true,
          enterpriseLayer: true
        },
        refs: { config: cfg },
        buildPayload: function(context, definition) {
          return {
            processor: processorId,
            action: actionId,
            businessKey: ns.businessKey(cfg),
            sourceSheet: cfg.sourceSheet,
            targetSheet: cfg.targetSheet,
            processorNumber: cfg.processorNumber,
            processorName: cfg.processorName,
            enterpriseLayer: cfg.layer,
            generatedAt: ns.nowIso(),
            frameworkVersion: ns.VERSION,
            refs: {
              context: context,
              definition: {
                processor: definition.processor,
                action: definition.action,
                sourceSheet: definition.sourceSheet,
                targetSheet: definition.targetSheet
              }
            }
          };
        },
        execute: function(payload, context, transaction, definition) {
          return ns.execute(cfg);
        }
      });
    }
    return ns.execute(cfg);
  };
})(SCIIP_ENTERPRISE_INTELLIGENCE_EXECUTION);
