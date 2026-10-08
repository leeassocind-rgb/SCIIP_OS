import{
  listDecisionEvents,
  listPromotionQueue
}from'./GovernedDecisionStore.js';
import{
  listCanonicalExecutionEvents,
  getCanonicalOverlay
}from'./CanonicalPromotionExecutor.js';

function freeze(value){return Object.freeze(value);}

function latest(rows){
  return rows.slice().sort((a,b)=>String(b.occurredAt||b.reviewedAt||b.createdAt||'').localeCompare(String(a.occurredAt||a.reviewedAt||a.createdAt||'')))[0]||null;
}

export function buildFieldDecisionLifecycle(propertyId,fieldKey){
  const decisions=listDecisionEvents({propertyId}).filter(x=>x.fieldKey===fieldKey);
  const promotions=listPromotionQueue({propertyId}).filter(x=>x.fieldKey===fieldKey);
  const executions=listCanonicalExecutionEvents({propertyId}).filter(x=>x.fieldKey===fieldKey);
  const overlay=getCanonicalOverlay(propertyId,fieldKey);

  const latestDecision=latest(decisions.filter(x=>x.eventType==='ATTRIBUTE_RESOLUTION_DECISION'));
  const latestApproval=latest(decisions.filter(x=>x.eventType==='ATTRIBUTE_PROMOTION_APPROVAL'));
  const latestPromotion=latest(promotions);
  const latestExecution=latest(executions);
  const latestRollback=latest(executions.filter(x=>x.eventType==='CANONICAL_ATTRIBUTE_PROMOTION_ROLLED_BACK'));
  const latestExecute=latest(executions.filter(x=>x.eventType==='CANONICAL_ATTRIBUTE_PROMOTION_EXECUTED'));

  let state='UNRESOLVED';
  if(latestDecision?.decisionStatus==='REJECTED_EXTERNAL_EVIDENCE')state='REJECTED';
  else if(latestDecision?.decisionStatus==='DEFERRED_REVIEW')state='DEFERRED';
  else if(latestPromotion?.status==='REJECTED_PROMOTION')state='REJECTED';
  else if(latestPromotion?.status==='DEFERRED_APPROVAL')state='DEFERRED';
  else if(overlay)state='EXECUTED';
  else if(latestRollback&&(!latestExecute||String(latestRollback.occurredAt)>=String(latestExecute.occurredAt)))state='ROLLED_BACK';
  else if(latestPromotion?.status==='APPROVED_FOR_EXECUTION')state='APPROVED';
  else if(latestPromotion?.status==='PENDING_APPROVAL'||latestDecision?.decisionStatus==='PROPOSED_PROMOTION')state='PROPOSED';

  const proposedValue=
    latestPromotion?.proposedValue ??
    latestDecision?.externalEvidence ??
    latestExecute?.canonicalAfter ??
    latestRollback?.canonicalBefore ??
    null;

  const canonicalBefore=
    latestRollback?.canonicalAfter ??
    latestExecute?.canonicalBefore ??
    latestPromotion?.canonicalBefore ??
    latestDecision?.canonicalBefore ??
    null;

  return freeze({
    propertyId,
    fieldKey,
    state,
    proposedValue,
    canonicalBefore,
    activeCanonicalValue:overlay?.value??null,
    overlayActive:Boolean(overlay),
    latestDecision,
    latestApproval,
    latestPromotion,
    latestExecution,
    events:freeze([...decisions,...executions]),
    closed:['EXECUTED','REJECTED','DEFERRED'].includes(state),
    candidateVisible:['UNRESOLVED','ROLLED_BACK'].includes(state),
    refreshDurable:true
  });
}

export function buildDecisionLifecycleRegistry(propertyId,fieldKeys=[]){
  const inferred=new Set(fieldKeys);
  for(const row of listDecisionEvents({propertyId}))if(row.fieldKey)inferred.add(row.fieldKey);
  for(const row of listPromotionQueue({propertyId}))if(row.fieldKey)inferred.add(row.fieldKey);
  for(const row of listCanonicalExecutionEvents({propertyId}))if(row.fieldKey)inferred.add(row.fieldKey);

  const fields=[...inferred].map(fieldKey=>buildFieldDecisionLifecycle(propertyId,fieldKey));
  return freeze({
    status:'ACTIVE',
    propertyId,
    reconstruction:'EVENT_DERIVED',
    refreshDurable:true,
    fields:freeze(fields),
    counts:freeze({
      proposed:fields.filter(x=>x.state==='PROPOSED').length,
      approved:fields.filter(x=>x.state==='APPROVED').length,
      executed:fields.filter(x=>x.state==='EXECUTED').length,
      rolledBack:fields.filter(x=>x.state==='ROLLED_BACK').length,
      rejected:fields.filter(x=>x.state==='REJECTED').length,
      deferred:fields.filter(x=>x.state==='DEFERRED').length
    })
  });
}
