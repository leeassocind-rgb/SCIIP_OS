/** SCIIP Testing Framework v4 explicit patch — Enterprise Compounding Execution 10260-10350 */
function sciipTest10260() { return sciipTest10260_EnterpriseCompoundingReadinessProcessor(); }
function sciipTest10270() { return sciipTest10270_EnterpriseCompoundingSignalProcessor(); }
function sciipTest10280() { return sciipTest10280_EnterpriseCompoundingMappingProcessor(); }
function sciipTest10290() { return sciipTest10290_EnterpriseCompoundingMeasurementProcessor(); }
function sciipTest10300() { return sciipTest10300_EnterpriseCompoundingPlanningProcessor(); }
function sciipTest10310() { return sciipTest10310_EnterpriseCompoundingOptimizationProcessor(); }
function sciipTest10320() { return sciipTest10320_EnterpriseCompoundingGovernanceProcessor(); }
function sciipTest10330() { return sciipTest10330_EnterpriseCompoundingValidationProcessor(); }
function sciipTest10340() { return sciipTest10340_EnterpriseCompoundingCertificationProcessor(); }
function sciipTest10350() { return sciipTest10350_EnterpriseCompoundingAcceptanceProcessor(); }

function sciipTestRange10260_10350_EnterpriseCompoundingExecution() {
  return SCIIP_TEST.runRange(10260, 10350);
}
