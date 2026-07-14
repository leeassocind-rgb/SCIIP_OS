/**
 * SCIIP_OS v5.2
 * Shared Runtime Framework
 * File: SCIIP_RuntimeCommon.gs
 */


SCIIP_RUNTIME.VERSION = 'v5.2';

SCIIP_RUNTIME.DEFAULT_SPREADSHEET_ID = '1x5lXkh0l63v92tYacGe7S8vHISHycBufaLfE54dPPDk';

SCIIP_RUNTIME.SHEETS = {
  RUNTIME_FRAMEWORK_LEDGER: 'RUNTIME_FRAMEWORK_LEDGER',
  RUNTIME_FRAMEWORK_INDEX: 'RUNTIME_FRAMEWORK_INDEX',
  RUNTIME_FRAMEWORK_ERRORS: 'RUNTIME_FRAMEWORK_ERRORS'
};

SCIIP_RUNTIME.HEADERS = {
  RUNTIME_FRAMEWORK_LEDGER: [
    'Timestamp',
    'Framework_Version',
    'Processor',
    'Action',
    'Business_Key',
    'Status',
    'Payload_JSON',
    'Result_JSON'
  ],
  RUNTIME_FRAMEWORK_INDEX: [
    'Business_Key',
    'Processor',
    'Action',
    'Status',
    'Last_Updated',
    'Latest_Result_JSON'
  ],
  RUNTIME_FRAMEWORK_ERRORS: [
    'Timestamp',
    'Processor',
    'Action',
    'Business_Key',
    'Error_Message',
    'Stack'
  ]
};

SCIIP_RUNTIME.getSpreadsheetId = function() {
  if (
    typeof SCIIP !== 'undefined' &&
    SCIIP &&
    SCIIP.SPREADSHEET_ID
  ) {
    return SCIIP.SPREADSHEET_ID;
  }

  return SCIIP_RUNTIME.DEFAULT_SPREADSHEET_ID;
};

SCIIP_RUNTIME.getSpreadsheet = function() {
  return SpreadsheetApp.openById(SCIIP_RUNTIME.getSpreadsheetId());
};

SCIIP_RUNTIME.ensureSheet = function(sheetName, headers) {
  var ss = SCIIP_RUNTIME.getSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }

  return sheet;
};

SCIIP_RUNTIME.ensureRuntimeSheets = function() {
  Object.keys(SCIIP_RUNTIME.SHEETS).forEach(function(key) {
    var sheetName = SCIIP_RUNTIME.SHEETS[key];
    SCIIP_RUNTIME.ensureSheet(sheetName, SCIIP_RUNTIME.HEADERS[sheetName]);
  });
};

SCIIP_RUNTIME.getDateKey = function(config) {
  if (config && config.dateKey) return config.dateKey;

  if (typeof sciipTodayIso === 'function') {
    return sciipTodayIso();
  }

  return Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    'yyyy-MM-dd'
  );
};

SCIIP_RUNTIME.makeBusinessKey = function(parts) {
  return parts
    .filter(function(p) {
      return p !== null && p !== undefined && String(p).trim() !== '';
    })
    .map(function(p) {
      return String(p).trim().toUpperCase();
    })
    .join('|');
};

SCIIP_RUNTIME.existsInLedger = function(sheetName, businessKey) {
  var ss = SCIIP_RUNTIME.getSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);

  if (!sheet || sheet.getLastRow() < 2) return false;

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var idx = headers.indexOf('Business_Key');

  if (idx === -1) return false;

  var values = sheet
    .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
    .getValues();

  return values.some(function(row) {
    return String(row[idx]) === String(businessKey);
  });
};

SCIIP_RUNTIME.compactPayload = function(payload) {
  if (!payload) return {};

  return {
    id: payload.id || payload.processor || null,
    businessKey: payload.businessKey || null,
    status: payload.status || null,
    count: payload.count || payload.recordsCreated || payload.processed || 0,
    completedAt: payload.completedAt || new Date().toISOString()
  };
};

SCIIP_RUNTIME.result = function(config) {
  return {
    processor: config.processor,
    status: config.status || 'SUCCESS',
    businessKey: config.businessKey || null,
    recordsCreated: config.recordsCreated || 0,
    skippedDuplicate: config.skippedDuplicate || 0,
    message: config.message || '',
    completedAt: new Date().toISOString()
  };
};

SCIIP_RUNTIME.logLedger = function(config) {
  SCIIP_RUNTIME.ensureRuntimeSheets();

  var sheet = SCIIP_RUNTIME
    .getSpreadsheet()
    .getSheetByName(SCIIP_RUNTIME.SHEETS.RUNTIME_FRAMEWORK_LEDGER);

  sheet.appendRow([
    new Date(),
    SCIIP_RUNTIME.VERSION,
    config.processor,
    config.action,
    config.businessKey,
    config.status,
    JSON.stringify(SCIIP_RUNTIME.compactPayload(config.payload)),
    JSON.stringify(SCIIP_RUNTIME.compactPayload(config.result))
  ]);
};

SCIIP_RUNTIME.logError = function(config, error) {
  SCIIP_RUNTIME.ensureRuntimeSheets();

  var sheet = SCIIP_RUNTIME
    .getSpreadsheet()
    .getSheetByName(SCIIP_RUNTIME.SHEETS.RUNTIME_FRAMEWORK_ERRORS);

  sheet.appendRow([
    new Date(),
    config.processor || '',
    config.action || '',
    config.businessKey || '',
    error && error.message ? error.message : String(error),
    error && error.stack ? error.stack : ''
  ]);
};

SCIIP_RUNTIME.runProcessor = function(config) {
  SCIIP_RUNTIME.ensureRuntimeSheets();

  var dateKey = SCIIP_RUNTIME.getDateKey(config);

  var businessKey = SCIIP_RUNTIME.makeBusinessKey([
    config.processor,
    config.action,
    dateKey
  ]);

  try {
    if (
      SCIIP_RUNTIME.existsInLedger(
        SCIIP_RUNTIME.SHEETS.RUNTIME_FRAMEWORK_LEDGER,
        businessKey
      )
    ) {
      var duplicateResult = SCIIP_RUNTIME.result({
        processor: config.processor,
        status: 'SUCCESS',
        businessKey: businessKey,
        skippedDuplicate: 1,
        message: 'Duplicate skipped by shared runtime framework.'
      });

      SCIIP_RUNTIME.logLedger({
        processor: config.processor,
        action: config.action,
        businessKey: businessKey,
        status: 'SKIPPED_DUPLICATE',
        payload: { businessKey: businessKey },
        result: duplicateResult
      });

      return duplicateResult;
    }

    var payload = config.buildPayload ? config.buildPayload() : {};
    var executionResult = config.execute ? config.execute(payload) : {};

    var result = SCIIP_RUNTIME.result({
      processor: config.processor,
      status: executionResult.status || 'SUCCESS',
      businessKey: businessKey,
      recordsCreated: executionResult.recordsCreated || 0,
      message: executionResult.message || ''
    });

    SCIIP_RUNTIME.logLedger({
      processor: config.processor,
      action: config.action,
      businessKey: businessKey,
      status: result.status,
      payload: payload,
      result: result
    });

    return result;

  } catch (err) {
    SCIIP_RUNTIME.logError({
      processor: config.processor,
      action: config.action,
      businessKey: businessKey
    }, err);

    throw err;
  }
};

/**
 * Standalone validation test.
 */
function sciipTest2380_RuntimeFrameworkCommon() {
  var result = SCIIP_RUNTIME.runProcessor({
    processor: '2380_RuntimeFrameworkCommon',
    action: 'RUNTIME_FRAMEWORK_BOOTSTRAP',

    buildPayload: function() {
      return {
        processor: '2380_RuntimeFrameworkCommon',
        status: 'TEST_PAYLOAD_CREATED',
        count: 1
      };
    },

    execute: function(payload) {
      return {
        status: 'SUCCESS',
        recordsCreated: 1,
        message: 'Runtime framework common validated.'
      };
    }
  });

  Logger.log(JSON.stringify({
    test: 'sciipTest2380_RuntimeFrameworkCommon',
    result: result
  }));

  return result;
}