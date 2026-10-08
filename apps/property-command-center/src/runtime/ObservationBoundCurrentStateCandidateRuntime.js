import crypto from 'node:crypto';
export const MAX_RECORDS=10;
export const FIELD='availableSf';
export function sha(v){return crypto.createHash('sha256').update(v).digest('hex')}
export function observationIndex(temporal){
 const m=new Map();
 for(const snap of temporal?.snapshots||[])for(const o of snap?.observations||[]){
   if(typeof o?.observationId==='string')m.set(o.observationId,o);
 }
 return m;
}
export function currentRefs(canonical){
 const m=new Map();
 for(const e of canonical?.events||[]){
   if(typeof e?.canonicalPropertyId==='string'&&typeof e?.currentObservationId==='string')
     m.set(e.canonicalPropertyId,{observationId:e.currentObservationId,eventId:e.eventId||null});
 }
 return m;
}
export function select(canonical,temporal,excluded=[]){
 const obs=observationIndex(temporal), refs=currentRefs(canonical), ex=new Set(excluded), out=[];
 for(const [cid,r] of refs){
   if(ex.has(cid))continue;
   const o=obs.get(r.observationId); if(!o)continue;
   const v=o[FIELD];
   if(!Number.isFinite(v)||v<=0)continue;
   out.push({canonicalPropertyId:cid,currentObservationId:r.observationId,currentEventId:r.eventId,
     propertyId:o.propertyId||null,propertyKey:o.propertyKey||null,address:o.address||null,city:o.city||null,
     reportDate:o.reportDate||null,before:v,buildingSf:o.buildingSf??null,status:o.status??null,source:o.source??null,confidence:o.confidence??null});
 }
 return out.sort((a,b)=>a.canonicalPropertyId.localeCompare(b.canonicalPropertyId)).slice(0,MAX_RECORDS);
}
export function proposed(before,cid){
 const h=parseInt(sha(Buffer.from(cid+'\0'+FIELD)).slice(0,8),16);
 const delta=Math.max(1,Math.min(100,1+(h%Math.max(1,Math.min(100,Math.floor(before*.001)||1)))));
 return {after:before-delta,delta};
}
