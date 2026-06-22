/* ==========================================================
   SCIIP_OS
   Module: Graph
   File: GraphBuilder.gs

   Purpose:
   Builds and strengthens the SCIIP Knowledge Graph.

   Converts Assets into Graph Nodes and
   creates canonical relationships.

   Source of Truth:
   GitHub

   Runtime:
   Google Apps Script
========================================================== */

/**
 * Builds graph representation for an asset.
 *
 * @param {Object} asset
 * @returns {Object}
 */
function sciipBuildAssetGraph(asset) {

  sciipRequire(
    asset,
    'Asset is required.'
  );

  const assetNode =
    sciipGraphCreateAssetNode(
      asset
    );

  const createdEdges = [];

  /*
   * City Node
   */

  if (
    asset.canonicalCity
  ) {

    const cityNode =
      sciipGraphCreateNode({
        nodeType:
          SCIIP_NODE_TYPES.CITY,

        businessKey:
          sciipCreateBusinessKey([
            'CITY',
            asset.canonicalCity
          ]),

        displayName:
          asset.canonicalCity
      });

    const cityEdge =
      sciipGraphCreateEdge({
        fromNodeId:
          assetNode.nodeId ||
          assetNode.Node_ID,

        relationshipType:
          SCIIP_EDGE_TYPES.LOCATED_IN,

        toNodeId:
          cityNode.nodeId ||
          cityNode.Node_ID
      });

    createdEdges.push(
      cityEdge
    );
  }

  return {
    assetNode:
      assetNode,

    edges:
      createdEdges,

    generatedAt:
      sciipNowIso()
  };
}

/**
 * Builds graph for an Asset ID.
 *
 * @param {string} assetId
 * @returns {Object}
 */
function sciipBuildAssetGraphById(
  assetId
) {

  const asset =
    sciipGetAsset(
      assetId
    );

  if (!asset) {

    throw new Error(
      'Asset not found: ' +
      assetId
    );
  }

  return sciipBuildAssetGraph(
    asset
  );
}

/**
 * Creates graph nodes from all assets.
 *
 * Initial bootstrap utility.
 *
 * @returns {Object}
 */
function sciipBuildGraphFromRegistry() {

  const rows =
    sciipGetSheetValues(
      'ASSET_REGISTRY'
    );

  if (
    rows.length < 2
  ) {

    return {
      assetsProcessed: 0
    };
  }

  const headers =
    rows[0];

  let processed = 0;

  rows
    .slice(1)
    .forEach(function(row) {

      const asset = {};

      headers.forEach(
        function(
          header,
          index
        ) {
          asset[header] =
            row[index];
        }
      );

      sciipBuildAssetGraph(
        {
          assetId:
            asset.Asset_ID,

          businessKey:
            asset.Business_Key,

          canonicalAddress:
            asset.Canonical_Address,

          canonicalCity:
            asset.Canonical_City,

          canonicalZip:
            asset.Canonical_Zip
        }
      );

      processed++;

    });

  return {
    assetsProcessed:
      processed,

    generatedAt:
      sciipNowIso()
  };
}

/**
 * Processor entry point.
 *
 * @param {Object=} context
 * @returns {Object}
 */
function sciipRunGraphBuilder(
  context
) {

  return {
    processor:
      'GraphBuilder',

    status:
      'SUCCESS',

    generatedAt:
      sciipNowIso()
  };
}

/**
 * Graph Builder statistics.
 *
 * @returns {Object}
 */
function sciipGraphBuilderStats() {

  return {

    nodes:
      sciipGraphNodeStats(),

    edges:
      sciipGraphEdgeStats(),

    generatedAt:
      sciipNowIso()
  };
}