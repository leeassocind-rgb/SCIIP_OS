/**
 * SCIIP_OS v5.5 / Testing Framework v3
 * File: SCIIP_BatchTestRunner.gs
 *
 * Purpose:
 * Human-friendly batch test entry points for common SCIIP_OS milestones.
 */

function sciipTestBatch6210_6290_DomainFoundation() {
  return SCIIP_TEST.runRange(6210, 6290);
}

function sciipTestBatch6300_6380_DomainExecutionReadiness() {
  return SCIIP_TEST.runRange(6300, 6380);
}

function sciipTestBatch6390_6470_AssetRegistryExecutionReadiness() {
  return SCIIP_TEST.runRange(6390, 6470);
}

function sciipTestBatch6480_6550_AssetRegistryExecution() {
  return SCIIP_TEST.runRange(6480, 6550);
}

function sciipTestBatch6560_6650_AssetDataExecution() {
  return SCIIP_TEST.runRange(6560, 6650);
}

function sciipTestRange6210_6650() {
  return SCIIP_TEST.runRange(6210, 6650);
}
