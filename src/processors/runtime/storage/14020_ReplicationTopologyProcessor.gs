/**
 * SCIIP_OS v6.0 — 14020_ReplicationTopologyProcessor
 */
function sciipRun14020_ReplicationTopologyProcessor() {
  var cfg = {
    processorNumber: 14020,
    processorName: 'ReplicationTopology',
    component: 'Storage Replication Execution',
    backendLayer: 'Storage Replication',
    sourceSheet: 'REPLICATION_POLICY_REGISTRY',
    targetSheet: 'REPLICATION_TOPOLOGY',
    statusField: 'replicationTopologyStatus',
    nextAction: 'Run 14030_ReplicationPlanningProcessor after this processor completes.'
  };
  return SCIIP_STORAGE_REPLICATION_BACKEND.executeReplicationPlan(cfg);
}

function sciipTest14020_ReplicationTopologyProcessor() {
  var result = sciipRun14020_ReplicationTopologyProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest14020_ReplicationTopologyProcessor', result: result }));
  return result;
}
