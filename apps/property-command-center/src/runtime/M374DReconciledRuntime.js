import crypto from 'node:crypto';

export const CONTRACT =
  'SCIIP_EXPLORER_3_M3_74D_CANONICAL_CURRENT_STATE_RECONCILED_50_RECORD_QUALIFICATION_PREAUTHORIZATION';
export const VERSION='3.0-m3.74d';
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

export function canonicalCurrentValue(events,pid,field,fallback){
  let value=fallback;
  for(const e of events||[]){
    if(e?.canonicalPropertyId!==pid) continue;
    for(const c of e?.changes||[]){
      if(c?.field===field) value=c.after;
    }
  }
  return value;
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
    const temporalAvailableSf=Number(obs.availableSf);

    if(!canonicalPropertyId || !Number.isFinite(temporalAvailableSf) || temporalAvailableSf<=1)
      continue;

    const canonicalAvailableSf=Number(
      canonicalCurrentValue(
        canonical.events||[],
        canonicalPropertyId,
        FIELD,
        temporalAvailableSf
      )
    );

    rows.push({
      canonicalPropertyId,
      sourcePropertyId,
      observationId:obs.observationId||null,
      reportDate:obs.reportDate||null,
      address:obs.address||tl.address||null,
      city:obs.city||tl.city||null,
      temporalAvailableSf,
      canonicalAvailableSf,
      stateReconciled:
        Number.isFinite(canonicalAvailableSf) &&
        canonicalAvailableSf===temporalAvailableSf,
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

export function qualify(rows){
  const groups=canonicalGroups(rows);
  const selectedPool=[];
  const ambiguous=[];
  const stale=[];

  for(const [canonicalPropertyId,members] of groups){
    const fresh=members.filter(x=>!x.previouslyOperationallyMutated);
    if(!fresh.length) continue;

    const reconciled=fresh.filter(x=>x.stateReconciled);
    const staleMembers=fresh.filter(x=>!x.stateReconciled);
    stale.push(...staleMembers);

    // One and only one fresh, reconciled source row may represent a canonical target.
    if(reconciled.length!==1){
      if(reconciled.length>1 || fresh.length>1){
        ambiguous.push({
          canonicalPropertyId,
          freshSourceRows:fresh.length,
          reconciledSourceRows:reconciled.length,
          sourcePropertyIds:fresh.map(x=>x.sourcePropertyId),
          observationIds:fresh.map(x=>x.observationId)
        });
      }
      continue;
    }

    selectedPool.push(reconciled[0]);
  }

  selectedPool.sort((a,b)=>
    String(a.canonicalPropertyId).localeCompare(String(b.canonicalPropertyId))
  );

  return {
    selected:selectedPool.slice(0,CEILING),
    qualifiedPoolSize:selectedPool.length,
    stale,
    ambiguous
  };
}
