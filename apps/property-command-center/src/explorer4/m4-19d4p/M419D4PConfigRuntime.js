import crypto from "node:crypto";
export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4P_LIGHTBOX_REPAIRED_PROXY_RUNTIME_CONFIGURATION_RESTORE_AND_SELF_TEST";
export const VERSION="4.0-m4.19d4p";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");

export function envNamesFromSource(text=""){
  const out=new Set();
  for(const m of text.matchAll(/process\.env\.([A-Z][A-Z0-9_]*)/g)) out.add(m[1]);
  return [...out].sort();
}
export function parseEnvFile(text=""){
  const out={};
  for(const raw of text.split(/\r?\n/)){
    let line=raw.trim();
    if(!line || line.startsWith("#")) continue;
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
export function safeAudit(env, names){
  return names.map(name=>({
    name,
    configured:typeof env[name]==="string" && env[name].length>0,
    fingerprint:env[name]?sha(String(env[name])).slice(0,10):null
  }));
}
