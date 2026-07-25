/**
 * SCIIP_OS v5.5 Testing Framework v4.1 Patch
 *
 * Purpose:
 * Fixes range wrapper functions that were resolving to undefined start/end values
 * in Testing Framework v4.0.
 *
 * Design:
 * - Keeps the v4 discovery model intact.
 * - Adds explicit public wrappers for current execution ranges.
 * - Adds GraphExecution suite wrapper mapped to 6760-6850.
 * - Safe to load after existing test framework files; these functions intentionally
 *   override prior wrapper definitions with corrected arguments.
 */

function sciipTestRange6210_6290() {
  return SCIIP_TEST.runRange(6210, 6290);
}

function sciipTestRange6300_6380() {
  return SCIIP_TEST.runRange(6300, 6380);
}

function sciipTestRange6390_6470() {
  return SCIIP_TEST.runRange(6390, 6470);
}

function sciipTestRange6480_6550() {
  return SCIIP_TEST.runRange(6480, 6550);
}

function sciipTestRange6560_6650() {
  return SCIIP_TEST.runRange(6560, 6650);
}

function sciipTestRange6660_6750() {
  return SCIIP_TEST.runRange(6660, 6750);
}

function sciipTestRange6760_6850() {
  return SCIIP_TEST.runRange(6760, 6850);
}

function sciipTestBatch6760_6850_GraphExecution() {
  return SCIIP_TEST.runRange(6760, 6850, {
    suiteName: 'GraphExecution',
    subsystem: 'graph',
    expectedProcessorNumbers: [6760, 6770, 6780, 6790, 6800, 6810, 6820, 6830, 6840, 6850]
  });
}

function sciipTestSuiteGraphExecution() {
  return sciipTestBatch6760_6850_GraphExecution();
}

function sciipTestSubsystemGraph() {
  return sciipTestBatch6760_6850_GraphExecution();
}
