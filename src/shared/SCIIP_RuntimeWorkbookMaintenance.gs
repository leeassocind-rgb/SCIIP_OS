function sciipCompactWorkbookGrid() {
  const ss = SCIIP_RUNTIME_SHEET_FACTORY.getSpreadsheet();

  ss.getSheets().forEach(function(sheet) {
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

  Logger.log('SCIIP runtime workbook grid compacted.');
}