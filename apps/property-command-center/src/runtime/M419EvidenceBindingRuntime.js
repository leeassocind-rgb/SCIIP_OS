import crypto from 'node:crypto';

export const CONTRACT =
  'SCIIP_EXPLORER_4_M4_19_REFRESH_OBSERVATION_EVIDENCE_BINDING_AND_EXECUTION_READINESS_GATE';
export const VERSION='4.0-m4.19';

export const EXPECTED_BASELINE_EVENT_COUNT=5261;
export const EXPECTED_PREAUTHORIZED_ROWS=400;
export const EXPECTED_QUARANTINE_ROWS=72;
export const APPROVED_FIELD='availableSf';

export const sha256=x=>crypto.createHash('sha256').update(x).digest('hex');

export function fileSha(fs,p){
  return sha256(fs.readFileSync(p));
}

export function collectObjects(node,out=[]){
  if(Array.isArray(node)){
    for(const x of node) collectObjects(x,out);
  }else if(node && typeof node==='object'){
    out.push(node);
    for(const v of Object.values(node)) collectObjects(v,out);
  }
  return out;
}

export function normalizeNumber(v){
  if(typeof v==='number' && Number.isFinite(v)) return v;
  if(typeof v==='string' && v.trim()!==''){
    const n=Number(v.replace(/,/g,''));
    return Number.isFinite(n)?n:null;
  }
  return null;
}
