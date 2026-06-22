/* ==========================================================
   SCIIP_OS
   Module: Identity
   File: MatchEngine.gs

   Purpose:
   Resolves observations against existing SCIIP assets.

   The Match Engine is responsible for determining whether
   an observation should:

   - Match an existing Asset
   - Create a new Asset
   - Enter Manual Review

   Source of Truth:
   GitHub

   Runtime:
   Google Apps Script
========================================================== */

/**
 * Match confidence thresholds.
 */
const SCIIP_MATCH_THRESHOLDS = {
  AUTO_MATCH: 90,
  REVIEW_REQUIRED: 70,
  NEW_ASSET: 69
};

/**
 * Attempts to resolve an observation.
 *
 * @param {Object} observation
 * @returns {Object}
 */
function sciipResolveObservation(observation) {
  const identity = sciipCreateCanonicalIdentity(
    observation
  );

  const asset = sciipFindAsset(
    identity.businessKey
  );

  if (!asset) {
    return {
      action: 'CREATE_ASSET',
      confidence: 0,
      identity: identity,
      asset: null
    };
  }

  const assetIdentity =
    sciipCreateCanonicalIdentity(asset);

  const confidence =
    sciipIdentityConfidence(
      identity,
      assetIdentity
    );

  if (
    confidence >=
    SCIIP_MATCH_THRESHOLDS.AUTO_MATCH
  ) {
    return {
      action: 'MATCH',
      confidence: confidence,
      identity: identity,
      asset: asset
    };
  }

  if (
    confidence >=
    SCIIP_MATCH_THRESHOLDS.REVIEW_REQUIRED
  ) {
    return {
      action: 'REVIEW',
      confidence: confidence,
      identity: identity,
      asset: asset
    };
  }

  return {
    action: 'CREATE_ASSET',
    confidence: confidence,
    identity: identity,
    asset: null
  };
}

/**
 * Returns the best matching asset.
 *
 * Current implementation:
 * Business key lookup.
 *
 * Future implementation:
 * - APN matching
 * - GIS matching
 * - Alias matching
 * - Fuzzy address matching
 * - Campus matching
 *
 * @param {Object} observation
 * @returns {Object|null}
 */
function sciipFindBestAssetMatch(
  observation
) {
  const result =
    sciipResolveObservation(
      observation
    );

  return result.asset || null;
}

/**
 * Determines whether an observation
 * requires manual review.
 *
 * @param {Object} observation
 * @returns {boolean}
 */
function sciipRequiresManualReview(
  observation
) {
  const result =
    sciipResolveObservation(
      observation
    );

  return result.action === 'REVIEW';
}

/**
 * Returns a human-readable
 * match summary.
 *
 * @param {Object} observation
 * @returns {Object}
 */
function sciipMatchSummary(
  observation
) {
  const result =
    sciipResolveObservation(
      observation
    );

  return {
    action: result.action,
    confidence: result.confidence,
    businessKey:
      result.identity.businessKey,
    assetId:
      result.asset
        ? (
            result.asset.Asset_ID ||
            result.asset.assetId
          )
        : null
  };
}