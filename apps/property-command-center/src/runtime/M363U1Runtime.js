import crypto from 'node:crypto';

export const CONTRACT='SCIIP_EXPLORER_3_M3_63U1_CURRENT_STATE_RESOLVER_CORRECTION_FRESH_4_RECORD_RECOVERY_PREAUTHORIZATION';
export const VERSION='3.0-m3.63u1';
export const FIELD='availableSf';

export function sha(v){
  return crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
}
export function token(){
  return crypto.randomBytes(32).toString('hex');
}

export function temporalObservationIndex(t){
  const m=new Map();

  for(const s of t?.snapshots||[]){
    for(const o of s?.observations||[]){
      const id=o?.observationId||o?.id;
      if(typeof id==='string') m.set(id,o);
    }
  }

  for(const o of t?.observations||[]){
    const id=o?.observationId||o?.id;
    if(typeof id==='string') m.set(id,o);
  }

  for(const o of t?.records||[]){
    const id=o?.observationId||o?.id;
    if(typeof id==='string') m.set(id,o);
  }

  return m;
}

export function canonicalCurrentObservationRefs(c){
  const refs=new Map();
  for(const e of c?.events||[]){
    if(typeof e?.canonicalPropertyId==='string' &&
       typeof e?.currentObservationId==='string'){
      refs.set(e.canonicalPropertyId,{
        observationId:e.currentObservationId,
        eventId:e.eventId||null
      });
    }
  }
  return refs;
}

export function latestCanonicalFieldState(c,canonicalPropertyId,field){
  let found=false;
  let value=null;
  let sourceEventId=null;

  for(const e of c?.events||[]){
    if(e?.canonicalPropertyId!==canonicalPropertyId) continue;
    for(const ch of e?.changes||[]){
      if(ch?.field===field){
        found=true;
        value=ch.after;
        sourceEventId=e.eventId||null;
      }
    }
  }

  return {found,value,sourceEventId};
}
