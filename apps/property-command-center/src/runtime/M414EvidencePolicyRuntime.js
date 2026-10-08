import crypto from 'node:crypto';

export const CONTRACT =
  'SCIIP_EXPLORER_4_M4_14_TARGETED_SHARED_CANONICAL_PROVENANCE_EVIDENCE_POLICY';
export const VERSION='4.0-m4.14';

export const EXPECTED_BASELINE_EVENT_COUNT=5261;
export const EXPECTED_TARGET_ROWS=89;
export const EXPECTED_EXPLICIT_ALIAS_ROWS=24;
export const EXPECTED_AMBIGUOUS_ALIAS_ROWS=37;
export const EXPECTED_UNRESOLVED_ROWS=28;
export const EXPECTED_TARGETED_EVIDENCE_ROWS=65;
export const APPROVED_FIELD='availableSf';

export const sha256=x=>crypto.createHash('sha256').update(x).digest('hex');

export function fileSha(fs,p){
  return sha256(fs.readFileSync(p));
}
