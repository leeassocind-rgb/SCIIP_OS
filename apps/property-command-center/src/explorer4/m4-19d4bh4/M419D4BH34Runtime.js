import fs from "node:fs";
import path from "node:path";
export const sleep=ms=>new Promise(r=>setTimeout(r,ms));
export async function httpGet(url,timeoutMs=1500){
  const ac=new AbortController(); const t=setTimeout(()=>ac.abort(),timeoutMs);
  try{
    const r=await fetch(url,{signal:ac.signal,redirect:"follow"});
    return {ok:r.ok,status:r.status,url:r.url,text:await r.text()};
  }catch(e){return {ok:false,status:null,error:String(e)}}finally{clearTimeout(t)}
}
export function walk(root,{maxFiles=5000,maxBytes=2*1024*1024}={}){
  const out=[];
  function go(d){
    if(out.length>=maxFiles)return;
    let es=[]; try{es=fs.readdirSync(d,{withFileTypes:true})}catch{return}
    for(const e of es){
      if(out.length>=maxFiles)break;
      const p=path.join(d,e.name);
      if(e.isDirectory()){
        if(["node_modules",".git","dist","build","coverage","explorer4"].includes(e.name))continue;
        go(p);
      }else{
        try{if(fs.statSync(p).size<=maxBytes)out.push(p)}catch{}
      }
    }
  }
  go(root); return out;
}
