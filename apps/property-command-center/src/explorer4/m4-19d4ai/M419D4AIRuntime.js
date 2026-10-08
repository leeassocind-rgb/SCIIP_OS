import crypto from "node:crypto";
export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4AI_CERTIFIED_ADDRESS_LOCATOR_GEOCODE_PREAUTHORIZATION";
export const VERSION="4.0-m4.19d4ai";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");
export function nonEmpty(v){return typeof v==="string"&&v.trim().length>0}
