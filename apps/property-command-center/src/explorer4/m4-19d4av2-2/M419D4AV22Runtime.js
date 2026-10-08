import crypto from "node:crypto";
export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4AV2_2_STRUCTURAL_SAME_RECORD_IDENTITY_LINEAGE_VALIDATION_AND_FALSE_POSITIVE_REJECTION";
export const VERSION="4.0-m4.19d4av2.2";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");
export const norm=x=>String(x??"").trim().toUpperCase().replace(/[.,]/g,"").replace(/\s+/g," ");
export function flatten(obj,p="$",out=[]){
  if(obj&&typeof obj==="object"){
    if(Array.isArray(obj)) obj.forEach((v,i)=>flatten(v,`${p}[${i}]`,out));
    else for(const [k,v] of Object.entries(obj)){const q=`${p}.${k}`;out.push({path:q,key:k,value:v});flatten(v,q,out)}
  }
  return out;
}
export function addressLike(v){
  const s=norm(v);
  return /\b\d{2,6}\b/.test(s) && /\b(ST|AVE|AV|BLVD|RD|DR|WAY|LN|CT|HWY|PKWY|PL)\b/.test(s);
}
