/**
 * SCIIP_OS v5.5 — Decision Intelligence Execution Shared Helpers
 * Range: 7260–7350
 *
 * Production rules:
 * - Uses SCIIP_RUNTIME_PROCESSOR_BASE when available
 * - Runtime-base contract: { processor, action, execute }
 * - Event sourced
 * - Idempotent
 * - Duplicate safe
 * - Skip safe
 * - Transaction aware
 * - Permanent ledger preserving
 */
var SCIIP_DECISION_INTELLIGENCE_EXECUTION = SCIIP_DECISION_INTELLIGENCE_EXECUTION || {};

(function(ns) {
  ns.VERSION = 'v5.5-decision-intelligence-7350';

  ns.headers = function() {
    return [
      'Business_Key',
      'Processor_Number',
      'Processor_Name',
      'Decision_Intelligence_Layer',
      'Source_Sheet',
      'Target_Sheet',
      'Status',
      'Decision_Context_Count',
      'Scenario_Count',
      'Optimization_Score',
      'Capital_Decision_Score',
      'Acquisition_Decision_Score',
      'Disposition_Decision_Score',
      'Recommended_Decision',
      'Runtime_Payload_JSON',
      'Runtime_Result_JSON',
      'Transaction_ID',
      'Created_At'
    ];
  };

  ns.nowIso = function() {
    return new Date().toISOString();
  };

  ns.todayKey = function() {
    return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  };

  ns.getSpreadsheet = function() {
    if (typeof SCIIP_RUNTIME !== 'undefined' && SCIIP_RUNTIME && typeof SCIIP_RUNTIME.getSpreadsheet === 'function') {
      var runtimeSpreadsheet = SCIIP_RUNTIME.getSpreadsheet();
      if (runtimeSpreadsheet) return runtimeSpreadsheet;
    }

    if (typeof SCIIP !== 'undefined' && SCIIP && SCIIP.SPREADSHEET_ID) {
      return SpreadsheetApp.openById(SCIIP.SPREADSHEET_ID);
    }

    if (typeof SCIIP_CONFIG !== 'undefined' && SCIIP_CONFIG && SCIIP_CONFIG.SPREADSHEET_ID) {
      return SpreadsheetApp.openById(SCIIP_CONFIG.SPREADSHEET_ID);
    }

    var active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;

    throw new Error('No spreadsheet available for Decision Intelligence Execution. Configure SCIIP.SPREADSHEET_ID, SCIIP_CONFIG.SPREADSHEET_ID, or SCIIP_RUNTIME.getSpreadsheet().');
  };

  ns.ensureSheet = function(ss, sheetName, headers) {
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }

    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.setFrozenRows(1);
      return sheet;
    }

    var existing = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), headers.length)).getValues()[0];
    headers.forEach(function(header) {
      if (existing.indexOf(header) === -1) {
        sheet.getRange(1, sheet.getLastColumn() + 1).setValue(header);
      }
    });
    return sheet;
  };

  ns.readObjects = function(sheet) {
    if (!sheet || sheet.getLastRow() < 2) return [];
    var values = sheet.getDataRange().getValues();
    var headers = values.shift();
    return values.filter(function(row) {
      return row.join('').toString().trim() !== '';
    }).map(function(row) {
      var obj = {};
      headers.forEach(function(h, i) {
        obj[h] = row[i];
      });
      return obj;
    });
  };

  ns.hasBusinessKey = function(sheet, businessKey) {
    if (!sheet || sheet.getLastRow() < 2) return false;
    var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
    return values.some(function(row) {
      return String(row[0]) === String(businessKey);
    });
  };

  ns.businessKey = function(cfg) {
    return [
      cfg.processorNumber + '_' + String(cfg.processorName).toUpperCase(),
      'EXECUTE_' + String(cfg.processorName).toUpperCase(),
      ns.todayKey()
    ].join('|');
  };

  ns.transactionId = function(cfg) {
    return [
      'TXN',
      cfg.processorNumber + '_' + String(cfg.processorName).toUpperCase(),
      cfg.targetSheet,
      ns.todayKey(),
      Date.now()
    ].join('|');
  };

  ns.score = function(cfg, sourceRows) {
    var sourceCount = sourceRows ? sourceRows.length : 0;
    var base = cfg.processorNumber - 7200;
    return {
      decisionContextCount: Math.max(1, sourceCount),
      scenarioCount: Math.max(3, Math.min(12, sourceCount + 3)),
      optimizationScore: Math.min(100, 70 + Math.floor(base / 3)),
      capitalDecisionScore: Math.min(100, 66 + Math.floor(base / 4)),
      acquisitionDecisionScore: Math.min(100, 64 + Math.floor(base / 5)),
      dispositionDecisionScore: Math.min(100, 62 + Math.floor(base / 6))
    };
  };

  ns.appendRecord = function(sheet, headers, record) {
    var row = headers.map(function(header) {
      return record[header] !== undefined ? record[header] : '';
    });
    sheet.appendRow(row);
  };

  ns.execute = function(cfg) {
    var ss = ns.getSpreadsheet();
    var headers = ns.headers();
    var target = ns.ensureSheet(ss, cfg.targetSheet, headers);
    var source = ss.getSheetByName(cfg.sourceSheet);
    var sourceRows = ns.readObjects(source);
    var businessKey = ns.businessKey(cfg);
    var transactionId = ns.transactionId(cfg);

    if (ns.hasBusinessKey(target, businessKey)) {
      return ns.result(cfg, 'SUCCESS', businessKey, transactionId, 0, 0, 1, sourceRows, 'Duplicate business key skipped safely.');
    }

    if (cfg.requiresSource && sourceRows.length === 0) {
      return ns.result(cfg, 'SKIPPED_NO_INPUTS', businessKey, transactionId, 0, 1, 0, sourceRows, 'No source inputs available. Required predecessor should run first.');
    }

    var scores = ns.score(cfg, sourceRows);
    var recommendedDecision = cfg.recommendedDecision || (cfg.layer + ' accepted for decision review.');

    var payload = {
      processorNumber: cfg.processorNumber,
      processorName: cfg.processorName,
      decisionLayer: cfg.layer,
      sourceSheet: cfg.sourceSheet,
      targetSheet: cfg.targetSheet,
      sourceRecordCount: sourceRows.length,
      decisionContextCount: scores.decisionContextCount,
      scenarioCount: scores.scenarioCount,
      optimizationScore: scores.optimizationScore,
      capitalDecisionScore: scores.capitalDecisionScore,
      acquisitionDecisionScore: scores.acquisitionDecisionScore,
      dispositionDecisionScore: scores.dispositionDecisionScore,
      recommendedDecision: recommendedDecision,
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
      'Decision_Intelligence_Layer': cfg.layer,
      'Source_Sheet': cfg.sourceSheet,
      'Target_Sheet': cfg.targetSheet,
      'Status': 'SUCCESS',
      'Decision_Context_Count': scores.decisionContextCount,
      'Scenario_Count': scores.scenarioCount,
      'Optimization_Score': scores.optimizationScore,
      'Capital_Decision_Score': scores.capitalDecisionScore,
      'Acquisition_Decision_Score': scores.acquisitionDecisionScore,
      'Disposition_Decision_Score': scores.dispositionDecisionScore,
      'Recommended_Decision': recommendedDecision,
      'Runtime_Payload_JSON': JSON.stringify(payload),
      'Runtime_Result_JSON': JSON.stringify(runtimeResult),
      'Transaction_ID': transactionId,
      'Created_At': ns.nowIso()
    };

    ns.appendRecord(target, headers, record);
    return ns.result(cfg, 'SUCCESS', businessKey, transactionId, 1, 0, 0, sourceRows, cfg.successMessage);
  };

  ns.result = function(cfg, status, businessKey, transactionId, created, skippedNoInputs, skippedDuplicate, sourceRows, message) {
    var messageBody = {};
    messageBody[cfg.statusField] = status;
    messageBody.sourceSheet = cfg.sourceSheet;
    messageBody.targetSheet = cfg.targetSheet;
    messageBody.transactionId = transactionId;
    messageBody.nextAction = cfg.nextAction;
    messageBody.message = message;

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
      message: JSON.stringify(messageBody),
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
          subsystem: 'Decision Intelligence Execution',
          processorNumber: cfg.processorNumber,
          duplicateSafe: true,
          skipSafe: true,
          eventSourced: true,
          transactionAware: true
        },
        refs: {
          config: cfg
        },
        buildPayload: function(context, definition) {
          return {
            processor: processorId,
            action: actionId,
            businessKey: ns.businessKey(cfg),
            sourceSheet: cfg.sourceSheet,
            targetSheet: cfg.targetSheet,
            processorNumber: cfg.processorNumber,
            processorName: cfg.processorName,
            decisionLayer: cfg.layer,
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
})(SCIIP_DECISION_INTELLIGENCE_EXECUTION);
