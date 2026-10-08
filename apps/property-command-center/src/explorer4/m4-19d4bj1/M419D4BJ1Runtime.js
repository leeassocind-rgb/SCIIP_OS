import fs from"node:fs";import path from"node:path";import crypto from"node:crypto";

export function readJson(p){return JSON.parse(fs.readFileSync(p,"utf8"))}
export function writeJson(p,x){fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n")}
export function sha(s){return crypto.createHash("sha256").update(s).digest("hex")}
export function norm(v){return String(v??"").trim()}
export function walk(root,{maxFiles=2500,maxBytes=2097152,exclude=[]}={}){
 const out=[];const stack=[root];
 while(stack.length&&out.length<maxFiles){
  const d=stack.pop();let ents=[];
  try{ents=fs.readdirSync(d,{withFileTypes:true})}catch{continue}
  for(const e of ents){
   const p=path.join(d,e.name),rel=path.relative(root,p);
   if(exclude.some(x=>rel.includes(x)))continue;
   if(e.isDirectory()){stack.push(p);continue}
   if(out.length>=maxFiles)break;
   try{
    const st=fs.statSync(p);
    if(st.size<=maxBytes)out.push({path:p,rel,size:st.size});
   }catch{}
  }
 }
 return out
}
export function safeText(p){
 try{return fs.readFileSync(p,"utf8")}catch{return""}
}
export function isoCandidates(text){
 const m=text.match(/\b20\d{2}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})\b/g);
 return [...new Set(m||[])].slice(0,20);
}
