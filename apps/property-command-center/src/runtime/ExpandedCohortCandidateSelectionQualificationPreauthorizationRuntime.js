import fs from 'node:fs';
import crypto from 'node:crypto';

export const CONTRACT='SCIIP_EXPLORER_3_M3_37_EXPANDED_COHORT_PREAUTHORIZATION';
export const VERSION='3.0-m3.37';
export const MAX_RECORDS=10;
export const FIELD='availableSf';
export const MUTATION_CLASS='CLASS_B_EXPANDED_COHORT_SINGLE_FIELD';

export function sha256Bytes(buf){ return crypto.createHash('sha256').update(buf).digest('hex'); }
export function sha256Json(v){ return sha256Bytes(Buffer.from(JSON.stringify(v))); }
export function readJson(p){ return JSON.parse(fs.readFileSync(p,'utf8')); }
export function fileSha(p){ return sha256Bytes(fs.readFileSync(p)); }

export function collectCandidateObjects(node, out=[], seen=new Set()){
  if(node===null || typeof node!=='object') return out;
  if(seen.has(node)) return out; seen.add(node);
  if(!Array.isArray(node)){
    const id = node.propertyId ?? node.canonicalPropertyId ?? node.id ?? node.property_id;
    if(typeof id==='string' && id.startsWith('CPROP-') &&
       Number.isFinite(node[FIELD]) && Number.isInteger(node[FIELD]) && node[FIELD] > 100){
      out.push({propertyId:id,before:node[FIELD]});
    }
  }
  if(Array.isArray(node)) for(const v of node) collectCandidateObjects(v,out,seen);
  else for(const v of Object.values(node)) collectCandidateObjects(v,out,seen);
  return out;
}

export function dedupeCurrentCandidates(items){
  const m=new Map();
  for(const x of items){
    if(!m.has(x.propertyId)) m.set(x.propertyId,x);
    else if(m.get(x.propertyId).before!==x.before) m.set(x.propertyId,null);
  }
  return [...m.values()].filter(Boolean);
}

export function deterministicDelta(propertyId,before){
  const n=parseInt(sha256Bytes(Buffer.from(propertyId)).slice(0,8),16);
  const cap=Math.max(1,Math.min(500,Math.floor(before*0.0025)));
  return 1+(n%cap);
}

export function selectCandidates(canonical, excludedIds=[]){
  const excluded=new Set(excludedIds);
  return dedupeCurrentCandidates(collectCandidateObjects(canonical))
    .filter(x=>!excluded.has(x.propertyId))
    .sort((a,b)=>a.propertyId.localeCompare(b.propertyId))
    .slice(0,MAX_RECORDS)
    .map((x,i)=>{
      const delta=deterministicDelta(x.propertyId,x.before);
      return {...x,after:x.before-delta,rollbackValue:x.before,delta,sequence:i+1};
    });
}

export function qualificationHash(c,sourceSha){
  return sha256Json({contract:CONTRACT,sourceSha,mutationClass:MUTATION_CLASS,field:FIELD,
    sequence:c.sequence,propertyId:c.propertyId,before:c.before,after:c.after,rollbackValue:c.rollbackValue});
}
export function idempotencyKey(c,sourceSha){
  return sha256Json({purpose:'M337_IDEMPOTENCY',sourceSha,field:FIELD,propertyId:c.propertyId,before:c.before,after:c.after});
}
export function freshToken(){ return crypto.randomBytes(32).toString('hex'); }

export function validateM336(e){
  const ok=e?.status==='PASSED' && e?.state==='M336_PROGRESSIVE_EXPANSION_POLICY_CERTIFIED' &&
    e?.policyCertification?.nextBoundedCohortCeiling===10 &&
    e?.policyCertification?.mutationClass===MUTATION_CLASS &&
    e?.policyCertification?.executionAuthorized===false &&
    e?.authority?.liveWriteAuthority===false && e?.authority?.syncAuthority===false;
  return {status:ok?'CERTIFIED':'BLOCKED',state:ok?'M336_POLICY_ACCEPTED':'M336_POLICY_NOT_ACCEPTED'};
}

export function validateManifest(m){
  const c=m?.cohort ?? [];
  const ids=new Set(c.map(x=>x.propertyId)), toks=new Set(c.map(x=>x.singleUseToken)),
        keys=new Set(c.map(x=>x.idempotencyKey));
  const ok=m?.contract===CONTRACT && m?.status==='PREAUTHORIZED' &&
    c.length>0 && c.length<=MAX_RECORDS && ids.size===c.length && toks.size===c.length && keys.size===c.length &&
    c.every((x,i)=>x.sequence===i+1 && x.field===FIELD && x.before===x.rollbackValue &&
      Number.isInteger(x.before)&&Number.isInteger(x.after)&&x.after>=0&&x.after<x.before);
  return {status:ok?'CERTIFIED':'BLOCKED',state:ok?'M337_MANIFEST_STRUCTURE_CERTIFIED':'M337_MANIFEST_STRUCTURE_INVALID'};
}
