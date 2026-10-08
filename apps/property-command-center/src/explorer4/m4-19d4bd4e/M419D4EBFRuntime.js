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
export function flatten(obj,p="$",out=[]){
 if(obj&&typeof obj==="object"){
  if(Array.isArray(obj)) obj.forEach((v,i)=>flatten(v,`${p}[${i}]`,out));
  else for(const [k,v] of Object.entries(obj)){
   const q=`${p}.${k}`; out.push({path:q,key:k,value:v}); flatten(v,q,out);
  }
 }
 return out;
}
export function walk(fs,path,roots,{maxFiles=6000,maxBytes=4*1024*1024}={}){
 const out=[];
 function go(d){
  if(out.length>=maxFiles)return;
  let es=[];try{es=fs.readdirSync(d,{withFileTypes:true})}catch{return}
  for(const e of es){
   if(out.length>=maxFiles)break;
   const p=path.join(d,e.name);
   if(e.isDirectory()){
    if(["node_modules",".git","dist","build","coverage","explorer4"].includes(e.name))continue;
    go(p);
   } else {
    try{if(fs.statSync(p).size<=maxBytes)out.push(p)}catch{}
   }
  }
 }
 roots.forEach(r=>{if(fs.existsSync(r))go(r)});
 return out;
}
