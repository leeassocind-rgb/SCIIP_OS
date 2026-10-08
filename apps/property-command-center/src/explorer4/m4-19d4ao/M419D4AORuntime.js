import crypto from "node:crypto";
export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4AO_CONTROLLED_SINGLE_GOOGLE_GEOCODE_EVIDENCE_READ_AND_COORDINATE_BINDING";
export const VERSION="4.0-m4.19d4ao";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");

export function strictNum(v){
  if(v===null||v===undefined)return null;
  if(typeof v==="string"&&v.trim()==="")return null;
  const n=Number(v); return Number.isFinite(n)?n:null;
}
export function validPair(lat,lng){
  const a=strictNum(lat),b=strictNum(lng);
  return a!==null&&b!==null&&a>=-90&&a<=90&&b>=-180&&b<=180&&!(a===0&&b===0);
}
export function normalizeAddress(s){
  return String(s??"").toUpperCase().replace(/[.,#]/g," ").replace(/\s+/g," ").trim();
}
