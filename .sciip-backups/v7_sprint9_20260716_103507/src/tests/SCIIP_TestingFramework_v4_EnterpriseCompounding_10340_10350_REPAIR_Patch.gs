/** SCIIP Testing Framework v4 repair patch — Enterprise Compounding Execution 10260–10350 */
function sciipTest10340() { return sciipTest10340_EnterpriseCompoundingCertificationProcessor(); }
function sciipTest10350() { return sciipTest10350_EnterpriseCompoundingAcceptanceProcessor(); }

function sciipTestRange10340_10350_EnterpriseCompoundingRepair() {
  return SCIIP_TEST.runRange(10340, 10350);
}

function sciipTestRange10260_10350_EnterpriseCompoundingExecution() {
  return SCIIP_TEST.runRange(10260, 10350);
}
