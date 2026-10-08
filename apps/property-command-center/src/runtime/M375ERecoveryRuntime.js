import crypto from 'node:crypto';

export const CONTRACT =
  'SCIIP_EXPLORER_3_M3_75E_EXPLICIT_GOVERNED_29_RECORD_RECOVERY_EXECUTION';
export const VERSION='3.0-m3.75e';
export const AUTH_PHRASE='AUTHORIZE_M375E_29_RECORD_RECOVERY';

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
  return 'EVENT-M375E-'+sha256(row.recoveryIdempotencyKey).slice(0,20).toUpperCase();
}
