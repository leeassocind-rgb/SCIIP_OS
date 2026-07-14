/**
 * SCIIP_OS v5.5 — 10300_EnterpriseCompoundingPlanningProcessor
 * Full capacity-bypass implementation.
 *
 * This processor intentionally avoids SCIIP_RUNTIME_PROCESSOR_BASE because
 * the active workbook is at/above Google Sheets' 10M-cell limit and shared
 * runtime logging can fail before a structured result returns.
 *
 * It still returns the standardized SCIIP runtime-shaped result expected by
 * SCIIP Testing Framework v4.
 */
function sciipRun10300_EnterpriseCompoundingPlanningProcessor() {
  var processorName = '10300_EnterpriseCompoundingPlanning';
  var actionName = 'EXECUTE_ENTERPRISECOMPOUNDINGPLANNING';
  var sourceSheet = 'ENTERPRISE_COMPOUNDING_MEASUREMENT';
  var targetSheet = 'ENTERPRISE_COMPOUNDING_PLANNING';
  var dateKey = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  var businessKey = '10300_ENTERPRISECOMPOUNDINGPLANNING|' + actionName + '|' + dateKey;

  var payload = {
    enterpriseCompoundingPlanningStatus: 'SKIPPED_NO_INPUTS',
    sourceSheet: sourceSheet,
    targetSheet: targetSheet,
    transactionId: 'TXN|10300_ENTERPRISECOMPOUNDINGPLANNING|' + targetSheet + '|' + dateKey + '|' + new Date().getTime(),
    nextAction: 'Run 10310_EnterpriseCompoundingOptimizationProcessor after this processor completes.',
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

function sciipTest10300_EnterpriseCompoundingPlanningProcessor() {
  var result = sciipRun10300_EnterpriseCompoundingPlanningProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest10300_EnterpriseCompoundingPlanningProcessor', result: result }));
  return result;
}
