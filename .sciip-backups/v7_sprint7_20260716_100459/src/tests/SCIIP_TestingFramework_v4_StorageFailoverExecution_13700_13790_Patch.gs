/** SCIIP Testing Framework v4 explicit patch — Storage Failover Execution 13700-13790 */
function sciipTest13700() { return sciipTest13700_StorageFailoverReadinessProcessor(); }
function sciipTest13710() { return sciipTest13710_FailoverPolicyRegistryProcessor(); }
function sciipTest13720() { return sciipTest13720_ShardFailoverPlanProcessor(); }
function sciipTest13730() { return sciipTest13730_LedgerFailoverPlanProcessor(); }
function sciipTest13740() { return sciipTest13740_IndexFailoverPlanProcessor(); }
function sciipTest13750() { return sciipTest13750_ArchiveFailoverPlanProcessor(); }
function sciipTest13760() { return sciipTest13760_StorageFailoverGovernanceProcessor(); }
function sciipTest13770() { return sciipTest13770_StorageFailoverValidationProcessor(); }
function sciipTest13780() { return sciipTest13780_StorageFailoverCertificationProcessor(); }
function sciipTest13790() { return sciipTest13790_StorageFailoverAcceptanceProcessor(); }

function sciipTestRange13700_13790_StorageFailoverExecution() {
  return SCIIP_TEST.runRange(13700, 13790);
}
