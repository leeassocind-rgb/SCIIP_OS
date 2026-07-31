import { planRecovery } from '../../production-enterprise/recoveryManager.js';

const freeze=value=>Object.freeze(value);

export function createIngestionReplayPlan({
  operationId,
  backupId,
  checkpoint,
  failedChunk,
  totalChunks,
  error,
  approved=false,
  rtoMinutes=60,
  rpoMinutes=15
}={}){
  if(!operationId)throw new Error('Replay operation id is required');
  if(!backupId)throw new Error('Replay backup id is required');
  if(!checkpoint?.stream)throw new Error('Replay checkpoint is required');
  const recovery=planRecovery({backupId,rtoMinutes,rpoMinutes,approved});
  const resumeChunk=Math.max(
    Number(checkpoint.offset||0),
    Number(failedChunk||0)
  );

  return freeze({
    id:`REPLAY:${operationId}:${resumeChunk}`,
    operationId,
    backupId,
    checkpoint:freeze({...checkpoint}),
    failedChunk:Number(failedChunk||0),
    totalChunks:Number(totalChunks||0),
    resumeChunk,
    remainingChunks:Math.max(0,Number(totalChunks||0)-resumeChunk),
    error:freeze({
      name:error?.name||'Error',
      message:error?.message||String(error||'Unknown ingestion error'),
      code:error?.code||'INGESTION_FAILURE'
    }),
    recovery,
    status:approved?'READY_FOR_REPLAY':'PENDING_APPROVAL',
    replayAuthorized:Boolean(approved),
    destructiveExecutionBlocked:!approved,
    duplicateSafe:true,
    sourceMutationAllowed:false
  });
}
