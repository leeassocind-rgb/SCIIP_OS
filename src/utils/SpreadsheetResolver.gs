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