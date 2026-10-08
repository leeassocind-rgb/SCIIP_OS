import crypto from 'node:crypto';

export const CONTRACT =
  'SCIIP_EXPLORER_4_M4_16_PROVENANCE_AWARE_FRESH_CANDIDATE_REASSESSMENT_AFTER_NORMALIZATION';
export const VERSION='4.0-m4.16';

export const EXPECTED_BASELINE_EVENT_COUNT=5261;
export const EXPECTED_RESOLVED_ROWS=1587;
export const EXPECTED_QUARANTINE_ROWS=72;
export const CANDIDATE_CEILING=400;
export const APPROVED_FIELD='availableSf';

export const sha256=x=>crypto.createHash('sha256').update(x).digest('hex');

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
