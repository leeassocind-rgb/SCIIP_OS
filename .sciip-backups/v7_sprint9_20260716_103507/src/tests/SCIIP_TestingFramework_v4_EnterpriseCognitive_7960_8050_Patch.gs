/**
 * SCIIP Testing Framework v4 explicit patch — Enterprise Cognitive Execution 7960–8050
 * Capacity-safe runtime validation wrapper.
 */
function sciipTest7960() { return sciipTest7960_EnterpriseCognitiveReadinessProcessor(); }
function sciipTest7970() { return sciipTest7970_EnterpriseCognitiveCoordinationProcessor(); }
function sciipTest7980() { return sciipTest7980_EnterpriseKnowledgeSynthesisProcessor(); }
function sciipTest7990() { return sciipTest7990_EnterpriseContextOrchestrationProcessor(); }
function sciipTest8000() { return sciipTest8000_EnterprisePredictiveCognitionProcessor(); }
function sciipTest8010() { return sciipTest8010_EnterpriseDecisionReasoningProcessor(); }
function sciipTest8020() { return sciipTest8020_EnterpriseLearningFeedbackProcessor(); }
function sciipTest8030() { return sciipTest8030_EnterpriseCognitiveValidationProcessor(); }
function sciipTest8040() { return sciipTest8040_EnterpriseCognitiveCertificationProcessor(); }
function sciipTest8050() { return sciipTest8050_EnterpriseCognitiveAcceptanceProcessor(); }

function sciipTestRange7960_8050_EnterpriseCognitiveExecution() {
  return SCIIP_TEST.runRange(7960, 8050);
}

function sciipDiagnosticWorkbookCellCapacity_7960_8050() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ss.getSheets();
  var total = 0;
  var rows = [];
  for (var i = 0; i < sheets.length; i++) {
    var r = sheets[i].getMaxRows();
    var c = sheets[i].getMaxColumns();
    var cells = r * c;
    total += cells;
    rows.push({ sheet: sheets[i].getName(), rows: r, columns: c, cells: cells });
  }
  rows.sort(function(a,b){ return b.cells - a.cells; });
  var result = { workbookCells: total, limit: 10000000, remaining: 10000000 - total, largestSheets: rows.slice(0, 25) };
  Logger.log(JSON.stringify(result));
  return result;
}
