/**
 * SCIIP_OS v6.0 — 12760_ClusterHealthGovernanceProcessor
 */
function sciipRun12760_ClusterHealthGovernanceProcessor() {
  var cfg = {
    processorNumber: 12760,
    processorName: 'ClusterHealthGovernance',
    component: 'Cluster Health Monitor',
    sourceSheet: 'ARCHIVE_HEALTH_SIGNAL',
    targetSheet: 'CLUSTER_HEALTH_GOVERNANCE',
    statusField: 'clusterHealthGovernanceStatus',
    nextAction: 'Run 12770_ClusterHealthValidationProcessor after this processor completes.'
  };
  return SCIIP_DISTRIBUTED_RUNTIME_STORAGE.executeControlPlaneOnly(cfg);
}

function sciipTest12760_ClusterHealthGovernanceProcessor() {
  var result = sciipRun12760_ClusterHealthGovernanceProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest12760_ClusterHealthGovernanceProcessor', result: result }));
  return result;
}
