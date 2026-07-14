/** SCIIP Testing Framework v4 explicit patch — Backend Storage Acceptance 13800-13890 */
function sciipTest13800() { return sciipTest13800_BackendStorageReadinessProcessor(); }
function sciipTest13810() { return sciipTest13810_BackendStorageIntegrationProcessor(); }
function sciipTest13820() { return sciipTest13820_BackendStorageSmokeTestProcessor(); }
function sciipTest13830() { return sciipTest13830_BackendStorageCapacityTestProcessor(); }
function sciipTest13840() { return sciipTest13840_BackendStorageRouteTestProcessor(); }
function sciipTest13850() { return sciipTest13850_BackendStorageRecoveryTestProcessor(); }
function sciipTest13860() { return sciipTest13860_BackendStorageGovernanceProcessor(); }
function sciipTest13870() { return sciipTest13870_BackendStorageValidationProcessor(); }
function sciipTest13880() { return sciipTest13880_BackendStorageCertificationProcessor(); }
function sciipTest13890() { return sciipTest13890_BackendStorageAcceptanceProcessor(); }

function sciipTestRange13800_13890_BackendStorageAcceptance() {
  return SCIIP_TEST.runRange(13800, 13890);
}
