/**
 * SCIIP_OS v5.5
 * File: SCIIP_OS_DomainBatchTestRunner.gs
 *
 * Purpose:
 * Batch test runner for SCIIP_OS processor ranges.
 *
 * Design:
 * - Runs processor test functions in sequence
 * - Captures SUCCESS / SKIPPED / ERROR outcomes
 * - Does not mutate runtime behavior beyond executing existing test functions
 * - Produces a compact batch result object
 * - Logs each processor result and final summary
 *
 * Recommended location:
 * src/processors/domain/SCIIP_OS_DomainBatchTestRunner.gs
 */

/**
 * Batch test 6300-6380 Domain Execution Readiness processors.
 */
function sciipTestBatch6300_6380_DomainExecutionReadiness() {
  return sciipRunProcessorTestBatch_({
    batchName: 'v5.5 Domain Execution Readiness 6300-6380',
    expectedCount: 9,
    tests: [
      { processor: '6300_DomainExecutionReadiness', testFunction: 'sciipTest6300_DomainExecutionReadinessProcessor' },
      { processor: '6310_AssetDomainExecutionPlan', testFunction: 'sciipTest6310_AssetDomainExecutionPlanProcessor' },
      { processor: '6320_SuperSheetDomainExecutionPlan', testFunction: 'sciipTest6320_SuperSheetDomainExecutionPlanProcessor' },
      { processor: '6330_IdentityDomainExecutionPlan', testFunction: 'sciipTest6330_IdentityDomainExecutionPlanProcessor' },
      { processor: '6340_GraphDomainExecutionPlan', testFunction: 'sciipTest6340_GraphDomainExecutionPlanProcessor' },
      { processor: '6350_GISDomainExecutionPlan', testFunction: 'sciipTest6350_GISDomainExecutionPlanProcessor' },
      { processor: '6360_DomainExecutionCoordinationLedger', testFunction: 'sciipTest6360_DomainExecutionCoordinationLedgerProcessor' },
      { processor: '6370_DomainExecutionHandoff', testFunction: 'sciipTest6370_DomainExecutionHandoffProcessor' },
      { processor: '6380_DomainExecutionAcceptance', testFunction: 'sciipTest6380_DomainExecutionAcceptanceProcessor' }
    ]
  });
}

/**
 * Batch test 6210-6290 Domain Foundation processors.
 */
function sciipTestBatch6210_6290_DomainFoundation() {
  return sciipRunProcessorTestBatch_({
    batchName: 'v5.5 Domain Foundation 6210-6290',
    expectedCount: 9,
    tests: [
      { processor: '6210_DomainCapabilityExpansionReadiness', testFunction: 'sciipTest6210_DomainCapabilityExpansionReadinessProcessor' },
      { processor: '6220_DomainCapabilityRegistry', testFunction: 'sciipTest6220_DomainCapabilityRegistryProcessor' },
      { processor: '6230_DomainCapabilityExecutionLedger', testFunction: 'sciipTest6230_DomainCapabilityExecutionLedgerProcessor' },
      { processor: '6240_AssetDomainCapabilityActivation', testFunction: 'sciipTest6240_AssetDomainCapabilityActivationProcessor' },
      { processor: '6250_SuperSheetDomainCapabilityActivation', testFunction: 'sciipTest6250_SuperSheetDomainCapabilityActivationProcessor' },
      { processor: '6260_IdentityDomainCapabilityActivation', testFunction: 'sciipTest6260_IdentityDomainCapabilityActivationProcessor' },
      { processor: '6270_GraphDomainCapabilityActivation', testFunction: 'sciipTest6270_GraphDomainCapabilityActivationProcessor' },
      { processor: '6280_GISDomainCapabilityActivation', testFunction: 'sciipTest6280_GISDomainCapabilityActivationProcessor' },
      { processor: '6290_DomainCapabilityAcceptance', testFunction: 'sciipTest6290_DomainCapabilityAcceptanceProcessor' }
    ]
  });
}

/**
 * Combined v5.5 domain smoke test through 6380.
 */
function sciipTestBatch6210_6380_DomainFoundationAndExecutionReadiness() {
  return sciipRunProcessorTestBatch_({
    batchName: 'v5.5 Domain Foundation + Execution Readiness 6210-6380',
    expectedCount: 18,
    tests: [
      { processor: '6210_DomainCapabilityExpansionReadiness', testFunction: 'sciipTest6210_DomainCapabilityExpansionReadinessProcessor' },
      { processor: '6220_DomainCapabilityRegistry', testFunction: 'sciipTest6220_DomainCapabilityRegistryProcessor' },
      { processor: '6230_DomainCapabilityExecutionLedger', testFunction: 'sciipTest6230_DomainCapabilityExecutionLedgerProcessor' },
      { processor: '6240_AssetDomainCapabilityActivation', testFunction: 'sciipTest6240_AssetDomainCapabilityActivationProcessor' },
      { processor: '6250_SuperSheetDomainCapabilityActivation', testFunction: 'sciipTest6250_SuperSheetDomainCapabilityActivationProcessor' },
      { processor: '6260_IdentityDomainCapabilityActivation', testFunction: 'sciipTest6260_IdentityDomainCapabilityActivationProcessor' },
      { processor: '6270_GraphDomainCapabilityActivation', testFunction: 'sciipTest6270_GraphDomainCapabilityActivationProcessor' },
      { processor: '6280_GISDomainCapabilityActivation', testFunction: 'sciipTest6280_GISDomainCapabilityActivationProcessor' },
      { processor: '6290_DomainCapabilityAcceptance', testFunction: 'sciipTest6290_DomainCapabilityAcceptanceProcessor' },
      { processor: '6300_DomainExecutionReadiness', testFunction: 'sciipTest6300_DomainExecutionReadinessProcessor' },
      { processor: '6310_AssetDomainExecutionPlan', testFunction: 'sciipTest6310_AssetDomainExecutionPlanProcessor' },
      { processor: '6320_SuperSheetDomainExecutionPlan', testFunction: 'sciipTest6320_SuperSheetDomainExecutionPlanProcessor' },
      { processor: '6330_IdentityDomainExecutionPlan', testFunction: 'sciipTest6330_IdentityDomainExecutionPlanProcessor' },
      { processor: '6340_GraphDomainExecutionPlan', testFunction: 'sciipTest6340_GraphDomainExecutionPlanProcessor' },
      { processor: '6350_GISDomainExecutionPlan', testFunction: 'sciipTest6350_GISDomainExecutionPlanProcessor' },
      { processor: '6360_DomainExecutionCoordinationLedger', testFunction: 'sciipTest6360_DomainExecutionCoordinationLedgerProcessor' },
      { processor: '6370_DomainExecutionHandoff', testFunction: 'sciipTest6370_DomainExecutionHandoffProcessor' },
      { processor: '6380_DomainExecutionAcceptance', testFunction: 'sciipTest6380_DomainExecutionAcceptanceProcessor' }
    ]
  });
}

/**
 * Generic sequential test batch executor.
 *
 * A processor is considered passing when its returned result status is:
 * - SUCCESS
 * - SKIPPED_NO_INPUTS
 *
 * JavaScript exceptions are captured as ERROR without stopping the batch.
 */
function sciipRunProcessorTestBatch_(config) {
  var startedAt = new Date();
  var results = [];
  var passed = 0;
  var failed = 0;
  var skippedNoInputs = 0;
  var duplicateSafeSuccess = 0;

  var tests = config.tests || [];

  tests.forEach(function(test, index) {
    var row = {
      index: index + 1,
      processor: test.processor,
      testFunction: test.testFunction,
      outcome: 'UNKNOWN',
      status: null,
      businessKey: null,
      recordsCreated: null,
      skippedDuplicate: null,
      skippedNoInputs: null,
      errors: null,
      message: null,
      completedAt: null
    };

    try {
      var fn = this[test.testFunction];

      if (typeof fn !== 'function') {
        throw new Error('Missing test function: ' + test.testFunction);
      }

      var result = fn();
      row.status = result && result.status ? result.status : 'NO_STATUS_RETURNED';
      row.businessKey = result && result.businessKey ? result.businessKey : null;
      row.recordsCreated = result && typeof result.recordsCreated !== 'undefined' ? result.recordsCreated : null;
      row.skippedDuplicate = result && typeof result.skippedDuplicate !== 'undefined' ? result.skippedDuplicate : null;
      row.skippedNoInputs = result && typeof result.skippedNoInputs !== 'undefined' ? result.skippedNoInputs : null;
      row.errors = result && typeof result.errors !== 'undefined' ? result.errors : null;
      row.message = result && result.message ? result.message : null;
      row.completedAt = result && result.completedAt ? result.completedAt : new Date();

      if (row.status === 'SUCCESS') {
        row.outcome = 'PASS';
        passed += 1;
        if (row.skippedDuplicate && row.skippedDuplicate > 0) {
          duplicateSafeSuccess += 1;
        }
      } else if (row.status === 'SKIPPED_NO_INPUTS') {
        row.outcome = 'PASS_SKIP_SAFE';
        passed += 1;
        skippedNoInputs += 1;
      } else {
        row.outcome = 'FAIL';
        failed += 1;
      }
    } catch (error) {
      row.outcome = 'ERROR';
      row.status = 'ERROR';
      row.errors = 1;
      row.message = error && error.stack ? error.stack : String(error);
      row.completedAt = new Date();
      failed += 1;
    }

    Logger.log(JSON.stringify({
      batch: config.batchName,
      processor: row.processor,
      testFunction: row.testFunction,
      outcome: row.outcome,
      status: row.status,
      businessKey: row.businessKey,
      recordsCreated: row.recordsCreated,
      skippedDuplicate: row.skippedDuplicate,
      message: row.message
    }));

    results.push(row);
  }, this);

  var completedAt = new Date();
  var batchResult = {
    batchName: config.batchName,
    status: failed === 0 ? 'SUCCESS' : 'FAILED',
    expectedCount: config.expectedCount || tests.length,
    testsRun: tests.length,
    passed: passed,
    failed: failed,
    skippedNoInputs: skippedNoInputs,
    duplicateSafeSuccess: duplicateSafeSuccess,
    startedAt: startedAt,
    completedAt: completedAt,
    results: results
  };

  Logger.log(JSON.stringify({
    test: 'sciipRunProcessorTestBatch_',
    result: batchResult
  }));

  return batchResult;
}
