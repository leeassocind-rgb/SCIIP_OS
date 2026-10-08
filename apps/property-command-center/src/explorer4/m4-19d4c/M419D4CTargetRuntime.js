import crypto from "node:crypto";
export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4C_LIGHTBOX_RUNTIME_BOOTSTRAP_CONTRACT_AND_PROXY_ROUTE_TARGETED_INSPECTION";
export const VERSION="4.0-m4.19d4c";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");

export function extractListenPorts(text=""){
  const out=[]; let m;
  for(const re of [
    /\.listen\(\s*(\d{4,5})/g,
    /\.listen\(\s*([A-Za-z_$][\w$]*)/g,
    /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:Number\()?process\.env\.([A-Z][A-Z0-9_]*)\)?\s*\|\|\s*(\d{4,5})/g,
    /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(\d{4,5})/g
  ]){
    re.lastIndex=0;
    while((m=re.exec(text))!==null) out.push({match:m[0],groups:m.slice(1)});
  }
  return out;
}

export function extractRouteStrings(text=""){
  const routes=new Set(); let m;
  for(const re of [
    /["'`]((?:\/api\/lightbox\/)[^"'`\s]*)["'`]/g,
    /["'`]((?:\/lightbox\/)[^"'`\s]*)["'`]/g
  ]){
    re.lastIndex=0; while((m=re.exec(text))!==null) routes.add(m[1]);
  }
  return [...routes];
}
