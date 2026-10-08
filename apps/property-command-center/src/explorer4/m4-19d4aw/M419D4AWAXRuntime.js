import crypto from "node:crypto";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");
export const norm=x=>String(x??"").trim().toUpperCase().replace(/[.,]/g,"").replace(/\s+/g," ");
export function recordsOf(doc){
 if(Array.isArray(doc)) return doc;
 for(const k of ["records","properties","items","features","inventory","data"]) if(Array.isArray(doc?.[k])) return doc[k];
 const arr=Object.values(doc||{}).filter(Array.isArray);
 return arr.length===1?arr[0]:[];
}
