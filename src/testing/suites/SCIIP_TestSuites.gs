/**
 * SCIIP_OS v5.5 / Testing Framework v3
 * File: SCIIP_TestSuites.gs
 *
 * Purpose:
 * Named suite convenience functions.
 */

function sciipTestSuiteDomainFoundation() {
  return SCIIP_TEST.runSuite('DomainFoundation');
}

function sciipTestSuiteDomainExecutionReadiness() {
  return SCIIP_TEST.runSuite('DomainExecutionReadiness');
}

function sciipTestSuiteAssetRegistryExecutionReadiness() {
  return SCIIP_TEST.runSuite('AssetRegistryExecutionReadiness');
}

function sciipTestSuiteAssetRegistryExecution() {
  return SCIIP_TEST.runSuite('AssetRegistryExecution');
}

function sciipTestSuiteAssetDataExecution() {
  return SCIIP_TEST.runSuite('AssetDataExecution');
}
