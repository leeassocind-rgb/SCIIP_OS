/**
 * SCIIP_OS v6.0 — 15040 ControlTestingPlanning
 *
 * Capacity-safe Storage Audit Execution processor.
 */
function sciipRun15040_ControlTestingPlanningProcessor() {
  return SCIIP_STORAGE_AUDIT_BACKEND.executeAuditPlan({
    processorNumber: 15040,
    processorName: 'ControlTestingPlanning',
    statusField: 'controlTestingPlanningStatus',
    component: 'Storage Audit Execution',
    backendLayer: 'Storage Audit',
    sourceSheet: 'EVIDENCE_COLLECTION_PLANNING',
    targetSheet: 'CONTROL_TESTING_PLANNING',
    nextAction: 'Run 15050_AuditExecutionProcessor after this processor completes.'
  });
}

function sciipTest15040_ControlTestingPlanningProcessor() {
  var result = sciipRun15040_ControlTestingPlanningProcessor();
  console.log(JSON.stringify({
    test: 'sciipTest15040_ControlTestingPlanningProcessor',
    result: result
  }));
  return result;
}
