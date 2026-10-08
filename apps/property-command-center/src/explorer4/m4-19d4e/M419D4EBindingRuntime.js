import crypto from "node:crypto";

export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4E_LIGHTBOX_PROXY_BOOTSTRAP_AND_SINGLE_RECORD_DRY_RUN_BINDING";
export const VERSION="4.0-m4.19d4e";
export const APPROVED_FIELD="availableSf";
export const EXPECTED_PREAUTHORIZED_ROWS=400;

export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");

export function extractPortEvidence(text=""){
  const out=[];
  let m;
  for(const re of [
    /process\.env\.LIGHTBOX_PROXY_PORT\s*\|\|\s*(\d{4,5})/g,
    /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*Number\(\s*process\.env\.LIGHTBOX_PROXY_PORT\s*\|\|\s*["'`]?(\d{4,5})/g,
    /\.listen\(\s*(\d{4,5})/g,
    /localhost:(\d{4,5})/g,
    /127\.0\.0\.1:(\d{4,5})/g
  ]){
    re.lastIndex=0;
    while((m=re.exec(text))!==null) out.push({match:m[0],groups:m.slice(1)});
  }
  return out;
}

export function extractRouteEvidence(text=""){
  const routes=new Set();
  for(const m of text.matchAll(/["'`](\/api\/lightbox\/[^"'`\s]+)["'`]/g)) routes.add(m[1]);
  return [...routes];
}
