import crypto from 'node:crypto';

export const CONTRACT =
  'SCIIP_EXPLORER_4_M4_19C_EXTERNAL_REFRESH_SOURCE_CONNECTOR_OR_OPERATOR_EVIDENCE_INGESTION_POLICY';
export const VERSION='4.0-m4.19c';

export const EXPECTED_BASELINE_EVENT_COUNT=5261;
export const EXPECTED_PREAUTHORIZED_ROWS=400;
export const EXPECTED_INTERNAL_SOURCE_HITS=0;
export const EXPECTED_UNRESOLVED_ROWS=400;
export const APPROVED_FIELD='availableSf';

export const sha256=x=>crypto.createHash('sha256').update(x).digest('hex');

export function fileSha(fs,p){
  return sha256(fs.readFileSync(p));
}
