import crypto from "node:crypto";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");
export const norm=x=>String(x??"").trim().toUpperCase().replace(/[.,]/g,"").replace(/\s+/g," ");
export const sleep=ms=>new Promise(r=>setTimeout(r,ms));
export function commandExists(cmd){
 return new Promise(resolve=>{
  import("node:child_process").then(({spawn})=>{
   const p=spawn("sh",["-lc",`command -v ${cmd} >/dev/null 2>&1`]);
   p.on("exit",c=>resolve(c===0)); p.on("error",()=>resolve(false));
  });
 });
}
export async function httpGet(url,timeoutMs=5000){
 const ac=new AbortController(); const t=setTimeout(()=>ac.abort(),timeoutMs);
 try{
  const r=await fetch(url,{signal:ac.signal,redirect:"follow"});
  return {ok:r.ok,status:r.status,url:r.url,text:await r.text()};
 }catch(e){return {ok:false,status:null,url,error:String(e)}}finally{clearTimeout(t)}
}
