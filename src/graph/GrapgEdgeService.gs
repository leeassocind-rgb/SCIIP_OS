/* ==========================================================
   SCIIP_OS
   Module: Graph
   File: GraphEdgeService.gs

   Purpose:
   Manages SCIIP graph relationships.

   Graph edges connect nodes and form the
   SCIIP Knowledge Graph.

   Source of Truth:
   GitHub

   Runtime:
   Google Apps Script
========================================================== */

const SCIIP_GRAPH_EDGE_SHEET =
  SCIIP.SHEETS.GRAPH_EDGE;

/**
 * Returns graph edge sheet.
 *
 * @returns {GoogleAppsScript.Spreadsheet.Sheet}
 */
function sciipGetGraphEdgeSheet() {

  return sciipGetOrCreateSheet(
    SCIIP_GRAPH_EDGE_SHEET
  );
}

/**
 * Initializes graph edge sheet.
 */
function sciipInitializeGraphEdgeSheet() {

  const sheet =
    sciipGetGraphEdgeSheet();

  if (sheet.getLastRow() > 0) {
    return;
  }

  sheet.appendRow([
    'Edge_ID',
    'From_Node_ID',
    'Relationship_Type',
    'To_Node_ID',
    'Status',
    'Created_At'
  ]);
}

/**
 * Creates a graph edge.
 *
 * @param {Object} edge
 * @returns {Object}
 */
function sciipGraphCreateEdge(
  edge
) {

  sciipInitializeGraphEdgeSheet();

  sciipValidateEdgeType(
    edge.relationshipType
  );

  const edgeId =
    edge.edgeId ||
    (
      'EDGE_' +
      sciipUuid()
        .replace(/-/g, '')
        .substring(0, 16)
        .toUpperCase()
    );

  const existing =
    sciipGraphFindEdge(
      edge.fromNodeId,
      edge.relationshipType,
      edge.toNodeId
    );

  if (existing) {
    return existing;
  }

  sciipAppendRow(
    SCIIP_GRAPH_EDGE_SHEET,
    [
      edgeId,
      edge.fromNodeId,
      edge.relationshipType,
      edge.toNodeId,
      edge.status || 'ACTIVE',
      sciipNowIso()
    ]
  );

  return {

    edgeId:
      edgeId,

    fromNodeId:
      edge.fromNodeId,

    relationshipType:
      edge.relationshipType,

    toNodeId:
      edge.toNodeId
  };
}

/**
 * Finds an existing edge.
 *
 * @param {string} fromNodeId
 * @param {string} relationshipType
 * @param {string} toNodeId
 * @returns {Object|null}
 */
function sciipGraphFindEdge(
  fromNodeId,
  relationshipType,
  toNodeId
) {

  const rows =
    sciipGetSheetValues(
      SCIIP_GRAPH_EDGE_SHEET
    );

  if (rows.length < 2) {
    return null;
  }

  const headers =
    rows[0];

  const fromIndex =
    headers.indexOf(
      'From_Node_ID'
    );

  const relIndex =
    headers.indexOf(
      'Relationship_Type'
    );

  const toIndex =
    headers.indexOf(
      'To_Node_ID'
    );

  for (
    let i = 1;
    i < rows.length;
    i++
  ) {

    const row =
      rows[i];

    if (
      row[fromIndex] ===
        fromNodeId &&
      row[relIndex] ===
        relationshipType &&
      row[toIndex] ===
        toNodeId
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
 * Returns outgoing edges.
 *
 * @param {string} nodeId
 * @returns {Array}
 */
function sciipGraphGetOutgoingEdges(
  nodeId
) {

  const rows =
    sciipGetSheetValues(
      SCIIP_GRAPH_EDGE_SHEET
    );

  if (rows.length < 2) {
    return [];
  }

  const headers =
    rows[0];

  const fromIndex =
    headers.indexOf(
      'From_Node_ID'
    );

  return rows
    .slice(1)
    .filter(function(row) {

      return (
        row[fromIndex] ===
        nodeId
      );

    })
    .map(function(row) {

      const obj = {};

      headers.forEach(
        function(header, idx) {

          obj[header] =
            row[idx];

        }
      );

      return obj;
    });
}

/**
 * Returns incoming edges.
 *
 * Useful for graph traversal.
 *
 * @param {string} nodeId
 * @returns {Array}
 */
function sciipGraphGetIncomingEdges(
  nodeId
) {

  const rows =
    sciipGetSheetValues(
      SCIIP_GRAPH_EDGE_SHEET
    );

  if (rows.length < 2) {
    return [];
  }

  const headers =
    rows[0];

  const toIndex =
    headers.indexOf(
      'To_Node_ID'
    );

  return rows
    .slice(1)
    .filter(function(row) {

      return (
        row[toIndex] ===
        nodeId
      );

    })
    .map(function(row) {

      const obj = {};

      headers.forEach(
        function(header, idx) {

          obj[header] =
            row[idx];

        }
      );

      return obj;
    });
}

/**
 * Returns graph edge statistics.
 *
 * @returns {Object}
 */
function sciipGraphEdgeStats() {

  const rows =
    sciipGetSheetValues(
      SCIIP_GRAPH_EDGE_SHEET
    );

  return {

    edgeCount:
      rows.length > 0
        ? rows.length - 1
        : 0,

    generatedAt:
      sciipNowIso()
  };
}