/*******************************************************
 * SCIIP Runtime Certification Suite v2.0
 * Certifies validated runtime migration batches.
 *******************************************************/

function sciipRunRuntimeCertificationSuiteV2() {
  const startedAt = new Date();
  const runId = 'RUNTIME_CERTIFICATION_V2_' + Utilities.getUuid();

  const batches = [
    { name: '890_1040', fn: sciipBatchValidateRuntimeMigration_890_1040 },
    { name: '1050_1200', fn: sciipBatchValidateRuntimeMigration_1050_1200 },
    { name: '1210_1500', fn: sciipBatchValidateRuntimeMigration_1210_1500 },
    { name: '1510_1800', fn: sciipBatchValidateRuntimeMigration_1510_1800 },
    { name: '1810_2090', fn: sciipBatchValidateRuntimeMigration_1810_2090 },
    { name: '2460_2720', fn: sciipBatchValidateRuntimeMigration_2460_2720 }
  ];

  const batchResults = [];

  batches.forEach(function(batch) {
    const batchStartedAt = new Date();

    try {
      const result = batch.fn();

      batchResults.push({
        Run_ID: runId,
        Batch: batch.name,
        Status: result.failed === 0 ? 'PASS' : 'FAIL',
        Tested: result.tested || 0,
        Passed: result.passed || 0,
        Failed: result.failed || 0,
        Duration_MS: new Date() - batchStartedAt,
        Completed_At: new Date().toISOString()
      });

      Logger.log('PASS BATCH: ' + batch.name);

    } catch (e) {
      batchResults.push({
        Run_ID: runId,
        Batch: batch.name,
        Status: 'ERROR',
        Tested: 0,
        Passed: 0,
        Failed: 1,
        Duration_MS: new Date() - batchStartedAt,
        Completed_At: new Date().toISOString(),
        Error: e.stack || e.message
      });

      throw e;
    }
  });

  sciipAppendRuntimeCertificationSuiteV2Ledger_(batchResults);

  const failed = batchResults.filter(function(row) {
    return row.Status !== 'PASS';
  });

  const summary = {
    certification: failed.length === 0 ? 'CERTIFIED' : 'FAILED',
    runId: runId,
    batchesTested: batchResults.length,
    processorsTested: batchResults.reduce(function(sum, row) {
      return sum + Number(row.Tested || 0);
    }, 0),
    processorsPassed: batchResults.reduce(function(sum, row) {
      return sum + Number(row.Passed || 0);
    }, 0),
    processorsFailed: batchResults.reduce(function(sum, row) {
      return sum + Number(row.Failed || 0);
    }, 0),
    startedAt: startedAt.toISOString(),
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(summary, null, 2));
  return summary;
}

function sciipAppendRuntimeCertificationSuiteV2Ledger_(rows) {
  const sheet = sciipEnsureRuntimeCertificationSuiteV2Ledger_();

  rows.forEach(function(row) {
    sheet.appendRow([
      row.Run_ID,
      row.Batch,
      row.Status,
      row.Tested,
      row.Passed,
      row.Failed,
      row.Duration_MS,
      row.Completed_At,
      row.Error || ''
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
      'Batch',
      'Status',
      'Tested',
      'Passed',
      'Failed',
      'Duration_MS',
      'Completed_At',
      'Error'
    ]);
  }

  return sheet;
}