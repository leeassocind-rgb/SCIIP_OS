/**
 * SCIIP Spreadsheet Resolver
 */

function sciipGetSpreadsheet_() {
  if (typeof SCIIP_SPREADSHEET_ID !== 'undefined' && SCIIP_SPREADSHEET_ID) {
    return SpreadsheetApp.openById(SCIIP_SPREADSHEET_ID);
  }

  const propertySpreadsheetId =
    PropertiesService.getScriptProperties()
      .getProperty('SCIIP_SPREADSHEET_ID');

  if (propertySpreadsheetId) {
    return SpreadsheetApp.openById(propertySpreadsheetId);
  }

  throw new Error('SCIIP_SPREADSHEET_ID not configured.');
}

function sciipResolveLatestProcessingDate_(sheetName, dateColumnName) {
  const ss = sciipGetSpreadsheet_();
  const sheet = ss.getSheetByName(sheetName);

  if (!sheet) return null;

  const values = sheet.getDataRange().getValues();

  if (values.length < 2) return null;

  const headers = values[0];
  const dateIndex = headers.indexOf(dateColumnName);

  if (dateIndex === -1) return null;

  const dates = values
    .slice(1)
    .map(row => row[dateIndex])
    .filter(String)
    .map(value => {
      if (value instanceof Date) {
        return sciipFormatDateKey_(value);
      }
      return String(value).trim();
    })
    .filter(String);

  if (!dates.length) return null;

  dates.sort();

  return dates[dates.length - 1];
}

function sciipFormatDateKey_(date) {
  if (!date) return '';

  if (Object.prototype.toString.call(date) === '[object Date]' && !isNaN(date.getTime())) {
    return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }

  const parsed = new Date(date);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }

  return String(date).trim();
}

function sciipBusinessKeyPrefixExists_(sheet, businessKeyPrefix) {
  if (!sheet || !businessKeyPrefix) return false;

  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return false;

  const headers = values[0].map(function(header) {
    return String(header).trim();
  });

  const businessKeyIndex = headers.indexOf('Business_Key');
  if (businessKeyIndex === -1) return false;

  return values.slice(1).some(function(row) {
    const key = String(row[businessKeyIndex] || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}