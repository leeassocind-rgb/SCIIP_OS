import crypto from "node:crypto";
export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4AH6_COORDINATE_VALIDATION_REPAIR_AND_TRUE_LOCATOR_RECOVERY";
export const VERSION="4.0-m4.19d4ah6";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");

export function strictNumber(v){
  if(v===null||v===undefined) return null;
  if(typeof v==="string" && v.trim()==="") return null;
  const n=Number(v);
  return Number.isFinite(n)?n:null;
}
export function validLat(v){
  const n=strictNumber(v);
  return n!==null && n>=-90 && n<=90;
}
export function validLng(v){
  const n=strictNumber(v);
  return n!==null && n>=-180 && n<=180;
}
export function usablePair(lat,lng){
  if(!validLat(lat)||!validLng(lng)) return false;
  const a=Number(lat),b=Number(lng);
  return !(a===0&&b===0);
}
export function normalizeText(s){return String(s??"").trim().replace(/\s+/g," ")}
