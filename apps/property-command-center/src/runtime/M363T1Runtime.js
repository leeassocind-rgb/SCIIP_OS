import crypto from 'node:crypto';

export const CONTRACT='SCIIP_EXPLORER_3_M3_63T1_DRIFT_TOLERANT_PARTIAL_CANARY_FORENSICS';
export const VERSION='3.0-m3.63t1';
export const ORIGINAL_CANARY_RECORDS=10;

export function sha(v){
  return crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
}

export function eventFingerprint(e){
  return sha({
    eventId:e?.eventId??null,
    eventType:e?.eventType??null,
    canonicalPropertyId:e?.canonicalPropertyId??null,
    idempotencyKey:e?.idempotencyKey??null,
    sourceObservationId:e?.sourceObservationId??null,
    checkpointId:e?.checkpointId??null,
    changes:e?.changes??null
  });
}

export function exactPrefix(prefixEvents, fullEvents){
  if(prefixEvents.length>fullEvents.length) return false;
  for(let i=0;i<prefixEvents.length;i++){
    if(eventFingerprint(prefixEvents[i])!==eventFingerprint(fullEvents[i])) return false;
  }
  return true;
}

export function indexByIdempotency(events){
  const m=new Map();
  for(const e of events||[]){
    if(!e?.idempotencyKey) continue;
    if(!m.has(e.idempotencyKey)) m.set(e.idempotencyKey,[]);
    m.get(e.idempotencyKey).push(e);
  }
  return m;
}
