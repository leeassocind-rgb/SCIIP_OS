/**
 * SCIIP_OS v5.5 — Decision Intelligence Execution explicit Testing Framework v4 patch.
 * Never call SCIIP_TEST.runRange() without explicit arguments.
 */
function sciipTest7260() { return sciipTest7260_DecisionIntelligenceReadinessProcessor(); }
function sciipTest7270() { return sciipTest7270_DecisionContextAssemblyProcessor(); }
function sciipTest7280() { return sciipTest7280_MultiScenarioAnalysisProcessor(); }
function sciipTest7290() { return sciipTest7290_DecisionOptimizationProcessor(); }
function sciipTest7300() { return sciipTest7300_CapitalAllocationDecisionProcessor(); }
function sciipTest7310() { return sciipTest7310_AcquisitionDecisionEngineProcessor(); }
function sciipTest7320() { return sciipTest7320_DispositionDecisionEngineProcessor(); }
function sciipTest7330() { return sciipTest7330_DecisionValidationProcessor(); }
function sciipTest7340() { return sciipTest7340_DecisionCertificationProcessor(); }
function sciipTest7350() { return sciipTest7350_DecisionAcceptanceProcessor(); }

function sciipTestRange7260_7350_DecisionIntelligenceExecution() {
  return SCIIP_TEST.runRange(7260, 7350);
}

function sciipTestRange7260_7350() {
  return SCIIP_TEST.runRange(7260, 7350);
}
