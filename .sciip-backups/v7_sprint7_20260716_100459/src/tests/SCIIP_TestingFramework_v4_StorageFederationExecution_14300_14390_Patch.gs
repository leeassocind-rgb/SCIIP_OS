/** SCIIP Testing Framework v4 explicit patch — Storage Federation Execution 14300-14390 */
function sciipTest14300() { return sciipTest14300_StorageFederationReadinessProcessor(); }
function sciipTest14310() { return sciipTest14310_FederationPolicyRegistryProcessor(); }
function sciipTest14320() { return sciipTest14320_FederationDiscoveryProcessor(); }
function sciipTest14330() { return sciipTest14330_FederationTopologyProcessor(); }
function sciipTest14340() { return sciipTest14340_FederationRoutingProcessor(); }
function sciipTest14350() { return sciipTest14350_FederationVerificationProcessor(); }
function sciipTest14360() { return sciipTest14360_FederationGovernanceProcessor(); }
function sciipTest14370() { return sciipTest14370_FederationValidationProcessor(); }
function sciipTest14380() { return sciipTest14380_FederationCertificationProcessor(); }
function sciipTest14390() { return sciipTest14390_FederationAcceptanceProcessor(); }

function sciipTestRange14300_14390_StorageFederationExecution() {
  return SCIIP_TEST.runRange(14300, 14390);
}
