import crypto from "node:crypto";
export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4AH_SINGLE_RECORD_COORDINATE_BINDING_AND_CORRECTED_ENRICH_REQUEST_PREAUTHORIZATION";
export const VERSION="4.0-m4.19d4ah";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");

export function collectObjects(x,out=[]){
  if(Array.isArray(x)){ for(const v of x) collectObjects(v,out); return out; }
  if(x&&typeof x==="object"){
    out.push(x);
    for(const v of Object.values(x)) collectObjects(v,out);
  }
  return out;
}
export function finiteCoord(v,min,max){
  const n=Number(v);
  return Number.isFinite(n)&&n>=min&&n<=max?n:null;
}
export function identityMatches(o,canonicalId,sourceId){
  const vals=[
    o?.canonicalPropertyId,o?.canonicalId,o?.targetCanonicalPropertyId,
    o?.sourcePropertyId,o?.sourceId,o?.propertyId,o?.id,o?.subject?.id
  ].filter(Boolean).map(String);
  return vals.includes(String(canonicalId))||vals.includes(String(sourceId));
}
