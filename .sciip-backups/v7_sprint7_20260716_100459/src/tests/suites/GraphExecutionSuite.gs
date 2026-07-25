/**
 * SCIIP Testing Framework v3 - Graph Execution Suite Extension
 */

function sciipTestRange6760_6850() {
  return SCIIP_TEST.runRange(6760, 6850);
}

function sciipTestBatch6760_6850_GraphExecution() {
  return SCIIP_TEST.runSuite('GraphExecution');
}

function sciipRegisterGraphExecutionSuite_() {
  if (typeof SCIIP_TEST === 'undefined') return;
  if (!SCIIP_TEST.SUITES) SCIIP_TEST.SUITES = {};
  SCIIP_TEST.SUITES.GraphExecution = {
    name: 'GraphExecution',
    subsystem: 'graph',
    startProcessor: 6760,
    endProcessor: 6850,
    tests: [
      'sciipTest6760_GraphExecutionReadinessProcessor',
      'sciipTest6770_GraphNodeCreationProcessor',
      'sciipTest6780_GraphEdgeCreationProcessor',
      'sciipTest6790_AssetIdentityGraphRelationshipProcessor',
      'sciipTest6800_GraphHierarchyConstructionProcessor',
      'sciipTest6810_GraphEventGenerationProcessor',
      'sciipTest6820_GraphValidationProcessor',
      'sciipTest6830_GraphLedgerProcessor',
      'sciipTest6840_GraphExecutionCertificationProcessor',
      'sciipTest6850_GraphAcceptanceProcessor'
    ]
  };
}

sciipRegisterGraphExecutionSuite_();
