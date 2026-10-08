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
export function discoverMaterializationCandidates(app){
 const fs=requireShim.fs, path=requireShim.path;
 const roots=[path.join(app,"public"),path.join(app,"src"),path.join(app,"server")].filter(fs.existsSync);
 const out=[]; const exts=new Set([".json",".js",".mjs",".ts",".tsx",".jsx"]);
 function walk(d){
  let es=[];try{es=fs.readdirSync(d,{withFileTypes:true})}catch{return}
  for(const e of es){
   const p=path.join(d,e.name);
   if(e.isDirectory()){
    if(["node_modules",".git","dist","build","coverage","explorer4"].includes(e.name)) continue;
    walk(p);
   } else if(exts.has(path.extname(p).toLowerCase())){
    let t="";try{if(fs.statSync(p).size>3*1024*1024)continue;t=fs.readFileSync(p,"utf8")}catch{continue}
    const score=[
      /governed-base-inventory/i.test(t)?5:0,
      /availableSf/i.test(t)?3:0,
      /property.*explorer|explorer.*property/i.test(t)?2:0,
      /materializ|current.state|base.inventory/i.test(t)?2:0
    ].reduce((a,b)=>a+b,0);
    if(score>=5) out.push({path:p,score,refs:{
      governedBaseInventory:/governed-base-inventory/i.test(t),
      availableSf:/availableSf/i.test(t),
      explorer:/property.*explorer|explorer.*property/i.test(t),
      materialization:/materializ|current.state|base.inventory/i.test(t)
    }});
   }
  }
 }
 roots.forEach(walk); return out.sort((a,b)=>b.score-a.score||a.path.localeCompare(b.path));
}
export const requireShim={fs:null,path:null};
