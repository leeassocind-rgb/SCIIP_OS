import crypto from "node:crypto";
export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4AU_CONTROLLED_SINGLE_MARKET_AVAILABILITY_REFRESH_OBSERVATION_APPEND";
export const VERSION="4.0-m4.19d4au";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");
