import crypto from "node:crypto";
export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4B_LIGHTBOX_RUNTIME_LAUNCH_CONTRACT_DYNAMIC_PROXY_CONSTRUCTION_FORENSICS";
export const VERSION="4.0-m4.19d4b";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");

export function extractEnvNames(text=""){
  const out=new Set(); let m;
  for(const re of [
    /(?:process\.env\.|process\.env\[['"])([A-Z][A-Z0-9_]{2,})/g,
    /\bimport\.meta\.env\.([A-Z][A-Z0-9_]{2,})/g,
    /^\s*([A-Z][A-Z0-9_]{2,})\s*=/gm
  ]){
    re.lastIndex=0;
    while((m=re.exec(text))!==null) out.add(m[1]);
  }
  return [...out].sort();
}
export function extractPorts(text=""){
  const out=new Set(); let m;
  for(const re of [
    /\b(?:PORT|port)\b[^0-9]{0,30}(\d{4,5})/g,
    /localhost:(\d{4,5})/g,
    /127\.0\.0\.1:(\d{4,5})/g
  ]){
    re.lastIndex=0;
    while((m=re.exec(text))!==null) out.add(Number(m[1]));
  }
  return [...out].sort((a,b)=>a-b);
}
export function extractUrlFragments(text=""){
  const out=new Set(); let m;
  for(const re of [
    /["'`]((?:\/api\/|\/lightbox|\/property|\/parcel|\/search|\/enrich)[^"'`\s]*)["'`]/gi,
    /["'`](https?:\/\/[^"'`\s]+)["'`]/gi
  ]){
    re.lastIndex=0;
    while((m=re.exec(text))!==null) out.add(m[1]);
  }
  return [...out];
}
