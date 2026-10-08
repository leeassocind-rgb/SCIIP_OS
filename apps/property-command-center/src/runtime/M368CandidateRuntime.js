import crypto from 'node:crypto';

export const CONTRACT='SCIIP_EXPLORER_3_M3_68_25_RECORD_OPERATIONAL_INGESTION_CANDIDATE_SELECTION_QUALIFICATION_PREAUTHORIZATION';
export const VERSION='3.0-m3.68';
export const FIELD='availableSf';
export const COHORT_SIZE=25;

export function sha(v){
  return crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
}
export function token(){
  return crypto.randomBytes(32).toString('hex');
}
export function observationIndex(temporal){
  const m=new Map();
  for(const s of temporal?.snapshots||[]){
    for(const o of s?.observations||[]){
      const id=o?.observationId||o?.id;
      if(typeof id==='string') m.set(id,o);
    }
  }
  for(const o of temporal?.observations||[]){
    const id=o?.observationId||o?.id;
    if(typeof id==='string') m.set(id,o);
  }
  return m;
}
export function currentObservationRefs(canonical){
  const m=new Map();
  for(const e of canonical?.events||[]){
    if(typeof e?.canonicalPropertyId==='string' &&
       typeof e?.currentObservationId==='string'){
      m.set(e.canonicalPropertyId,{
        observationId:e.currentObservationId,
        eventId:e.eventId||null
      });
    }
  }
  return m;
}
export function latestFieldState(canonical,pid,field){
  let found=false,value=null,eventId=null;
  for(const e of canonical?.events||[]){
    if(e?.canonicalPropertyId!==pid) continue;
    for(const ch of e?.changes||[]){
      if(ch?.field===field){
        found=true;
        value=ch.after;
        eventId=e.eventId||null;
      }
    }
  }
  return {found,value,eventId};
}
export function previouslyGoverned(canonical){
  const s=new Set();
  for(const e of canonical?.events||[]){
    if(typeof e?.canonicalPropertyId!=='string') continue;
    if((e?.changes||[]).some(ch=>ch?.field===FIELD) &&
       (
         String(e?.eventType||'').startsWith('GOVERNED_') ||
         String(e?.eventType||'').startsWith('OPERATIONAL_INGESTION_')
       )){
      s.add(e.canonicalPropertyId);
    }
  }
  return s;
}
