import crypto from "node:crypto";
export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4AQ_CONTROLLED_SINGLE_LIGHTBOX_POINT_READ_EXECUTION_AND_PARCEL_EVIDENCE_QUALIFICATION";
export const VERSION="4.0-m4.19d4aq";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");

export function normalizeAddress(s){
  return String(s??"").toUpperCase().replace(/[.,#]/g," ").replace(/\s+/g," ").trim();
}
export function collectObjects(v,out=[]){
  if(v&&typeof v==="object"){
    out.push(v);
    if(Array.isArray(v)){for(const x of v)collectObjects(x,out)}
    else for(const x of Object.values(v))collectObjects(x,out);
  }
  return out;
}
export function candidateAddress(o){
  for(const k of ["formattedAddress","formatted_address","address","propertyAddress","streetAddress"]){
    if(typeof o?.[k]==="string"&&o[k].trim())return o[k].trim();
  }
  const a=o?.address;
  if(a&&typeof a==="object"){
    const parts=[a.streetAddress,a.addressLine1,a.city,a.state,a.postalCode].filter(Boolean);
    if(parts.length)return parts.join(", ");
  }
  return null;
}
