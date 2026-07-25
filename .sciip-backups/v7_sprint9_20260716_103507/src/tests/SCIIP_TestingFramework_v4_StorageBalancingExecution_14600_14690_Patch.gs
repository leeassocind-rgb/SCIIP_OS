/** SCIIP Testing Framework v4 explicit patch — Storage Balancing Execution 14600-14690 */
function sciipTest14600() { return sciipTest14600_StorageBalancingReadinessProcessor(); }
function sciipTest14610() { return sciipTest14610_BalancingPolicyRegistryProcessor(); }
function sciipTest14620() { return sciipTest14620_CapacityAnalysisProcessor(); }
function sciipTest14630() { return sciipTest14630_LoadDistributionProcessor(); }
function sciipTest14640() { return sciipTest14640_RebalancePlanningProcessor(); }
function sciipTest14650() { return sciipTest14650_RebalanceExecutionProcessor(); }
function sciipTest14660() { return sciipTest14660_BalancingLedgerProcessor(); }
function sciipTest14670() { return sciipTest14670_BalancingValidationProcessor(); }
function sciipTest14680() { return sciipTest14680_BalancingCertificationProcessor(); }
function sciipTest14690() { return sciipTest14690_BalancingAcceptanceProcessor(); }

function sciipTestRange14600_14690_StorageBalancingExecution() {
  return SCIIP_TEST.runRange(14600, 14690);
}
