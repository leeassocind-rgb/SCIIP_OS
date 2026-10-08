import crypto from 'node:crypto';

export const CONTRACT =
  'SCIIP_EXPLORER_4_M4_06A_REENTRY_QUALIFIED_POPULATION_MANIFEST_SHAPE_REPAIR';
export const VERSION='4.0-m4.06a';

export const EXPECTED_BASELINE_EVENT_COUNT=5073;
export const EXPECTED_QUALIFIED_ROWS=188;
export const EXPECTED_QUARANTINED_ROWS=7;
export const APPROVED_FIELD='availableSf';
export const MAX_RATE=5;

export const sha256=x=>crypto.createHash('sha256').update(x).digest('hex');
export const freshToken=()=>crypto.randomBytes(24).toString('hex');

export function fileSha(fs,p){
  return sha256(fs.readFileSync(p));
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

export function walkObjects(node,out=[]){
  if(Array.isArray(node)){
    for(const x of node) walkObjects(x,out);
  }else if(node && typeof node==='object'){
    out.push(node);
    for(const v of Object.values(node)) walkObjects(v,out);
  }
  return out;
}

export function rowKey(o){
  const cid=o?.canonicalPropertyId;
  const sid=o?.sourcePropertyId;
  return cid && sid ? `${cid}|${sid}` : null;
}

export function hasMarker(o,marker){
  return Object.values(o||{}).some(v=>
    typeof v==='string' && v.includes(marker)
  );
}
