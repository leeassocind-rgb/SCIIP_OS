/**
 * SCIIP_OS v5.2
 * Runtime Sheet Factory
 * File: SCIIP_RuntimeSheetFactory.gs
 *
 * Processor: 2410_RuntimeSheetFactory
 *
 * Purpose:
 * Centralizes runtime spreadsheet access, sheet initialization,
 * header validation, row appends, and latest-record retrieval.
 */

var SCIIP_RUNTIME_SHEET_FACTORY = SCIIP_RUNTIME_SHEET_FACTORY || {};

SCIIP_RUNTIME_SHEET_FACTORY.VERSION = 'v5.2';

SCIIP_RUNTIME_SHEET_FACTORY.DEFAULT_SPREADSHEET_ID =
  '1x5lXkh0l63v92tYacGe7S8vHISHycBufaLfE54dPPDk';

SCIIP_RUNTIME_SHEET_FACTORY.getSpreadsheetId = function() {
  if (
    typeof SCIIP !== 'undefined' &&
    SCIIP &&
    SCIIP.SPREADSHEET_ID
  ) {
    return SCIIP.SPREADSHEET_ID;
  }

  if (
    typeof SCIIP_RUNTIME !== 'undefined' &&
    SCIIP_RUNTIME &&
    SCIIP_RUNTIME.DEFAULT_SPREADSHEET_ID
  ) {
    return SCIIP_RUNTIME.DEFAULT_SPREADSHEET_ID;
  }

  return SCIIP_RUNTIME_SHEET_FACTORY.DEFAULT_SPREADSHEET_ID;
};

SCIIP_RUNTIME_SHEET_FACTORY.getSpreadsheet = function() {
  return SpreadsheetApp.openById(
    SCIIP_RUNTIME_SHEET_FACTORY.getSpreadsheetId()
  );
};

SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet = function(sheetName, headers) {
  var ss = SCIIP_RUNTIME_SHEET_FACTORY.getSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  if (headers && headers.length > 0) {
    SCIIP_RUNTIME_SHEET_FACTORY.ensureHeaders(sheet, headers);
  }

  return sheet;
};

SCIIP_RUNTIME_SHEET_FACTORY.ensureHeaders = function(sheet, headers) {
  if (!sheet || !headers || headers.length === 0) return sheet;

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
    return sheet;
  }

  var existingHeaders = sheet
    .getRange(1, 1, 1, Math.max(sheet.getLastColumn(), headers.length))
    .getValues()[0];

  var changed = false;

  headers.forEach(function(header, index) {
    if (existingHeaders[index] !== header) {
      existingHeaders[index] = header;
      changed = true;
    }
  });

  if (changed) {
    sheet
      .getRange(1, 1, 1, existingHeaders.length)
      .setValues([existingHeaders]);
    sheet.setFrozenRows(1);
  }

  return sheet;
};

SCIIP_RUNTIME_SHEET_FACTORY.appendObject = function(sheetName, headers, object) {
  var sheet = SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(sheetName, headers);

  var row = headers.map(function(header) {
    var value = object && object.hasOwnProperty(header) ? object[header] : '';

    if (
      value !== null &&
      value !== undefined &&
      typeof value === 'object'
    ) {
      return JSON.stringify(value);
    }

    return value === null || value === undefined ? '' : value;
  });

  sheet.appendRow(row);

  return {
    sheetName: sheetName,
    rowNumber: sheet.getLastRow(),
    columnsWritten: headers.length
  };
};

SCIIP_RUNTIME_SHEET_FACTORY.getHeaders = function(sheetName) {
  var ss = SCIIP_RUNTIME_SHEET_FACTORY.getSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);

  if (!sheet || sheet.getLastRow() === 0) return [];

  return sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getValues()[0];
};

SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords = function(sheetName) {
  var ss = SCIIP_RUNTIME_SHEET_FACTORY.getSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);

  if (!sheet || sheet.getLastRow() < 2) return [];

  var headers = sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getValues()[0];

  var values = sheet
    .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
    .getValues();

  return values.map(function(row) {
    var record = {};

    headers.forEach(function(header, index) {
      record[header] = row[index];
    });

    return record;
  });
};

SCIIP_RUNTIME_SHEET_FACTORY.getLatestRecord = function(sheetName) {
  var records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);

  if (!records || records.length === 0) return null;

  return records[records.length - 1];
};

SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey = function(sheetName, businessKey) {
  var records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);

  for (var i = records.length - 1; i >= 0; i--) {
    if (String(records[i].Business_Key) === String(businessKey)) {
      return records[i];
    }

    if (String(records[i].businessKey) === String(businessKey)) {
      return records[i];
    }
  }

  return null;
};

/**
 * Standalone validation test.
 */
function sciipTest2410_RuntimeSheetFactory() {
  var result = SCIIP_RUNTIME.runProcessor({
    processor: '2410_RuntimeSheetFactory',
    action: 'RUNTIME_SHEET_FACTORY_VALIDATION',

    buildPayload: function() {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: '2410_RuntimeSheetFactory',
        action: 'RUNTIME_SHEET_FACTORY_VALIDATION',
        inputCount: 1,
        outputCount: 1,
        summary: 'Runtime sheet factory test payload created.'
      });
    },

    execute: function(payload) {
      var testSheetName = 'SCIIP_RUNTIME_SHEET_FACTORY_TEST';

      var headers = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Status',
        'Payload_JSON'
      ];

      var testBusinessKey = SCIIP_RUNTIME.makeBusinessKey([
        '2410_RuntimeSheetFactory',
        'SHEET_APPEND_TEST',
        SCIIP_RUNTIME.getDateKey({})
      ]);

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(testSheetName, headers, {
        Timestamp: new Date(),
        Processor: '2410_RuntimeSheetFactory',
        Business_Key: testBusinessKey,
        Status: 'SUCCESS',
        Payload_JSON: payload
      });

      var latestRecord =
        SCIIP_RUNTIME_SHEET_FACTORY.getLatestRecord(testSheetName);

      var locatedRecord =
        SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(
          testSheetName,
          testBusinessKey
        );

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: '2410_RuntimeSheetFactory',
        recordsCreated: 1,
        processed: latestRecord && locatedRecord ? 1 : 0,
        message: JSON.stringify({
          testSheetName: testSheetName,
          latestRecordFound: !!latestRecord,
          businessKeyLocated: !!locatedRecord
        })
      });
    }
  });

  Logger.log(JSON.stringify({
    test: 'sciipTest2410_RuntimeSheetFactory',
    result: result
  }));

  return result;
}