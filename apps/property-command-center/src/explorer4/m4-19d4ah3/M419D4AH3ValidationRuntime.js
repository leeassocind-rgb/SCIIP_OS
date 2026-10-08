import crypto from "node:crypto";
export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4AH3_OPERATOR_EXTERNAL_COORDINATE_EVIDENCE_VALIDATION_AND_BINDING";
export const VERSION="4.0-m4.19d4ah3";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");

export function validLat(v){if(v===null||v===undefined)return false;if(typeof v==="string"&&v.trim()==="")return false;const n=Number(v);return Number.isFinite(n)&&n>=-90&&n<=90}
export function validLng(v){if(v===null||v===undefined)return false;if(typeof v==="string"&&v.trim()==="")return false;const n=Number(v);return Number.isFinite(n)&&n>=-180&&n<=180}
export function validTimestamp(v){
  if(typeof v!=="string"||!v.trim()) return false;
  const t=Date.parse(v);
  return Number.isFinite(t);
}
export function nonEmpty(v){return typeof v==="string"&&v.trim().length>0}

export function validCoordinatePair(lat,lng){return validLat(lat)&&validLng(lng)&&!(Number(lat)===0&&Number(lng)===0)}
