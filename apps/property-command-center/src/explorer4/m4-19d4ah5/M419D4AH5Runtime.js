export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4AH5_ZERO_COORDINATE_PLACEHOLDER_FORENSICS_AND_COORDINATE_VALIDATION_REPAIR_POLICY";
export const VERSION="4.0-m4.19d4ah5";

export function isFiniteCoordinatePair(lat,lng){
  const a=Number(lat),b=Number(lng);
  return Number.isFinite(a)&&Number.isFinite(b)&&a>=-90&&a<=90&&b>=-180&&b<=180;
}
export function isPlaceholderZeroPair(lat,lng){
  return Number(lat)===0 && Number(lng)===0;
}
export function isUsableCoordinatePair(lat,lng){
  return isFiniteCoordinatePair(lat,lng) && !isPlaceholderZeroPair(lat,lng);
}
