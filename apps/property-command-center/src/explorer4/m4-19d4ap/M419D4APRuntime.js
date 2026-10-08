import crypto from "node:crypto";
export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4AP_LIGHTBOX_POINT_READ_PREAUTHORIZATION_USING_BOUND_GOOGLE_COORDINATES";
export const VERSION="4.0-m4.19d4ap";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");
export function validPair(lat,lng){
  const a=Number(lat),b=Number(lng);
  return Number.isFinite(a)&&Number.isFinite(b)&&a>=-90&&a<=90&&b>=-180&&b<=180&&!(a===0&&b===0);
}
