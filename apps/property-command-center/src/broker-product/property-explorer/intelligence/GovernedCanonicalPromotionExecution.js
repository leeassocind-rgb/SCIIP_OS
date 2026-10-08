// SCIIP Explorer 3.0 — M2.25
// Governed Canonical Promotion Execution
//
// Executes ONLY approved promotion decisions into an append-only canonical
// overlay. Base/source records are never mutated. Every execution is reversible.

const STORAGE_KEY='SCIIP_EXPLORER_M2_25_CANONICAL_EXECUTION_EVENTS_V1';

const storage=()=>globalThis?.window?.localStorage||null;
const read=()=>{
  try{
    const raw=storage()?.getItem(STORAGE_KEY)||'[]';
    const parsed=JSON.parse(raw);
    return Array.isArray(parsed)?parsed:[];
  }catch{return[]}
};
const write=events=>storage()?.setItem(STORAGE_KEY,JSON.stringify(events));
const now=()=>new Date().toISOString();
const eid=p=>`${p}-${Date.now()}-${Math.random().toString(36).slice(2,8).toUpperCase()}`;

const propertyKey=p=>String(
  p?.id||p?.propertyId||p?.canonicalPropertyId||
  p?.parcelId||p?.apn||p?.address||'UNKNOWN_PROPERTY'
);

function dispatch(property,fieldKey,type){
  try{
    window.dispatchEvent(new CustomEvent(type,{
      detail:{
        propertyId:property?.id||property?.propertyId||property?.canonicalPropertyId||null,
        fieldKey
      }
    }));
    window.dispatchEvent(new CustomEvent('sciip:property-intelligence-refresh',{
      detail:{
        propertyId:property?.id||property?.propertyId||property?.canonicalPropertyId||null,
        fieldKey
      }
    }));
  }catch{}
}

export function canonicalExecutionEvents(property){
  const k=propertyKey(property);
  return read().filter(e=>e.propertyKey===k);
}

export function activeCanonicalOverlays(property){
  const active={};
  for(const e of canonicalExecutionEvents(property)){
    if(e.type==='CANONICAL_PROMOTION_EXECUTED'){
      active[e.fieldKey]={
        executionId:e.id,
        fieldKey:e.fieldKey,
        value:e.afterValue,
        beforeValue:e.beforeValue,
        evidenceEventId:e.evidenceEventId||null,
        promotionDecisionId:e.promotionDecisionId,
        source:e.source||'GOVERNED_PROMOTION',
        executedAt:e.createdAt,
        actor:e.actor
      };
    }
    if(e.type==='CANONICAL_PROMOTION_ROLLED_BACK'){
      if(active[e.fieldKey]?.executionId===e.executionId){
        delete active[e.fieldKey];
      }
    }
  }
  return Object.freeze(active);
}

export function canonicalOverlayForField(property,fieldKey){
  return activeCanonicalOverlays(property)[fieldKey]||null;
}

export function executeApprovedPromotion({
  property,
  fieldKey,
  approved,
  promotionDecisionId,
  evidenceEventId=null,
  beforeValue=null,
  promotedValue,
  source='VERIFIED_EVIDENCE',
  actor='CURRENT_USER'
}){
  if(!property)throw new Error('property required');
  if(!fieldKey)throw new Error('fieldKey required');
  if(approved!==true)throw new Error('promotion must be explicitly approved before execution');
  if(!promotionDecisionId)throw new Error('promotionDecisionId required');
  if(promotedValue===undefined||promotedValue===null||promotedValue===''){
    throw new Error('promotedValue required');
  }

  const current=canonicalOverlayForField(property,fieldKey);
  if(current && String(current.promotionDecisionId)===String(promotionDecisionId)){
    return canonicalExecutionEvents(property).find(e=>e.id===current.executionId);
  }

  const event=Object.freeze({
    id:eid('CANONICAL-EXECUTION'),
    type:'CANONICAL_PROMOTION_EXECUTED',
    propertyKey:propertyKey(property),
    fieldKey,
    beforeValue:current?.value??beforeValue??null,
    afterValue:promotedValue,
    promotionDecisionId:String(promotionDecisionId),
    evidenceEventId:evidenceEventId?String(evidenceEventId):null,
    source:String(source||'VERIFIED_EVIDENCE'),
    actor,
    createdAt:now(),
    mode:'GOVERNED_OVERLAY',
    baseMutation:false,
    directWrite:false,
    reversible:true
  });

  const events=read();events.push(event);write(events);
  dispatch(property,fieldKey,'sciip:canonical-promotion-executed');
  return event;
}

export function rollbackCanonicalPromotion({
  property,
  executionId,
  reason,
  actor='CURRENT_USER'
}){
  if(!property)throw new Error('property required');
  if(!executionId)throw new Error('executionId required');
  if(!String(reason||'').trim())throw new Error('rollback reason required');

  const events=canonicalExecutionEvents(property);
  const execution=events.find(e=>
    e.id===executionId&&e.type==='CANONICAL_PROMOTION_EXECUTED'
  );
  if(!execution)throw new Error('canonical execution not found');

  const already=events.find(e=>
    e.type==='CANONICAL_PROMOTION_ROLLED_BACK'&&e.executionId===executionId
  );
  if(already)return already;

  const event=Object.freeze({
    id:eid('CANONICAL-ROLLBACK'),
    type:'CANONICAL_PROMOTION_ROLLED_BACK',
    propertyKey:execution.propertyKey,
    fieldKey:execution.fieldKey,
    executionId,
    restoredValue:execution.beforeValue,
    removedValue:execution.afterValue,
    reason:String(reason).trim(),
    actor,
    createdAt:now(),
    mode:'GOVERNED_ROLLBACK',
    baseMutation:false,
    directWrite:false
  });

  const all=read();all.push(event);write(all);
  dispatch(property,execution.fieldKey,'sciip:canonical-promotion-rolled-back');
  return event;
}

export function applyCanonicalOverlays(property){
  if(!property||typeof property!=='object')return property;
  const overlays=activeCanonicalOverlays(property);
  const next={...property};

  for(const [fieldKey,overlay] of Object.entries(overlays)){
    // Known canonical aliases. Never delete original source fields.
    if(fieldKey==='landUse'){
      next.landUse=overlay.value;
      next.canonicalLandUse=overlay.value;
    }else if(fieldKey==='assessedTotal'){
      next.assessedTotal=overlay.value;
      next.assessedValue=overlay.value;
      next.canonicalAssessedTotal=overlay.value;
    }else if(fieldKey==='propertyType'){
      next.propertyType=overlay.value;
      next.canonicalPropertyType=overlay.value;
    }else if(fieldKey==='clearHeight'){
      next.clearHeight=overlay.value;
      next.clearHeightFt=overlay.value;
    }else{
      next[fieldKey]=overlay.value;
    }
  }

  return Object.freeze(next);
}

export function clearCanonicalExecutionEventsForTests(){
  storage()?.removeItem(STORAGE_KEY);
}
