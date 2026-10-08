import crypto from 'node:crypto';

export const CONTRACT =
  'SCIIP_EXPLORER_4_M4_15_PROVENANCE_PRECEDENCE_NORMALIZATION_WITH_TARGETED_EVIDENCE_QUARANTINE';
export const VERSION='4.0-m4.15';

export const EXPECTED_BASELINE_EVENT_COUNT=5261;
export const EXPECTED_EXPLICIT_ALIAS_ROWS=24;
export const EXPECTED_TARGETED_EVIDENCE_ROWS=65;
export const EXPECTED_PRIOR_QUARANTINE_ROWS=7;
export const EXPECTED_TOTAL_QUARANTINE_ROWS=72;
export const EXPECTED_CANONICALLY_EXPLAINED_ROWS=1375;
export const EXPECTED_M407_STALENESS_ROWS=188;
export const APPROVED_FIELD='availableSf';
export const NEXT_CANDIDATE_CEILING=400;

export const sha256=x=>crypto.createHash('sha256').update(x).digest('hex');

export function fileSha(fs,p){
  return sha256(fs.readFileSync(p));
}

export function walkObjects(node,out=[]){
  if(Array.isArray(node)){
    for(const x of node) walkObjects(x,out);
  }else if(node && typeof node==='object'){
    out.push(node);
    for(const v of Object.values(node)) walkObjects(v,out);
  }
  return out;
}
