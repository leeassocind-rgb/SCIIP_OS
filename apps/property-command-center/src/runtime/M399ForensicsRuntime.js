import crypto from 'node:crypto';

export const CONTRACT =
  'SCIIP_EXPLORER_3_M3_99_PREEXISTING_1004_MISMATCH_CAUSAL_FORENSICS_REFRESH_POLICY';
export const VERSION='3.0-m3.99';

export const EXPECTED_CURRENT_EVENT_COUNT=5073;
export const EXPECTED_PRE_M394_EVENT_COUNT=4451;
export const EXPECTED_PREEXISTING_MISMATCH_COUNT=1004;
export const APPROVED_FIELD='availableSf';

export const sha256=x=>crypto.createHash('sha256').update(x).digest('hex');

export function fileSha(fs,p){
  return sha256(fs.readFileSync(p));
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
        createdAt:e.createdAt??e.committedAt??null,
        before:c.before,
        after:c.after
      });
    }
  }
  return out;
}
