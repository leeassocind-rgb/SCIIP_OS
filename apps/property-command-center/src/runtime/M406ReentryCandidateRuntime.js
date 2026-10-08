import crypto from 'node:crypto';

export const CONTRACT =
  'SCIIP_EXPLORER_4_M4_06_PROVENANCE_AWARE_OPERATIONAL_INGESTION_REENTRY_CANDIDATE_QUALIFICATION_PREAUTHORIZATION';
export const VERSION='4.0-m4.06';

export const EXPECTED_BASELINE_EVENT_COUNT=5073;
export const REENTRY_CANDIDATE_CEILING=188;
export const QUARANTINED_EXCEPTIONS=7;
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
