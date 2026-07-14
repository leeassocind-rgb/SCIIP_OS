/**
 * SCIIP_OS v6.0 — 17310 CachingPolicyRegistry
 */
function sciipRun17310_CachingPolicyRegistryProcessor() {
  return SCIIP_STORAGE_CACHING_BACKEND.executeCachingPlan({
    processorNumber: 17310,
    processorName: 'CachingPolicyRegistry',
    statusField: 'cachingPolicyRegistryStatus',
    component: 'Storage Caching Execution',
    backendLayer: 'Storage Caching',
    sourceSheet: 'STORAGE_CACHING_READINESS',
    targetSheet: 'CACHING_POLICY_REGISTRY',
    nextAction: 'Run 17320_CacheHitAssessmentProcessor after this processor completes.'
  });
}

function sciipTest17310_CachingPolicyRegistryProcessor() {
  var result = sciipRun17310_CachingPolicyRegistryProcessor();
  console.log(JSON.stringify({
    test: 'sciipTest17310_CachingPolicyRegistryProcessor',
    result: result
  }));
  return result;
}
