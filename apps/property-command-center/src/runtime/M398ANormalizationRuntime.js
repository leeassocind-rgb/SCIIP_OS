import crypto from 'node:crypto';

export const CONTRACT =
  'SCIIP_EXPLORER_3_M3_98A_POST_INGESTION_MISMATCH_INVENTORY_NORMALIZATION_FORENSICS';
export const VERSION='3.0-m3.98a';

export const EXPECTED_BASELINE_EVENT_COUNT=5073;
export const EXPECTED_PRIOR_M393_MISMATCH_COUNT=1004;
export const EXPECTED_CURRENT_DIVERGENCE_COUNT=1659;
export const EXPECTED_M394_DIRECT_TARGETS=622;
export const APPROVED_FIELD='availableSf';

export const sha256=x=>crypto.createHash('sha256').update(x).digest('hex');

export function fileSha(fs,p){
  return sha256(fs.readFileSync(p));
}

export function scalar(v){
  if(v===null || v===undefined || v==='') return null;
  if(typeof v==='number') return Number.isFinite(v) ? v : null;
  const n=Number(String(v).replace(/,/g,'').trim());
  return Number.isFinite(n) ? n : null;
}

export function compareIso(a,b){
  const at=Date.parse(a||'');
  const bt=Date.parse(b||'');
  if(Number.isFinite(at) && Number.isFinite(bt)) return at-bt;
  return String(a||'').localeCompare(String(b||''));
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
