/** SCIIP Testing Framework v4 explicit patch — Storage Allocation Execution 14400-14490 */
function sciipTest14400() { return sciipTest14400_StorageAllocationReadinessProcessor(); }
function sciipTest14410() { return sciipTest14410_AllocationPolicyRegistryProcessor(); }
function sciipTest14420() { return sciipTest14420_CapacityAllocationProcessor(); }
function sciipTest14430() { return sciipTest14430_WorkbookSelectionProcessor(); }
function sciipTest14440() { return sciipTest14440_DatasetPlacementProcessor(); }
function sciipTest14450() { return sciipTest14450_ShardAssignmentProcessor(); }
function sciipTest14460() { return sciipTest14460_AllocationLedgerProcessor(); }
function sciipTest14470() { return sciipTest14470_AllocationValidationProcessor(); }
function sciipTest14480() { return sciipTest14480_AllocationCertificationProcessor(); }
function sciipTest14490() { return sciipTest14490_AllocationAcceptanceProcessor(); }

function sciipTestRange14400_14490_StorageAllocationExecution() {
  return SCIIP_TEST.runRange(14400, 14490);
}
