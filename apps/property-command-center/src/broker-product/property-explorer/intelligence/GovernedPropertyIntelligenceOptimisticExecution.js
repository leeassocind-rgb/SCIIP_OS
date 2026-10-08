// SCIIP Explorer 3.0 — M2.53
// Governed Property Intelligence Action Execution & Optimistic UI Reconciliation
//
// This contract never performs canonical mutation. It projects UI state around
// an already-authorized governed action and reconciles against the engine result.

const freeze=x=>Object.freeze(x);

function propertyIdOf(value){
  if(value==null)return null;
  if(typeof value==='string'||typeof value==='number')return String(value);
  return value?.propertyId||value?.id||value?.canonicalPropertyId||value?.parcelId||value?.apn||null;
}

export function beginOptimisticGovernedAction({
  action,
  property,
  fieldKey=null,
  decision=null,
  revision=0
}={}){
  return freeze({
    milestone:'M2.53',
    phase:'OPTIMISTIC_PENDING',
    action:String(action||'UNKNOWN'),
    propertyId:propertyIdOf(property),
    fieldKey,
    decision,
    revision:Number(revision||0),
    optimistic:true,
    authoritative:false,
    reconciled:false,
    result:null,
    error:null,
    invariants:freeze({
      uiProjectionOnly:true,
      engineAuthoritative:true,
      canonicalMutation:false,
      automaticCanonicalWrites:false
    })
  });
}

export function reconcileGovernedActionExecution(optimistic,result,error=null){
  const failed=!!error||result?.ok===false||result?.status==='ERROR'||result?.status==='FAILED';
  return freeze({
    ...optimistic,
    phase:failed?'RECONCILED_FAILED':'RECONCILED_SUCCESS',
    optimistic:false,
    authoritative:true,
    reconciled:true,
    result:result||null,
    error:error?String(error?.message||error):null,
    completedAt:new Date().toISOString(),
    invariants:freeze({
      uiProjectionOnly:true,
      engineAuthoritative:true,
      canonicalMutation:false,
      automaticCanonicalWrites:false
    })
  });
}
