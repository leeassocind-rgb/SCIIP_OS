/* ==========================================================
   SCIIP_OS
   Module: Asset
   File: AssetRegistry.gs

   Purpose:
   Maintains the canonical SCIIP Asset Registry.

   The Asset Registry is the permanent identity layer of SCIIP.

   Assets are never deleted.

   Assets may evolve.

   Asset identity persists forever.

   Source of Truth:
   GitHub

   Runtime:
   Google Apps Script
========================================================== */

/**
 * Returns Asset Registry sheet.
 *
 * @returns {GoogleAppsScript.Spreadsheet.Sheet}
 */
function sciipAssetRegistrySheetName() {
  return (
    typeof SCIIP !== 'undefined' &&
    SCIIP.SHEETS &&
    SCIIP.SHEETS.ASSET_REGISTRY
  ) || 'ASSET_REGISTRY';
}

/**
 * Initializes Asset Registry.
 */
function sciipInitializeAssetRegistry() {

  const sheet =
    sciipGetAssetRegistrySheet();

  if (sheet.getLastRow() > 0) {
    return;
  }

  sheet.appendRow([
    'Asset_ID',
    'Business_Key',
    'Status',
    'Canonical_Address',
    'Canonical_City',
    'Canonical_Zip',
    'Canonical_APN',
    'Created_At',
    'Updated_At',
    'Source'
  ]);
}

/**
 * Finds asset by business key.
 *
 * @param {string} businessKey
 * @returns {Object|null}
 */
function sciipFindAssetByBusinessKey(
  businessKey
) {

  sciipInitializeAssetRegistry();

  const rows =
    sciipGetSheetValues(
      sciipAssetRegistrySheetName()
    );

  if (rows.length < 2) {
    return null;
  }

  const headers =
    rows[0];

  const keyIndex =
    headers.indexOf(
      'Business_Key'
    );

  for (
    let i = 1;
    i < rows.length;
    i++
  ) {

    const row =
      rows[i];

    if (
      row[keyIndex] ===
      businessKey
    ) {

      return sciipAssetRowToObject(
        headers,
        row
      );
    }
  }

  return null;
}

/**
 * Finds asset by Asset ID.
 *
 * @param {string} assetId
 * @returns {Object|null}
 */
function sciipFindAssetById(
  assetId
) {

  sciipInitializeAssetRegistry();

  const rows =
    sciipGetSheetValues(
      sciipAssetRegistrySheetName()
    );

  if (rows.length < 2) {
    return null;
  }

  const headers =
    rows[0];

  const idIndex =
    headers.indexOf(
      'Asset_ID'
    );

  for (
    let i = 1;
    i < rows.length;
    i++
  ) {

    const row =
      rows[i];

    if (
      row[idIndex] ===
      assetId
    ) {

      return sciipAssetRowToObject(
        headers,
        row
      );
    }
  }

  return null;
}

/**
 * Alias for asset lookup.
 *
 * @param {string} assetId
 * @returns {Object|null}
 */
function sciipGetAsset(
  assetId
) {

  return sciipFindAssetById(
    assetId
  );
}

/**
 * Registers a new asset.
 *
 * Asset identity is immutable.
 *
 * @param {Object} asset
 * @returns {Object}
 */
function sciipRegisterAsset(
  asset
) {

  sciipInitializeAssetRegistry();

  const existing =
    sciipFindAssetByBusinessKey(
      asset.businessKey
    );

  if (existing) {
    return existing;
  }

  const row = [

    asset.assetId,

    asset.businessKey,

    asset.status ||
      'ACTIVE',

    asset.canonicalAddress ||
      '',

    asset.canonicalCity ||
      '',

    asset.canonicalZip ||
      '',

    asset.canonicalApn ||
      '',

    asset.createdAt ||
      sciipNowIso(),

    asset.updatedAt ||
      sciipNowIso(),

    asset.source ||
      ''
  ];

  sciipAppendRow(
    sciipAssetRegistrySheetName(),
    row
  );

  /*
   * Event Source
   */

  sciipCreateAndRecordEvent(
    SCIIP.VOCABULARY.EVENT_TYPES.ASSET_CREATED,
    {

      assetId:
        asset.assetId,

      businessKey:
        asset.businessKey,

      source:
        asset.source ||

        'SCIIP'
    }
  );

  sciipInfo(
    'Asset Registered',
    {

      assetId:
        asset.assetId,

      businessKey:
        asset.businessKey
    }
  );

  return asset;
}

/**
 * Converts registry row to object.
 *
 * @param {Array} headers
 * @param {Array} row
 * @returns {Object}
 */
function sciipAssetRowToObject(
  headers,
  row
) {

  const obj = {};

  headers.forEach(
    function(
      header,
      index
    ) {

      obj[header] =
        row[index];

    }
  );

  return obj;
}

/**
 * Returns asset registry statistics.
 *
 * @returns {Object}
 */
function sciipAssetRegistryStats() {

  const rows =
    sciipGetSheetValues(
      sciipAssetRegistrySheetName()
    );

  return {

    assetCount:
      rows.length > 0
        ? rows.length - 1
        : 0,

    generatedAt:
      sciipNowIso()
  };
}