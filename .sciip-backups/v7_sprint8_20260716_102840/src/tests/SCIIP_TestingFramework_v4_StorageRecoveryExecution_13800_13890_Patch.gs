/** SCIIP Testing Framework v4 explicit patch — Storage Recovery Execution 13800-13890 */
function sciipTest13800() { return sciipTest13800_StorageRecoveryReadinessProcessor(); }
function sciipTest13810() { return sciipTest13810_RecoveryPolicyRegistryProcessor(); }
function sciipTest13820() { return sciipTest13820_RecoveryCheckpointProcessor(); }
function sciipTest13830() { return sciipTest13830_RecoveryJournalProcessor(); }
function sciipTest13840() { return sciipTest13840_RecoveryReplayPlannerProcessor(); }
function sciipTest13850() { return sciipTest13850_RecoveryVerificationProcessor(); }
function sciipTest13860() { return sciipTest13860_RecoveryGovernanceProcessor(); }
function sciipTest13870() { return sciipTest13870_RecoveryValidationProcessor(); }
function sciipTest13880() { return sciipTest13880_RecoveryCertificationProcessor(); }
function sciipTest13890() { return sciipTest13890_RecoveryAcceptanceProcessor(); }

function sciipTestRange13800_13890_StorageRecoveryExecution() {
  return SCIIP_TEST.runRange(13800, 13890);
}
