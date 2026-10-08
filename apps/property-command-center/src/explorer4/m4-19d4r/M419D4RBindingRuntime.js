import crypto from "node:crypto";
export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4R_LIGHTBOX_SERVER_RUNTIME_VARIABLE_BINDING_GATE";
export const VERSION="4.0-m4.19d4r";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");

export function collectConfigKeys(text=""){
  const out=new Set();
  const patterns=[
    /env\(\s*["']([A-Z][A-Z0-9_]*)["']/g,
    /getEnv\(\s*["']([A-Z][A-Z0-9_]*)["']/g,
    /readEnv\(\s*["']([A-Z][A-Z0-9_]*)["']/g,
    /requireEnv\(\s*["']([A-Z][A-Z0-9_]*)["']/g,
    /optionalEnv\(\s*["']([A-Z][A-Z0-9_]*)["']/g,
    /process\.env\[['"]([A-Z][A-Z0-9_]*)['"]\]/g,
    /process\.env\.([A-Z][A-Z0-9_]*)/g,
    /["'](LIGHTBOX_[A-Z0-9_]+)["']/g
  ];
  for(const re of patterns){
    for(const m of text.matchAll(re)) out.add(m[1]);
  }
  return [...out].sort();
}

export function classifyConfigKeys(keys=[]){
  const required=[], optional=[], auth=[], endpoint=[], runtime=[];
  for(const k of keys){
    if(/API_KEY|CLIENT_ID|CLIENT_SECRET|TOKEN|AUTH/i.test(k)) auth.push(k);
    if(/BASE_URL|URL|ENDPOINT/i.test(k)) endpoint.push(k);
    if(/PORT|TIMEOUT|ORIGIN|ALLOWED/i.test(k)) runtime.push(k);
  }
  return {required,optional,auth:[...new Set(auth)],endpoint:[...new Set(endpoint)],runtime:[...new Set(runtime)]};
}

export function parseEnvFile(text=""){
  const out={};
  for(const raw of text.split(/\r?\n/)){
    let line=raw.trim();
    if(!line||line.startsWith("#")) continue;
    if(line.startsWith("export ")) line=line.slice(7).trim();
    const i=line.indexOf("="); if(i<=0) continue;
    const k=line.slice(0,i).trim();
    if(!/^[A-Za-z_][A-Za-z0-9_]*$/.test(k)) continue;
    let v=line.slice(i+1).trim();
    if((v.startsWith('"')&&v.endsWith('"'))||(v.startsWith("'")&&v.endsWith("'"))) v=v.slice(1,-1);
    out[k]=v;
  }
  return out;
}
