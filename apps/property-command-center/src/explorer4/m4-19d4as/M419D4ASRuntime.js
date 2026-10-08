import crypto from "node:crypto";
export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4AS_MARKET_AVAILABILITY_SOURCE_AUTHORITY_SELECTION_AND_CONTRACT_DEFINITION";
export const VERSION="4.0-m4.19d4as";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");

export function classifySource(path="",text=""){
  const p=path.toLowerCase(), t=text.toLowerCase();
  if(/owner|property.?manager|landlord|operator/.test(p+" "+t)) return "OWNER_OR_OPERATOR_SOURCE";
  if(/listing|availability|available[_ -]?inventory|marketing/.test(p+" "+t)) return "MARKET_LISTING_OR_AVAILABILITY_SOURCE";
  if(/broker|supersheet|market[_ -]?data|base[_ -]?inventory/.test(p+" "+t)) return "BROKERAGE_OR_INTERNAL_MARKET_SOURCE";
  if(/comp|comparable/.test(p+" "+t)) return "COMPARABLE_TRANSACTION_SOURCE";
  if(/canonical|temporal|identity/.test(p+" "+t)) return "DERIVED_OR_INTERNAL_STATE";
  return "UNCLASSIFIED_SOURCE";
}

export const authorityRank={
  OWNER_OR_OPERATOR_SOURCE:4,
  MARKET_LISTING_OR_AVAILABILITY_SOURCE:3,
  BROKERAGE_OR_INTERNAL_MARKET_SOURCE:2,
  COMPARABLE_TRANSACTION_SOURCE:1,
  DERIVED_OR_INTERNAL_STATE:0,
  UNCLASSIFIED_SOURCE:0
};
