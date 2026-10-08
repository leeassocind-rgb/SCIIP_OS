import crypto from "node:crypto";
export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4U_SERVER_CLIENT_CONFIG_BOUNDARY_REPAIR_POLICY";
export const VERSION="4.0-m4.19d4u";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");

export function findViteRefs(text=""){
  const out=[];
  const lines=(text||"").split(/\r?\n/);
  for(let i=0;i<lines.length;i++){
    const line=lines[i];
    if(/import\.meta\.env|VITE_LIGHTBOX|VITE_/i.test(line)){
      out.push({line:i+1,snippet:line.trim().slice(0,700)});
    }
  }
  return out;
}

export function findServerConfigRefs(text=""){
  const out=[];
  const lines=(text||"").split(/\r?\n/);
  for(let i=0;i<lines.length;i++){
    const line=lines[i];
    if(/baseUrl|apiKey|enabled|port|timeoutMs|allowedOrigins|configured|readiness/i.test(line)){
      out.push({line:i+1,snippet:line.trim().slice(0,700)});
    }
  }
  return out;
}
