const freeze=value=>Object.freeze(value);

export function createApprovalToCanaryHandoff({approval,playbook,checkpoint}={}) {
  if(approval?.status!=='APPROVED_FOR_CANARY')throw new Error('Approved canary decision required');
  if(!playbook?.instanceId)throw new Error('Playbook required');
  if(!checkpoint?.checkpointId)throw new Error('Rollback checkpoint required');
  return freeze({
    handoffId:`CANARY-HANDOFF-${playbook.instanceId}`,
    playbookInstanceId:playbook.instanceId,
    approvalId:approval.queueId||null,
    approvedBy:approval.reviewer,
    checkpointId:checkpoint.checkpointId,
    status:'READY_FOR_CANARY',
    evidenceCount:Number(approval.evidenceCount||0),
    environment:'CANARY',
    productionExecutionAuthorized:false
  });
}
