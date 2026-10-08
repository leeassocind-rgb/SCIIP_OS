import crypto from 'node:crypto';
export const CONTRACT='SCIIP_EXPLORER_3_M3_79C5_PUBLIC_PARITY_REPAIR_PARTIAL_96_RECOVERY_CLOSURE_FRESH_95_RECORD_PREAUTHORIZATION';
export const VERSION='3.0-m3.79c5';
export const AUTH_PHRASE='AUTHORIZE_M379C5_PUBLIC_PARITY_REPAIR';
export const FIELD='availableSf';
export const EXPECTED_CANONICAL_COUNT=3756;
export const EXPECTED_PUBLIC_COUNT=3755;
export const PRESERVED_PRIOR_COMMITS=4;
export const PRESERVED_M379C3_COMMITS=1;
export const TOTAL_PRESERVED_COMMITS=5;
export const ORIGINAL_RECOVERY_ROWS=96;
export const EXPECTED_REMAINING=95;
export const sha256=x=>crypto.createHash('sha256').update(x).digest('hex');
export const freshToken=()=>crypto.randomBytes(24).toString('hex');
export function fileSha(fs,p){return sha256(fs.readFileSync(p));}
export function currentValue(events,pid,field,fallback=null){
  let v=fallback;
  for(const e of events||[]){
    if(e?.canonicalPropertyId!==pid) continue;
    for(const c of e?.changes||[]) if(c?.field===field) v=c.after;
  }
  return v;
}
