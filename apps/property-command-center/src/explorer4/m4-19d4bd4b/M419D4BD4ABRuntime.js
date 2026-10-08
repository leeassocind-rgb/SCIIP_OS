import crypto from "node:crypto";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");
export const norm=x=>String(x??"").trim().toUpperCase().replace(/[.,]/g,"").replace(/\s+/g," ");
export function recordsOf(doc){
 if(Array.isArray(doc)) return {records:doc,container:"ARRAY"};
 for(const k of ["records","properties","items","features","inventory","data"])
  if(Array.isArray(doc?.[k])) return {records:doc[k],container:k};
 const arr=Object.entries(doc||{}).filter(([,v])=>Array.isArray(v));
 return arr.length===1?{records:arr[0][1],container:arr[0][0]}:{records:[],container:null};
}
export function setRecords(doc,container,records){
 if(container==="ARRAY") return records;
 return {...doc,[container]:records};
}
export function stableObjectDiff(a,b,p="$",out=[]){
 if(a===b)return out;
 const ta=typeof a,tb=typeof b;
 if(a===null||b===null||ta!=="object"||tb!=="object"){
  out.push({path:p,before:a,after:b});return out;
 }
 if(Array.isArray(a)||Array.isArray(b)){
  if(!(Array.isArray(a)&&Array.isArray(b))){out.push({path:p,before:a,after:b});return out;}
  const n=Math.max(a.length,b.length);
  for(let i=0;i<n;i++) stableObjectDiff(a[i],b[i],`${p}[${i}]`,out);
  return out;
 }
 const keys=new Set([...Object.keys(a),...Object.keys(b)]);
 for(const k of [...keys].sort()) stableObjectDiff(a[k],b[k],`${p}.${k}`,out);
 return out;
}
