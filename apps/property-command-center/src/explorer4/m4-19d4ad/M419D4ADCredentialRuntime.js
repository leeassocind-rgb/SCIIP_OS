import crypto from "node:crypto";
export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4AD_LIGHTBOX_API_KEY_APPROVED_LOCAL_SOURCE_BINDING_GATE";
export const VERSION="4.0-m4.19d4ad";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");

export function parseEnvFile(text=""){
  const out={};
  for(const raw of (text||"").split(/\r?\n/)){
    const line=raw.trim();
    if(!line||line.startsWith("#")) continue;
    const m=line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if(!m) continue;
    let v=m[2].trim();
    if((v.startsWith('"')&&v.endsWith('"'))||(v.startsWith("'")&&v.endsWith("'"))) v=v.slice(1,-1);
    out[m[1]]=v;
  }
  return out;
}

export function classifyCredentialSources(processEnv={},fileEnv={}){
  const exactProcess=typeof processEnv.LIGHTBOX_API_KEY==="string" && processEnv.LIGHTBOX_API_KEY.length>0;
  const exactFile=typeof fileEnv.LIGHTBOX_API_KEY==="string" && fileEnv.LIGHTBOX_API_KEY.length>0;
  const viteProcess=typeof processEnv.VITE_LIGHTBOX_API_KEY==="string" && processEnv.VITE_LIGHTBOX_API_KEY.length>0;
  const viteFile=typeof fileEnv.VITE_LIGHTBOX_API_KEY==="string" && fileEnv.VITE_LIGHTBOX_API_KEY.length>0;
  return {
    exactProcess,
    exactFile,
    viteProcess,
    viteFile,
    approvedBound:exactProcess||exactFile,
    unsafeClientExposedCandidatePresent:viteProcess||viteFile
  };
}
