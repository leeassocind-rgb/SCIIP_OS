/** SCIIP Testing Framework v4 explicit patch — Enterprise Control Execution 11260–11350 full capacity bypass */
function sciipTest11260() { return sciipTest11260_EnterpriseControlReadinessProcessor(); }
function sciipTest11270() { return sciipTest11270_EnterpriseControlSignalProcessor(); }
function sciipTest11280() { return sciipTest11280_EnterpriseControlBaselineProcessor(); }
function sciipTest11290() { return sciipTest11290_EnterpriseControlMeasurementProcessor(); }
function sciipTest11300() { return sciipTest11300_EnterpriseControlDiagnosisProcessor(); }
function sciipTest11310() { return sciipTest11310_EnterpriseControlOptimizationProcessor(); }
function sciipTest11320() { return sciipTest11320_EnterpriseControlGovernanceProcessor(); }
function sciipTest11330() { return sciipTest11330_EnterpriseControlValidationProcessor(); }
function sciipTest11340() { return sciipTest11340_EnterpriseControlCertificationProcessor(); }
function sciipTest11350() { return sciipTest11350_EnterpriseControlAcceptanceProcessor(); }

function sciipTestRange11260_11350_EnterpriseControlExecution() {
  return SCIIP_TEST.runRange(11260, 11350);
}
