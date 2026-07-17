/** SCIIP Testing Framework v4 explicit patch — Archive Backend Execution 13400-13490 */
function sciipTest13400() { return sciipTest13400_ArchiveBackendReadinessProcessor(); }
function sciipTest13410() { return sciipTest13410_ArchiveBackendContractProcessor(); }
function sciipTest13420() { return sciipTest13420_ColdStorageIntentProcessor(); }
function sciipTest13430() { return sciipTest13430_ArchivePartitionIntentProcessor(); }
function sciipTest13440() { return sciipTest13440_ArchiveRetrievalBackendIntentProcessor(); }
function sciipTest13450() { return sciipTest13450_ArchiveBackendRetentionPolicyProcessor(); }
function sciipTest13460() { return sciipTest13460_ArchiveBackendGovernanceProcessor(); }
function sciipTest13470() { return sciipTest13470_ArchiveBackendValidationProcessor(); }
function sciipTest13480() { return sciipTest13480_ArchiveBackendCertificationProcessor(); }
function sciipTest13490() { return sciipTest13490_ArchiveBackendAcceptanceProcessor(); }

function sciipTestRange13400_13490_ArchiveBackendExecution() {
  return SCIIP_TEST.runRange(13400, 13490);
}
