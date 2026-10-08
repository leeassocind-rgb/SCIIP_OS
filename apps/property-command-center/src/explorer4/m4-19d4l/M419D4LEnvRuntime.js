import crypto from "node:crypto";
export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4L_LIGHTBOX_ISOLATED_PROXY_ENVIRONMENT_HYDRATION_AND_SELF_TEST_CERTIFICATION";
export const VERSION="4.0-m4.19d4l";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");

export function parseEnv(text=""){
  const out={};
  for(const raw of text.split(/\r?\n/)){
    let line=raw.trim();
    if(!line || line.startsWith("#")) continue;
    if(line.startsWith("export ")) line=line.slice(7).trim();
    const i=line.indexOf("=");
    if(i<=0) continue;
    const k=line.slice(0,i).trim();
    let v=line.slice(i+1).trim();
    if(!/^[A-Za-z_][A-Za-z0-9_]*$/.test(k)) continue;
    if((v.startsWith('"')&&v.endsWith('"'))||(v.startsWith("'")&&v.endsWith("'"))) v=v.slice(1,-1);
    out[k]=v;
  }
  return out;
}
export function redactEnv(env={}){
  return Object.keys(env).sort().map(name=>({
    name,
    configured:env[name]!==undefined && env[name]!=="",
    fingerprint:env[name] ? sha(String(env[name])).slice(0,10) : null
  }));
}
