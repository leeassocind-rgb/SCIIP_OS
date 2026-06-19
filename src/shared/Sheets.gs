/* ==========================================================
   SCIIP_OS
   Module: Shared
   File: Sheets.gs
========================================================== */

function sciipGetActiveSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
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