/** SCIIP Testing Framework v4 explicit patch — Enterprise Reasoning Execution 8260–8350 */
function sciipTest8260() { return sciipTest8260_EnterpriseReasoningReadinessProcessor(); }
function sciipTest8270() { return sciipTest8270_EnterpriseEvidenceAssemblyProcessor(); }
function sciipTest8280() { return sciipTest8280_EnterpriseInferenceMappingProcessor(); }
function sciipTest8290() { return sciipTest8290_EnterpriseCausalReasoningProcessor(); }
function sciipTest8300() { return sciipTest8300_EnterpriseScenarioReasoningProcessor(); }
function sciipTest8310() { return sciipTest8310_EnterpriseConstraintReasoningProcessor(); }
function sciipTest8320() { return sciipTest8320_EnterpriseReasoningGovernanceProcessor(); }
function sciipTest8330() { return sciipTest8330_EnterpriseReasoningValidationProcessor(); }
function sciipTest8340() { return sciipTest8340_EnterpriseReasoningCertificationProcessor(); }
function sciipTest8350() { return sciipTest8350_EnterpriseReasoningAcceptanceProcessor(); }

function sciipTestRange8260_8350_EnterpriseReasoningExecution() {
  return SCIIP_TEST.runRange(8260, 8350);
}
