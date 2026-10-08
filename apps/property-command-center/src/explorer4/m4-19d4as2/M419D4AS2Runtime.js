import crypto from "node:crypto";
export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4AS2_DATA_BEARING_MARKET_AVAILABILITY_CANDIDATE_EXACT_PROVENANCE_RECONCILIATION";
export const VERSION="4.0-m4.19d4as2";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");

export function walk(v,path="$",out=[]){
  if(v&&typeof v==="object"){
    if(Array.isArray(v)) v.forEach((x,i)=>walk(x,`${path}[${i}]`,out));
    else for(const [k,x] of Object.entries(v)){ const p=`${path}.${k}`; out.push({path:p,key:k,value:x}); walk(x,p,out); }
  }
  return out;
}
export function looksDerived(path="",text=""){
  const s=(path+" "+text).toLowerCase();
  return /materiali[sz]|aggregate|cube|derived|projection|snapshot|rollup|computed/.test(s);
}
export function looksInventory(path="",text=""){
  const s=(path+" "+text).toLowerCase();
  return /governed-base-inventory|base inventory|inventory/.test(s);
}
