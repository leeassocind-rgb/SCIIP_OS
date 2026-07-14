/**
 * SCIIP_OS v6.0 — 18010 PurgePolicyRegistry
 */
function sciipRun18010_PurgePolicyRegistryProcessor() {
  return SCIIP_STORAGE_PURGE_BACKEND.executePurgePlan({
    processorNumber: 18010,
    processorName: 'PurgePolicyRegistry',
    statusField: 'purgePolicyRegistryStatus',
    component: 'Storage Purge Execution',
    backendLayer: 'Storage Purge',
    sourceSheet: 'STORAGE_PURGE_READINESS',
    targetSheet: 'PURGE_POLICY_REGISTRY',
    nextAction: 'Run 18020_PurgeCandidateAssessmentProcessor after this processor completes.'
  });
}

function sciipTest18010_PurgePolicyRegistryProcessor() {
  var result = sciipRun18010_PurgePolicyRegistryProcessor();
  console.log(JSON.stringify({
    test: 'sciipTest18010_PurgePolicyRegistryProcessor',
    result: result
  }));
  return result;
}
