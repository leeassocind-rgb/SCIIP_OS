import crypto from 'node:crypto';

export const CONTRACT='SCIIP_EXPLORER_3_M3_69_EXPLICIT_GOVERNED_25_RECORD_OPERATIONAL_INGESTION_EXECUTION';
export const VERSION='3.0-m3.69';
export const AUTH='AUTHORIZE_M369_25_RECORD_OPERATIONAL_INGESTION';
export const FIELD='availableSf';
export const RATE_LIMIT_PER_MINUTE=5;
export const MIN_INTERVAL_MS=12000;

export function sha(v){
  return crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
}
export function eventId(row,fp){
  return 'EVENT-M369-'+sha({
    fp,
    sequence:row.sequence,
    canonicalPropertyId:row.canonicalPropertyId,
    idempotencyKey:row.idempotencyKey
  }).slice(0,20).toUpperCase();
}
export function latestFieldState(events,pid,field){
  let found=false,value=null,eventId=null;
  for(const e of events||[]){
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
export function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
