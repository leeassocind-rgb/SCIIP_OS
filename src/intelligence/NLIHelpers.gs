function sciipCreateNaturalLanguageQuery(
  queryType,
  question,
  metadata
) {
  metadata = metadata || {};

  var ss = SpreadsheetApp.openById(SCIIP.SPREADSHEET_ID);

  var sheet = ss.getSheetByName('INTELLIGENCE_QUERY');

  if (!sheet) {
    sheet = ss.insertSheet('INTELLIGENCE_QUERY');

    sheet.appendRow([
      'Query_ID',
      'Query_Type',
      'Query_Text',
      'Asset_ID',
      'Address',
      'City',
      'Campus_ID',
      'Status',
      'Created_At',
      'Processed_At'
    ]);

    sheet.setFrozenRows(1);
  }

  sheet.appendRow([
    sciipNLIId_('QUERY', new Date().toISOString()),
    queryType,
    question,
    metadata.assetId || '',
    metadata.address || '',
    metadata.city || '',
    metadata.campusId || '',
    'PENDING',
    new Date(),
    ''
  ]);
}