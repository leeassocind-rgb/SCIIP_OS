import crypto from 'node:crypto';
export const MAX_RECORDS=10;
export function sha(v){return crypto.createHash('sha256').update(v).digest('hex')}
export function normalizeChange(ch){
 if(!ch||typeof ch!=='object'||Array.isArray(ch)) return null;
 if(typeof ch.field!=='string'||!ch.field) return null;
 if(!Object.prototype.hasOwnProperty.call(ch,'before')||!Object.prototype.hasOwnProperty.call(ch,'after')) return null;
 return {field:ch.field,before:ch.before,after:ch.after};
}
export function canonicalId(e){return typeof e?.canonicalPropertyId==='string'&&e.canonicalPropertyId.startsWith('CPROP-')?e.canonicalPropertyId:null}
export function derive(canonical){
 const ids=new Set((canonical?.identities||[]).map(x=>x?.canonicalPropertyId).filter(Boolean));
 const state=new Map(), counts=new Map();
 for(let i=0;i<(canonical?.events||[]).length;i++){
   const e=canonical.events[i], pid=canonicalId(e);
   if(!pid||!ids.has(pid)||!Array.isArray(e.changes)) continue;
   for(const raw of e.changes){
     const ch=normalizeChange(raw); if(!ch) continue;
     const k=pid+'\0'+ch.field;
     state.set(k,{canonicalPropertyId:pid,field:ch.field,currentValue:ch.after,eventIndex:i,eventId:e.eventId||null,eventType:e.eventType||null});
     counts.set(k,(counts.get(k)||0)+1);
   }
 }
 return {ids,state,counts};
}
export function fieldInventory(canonical,excluded=[]){
 const ex=new Set(excluded),d=derive(canonical),m=new Map();
 for(const x of d.state.values()){
   if(ex.has(x.canonicalPropertyId))continue;
   if(!m.has(x.field))m.set(x.field,[]);
   m.get(x.field).push({...x,historyCount:d.counts.get(x.canonicalPropertyId+'\0'+x.field)||0});
 }
 return [...m.entries()].map(([field,items])=>({
   field,
   items:[...new Map(items.map(x=>[x.canonicalPropertyId,x])).values()]
 }))
   .sort((a,b)=>b.items.length-a.items.length||a.field.localeCompare(b.field));
}
export function select(canonical,excluded=[]){
 const inv=fieldInventory(canonical,excluded);
 const eligible=inv.filter(x=>x.items.length>=MAX_RECORDS && x.items.filter(y=>Number.isFinite(y.currentValue)&&y.currentValue>0).length>=MAX_RECORDS);
 if(!eligible.length)return {field:null,candidates:[],inventory:inv.map(x=>({field:x.field,count:x.items.length,numericPositive:x.items.filter(y=>Number.isFinite(y.currentValue)&&y.currentValue>0).length}))};
 const preferred=eligible.find(x=>x.field==='availableSf')||eligible[0];
 const candidates=preferred.items.filter(x=>Number.isFinite(x.currentValue)&&x.currentValue>0)
   .sort((a,b)=>a.canonicalPropertyId.localeCompare(b.canonicalPropertyId)).slice(0,MAX_RECORDS);
 return {field:preferred.field,candidates,inventory:inv.map(x=>({field:x.field,count:x.items.length,numericPositive:x.items.filter(y=>Number.isFinite(y.currentValue)&&y.currentValue>0).length}))};
}
export function proposed(before,pid,field){
 const h=parseInt(sha(Buffer.from(pid+'\0'+field)).slice(0,8),16);
 const delta=Math.max(1,Math.min(100,1+(h%Math.max(1,Math.min(100,Math.floor(before*.001)||1)))));
 return {after:before-delta,delta};
}
