/**
 * SCIIP_OS v5.5 / Testing Framework v1
 * File: SCIIP_TestSuites.gs
 */

var SCIIP_TEST_SUITES = SCIIP_TEST_SUITES || {};

SCIIP_TEST_SUITES.DOMAIN_FOUNDATION = [
  'sciipTest6210_DomainCapabilityExpansionReadinessProcessor',
  'sciipTest6220_DomainCapabilityRegistryProcessor',
  'sciipTest6230_DomainCapabilityExecutionLedgerProcessor',
  'sciipTest6240_AssetDomainCapabilityActivationProcessor',
  'sciipTest6250_SuperSheetDomainCapabilityActivationProcessor',
  'sciipTest6260_IdentityDomainCapabilityActivationProcessor',
  'sciipTest6270_GraphDomainCapabilityActivationProcessor',
  'sciipTest6280_GISDomainCapabilityActivationProcessor',
  'sciipTest6290_DomainCapabilityAcceptanceProcessor'
];

SCIIP_TEST_SUITES.DOMAIN_EXECUTION_READINESS = [
  'sciipTest6300_DomainExecutionReadinessProcessor',
  'sciipTest6310_AssetDomainExecutionPlanProcessor',
  'sciipTest6320_SuperSheetDomainExecutionPlanProcessor',
  'sciipTest6330_IdentityDomainExecutionPlanProcessor',
  'sciipTest6340_GraphDomainExecutionPlanProcessor',
  'sciipTest6350_GISDomainExecutionPlanProcessor',
  'sciipTest6360_DomainExecutionCoordinationLedgerProcessor',
  'sciipTest6370_DomainExecutionHandoffProcessor',
  'sciipTest6380_DomainExecutionAcceptanceProcessor'
];

SCIIP_TEST_SUITES.getSuite = function(suiteName) {
  var key = String(suiteName || '').toLowerCase();

  if (key === 'domainfoundation' || key === 'domain_foundation' || key === '6210-6290') {
    return {
      name: 'DomainFoundation',
      tests: SCIIP_TEST_SUITES.DOMAIN_FOUNDATION
    };
  }

  if (key === 'domainexecutionreadiness' || key === 'domain_execution_readiness' || key === '6300-6380') {
    return {
      name: 'DomainExecutionReadiness',
      tests: SCIIP_TEST_SUITES.DOMAIN_EXECUTION_READINESS
    };
  }

  if (key === 'domainregression' || key === 'domain_regression' || key === '6210-6380') {
    return {
      name: 'DomainRegression',
      tests: SCIIP_TEST_SUITES.DOMAIN_FOUNDATION.concat(SCIIP_TEST_SUITES.DOMAIN_EXECUTION_READINESS)
    };
  }

  return {
    name: suiteName || 'UnknownSuite',
    tests: []
  };
};

SCIIP_TEST_SUITES.getRangeSuite = function(startProcessorNumber, endProcessorNumber) {
  var start = Number(startProcessorNumber);
  var end = Number(endProcessorNumber);
  var all = SCIIP_TEST_SUITES.DOMAIN_FOUNDATION.concat(SCIIP_TEST_SUITES.DOMAIN_EXECUTION_READINESS);
  var tests = all.filter(function(functionName) {
    var match = functionName.match(/sciipTest(\d{4})_/);
    if (!match) return false;
    var n = Number(match[1]);
    return n >= start && n <= end;
  });

  return {
    name: 'ProcessorRange_' + start + '_' + end,
    tests: tests
  };
};
