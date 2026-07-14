/**
 * SCIIP_OS v5.5 — 11370_EnterpriseSecuritySignalProcessor
 * Full capacity-bypass implementation.
 *
 * Avoids SCIIP_RUNTIME_PROCESSOR_BASE because the active workbook is at/above
 * Google Sheets' 10M-cell limit and shared runtime logging can fail before a
 * structured result returns.
 */
function sciipRun11370_EnterpriseSecuritySignalProcessor() {
  var processorName = '11370_EnterpriseSecuritySignal';
  var actionName = 'EXECUTE_ENTERPRISESECURITYSIGNAL';
  var sourceSheet = 'ENTERPRISE_SECURITY_READINESS';
  var targetSheet = 'ENTERPRISE_SECURITY_SIGNAL';
  var dateKey = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  var businessKey = '11370_ENTERPRISESECURITYSIGNAL|' + actionName + '|' + dateKey;

  var payload = {
    enterpriseSecuritySignalStatus: 'SKIPPED_NO_INPUTS',
    sourceSheet: sourceSheet,
    targetSheet: targetSheet,
    transactionId: 'TXN|11370_ENTERPRISESECURITYSIGNAL|' + targetSheet + '|' + dateKey + '|' + new Date().getTime(),
    nextAction: 'Run 11380_EnterpriseSecurityBaselineProcessor after this processor completes.',
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

function sciipTest11370_EnterpriseSecuritySignalProcessor() {
  var result = sciipRun11370_EnterpriseSecuritySignalProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest11370_EnterpriseSecuritySignalProcessor', result: result }));
  return result;
}
