/* ==========================================================
   SCIIP_OS
   Module: Shared
   File: AddressNormalize.gs
========================================================== */

function sciipAddressNormalize(address) {
  let value = sciipUpper(address);

  value = value
    .replace(/[.,]/g, '')
    .replace(/\bSTREET\b/g, 'ST')
    .replace(/\bAVENUE\b/g, 'AVE')
    .replace(/\bBOULEVARD\b/g, 'BLVD')
    .replace(/\bROAD\b/g, 'RD')
    .replace(/\bDRIVE\b/g, 'DR')
    .replace(/\bLANE\b/g, 'LN')
    .replace(/\bCOURT\b/g, 'CT')
    .replace(/\bPLACE\b/g, 'PL')
    .replace(/\bPARKWAY\b/g, 'PKWY')
    .replace(/\bHIGHWAY\b/g, 'HWY')
    .replace(/\bNORTH\b/g, 'N')
    .replace(/\bSOUTH\b/g, 'S')
    .replace(/\bEAST\b/g, 'E')
    .replace(/\bWEST\b/g, 'W');

  return sciipNormalizeWhitespace(value);
}

function sciipCityNormalize(city) {
  return sciipNormalizeWhitespace(sciipUpper(city));
}

function sciipZipNormalize(zip) {
  const value = sciipString(zip).replace(/\D/g, '');
  return value.length >= 5 ? value.substring(0, 5) : value;
}

function sciipAddressKey(address, city, zip) {
  return [
    sciipAddressNormalize(address),
    sciipCityNormalize(city),
    sciipZipNormalize(zip)
  ].filter(Boolean).join('|');
}