import crypto from "node:crypto";
export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4AH4_EXTERNAL_COORDINATE_OBSERVATION_AND_EVIDENCE_CAPTURE";
export const VERSION="4.0-m4.19d4ah4";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");
export function validLat(v){const n=Number(v);return Number.isFinite(n)&&n>=-90&&n<=90}
export function validLng(v){const n=Number(v);return Number.isFinite(n)&&n>=-180&&n<=180}
export function redact(obj){
  if(Array.isArray(obj)) return obj.map(redact);
  if(obj&&typeof obj==="object"){
    const o={};
    for(const [k,v] of Object.entries(obj)){
      o[k]=/api.?key|authorization|secret|token|credential|password/i.test(k)?"<REDACTED>":redact(v);
    }
    return o;
  }
  return obj;
}
