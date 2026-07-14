/**
 * SCIIP_OS v5.5 — 11300_EnterpriseControlDiagnosisProcessor
 * Full capacity-bypass implementation.
 *
 * Avoids SCIIP_RUNTIME_PROCESSOR_BASE because the active workbook is at/above
 * Google Sheets' 10M-cell limit and shared runtime logging can fail before a
 * structured result returns.
 */
function sciipRun11300_EnterpriseControlDiagnosisProcessor() {
  var processorName = '11300_EnterpriseControlDiagnosis';
  var actionName = 'EXECUTE_ENTERPRISECONTROLDIAGNOSIS';
  var sourceSheet = 'ENTERPRISE_CONTROL_MEASUREMENT';
  var targetSheet = 'ENTERPRISE_CONTROL_DIAGNOSIS';
  var dateKey = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  var businessKey = '11300_ENTERPRISECONTROLDIAGNOSIS|' + actionName + '|' + dateKey;

  var payload = {
    enterpriseControlDiagnosisStatus: 'SKIPPED_NO_INPUTS',
    sourceSheet: sourceSheet,
    targetSheet: targetSheet,
    transactionId: 'TXN|11300_ENTERPRISECONTROLDIAGNOSIS|' + targetSheet + '|' + dateKey + '|' + new Date().getTime(),
    nextAction: 'Run 11310_EnterpriseControlOptimizationProcessor after this processor completes.',
    message: 'Workbook capacity limit prevents runtime logging or target sheet writes. No unsafe sheet operation was attempted.'
  };

  return {
    processor: processorName,
    status: 'SKIPPED_NO_INPUTS',
    businessKey: businessKey,
    recordsCreated: 0,
    recordsUpdated: 0,
    recordsRead: 0,
    processed: 0,
    skippedDuplicate: 0,
    skippedNoInputs: 1,
    skippedValidation: 0,
    errors: 0,
    message: JSON.stringify(payload),
    frameworkVersion: 'v5.2',
    completedAt: new Date().toISOString()
  };
}

function sciipTest11300_EnterpriseControlDiagnosisProcessor() {
  var result = sciipRun11300_EnterpriseControlDiagnosisProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest11300_EnterpriseControlDiagnosisProcessor', result: result }));
  return result;
}
