/** SCIIP Testing Framework v4 explicit patch — Enterprise Resilience Execution 9260–9350 */
function sciipTest9260() { return sciipTest9260_EnterpriseResilienceReadinessProcessor(); }
function sciipTest9270() { return sciipTest9270_EnterpriseResilienceBaselineProcessor(); }
function sciipTest9280() { return sciipTest9280_EnterpriseRiskAbsorptionProcessor(); }
function sciipTest9290() { return sciipTest9290_EnterpriseRecoveryPlanningProcessor(); }
function sciipTest9300() { return sciipTest9300_EnterpriseContinuityControlProcessor(); }
function sciipTest9310() { return sciipTest9310_EnterpriseResilienceOptimizationProcessor(); }
function sciipTest9320() { return sciipTest9320_EnterpriseResilienceGovernanceProcessor(); }
function sciipTest9330() { return sciipTest9330_EnterpriseResilienceValidationProcessor(); }
function sciipTest9340() { return sciipTest9340_EnterpriseResilienceCertificationProcessor(); }
function sciipTest9350() { return sciipTest9350_EnterpriseResilienceAcceptanceProcessor(); }

function sciipTestRange9260_9350_EnterpriseResilienceExecution() {
  return SCIIP_TEST.runRange(9260, 9350);
}
