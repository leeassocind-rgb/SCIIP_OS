import crypto from 'node:crypto';

export const CONTRACT =
  'SCIIP_EXPLORER_4_M4_00_IDENTITY_ALIAS_DIVERGENCE_FORENSICS';
export const VERSION='4.0-m4.00';

export const EXPECTED_BASELINE_EVENT_COUNT=5073;
export const EXPECTED_IDENTITY_REVIEW_ROWS=195;
export const EXPECTED_SOURCE_IDENTITY_HISTORY_DIVERGENCE_ROWS=188;
export const EXPECTED_SHARED_CANONICAL_ALIAS_ROWS=7;
export const APPROVED_FIELD='availableSf';

export const sha256=x=>crypto.createHash('sha256').update(x).digest('hex');

export function fileSha(fs,p){
  return sha256(fs.readFileSync(p));
}

export function fieldHistory(events,pid,field){
  const out=[];
  for(let index=0; index<(events||[]).length; index++){
    const e=events[index];
    if(e?.canonicalPropertyId!==pid) continue;
    for(const c of e?.changes||[]){
      if(c?.field!==field) continue;
      out.push({
        authoritativeIndex:index,
        eventId:e.eventId??null,
        eventType:e.eventType??null,
        milestone:e.milestone??null,
        sequence:e.sequence??null,
        sourcePropertyId:e.sourcePropertyId??null,
        before:c.before,
        after:c.after,
        createdAt:e.createdAt??e.committedAt??null
      });
    }
  }
  return out;
}
