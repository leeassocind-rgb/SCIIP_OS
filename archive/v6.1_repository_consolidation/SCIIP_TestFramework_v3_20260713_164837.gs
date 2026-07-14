/**
 * SCIIP_OS v5.5 / Testing Framework v3
 * File: SCIIP_TestFramework.gs
 *
 * Purpose:
 * Reusable SCIIP_OS processor test framework with registry-based range,
 * suite, subsystem, explicit-number execution, and ad hoc function lists.
 */

var SCIIP_TEST = SCIIP_TEST || {};

SCIIP_TEST.VERSION = 'v3.0';
SCIIP_TEST.FRAMEWORK = 'SCIIP_TEST_FRAMEWORK';

SCIIP_TEST.resolveFunction = function(functionName) {
  try {
    return Function('return (typeof ' + functionName + ' !== "undefined") ? ' + functionName + ' : null;')();
  } catch (err) {
    return null;
  }
};

SCIIP_TEST.runFunction = function(functionName, metadata) {
  var startedAt = new Date();
  var meta = metadata || {};

  try {
    if (!functionName || typeof functionName !== 'string') {
      return SCIIP_TEST_RESULT_FACTORY.failure({
        functionName: functionName || 'UNKNOWN',
        processorNumber: meta.number,
        processor: meta.processor,
        suite: meta.suite,
        subsystem: meta.subsystem,
        error: 'Missing or invalid test function name.',
        startedAt: startedAt
      });
    }

    var fn = SCIIP_TEST.resolveFunction(functionName);

    if (typeof fn !== 'function') {
      return SCIIP_TEST_RESULT_FACTORY.failure({
        functionName: functionName,
        processorNumber: meta.number,
        processor: meta.processor,
        suite: meta.suite,
        subsystem: meta.subsystem,
        error: 'Test function not found: ' + functionName,
        startedAt: startedAt
      });
    }

    var processorResult = fn();

    return SCIIP_TEST_RESULT_FACTORY.fromProcessorResult({
      functionName: functionName,
      processorNumber: meta.number,
      processor: meta.processor,
      suite: meta.suite,
      subsystem: meta.subsystem,
      processorResult: processorResult,
      startedAt: startedAt
    });
  } catch (err) {
    return SCIIP_TEST_RESULT_FACTORY.failure({
      functionName: functionName,
      processorNumber: meta.number,
      processor: meta.processor,
      suite: meta.suite,
      subsystem: meta.subsystem,
      error: err && err.stack ? err.stack : String(err),
      startedAt: startedAt
    });
  }
};

SCIIP_TEST.runTests = function(tests, suiteName) {
  var startedAt = new Date();
  var results = [];

  (tests || []).forEach(function(test) {
    results.push(SCIIP_TEST.runFunction(test.testFunction, test));
  });

  return SCIIP_TEST_RESULT_FACTORY.suite({
    suiteName: suiteName || 'SCIIP_TEST_SUITE',
    results: results,
    startedAt: startedAt
  });
};

SCIIP_TEST.runList = function(functionNames, suiteName) {
  var tests = (functionNames || []).map(function(functionName) {
    return { testFunction: functionName };
  });
  return SCIIP_TEST.runTests(tests, suiteName || 'SCIIP_TEST_LIST');
};

SCIIP_TEST.runRange = function(startProcessorNumber, endProcessorNumber) {
  var tests = SCIIP_TEST_REGISTRY.byRange(startProcessorNumber, endProcessorNumber);
  return SCIIP_TEST.runTests(tests, 'ProcessorRange_' + startProcessorNumber + '_' + endProcessorNumber);
};

SCIIP_TEST.runProcessors = function(processorNumbers) {
  var tests = SCIIP_TEST_REGISTRY.byNumbers(processorNumbers || []);
  return SCIIP_TEST.runTests(tests, 'ProcessorList_' + (processorNumbers || []).join('_'));
};

SCIIP_TEST.runSuite = function(suiteName) {
  var tests = SCIIP_TEST_REGISTRY.bySuite(suiteName);
  return SCIIP_TEST.runTests(tests, suiteName || 'SCIIP_TEST_SUITE');
};

SCIIP_TEST.runSubsystem = function(subsystemName) {
  var tests = SCIIP_TEST_REGISTRY.bySubsystem(subsystemName);
  return SCIIP_TEST.runTests(tests, 'Subsystem_' + subsystemName);
};

SCIIP_TEST.runDomainFoundation = function() { return SCIIP_TEST.runSuite('DomainFoundation'); };
SCIIP_TEST.runDomainExecutionReadiness = function() { return SCIIP_TEST.runSuite('DomainExecutionReadiness'); };
SCIIP_TEST.runAssetRegistryExecutionReadiness = function() { return SCIIP_TEST.runSuite('AssetRegistryExecutionReadiness'); };
SCIIP_TEST.runAssetRegistryExecution = function() { return SCIIP_TEST.runSuite('AssetRegistryExecution'); };
SCIIP_TEST.runAssetDataExecution = function() { return SCIIP_TEST.runSuite('AssetDataExecution'); };
SCIIP_TEST.runRegression = function() { return SCIIP_TEST.runSuite('DomainRegression'); };
SCIIP_TEST.describe = function() { return SCIIP_TEST_REGISTRY.describe(); };

function sciipTestFrameworkRegistryReport() {
  return SCIIP_TEST.describe();
}

function sciipTestRange6560_6650() {
  return SCIIP_TEST.runRange(6560, 6650);
}

function sciipTestBatch6560_6650_AssetDataExecution() {
  return SCIIP_TEST.runSuite('AssetDataExecution');
}

function sciipTestSubsystemAsset() {
  return SCIIP_TEST.runSubsystem('asset');
}
