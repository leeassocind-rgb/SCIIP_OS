import crypto from 'node:crypto';
export const CONTRACT='SCIIP_EXPLORER_3_M3_89_EXPLICIT_GOVERNED_400_RECORD_OPERATIONAL_INGESTION_EXECUTION';
export const VERSION='3.0-m3.89';
export const AUTH_PHRASE='AUTHORIZE_M389_400_RECORD_OPERATIONAL_INGESTION';
export const EXPECTED_INITIAL_EVENT_COUNT=4051;
export const EXPECTED_COHORT_RECORDS=400;
export const EXPECTED_FINAL_EVENT_COUNT=4451;
export const APPROVED_FIELD='availableSf';
export const MAX_RATE=5;
export const sha256=x=>crypto.createHash('sha256').update(x).digest('hex');
export const fileSha=(fs,p)=>sha256(fs.readFileSync(p));
export function currentValue(events,pid,field,fallback=null){let v=fallback;for(const e of events||[]){if(e?.canonicalPropertyId!==pid)continue;for(const c of e?.changes||[]){if(c?.field===field)v=c.after;}}return v;}
export const eventIdFor=row=>'EVENT-M389-'+sha256(row.idempotencyKey).slice(0,20).toUpperCase();
