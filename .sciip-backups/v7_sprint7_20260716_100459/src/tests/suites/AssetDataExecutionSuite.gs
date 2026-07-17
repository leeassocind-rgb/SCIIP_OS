/**
 * SCIIP Testing Framework v2.2 - Asset Execution Suite Extension
 */

function sciipTestRange6560_6650() {
  return SCIIP_TEST.runRange(6560, 6650);
}

function sciipTestBatch6560_6650_AssetDataExecution() {
  return SCIIP_TEST.runSuite('AssetDataExecution');
}

function sciipRegisterAssetDataExecutionSuite_() {
  if (typeof SCIIP_TEST === 'undefined') return;
  if (!SCIIP_TEST.SUITES) SCIIP_TEST.SUITES = {};
  SCIIP_TEST.SUITES.AssetDataExecution = {
    name: 'AssetDataExecution',
    subsystem: 'asset',
    startProcessor: 6560,
    endProcessor: 6650,
    tests: [
      'sciipTest6560_AssetDiscoveryImportProcessor',
      'sciipTest6570_AssetIdentityResolutionProcessor',
      'sciipTest6580_AssetCreationProcessor',
      'sciipTest6590_AssetAddressBindingProcessor',
      'sciipTest6600_AssetRegistryPopulationProcessor',
      'sciipTest6610_AssetEventGenerationProcessor',
      'sciipTest6620_AssetGraphNodeCreationProcessor',
      'sciipTest6630_AssetGISBindingProcessor',
      'sciipTest6640_AssetExecutionCertificationProcessor',
      'sciipTest6650_AssetAcceptanceProcessor'
    ]
  };
}

sciipRegisterAssetDataExecutionSuite_();
