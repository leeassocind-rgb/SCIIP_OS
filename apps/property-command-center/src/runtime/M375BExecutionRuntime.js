import crypto from 'node:crypto';

export const CONTRACT =
  'SCIIP_EXPLORER_3_M3_75B_EXPLICIT_GOVERNED_50_RECONCILED_UNIQUE_CANONICAL_TARGET_OPERATIONAL_INGESTION_EXECUTION';
export const VERSION='3.0-m3.75b';
export const AUTH_PHRASE='AUTHORIZE_M375B_50_RECONCILED_UNIQUE_CANONICAL_TARGET_OPERATIONAL_INGESTION';

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
  return 'EVENT-M375B-'+sha256(row.idempotencyKey).slice(0,20).toUpperCase();
}
