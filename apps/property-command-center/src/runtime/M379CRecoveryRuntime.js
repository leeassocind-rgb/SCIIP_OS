import crypto from 'node:crypto';

export const CONTRACT =
  'SCIIP_EXPLORER_3_M3_79C_EXPLICIT_GOVERNED_97_RECORD_RECOVERY_EXECUTION';
export const VERSION='3.0-m3.79c';
export const AUTH_PHRASE='AUTHORIZE_M379C_97_RECORD_RECOVERY';
export const EXPECTED_INITIAL_EVENT_COUNT=3754;
export const EXPECTED_RECOVERY_RECORDS=97;
export const EXPECTED_FINAL_EVENT_COUNT=3851;
export const FIELD='availableSf';
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
  return 'EVENT-M379C-'+
    sha256(row.recoveryIdempotencyKey).slice(0,20).toUpperCase();
}
