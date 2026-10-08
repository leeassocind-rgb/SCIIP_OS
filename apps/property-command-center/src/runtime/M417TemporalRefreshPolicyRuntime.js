import crypto from 'node:crypto';

export const CONTRACT =
  'SCIIP_EXPLORER_4_M4_17_TEMPORAL_REFRESH_AND_NEXT_OBSERVATION_POLICY';
export const VERSION='4.0-m4.17';

export const EXPECTED_BASELINE_EVENT_COUNT=5261;
export const EXPECTED_RESOLVED_STALE_ROWS=1587;
export const EXPECTED_QUARANTINE_ROWS=72;
export const EXPECTED_FRESH_CANDIDATES=0;
export const APPROVED_FIELD='availableSf';

export const sha256=x=>crypto.createHash('sha256').update(x).digest('hex');

export function fileSha(fs,p){
  return sha256(fs.readFileSync(p));
}
