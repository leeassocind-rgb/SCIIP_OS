function sciipCompactWorkbookGrid_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();

  sheets.forEach(function(sheet) {
    const lastRow = Math.max(sheet.getLastRow(), 1);
    const lastCol = Math.max(sheet.getLastColumn(), 1);

    const maxRows = sheet.getMaxRows();
    const maxCols = sheet.getMaxColumns();

    if (maxRows > lastRow + 25) {
      sheet.deleteRows(lastRow + 26, maxRows - lastRow - 25);
    }

    if (maxCols > lastCol + 5) {
      sheet.deleteColumns(lastCol + 6, maxCols - lastCol - 5);
    }
  });

  Logger.log('Workbook grid compacted.');
}