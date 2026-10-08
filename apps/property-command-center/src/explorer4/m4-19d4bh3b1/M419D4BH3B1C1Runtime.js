import fs from"node:fs";import path from"node:path";
export const sleep=ms=>new Promise(r=>setTimeout(r,ms));
export async function get(url,t=1800){const a=new AbortController(),x=setTimeout(()=>a.abort(),t);try{const r=await fetch(url,{signal:a.signal});return{ok:r.ok,status:r.status}}catch(e){return{ok:false,error:String(e)}}finally{clearTimeout(x)}}
