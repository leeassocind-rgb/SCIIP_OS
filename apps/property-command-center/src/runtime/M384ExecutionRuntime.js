import crypto from 'node:crypto';

export const CONTRACT =
  'SCIIP_EXPLORER_3_M3_84_EXPLICIT_GOVERNED_200_RECORD_OPERATIONAL_INGESTION_EXECUTION';
export const VERSION='3.0-m3.84';
export const AUTH_PHRASE='AUTHORIZE_M384_200_RECORD_OPERATIONAL_INGESTION';

export const EXPECTED_INITIAL_EVENT_COUNT=3851;
export const EXPECTED_COHORT_RECORDS=200;
export const EXPECTED_FINAL_EVENT_COUNT=4051;
export const APPROVED_FIELD='availableSf';
export const MAX_RATE=5;

export const sha256=x=>crypto.createHash('sha256').update(x).digest('hex');

export function fileSha(fs,p){
  return sha256(fs.readFileSync(p));
}

export function currentValue(events,pid,field,fallback=null){
  let value=fallback;
  for(const e of events||[]){
    if(e?.canonicalPropertyId!==pid) continue;
    for(const c of e?.changes||[]){
      if(c?.field===field) value=c.after;
    }
  }
  return value;
}

export function eventIdFor(row){
  return 'EVENT-M384-'+sha256(row.idempotencyKey).slice(0,20).toUpperCase();
}
