import crypto from "node:crypto";
export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4G_LIGHTBOX_ORIGINAL_SOURCE_LISTENER_PORT_CERTIFICATION";
export const VERSION="4.0-m4.19d4g";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");

export function extractPortEvidence(text=""){
  const hits=[];
  const lines=text.split(/\r?\n/);
  lines.forEach((line,i)=>{
    if(/LIGHTBOX_PROXY_PORT|proxy.*port|port.*proxy|localhost:\d+|127\.0\.0\.1:\d+|proxy-server\.mjs/i.test(line)){
      for(const m of line.matchAll(/\b(\d{4,5})\b/g)){
        const n=Number(m[1]);
        if(n>=1024 && n<=65535) hits.push({line:i+1,port:n,snippet:line.trim().slice(0,500)});
      }
      const env=/LIGHTBOX_PROXY_PORT/.test(line);
      if(env) hits.push({line:i+1,port:null,snippet:line.trim().slice(0,500),envReference:true});
    }
  });
  return hits;
}
