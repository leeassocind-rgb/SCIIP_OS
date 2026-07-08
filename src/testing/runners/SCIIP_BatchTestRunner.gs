/**
 * SCIIP_OS v5.5 / Testing Framework v1
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

function sciipTestBatch6210_6380_DomainRegression() {
  return SCIIP_TEST.runRegression();
}

function sciipTestRange6210_6290() {
  return SCIIP_TEST.runRange(6210, 6290);
}

function sciipTestRange6300_6380() {
  return SCIIP_TEST.runRange(6300, 6380);
}

function sciipTestRange6210_6380() {
  return SCIIP_TEST.runRange(6210, 6380);
}

function sciipTestFrameworkSmokeTest() {
  return SCIIP_TEST.runList([
    'sciipTest6210_DomainCapabilityExpansionReadinessProcessor'
  ], 'SCIIP_TestFrameworkSmokeTest');
}
