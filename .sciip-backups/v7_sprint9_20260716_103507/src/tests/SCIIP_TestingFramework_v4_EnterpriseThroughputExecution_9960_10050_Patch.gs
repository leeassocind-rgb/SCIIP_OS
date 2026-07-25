/** SCIIP Testing Framework v4 explicit patch — Enterprise Throughput Execution 9960-10050 */
function sciipTest9960() { return sciipTest9960_EnterpriseThroughputReadinessProcessor(); }
function sciipTest9970() { return sciipTest9970_EnterpriseThroughputBaselineProcessor(); }
function sciipTest9980() { return sciipTest9980_EnterpriseThroughputSignalProcessor(); }
function sciipTest9990() { return sciipTest9990_EnterpriseThroughputMeasurementProcessor(); }
function sciipTest10000() { return sciipTest10000_EnterpriseThroughputDiagnosisProcessor(); }
function sciipTest10010() { return sciipTest10010_EnterpriseThroughputOptimizationProcessor(); }
function sciipTest10020() { return sciipTest10020_EnterpriseThroughputGovernanceProcessor(); }
function sciipTest10030() { return sciipTest10030_EnterpriseThroughputValidationProcessor(); }
function sciipTest10040() { return sciipTest10040_EnterpriseThroughputCertificationProcessor(); }
function sciipTest10050() { return sciipTest10050_EnterpriseThroughputAcceptanceProcessor(); }

function sciipTestRange9960_10050_EnterpriseThroughputExecution() {
  return SCIIP_TEST.runRange(9960, 10050);
}
