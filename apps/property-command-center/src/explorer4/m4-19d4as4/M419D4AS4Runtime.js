export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4AS4_MARKET_AVAILABILITY_REFRESH_SOURCE_AND_FRESHNESS_CONTRACT_DEFINITION";
export const VERSION="4.0-m4.19d4as4";
export const FRESHNESS_CLASSES={
  FRESH:{maxAgeHours:72},
  AGING:{maxAgeHours:168},
  STALE:{maxAgeHours:null}
};
export function freshnessClass(ageHours){
  if(!Number.isFinite(ageHours)||ageHours<0)return "UNKNOWN";
  if(ageHours<=72)return "FRESH";
  if(ageHours<=168)return "AGING";
  return "STALE";
}
