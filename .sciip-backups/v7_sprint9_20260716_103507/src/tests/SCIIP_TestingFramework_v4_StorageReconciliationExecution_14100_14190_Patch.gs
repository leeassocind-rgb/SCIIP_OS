/** SCIIP Testing Framework v4 explicit patch — Storage Reconciliation Execution 14100-14190 */
function sciipTest14100() { return sciipTest14100_StorageReconciliationReadinessProcessor(); }
function sciipTest14110() { return sciipTest14110_ReconciliationPolicyRegistryProcessor(); }
function sciipTest14120() { return sciipTest14120_ReconciliationDiscoveryProcessor(); }
function sciipTest14130() { return sciipTest14130_ReconciliationComparisonProcessor(); }
function sciipTest14140() { return sciipTest14140_ReconciliationResolutionPlanProcessor(); }
function sciipTest14150() { return sciipTest14150_ReconciliationVerificationProcessor(); }
function sciipTest14160() { return sciipTest14160_ReconciliationGovernanceProcessor(); }
function sciipTest14170() { return sciipTest14170_ReconciliationValidationProcessor(); }
function sciipTest14180() { return sciipTest14180_ReconciliationCertificationProcessor(); }
function sciipTest14190() { return sciipTest14190_ReconciliationAcceptanceProcessor(); }

function sciipTestRange14100_14190_StorageReconciliationExecution() {
  return SCIIP_TEST.runRange(14100, 14190);
}
