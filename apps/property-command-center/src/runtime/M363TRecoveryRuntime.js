import crypto from 'node:crypto';

export const CONTRACT='SCIIP_EXPLORER_3_M3_63T_PARTIAL_CANARY_COMMIT_FORENSICS_RECOVERY_POLICY';
export const VERSION='3.0-m3.63t';
export const EXPECTED_CANARY_RECORDS=10;
export const EXPECTED_PARTIAL_COMMITS=6;

export function sha(v){
  return crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
}

export function indexEvents(events){
  const byId=new Map(), byIdem=new Map(), byCanonical=new Map();
  for(const e of events||[]){
    if(e?.eventId) byId.set(e.eventId,e);
    if(e?.idempotencyKey){
      if(!byIdem.has(e.idempotencyKey))byIdem.set(e.idempotencyKey,[]);
      byIdem.get(e.idempotencyKey).push(e);
    }
    if(e?.canonicalPropertyId){
      if(!byCanonical.has(e.canonicalPropertyId))byCanonical.set(e.canonicalPropertyId,[]);
      byCanonical.get(e.canonicalPropertyId).push(e);
    }
  }
  return {byId,byIdem,byCanonical};
}
