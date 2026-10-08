import crypto from 'node:crypto';

export const CONTRACT =
  'SCIIP_EXPLORER_4_M4_13_FRESH_INVENTORY_HISTORY_AND_ALIAS_PROVENANCE_FORENSICS';
export const VERSION='4.0-m4.13';

export const EXPECTED_BASELINE_EVENT_COUNT=5261;
export const EXPECTED_UNATTRIBUTED_HISTORY_ROWS=89;
export const EXPECTED_CANONICALLY_EXPLAINED_ROWS=1375;
export const APPROVED_FIELD='availableSf';

export const sha256=x=>crypto.createHash('sha256').update(x).digest('hex');

export function fileSha(fs,p){
  return sha256(fs.readFileSync(p));
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
