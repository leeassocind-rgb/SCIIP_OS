const freeze=value=>Object.freeze(value);
const clone=value=>JSON.parse(JSON.stringify(value));

export function createCanaryRollbackManager() {
  const checkpoints=new Map();
  const createCheckpoint=({runId,state,evidenceDigest}={})=>{
    if(!runId||!evidenceDigest)throw new Error('runId and evidenceDigest required');
    const checkpoint=freeze({
      checkpointId:`RB-${checkpoints.size+1}`,
      runId,
      state:freeze(clone(state||{})),
      evidenceDigest,
      status:'AVAILABLE',
      createdAt:new Date().toISOString()
    });
    checkpoints.set(runId,checkpoint);
    return checkpoint;
  };
  const rollback=({runId,reason,approvedBy}={})=>{
    const checkpoint=checkpoints.get(runId);
    if(!checkpoint)throw new Error('Rollback checkpoint not found');
    if(!reason||!approvedBy)throw new Error('Rollback approval and reason required');
    return freeze({
      status:'ROLLED_BACK',
      runId,
      checkpointId:checkpoint.checkpointId,
      restoredState:checkpoint.state,
      reason,
      approvedBy,
      productionMutation:false,
      rolledBackAt:new Date().toISOString()
    });
  };
  return freeze({
    createCheckpoint,rollback,
    snapshot:()=>freeze({checkpoints:checkpoints.size,rollbackReady:true,productionMutation:false})
  });
}
