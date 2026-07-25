/** SCIIP Testing Framework v4 explicit patch — Runtime Storage Router 12300-12390 */
function sciipTest12300() { return sciipTest12300_RuntimeRouterReadinessProcessor(); }
function sciipTest12310() { return sciipTest12310_StorageRouteRegistryProcessor(); }
function sciipTest12320() { return sciipTest12320_ProcessorRoutePolicyProcessor(); }
function sciipTest12330() { return sciipTest12330_ShardRouteSelectionProcessor(); }
function sciipTest12340() { return sciipTest12340_LedgerRouteSelectionProcessor(); }
function sciipTest12350() { return sciipTest12350_IndexRouteSelectionProcessor(); }
function sciipTest12360() { return sciipTest12360_RuntimeRouterGovernanceProcessor(); }
function sciipTest12370() { return sciipTest12370_RuntimeRouterValidationProcessor(); }
function sciipTest12380() { return sciipTest12380_RuntimeRouterCertificationProcessor(); }
function sciipTest12390() { return sciipTest12390_RuntimeRouterAcceptanceProcessor(); }

function sciipTestRange12300_12390_RuntimeStorageRouter() {
  return SCIIP_TEST.runRange(12300, 12390);
}
