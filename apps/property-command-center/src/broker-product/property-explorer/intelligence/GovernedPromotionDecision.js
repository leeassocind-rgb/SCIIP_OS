// SCIIP Explorer 3.0 — M2.24
// Evidence Review + Governed Promotion Decision
// Verified evidence may become promotion-eligible, but canonical mutation remains explicit and separate.
const STORAGE_KEY='SCIIP_EXPLORER_M2_24_PROMOTION_EVENTS_V1';
const storage=()=>globalThis?.window?.localStorage||null;
const read=()=>{try{const x=JSON.parse(storage()?.getItem(STORAGE_KEY)||'[]');return Array.isArray(x)?x:[]}catch{return[]}};
const write=x=>storage()?.setItem(STORAGE_KEY,JSON.stringify(x));
const now=()=>new Date().toISOString();
const id=p=>`${p}-${Date.now()}-${Math.random().toString(36).slice(2,8).toUpperCase()}`;
const key=p=>String(p?.id||p?.propertyId||p?.canonicalPropertyId||p?.parcelId||p?.apn||p?.address||'UNKNOWN');
export function promotionEvents(property){const k=key(property);return read().filter(e=>e.propertyKey===k)}
export function latestPromotionState(property,fieldKey){return promotionEvents(property).filter(e=>e.fieldKey===fieldKey).at(-1)||null}
export function decidePromotion({property,fieldKey,evidence,decision,rationale='',actor='CURRENT_USER'}){
 if(!fieldKey)throw new Error('fieldKey required');
 if(!evidence||evidence.status!=='VERIFIED')throw new Error('verified evidence required');
 if(!['PROMOTE','HOLD'].includes(decision))throw new Error('decision must be PROMOTE or HOLD');
 const event=Object.freeze({id:id('PROMOTION-DECISION'),type:'GOVERNED_PROMOTION_DECISION',propertyKey:key(property),fieldKey,evidenceEventId:evidence.id,value:evidence.value,source:evidence.source,reference:evidence.reference,decision,status:decision==='PROMOTE'?'APPROVED_FOR_PROMOTION':'HELD',rationale:String(rationale||''),actor,createdAt:now(),automaticPromotion:false,canonicalWrite:false,promotionExecuted:false});
 const events=read();events.push(event);write(events);
 try{globalThis?.window?.dispatchEvent(new CustomEvent('sciip:governed-promotion-decision',{detail:{propertyId:key(property),fieldKey,decision}}))}catch{}
 return event;
}
export function clearPromotionEventsForTests(){storage()?.removeItem(STORAGE_KEY)}
