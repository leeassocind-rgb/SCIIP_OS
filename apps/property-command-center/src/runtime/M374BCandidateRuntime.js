import crypto from 'node:crypto';

export const CONTRACT='SCIIP_EXPLORER_3_M3_74B_50_RECORD_SOURCE_SHAPE_BOUND_CANDIDATE_SELECTION_QUALIFICATION_PREAUTHORIZATION';
export const VERSION='3.0-m3.74b';
export const CEILING=50;
export const FIELD='availableSf';

export const sha256=x=>crypto.createHash('sha256').update(x).digest('hex');
export const token=()=>crypto.randomBytes(24).toString('hex');

export function latestObservation(timeline){
  const rows=Array.isArray(timeline?.observations)?timeline.observations:[];
  return [...rows].sort((a,b)=>{
    const da=String(a?.reportDate||''), db=String(b?.reportDate||'');
    if(da!==db) return db.localeCompare(da);
    return String(b?.observationId||'').localeCompare(String(a?.observationId||''));
  })[0]||null;
}

export function buildAliasMap(canonical){
  const m=new Map();
  for(const a of canonical.aliasLedger||[]){
    if(a?.decision==='LINKED' && a?.sourcePropertyId && a?.canonicalPropertyId)
      m.set(a.sourcePropertyId,a.canonicalPropertyId);
  }
  return m;
}

export function previouslyOperationallyMutated(canonical){
  const s=new Set();
  for(const e of canonical.events||[]){
    if(String(e?.eventType||'').includes('OPERATIONAL_INGESTION') && e?.canonicalPropertyId)
      s.add(e.canonicalPropertyId);
  }
  return s;
}

export function resolveCurrentRows(canonical,temporal){
  const aliases=buildAliasMap(canonical);
  const prior=previouslyOperationallyMutated(canonical);
  const rows=[];
  for(const tl of temporal.timelines||[]){
    const obs=latestObservation(tl);
    if(!obs) continue;
    const sourcePropertyId=obs.propertyId||tl.propertyId;
    const canonicalPropertyId=aliases.get(sourcePropertyId);
    if(!canonicalPropertyId) continue;
    const v=obs.availableSf;
    if(!Number.isFinite(v) || v<=1) continue;
    rows.push({
      canonicalPropertyId,sourcePropertyId,
      observationId:obs.observationId,
      reportDate:obs.reportDate,
      address:obs.address||tl.address||null,
      city:obs.city||tl.city||null,
      availableSf:v,
      previouslyOperationallyMutated:prior.has(canonicalPropertyId)
    });
  }
  return rows;
}

export function qualify(rows){
  return rows
    .filter(r=>!r.previouslyOperationallyMutated)
    .sort((a,b)=>String(a.canonicalPropertyId).localeCompare(String(b.canonicalPropertyId)))
    .slice(0,CEILING);
}
