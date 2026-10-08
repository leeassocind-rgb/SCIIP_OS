import crypto from 'node:crypto';

export const CONTRACT='SCIIP_EXPLORER_3_M3_62_OPERATIONAL_INGESTION_CANARY_DESIGN_READ_ONLY_QUALIFICATION';
export const VERSION='3.0-m3.62';
export const FIELD='availableSf';
export const CANARY_MAX_RECORDS=10;
export const RATE_LIMIT_RECORDS_PER_MINUTE=2;
export const CHECKPOINT_INTERVAL=1;

export function sha(v){
  return crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
}

export function obsIndex(temporal){
  const m=new Map();
  for(const s of temporal?.snapshots||[]){
    for(const o of s?.observations||[]){
      if(typeof o?.observationId==='string') m.set(o.observationId,o);
    }
  }
  return m;
}

export function currentRefs(canonical){
  const m=new Map();
  for(const e of canonical?.events||[]){
    if(typeof e?.canonicalPropertyId==='string' && typeof e?.currentObservationId==='string'){
      m.set(e.canonicalPropertyId,{observationId:e.currentObservationId,eventId:e.eventId||null});
    }
  }
  return m;
}

export function previouslyGoverned(canonical){
  const s=new Set();
  for(const e of canonical?.events||[]){
    if(!String(e?.eventType||'').startsWith('GOVERNED_')) continue;
    if((e?.changes||[]).some(ch=>ch?.field===FIELD) && typeof e?.canonicalPropertyId==='string'){
      s.add(e.canonicalPropertyId);
    }
  }
  return s;
}

export function selectCanaryCandidates(canonical,temporal){
  const obs=obsIndex(temporal);
  const refs=currentRefs(canonical);
  const excluded=previouslyGoverned(canonical);
  const out=[];

  for(const [cid,ref] of refs){
    if(excluded.has(cid)) continue;
    const o=obs.get(ref.observationId);
    if(!o) continue;
    const v=o[FIELD];
    if(!Number.isFinite(v) || v<=0) continue;
    out.push({
      canonicalPropertyId:cid,
      currentObservationId:ref.observationId,
      currentEventId:ref.eventId,
      propertyId:o.propertyId||null,
      propertyKey:o.propertyKey||null,
      address:o.address||null,
      city:o.city||null,
      before:v,
      reportDate:o.reportDate||null,
      source:o.source??null,
      confidence:o.confidence??null
    });
  }

  return {
    excludedPreviouslyGoverned:excluded.size,
    qualifiedCount:out.length,
    candidates:out.sort((a,b)=>a.canonicalPropertyId.localeCompare(b.canonicalPropertyId)).slice(0,CANARY_MAX_RECORDS)
  };
}

export function proposed(before,cid){
  const h=parseInt(sha(cid+'\0'+FIELD).slice(0,8),16);
  const cap=Math.max(1,Math.min(20,Math.floor(before*.0005)||1));
  const delta=1+(h%cap);
  return {after:before-delta,delta};
}
