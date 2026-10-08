import crypto from 'node:crypto';

export const CONTRACT='SCIIP_EXPLORER_3_M3_69C1_CURRENT_LEDGER_DIVERGENCE_FORENSICS';
export const VERSION='3.0-m3.69c1';

export function sha(v){
  return crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
}
export function fingerprint(e){
  return sha({
    eventId:e?.eventId??null,
    eventType:e?.eventType??null,
    canonicalPropertyId:e?.canonicalPropertyId??null,
    idempotencyKey:e?.idempotencyKey??null,
    checkpointId:e?.checkpointId??null,
    changes:e?.changes??null
  });
}
export function compareStreams(authoritative,publicCopy){
  const a=authoritative?.events||[];
  const p=publicCopy?.events||[];
  const min=Math.min(a.length,p.length);
  let prefix=0;
  for(let i=0;i<min;i++){
    if(fingerprint(a[i])!==fingerprint(p[i])) break;
    prefix++;
  }
  return {
    authoritativeCount:a.length,
    publicCount:p.length,
    commonPrefixLength:prefix,
    publicIsExactPrefix:prefix===p.length && p.length<=a.length,
    authoritativeOnly:a.slice(prefix),
    publicOnly:p.slice(prefix)
  };
}
