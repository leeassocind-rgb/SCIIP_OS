/**
 * SCIIP_OS v5.5 — Enterprise Learning Execution explicit Testing Framework v4 patch.
 * Every public range wrapper passes explicit start and end arguments.
 */
function sciipTest8060() { return sciipTest8060_EnterpriseLearningReadinessProcessor(); }
function sciipTest8070() { return sciipTest8070_EnterpriseLearningIntakeProcessor(); }
function sciipTest8080() { return sciipTest8080_EnterprisePatternRecognitionProcessor(); }
function sciipTest8090() { return sciipTest8090_EnterpriseKnowledgeRefinementProcessor(); }
function sciipTest8100() { return sciipTest8100_EnterpriseModelAdaptationProcessor(); }
function sciipTest8110() { return sciipTest8110_EnterpriseFeedbackIntegrationProcessor(); }
function sciipTest8120() { return sciipTest8120_EnterpriseLearningGovernanceProcessor(); }
function sciipTest8130() { return sciipTest8130_EnterpriseLearningValidationProcessor(); }
function sciipTest8140() { return sciipTest8140_EnterpriseLearningCertificationProcessor(); }
function sciipTest8150() { return sciipTest8150_EnterpriseLearningAcceptanceProcessor(); }

function sciipTestRange8060_8150_EnterpriseLearningExecution() {
  return SCIIP_TEST.runRange(8060, 8150);
}

function sciipTestRange8060_8150() {
  return SCIIP_TEST.runRange(8060, 8150);
}
