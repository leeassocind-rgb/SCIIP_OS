/** SCIIP Testing Framework v4 explicit patch — Enterprise Adaptation Execution 9360-9450 */
function sciipTest9360() { return sciipTest9360_EnterpriseAdaptationReadinessProcessor(); }
function sciipTest9370() { return sciipTest9370_EnterpriseChangeSignalProcessor(); }
function sciipTest9380() { return sciipTest9380_EnterpriseAdaptationAssessmentProcessor(); }
function sciipTest9390() { return sciipTest9390_EnterpriseAdaptationPlanningProcessor(); }
function sciipTest9400() { return sciipTest9400_EnterpriseAdaptiveControlProcessor(); }
function sciipTest9410() { return sciipTest9410_EnterpriseAdaptiveOptimizationProcessor(); }
function sciipTest9420() { return sciipTest9420_EnterpriseAdaptationGovernanceProcessor(); }
function sciipTest9430() { return sciipTest9430_EnterpriseAdaptationValidationProcessor(); }
function sciipTest9440() { return sciipTest9440_EnterpriseAdaptationCertificationProcessor(); }
function sciipTest9450() { return sciipTest9450_EnterpriseAdaptationAcceptanceProcessor(); }

function sciipTestRange9360_9450_EnterpriseAdaptationExecution() {
  return SCIIP_TEST.runRange(9360, 9450);
}
