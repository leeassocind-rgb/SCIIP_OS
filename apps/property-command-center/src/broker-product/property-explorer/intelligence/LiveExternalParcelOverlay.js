import{externalParcelBoundaryFromResolution}from'./ExternalParcelGeometry.js';
export function buildLiveExternalParcelOverlay(property,lightBoxParcelState){
  const resolution=lightBoxParcelState?.result?.resolution||null;
  const verified=resolution?.status==='VERIFIED_MATCH';
  const boundary=verified?externalParcelBoundaryFromResolution(resolution):null;
  return Object.freeze({
    propertyId:property?.id||null,
    provider:'LightBox',
    verified,
    confidence:resolution?.confidence??null,
    apn:resolution?.top?.apn||null,
    boundary:Array.isArray(boundary)&&boundary.length>=3?boundary:null,
    sourceContract:'parcels.geometry',
    canonicalIdentityAuthority:'SCIIP'
  });
}
