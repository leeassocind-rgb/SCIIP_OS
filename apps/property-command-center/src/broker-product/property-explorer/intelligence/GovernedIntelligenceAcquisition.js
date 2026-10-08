const K='SCIIP_EXPLORER_M2_22_ACQUISITION_EVENTS_V1';
const S=()=>globalThis?.window?.localStorage||null;
const R=()=>{try{return JSON.parse(S()?.getItem(K)||'[]')}catch{return[]}};
const W=x=>S()?.setItem(K,JSON.stringify(x));
const key=p=>String(p?.id||p?.propertyId||p?.canonicalPropertyId||p?.parcelId||p?.apn||p?.address||'UNKNOWN');
export function acquisitionEvents(p){return R().filter(e=>e.propertyKey===key(p))}
export function requestIntelligenceAcquisition({property,gap,actor='CURRENT_USER'}){
 if(!gap?.fieldKey)throw Error('gap.fieldKey required');
 const old=acquisitionEvents(property).filter(e=>e.fieldKey===gap.fieldKey).at(-1);
 if(old&&old.status==='REQUESTED')return old;
 const e=Object.freeze({id:`ACQ-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,type:'INTELLIGENCE_ACQUISITION_REQUESTED',propertyKey:key(property),fieldKey:gap.fieldKey,fieldLabel:gap.label||gap.fieldKey,gapType:gap.type||'UNKNOWN',priority:Number(gap.priorityScore??gap.priority??0),severity:gap.severity||null,source:gap.recommendedSource||gap.source||'VERIFIED_EXTERNAL_SOURCE',action:gap.recommendedAction||gap.action||'Acquire verified evidence',status:'REQUESTED',actor,createdAt:new Date().toISOString(),canonicalWrite:false,automaticExternalWrite:false,promotionRequired:true});
 const a=R();a.push(e);W(a);return e;
}
export function acquisitionWorkflow(property,gaps=[]){
 const latest={};for(const e of acquisitionEvents(property))latest[e.fieldKey]=e;
 return Object.freeze({mode:'GOVERNED_RECOMMENDATION',automaticExternalWrites:false,automaticCanonicalWrites:false,promotionRequired:true,items:(gaps||[]).filter(g=>g?.fieldKey).map(g=>Object.freeze({...g,acquisitionStatus:latest[g.fieldKey]?.status||'NOT_REQUESTED'}))});
}
export function clearAcquisitionEventsForTests(){S()?.removeItem(K)}
