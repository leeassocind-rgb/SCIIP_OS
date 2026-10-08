import crypto from "node:crypto";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");
export const norm=x=>String(x??"").trim().toUpperCase().replace(/[.,]/g,"").replace(/\s+/g," ");
export function flatten(obj,p="$",out=[]){
 if(obj&&typeof obj==="object"){
  if(Array.isArray(obj)) obj.forEach((v,i)=>flatten(v,`${p}[${i}]`,out));
  else for(const [k,v] of Object.entries(obj)){const q=`${p}.${k}`;out.push({path:q,key:k,value:v});flatten(v,q,out)}
 }
 return out;
}
export function recordsOf(doc){
 if(Array.isArray(doc)) return doc;
 for(const k of ["records","properties","items","features","inventory","data"]) if(Array.isArray(doc?.[k])) return doc[k];
 const arr=Object.values(doc||{}).filter(Array.isArray);
 return arr.length===1?arr[0]:[];
}
export function addressTokens(s){
 const n=norm(s);
 const nums=n.match(/\b\d{2,6}\b/g)||[];
 const street=(n.match(/\b[A-Z][A-Z0-9'-]*(?:\s+[A-Z][A-Z0-9'-]*){0,3}\s+(?:ST|AVE|AV|BLVD|RD|DR|WAY|LN|CT|HWY|PKWY|PL)\b/)||[])[0]||"";
 return {n,nums,street};
}
