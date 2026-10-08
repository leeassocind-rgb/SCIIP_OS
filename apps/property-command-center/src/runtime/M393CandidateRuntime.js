import crypto from 'node:crypto';

export const CONTRACT =
  'SCIIP_EXPLORER_3_M3_93_800_RECORD_OPERATIONAL_INGESTION_CANDIDATE_SELECTION_QUALIFICATION_PREAUTHORIZATION';
export const VERSION='3.0-m3.93';

export const CANDIDATE_CEILING=800;
export const APPROVED_FIELD='availableSf';
export const MAX_RATE=5;
export const EXPECTED_BASELINE_EVENT_COUNT=4451;

export const sha256=x=>crypto.createHash('sha256').update(x).digest('hex');
export const freshToken=()=>crypto.randomBytes(24).toString('hex');

export function fileSha(fs,p){
  return sha256(fs.readFileSync(p));
}

export function scalar(v){
  if(v===null || v===undefined || v==='') return null;
  if(typeof v==='number') return Number.isFinite(v) ? v : null;
  const n=Number(String(v).replace(/,/g,'').trim());
  return Number.isFinite(n) ? n : null;
}

export function currentValue(events,pid,field,fallback=null){
  let value=fallback;
  for(const e of events||[]){
    if(e?.canonicalPropertyId!==pid) continue;
    for(const c of e?.changes||[]){
      if(c?.field===field) value=c.after;
    }
  }
  return value;
}

export function compareIso(a,b){
  const at=Date.parse(a||'');
  const bt=Date.parse(b||'');
  if(Number.isFinite(at) && Number.isFinite(bt)) return at-bt;
  return String(a||'').localeCompare(String(b||''));
}
