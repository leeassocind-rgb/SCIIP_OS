import crypto from 'node:crypto';

export const CONTRACT='SCIIP_EXPLORER_3_M3_69C2_PARTIAL_RECOVERY_COMMIT_FORENSICS_RECOVERY_POLICY';
export const VERSION='3.0-m3.69c2';

export function sha(v){
  return crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
}
export function indexByIdempotency(events){
  const m=new Map();
  for(const e of events||[]){
    if(!e?.idempotencyKey) continue;
    if(!m.has(e.idempotencyKey))m.set(e.idempotencyKey,[]);
    m.get(e.idempotencyKey).push(e);
  }
  return m;
}
