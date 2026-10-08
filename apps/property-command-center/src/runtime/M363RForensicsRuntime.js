import fs from 'node:fs';
import crypto from 'node:crypto';

export const CONTRACT='SCIIP_EXPLORER_3_M3_63R_CANONICAL_PUBLIC_DIVERGENCE_FORENSICS_AUTHORITATIVE_CONTINUITY';
export const VERSION='3.0-m3.63r';

export function sha(v){
  return crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
}
export function fsha(p){ return sha(fs.readFileSync(p)); }
export function read(p){ return JSON.parse(fs.readFileSync(p,'utf8')); }

export function eventFingerprint(e){
  return sha({
    eventId:e?.eventId??null,
    eventType:e?.eventType??null,
    canonicalPropertyId:e?.canonicalPropertyId??null,
    idempotencyKey:e?.idempotencyKey??null,
    sourceObservationId:e?.sourceObservationId??null,
    changes:e?.changes??null
  });
}

export function compareEventStreams(authoritative,publicCopy){
  const a=authoritative?.events||[];
  const p=publicCopy?.events||[];

  const min=Math.min(a.length,p.length);
  let commonPrefixLength=0;
  for(let i=0;i<min;i++){
    if(eventFingerprint(a[i])!==eventFingerprint(p[i])) break;
    commonPrefixLength++;
  }

  const authoritativeOnly=a.slice(commonPrefixLength).map((e,i)=>({
    authoritativeIndex:commonPrefixLength+i,
    eventId:e?.eventId??null,
    eventType:e?.eventType??null,
    canonicalPropertyId:e?.canonicalPropertyId??null,
    idempotencyKey:e?.idempotencyKey??null,
    milestone:e?.milestone??null,
    changes:e?.changes??null,
    fingerprint:eventFingerprint(e)
  }));

  const publicOnly=p.slice(commonPrefixLength).map((e,i)=>({
    publicIndex:commonPrefixLength+i,
    eventId:e?.eventId??null,
    eventType:e?.eventType??null,
    canonicalPropertyId:e?.canonicalPropertyId??null,
    idempotencyKey:e?.idempotencyKey??null,
    milestone:e?.milestone??null,
    changes:e?.changes??null,
    fingerprint:eventFingerprint(e)
  }));

  return {
    authoritativeCount:a.length,
    publicCount:p.length,
    commonPrefixLength,
    exactPrefixRelationship:commonPrefixLength===p.length && p.length<=a.length,
    authoritativeOnlyCount:authoritativeOnly.length,
    publicOnlyCount:publicOnly.length,
    authoritativeOnly,
    publicOnly
  };
}

export function certifyEventShape(rows){
  const bad=[];
  const seenIds=new Set();
  const seenIdem=new Set();

  for(const r of rows){
    const e=r;
    if(typeof e.eventId!=='string'||!e.eventId) bad.push({eventId:e.eventId,reason:'MISSING_EVENT_ID'});
    if(typeof e.eventType!=='string'||!e.eventType) bad.push({eventId:e.eventId,reason:'MISSING_EVENT_TYPE'});
    if(typeof e.canonicalPropertyId!=='string'||!e.canonicalPropertyId) bad.push({eventId:e.eventId,reason:'MISSING_CANONICAL_PROPERTY_ID'});
    if(!Array.isArray(e.changes)||e.changes.length<1) bad.push({eventId:e.eventId,reason:'MISSING_CHANGES'});
    if(typeof e.eventId==='string'){
      if(seenIds.has(e.eventId)) bad.push({eventId:e.eventId,reason:'DUPLICATE_EVENT_ID'});
      seenIds.add(e.eventId);
    }
    if(typeof e.idempotencyKey==='string'&&e.idempotencyKey){
      if(seenIdem.has(e.idempotencyKey)) bad.push({eventId:e.eventId,reason:'DUPLICATE_IDEMPOTENCY_WITHIN_DELTA'});
      seenIdem.add(e.idempotencyKey);
    }
  }
  return {valid:bad.length===0,issues:bad};
}
