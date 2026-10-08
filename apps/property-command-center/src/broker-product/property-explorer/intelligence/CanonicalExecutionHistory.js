import{
  listCanonicalExecutionEvents,
  listCanonicalOverlays,
  rollbackCanonicalOverlay
}from'./CanonicalPromotionExecutor.js';

function freeze(value){return Object.freeze(value);}

export function buildCanonicalExecutionHistory(propertyId){
  const events=listCanonicalExecutionEvents({propertyId});
  const overlays=listCanonicalOverlays({propertyId});

  const rows=events
    .slice()
    .sort((a,b)=>String(b.occurredAt||'').localeCompare(String(a.occurredAt||'')))
    .map(event=>freeze({
      eventId:event.eventId,
      eventType:event.eventType,
      occurredAt:event.occurredAt,
      actor:event.actor||'CURRENT_USER',
      reason:event.reason||'',
      fieldKey:event.fieldKey,
      canonicalBefore:event.canonicalBefore??null,
      canonicalAfter:event.canonicalAfter??null,
      sourcePromotionId:event.sourcePromotionId||null,
      sourceDecisionEventId:event.sourceDecisionEventId||null,
      sourceProviders:event.sourceProviders||[],
      mutationType:event.mutationType||null,
      reversible:Boolean(event.reversible),
      rolledBack:event.eventType==='CANONICAL_ATTRIBUTE_PROMOTION_ROLLED_BACK'
    }));

  return freeze({
    status:'ACTIVE',
    propertyId,
    appendOnly:true,
    canonicalAuthority:'SCIIP',
    activeOverlays:freeze(overlays),
    events:freeze(rows),
    counts:freeze({
      executions:rows.filter(x=>x.eventType==='CANONICAL_ATTRIBUTE_PROMOTION_EXECUTED').length,
      rollbacks:rows.filter(x=>x.eventType==='CANONICAL_ATTRIBUTE_PROMOTION_ROLLED_BACK').length,
      activeOverlays:overlays.length
    })
  });
}

export function validateRollbackRequest(propertyId,fieldKey,{reason='',confirmed=false}={}){
  if(!propertyId)return freeze({valid:false,error:'PROPERTY_ID_REQUIRED'});
  if(!fieldKey)return freeze({valid:false,error:'FIELD_KEY_REQUIRED'});
  if(!confirmed)return freeze({valid:false,error:'CONFIRMATION_REQUIRED'});
  if(!String(reason||'').trim())return freeze({valid:false,error:'REASON_REQUIRED'});
  const overlay=listCanonicalOverlays({propertyId}).find(x=>x.fieldKey===fieldKey);
  if(!overlay)return freeze({valid:false,error:'ACTIVE_OVERLAY_NOT_FOUND'});
  return freeze({valid:true,overlay});
}

export function rollbackExecution(propertyId,fieldKey,{
  actor='CURRENT_USER',
  reason='',
  confirmed=false,
  timestamp
}={}){
  const validation=validateRollbackRequest(propertyId,fieldKey,{reason,confirmed});
  if(!validation.valid)throw new Error(validation.error);

  const event=rollbackCanonicalOverlay(propertyId,fieldKey,{
    actor,
    reason:String(reason).trim(),
    ...(timestamp?{timestamp}:{})
  });

  return freeze({
    status:'ROLLED_BACK',
    event,
    restoredCanonicalValue:event.canonicalAfter??null,
    history:buildCanonicalExecutionHistory(propertyId)
  });
}
