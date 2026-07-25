/** SCIIP Testing Framework v4 explicit patch — Index Backend Execution 13300-13390 */
function sciipTest13300() { return sciipTest13300_IndexBackendReadinessProcessor(); }
function sciipTest13310() { return sciipTest13310_IndexBackendContractProcessor(); }
function sciipTest13320() { return sciipTest13320_BusinessKeyBackendIndexProcessor(); }
function sciipTest13330() { return sciipTest13330_ProcessorBackendIndexProcessor(); }
function sciipTest13340() { return sciipTest13340_TransactionBackendIndexProcessor(); }
function sciipTest13350() { return sciipTest13350_IndexBackendConsistencyPolicyProcessor(); }
function sciipTest13360() { return sciipTest13360_IndexBackendGovernanceProcessor(); }
function sciipTest13370() { return sciipTest13370_IndexBackendValidationProcessor(); }
function sciipTest13380() { return sciipTest13380_IndexBackendCertificationProcessor(); }
function sciipTest13390() { return sciipTest13390_IndexBackendAcceptanceProcessor(); }

function sciipTestRange13300_13390_IndexBackendExecution() {
  return SCIIP_TEST.runRange(13300, 13390);
}
