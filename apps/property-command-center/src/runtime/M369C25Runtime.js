import crypto from 'node:crypto';

export const CONTRACT='SCIIP_EXPLORER_3_M3_69C25_EXPLICIT_GOVERNED_2_RECORD_RECOVERY_EXECUTION';
export const VERSION='3.0-m3.69c25';

export function shaFile(fs,p){
  return crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
}
export function currentValue(events,pid,field,fallback){
  let v=fallback;
  for(const e of events||[]){
    if(e?.canonicalPropertyId!==pid) continue;
    for(const c of e?.changes||[]) if(c?.field===field) v=c.after;
  }
  return v;
}
export function eventIdFor(row){
  return 'EVENT-M369C25-'+crypto.createHash('sha256')
    .update(row.recoveryIdempotencyKey).digest('hex').slice(0,20).toUpperCase();
}
