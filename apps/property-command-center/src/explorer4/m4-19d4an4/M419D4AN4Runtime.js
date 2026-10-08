import crypto from "node:crypto";
export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4AN4_GOOGLE_GEOCODING_ENABLEMENT_VERIFICATION_AND_SINGLE_READ_REPREAUTHORIZATION";
export const VERSION="4.0-m4.19d4an4";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");

export function classifyGoogle(doc,httpStatus){
  if(httpStatus===200 && doc?.status==="OK") return "GEOCODING_ENABLED_AND_USABLE";
  if(httpStatus===200 && doc?.status==="ZERO_RESULTS") return "GEOCODING_ENABLED_ZERO_RESULTS";
  if(httpStatus===200 && doc?.status==="REQUEST_DENIED"){
    const m=String(doc?.error_message??"");
    if(/API is not activated|enable this API/i.test(m)) return "GEOCODING_STILL_NOT_ENABLED";
    if(/API key|billing|referer|restriction/i.test(m)) return "GEOCODING_ENABLED_BUT_CREDENTIAL_OR_BILLING_RESTRICTED";
    return "GEOCODING_REQUEST_DENIED_OTHER";
  }
  if(httpStatus>=500) return "GEOCODING_PROVIDER_FAILURE";
  if(httpStatus>=400) return "GEOCODING_HTTP_FAILURE";
  return "GEOCODING_UNCLASSIFIED";
}
