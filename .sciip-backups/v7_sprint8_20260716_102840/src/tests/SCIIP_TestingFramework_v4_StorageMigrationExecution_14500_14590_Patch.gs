/** SCIIP Testing Framework v4 explicit patch — Storage Migration Execution 14500-14590 */
function sciipTest14500() { return sciipTest14500_StorageMigrationReadinessProcessor(); }
function sciipTest14510() { return sciipTest14510_MigrationPlanningProcessor(); }
function sciipTest14520() { return sciipTest14520_MigrationPreparationProcessor(); }
function sciipTest14530() { return sciipTest14530_MigrationExecutionProcessor(); }
function sciipTest14540() { return sciipTest14540_MigrationVerificationProcessor(); }
function sciipTest14550() { return sciipTest14550_MigrationReconciliationProcessor(); }
function sciipTest14560() { return sciipTest14560_MigrationLedgerProcessor(); }
function sciipTest14570() { return sciipTest14570_MigrationValidationProcessor(); }
function sciipTest14580() { return sciipTest14580_MigrationCertificationProcessor(); }
function sciipTest14590() { return sciipTest14590_MigrationAcceptanceProcessor(); }

function sciipTestRange14500_14590_StorageMigrationExecution() {
  return SCIIP_TEST.runRange(14500, 14590);
}
