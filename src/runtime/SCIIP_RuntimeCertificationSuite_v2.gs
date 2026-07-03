/*******************************************************
 * SCIIP Runtime Certification Suite v2.1
 * Registry-based runtime certification.
 *******************************************************/

function sciipRunRuntimeCertificationSuiteV2() {
  const startedAt = new Date();
  const runId = 'RUNTIME_CERTIFICATION_V2_' + Utilities.getUuid();
  const tests = sciipGetRuntimeCertificationTestRegistry();

  const results = [];

  tests.forEach(function(item) {
    const testStartedAt = new Date();

    try {
      const result = item.fn();

      const row = {
        Run_ID: runId,
        Processor_ID: item.id,
        Test_Function: item.name,
        Processor: result.processor || '',
        Status: result.status || '',
        Errors: Number(result.errors || 0),
        Duration_MS: new Date() - testStartedAt,
        Message: result.message || '',
        Completed_At: new Date().toISOString()
      };

      results.push(row);
      Logger.log('PASS: ' + item.id + ' — ' + item.name + ' — ' + row.Status);

    } catch (e) {
      const row = {
        Run_ID: runId,
        Processor_ID: item.id,
        Test_Function: item.name,
        Processor: '',
        Status: 'ERROR',
        Errors: 1,
        Duration_MS: new Date() - testStartedAt,
        Message: e.stack || e.message,
        Completed_At: new Date().toISOString()
      };

      results.push(row);
      Logger.log('FAIL: ' + item.id + ' — ' + item.name);
      Logger.log(e.stack || e.message);
      throw e;
    }
  });

  sciipAppendRuntimeCertificationSuiteV2Ledger_(results);

  const failed = results.filter(function(row) {
    return row.Status === 'ERROR' || Number(row.Errors || 0) > 0;
  });

  const summary = {
    certification: failed.length === 0 ? 'CERTIFIED' : 'FAILED',
    runId: runId,
    processorsTested: results.length,
    processorsPassed: results.length - failed.length,
    processorsFailed: failed.length,
    startedAt: startedAt.toISOString(),
    completedAt: new Date().toISOString()
  };

  sciipRecordSystemCertification(summary);

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

function sciipAppendRuntimeCertificationSuiteV2Ledger_(rows) {
  const sheet = sciipEnsureRuntimeCertificationSuiteV2Ledger_();

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

function sciipEnsureRuntimeCertificationSuiteV2Ledger_() {
  const ss = sciipGetSpreadsheet_();
  const sheetName = 'RUNTIME_CERTIFICATION_SUITE_LEDGER';

  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
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