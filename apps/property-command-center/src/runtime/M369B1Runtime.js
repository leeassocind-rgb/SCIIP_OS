import crypto from 'node:crypto';

export const CONTRACT='SCIIP_EXPLORER_3_M3_69B1_RERUN_SAFE_MANIFEST_RESOLVER_CORRECTION_FRESH_13_RECORD_RECOVERY_PREAUTHORIZATION';
export const VERSION='3.0-m3.69b1';
export const AUTH='AUTHORIZE_M369B1_PUBLIC_PARITY_REPAIR_IF_NEEDED';
export const FIELD='availableSf';

export function sha(v){
  return crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
}
export function fingerprint(e){
  return sha({
    eventId:e?.eventId??null,
    eventType:e?.eventType??null,
    canonicalPropertyId:e?.canonicalPropertyId??null,
    idempotencyKey:e?.idempotencyKey??null,
    changes:e?.changes??null
  });
}
export function latestFieldState(events,pid,field){
  let found=false,value=null,eventId=null;
  for(const e of events||[]){
    if(e?.canonicalPropertyId!==pid) continue;
    for(const ch of e?.changes||[]){
      if(ch?.field===field){
        found=true; value=ch.after; eventId=e.eventId||null;
      }
    }
  }
  return {found,value,eventId};
}
