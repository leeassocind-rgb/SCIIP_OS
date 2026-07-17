/** SCIIP Testing Framework v4 explicit patch — Cluster Health Monitor 12700-12790 */
function sciipTest12700() { return sciipTest12700_ClusterHealthReadinessProcessor(); }
function sciipTest12710() { return sciipTest12710_ClusterCapacitySignalProcessor(); }
function sciipTest12720() { return sciipTest12720_ShardHealthSignalProcessor(); }
function sciipTest12730() { return sciipTest12730_LedgerHealthSignalProcessor(); }
function sciipTest12740() { return sciipTest12740_IndexHealthSignalProcessor(); }
function sciipTest12750() { return sciipTest12750_ArchiveHealthSignalProcessor(); }
function sciipTest12760() { return sciipTest12760_ClusterHealthGovernanceProcessor(); }
function sciipTest12770() { return sciipTest12770_ClusterHealthValidationProcessor(); }
function sciipTest12780() { return sciipTest12780_ClusterHealthCertificationProcessor(); }
function sciipTest12790() { return sciipTest12790_ClusterHealthAcceptanceProcessor(); }

function sciipTestRange12700_12790_ClusterHealthMonitor() {
  return SCIIP_TEST.runRange(12700, 12790);
}
