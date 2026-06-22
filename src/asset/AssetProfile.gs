/* ==========================================================
   SCIIP_OS
   Module: Asset
   File: AssetProfile.gs

   Purpose:
   Generates computed asset profiles from SCIIP data.

   Asset Profiles are derived objects.

   They are never manually edited.

   They are rebuilt from:
     - Asset Registry
     - Knowledge Graph
     - Events
     - Timeline
     - GIS
     - Market Activity

   Source of Truth:
   GitHub

   Runtime:
   Google Apps Script
========================================================== */

/**
 * Builds an asset profile.
 *
 * @param {string} assetId
 * @returns {Object}
 */
function sciipBuildAssetProfile(assetId) {
  const asset = sciipGetAsset(assetId);

  if (!asset) {
    throw new Error(
      'Asset not found: ' + assetId
    );
  }

  return {
    assetId: assetId,

    identity: {
      assetId: asset.Asset_ID || asset.assetId,
      address: asset.Canonical_Address || asset.canonicalAddress,
      city: asset.Canonical_City || asset.canonicalCity,
      zip: asset.Canonical_Zip || asset.canonicalZip,
      apn: asset.Canonical_APN || asset.canonicalApn
    },

    graph: sciipGetAssetGraphSummary(assetId),

    timeline: sciipGetAssetTimelineSummary(assetId),

    market: sciipGetAssetMarketSummary(assetId),

    tasks: sciipGetAssetTaskSummary(assetId),

    generatedAt: sciipNowIso()
  };
}

/**
 * Graph summary placeholder.
 *
 * @param {string} assetId
 * @returns {Object}
 */
function sciipGetAssetGraphSummary(assetId) {
  return {
    status: 'PENDING',
    assetId: assetId
  };
}

/**
 * Timeline summary placeholder.
 *
 * @param {string} assetId
 * @returns {Object}
 */
function sciipGetAssetTimelineSummary(assetId) {
  return {
    status: 'PENDING',
    assetId: assetId
  };
}

/**
 * Market summary placeholder.
 *
 * @param {string} assetId
 * @returns {Object}
 */
function sciipGetAssetMarketSummary(assetId) {
  return {
    status: 'PENDING',
    assetId: assetId
  };
}

/**
 * Task summary placeholder.
 *
 * @param {string} assetId
 * @returns {Object}
 */
function sciipGetAssetTaskSummary(assetId) {
  return {
    status: 'PENDING',
    assetId: assetId
  };
}