// M2.54 — presentation-only governed action feedback.
export const STATES=Object.freeze({IDLE:'IDLE',PENDING:'PENDING',SUCCEEDED:'SUCCEEDED',FAILED:'FAILED'});
const norm=v=>String(v||'').trim().toUpperCase();
export function resolveGovernedPropertyIntelligenceActionFeedback({optimisticExecution=null,authoritativeEvent=null,propertyId=null}={}){
 const opid=optimisticExecution?.propertyId||optimisticExecution?.property?.id||null;
 const auid=authoritativeEvent?.propertyId||authoritativeEvent?.property?.id||null;
 if(propertyId&&((opid&&opid!==propertyId)||(auid&&auid!==propertyId)))return {state:STATES.IDLE,propertyId,visible:false,authoritative:false,canRetry:false,canReview:false,message:null};
 const a=norm(authoritativeEvent?.status||authoritativeEvent?.result?.status||authoritativeEvent?.executionStatus);
 if(['FAILED','FAILURE','REJECTED','ERROR'].includes(a))return {state:STATES.FAILED,propertyId,visible:true,authoritative:true,canRetry:true,canReview:true,message:authoritativeEvent?.message||authoritativeEvent?.result?.message||'Action could not be completed. Review the governed result before retrying.'};
 if(['SUCCEEDED','SUCCESS','COMPLETED','EXECUTED'].includes(a))return {state:STATES.SUCCEEDED,propertyId,visible:true,authoritative:true,canRetry:false,canReview:true,message:authoritativeEvent?.message||authoritativeEvent?.result?.message||'Action completed and reconciled to the authoritative governed result.'};
 const o=norm(optimisticExecution?.status||optimisticExecution?.executionStatus||optimisticExecution?.projection?.status);
 if(['PENDING','EXECUTING','OPTIMISTIC','REQUESTED','QUEUED'].includes(o))return {state:STATES.PENDING,propertyId,visible:true,authoritative:false,canRetry:false,canReview:false,message:'Action submitted. Awaiting authoritative governed reconciliation.'};
 return {state:STATES.IDLE,propertyId,visible:false,authoritative:false,canRetry:false,canReview:false,message:null};
}
export function governedActionFeedbackLabel(f){return f?.state==='PENDING'?'Pending':f?.state==='SUCCEEDED'?'Completed':f?.state==='FAILED'?'Action Failed':'';}
