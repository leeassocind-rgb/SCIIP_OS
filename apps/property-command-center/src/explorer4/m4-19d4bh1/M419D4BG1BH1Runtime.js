import crypto from "node:crypto";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");
export const sleep=ms=>new Promise(r=>setTimeout(r,ms));
export async function httpGet(url,timeoutMs=1500){
 const ac=new AbortController(); const t=setTimeout(()=>ac.abort(),timeoutMs);
 try{
  const r=await fetch(url,{signal:ac.signal,redirect:"follow"});
  return {ok:r.ok,status:r.status,url:r.url,text:await r.text()};
 }catch(e){return {ok:false,status:null,url,error:String(e)}}finally{clearTimeout(t)}
}
