import crypto from 'node:crypto';

export const CONTRACT='SCIIP_EXPLORER_3_M3_69C20_CURRENT_LEDGER_DIVERGENCE_PARTIAL_5_RECORD_RECOVERY_FORENSICS';
export const VERSION='3.0-m3.69c20';

export function sha(v){
  return crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
}
export function fingerprint(e){
  return sha({
    eventId:e?.eventId??null,
    eventType:e?.eventType??null,
    milestone:e?.milestone??null,
    canonicalPropertyId:e?.canonicalPropertyId??null,
    idempotencyKey:e?.idempotencyKey??null,
    changes:e?.changes??null
  });
}
export function compareStreams(a,p){
  const ae=a?.events||[], pe=p?.events||[];
  const min=Math.min(ae.length,pe.length);
  let prefix=0;
  for(let i=0;i<min;i++){
    if(fingerprint(ae[i])!==fingerprint(pe[i])) break;
    prefix++;
  }
  return {
    authoritativeCount:ae.length,
    publicCount:pe.length,
    commonPrefixLength:prefix,
    publicIsExactPrefix:prefix===pe.length && pe.length<=ae.length,
    authoritativeOnly:ae.slice(prefix),
    publicOnly:pe.slice(prefix)
  };
}
export function indexByIdempotency(events){
  const m=new Map();
  for(const e of events||[]){
    if(!e?.idempotencyKey) continue;
    if(!m.has(e.idempotencyKey)) m.set(e.idempotencyKey,[]);
    m.get(e.idempotencyKey).push(e);
  }
  return m;
}
