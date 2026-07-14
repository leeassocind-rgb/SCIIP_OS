/**
 * SCIIP_OS v6.0 — 15030 EvidenceCollectionPlanning
 *
 * Capacity-safe Storage Audit Execution processor.
 */
function sciipRun15030_EvidenceCollectionPlanningProcessor() {
  return SCIIP_STORAGE_AUDIT_BACKEND.executeAuditPlan({
    processorNumber: 15030,
    processorName: 'EvidenceCollectionPlanning',
    statusField: 'evidenceCollectionPlanningStatus',
    component: 'Storage Audit Execution',
    backendLayer: 'Storage Audit',
    sourceSheet: 'AUDIT_SCOPE_ASSESSMENT',
    targetSheet: 'EVIDENCE_COLLECTION_PLANNING',
    nextAction: 'Run 15040_ControlTestingPlanningProcessor after this processor completes.'
  });
}

function sciipTest15030_EvidenceCollectionPlanningProcessor() {
  var result = sciipRun15030_EvidenceCollectionPlanningProcessor();
  console.log(JSON.stringify({
    test: 'sciipTest15030_EvidenceCollectionPlanningProcessor',
    result: result
  }));
  return result;
}
