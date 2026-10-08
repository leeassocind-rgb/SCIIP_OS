import crypto from 'node:crypto';

export const CONTRACT =
  'SCIIP_EXPLORER_4_M4_11_PROVENANCE_AWARE_FRESH_CANDIDATE_INVENTORY_REASSESSMENT_AND_NORMALIZATION';
export const VERSION='4.0-m4.11';

export const EXPECTED_BASELINE_EVENT_COUNT=5261;
export const NEXT_BOUNDED_CANDIDATE_CEILING=400;
export const EXPECTED_QUARANTINE_ROWS=7;
export const APPROVED_FIELD='availableSf';

export const sha256=x=>crypto.createHash('sha256').update(x).digest('hex');

export function fileSha(fs,p){
  return sha256(fs.readFileSync(p));
}

export function walkObjects(node,out=[]){
  if(Array.isArray(node)){
    for(const x of node) walkObjects(x,out);
  }else if(node && typeof node==='object'){
    out.push(node);
    for(const v of Object.values(node)) walkObjects(v,out);
  }
  return out;
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

export function preEventValue(events,pid,field,cutoffIndex,fallback=null){
  let value=fallback;
  for(let i=0;i<Math.min(cutoffIndex,events.length);i++){
    const e=events[i];
    if(e?.canonicalPropertyId!==pid) continue;
    for(const c of e?.changes||[]){
      if(c?.field===field) value=c.after;
    }
  }
  return value;
}

export function numberOrNull(v){
  if(typeof v==='number' && Number.isFinite(v)) return v;
  if(typeof v==='string' && v.trim()!==''){
    const n=Number(v.replace(/,/g,''));
    return Number.isFinite(n)?n:null;
  }
  return null;
}
