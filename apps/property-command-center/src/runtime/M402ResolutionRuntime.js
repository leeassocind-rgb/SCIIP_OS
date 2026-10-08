import crypto from 'node:crypto';
export const CONTRACT='SCIIP_EXPLORER_4_M4_02_PROVENANCE_ATTRIBUTION_RESOLUTION_FORENSICS';
export const VERSION='4.0-m4.02';
export const EXPECTED_BASELINE_EVENT_COUNT=5073;
export const EXPECTED_PARENT_REVIEW_ROWS=195;
export const EXPECTED_DETERMINISTIC_PARENT_ROWS=188;
export const EXPECTED_UNRESOLVED_ROWS=7;
export const APPROVED_FIELD='availableSf';
export const sha256=x=>crypto.createHash('sha256').update(x).digest('hex');
export const fileSha=(fs,p)=>sha256(fs.readFileSync(p));
export function fieldHistory(events,pid,field){
  const out=[];
  for(let index=0;index<(events||[]).length;index++){
    const e=events[index]; if(e?.canonicalPropertyId!==pid) continue;
    for(const c of e?.changes||[]) if(c?.field===field) out.push({authoritativeIndex:index,eventId:e.eventId??null,eventType:e.eventType??null,milestone:e.milestone??null,sequence:e.sequence??null,sourcePropertyId:e.sourcePropertyId??null,before:c.before,after:c.after,createdAt:e.createdAt??e.committedAt??null});
  }
  return out;
}
export function sourceIdsForCanonical(identities,cid){
  const i=(identities||[]).find(x=>x?.canonicalPropertyId===cid);
  return [...new Set((i?.sourcePropertyIds||[]).filter(Boolean).map(String))];
}
