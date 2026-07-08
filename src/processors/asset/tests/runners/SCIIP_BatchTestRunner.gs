/**
 * SCIIP_OS v5.5 / Testing Framework v1.1
 * File: SCIIP_BatchTestRunner.gs
 *
 * Purpose:
 * Convenience entry points for Apps Script execution menu/manual runs.
 */

function sciipTestBatch6210_6290_DomainFoundation() {
  return SCIIP_TEST.runDomainFoundation();
}

function sciipTestBatch6300_6380_DomainExecutionReadiness() {
  return SCIIP_TEST.runDomainExecutionReadiness();
}

function sciipTestBatch6390_6470_AssetRegistryExecutionReadiness() {
  return SCIIP_TEST.runSuite('AssetRegistryExecutionReadiness');
}

function sciipTestBatch6210_6470_DomainRegression() {
  return SCIIP_TEST.runSuite('DomainRegression');
}

function sciipTestBatch6210_6380_DomainRegression() {
  return SCIIP_TEST.runList(
    SCIIP_TEST_SUITES.DOMAIN_FOUNDATION.concat(SCIIP_TEST_SUITES.DOMAIN_EXECUTION_READINESS),
    'DomainRegression_6210_6380'
  );
}

function sciipTestRange6210_6290() {
  return SCIIP_TEST.runRange(6210, 6290);
}

function sciipTestRange6300_6380() {
  return SCIIP_TEST.runRange(6300, 6380);
}

function sciipTestRange6390_6470() {
  return SCIIP_TEST.runRange(6390, 6470);
}

function sciipTestRange6210_6470() {
  return SCIIP_TEST.runRange(6210, 6470);
}

function sciipTestFrameworkSmokeTest() {
  return SCIIP_TEST.runList([
    'sciipTest6210_DomainCapabilityExpansionReadinessProcessor'
  ], 'SCIIP_TestFrameworkSmokeTest');
}
