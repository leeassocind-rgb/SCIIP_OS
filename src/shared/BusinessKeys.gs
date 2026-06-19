/* ==========================================================
   SCIIP_OS
   Module: Shared
   File: BusinessKeys.gs
========================================================== */

function sciipCreateBusinessKey(parts) {
  return (parts || [])
    .map(function(part) {
      return sciipNormalizeToken(part);
    })
    .filter(Boolean)
    .join('|');
}

function sciipPropertyBusinessKey(address, city, zip) {
  return sciipCreateBusinessKey([
    'PROPERTY',
    sciipAddressNormalize(address),
    sciipCityNormalize(city),
    sciipZipNormalize(zip)
  ]);
}

function sciipAssetBusinessKey(address, city, zip) {
  return sciipCreateBusinessKey([
    'ASSET',
    sciipAddressNormalize(address),
    sciipCityNormalize(city),
    sciipZipNormalize(zip)
  ]);
}

function sciipOwnerBusinessKey(ownerName) {
  return sciipCreateBusinessKey(['OWNER', ownerName]);
}

function sciipTenantBusinessKey(tenantName) {
  return sciipCreateBusinessKey(['TENANT', tenantName]);
}

function sciipEventBusinessKey(assetId, eventType, eventDate, source) {
  return sciipCreateBusinessKey([
    'EVENT',
    assetId,
    eventType,
    eventDate,
    source
  ]);
}