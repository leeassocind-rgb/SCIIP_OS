/** SCIIP Testing Framework v4 explicit patch — Enterprise Outcome Execution 8960–9050 */
function sciipTest8960() { return sciipTest8960_EnterpriseOutcomeReadinessProcessor(); }
function sciipTest8970() { return sciipTest8970_EnterpriseOutcomeDefinitionProcessor(); }
function sciipTest8980() { return sciipTest8980_EnterpriseOutcomeMeasurementProcessor(); }
function sciipTest8990() { return sciipTest8990_EnterpriseOutcomeAttributionProcessor(); }
function sciipTest9000() { return sciipTest9000_EnterpriseOutcomeScoringProcessor(); }
function sciipTest9010() { return sciipTest9010_EnterpriseOutcomeOptimizationProcessor(); }
function sciipTest9020() { return sciipTest9020_EnterpriseOutcomeGovernanceProcessor(); }
function sciipTest9030() { return sciipTest9030_EnterpriseOutcomeValidationProcessor(); }
function sciipTest9040() { return sciipTest9040_EnterpriseOutcomeCertificationProcessor(); }
function sciipTest9050() { return sciipTest9050_EnterpriseOutcomeAcceptanceProcessor(); }

function sciipTestRange8960_9050_EnterpriseOutcomeExecution() {
  return SCIIP_TEST.runRange(8960, 9050);
}
