import crypto from "node:crypto";
export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4M_HEALTHY_8787_RUNTIME_ENVIRONMENT_CONTRACT_RECOVERY";
export const VERSION="4.0-m4.19d4m";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");

export function parseEnvNames(psText=""){
  const names=new Set();
  const tokens=psText.split(/\s+/);
  for(const t of tokens){
    const i=t.indexOf("=");
    if(i<=0) continue;
    const k=t.slice(0,i);
    if(/^[A-Za-z_][A-Za-z0-9_]*$/.test(k)) names.add(k);
  }
  return [...names].sort();
}
