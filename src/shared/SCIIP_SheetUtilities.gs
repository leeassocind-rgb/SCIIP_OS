/* ==========================================================
   SCIIP_OS
   Module: Shared
   File: Sheets.gs
========================================================== */

function sciipGetActiveSpreadsheet() {
  if (
    typeof SCIIP !== 'undefined' &&
    SCIIP.SPREADSHEET_ID
  ) {
    return SpreadsheetApp.openById(SCIIP.SPREADSHEET_ID);
  }

  const active = SpreadsheetApp.getActiveSpreadsheet();

  if (active) {
    return active;
  }

  throw new Error(
    'No spreadsheet available. Add SCIIP.SPREADSHEET_ID in SCIIP_CONFIG.gs.'
  );
}

function sciipGetSheet(sheetName) {
  const ss = sciipGetActiveSpreadsheet();
  return ss.getSheetByName(sheetName);
}

function sciipGetOrCreateSheet(sheetName) {
  const ss = sciipGetActiveSpreadsheet();
  return ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
}

function sciipGetSheetValues(sheetName) {
  const sheet = sciipGetSheet(sheetName);
  if (!sheet) return [];
  const range = sheet.getDataRange();
  return range.getNumRows() ? range.getValues() : [];
}

function sciipGetHeaderMap(sheet) {
  const values = sheet.getDataRange().getValues();
  if (!values.length) return {};

  const headers = values[0];
  const map = {};

  headers.forEach(function(header, index) {
    map[sciipNormalizeToken(header)] = index;
  });

  return map;
}

function sciipAppendRow(sheetName, row) {
  const sheet = sciipGetOrCreateSheet(sheetName);
  sheet.appendRow(row);
  return row;
}

/**
 * Returns all records from a sheet as an array of objects.
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @return {Object[]}
 */
function sciipGetSheetRecords_(sheet) {

  if (!sheet) {
    return [];
  }

  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return [];
  }

  const headers = values[0];

  return values.slice(1).map(function(row) {

    const record = {};

    headers.forEach(function(header, i) {
      record[header] = row[i];
    });

    return record;

  });

}