/*******************************************************
 * SCIIP Runtime Certification Suite
 * Permanent regression + certification harness
 *******************************************************/

const SCIIP_RUNTIME_CERTIFICATION_LEDGER_SHEET =
  'RUNTIME_CERTIFICATION_LEDGER';

function sciipRunRuntimeCertificationSuite() {
  const tests = sciipGetRuntimeCertificationTests_();
  const startedAt = new Date();
  const runId = 'RUNTIME_CERTIFICATION_' + Utilities.getUuid();

  const results = [];

  tests.forEach(function(item) {
    const testStartedAt = new Date();

    try {
      const result = item.fn();

      results.push({
        Run_ID: runId,
        Processor_ID: item.id,
        Test_Function: item.name,
        Processor: result.processor || '',
        Status: result.status || '',
        Errors: result.errors || 0,
        Duration_MS: new Date() - testStartedAt,
        Message: result.message || '',
        Completed_At: new Date().toISOString()
      });

      Logger.log('PASS: ' + item.id + ' — ' + item.name + ' — ' + result.status);

    } catch (e) {
      results.push({
        Run_ID: runId,
        Processor_ID: item.id,
        Test_Function: item.name,
        Processor: '',
        Status: 'ERROR',
        Errors: 1,
        Duration_MS: new Date() - testStartedAt,
        Message: e.stack || e.message,
        Completed_At: new Date().toISOString()
      });

      Logger.log('FAIL: ' + item.id + ' — ' + item.name);
      Logger.log(e.stack || e.message);

      throw e;
    }
  });

  sciipAppendRuntimeCertificationLedger_(results);

  const failed = results.filter(function(row) {
    return row.Status === 'ERROR' || Number(row.Errors || 0) > 0;
  });

  const summary = {
    certification: failed.length === 0 ? 'CERTIFIED' : 'FAILED',
    runId: runId,
    tested: results.length,
    passed: results.length - failed.length,
    failed: failed.length,
    startedAt: startedAt.toISOString(),
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(summary, null, 2));
  return summary;
}

function sciipRuntimeCertificationTest_(id, name) {
  const fn = this[name];

  if (typeof fn !== 'function') {
    throw new Error('Missing test function: ' + name);
  }

  return {
    id: id,
    name: name,
    fn: fn
  };
}

function sciipAppendRuntimeCertificationLedger_(rows) {
  const sheet = sciipEnsureRuntimeCertificationLedger_();

  rows.forEach(function(row) {
    sheet.appendRow([
      row.Run_ID,
      row.Processor_ID,
      row.Test_Function,
      row.Processor,
      row.Status,
      row.Errors,
      row.Duration_MS,
      row.Message,
      row.Completed_At
    ]);
  });
}

function sciipEnsureRuntimeCertificationLedger_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(SCIIP_RUNTIME_CERTIFICATION_LEDGER_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(SCIIP_RUNTIME_CERTIFICATION_LEDGER_SHEET);
    sheet.appendRow([
      'Run_ID',
      'Processor_ID',
      'Test_Function',
      'Processor',
      'Status',
      'Errors',
      'Duration_MS',
      'Message',
      'Completed_At'
    ]);
  }

  return sheet;
}

function sciipGetRuntimeCertificationTests_() {
  return [
    sciipRuntimeCertificationTest_(890, 'sciipTestAutonomousGovernanceMonitoringProcessor'),
    sciipRuntimeCertificationTest_(900, 'sciipTestAutonomousGovernanceReviewProcessor'),
    sciipRuntimeCertificationTest_(910, 'sciipTestAutonomousProcessorGuidanceProcessor'),
    sciipRuntimeCertificationTest_(920, 'sciipTestAutonomousProcessorExecutionPlanProcessor'),
    sciipRuntimeCertificationTest_(930, 'sciipTestAutonomousProcessorBuildTaskProcessor'),
    sciipRuntimeCertificationTest_(940, 'sciipTestAutonomousProcessorBuildValidationProcessor'),
    sciipRuntimeCertificationTest_(950, 'sciipTestAutonomousProcessorReadinessProcessor'),
    sciipRuntimeCertificationTest_(960, 'sciipTestAutonomousProcessorPromotionDecisionProcessor'),
    sciipRuntimeCertificationTest_(970, 'sciipTestAutonomousProcessorOrchestrationQueueProcessor'),
    sciipRuntimeCertificationTest_(980, 'sciipTestAutonomousProcessorExecutionMonitorProcessor'),
    sciipRuntimeCertificationTest_(990, 'sciipTestAutonomousProcessorExecutionReadinessProcessor'),
    sciipRuntimeCertificationTest_(1000, 'sciipTestAutonomousProcessorExecutionControlProcessor'),
    sciipRuntimeCertificationTest_(1010, 'sciipTestAutonomousProcessorExecutionDispatchProcessor'),
    sciipRuntimeCertificationTest_(1020, 'sciipTestAutonomousProcessorExecutionLedgerProcessor'),
    sciipRuntimeCertificationTest_(1030, 'sciipTestAutonomousProcessorExecutionOutcomeProcessor'),
    sciipRuntimeCertificationTest_(1040, 'sciipTestAutonomousProcessorExecutionSummaryProcessor')
  ];
}