import fs from 'node:fs';
import crypto from 'node:crypto';
export const CONTRACT='SCIIP_EXPLORER_3_M3_37B_EVENT_NATIVE_EXPANDED_COHORT_PREAUTHORIZATION';
export const VERSION='3.0-m3.37b';
export const MAX_RECORDS=10;
export const MUTATION_CLASS='CLASS_B_EXPANDED_COHORT_SINGLE_FIELD';
export function shaBytes(b){return crypto.createHash('sha256').update(b).digest('hex')}
export function shaJson(v){return shaBytes(Buffer.from(JSON.stringify(v)))}
export function readJson(p){return JSON.parse(fs.readFileSync(p,'utf8'))}
export function fileSha(p){return shaBytes(fs.readFileSync(p))}
export function scalar(v){return v===null||['string','number','boolean'].includes(typeof v)}
export function normalizeChange(ch){
 if(!ch||typeof ch!=='object') return null;
 const field=ch.field ?? ch.fieldName ?? ch.attribute ?? ch.key ?? null;
 const before=ch.before ?? ch.oldValue ?? ch.previousValue ?? null;
 const after=ch.after ?? ch.newValue ?? ch.currentValue ?? null;
 if(typeof field!=='string'||!field||!scalar(before)||!scalar(after)||Object.is(before,after)) return null;
 return {field,before,after};
}
export function eventPropertyId(e){return e?.propertyId ?? e?.canonicalPropertyId ?? null}
export function eventChanges(e){
 const c=e?.changes;
 if(Array.isArray(c)) return c.map(normalizeChange).filter(Boolean);
 if(c&&typeof c==='object'){
   const one=normalizeChange(c); if(one) return [one];
   return Object.entries(c).map(([field,v])=>{
     if(v&&typeof v==='object') return normalizeChange({field,...v});
     return null;
   }).filter(Boolean);
 }
 return [];
}
export function deriveCurrentState(canonical){
 const ids=new Set((canonical?.identities??[]).map(x=>x?.canonicalPropertyId).filter(x=>typeof x==='string'&&x.startsWith('CPROP-')));
 const state=new Map(), history=new Map();
 for(let i=0;i<(canonical?.events??[]).length;i++){
   const e=canonical.events[i], pid=eventPropertyId(e);
   if(!ids.has(pid)) continue;
   for(const ch of eventChanges(e)){
     const k=pid+'\0'+ch.field;
     state.set(k,{propertyId:pid,field:ch.field,currentValue:ch.after,eventIndex:i,eventId:e?.eventId??null,effectiveDate:e?.effectiveDate??null});
     history.set(k,(history.get(k)||0)+1);
   }
 }
 return {ids,state,history};
}
export function candidatePool(canonical,excludedIds=[]){
 const excluded=new Set(excludedIds), {state,history}=deriveCurrentState(canonical);
 const out=[];
 for(const x of state.values()){
   if(excluded.has(x.propertyId)) continue;
   if(typeof x.currentValue!=='number' || !Number.isFinite(x.currentValue) || !Number.isInteger(x.currentValue)) continue;
   if(x.currentValue<=100) continue;
   out.push({...x,historyCount:history.get(x.propertyId+'\0'+x.field)||0});
 }
 return out.sort((a,b)=>a.propertyId.localeCompare(b.propertyId)||a.field.localeCompare(b.field));
}
export function chooseSingleFieldCohort(canonical,excludedIds=[]){
 const pool=candidatePool(canonical,excludedIds), byField=new Map();
 for(const x of pool){if(!byField.has(x.field))byField.set(x.field,[]);byField.get(x.field).push(x)}
 const ranked=[...byField.entries()].filter(([,v])=>new Set(v.map(x=>x.propertyId)).size>=MAX_RECORDS)
   .map(([field,v])=>({field,items:[...new Map(v.map(x=>[x.propertyId,x])).values()]}))
   .sort((a,b)=>b.items.length-a.items.length||a.field.localeCompare(b.field));
 if(!ranked.length) return {field:null,candidates:[],fieldCounts:[...byField.entries()].map(([field,v])=>({field,count:new Set(v.map(x=>x.propertyId)).size})).sort((a,b)=>b.count-a.count)};
 return {field:ranked[0].field,candidates:ranked[0].items.slice(0,MAX_RECORDS),fieldCounts:ranked.map(x=>({field:x.field,count:x.items.length}))};
}
export function deterministicAfter(field,before,pid){
 const h=parseInt(shaBytes(Buffer.from(pid+'\0'+field)).slice(0,8),16);
 const cap=Math.max(1,Math.min(25,Math.floor(Math.abs(before)*0.0025)||1));
 const d=1+(h%cap);
 return {after:before-d,delta:d};
}
export function qualificationHash(x,sha){return shaJson({contract:CONTRACT,sourceSha:sha,propertyId:x.propertyId,field:x.field,before:x.before,after:x.after,rollbackValue:x.before})}
export function idem(x,sha){return shaJson({purpose:'M337B_IDEMPOTENCY',sourceSha:sha,propertyId:x.propertyId,field:x.field,before:x.before,after:x.after})}
export function token(){return crypto.randomBytes(32).toString('hex')}
