/* ==========================================================
   SCIIP_OS
   Module: Identity
   File: CanonicalIdentity.gs

   Purpose:
   Creates and manages canonical asset identity.

   Canonical identity is the foundation of SCIIP's
   Asset-Centric architecture.

   Every observation ultimately resolves to a
   canonical Asset_ID.

   Source of Truth:
   GitHub

   Runtime:
   Google Apps Script
========================================================== */

/**
 * Creates a canonical identity object.
 *
 * @param {Object} input
 * @returns {Object}
 */
function sciipCreateCanonicalIdentity(input) {
  const record = input || {};

  const address = sciipAddressNormalize(
    sciipCoalesce(
      record.address,
      record.Address,
      record.canonicalAddress
    )
  );

  const city = sciipCityNormalize(
    sciipCoalesce(
      record.city,
      record.City,
      record.canonicalCity
    )
  );

  const zip = sciipZipNormalize(
    sciipCoalesce(
      record.zip,
      record.Zip,
      record.canonicalZip
    )
  );

  const apn = sciipNormalizeToken(
    sciipCoalesce(
      record.apn,
      record.APN,
      record.canonicalApn
    )
  );

  const businessKey = sciipAssetBusinessKey(
    address,
    city,
    zip
  );

  return {
    businessKey: businessKey,
    canonicalAddress: address,
    canonicalCity: city,
    canonicalZip: zip,
    canonicalApn: apn,
    generatedAt: sciipNowIso()
  };
}

/**
 * Compares two identity objects.
 *
 * Returns a confidence score between 0 and 100.
 *
 * @param {Object} identityA
 * @param {Object} identityB
 * @returns {number}
 */
function sciipIdentityConfidence(
  identityA,
  identityB
) {
  if (!identityA || !identityB) {
    return 0;
  }

  let score = 0;

  if (
    identityA.businessKey &&
    identityA.businessKey === identityB.businessKey
  ) {
    score += 70;
  }

  if (
    identityA.canonicalAddress &&
    identityA.canonicalAddress === identityB.canonicalAddress
  ) {
    score += 20;
  }

  if (
    identityA.canonicalApn &&
    identityA.canonicalApn === identityB.canonicalApn
  ) {
    score += 10;
  }

  return Math.min(score, 100);
}

/**
 * Returns true when two identities
 * are considered a match.
 *
 * @param {Object} identityA
 * @param {Object} identityB
 * @returns {boolean}
 */
function sciipIdentityMatch(
  identityA,
  identityB
) {
  return sciipIdentityConfidence(
    identityA,
    identityB
  ) >= 90;
}

/**
 * Creates a deterministic identity key.
 *
 * Used for graph linking and matching.
 *
 * @param {Object} identity
 * @returns {string}
 */
function sciipIdentityKey(identity) {
  return sciipCreateBusinessKey([
    identity.businessKey,
    identity.canonicalApn
  ]);
}