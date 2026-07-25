/** SCIIP Testing Framework v4 explicit patch — Ledger Backend Execution 13200-13290 */
function sciipTest13200() { return sciipTest13200_LedgerBackendReadinessProcessor(); }
function sciipTest13210() { return sciipTest13210_LedgerBackendContractProcessor(); }
function sciipTest13220() { return sciipTest13220_LedgerPartitionIntentProcessor(); }
function sciipTest13230() { return sciipTest13230_LedgerAppendBackendIntentProcessor(); }
function sciipTest13240() { return sciipTest13240_LedgerReplayBackendIntentProcessor(); }
function sciipTest13250() { return sciipTest13250_LedgerBackendConsistencyPolicyProcessor(); }
function sciipTest13260() { return sciipTest13260_LedgerBackendGovernanceProcessor(); }
function sciipTest13270() { return sciipTest13270_LedgerBackendValidationProcessor(); }
function sciipTest13280() { return sciipTest13280_LedgerBackendCertificationProcessor(); }
function sciipTest13290() { return sciipTest13290_LedgerBackendAcceptanceProcessor(); }

function sciipTestRange13200_13290_LedgerBackendExecution() {
  return SCIIP_TEST.runRange(13200, 13290);
}
