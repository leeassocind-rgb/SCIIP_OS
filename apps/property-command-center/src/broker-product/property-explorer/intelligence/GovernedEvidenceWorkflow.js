// SCIIP Explorer 3.0 — M2.23
// Governed Evidence Intake & Verification
//
// Append-only evidence lifecycle:
// REQUESTED -> EVIDENCE_ATTACHED -> VERIFIED | REJECTED
//
// No canonical mutation. No automatic promotion.

const STORAGE_KEY='SCIIP_EXPLORER_M2_23_EVIDENCE_EVENTS_V1';

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
const id=prefix=>`${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,8).toUpperCase()}`;
const key=p=>String(p?.id||p?.propertyId||p?.canonicalPropertyId||p?.parcelId||p?.apn||p?.address||'UNKNOWN');

export const EVIDENCE_STATUS=Object.freeze({
  REQUESTED:'REQUESTED',
  EVIDENCE_ATTACHED:'EVIDENCE_ATTACHED',
  VERIFIED:'VERIFIED',
  REJECTED:'REJECTED'
});

export function evidenceEvents(property){
  const k=key(property);
  return read().filter(e=>e.propertyKey===k);
}

export function latestEvidenceState(property,fieldKey){
  const events=evidenceEvents(property).filter(e=>e.fieldKey===fieldKey);
  return events.at(-1)||null;
}

export function openEvidenceReview({property,gap,requestId=null,actor='CURRENT_USER'}){
  if(!gap?.fieldKey)throw new Error('gap.fieldKey required');
  const existing=latestEvidenceState(property,gap.fieldKey);
  if(existing&&[EVIDENCE_STATUS.REQUESTED,EVIDENCE_STATUS.EVIDENCE_ATTACHED].includes(existing.status))return existing;

  const event=Object.freeze({
    id:id('EVIDENCE-REQUEST'),
    type:'EVIDENCE_REVIEW_REQUESTED',
    propertyKey:key(property),
    fieldKey:gap.fieldKey,
    fieldLabel:gap.label||gap.fieldKey,
    requestId,
    gapType:gap.type||'UNKNOWN',
    priority:Number(gap.priorityScore??gap.priority??0),
    recommendedSource:gap.recommendedSource||gap.source||'VERIFIED_EXTERNAL_SOURCE',
    status:EVIDENCE_STATUS.REQUESTED,
    actor,
    createdAt:now(),
    canonicalWrite:false,
    automaticPromotion:false
  });

  const events=read();events.push(event);write(events);return event;
}

export function attachEvidence({
  property,
  fieldKey,
  value,
  source,
  reference,
  asOfDate=null,
  actor='CURRENT_USER'
}){
  if(!fieldKey)throw new Error('fieldKey required');
  if(value===undefined||value===null||value==='')throw new Error('evidence value required');
  if(!source)throw new Error('evidence source required');

  const event=Object.freeze({
    id:id('EVIDENCE'),
    type:'EVIDENCE_ATTACHED',
    propertyKey:key(property),
    fieldKey,
    value,
    source:String(source),
    reference:String(reference||'MANUAL_EVIDENCE'),
    asOfDate,
    status:EVIDENCE_STATUS.EVIDENCE_ATTACHED,
    actor,
    createdAt:now(),
    canonicalWrite:false,
    automaticPromotion:false
  });

  const events=read();events.push(event);write(events);return event;
}

export function verifyEvidence({
  property,
  fieldKey,
  decision,
  rationale='',
  actor='CURRENT_USER'
}){
  if(!fieldKey)throw new Error('fieldKey required');
  if(!['VERIFIED','REJECTED'].includes(decision))throw new Error('decision must be VERIFIED or REJECTED');

  const current=latestEvidenceState(property,fieldKey);
  if(!current||current.status!==EVIDENCE_STATUS.EVIDENCE_ATTACHED){
    throw new Error('evidence must be attached before verification');
  }

  const event=Object.freeze({
    id:id('EVIDENCE-DECISION'),
    type:'EVIDENCE_VERIFICATION_DECISION',
    propertyKey:key(property),
    fieldKey,
    evidenceEventId:current.id,
    value:current.value,
    source:current.source,
    reference:current.reference,
    status:decision,
    rationale:String(rationale||''),
    actor,
    createdAt:now(),
    canonicalWrite:false,
    promotionEligible:decision==='VERIFIED',
    promotionExecuted:false
  });

  const events=read();events.push(event);write(events);return event;
}

export function evidenceWorkflow(property,gaps=[]){
  return Object.freeze({
    mode:'GOVERNED_EVIDENCE_REVIEW',
    automaticCanonicalWrites:false,
    automaticPromotion:false,
    items:(gaps||[]).filter(g=>g?.fieldKey).map(g=>{
      const latest=latestEvidenceState(property,g.fieldKey);
      return Object.freeze({
        ...g,
        evidenceStatus:latest?.status||'NOT_STARTED',
        evidence:latest
      });
    })
  });
}

export function clearEvidenceEventsForTests(){
  storage()?.removeItem(STORAGE_KEY);
}
