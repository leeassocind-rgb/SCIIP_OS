/** SCIIP Testing Framework v4 explicit patch — Archive Manager 12500-12590 */
function sciipTest12500() { return sciipTest12500_ArchiveReadinessProcessor(); }
function sciipTest12510() { return sciipTest12510_ArchiveRegistryProcessor(); }
function sciipTest12520() { return sciipTest12520_ArchiveWriteIntentProcessor(); }
function sciipTest12530() { return sciipTest12530_ArchiveReadIntentProcessor(); }
function sciipTest12540() { return sciipTest12540_ArchiveRetentionPolicyProcessor(); }
function sciipTest12550() { return sciipTest12550_ArchiveRetrievalPlanProcessor(); }
function sciipTest12560() { return sciipTest12560_ArchiveGovernanceProcessor(); }
function sciipTest12570() { return sciipTest12570_ArchiveValidationProcessor(); }
function sciipTest12580() { return sciipTest12580_ArchiveCertificationProcessor(); }
function sciipTest12590() { return sciipTest12590_ArchiveAcceptanceProcessor(); }

function sciipTestRange12500_12590_ArchiveManager() {
  return SCIIP_TEST.runRange(12500, 12590);
}
