import crypto from "node:crypto";
export const CONTRACT="SCIIP_EXPLORER_4_M4_19D2_EXISTING_EXTERNAL_SOURCE_CAPABILITY_DISCOVERY_CONNECTOR_CONFIGURATION_AUDIT";
export const VERSION="4.0-m4.19d2";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");
export const SAFE_ENV_NAME=/^[A-Z][A-Z0-9_]{2,}$/;
export function redactValue(v){return v?`<configured:${sha(String(v)).slice(0,10)}>`:"<unset>"}
export function scoreCandidate(c){
  let s=0;
  if(c.hasHttp)s+=3;
  if(c.hasApi)s+=2;
  if(c.hasPropertyTerms)s+=3;
  if(c.hasAvailableSfTerms)s+=3;
  if(c.envNames?.length)s+=2;
  if(c.hasSourceTerms)s+=2;
  return s;
}
