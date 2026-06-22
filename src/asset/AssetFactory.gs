/* ==========================================================
   SCIIP_OS
   Module: Asset
   File: AssetFactory.gs

   Purpose:
   Converts observations and property records into canonical
   SCIIP asset candidates.

   Source of Truth:
   GitHub

   Runtime:
   Google Apps Script
========================================================== */

/**
 * Creates a normalized SCIIP asset candidate from raw input.
 *
 * @param {Object} input
 * @returns {Object}
 */
function sciipCreateAssetCandidate(input) {
  const record = input || {};

  const address = sciipCoalesce(
    record.address,
    record.Address,
    record.property_address,
    record.Property_Address
  );

  const city = sciipCoalesce(
    record.city,
    record.City
  );

  const zip = sciipCoalesce(
    record.zip,
    record.Zip,
    record.ZIP,
    record.postal_code
  );

  const apn = sciipCoalesce(
    record.apn,
    record.APN,
    record.parcel,
    record.Parcel
  );

  const canonicalAddress = sciipAddressNormalize(address);
  const canonicalCity = sciipCityNormalize(city);
  const canonicalZip = sciipZipNormalize(zip);

  const businessKey = sciipAssetBusinessKey(
    canonicalAddress,
    canonicalCity,
    canonicalZip
  );

  return {
    candidateId: 'ASSET_CANDIDATE_' + sciipUuid(),
    businessKey: businessKey,
    canonicalAddress: canonicalAddress,
    canonicalCity: canonicalCity,
    canonicalZip: canonicalZip,
    canonicalApn: sciipNormalizeToken(apn),
    source: sciipCoalesce(record.source, record.Source, 'UNKNOWN'),
    sourceRecordId: sciipCoalesce(record.sourceRecordId, record.Source_Record_ID),
    raw: record,
    createdAt: sciipNowIso()
  };
}

/**
 * Creates a canonical SCIIP asset object from a candidate.
 *
 * @param {Object} candidate
 * @returns {Object}
 */
function sciipCreateAssetFromCandidate(candidate) {
  sciipRequire(candidate && candidate.businessKey, 'Asset candidate business key is required.');

  return {
    assetId: 'ASSET_' + sciipHash(candidate.businessKey).substring(0, 16).toUpperCase(),
    businessKey: candidate.businessKey,
    status: 'ACTIVE',
    canonicalAddress: candidate.canonicalAddress || '',
    canonicalCity: candidate.canonicalCity || '',
    canonicalZip: candidate.canonicalZip || '',
    canonicalApn: candidate.canonicalApn || '',
    createdAt: sciipNowIso(),
    updatedAt: sciipNowIso(),
    source: candidate.source || 'UNKNOWN',
    sourceCandidateId: candidate.candidateId || ''
  };
}