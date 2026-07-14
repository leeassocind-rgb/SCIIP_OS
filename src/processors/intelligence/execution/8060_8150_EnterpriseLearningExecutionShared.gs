/**
 * SCIIP_OS v5.5 — Enterprise Learning Execution Shared Helpers
 * Range: 8060–8150
 * Capacity-safe, runtime-contract compatible implementation.
 */
var SCIIP_ENTERPRISE_LEARNING_EXECUTION = SCIIP_ENTERPRISE_LEARNING_EXECUTION || {};
(function(ns) {
  ns.VERSION = 'v5.5-enterprise-learning-8150-capacity-safe';
  ns.SUBSYSTEM = 'Enterprise Learning Execution';

  ns.headers = function() {
    return [
      'Business_Key','Processor_Number','Processor_Name','Enterprise_Learning_Layer',
      'Source_Sheet','Target_Sheet','Status','Learning_Context_Count',
      'Learning_Intake_Score','Pattern_Recognition_Score','Knowledge_Refinement_Score',
      'Model_Adaptation_Score','Feedback_Integration_Score','Learning_Governance_Score',
      'Learning_Action','Runtime_Payload_JSON','Runtime_Result_JSON','Transaction_ID','Created_At'
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
    throw new Error('No spreadsheet available for Enterprise Learning Execution.');
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

    var defaultNewSheetCells = 1000 * 26;
    if (!ns.canAddCells(ss, defaultNewSheetCells)) return null;

    sheet = ss.insertSheet(sheetName);
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
    var base = cfg.processorNumber - 8000;
    return {
      learningContextCount: Math.max(1, sourceCount),
      learningIntakeScore: Math.min(100, 64 + Math.floor(base / 4)),
      patternRecognitionScore: Math.min(100, 66 + Math.floor(base / 4)),
      knowledgeRefinementScore: Math.min(100, 68 + Math.floor(base / 5)),
      modelAdaptationScore: Math.min(100, 70 + Math.floor(base / 5)),
      feedbackIntegrationScore: Math.min(100, 67 + Math.floor(base / 4)),
      learningGovernanceScore: Math.min(100, 65 + Math.floor(base / 5))
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
    var action = cfg.layer + ' produced for enterprise learning review.';
    var payload = {
      processorNumber: cfg.processorNumber,
      processorName: cfg.processorName,
      enterpriseLearningLayer: cfg.layer,
      sourceSheet: cfg.sourceSheet,
      targetSheet: cfg.targetSheet,
      sourceRecordCount: sourceRows.length,
      learningContextCount: scores.learningContextCount,
      learningIntakeScore: scores.learningIntakeScore,
      patternRecognitionScore: scores.patternRecognitionScore,
      knowledgeRefinementScore: scores.knowledgeRefinementScore,
      modelAdaptationScore: scores.modelAdaptationScore,
      feedbackIntegrationScore: scores.feedbackIntegrationScore,
      learningGovernanceScore: scores.learningGovernanceScore,
      learningAction: action,
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
      'Enterprise_Learning_Layer': cfg.layer,
      'Source_Sheet': cfg.sourceSheet,
      'Target_Sheet': cfg.targetSheet,
      'Status': 'SUCCESS',
      'Learning_Context_Count': scores.learningContextCount,
      'Learning_Intake_Score': scores.learningIntakeScore,
      'Pattern_Recognition_Score': scores.patternRecognitionScore,
      'Knowledge_Refinement_Score': scores.knowledgeRefinementScore,
      'Model_Adaptation_Score': scores.modelAdaptationScore,
      'Feedback_Integration_Score': scores.feedbackIntegrationScore,
      'Learning_Governance_Score': scores.learningGovernanceScore,
      'Learning_Action': action,
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
          enterpriseLearning: true
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
            enterpriseLearningLayer: cfg.layer,
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
})(SCIIP_ENTERPRISE_LEARNING_EXECUTION);
