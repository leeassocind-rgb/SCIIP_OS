import crypto from 'node:crypto';

export const CONTRACT =
  'SCIIP_EXPLORER_4_M4_07_EXPLICIT_GOVERNED_188_RECORD_PROVENANCE_AWARE_REENTRY_OPERATIONAL_INGESTION_EXECUTION';
export const VERSION='4.0-m4.07';
export const AUTH_PHRASE='AUTHORIZE_M407_188_RECORD_PROVENANCE_AWARE_REENTRY';

export const EXPECTED_INITIAL_EVENT_COUNT=5073;
export const EXPECTED_COHORT_RECORDS=188;
export const EXPECTED_FINAL_EVENT_COUNT=5261;
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
  return 'EVENT-M407-'+sha256(row.idempotencyKey).slice(0,20).toUpperCase();
}
