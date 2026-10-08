import crypto from 'node:crypto';

export const CONTRACT =
  'SCIIP_EXPLORER_4_M4_19A_REFRESH_OBSERVATION_EVIDENCE_COMPLETION_AND_REBINDING';
export const VERSION='4.0-m4.19a';

export const EXPECTED_PREAUTHORIZED_ROWS=400;
export const EXPECTED_BASELINE_EVENT_COUNT=5261;
export const APPROVED_FIELD='availableSf';

export const sha256=x=>crypto.createHash('sha256').update(x).digest('hex');

export function fileSha(fs,p){
  return sha256(fs.readFileSync(p));
}

export function normalizeNumber(v){
  if(typeof v==='number' && Number.isFinite(v)) return v;
  if(typeof v==='string' && v.trim()!==''){
    const n=Number(v.replace(/,/g,''));
    return Number.isFinite(n)?n:null;
  }
  return null;
}
