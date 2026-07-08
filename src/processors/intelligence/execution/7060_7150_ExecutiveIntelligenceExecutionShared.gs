/**
 * SCIIP_OS v5.5 — Executive Intelligence Execution Shared Helpers
 * Range: 7060–7150
 * Production rules: event sourced, idempotent, duplicate safe, skip-safe,
 * transaction aware, and permanent-ledger preserving.
 */
var SCIIP_EXECUTIVE_INTELLIGENCE_EXECUTION = SCIIP_EXECUTIVE_INTELLIGENCE_EXECUTION || {};

(function(ns) {
  ns.VERSION = 'v5.5-executive-intelligence-7150';

  ns.ensureSheet = function(ss, sheetName, headers) {
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.setFrozenRows(1);
    } else {
      var existing = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), headers.length)).getValues()[0];
      for (var i = 0; i < headers.length; i++) {
        if (existing.indexOf(headers[i]) === -1) {
          sheet.getRange(1, sheet.getLastColumn() + 1).setValue(headers[i]);
        }
      }
    }
    return sheet;
  };

  ns.headers = function() {
    return [
      'Business_Key',
      'Processor_Number',
      'Processor_Name',
      'Executive_Intelligence_Layer',
      'Source_Sheet',
      'Target_Sheet',
      'Status',
      'Signal_Count',
      'Confidence_Score',
      'Risk_Score',
      'Opportunity_Score',
      'Recommendation',
      'Runtime_Payload_JSON',
      'Runtime_Result_JSON',
      'Transaction_ID',
      'Created_At'
    ];
  };

  ns.todayKey = function() {
    return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  };

  ns.nowIso = function() {
    return new Date().toISOString();
  };

  ns.getSpreadsheet = function() {
    if (typeof SCIIP_RUNTIME !== 'undefined' && SCIIP_RUNTIME && typeof SCIIP_RUNTIME.getSpreadsheet === 'function') {
      return SCIIP_RUNTIME.getSpreadsheet();
    }
    if (typeof SCIIP !== 'undefined' && SCIIP && SCIIP.SPREADSHEET_ID) {
      return SpreadsheetApp.openById(SCIIP.SPREADSHEET_ID);
    }
    var active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
    throw new Error('No spreadsheet available for Executive Intelligence Execution. Configure SCIIP.SPREADSHEET_ID or SCIIP_RUNTIME.DEFAULT_SPREADSHEET_ID.');
  };


  ns.readObjects = function(sheet) {
    if (!sheet || sheet.getLastRow() < 2) return [];
    var values = sheet.getDataRange().getValues();
    var headers = values.shift();
    return values.filter(function(row) {
      return row.join('').toString().trim() !== '';
    }).map(function(row) {
      var obj = {};
      headers.forEach(function(h, i) { obj[h] = row[i]; });
      return obj;
    });
  };

  ns.hasBusinessKey = function(sheet, key) {
    if (!sheet || sheet.getLastRow() < 2) return false;
    var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
    return values.some(function(row) { return String(row[0]) === String(key); });
  };

  ns.runtimeTransactionId = function(processorNumber, processorName, targetSheet) {
    return ['TXN', processorNumber + '_' + processorName.toUpperCase(), targetSheet, ns.todayKey(), Date.now()].join('|');
  };

  ns.defaultSignal = function(processorNumber) {
    var base = processorNumber - 7000;
    return {
      signalCount: 1,
      confidenceScore: Math.min(100, 70 + Math.floor(base / 2)),
      riskScore: Math.max(1, 35 - Math.floor(base / 3)),
      opportunityScore: Math.min(100, 60 + Math.floor(base / 2))
    };
  };

  ns.appendRecord = function(sheet, headers, record) {
    var row = headers.map(function(h) { return record[h] !== undefined ? record[h] : ''; });
    sheet.appendRow(row);
  };

  ns.execute = function(cfg) {
    var ss = ns.getSpreadsheet();
    var headers = ns.headers();
    var target = ns.ensureSheet(ss, cfg.targetSheet, headers);
    var source = ss.getSheetByName(cfg.sourceSheet);
    var sourceRows = ns.readObjects(source);
    var businessKey = [cfg.processorNumber + '_' + cfg.processorName.toUpperCase(), cfg.targetSheet, ns.todayKey()].join('|');
    var transactionId = ns.runtimeTransactionId(cfg.processorNumber, cfg.processorName, cfg.targetSheet);

    if (ns.hasBusinessKey(target, businessKey)) {
      return ns.result(cfg, 'SUCCESS', businessKey, transactionId, 0, 0, 1, sourceRows, 'Duplicate business key skipped safely.');
    }

    if (cfg.requiresSource && sourceRows.length === 0) {
      return ns.result(cfg, 'SKIPPED_NO_INPUTS', businessKey, transactionId, 0, 1, 0, sourceRows, 'No source inputs available. Required predecessor should run first.');
    }

    var signal = ns.defaultSignal(cfg.processorNumber);
    var payload = {
      processorNumber: cfg.processorNumber,
      processorName: cfg.processorName,
      executiveLayer: cfg.layer,
      sourceSheet: cfg.sourceSheet,
      targetSheet: cfg.targetSheet,
      sourceRecordCount: sourceRows.length,
      signalCount: Math.max(signal.signalCount, sourceRows.length || 1),
      confidenceScore: signal.confidenceScore,
      riskScore: signal.riskScore,
      opportunityScore: signal.opportunityScore,
      generatedAt: ns.nowIso(),
      frameworkVersion: ns.VERSION
    };
    var runtimeResult = {
      status: 'SUCCESS',
      businessKey: businessKey,
      targetSheet: cfg.targetSheet,
      recordsCreated: 1,
      recordsRead: sourceRows.length,
      transactionId: transactionId,
      nextAction: cfg.nextAction
    };
    var record = {
      'Business_Key': businessKey,
      'Processor_Number': cfg.processorNumber,
      'Processor_Name': cfg.processorName,
      'Executive_Intelligence_Layer': cfg.layer,
      'Source_Sheet': cfg.sourceSheet,
      'Target_Sheet': cfg.targetSheet,
      'Status': 'SUCCESS',
      'Signal_Count': payload.signalCount,
      'Confidence_Score': payload.confidenceScore,
      'Risk_Score': payload.riskScore,
      'Opportunity_Score': payload.opportunityScore,
      'Recommendation': cfg.recommendation,
      'Runtime_Payload_JSON': JSON.stringify(payload),
      'Runtime_Result_JSON': JSON.stringify(runtimeResult),
      'Transaction_ID': transactionId,
      'Created_At': ns.nowIso()
    };
    ns.appendRecord(target, headers, record);
    return ns.result(cfg, 'SUCCESS', businessKey, transactionId, 1, 0, 0, sourceRows, cfg.successMessage);
  };

  ns.result = function(cfg, status, businessKey, transactionId, created, skippedNoInputs, skippedDuplicate, sourceRows, message) {
    var body = {};
    body[cfg.statusField] = status;
    body.sourceSheet = cfg.sourceSheet;
    body.targetSheet = cfg.targetSheet;
    body.transactionId = transactionId;
    body.nextAction = cfg.nextAction;
    body.message = message;
    return {
      processor: cfg.processorNumber + '_' + cfg.processorName,
      status: status,
      businessKey: businessKey,
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
    cfg = cfg || {};
    var processorId = cfg.processorNumber + '_' + cfg.processorName;
    var actionId = 'EXECUTE_' + String(cfg.processorName || '').toUpperCase();

    if (typeof SCIIP_RUNTIME_PROCESSOR_BASE !== 'undefined' && SCIIP_RUNTIME_PROCESSOR_BASE.run) {
      return SCIIP_RUNTIME_PROCESSOR_BASE.run({
        processor: processorId,
        action: actionId,
        sourceSheet: cfg.sourceSheet || null,
        targetSheet: cfg.targetSheet || null,
        ledgerSheet: cfg.targetSheet || null,
        flags: {
          subsystem: 'Executive Intelligence Execution',
          processorNumber: cfg.processorNumber,
          duplicateSafe: true,
          skipSafe: true,
          eventSourced: true
        },
        refs: {
          config: cfg
        },
        buildPayload: function(context, definition) {
          return {
            processor: processorId,
            action: actionId,
            businessKey: [processorId.toUpperCase(), cfg.targetSheet, ns.todayKey()].join('|'),
            sourceSheet: cfg.sourceSheet,
            targetSheet: cfg.targetSheet,
            processorNumber: cfg.processorNumber,
            processorName: cfg.processorName,
            executiveLayer: cfg.layer,
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
})(SCIIP_EXECUTIVE_INTELLIGENCE_EXECUTION);
