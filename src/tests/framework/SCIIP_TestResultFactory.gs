/**
 * SCIIP_OS v5.5 / Testing Framework v1
 * File: SCIIP_TestResultFactory.gs
 */

var SCIIP_TEST_RESULT_FACTORY = SCIIP_TEST_RESULT_FACTORY || {};

SCIIP_TEST_RESULT_FACTORY.fromProcessorResult = function(args) {
  var completedAt = new Date();
  var processorResult = args.processorResult || {};
  var status = String(processorResult.status || '').toUpperCase();
  var passed = status === 'SUCCESS' || status.indexOf('SKIPPED') === 0;

  return {
    testFunction: args.functionName,
    status: passed ? 'PASSED' : 'FAILED',
    processor: processorResult.processor || '',
    processorStatus: processorResult.status || 'UNKNOWN',
    businessKey: processorResult.businessKey || '',
    recordsCreated: Number(processorResult.recordsCreated || 0),
    recordsUpdated: Number(processorResult.recordsUpdated || 0),
    recordsRead: Number(processorResult.recordsRead || 0),
    skippedDuplicate: Number(processorResult.skippedDuplicate || 0),
    skippedNoInputs: Number(processorResult.skippedNoInputs || 0),
    skippedValidation: Number(processorResult.skippedValidation || 0),
    errors: Number(processorResult.errors || 0),
    message: processorResult.message || '',
    frameworkVersion: processorResult.frameworkVersion || '',
    startedAt: args.startedAt,
    completedAt: completedAt,
    durationMs: completedAt.getTime() - args.startedAt.getTime()
  };
};

SCIIP_TEST_RESULT_FACTORY.failure = function(args) {
  var completedAt = new Date();

  return {
    testFunction: args.functionName,
    status: 'FAILED',
    processor: '',
    processorStatus: 'ERROR',
    businessKey: '',
    recordsCreated: 0,
    recordsUpdated: 0,
    recordsRead: 0,
    skippedDuplicate: 0,
    skippedNoInputs: 0,
    skippedValidation: 0,
    errors: 1,
    message: args.error || 'Unknown test failure.',
    frameworkVersion: SCIIP_TEST.VERSION || 'v1.0',
    startedAt: args.startedAt,
    completedAt: completedAt,
    durationMs: completedAt.getTime() - args.startedAt.getTime()
  };
};

SCIIP_TEST_RESULT_FACTORY.suite = function(args) {
  var completedAt = new Date();
  var results = args.results || [];
  var passed = results.filter(function(r) { return r.status === 'PASSED'; }).length;
  var failed = results.filter(function(r) { return r.status !== 'PASSED'; }).length;

  var output = {
    framework: 'SCIIP_TEST_FRAMEWORK',
    frameworkVersion: SCIIP_TEST.VERSION || 'v1.0',
    suiteName: args.suiteName,
    status: failed === 0 ? 'PASSED' : 'FAILED',
    testsRun: results.length,
    testsPassed: passed,
    testsFailed: failed,
    startedAt: args.startedAt,
    completedAt: completedAt,
    durationMs: completedAt.getTime() - args.startedAt.getTime(),
    results: results
  };

  Logger.log(JSON.stringify(output));
  return output;
};
