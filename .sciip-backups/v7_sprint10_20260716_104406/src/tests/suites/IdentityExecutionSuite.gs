/**
 * SCIIP Testing Framework v3 - Identity Execution Suite Extension
 */

function sciipTestRange6660_6750() {
  return SCIIP_TEST.runRange(6660, 6750);
}

function sciipTestBatch6660_6750_IdentityExecution() {
  return SCIIP_TEST.runSuite('IdentityExecution');
}

function sciipRegisterIdentityExecutionSuite_() {
  if (typeof SCIIP_TEST === 'undefined') return;
  if (!SCIIP_TEST.SUITES) SCIIP_TEST.SUITES = {};
  SCIIP_TEST.SUITES.IdentityExecution = {
    name: 'IdentityExecution',
    subsystem: 'identity',
    startProcessor: 6660,
    endProcessor: 6750,
    tests: [
      'sciipTest6660_IdentityExecutionReadinessProcessor',
      'sciipTest6670_IdentityCandidateImportProcessor',
      'sciipTest6680_IdentityAliasResolutionProcessor',
      'sciipTest6690_ParentAddressResolutionProcessor',
      'sciipTest6700_CanonicalIdentityCreationProcessor',
      'sciipTest6710_IdentityRelationshipBindingProcessor',
      'sciipTest6720_IdentityEventGenerationProcessor',
      'sciipTest6730_IdentityGraphBindingProcessor',
      'sciipTest6740_IdentityExecutionCertificationProcessor',
      'sciipTest6750_IdentityAcceptanceProcessor'
    ]
  };
}

sciipRegisterIdentityExecutionSuite_();
