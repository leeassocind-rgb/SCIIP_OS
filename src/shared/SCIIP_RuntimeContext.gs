/**
 * SCIIP_OS v5.2
 * Runtime Context
 * File: SCIIP_RuntimeContext.gs
 *
 * Processor: 2420_RuntimeContext
 *
 * Purpose:
 * Centralizes runtime context creation for SCIIP_OS.
 * Future processors should use this module to create consistent
 * processor/action/date/business-key/spreadsheet metadata.
 */

var SCIIP_RUNTIME = SCIIP_RUNTIME || {};
var SCIIP_RUNTIME_CONTEXT = SCIIP_RUNTIME_CONTEXT || {};

SCIIP_RUNTIME_CONTEXT.VERSION = 'v5.2';

SCIIP_RUNTIME_CONTEXT.create = function(config) {
  config = config || {};

  var processor = config.processor || '';
  var action = config.action || '';
  var dateKey = config.dateKey || SCIIP_RUNTIME.getDateKey(config);

  var businessKey = config.businessKey || SCIIP_RUNTIME.makeBusinessKey([
    processor,
    action,
    dateKey
  ]);

  var spreadsheetId = config.spreadsheetId;

  if (!spreadsheetId && SCIIP_RUNTIME_SHEET_FACTORY) {
    spreadsheetId = SCIIP_RUNTIME_SHEET_FACTORY.getSpreadsheetId();
  }

  if (!spreadsheetId && SCIIP_RUNTIME.getSpreadsheetId) {
    spreadsheetId = SCIIP_RUNTIME.getSpreadsheetId();
  }

  return {
    processor: processor,
    action: action,
    dateKey: dateKey,
    businessKey: businessKey,
    spreadsheetId: spreadsheetId || null,
    frameworkVersion: SCIIP_RUNTIME_CONTEXT.VERSION,
    runtimeVersion: SCIIP_RUNTIME.VERSION || SCIIP_RUNTIME_CONTEXT.VERSION,
    startedAt: config.startedAt || new Date().toISOString(),
    operator: config.operator || Session.getActiveUser().getEmail() || '',
    sourceSheet: config.sourceSheet || null,
    targetSheet: config.targetSheet || null,
    ledgerSheet: config.ledgerSheet || null,
    flags: config.flags || {},
    refs: config.refs || {}
  };
};

SCIIP_RUNTIME_CONTEXT.fromProcessor = function(processor, action, dateKey) {
  return SCIIP_RUNTIME_CONTEXT.create({
    processor: processor,
    action: action,
    dateKey: dateKey
  });
};

SCIIP_RUNTIME_CONTEXT.withSheets = function(config) {
  config = config || {};

  return SCIIP_RUNTIME_CONTEXT.create({
    processor: config.processor,
    action: config.action,
    dateKey: config.dateKey,
    businessKey: config.businessKey,
    sourceSheet: config.sourceSheet,
    targetSheet: config.targetSheet,
    ledgerSheet: config.ledgerSheet,
    flags: config.flags || {},
    refs: config.refs || {}
  });
};

SCIIP_RUNTIME_CONTEXT.compact = function(context) {
  context = context || {};

  return {
    processor: context.processor || null,
    action: context.action || null,
    dateKey: context.dateKey || null,
    businessKey: context.businessKey || null,
    frameworkVersion: context.frameworkVersion || SCIIP_RUNTIME_CONTEXT.VERSION,
    startedAt: context.startedAt || null
  };
};

SCIIP_RUNTIME_CONTEXT.validate = function(context) {
  var errors = [];

  if (!context) {
    errors.push('Missing runtime context.');
  } else {
    if (!context.processor) errors.push('Missing processor.');
    if (!context.action) errors.push('Missing action.');
    if (!context.dateKey) errors.push('Missing dateKey.');
    if (!context.businessKey) errors.push('Missing businessKey.');
    if (!context.spreadsheetId) errors.push('Missing spreadsheetId.');
  }

  return {
    valid: errors.length === 0,
    errors: errors
  };
};

/**
 * Backward-compatible runtime hook.
 */
SCIIP_RUNTIME.createContext = function(config) {
  return SCIIP_RUNTIME_CONTEXT.create(config);
};

/**
 * Standalone validation test.
 */
function sciipTest2420_RuntimeContext() {
  var result = SCIIP_RUNTIME.runProcessor({
    processor: '2420_RuntimeContext',
    action: 'RUNTIME_CONTEXT_VALIDATION',

    buildPayload: function() {
      var context = SCIIP_RUNTIME_CONTEXT.create({
        processor: '2420_RuntimeContext',
        action: 'RUNTIME_CONTEXT_VALIDATION'
      });

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: '2420_RuntimeContext',
        action: 'RUNTIME_CONTEXT_VALIDATION',
        businessKey: context.businessKey,
        inputCount: 1,
        outputCount: 1,
        summary: 'Runtime context test payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context)
        }
      });
    },

    execute: function(payload) {
      var context = SCIIP_RUNTIME_CONTEXT.withSheets({
        processor: '2420_RuntimeContext',
        action: 'RUNTIME_CONTEXT_SHEET_VALIDATION',
        sourceSheet: 'SCIIP_RUNTIME_CONTEXT_SOURCE_TEST',
        targetSheet: 'SCIIP_RUNTIME_CONTEXT_TARGET_TEST',
        ledgerSheet: 'SCIIP_RUNTIME_CONTEXT_LEDGER_TEST'
      });

      var validation = SCIIP_RUNTIME_CONTEXT.validate(context);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: '2420_RuntimeContext',
        recordsCreated: validation.valid ? 1 : 0,
        processed: 1,
        message: JSON.stringify({
          contextValid: validation.valid,
          errors: validation.errors,
          businessKey: context.businessKey,
          spreadsheetId: context.spreadsheetId
        })
      });
    }
  });

  Logger.log(JSON.stringify({
    test: 'sciipTest2420_RuntimeContext',
    result: result
  }));

  return result;
}