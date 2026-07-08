/**
 * SCIIP_OS v5.5 / Testing Framework v1
 * File: SCIIP_TestFramework.gs
 *
 * Purpose:
 * Provides a first-class testing namespace for SCIIP_OS processor validation.
 * This framework is intentionally separate from production processors.
 */

var SCIIP_TEST = SCIIP_TEST || {};

SCIIP_TEST.VERSION = 'v1.0';
SCIIP_TEST.FRAMEWORK = 'SCIIP_TEST_FRAMEWORK';

SCIIP_TEST.runFunction = function(functionName) {
  var startedAt = new Date();

  try {
    if (!functionName || typeof functionName !== 'string') {
      return SCIIP_TEST_RESULT_FACTORY.failure({
        functionName: functionName || 'UNKNOWN',
        error: 'Missing or invalid test function name.',
        startedAt: startedAt
      });
    }

    var fn = this.resolveFunction(functionName);

    if (typeof fn !== 'function') {
      return SCIIP_TEST_RESULT_FACTORY.failure({
        functionName: functionName,
        error: 'Test function not found: ' + functionName,
        startedAt: startedAt
      });
    }

    var processorResult = fn();

    return SCIIP_TEST_RESULT_FACTORY.fromProcessorResult({
      functionName: functionName,
      processorResult: processorResult,
      startedAt: startedAt
    });
  } catch (err) {
    return SCIIP_TEST_RESULT_FACTORY.failure({
      functionName: functionName,
      error: err && err.stack ? err.stack : String(err),
      startedAt: startedAt
    });
  }
};

SCIIP_TEST.resolveFunction = function(functionName) {
  try {
    return Function('return (typeof ' + functionName + ' !== "undefined") ? ' + functionName + ' : null;')();
  } catch (err) {
    return null;
  }
};

SCIIP_TEST.runList = function(functionNames, suiteName) {
  var startedAt = new Date();
  var results = [];

  (functionNames || []).forEach(function(functionName) {
    results.push(SCIIP_TEST.runFunction(functionName));
  });

  return SCIIP_TEST_RESULT_FACTORY.suite({
    suiteName: suiteName || 'SCIIP_TEST_LIST',
    results: results,
    startedAt: startedAt
  });
};

SCIIP_TEST.runRange = function(startProcessorNumber, endProcessorNumber) {
  var suite = SCIIP_TEST_SUITES.getRangeSuite(startProcessorNumber, endProcessorNumber);
  return SCIIP_TEST.runList(suite.tests, suite.name);
};

SCIIP_TEST.runSuite = function(suiteName) {
  var suite = SCIIP_TEST_SUITES.getSuite(suiteName);
  return SCIIP_TEST.runList(suite.tests, suite.name);
};

SCIIP_TEST.runDomainFoundation = function() {
  return SCIIP_TEST.runSuite('DomainFoundation');
};

SCIIP_TEST.runDomainExecutionReadiness = function() {
  return SCIIP_TEST.runSuite('DomainExecutionReadiness');
};

SCIIP_TEST.runRegression = function() {
  return SCIIP_TEST.runSuite('DomainRegression');
};
