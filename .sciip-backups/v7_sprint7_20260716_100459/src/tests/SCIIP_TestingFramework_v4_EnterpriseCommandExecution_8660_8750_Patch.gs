/** SCIIP Testing Framework v4 explicit patch — Enterprise Command Execution 8660–8750 */
function sciipTest8660() { return sciipTest8660_EnterpriseCommandReadinessProcessor(); }
function sciipTest8670() { return sciipTest8670_EnterpriseCommandIntentProcessor(); }
function sciipTest8680() { return sciipTest8680_EnterpriseCommandPriorityProcessor(); }
function sciipTest8690() { return sciipTest8690_EnterpriseCommandRoutingProcessor(); }
function sciipTest8700() { return sciipTest8700_EnterpriseCommandAuthorityProcessor(); }
function sciipTest8710() { return sciipTest8710_EnterpriseCommandControlProcessor(); }
function sciipTest8720() { return sciipTest8720_EnterpriseCommandGovernanceProcessor(); }
function sciipTest8730() { return sciipTest8730_EnterpriseCommandValidationProcessor(); }
function sciipTest8740() { return sciipTest8740_EnterpriseCommandCertificationProcessor(); }
function sciipTest8750() { return sciipTest8750_EnterpriseCommandAcceptanceProcessor(); }

function sciipTestRange8660_8750_EnterpriseCommandExecution() {
  return SCIIP_TEST.runRange(8660, 8750);
}
