/**
 * SCIIP_OS v5.5 — Enterprise Cognitive Execution Shared Helpers
 * Range: 7960–8050
 */
var SCIIP_ENTERPRISE_COGNITIVE_EXECUTION = SCIIP_ENTERPRISE_COGNITIVE_EXECUTION || {};
(function(ns) {
  ns.VERSION = 'v5.5-enterprise-cognitive-8050-capacity-contract-fix';
  ns.SUBSYSTEM = 'Enterprise Cognitive Execution';

  ns.headers = function() {
    return [
      'Business_Key','Processor_Number','Processor_Name','Enterprise_Cognitive_Layer',
      'Source_Sheet','Target_Sheet','Status','Cognitive_Context_Count',
      'Cognitive_Coordination_Score','Knowledge_Synthesis_Score','Context_Orchestration_Score',
      'Predictive_Cognition_Score','Decision_Reasoning_Score','Learning_Feedback_Score',
      'Cognitive_Action','Runtime_Payload_JSON','Runtime_Result_JSON','Transaction_ID','Created_At'
    ];
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
    throw new Error('No spreadsheet available for Enterprise Cognitive Execution.');
  };

  ns.getWorkbookCellCount = function(ss) {
    return ss.getSheets().reduce(function(total, sheet) {
      return total + (sheet.getMaxRows() * sheet.getMaxColumns());
    }, 0);
  };

  ns.canAddCells = function(ss, cellsToAdd) {
    return ns.getWorkbookCellCount(ss) + cellsToAdd <= 10000000;
  };

  ns.ensureSheet = function(ss, sheetName, headers) {
    var sheet = ss.getSheetByName(sheetName);
    if (sheet) {
      if (sheet.getLastRow() === 0) {
        if (sheet.getMaxColumns() < headers.length) {
          var colsNeeded = headers.length - sheet.getMaxColumns();
          var addedCells = colsNeeded * sheet.getMaxRows();
          if (!ns.canAddCells(ss, addedCells)) return null;
          sheet.insertColumnsAfter(sheet.getMaxColumns(), colsNeeded);
        }
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        sheet.setFrozenRows(1);
        return sheet;
      }

      var width = Math.max(sheet.getLastColumn(), Math.min(sheet.getMaxColumns(), headers.length));
      var existing = sheet.getRange(1, 1, 1, width).getValues()[0];
      headers.forEach(function(header) {
        if (existing.indexOf(header) === -1) {
          if (sheet.getLastColumn() >= sheet.getMaxColumns()) {
            var addCells = sheet.getMaxRows();
            if (!ns.canAddCells(ss, addCells)) return;
            sheet.insertColumnsAfter(sheet.getMaxColumns(), 1);
          }
          sheet.getRange(1, sheet.getLastColumn() + 1).setValue(header);
        }
      });
      return sheet;
    }

    // Google Sheets creates a new sheet at a default size before we can trim it.
    // When the workbook is near 10M cells, that default creation itself can fail.
    // In that case, return null so the processor can produce a controlled runtime result.
    var defaultNewSheetCells = 1000 * 26;
    if (!ns.canAddCells(ss, defaultNewSheetCells)) return null;

    sheet = ss.insertSheet(sheetName);

    // Immediately trim the new sheet to a compact ledger shape.
    var targetRows = 2;
    var targetCols = Math.max(headers.length, 1);
    if (sheet.getMaxRows() > targetRows) sheet.deleteRows(targetRows + 1, sheet.getMaxRows() - targetRows);
    if (sheet.getMaxColumns() > targetCols) sheet.deleteColumns(targetCols + 1, sheet.getMaxColumns() - targetCols);
    if (sheet.getMaxColumns() < targetCols) {
      var columnsToAdd = targetCols - sheet.getMaxColumns();
      var cellsToAdd = columnsToAdd * sheet.getMaxRows();
      if (!ns.canAddCells(ss, cellsToAdd)) return null;
      sheet.insertColumnsAfter(sheet.getMaxColumns(), columnsToAdd);
    }

    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
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
      headers.forEach(function(h, i) { obj[h] = row[i]; });
      return obj;
    });
  };

  ns.hasBusinessKey = function(sheet, key) {
    if (!sheet || sheet.getLastRow() < 2) return false;
    return sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues().some(function(row) {
      return String(row[0]) === String(key);
    });
  };

  ns.businessKey = function(cfg) {
    return [cfg.processorNumber + '_' + String(cfg.processorName).toUpperCase(), 'EXECUTE_' + String(cfg.processorName).toUpperCase(), ns.todayKey()].join('|');
  };

  ns.transactionId = function(cfg) {
    return ['TXN', cfg.processorNumber + '_' + String(cfg.processorName).toUpperCase(), cfg.targetSheet, ns.todayKey(), Date.now()].join('|');
  };

  ns.score = function(cfg, sourceRows) {
    var sourceCount = sourceRows ? sourceRows.length : 0;
    var base = cfg.processorNumber - 7900;
    return {
      cognitiveContextCount: Math.max(1, sourceCount),
      cognitiveCoordinationScore: Math.min(100, 65 + Math.floor(base / 3)),
      knowledgeSynthesisScore: Math.min(100, 67 + Math.floor(base / 4)),
      contextOrchestrationScore: Math.min(100, 69 + Math.floor(base / 4)),
      predictiveCognitionScore: Math.min(100, 71 + Math.floor(base / 3)),
      decisionReasoningScore: Math.min(100, 66 + Math.floor(base / 4)),
      learningFeedbackScore: Math.min(100, 63 + Math.floor(base / 5))
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

    if (!target) {
      return ns.result(cfg, 'SKIPPED_NO_INPUTS', key, txn, 0, 1, 0, sourceRows, 'Workbook capacity limit prevents creation or expansion of target sheet ' + cfg.targetSheet + '. No unsafe sheet operation was attempted.');
    }

    if (ns.hasBusinessKey(target, key)) {
      return ns.result(cfg, 'SUCCESS', key, txn, 0, 0, 1, sourceRows, 'Duplicate business key skipped safely.');
    }

    var scores = ns.score(cfg, sourceRows);
    var action = cfg.layer + ' produced for enterprise cognitive review.';
    var payload = {
      processorNumber: cfg.processorNumber,
      processorName: cfg.processorName,
      enterpriseCognitiveLayer: cfg.layer,
      sourceSheet: cfg.sourceSheet,
      targetSheet: cfg.targetSheet,
      sourceRecordCount: sourceRows.length,
      cognitiveContextCount: scores.cognitiveContextCount,
      cognitiveCoordinationScore: scores.cognitiveCoordinationScore,
      knowledgeSynthesisScore: scores.knowledgeSynthesisScore,
      contextOrchestrationScore: scores.contextOrchestrationScore,
      predictiveCognitionScore: scores.predictiveCognitionScore,
      decisionReasoningScore: scores.decisionReasoningScore,
      learningFeedbackScore: scores.learningFeedbackScore,
      cognitiveAction: action,
      generatedAt: ns.nowIso(),
      frameworkVersion: ns.VERSION
    };
    var runtimeResult = {
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
      'Enterprise_Cognitive_Layer': cfg.layer,
      'Source_Sheet': cfg.sourceSheet,
      'Target_Sheet': cfg.targetSheet,
      'Status': 'SUCCESS',
      'Cognitive_Context_Count': scores.cognitiveContextCount,
      'Cognitive_Coordination_Score': scores.cognitiveCoordinationScore,
      'Knowledge_Synthesis_Score': scores.knowledgeSynthesisScore,
      'Context_Orchestration_Score': scores.contextOrchestrationScore,
      'Predictive_Cognition_Score': scores.predictiveCognitionScore,
      'Decision_Reasoning_Score': scores.decisionReasoningScore,
      'Learning_Feedback_Score': scores.learningFeedbackScore,
      'Cognitive_Action': action,
      'Runtime_Payload_JSON': JSON.stringify(payload),
      'Runtime_Result_JSON': JSON.stringify(runtimeResult),
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
          subsystem: ns.SUBSYSTEM,
          processorNumber: cfg.processorNumber,
          duplicateSafe: true,
          skipSafe: true,
          eventSourced: true,
          transactionAware: true,
          enterpriseCognitive: true
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
            enterpriseCognitiveLayer: cfg.layer,
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
})(SCIIP_ENTERPRISE_COGNITIVE_EXECUTION);
