const OVERLAY_KEY='sciip:canonical-field-overlays:v1';
const EXECUTION_KEY='sciip:canonical-execution-events:v1';

function freeze(value){return Object.freeze(value);}
function clone(value){return JSON.parse(JSON.stringify(value));}
function nowIso(){return new Date().toISOString();}

function storage(){
  if(typeof window==='undefined'||!window.localStorage)return null;
  return window.localStorage;
}

function readObject(key){
  const s=storage();
  if(!s)return{};
  try{
    const value=JSON.parse(s.getItem(key)||'{}');
    return value&&typeof value==='object'&&!Array.isArray(value)?value:{};
  }catch{return{};}
}

function writeObject(key,value){
  const s=storage();
  if(!s)return false;
  s.setItem(key,JSON.stringify(value));
  return true;
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

function overlayId(propertyId,fieldKey){
  return `${propertyId||'UNKNOWN'}::${fieldKey}`;
}

export function getCanonicalOverlay(propertyId,fieldKey){
  const overlays=readObject(OVERLAY_KEY);
  const row=overlays[overlayId(propertyId,fieldKey)]||null;
  return row?freeze(row):null;
}

export function getCanonicalOverlayValue(propertyId,fieldKey,fallback=null){
  const row=getCanonicalOverlay(propertyId,fieldKey);
  return row?row.value:fallback;
}

export function listCanonicalOverlays({propertyId=null}={}){
  const rows=Object.values(readObject(OVERLAY_KEY));
  return freeze(rows
    .filter(row=>!propertyId||row.propertyId===propertyId)
    .map(row=>freeze(row)));
}

export function listCanonicalExecutionEvents({propertyId=null}={}){
  return freeze(readArray(EXECUTION_KEY)
    .filter(event=>!propertyId||event.propertyId===propertyId)
    .map(event=>freeze(event)));
}

export function executeApprovedPromotion(promotion,{
  actor='CURRENT_USER',
  reason='',
  timestamp=nowIso()
}={}){
  if(!promotion)throw new Error('Promotion required');
  if(promotion.status!=='APPROVED_FOR_EXECUTION')throw new Error(`Promotion not approved for execution: ${promotion.status}`);
  if(!promotion.executionEligible)throw new Error('Promotion is not execution eligible');
  if(!promotion.propertyId)throw new Error('Property ID required for canonical execution');
  if(!promotion.fieldKey)throw new Error('Field key required for canonical execution');

  const overlays=readObject(OVERLAY_KEY);
  const key=overlayId(promotion.propertyId,promotion.fieldKey);
  const previous=overlays[key]||null;
  const canonicalBefore=previous?previous.value:promotion.canonicalBefore??null;

  const overlay=freeze({
    overlayId:key,
    propertyId:promotion.propertyId,
    propertyAddress:promotion.propertyAddress||null,
    fieldKey:promotion.fieldKey,
    value:promotion.proposedValue,
    normalizedValue:promotion.normalizedProposedValue??null,
    priorCanonicalValue:canonicalBefore,
    sourcePromotionId:promotion.promotionId,
    sourceDecisionEventId:promotion.sourceDecisionEventId||null,
    sourceProviders:promotion.sourceProviders||[],
    confidence:promotion.confidence||'UNRATED',
    authority:'SCIIP',
    governed:true,
    effectiveAt:timestamp,
    executedBy:actor,
    executionReason:String(reason||''),
    reversible:true
  });

  overlays[key]=clone(overlay);
  writeObject(OVERLAY_KEY,overlays);

  const event=freeze({
    eventId:`CANONICAL_EXECUTION:${promotion.propertyId}:${promotion.fieldKey}:${timestamp}`,
    eventType:'CANONICAL_ATTRIBUTE_PROMOTION_EXECUTED',
    occurredAt:timestamp,
    actor,
    reason:String(reason||''),
    propertyId:promotion.propertyId,
    propertyAddress:promotion.propertyAddress||null,
    fieldKey:promotion.fieldKey,
    canonicalBefore,
    canonicalAfter:promotion.proposedValue,
    sourcePromotionId:promotion.promotionId,
    sourceDecisionEventId:promotion.sourceDecisionEventId||null,
    sourceProviders:promotion.sourceProviders||[],
    canonicalMutation:true,
    mutationType:'GOVERNED_OVERLAY',
    reversible:true
  });

  const events=readArray(EXECUTION_KEY);
  events.push(clone(event));
  writeArray(EXECUTION_KEY,events);

  return freeze({overlay,event});
}

export function rollbackCanonicalOverlay(propertyId,fieldKey,{
  actor='CURRENT_USER',
  reason='',
  timestamp=nowIso()
}={}){
  const overlays=readObject(OVERLAY_KEY);
  const key=overlayId(propertyId,fieldKey);
  const current=overlays[key];
  if(!current)throw new Error('Canonical overlay not found');

  delete overlays[key];
  writeObject(OVERLAY_KEY,overlays);

  const event=freeze({
    eventId:`CANONICAL_ROLLBACK:${propertyId}:${fieldKey}:${timestamp}`,
    eventType:'CANONICAL_ATTRIBUTE_PROMOTION_ROLLED_BACK',
    occurredAt:timestamp,
    actor,
    reason:String(reason||''),
    propertyId,
    fieldKey,
    canonicalBefore:current.value,
    canonicalAfter:current.priorCanonicalValue??null,
    sourcePromotionId:current.sourcePromotionId||null,
    canonicalMutation:true,
    mutationType:'GOVERNED_OVERLAY_ROLLBACK',
    reversible:false
  });

  const events=readArray(EXECUTION_KEY);
  events.push(clone(event));
  writeArray(EXECUTION_KEY,events);
  return event;
}

export function clearCanonicalExecutionForTests(){
  const s=storage();
  if(!s)return false;
  s.removeItem(OVERLAY_KEY);
  s.removeItem(EXECUTION_KEY);
  return true;
}
