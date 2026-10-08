import crypto from "node:crypto";
export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4A_LIGHTBOX_EXISTING_PROXY_ROUTE_AND_ENV_CONFIGURATION_BINDING";
export const VERSION="4.0-m4.19d4a";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");
export function extractEnvNames(text=""){
  const out=new Set(); let m;
  for(const re of [/(?:process\.env\.|process\.env\[['"])([A-Z][A-Z0-9_]{2,})/g,/^\s*([A-Z][A-Z0-9_]{2,})\s*=/gm]){
    re.lastIndex=0;
    while((m=re.exec(text))!==null) out.add(m[1]);
  }
  return [...out].sort();
}
export function extractRoutes(text=""){
  const routes=new Set(); let m;
  const patterns=[
    /(?:app|router)\.(?:get|post|use)\(\s*["'`]([^"'`]+)["'`]/g,
    /(?:pathname|route|path)\s*[:=]\s*["'`]([^"'`]+)["'`]/g
  ];
  for(const re of patterns){re.lastIndex=0;while((m=re.exec(text))!==null)routes.add(m[1])}
  return [...routes];
}
