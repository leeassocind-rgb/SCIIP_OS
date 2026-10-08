export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4AK_GEOCODE_RESPONSE_FORENSICS_AND_ALTERNATE_QUALIFIED_LOCATOR_RESOLUTION_PATH";
export const VERSION="4.0-m4.19d4ak";

export function classifyGoogle(doc,httpStatus){
  if(httpStatus===200 && doc?.status==="REQUEST_DENIED"){
    const msg=String(doc?.error_message??"");
    if(/API is not activated|enable this API/i.test(msg)) return "GOOGLE_GEOCODING_API_NOT_ENABLED";
    if(/API key|credential|billing/i.test(msg)) return "GOOGLE_GEOCODING_CREDENTIAL_OR_BILLING_RESTRICTION";
    return "GOOGLE_GEOCODING_REQUEST_DENIED_OTHER";
  }
  if(httpStatus>=500) return "GOOGLE_GEOCODING_PROVIDER_FAILURE";
  if(httpStatus>=400) return "GOOGLE_GEOCODING_HTTP_CLIENT_FAILURE";
  if(doc?.status==="ZERO_RESULTS") return "GOOGLE_GEOCODING_ZERO_RESULTS";
  if(doc?.status==="OK") return "GOOGLE_GEOCODING_OK";
  return "GOOGLE_GEOCODING_UNCLASSIFIED";
}
