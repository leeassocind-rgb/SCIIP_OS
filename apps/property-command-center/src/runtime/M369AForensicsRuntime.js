import crypto from 'node:crypto';

export const CONTRACT='SCIIP_EXPLORER_3_M3_69A_CANONICAL_PUBLIC_DIVERGENCE_FORENSICS';
export const VERSION='3.0-m3.69a';

export function sha(v){
  return crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
}
export function eventFingerprint(e){
  return sha({
    eventId:e?.eventId??null,
    eventType:e?.eventType??null,
    canonicalPropertyId:e?.canonicalPropertyId??null,
    idempotencyKey:e?.idempotencyKey??null,
    checkpointId:e?.checkpointId??null,
    sourceObservationId:e?.sourceObservationId??null,
    changes:e?.changes??null
  });
}
export function compareStreams(a,p){
  const ae=a?.events||[], pe=p?.events||[];
  const min=Math.min(ae.length,pe.length);
  let prefix=0;
  for(let i=0;i<min;i++){
    if(eventFingerprint(ae[i])!==eventFingerprint(pe[i])) break;
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
