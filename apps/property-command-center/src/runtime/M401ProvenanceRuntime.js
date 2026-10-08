import crypto from 'node:crypto';

export const CONTRACT='SCIIP_EXPLORER_4_M4_01_HISTORY_PROVENANCE_SOURCE_PRECEDENCE_POLICY';
export const VERSION='4.0-m4.01';
export const EXPECTED_BASELINE_EVENT_COUNT=5073;
export const EXPECTED_PROVENANCE_REVIEW_ROWS=195;
export const EXPECTED_SINGLE_SOURCE_GAPS=188;
export const EXPECTED_UNRESOLVED_LINK_ROWS=7;
export const APPROVED_FIELD='availableSf';
export const sha256=x=>crypto.createHash('sha256').update(x).digest('hex');
export const fileSha=(fs,p)=>sha256(fs.readFileSync(p));

export function fieldHistory(events,pid,field){
  const out=[];
  for(let index=0;index<(events||[]).length;index++){
    const e=events[index];
    if(e?.canonicalPropertyId!==pid) continue;
    for(const c of e?.changes||[]){
      if(c?.field!==field) continue;
      out.push({authoritativeIndex:index,eventId:e.eventId??null,eventType:e.eventType??null,milestone:e.milestone??null,sequence:e.sequence??null,sourcePropertyId:e.sourcePropertyId??null,before:c.before,after:c.after,createdAt:e.createdAt??e.committedAt??null});
    }
  }
  return out;
}

export function precedenceRank(kind){
  return ({
    EXPLICIT_EVENT_SOURCE_ATTRIBUTION:1,
    SOLE_CURRENT_IDENTITY_INFERENCE:2,
    TEMPORAL_SOURCE_OBSERVATION_MATCH:3,
    SHARED_CANONICAL_ALIAS_ATTRIBUTION:4,
    UNATTRIBUTED_CANONICAL_HISTORY:5,
    EXTERNAL_EVIDENCE_REQUIRED:6
  })[kind]??99;
}
