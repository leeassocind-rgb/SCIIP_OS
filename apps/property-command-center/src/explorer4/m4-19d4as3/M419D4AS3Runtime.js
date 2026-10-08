import crypto from "node:crypto";
export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4AS3_PREFERRED_MARKET_AVAILABILITY_CANDIDATE_SOURCE_NATIVE_PROVENANCE_COMPLETION";
export const VERSION="4.0-m4.19d4as3";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");

export function walk(v,path="$",out=[]){
  if(v&&typeof v==="object"){
    if(Array.isArray(v)) v.forEach((x,i)=>walk(x,`${path}[${i}]`,out));
    else for(const [k,x] of Object.entries(v)){ const p=`${path}.${k}`; out.push({path:p,key:k,value:x}); walk(x,p,out); }
  }
  return out;
}
export function norm(v){return String(v??"").trim().toUpperCase();}
