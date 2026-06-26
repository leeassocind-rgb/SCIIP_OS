/************************************************************
 * SCIIP_OS v4.1
 * SCIIP_SystemContinuityCommon
 *
 * Shared continuity utilities for processors 1590+
 ************************************************************/

function sciipNormalizeProcessingDateKey_() {
  let processingDate = sciipResolveLatestProcessingDate_();
  let dateKey = '';

  if (processingDate instanceof Date && !isNaN(processingDate.getTime())) {
    dateKey = sciipFormatDateKey_(processingDate);
  } else if (processingDate) {
    const parsedDate = new Date(processingDate);

    if (!isNaN(parsedDate.getTime())) {
      dateKey = sciipFormatDateKey_(parsedDate);
    }
  }

  if (!dateKey || dateKey === '1969-12-31' || dateKey === '1970-01-01') {
    dateKey = '2026-06-25';
  }

  return dateKey;
}

function sciipSheetBusinessKeyExists_(sheet, businessKey) {
  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return false;
  }

  const headers = values[0];
  const businessKeyIndex = headers.indexOf('businessKey');

  if (businessKeyIndex === -1) {
    return false;
  }

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][businessKeyIndex]) === String(businessKey)) {
      return true;
    }
  }

  return false;
}

function sciipEnsureSheetWithHeaders_(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  }

  return sheet;
}

function sciipLatestRecordFromSheet_(sheet) {
  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return null;
  }

  const headers = values[0];
  const latestRow = values[values.length - 1];

  const record = {};

  headers.forEach(function(header, index) {
    record[header] = latestRow[index];
  });

  return record;
}