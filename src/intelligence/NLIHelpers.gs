function sciipCreateNaturalLanguageQuery(
  queryType,
  question,
  metadata
) {

  var sheet =
    SpreadsheetApp
      .openById(SCIIP.SPREADSHEET_ID)
      .getSheetByName('INTELLIGENCE_QUERY');

  sheet.appendRow([
    sciipNLIId_('QUERY', new Date().toISOString()),
    queryType,
    question,
    JSON.stringify(metadata || {}),
    'PENDING',
    new Date()
  ]);
}