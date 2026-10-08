// SCIIP Explorer 3.0 — M2.55
// Governed Property Intelligence Action Recovery & Retry Lifecycle
//
// Presentation/runtime recovery contract only. Existing governed engines execute
// authoritative actions. This module tracks retry lineage and recovery state.

const freeze=x=>Object.freeze(x);
const norm=v=>String(v||'').trim().toUpperCase();

export const RECOVERY_STATES=freeze({
  IDLE:'IDLE',
  REVIEW_REQUIRED:'REVIEW_REQUIRED',
  RETRY_READY:'RETRY_READY',
  RETRY_PENDING:'RETRY_PENDING',
  RECOVERED:'RECOVERED',
  RETRY_FAILED:'RETRY_FAILED'
});

export function resolveGovernedActionRecovery({
  feedback=null,
  previousRecovery=null,
  propertyId=null
}={}){
  if(!feedback?.visible||feedback?.propertyId&&propertyId&&feedback.propertyId!==propertyId){
    return freeze({
      state:RECOVERY_STATES.IDLE,
      propertyId,
      retryCount:Number(previousRecovery?.retryCount||0),
      retryOf:previousRecovery?.retryOf||null,
      canRetry:false,
      canReview:false,
      authoritative:false,
      automaticCanonicalWrites:false
    });
  }

  if(feedback.state==='FAILED'){
    return freeze({
      state:RECOVERY_STATES.RETRY_READY,
      propertyId,
      retryCount:Number(previousRecovery?.retryCount||0),
      retryOf:previousRecovery?.retryOf||feedback?.executionId||null,
      canRetry:true,
      canReview:true,
      authoritative:!!feedback.authoritative,
      automaticCanonicalWrites:false
    });
  }

  if(feedback.state==='SUCCEEDED'){
    return freeze({
      state:RECOVERY_STATES.RECOVERED,
      propertyId,
      retryCount:Number(previousRecovery?.retryCount||0),
      retryOf:previousRecovery?.retryOf||null,
      canRetry:false,
      canReview:true,
      authoritative:!!feedback.authoritative,
      automaticCanonicalWrites:false
    });
  }

  return freeze({
    state:RECOVERY_STATES.REVIEW_REQUIRED,
    propertyId,
    retryCount:Number(previousRecovery?.retryCount||0),
    retryOf:previousRecovery?.retryOf||null,
    canRetry:false,
    canReview:true,
    authoritative:false,
    automaticCanonicalWrites:false
  });
}

export function beginGovernedActionRetry({
  propertyId,
  action,
  fieldKey=null,
  decision=null,
  previousRecovery=null,
  failedExecution=null
}={}){
  const retryCount=Number(previousRecovery?.retryCount||0)+1;
  const retryOf=
    failedExecution?.executionId||
    failedExecution?.id||
    previousRecovery?.retryOf||
    null;

  return freeze({
    milestone:'M2.55',
    state:RECOVERY_STATES.RETRY_PENDING,
    propertyId,
    action:norm(action),
    fieldKey,
    decision,
    retryCount,
    retryOf,
    requestedAt:new Date().toISOString(),
    invariants:freeze({
      retryUsesGovernedActionPath:true,
      engineAuthoritative:true,
      canonicalMutation:false,
      automaticCanonicalWrites:false
    })
  });
}

export function reconcileGovernedActionRetry(retry,result,error=null){
  const failed=!!error||result?.ok===false||['FAILED','ERROR','REJECTED'].includes(norm(result?.status));
  return freeze({
    ...retry,
    state:failed?RECOVERY_STATES.RETRY_FAILED:RECOVERY_STATES.RECOVERED,
    result:result||null,
    error:error?String(error?.message||error):null,
    authoritative:true,
    completedAt:new Date().toISOString(),
    invariants:freeze({
      retryUsesGovernedActionPath:true,
      engineAuthoritative:true,
      canonicalMutation:false,
      automaticCanonicalWrites:false
    })
  });
}
