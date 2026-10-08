const STORAGE_KEY='sciip:governed-decision-events:v1';
const PROMOTION_KEY='sciip:governed-promotion-queue:v1';

function freeze(value){return Object.freeze(value);}
function clone(value){return JSON.parse(JSON.stringify(value));}
function nowIso(){return new Date().toISOString();}

function storage(){
  if(typeof window==='undefined'||!window.localStorage)return null;
  return window.localStorage;
}

function readArray(key){
  const s=storage();
  if(!s)return[];
  try{
    const value=JSON.parse(s.getItem(key)||'[]');
    return Array.isArray(value)?value:[];
  }catch{return[];}
}

function writeArray(key,value){
  const s=storage();
  if(!s)return false;
  s.setItem(key,JSON.stringify(value));
  return true;
}

export function appendDecisionEvent(decision,{
  propertyId=null,
  propertyAddress=null,
  source='ATTRIBUTE_RESOLUTION'
}={}){
  if(!decision)throw new Error('Decision required');
  const event=freeze({
    eventId:`DECISION_EVENT:${decision.fieldKey}:${decision.decidedAt||nowIso()}:${Math.random().toString(36).slice(2,8)}`,
    eventType:'ATTRIBUTE_RESOLUTION_DECISION',
    occurredAt:decision.decidedAt||nowIso(),
    propertyId,
    propertyAddress,
    fieldKey:decision.fieldKey,
    action:decision.action,
    decisionStatus:decision.status,
    actor:decision.actor||'CURRENT_USER',
    reason:decision.reason||'',
    canonicalBefore:decision.canonicalBefore??null,
    externalEvidence:decision.externalEvidence??null,
    normalizedExternalValue:decision.normalizedExternalValue??null,
    canonicalMutation:false,
    approvalRequired:Boolean(decision.approvalRequired),
    source,
    audit:decision.audit||null
  });

  const events=readArray(STORAGE_KEY);
  events.push(clone(event));
  writeArray(STORAGE_KEY,events);

  if(decision.status==='PROPOSED_PROMOTION'){
    enqueuePromotion(event);
  }

  return event;
}

function enqueuePromotion(event){
  const queue=readArray(PROMOTION_KEY);
  const existing=queue.find(item=>
    item.propertyId===event.propertyId&&
    item.fieldKey===event.fieldKey&&
    ['PENDING_APPROVAL','APPROVED_FOR_EXECUTION'].includes(item.status)
  );
  if(existing)return existing;

  const promotion={
    promotionId:`PROMOTION:${event.propertyId||'UNKNOWN'}:${event.fieldKey}:${event.occurredAt}`,
    propertyId:event.propertyId,
    propertyAddress:event.propertyAddress,
    fieldKey:event.fieldKey,
    canonicalBefore:event.canonicalBefore,
    proposedValue:event.externalEvidence,
    normalizedProposedValue:event.normalizedExternalValue,
    sourceDecisionEventId:event.eventId,
    sourceProviders:event.audit?.source||[],
    confidence:event.audit?.confidence||'UNRATED',
    status:'PENDING_APPROVAL',
    createdAt:event.occurredAt,
    reviewedAt:null,
    reviewedBy:null,
    reviewReason:'',
    canonicalMutation:false,
    executionEligible:false
  };
  queue.push(promotion);
  writeArray(PROMOTION_KEY,queue);
  return freeze(promotion);
}

export function listDecisionEvents({propertyId=null}={}){
  const events=readArray(STORAGE_KEY);
  return freeze(events
    .filter(event=>!propertyId||event.propertyId===propertyId)
    .map(event=>freeze(event)));
}

export function listPromotionQueue({propertyId=null,status=null}={}){
  const rows=readArray(PROMOTION_KEY);
  return freeze(rows
    .filter(item=>(!propertyId||item.propertyId===propertyId)&&(!status||item.status===status))
    .map(item=>freeze(item)));
}

export function decidePromotion(promotionId,action,{
  actor='CURRENT_USER',
  reason='',
  timestamp=nowIso()
}={}){
  if(!['APPROVE','REJECT','DEFER'].includes(action))throw new Error(`Unsupported approval action: ${action}`);
  const queue=readArray(PROMOTION_KEY);
  const idx=queue.findIndex(item=>item.promotionId===promotionId);
  if(idx<0)throw new Error('Promotion not found');

  const current=queue[idx];
  if(current.status!=='PENDING_APPROVAL'&&action!=='DEFER'){
    throw new Error(`Promotion is not pending approval: ${current.status}`);
  }

  const status=
    action==='APPROVE'?'APPROVED_FOR_EXECUTION':
    action==='REJECT'?'REJECTED_PROMOTION':
    'DEFERRED_APPROVAL';

  const updated={
    ...current,
    status,
    reviewedAt:timestamp,
    reviewedBy:actor,
    reviewReason:String(reason||''),
    canonicalMutation:false,
    executionEligible:action==='APPROVE'
  };
  queue[idx]=updated;
  writeArray(PROMOTION_KEY,queue);

  const approvalEvent={
    eventId:`APPROVAL_EVENT:${promotionId}:${timestamp}`,
    eventType:'ATTRIBUTE_PROMOTION_APPROVAL',
    occurredAt:timestamp,
    propertyId:current.propertyId,
    propertyAddress:current.propertyAddress,
    fieldKey:current.fieldKey,
    action,
    decisionStatus:status,
    actor,
    reason:String(reason||''),
    canonicalBefore:current.canonicalBefore,
    externalEvidence:current.proposedValue,
    canonicalMutation:false,
    approvalRequired:false,
    source:'GOVERNED_APPROVAL',
    audit:{
      promotionId,
      sourceDecisionEventId:current.sourceDecisionEventId,
      confidence:current.confidence,
      source:current.sourceProviders
    }
  };
  const events=readArray(STORAGE_KEY);
  events.push(approvalEvent);
  writeArray(STORAGE_KEY,events);

  return freeze(updated);
}

export function getDecisionWorkflowState({propertyId=null}={}){
  const events=listDecisionEvents({propertyId});
  const promotions=listPromotionQueue({propertyId});
  return freeze({
    status:'ACTIVE',
    persistence:storage()?'LOCAL_DURABLE':'MEMORY_UNAVAILABLE',
    eventSourcing:'APPEND_ONLY',
    canonicalAuthority:'SCIIP',
    automaticWrites:false,
    canonicalExecutionImplemented:false,
    events,
    promotions,
    counts:freeze({
      events:events.length,
      pending:promotions.filter(x=>x.status==='PENDING_APPROVAL').length,
      approved:promotions.filter(x=>x.status==='APPROVED_FOR_EXECUTION').length,
      rejected:promotions.filter(x=>x.status==='REJECTED_PROMOTION').length,
      deferred:promotions.filter(x=>x.status==='DEFERRED_APPROVAL').length
    })
  });
}

export function clearDecisionWorkflowForTests(){
  const s=storage();
  if(!s)return false;
  s.removeItem(STORAGE_KEY);
  s.removeItem(PROMOTION_KEY);
  return true;
}
