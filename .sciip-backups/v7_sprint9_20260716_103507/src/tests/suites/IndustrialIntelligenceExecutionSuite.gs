/**
 * SCIIP_OS v5.5
 * Testing Framework v4.3 Patch
 * Suite: Industrial Intelligence Execution (6960-7050)
 *
 * Purpose:
 * Provides explicit range wrappers for 6960-7050 without relying on the
 * Testing Framework discovery map. This avoids zero-test discovery results
 * when new processor ranges have not yet been added to discovery metadata.
 */

function sciipTestRange6960_7050() {
  return sciipRunExplicitIndustrialIntelligenceExecution6960_7050_();
}

function sciipTestBatch6960_7050_IndustrialIntelligenceExecution() {
  return sciipRunExplicitIndustrialIntelligenceExecution6960_7050_();
}

function sciipRunExplicitIndustrialIntelligenceExecution6960_7050_() {
  var suiteName = 'IndustrialIntelligenceExecution';
  var startedAt = new Date();
  var tests = [
    { processorNumber: 6960, testFunction: 'sciipTest6960_IndustrialIntelligenceExecutionReadinessProcessor' },
    { processorNumber: 6970, testFunction: 'sciipTest6970_MarketContextIntelligenceProcessor' },
    { processorNumber: 6980, testFunction: 'sciipTest6980_AssetIntelligenceEnrichmentProcessor' },
    { processorNumber: 6990, testFunction: 'sciipTest6990_IdentityIntelligenceEnrichmentProcessor' },
    { processorNumber: 7000, testFunction: 'sciipTest7000_GraphIntelligenceEnrichmentProcessor' },
    { processorNumber: 7010, testFunction: 'sciipTest7010_GISIntelligenceEnrichmentProcessor' },
    { processorNumber: 7020, testFunction: 'sciipTest7020_CrossDomainIntelligenceFusionProcessor' },
    { processorNumber: 7030, testFunction: 'sciipTest7030_IntelligenceValidationProcessor' },
    { processorNumber: 7040, testFunction: 'sciipTest7040_IntelligenceCertificationProcessor' },
    { processorNumber: 7050, testFunction: 'sciipTest7050_IntelligenceAcceptanceProcessor' }
  ];

  var results = [];
  var passed = 0;
  var failed = 0;
  var skippedNoInputs = 0;
  var duplicateSafeSuccess = 0;

  tests.forEach(function(testDef) {
    var testStartedAt = new Date();
    try {
      var fn = this[testDef.testFunction];
      if (typeof fn !== 'function') {
        throw new Error('Missing test function: ' + testDef.testFunction);
      }

      var processorResult = fn();
      var testCompletedAt = new Date();

      var processorStatus = processorResult && processorResult.status ? processorResult.status : 'UNKNOWN';
      var isPassed = processorStatus === 'SUCCESS' || processorStatus === 'SKIPPED_NO_INPUTS';

      if (isPassed) {
        passed += 1;
      } else {
        failed += 1;
      }

      if (processorStatus === 'SKIPPED_NO_INPUTS') {
        skippedNoInputs += 1;
      }

      if (
        processorStatus === 'SUCCESS' &&
        processorResult &&
        Number(processorResult.skippedDuplicate || 0) > 0
      ) {
        duplicateSafeSuccess += 1;
      }

      results.push({
        testFunction: testDef.testFunction,
        processorNumber: testDef.processorNumber,
        suite: suiteName,
        subsystem: 'intelligence',
        status: isPassed ? 'PASSED' : 'FAILED',
        processor: processorResult.processor,
        processorStatus: processorStatus,
        businessKey: processorResult.businessKey,
        recordsCreated: processorResult.recordsCreated,
        recordsUpdated: processorResult.recordsUpdated,
        recordsRead: processorResult.recordsRead,
        processed: processorResult.processed,
        skippedDuplicate: processorResult.skippedDuplicate,
        skippedNoInputs: processorResult.skippedNoInputs,
        skippedValidation: processorResult.skippedValidation,
        errors: processorResult.errors,
        message: processorResult.message,
        frameworkVersion: processorResult.frameworkVersion,
        startedAt: testStartedAt.toISOString(),
        completedAt: testCompletedAt.toISOString(),
        durationMs: testCompletedAt.getTime() - testStartedAt.getTime()
      });
    } catch (err) {
      var errorCompletedAt = new Date();
      failed += 1;
      results.push({
        testFunction: testDef.testFunction,
        processorNumber: testDef.processorNumber,
        suite: suiteName,
        subsystem: 'intelligence',
        status: 'FAILED',
        error: err && err.message ? err.message : String(err),
        startedAt: testStartedAt.toISOString(),
        completedAt: errorCompletedAt.toISOString(),
        durationMs: errorCompletedAt.getTime() - testStartedAt.getTime()
      });
    }
  }, this);

  var completedAt = new Date();
  var report = {
    framework: 'SCIIP_TEST_FRAMEWORK',
    frameworkVersion: 'v4.3',
    suiteName: suiteName,
    status: failed === 0 ? 'PASSED' : 'FAILED',
    testsDiscovered: tests.length,
    testsRun: tests.length,
    testsPassed: passed,
    testsFailed: failed,
    skippedNoInputs: skippedNoInputs,
    duplicateSafeSuccess: duplicateSafeSuccess,
    missingProcessorNumbers: [],
    startedAt: startedAt.toISOString(),
    completedAt: completedAt.toISOString(),
    durationMs: completedAt.getTime() - startedAt.getTime(),
    results: results
  };

  Logger.log(JSON.stringify(report));
  return report;
}
