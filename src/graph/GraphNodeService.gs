/* ==========================================================
   SCIIP_OS
   Module: Graph
   File: GraphNodeService.gs

   Purpose:
   Manages SCIIP graph nodes.

   Every entity in SCIIP becomes a node.

   Examples:

   ASSET
   OWNER
   TENANT
   LEASE
   SALE
   LISTING
   PARCEL
   CAMPUS
   CITY

   Source of Truth:
   GitHub

   Runtime:
   Google Apps Script
========================================================== */

const SCIIP_GRAPH_NODE_SHEET =
  'GRAPH_NODE';

/**
 * Returns graph node sheet.
 *
 * @returns {GoogleAppsScript.Spreadsheet.Sheet}
 */
function sciipGetGraphNodeSheet() {
  return sciipGetOrCreateSheet(
    SCIIP_GRAPH_NODE_SHEET
  );
}

/**
 * Initializes graph node table.
 */
function sciipInitializeGraphNodeSheet() {
  const sheet =
    sciipGetGraphNodeSheet();

  if (sheet.getLastRow() > 0) {
    return;
  }

  sheet.appendRow([
    'Node_ID',
    'Node_Type',
    'Business_Key',
    'Display_Name',
    'Status',
    'Created_At'
  ]);
}

/**
 * Creates a graph node.
 *
 * @param {Object} node
 * @returns {Object}
 */
function sciipGraphCreateNode(
  node
) {
  sciipInitializeGraphNodeSheet();

  const nodeId =
    node.nodeId ||
    ('NODE_' +
      sciipUuid()
        .replace(/-/g, '')
        .substring(0, 16)
        .toUpperCase());

  const existing =
    sciipGraphFindNodeByKey(
      node.businessKey
    );

  if (existing) {
    return existing;
  }

  sciipAppendRow(
    SCIIP_GRAPH_NODE_SHEET,
    [
      nodeId,
      node.nodeType,
      node.businessKey,
      node.displayName,
      node.status || 'ACTIVE',
      sciipNowIso()
    ]
  );

  return {
    nodeId: nodeId,
    nodeType: node.nodeType,
    businessKey:
      node.businessKey,
    displayName:
      node.displayName
  };
}

/**
 * Finds a node by business key.
 *
 * @param {string} businessKey
 * @returns {Object|null}
 */
function sciipGraphFindNodeByKey(
  businessKey
) {
  const rows =
    sciipGetSheetValues(
      SCIIP_GRAPH_NODE_SHEET
    );

  if (rows.length < 2) {
    return null;
  }

  const headers = rows[0];
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
        function(header, idx) {
          obj[header] =
            row[idx];
        }
      );

      return obj;
    }
  }

  return null;
}

/**
 * Creates an Asset node.
 *
 * @param {Object} asset
 * @returns {Object}
 */
function sciipGraphCreateAssetNode(
  asset
) {
  return sciipGraphCreateNode({
    nodeType: 'ASSET',
    businessKey:
      asset.businessKey,
    displayName:
      asset.canonicalAddress
  });
}

/**
 * Returns graph statistics.
 *
 * @returns {Object}
 */
function sciipGraphNodeStats() {
  const rows =
    sciipGetSheetValues(
      SCIIP_GRAPH_NODE_SHEET
    );

  return {
    nodeCount:
      rows.length > 0
        ? rows.length - 1
        : 0,
    generatedAt:
      sciipNowIso()
  };
}