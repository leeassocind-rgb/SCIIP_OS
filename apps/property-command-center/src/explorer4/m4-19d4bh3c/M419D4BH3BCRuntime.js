import fs from"node:fs";import path from"node:path";
export const sleep=ms=>new Promise(r=>setTimeout(r,ms));
export async function get(url,t=1800){const a=new AbortController(),x=setTimeout(()=>a.abort(),t);try{const r=await fetch(url,{signal:a.signal,redirect:"follow"});return{ok:r.ok,status:r.status,url:r.url,text:await r.text()}}catch(e){return{ok:false,error:String(e)}}finally{clearTimeout(x)}}
export function walk(root){const o=[];function w(d){let es=[];try{es=fs.readdirSync(d,{withFileTypes:true})}catch{return}for(const e of es){const p=path.join(d,e.name);if(e.isDirectory()){if(!["node_modules",".git","dist","build","coverage","explorer4"].includes(e.name))w(p)}else if(/\.(jsx?|tsx?|mjs)$/.test(p))o.push(p)}}w(root);return o}
