import crypto from 'node:crypto';

export const CONTRACT =
  'SCIIP_EXPLORER_3_M3_74C_UNIQUE_CANONICAL_TARGET_50_RECORD_QUALIFICATION_PREAUTHORIZATION';
export const VERSION='3.0-m3.74c';
export const CEILING=50;
export const FIELD='availableSf';

export const sha256=x=>crypto.createHash('sha256').update(x).digest('hex');
export const freshToken=()=>crypto.randomBytes(24).toString('hex');

export function latestObservation(timeline){
  const rows=Array.isArray(timeline?.observations)?timeline.observations:[];
  return [...rows].sort((a,b)=>{
    const da=String(a?.reportDate||''), db=String(b?.reportDate||'');
    if(da!==db) return db.localeCompare(da);
    return String(b?.observationId||'').localeCompare(String(a?.observationId||''));
  })[0]||null;
}

export function aliasMap(canonical){
  const map=new Map();
  for(const a of canonical.aliasLedger||[]){
    if(a?.decision==='LINKED' && a?.sourcePropertyId && a?.canonicalPropertyId)
      map.set(a.sourcePropertyId,a.canonicalPropertyId);
  }
  return map;
}

export function priorOperationalTargets(canonical){
  const out=new Set();
  for(const e of canonical.events||[]){
    if(String(e?.eventType||'').includes('OPERATIONAL_INGESTION') && e?.canonicalPropertyId)
      out.add(e.canonicalPropertyId);
  }
  return out;
}

export function resolveRows(canonical,temporal){
  const aliases=aliasMap(canonical);
  const prior=priorOperationalTargets(canonical);
  const rows=[];
  for(const tl of temporal.timelines||[]){
    const obs=latestObservation(tl);
    if(!obs) continue;
    const sourcePropertyId=obs.propertyId||tl.propertyId;
    const canonicalPropertyId=aliases.get(sourcePropertyId);
    const availableSf=Number(obs.availableSf);
    if(!canonicalPropertyId || !Number.isFinite(availableSf) || availableSf<=1) continue;
    rows.push({
      canonicalPropertyId,
      sourcePropertyId,
      observationId:obs.observationId||null,
      reportDate:obs.reportDate||null,
      address:obs.address||tl.address||null,
      city:obs.city||tl.city||null,
      availableSf,
      previouslyOperationallyMutated:prior.has(canonicalPropertyId)
    });
  }
  return rows;
}

export function canonicalGroups(rows){
  const groups=new Map();
  for(const r of rows){
    if(!groups.has(r.canonicalPropertyId)) groups.set(r.canonicalPropertyId,[]);
    groups.get(r.canonicalPropertyId).push(r);
  }
  return groups;
}

export function qualifyUniqueCanonical(rows){
  const groups=canonicalGroups(rows);
  const unique=[];
  const ambiguous=[];
  for(const [canonicalPropertyId, members] of groups){
    const fresh=members.filter(x=>!x.previouslyOperationallyMutated);
    if(!fresh.length) continue;

    // Governance rule: exactly one current source row may map to an executable canonical target.
    if(fresh.length!==1){
      ambiguous.push({
        canonicalPropertyId,
        sourceRowCount:fresh.length,
        sourcePropertyIds:fresh.map(x=>x.sourcePropertyId),
        observationIds:fresh.map(x=>x.observationId),
        availableSfValues:[...new Set(fresh.map(x=>x.availableSf))]
      });
      continue;
    }
    unique.push(fresh[0]);
  }

  unique.sort((a,b)=>String(a.canonicalPropertyId).localeCompare(String(b.canonicalPropertyId)));
  ambiguous.sort((a,b)=>String(a.canonicalPropertyId).localeCompare(String(b.canonicalPropertyId)));

  return { selected:unique.slice(0,CEILING), ambiguous, uniqueQualifiedCount:unique.length };
}
