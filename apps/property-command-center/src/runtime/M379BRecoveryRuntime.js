import crypto from 'node:crypto';

export const CONTRACT =
  'SCIIP_EXPLORER_3_M3_79B_PUBLIC_PARITY_REPAIR_PARTIAL_100_COHORT_CLOSURE_FRESH_97_RECORD_RECOVERY_PREAUTHORIZATION';
export const VERSION='3.0-m3.79b';
export const AUTH_PHRASE='AUTHORIZE_M379B_PUBLIC_PARITY_REPAIR';
export const FIELD='availableSf';
export const EXPECTED_CANONICAL_COUNT=3754;
export const EXPECTED_PUBLIC_COUNT=3751;
export const EXPECTED_COMMITTED=3;
export const EXPECTED_REMAINING=97;

export const sha256=x=>crypto.createHash('sha256').update(x).digest('hex');
export const freshToken=()=>crypto.randomBytes(24).toString('hex');

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
