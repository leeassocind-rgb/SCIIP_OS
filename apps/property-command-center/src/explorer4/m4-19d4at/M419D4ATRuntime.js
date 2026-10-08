import crypto from "node:crypto";
export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4AT_MARKET_AVAILABILITY_REFRESH_INPUT_CONTRACT_AND_SINGLE_RECORD_PREAUTHORIZATION";
export const VERSION="4.0-m4.19d4at";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");

export function ageHours(observationTimestamp,now=new Date()){
  const t=new Date(observationTimestamp);
  if(Number.isNaN(t.getTime())) return null;
  return (now.getTime()-t.getTime())/3600000;
}
export function freshnessClass(age){
  if(age===null||!Number.isFinite(age)||age<0)return "UNKNOWN";
  if(age<=72)return "FRESH";
  if(age<=168)return "AGING";
  return "STALE";
}
export function validAvailableSf(v){
  return Number.isFinite(Number(v)) && Number(v)>=0;
}
