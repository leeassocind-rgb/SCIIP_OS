/**
 * SCIIP_OS v6.0 — 15020 AuditScopeAssessment
 *
 * Capacity-safe Storage Audit Execution processor.
 */
function sciipRun15020_AuditScopeAssessmentProcessor() {
  return SCIIP_STORAGE_AUDIT_BACKEND.executeAuditPlan({
    processorNumber: 15020,
    processorName: 'AuditScopeAssessment',
    statusField: 'auditScopeAssessmentStatus',
    component: 'Storage Audit Execution',
    backendLayer: 'Storage Audit',
    sourceSheet: 'AUDIT_POLICY_REGISTRY',
    targetSheet: 'AUDIT_SCOPE_ASSESSMENT',
    nextAction: 'Run 15030_EvidenceCollectionPlanningProcessor after this processor completes.'
  });
}

function sciipTest15020_AuditScopeAssessmentProcessor() {
  var result = sciipRun15020_AuditScopeAssessmentProcessor();
  console.log(JSON.stringify({
    test: 'sciipTest15020_AuditScopeAssessmentProcessor',
    result: result
  }));
  return result;
}
