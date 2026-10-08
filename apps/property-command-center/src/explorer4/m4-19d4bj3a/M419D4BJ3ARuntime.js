import fs from"node:fs";import path from"node:path";
export const readJson=p=>JSON.parse(fs.readFileSync(p,"utf8"));
export function writeJson(p,x){fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n")}
export function walk(root,max=8000){
 const out=[],stack=[root];
 while(stack.length&&out.length<max){
  const d=stack.pop();let es=[];try{es=fs.readdirSync(d,{withFileTypes:true})}catch{continue}
  for(const e of es){
   const p=path.join(d,e.name),rel=path.relative(root,p);
   if(/node_modules|\.git|__pycache__|dist|build|src\/explorer4|evidence|test|spec/i.test(rel))continue;
   if(e.isDirectory())stack.push(p);
   else{
    try{
     const st=fs.statSync(p);
     if(st.size<2_000_000 && /\.(mjs|js|jsx|ts|tsx|gs|py|sh|command)$/i.test(e.name)) out.push({p,rel});
    }catch{}
   }
  }
 }
 return out
}
export const text=p=>{try{return fs.readFileSync(p,"utf8")}catch{return""}};
