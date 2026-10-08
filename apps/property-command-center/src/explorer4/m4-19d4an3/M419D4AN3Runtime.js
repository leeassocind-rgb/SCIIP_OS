export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4AN3_EXTERNAL_GEOCODER_OR_GOOGLE_GEOCODING_ENABLEMENT_DECISION";
export const VERSION="4.0-m4.19d4an3";

export function scoreOption(o){
  let s=0;
  if(o.existingCredential) s+=4;
  if(o.existingAppDependency) s+=4;
  if(o.noNewVendor) s+=3;
  if(o.sourceNativeCoordinates) s+=3;
  if(o.requiresCloudEnablement) s-=1;
  if(o.requiresNewCredential) s-=3;
  if(o.requiresNewVendor) s-=3;
  return s;
}
