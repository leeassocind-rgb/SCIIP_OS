import crypto from 'node:crypto';
export const CONTRACT='SCIIP_EXPLORER_3_M3_78_100_RECORD_CANONICAL_CURRENT_STATE_RECONCILED_CANDIDATE_SELECTION_QUALIFICATION_PREAUTHORIZATION';
export const VERSION='3.0-m3.78'; export const CEILING=100; export const FIELD='availableSf';
export const sha256=x=>crypto.createHash('sha256').update(x).digest('hex');
export const freshToken=()=>crypto.randomBytes(24).toString('hex');

export function latestObservation(tl){
  const rows=Array.isArray(tl?.observations)?tl.observations:[];
  return [...rows].sort((a,b)=>{
    const da=String(a?.reportDate||''),db=String(b?.reportDate||'');
    if(da!==db)return db.localeCompare(da);
    return String(b?.observationId||'').localeCompare(String(a?.observationId||''));
  })[0]||null;
}
export function aliasMap(canonical){
  const m=new Map();
  for(const a of canonical.aliasLedger||[]){
    if(a?.decision==='LINKED'&&a?.sourcePropertyId&&a?.canonicalPropertyId)m.set(a.sourcePropertyId,a.canonicalPropertyId);
  }
  return m;
}
export function currentValue(events,pid,field,fallback){
  let v=fallback;
  for(const e of events||[])if(e?.canonicalPropertyId===pid)for(const c of e?.changes||[])if(c?.field===field)v=c.after;
  return v;
}
export function priorTargets(canonical){
  const s=new Set();
  for(const e of canonical.events||[])if(String(e?.eventType||'').includes('OPERATIONAL_INGESTION')&&e?.canonicalPropertyId)s.add(e.canonicalPropertyId);
  return s;
}
