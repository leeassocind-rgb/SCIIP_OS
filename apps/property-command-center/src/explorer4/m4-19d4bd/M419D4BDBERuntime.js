import crypto from "node:crypto";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");
export const norm=x=>String(x??"").trim().toUpperCase().replace(/[.,]/g,"").replace(/\s+/g," ");
export function recordsOf(doc){
 if(Array.isArray(doc)) return {records:doc,container:"ARRAY"};
 for(const k of ["records","properties","items","features","inventory","data"]) if(Array.isArray(doc?.[k])) return {records:doc[k],container:k};
 const entries=Object.entries(doc||{}).filter(([,v])=>Array.isArray(v));
 return entries.length===1?{records:entries[0][1],container:entries[0][0]}:{records:[],container:null};
}
export function flatten(obj,p="$",out=[]){
 if(obj&&typeof obj==="object"){
  if(Array.isArray(obj)) obj.forEach((v,i)=>flatten(v,`${p}[${i}]`,out));
  else for(const [k,v] of Object.entries(obj)){const q=`${p}.${k}`;out.push({path:q,key:k,value:v});flatten(v,q,out)}
 }
 return out;
}
export function duplicateMatches(records,c){
 const cid=norm(c.canonicalPropertyId),sid=norm(c.sourcePropertyId),addr=norm(c.address);
 return records.map((r,i)=>({i,r})).filter(({r})=>{
  const vals=[r.canonicalPropertyId,r.sourcePropertyId,r.propertyId,r.id,r.address,r.streetAddress,r.fullAddress]
   .map(norm).filter(Boolean);
  return vals.includes(cid)||vals.includes(sid)||vals.includes(addr);
 });
}
