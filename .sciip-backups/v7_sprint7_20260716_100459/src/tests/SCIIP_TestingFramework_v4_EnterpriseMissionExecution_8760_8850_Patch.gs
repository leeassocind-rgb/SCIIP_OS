/** SCIIP Testing Framework v4 explicit patch — Enterprise Mission Execution 8760–8850 */
function sciipTest8760() { return sciipTest8760_EnterpriseMissionReadinessProcessor(); }
function sciipTest8770() { return sciipTest8770_EnterpriseMissionDefinitionProcessor(); }
function sciipTest8780() { return sciipTest8780_EnterpriseMissionAlignmentProcessor(); }
function sciipTest8790() { return sciipTest8790_EnterpriseMissionPlanningProcessor(); }
function sciipTest8800() { return sciipTest8800_EnterpriseMissionCoordinationProcessor(); }
function sciipTest8810() { return sciipTest8810_EnterpriseMissionControlProcessor(); }
function sciipTest8820() { return sciipTest8820_EnterpriseMissionGovernanceProcessor(); }
function sciipTest8830() { return sciipTest8830_EnterpriseMissionValidationProcessor(); }
function sciipTest8840() { return sciipTest8840_EnterpriseMissionCertificationProcessor(); }
function sciipTest8850() { return sciipTest8850_EnterpriseMissionAcceptanceProcessor(); }

function sciipTestRange8760_8850_EnterpriseMissionExecution() {
  return SCIIP_TEST.runRange(8760, 8850);
}
