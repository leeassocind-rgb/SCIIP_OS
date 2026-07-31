import { createCheckpointStore } from '../../enterprise-operations/checkpointStore.js';
import { createIngestionRecoveryJournal } from './ingestionRecoveryJournal.js';
import { createIngestionReplayPlan } from './ingestionReplayPlanner.js';

const freeze=value=>Object.freeze(value);

export function createIngestionRecoveryEngine({
  checkpointStore=createCheckpointStore(),
  journal=createIngestionRecoveryJournal()
}={}){
  const failures=new Map();
  let replays=0;

  const recordCheckpoint=checkpoint=>{
    const saved=checkpointStore.write(checkpoint);
    journal.append({
      id:`CHECKPOINT:${checkpoint.stream}:${saved.offset}`,
      operationId:checkpoint.operationId||checkpoint.stream,
      type:'CHECKPOINT_RECORDED',
      checkpoint:saved,
      createdAt:saved.updatedAt
    });
    return saved;
  };

  const recordFailure=input=>{
    if(!input?.operationId)throw new Error('Failure operation id is required');
    const checkpoint=checkpointStore.read(input.stream||input.operationId);
    if(!checkpoint)throw new Error('Recovery checkpoint not found');
    const plan=createIngestionReplayPlan({...input,checkpoint});
    failures.set(input.operationId,plan);
    journal.append({
      id:`FAILURE:${input.operationId}:${plan.failedChunk}`,
      operationId:input.operationId,
      type:'FAILURE_RECORDED',
      plan,
      createdAt:new Date().toISOString()
    });
    return plan;
  };

  const approveReplay=({operationId,actorId,reason}={})=>{
    const prior=failures.get(operationId);
    if(!prior)throw new Error('Recovery failure record not found');
    if(!actorId)throw new Error('Replay approver is required');
    if(!reason)throw new Error('Replay approval reason is required');
    const approved=createIngestionReplayPlan({
      ...prior,
      checkpoint:prior.checkpoint,
      error:prior.error,
      approved:true
    });
    const record=freeze({
      ...approved,
      approvedBy:String(actorId),
      approvalReason:String(reason),
      approvedAt:new Date().toISOString()
    });
    failures.set(operationId,record);
    journal.append({
      id:`APPROVAL:${operationId}:${record.resumeChunk}`,
      operationId,
      type:'REPLAY_APPROVED',
      replay:record,
      createdAt:record.approvedAt
    });
    return record;
  };

  const replay=({operationId,executeChunk}={})=>{
    const plan=failures.get(operationId);
    if(!plan?.replayAuthorized)throw new Error('Replay is not authorized');
    if(typeof executeChunk!=='function')throw new Error('Replay chunk executor is required');

    const results=[];
    for(let chunk=plan.resumeChunk;chunk<plan.totalChunks;chunk++){
      const result=executeChunk(chunk);
      results.push(freeze({chunk,result}));
      recordCheckpoint({
        stream:plan.checkpoint.stream,
        operationId,
        offset:chunk+1,
        updatedAt:new Date().toISOString()
      });
    }
    replays++;
    const completed=freeze({
      id:`REPLAY-COMPLETE:${operationId}:${plan.totalChunks}`,
      operationId,
      status:'REPLAY_COMPLETED',
      replayedChunks:results.length,
      results:freeze(results),
      finalCheckpoint:checkpointStore.read(plan.checkpoint.stream),
      duplicateSafe:true,
      sourceMutationAllowed:false
    });
    journal.append({
      id:completed.id,
      operationId,
      type:'REPLAY_COMPLETED',
      replay:completed,
      createdAt:new Date().toISOString()
    });
    return completed;
  };

  return Object.freeze({
    recordCheckpoint,
    recordFailure,
    approveReplay,
    replay,
    getPlan:operationId=>failures.get(operationId)||null,
    getJournal:()=>journal.list(),
    snapshot:()=>freeze({
      status:'OPERATIONAL',
      failures:failures.size,
      replays,
      checkpoints:checkpointStore.all().length,
      journalEntries:journal.list().length,
      appendOnly:true,
      approvalRequired:true,
      destructiveExecutionAllowed:false
    })
  });
}
