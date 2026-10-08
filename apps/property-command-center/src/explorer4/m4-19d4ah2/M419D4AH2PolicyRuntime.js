import crypto from "node:crypto";
export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4AH2_OPERATOR_OR_EXTERNAL_SOURCE_COORDINATE_EVIDENCE_POLICY";
export const VERSION="4.0-m4.19d4ah2";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");
export function validLat(v){const n=Number(v);return Number.isFinite(n)&&n>=-90&&n<=90}
export function validLng(v){const n=Number(v);return Number.isFinite(n)&&n>=-180&&n<=180}
