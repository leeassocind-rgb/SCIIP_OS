/**
 * SCIIP Testing Framework v4 - GIS Execution Suite Extension
 * Note: wrapper functions explicitly pass processor ranges.
 */

function sciipTestRange6860_6950() {
  return SCIIP_TEST.runRange(6860, 6950);
}

function sciipTestBatch6860_6950_GISExecution() {
  return SCIIP_TEST.runRange(6860, 6950, {
    suiteName: 'GISExecution',
    subsystem: 'gis'
  });
}

function sciipRegisterGISExecutionSuite_() {
  if (typeof SCIIP_TEST === 'undefined') return;
  if (!SCIIP_TEST.SUITES) SCIIP_TEST.SUITES = {};
  SCIIP_TEST.SUITES.GISExecution = {
    name: 'GISExecution',
    subsystem: 'gis',
    startProcessor: 6860,
    endProcessor: 6950,
    tests: [
      'sciipTest6860_GISExecutionReadinessProcessor',
      'sciipTest6870_CoordinateResolutionProcessor',
      'sciipTest6880_SpatialGeometryCreationProcessor',
      'sciipTest6890_ParcelBindingProcessor',
      'sciipTest6900_JurisdictionBindingProcessor',
      'sciipTest6910_SpatialRelationshipGenerationProcessor',
      'sciipTest6920_GISValidationProcessor',
      'sciipTest6930_GISLedgerProcessor',
      'sciipTest6940_GISExecutionCertificationProcessor',
      'sciipTest6950_GISAcceptanceProcessor'
    ]
  };
}

sciipRegisterGISExecutionSuite_();
