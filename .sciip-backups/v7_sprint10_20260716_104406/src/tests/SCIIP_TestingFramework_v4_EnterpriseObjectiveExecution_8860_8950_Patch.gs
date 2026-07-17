/** SCIIP Testing Framework v4 explicit patch — Enterprise Objective Execution 8860–8950 */
function sciipTest8860() { return sciipTest8860_EnterpriseObjectiveReadinessProcessor(); }
function sciipTest8870() { return sciipTest8870_EnterpriseObjectiveDefinitionProcessor(); }
function sciipTest8880() { return sciipTest8880_EnterpriseObjectiveAlignmentProcessor(); }
function sciipTest8890() { return sciipTest8890_EnterpriseObjectivePrioritizationProcessor(); }
function sciipTest8900() { return sciipTest8900_EnterpriseObjectiveTrackingProcessor(); }
function sciipTest8910() { return sciipTest8910_EnterpriseObjectiveControlProcessor(); }
function sciipTest8920() { return sciipTest8920_EnterpriseObjectiveGovernanceProcessor(); }
function sciipTest8930() { return sciipTest8930_EnterpriseObjectiveValidationProcessor(); }
function sciipTest8940() { return sciipTest8940_EnterpriseObjectiveCertificationProcessor(); }
function sciipTest8950() { return sciipTest8950_EnterpriseObjectiveAcceptanceProcessor(); }

function sciipTestRange8860_8950_EnterpriseObjectiveExecution() {
  return SCIIP_TEST.runRange(8860, 8950);
}
