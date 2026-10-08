import crypto from 'node:crypto';

export const CONTRACT =
  'SCIIP_EXPLORER_4_M4_18_NEXT_OBSERVATION_SOURCE_QUALIFICATION_AND_REFRESH_PREAUTHORIZATION';
export const VERSION='4.0-m4.18';

export const EXPECTED_BASELINE_EVENT_COUNT=5261;
export const EXPECTED_REFRESH_ELIGIBLE_ROWS=1587;
export const EXPECTED_QUARANTINE_ROWS=72;
export const APPROVED_FIELD='availableSf';
export const REFRESH_COHORT_CEILING=400;

export const sha256=x=>crypto.createHash('sha256').update(x).digest('hex');
export const freshToken=()=>crypto.randomBytes(24).toString('hex');

export function fileSha(fs,p){
  return sha256(fs.readFileSync(p));
}
