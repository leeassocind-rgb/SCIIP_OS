import crypto from 'node:crypto';
export const CONTRACT='SCIIP_EXPLORER_3_M3_63V_EXPLICIT_GOVERNED_4_RECORD_RECOVERY_EXECUTION';
export const VERSION='3.0-m3.63v';
export const AUTH='AUTHORIZE_M363V_4_RECORD_RECOVERY';
export const FIELD='availableSf';
export function sha(v){return crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');}
export function eventId(row){return 'EVENT-M363V-'+sha({k:row.recoveryIdempotencyKey,p:row.canonicalPropertyId}).slice(0,20).toUpperCase();}
export function latestField(events,pid,field){
  let found=false,value=null,eventId=null;
  for(const e of events||[]){
    if(e?.canonicalPropertyId!==pid) continue;
    for(const ch of e?.changes||[]) if(ch?.field===field){found=true;value=ch.after;eventId=e.eventId||null;}
  }
  return {found,value,eventId};
}
