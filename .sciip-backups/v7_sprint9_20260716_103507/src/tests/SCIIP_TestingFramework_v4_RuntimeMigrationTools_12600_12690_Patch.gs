/** SCIIP Testing Framework v4 explicit patch — Runtime Migration Tools 12600-12690 */
function sciipTest12600() { return sciipTest12600_MigrationReadinessProcessor(); }
function sciipTest12610() { return sciipTest12610_MigrationSourceInventoryProcessor(); }
function sciipTest12620() { return sciipTest12620_MigrationTargetPlanProcessor(); }
function sciipTest12630() { return sciipTest12630_MigrationBatchPlannerProcessor(); }
function sciipTest12640() { return sciipTest12640_MigrationVerificationPlanProcessor(); }
function sciipTest12650() { return sciipTest12650_MigrationRollbackPlanProcessor(); }
function sciipTest12660() { return sciipTest12660_MigrationGovernanceProcessor(); }
function sciipTest12670() { return sciipTest12670_MigrationValidationProcessor(); }
function sciipTest12680() { return sciipTest12680_MigrationCertificationProcessor(); }
function sciipTest12690() { return sciipTest12690_MigrationAcceptanceProcessor(); }

function sciipTestRange12600_12690_RuntimeMigrationTools() {
  return SCIIP_TEST.runRange(12600, 12690);
}
