import crypto from "node:crypto";

export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4AH7_RECORD_STRUCTURAL_LOCATOR_RECONCILIATION_AND_CERTIFICATION";
export const VERSION="4.0-m4.19d4ah7";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");

export function norm(v){
  return String(v??"")
    .trim()
    .replace(/\\"/g,'"')
    .replace(/^["']+|["',]+$/g,"")
    .replace(/\s+/g," ");
}

export function normLocator(v){
  return norm(v)
    .toUpperCase()
    .replace(/\bSTREET\b/g,"ST")
    .replace(/\bAVENUE\b/g,"AVE")
    .replace(/\bBOULEVARD\b/g,"BLVD")
    .replace(/\bROAD\b/g,"RD")
    .replace(/\bDRIVE\b/g,"DR")
    .replace(/\bLANE\b/g,"LN")
    .replace(/\bPARKWAY\b/g,"PKWY")
    .replace(/\bHIGHWAY\b/g,"HWY")
    .replace(/[.,#]/g," ")
    .replace(/\s+/g," ")
    .trim();
}

export function scalarEquals(v,target){
  return typeof v==="string" && v.trim()===target;
}

const ADDRESS_KEYS=/^(address|streetAddress|propertyAddress|siteAddress|fullAddress|formattedAddress|address1|addressLine1|locationAddress)$/i;
const CITY_KEYS=/^(city|locality|municipality)$/i;
const STATE_KEYS=/^(state|stateCode|region)$/i;
const ZIP_KEYS=/^(zip|zipcode|zipCode|postalCode)$/i;

export function recordIdentityStrength(obj,canonicalId,sourceId){
  if(!obj||typeof obj!=="object"||Array.isArray(obj)) return 0;
  let c=false,s=false;
  for(const [k,v] of Object.entries(obj)){
    if(typeof v==="string"){
      if(v.trim()===canonicalId) c=true;
      if(v.trim()===sourceId) s=true;
    }
    // Allow one shallow identity object, but never arbitrary descendant search.
    if(v&&typeof v==="object"&&!Array.isArray(v)&&/identity|property|subject|source/i.test(k)){
      for(const sv of Object.values(v)){
        if(typeof sv==="string"){
          if(sv.trim()===canonicalId)c=true;
          if(sv.trim()===sourceId)s=true;
        }
      }
    }
  }
  return c&&s?3:(c?2:(s?1:0));
}

export function directAddress(obj){
  if(!obj||typeof obj!=="object"||Array.isArray(obj)) return null;

  for(const [k,v] of Object.entries(obj)){
    if(ADDRESS_KEYS.test(k) && typeof v==="string" && /\d/.test(v) && v.trim().length>=5){
      return norm(v);
    }
  }

  // Allow a shallow address object owned by the same record.
  for(const [k,v] of Object.entries(obj)){
    if(/address|location/i.test(k) && v&&typeof v==="object"&&!Array.isArray(v)){
      let street="",city="",state="",zip="";
      for(const [sk,sv] of Object.entries(v)){
        if(typeof sv!=="string"&&typeof sv!=="number")continue;
        if(ADDRESS_KEYS.test(sk)||/^(street|line1)$/i.test(sk))street=norm(sv);
        else if(CITY_KEYS.test(sk))city=norm(sv);
        else if(STATE_KEYS.test(sk))state=norm(sv);
        else if(ZIP_KEYS.test(sk))zip=norm(sv);
      }
      if(street&&/\d/.test(street)){
        return [street,city,state,zip].filter(Boolean).join(", ");
      }
    }
  }

  // Structured address fields directly on record.
  let street="",city="",state="",zip="";
  for(const [k,v] of Object.entries(obj)){
    if(typeof v!=="string"&&typeof v!=="number")continue;
    if(ADDRESS_KEYS.test(k)||/^(street|line1)$/i.test(k))street=norm(v);
    else if(CITY_KEYS.test(k))city=norm(v);
    else if(STATE_KEYS.test(k))state=norm(v);
    else if(ZIP_KEYS.test(k))zip=norm(v);
  }
  if(street&&/\d/.test(street)) return [street,city,state,zip].filter(Boolean).join(", ");
  return null;
}

export function sourceFamily(p){
  const s=String(p).replaceAll("\\","/");
  if(/\/src\/production-validation\/canonical-property-identity-data\.json$/i.test(s)) return "SRC_CANONICAL_IDENTITY";
  if(/\/public\/production-validation-data\/canonical-property-identity-data(?: 2)?\.json$/i.test(s)) return "PUBLIC_CANONICAL_IDENTITY";
  if(/\/src\/production-validation\/identity-decision-execution-data\.json$/i.test(s)) return "SRC_IDENTITY_DECISION";
  if(/\/public\/production-validation-data\/identity-decision-execution-data(?: 2)?\.json$/i.test(s)) return "PUBLIC_IDENTITY_DECISION";
  if(/\/src\/production-validation\/temporal-intelligence-data\.json$/i.test(s)) return "SRC_TEMPORAL";
  if(/\/public\/production-validation-data\/temporal-intelligence-data(?: 2)?\.json$/i.test(s)) return "PUBLIC_TEMPORAL";
  if(/\/evidence\//i.test(s)) return "EVIDENCE";
  return "OTHER";
}
