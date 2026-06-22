/* ==========================================================
   SCIIP_OS
   Module: GIS
   File: CampusEngine.gs

   Purpose:
   Detects and manages industrial campuses.

   A Campus is a collection of related assets that
   function as a single operating environment.

   Examples:

   Carson Industrial Campus
   Rancho Gateway Campus
   Tejon Ranch Logistics Campus

   Source of Truth:
   GitHub

   Runtime:
   Google Apps Script
========================================================== */

const SCIIP_CAMPUS_SHEET =
  'CAMPUS_REGISTRY';

/**
 * Returns campus sheet.
 *
 * @returns {GoogleAppsScript.Spreadsheet.Sheet}
 */
function sciipGetCampusSheet() {
  return sciipGetOrCreateSheet(
    SCIIP_CAMPUS_SHEET
  );
}

/**
 * Initializes campus registry.
 */
function sciipInitializeCampusRegistry() {

  const sheet =
    sciipGetCampusSheet();

  if (sheet.getLastRow() > 0) {
    return;
  }

  sheet.appendRow([
    'Campus_ID',
    'Campus_Name',
    'Business_Key',
    'Status',
    'Created_At'
  ]);
}

/**
 * Creates a campus.
 *
 * @param {Object} campus
 * @returns {Object}
 */
function sciipCreateCampus(
  campus
) {

  sciipInitializeCampusRegistry();

  const campusId =
    campus.campusId ||
    ('CAMPUS_' +
      sciipUuid()
        .replace(/-/g, '')
        .substring(0, 16)
        .toUpperCase());

  const businessKey =
    campus.businessKey ||
    sciipCreateBusinessKey([
      'CAMPUS',
      campus.campusName
    ]);

  sciipAppendRow(
    SCIIP_CAMPUS_SHEET,
    [
      campusId,
      campus.campusName,
      businessKey,
      campus.status ||
        'ACTIVE',
      sciipNowIso()
    ]
  );

  return {
    campusId:
      campusId,
    campusName:
      campus.campusName,
    businessKey:
      businessKey
  };
}

/**
 * Finds a campus by business key.
 *
 * @param {string} businessKey
 * @returns {Object|null}
 */
function sciipFindCampus(
  businessKey
) {

  const rows =
    sciipGetSheetValues(
      SCIIP_CAMPUS_SHEET
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

    const row = rows[i];

    if (
      row[keyIndex] ===
      businessKey
    ) {

      const obj = {};

      headers.forEach(
        function(header, index) {
          obj[header] =
            row[index];
        }
      );

      return obj;
    }
  }

  return null;
}

/**
 * Associates an asset with a campus.
 *
 * Creates graph relationship:
 *
 * ASSET
 *    │
 * PART_OF
 *    ▼
 * CAMPUS
 *
 * @param {Object} asset
 * @param {Object} campus
 * @returns {Object}
 */
function sciipAssociateAssetToCampus(
  asset,
  campus
) {

  const assetNode =
    sciipGraphCreateAssetNode(
      asset
    );

  const campusNode =
    sciipGraphCreateNode({
      nodeType:
        SCIIP_NODE_TYPES.CAMPUS,

      businessKey:
        campus.businessKey,

      displayName:
        campus.campusName
    });

  const edge =
    sciipGraphCreateEdge({
      fromNodeId:
        assetNode.nodeId ||
        assetNode.Node_ID,

      relationshipType:
        SCIIP_EDGE_TYPES.PART_OF,

      toNodeId:
        campusNode.nodeId ||
        campusNode.Node_ID
    });

  return {
    assetNode:
      assetNode,

    campusNode:
      campusNode,

    edge:
      edge
  };
}

/**
 * Future campus detection engine.
 *
 * Will eventually use:
 *
 * - Distance
 * - Ownership
 * - Shared infrastructure
 * - Parcel adjacency
 * - Common branding
 *
 * @param {Object} asset
 * @returns {Object}
 */
function sciipDetectCampus(
  asset
) {

  return {
    assetId:
      asset.assetId ||
      asset.Asset_ID,

    status:
      'DETECTION_PENDING'
  };
}

/**
 * Processor entry point.
 *
 * @param {Object=} context
 * @returns {Object}
 */
function sciipRunCampusProcessor(
  context
) {

  sciipInitializeCampusRegistry();

  return {
    processor:
      'CampusProcessor',

    status:
      'SUCCESS',

    generatedAt:
      sciipNowIso()
  };
}

/**
 * Campus statistics.
 *
 * @returns {Object}
 */
function sciipCampusStats() {

  const rows =
    sciipGetSheetValues(
      SCIIP_CAMPUS_SHEET
    );

  return {

    campuses:
      rows.length > 0
        ? rows.length - 1
        : 0,

    generatedAt:
      sciipNowIso()
  };
}