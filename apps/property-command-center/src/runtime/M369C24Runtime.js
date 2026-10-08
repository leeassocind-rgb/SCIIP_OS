import crypto from 'node:crypto';

export const CONTRACT='SCIIP_EXPLORER_3_M3_69C24_PUBLIC_PARITY_REPAIR_FRESH_2_RECORD_RECOVERY_PREAUTHORIZATION';
export const VERSION='3.0-m3.69c24';

export const sha=v=>crypto.createHash('sha256').update(
  typeof v==='string'?v:JSON.stringify(v)
).digest('hex');

export const token=()=>crypto.randomBytes(24).toString('hex');

export function currentValue(events,propertyId,field,fallback){
  let v=fallback;
  for(const e of events||[]){
    if(e?.canonicalPropertyId!==propertyId) continue;
    for(const c of e?.changes||[]){
      if(c?.field===field) v=c.after;
    }
  }
  return v;
}
