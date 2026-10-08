import crypto from "node:crypto";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");
export const norm=x=>String(x??"").trim().toUpperCase().replace(/[.,]/g,"").replace(/\s+/g," ");
export function recordsOf(doc){
 if(Array.isArray(doc)) return {records:doc,container:"ARRAY"};
 for(const k of ["records","properties","items","features","inventory","data"])
  if(Array.isArray(doc?.[k])) return {records:doc[k],container:k};
 const a=Object.entries(doc||{}).filter(([,v])=>Array.isArray(v));
 return a.length===1?{records:a[0][1],container:a[0][0]}:{records:[],container:null};
}
export function setRecords(doc,container,records){
 if(container==="ARRAY") return records;
 return {...doc,[container]:records};
}
export function diff(a,b,p="$",out=[]){
 if(Object.is(a,b)) return out;
 const ao=a&&typeof a==="object", bo=b&&typeof b==="object";
 if(!ao||!bo||Array.isArray(a)!==Array.isArray(b)){
  out.push({path:p,before:a,after:b}); return out;
 }
 if(Array.isArray(a)){
  const n=Math.max(a.length,b.length);
  for(let i=0;i<n;i++) diff(a[i],b[i],`${p}[${i}]`,out);
  return out;
 }
 const keys=[...new Set([...Object.keys(a),...Object.keys(b)])].sort();
 for(const k of keys) diff(a[k],b[k],`${p}.${k}`,out);
 return out;
}
export function pathLeaf(p){
 const m=String(p).match(/\.([A-Za-z_$][A-Za-z0-9_$]*)$/);
 return m?m[1]:null;
}
