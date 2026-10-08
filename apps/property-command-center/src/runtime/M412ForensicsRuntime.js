import crypto from 'node:crypto';

export const CONTRACT =
  'SCIIP_EXPLORER_4_M4_12_UNRESOLVED_FRESH_INVENTORY_PROVENANCE_IDENTITY_FORENSICS';
export const VERSION='4.0-m4.12';

export const EXPECTED_BASELINE_EVENT_COUNT=5261;
export const EXPECTED_GENUINE_DIVERGENCE_ROWS=1464;
export const EXPECTED_M407_STALENESS_ROWS=188;
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

export function fieldHistory(events,pid,field){
  const out=[];
  for(let i=0;i<(events||[]).length;i++){
    const e=events[i];
    if(e?.canonicalPropertyId!==pid) continue;
    for(const c of e?.changes||[]){
      if(c?.field!==field) continue;
      out.push({
        authoritativeIndex:i,
        eventId:e.eventId??null,
        eventType:e.eventType??null,
        milestone:e.milestone??null,
        sourcePropertyId:e.sourcePropertyId??null,
        createdAt:e.createdAt??e.committedAt??null,
        before:c.before,
        after:c.after
      });
    }
  }
  return out;
}
