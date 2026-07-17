/** SCIIP Testing Framework v4 explicit patch — Enterprise Expansion Execution 9660-9750 */
function sciipTest9660() { return sciipTest9660_EnterpriseExpansionReadinessProcessor(); }
function sciipTest9670() { return sciipTest9670_EnterpriseExpansionOpportunityProcessor(); }
function sciipTest9680() { return sciipTest9680_EnterpriseExpansionAssessmentProcessor(); }
function sciipTest9690() { return sciipTest9690_EnterpriseExpansionPlanningProcessor(); }
function sciipTest9700() { return sciipTest9700_EnterpriseExpansionCoordinationProcessor(); }
function sciipTest9710() { return sciipTest9710_EnterpriseExpansionControlProcessor(); }
function sciipTest9720() { return sciipTest9720_EnterpriseExpansionGovernanceProcessor(); }
function sciipTest9730() { return sciipTest9730_EnterpriseExpansionValidationProcessor(); }
function sciipTest9740() { return sciipTest9740_EnterpriseExpansionCertificationProcessor(); }
function sciipTest9750() { return sciipTest9750_EnterpriseExpansionAcceptanceProcessor(); }

function sciipTestRange9660_9750_EnterpriseExpansionExecution() {
  return SCIIP_TEST.runRange(9660, 9750);
}
