import crypto from 'node:crypto';
export const CONTRACT='SCIIP_EXPLORER_3_M3_79C6_EXPLICIT_GOVERNED_95_RECORD_RECOVERY_EXECUTION';
export const VERSION='3.0-m3.79c6';
export const AUTH_PHRASE='AUTHORIZE_M379C6_95_RECORD_RECOVERY';
export const EXPECTED_INITIAL_EVENT_COUNT=3756;
export const EXPECTED_RECOVERY_RECORDS=95;
export const EXPECTED_FINAL_EVENT_COUNT=3851;
export const FIELD='availableSf';
export const MAX_RATE=5;
export const sha256=x=>crypto.createHash('sha256').update(x).digest('hex');
export function fileSha(fs,p){return sha256(fs.readFileSync(p));}
export function currentValue(events,pid,field,fallback=null){
  let v=fallback; for(const e of events||[]){if(e?.canonicalPropertyId!==pid) continue; for(const c of e?.changes||[]) if(c?.field===field) v=c.after;} return v;
}
export function eventIdFor(row){return 'EVENT-M379C6-'+sha256(row.recoveryIdempotencyKey).slice(0,20).toUpperCase();}
