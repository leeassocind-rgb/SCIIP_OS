import crypto from "node:crypto";
export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4AV_CURRENT_STATE_PROMOTION_PREAUTHORIZATION_FROM_CERTIFIED_TEMPORAL_AVAILABILITY_OBSERVATION";
export const VERSION="4.0-m4.19d4av";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");
export const norm=x=>String(x??"").trim().toUpperCase();
