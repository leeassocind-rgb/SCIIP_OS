/**
 * SCIIP_OS v5.5
 * File: SCIIP_TestRangeRunners_v4.gs
 * Convenience range and suite runner functions for Apps Script dropdown execution.
 */

function sciipTestRange6210_6290() { return SCIIP_TEST.runRange(6210, 6290); }
function sciipTestRange6300_6380() { return SCIIP_TEST.runRange(6300, 6380); }
function sciipTestRange6390_6470() { return SCIIP_TEST.runRange(6390, 6470); }
function sciipTestRange6480_6550() { return SCIIP_TEST.runRange(6480, 6550); }
function sciipTestRange6560_6650() { return SCIIP_TEST.runRange(6560, 6650); }
function sciipTestRange6660_6750() { return SCIIP_TEST.runRange(6660, 6750); }
function sciipTestRange6760_6850() { return SCIIP_TEST.runRange(6760, 6850); }
function sciipTestRange6860_6950() { return SCIIP_TEST.runRange(6860, 6950); }

function sciipTestBatch6210_6290_DomainFoundation() { return SCIIP_TEST.runSuite('DomainFoundation'); }
function sciipTestBatch6300_6380_DomainExecutionReadiness() { return SCIIP_TEST.runSuite('DomainExecutionReadiness'); }
function sciipTestBatch6390_6470_AssetRegistryExecutionReadiness() { return SCIIP_TEST.runSuite('AssetRegistryExecutionReadiness'); }
function sciipTestBatch6480_6550_AssetRegistryExecution() { return SCIIP_TEST.runSuite('AssetRegistryExecution'); }
function sciipTestBatch6560_6650_AssetDataExecution() { return SCIIP_TEST.runSuite('AssetDataExecution'); }
function sciipTestBatch6660_6750_IdentityExecution() { return SCIIP_TEST.runSuite('IdentityExecution'); }
function sciipTestBatch6760_6850_GraphExecution() { return SCIIP_TEST.runSuite('GraphExecution'); }
function sciipTestBatch6860_6950_GISExecution() { return SCIIP_TEST.runSuite('GISExecution'); }
