import crypto from 'node:crypto';

export const CONTRACT =
  'SCIIP_EXPLORER_4_M4_19B_REFRESH_OBSERVATION_SOURCE_ACQUISITION_ADAPTER';
export const VERSION='4.0-m4.19b';

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

export function collectObjects(node,out=[]){
  if(Array.isArray(node)){
    for(const x of node) collectObjects(x,out);
  }else if(node && typeof node==='object'){
    out.push(node);
    for(const v of Object.values(node)) collectObjects(v,out);
  }
  return out;
}

export function timestampScore(v){
  const t=Date.parse(v||'');
  return Number.isFinite(t)?t:Number.NEGATIVE_INFINITY;
}
