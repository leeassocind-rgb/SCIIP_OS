/* ==========================================================
   SCIIP_OS
   Module: Asset
   File: AssetService.gs

   Purpose:
   Central service layer for all asset operations.

   All SCIIP modules should use AssetService rather than
   writing directly to the Asset Registry.

   Source of Truth:
   GitHub

   Runtime:
   Google Apps Script
========================================================== */

/**
 * Creates or retrieves an asset from a raw observation.
 *
 * @param {Object} observation
 * @returns {Object}
 */
function sciipCreateOrGetAsset(observation) {
  const candidate = sciipCreateAssetCandidate(observation);

  let asset = sciipFindAssetByBusinessKey(
    candidate.businessKey
  );

  if (asset) {
    return asset;
  }

  asset = sciipCreateAssetFromCandidate(candidate);

  sciipRegisterAsset(asset);

  return asset;
}

/**
 * Finds an asset by Asset ID.
 *
 * @param {string} assetId
 * @returns {Object|null}
 */
function sciipGetAsset(assetId) {
  return sciipFindAssetById(assetId);
}

/**
 * Finds an asset by business key.
 *
 * @param {string} businessKey
 * @returns {Object|null}
 */
function sciipFindAsset(businessKey) {
  return sciipFindAssetByBusinessKey(businessKey);
}

/**
 * Refreshes an asset profile.
 *
 * Placeholder for future graph, timeline,
 * event, GIS, and AI enrichment.
 *
 * @param {string} assetId
 * @returns {Object}
 */
function sciipRefreshAsset(assetId) {
  const asset = sciipGetAsset(assetId);

  if (!asset) {
    throw new Error(
      'Asset not found: ' + assetId
    );
  }

  sciipInfo(
    'Asset Refresh Requested',
    {
      assetId: assetId
    }
  );

  return asset;
}

/**
 * Merges two assets.
 *
 * Future implementation:
 * - Event generation
 * - Alias creation
 * - Graph rewiring
 * - Timeline updates
 *
 * @param {string} primaryAssetId
 * @param {string} secondaryAssetId
 * @returns {Object}
 */
function sciipMergeAssets(
  primaryAssetId,
  secondaryAssetId
) {
  sciipInfo(
    'Asset Merge Requested',
    {
      primaryAssetId: primaryAssetId,
      secondaryAssetId: secondaryAssetId
    }
  );

  return {
    status: 'NOT_IMPLEMENTED',
    primaryAssetId: primaryAssetId,
    secondaryAssetId: secondaryAssetId
  };
}

/**
 * Returns Asset Registry statistics.
 *
 * @returns {Object}
 */
function sciipGetAssetRegistryStats() {
  const rows = sciipGetSheetValues(
    'ASSET_REGISTRY'
  );

  return {
    assetCount:
      rows.length > 0
        ? rows.length - 1
        : 0,
    generatedAt: sciipNowIso()
  };
}