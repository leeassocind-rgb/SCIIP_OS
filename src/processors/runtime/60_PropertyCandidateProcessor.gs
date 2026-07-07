/* ==========================================================
   SCIIP_OS
   Module: Processors
   File: 60_PropertyCandidateProcessor.gs

   Purpose:
   Processes PROPERTY_CANDIDATES into canonical SCIIP assets.

   Candidate
      ↓
   Identity Resolution
      ↓
   Asset Registry
      ↓
   Event Store
      ↓
   Knowledge Graph
      ↓
   Timeline

   Source of Truth:
   GitHub

   Runtime:
   Google Apps Script
========================================================== */

function sciipRunPropertyCandidateProcessor(context) {

  sciipInitializeCandidateSheet();
  sciipInitializeAssetRegistry();
  sciipInitializeGraphNodeSheet();
  sciipInitializeGraphEdgeSheet();

  const rows =
    sciipGetSheetValues(
      SCIIP.SHEETS.PROPERTY_CANDIDATES
    );

  if (rows.length < 2) {
    return {
      processor: 'PropertyCandidateProcessor',
      status: 'SUCCESS',
      candidatesProcessed: 0,
      assetsCreated: 0,
      matchesFound: 0,
      generatedAt: sciipNowIso()
    };
  }

  const headers =
    rows[0];

  let candidatesProcessed = 0;
  let assetsCreated = 0;
  let matchesFound = 0;

  rows
    .slice(1)
    .forEach(function(row) {

      const candidate =
        sciipCandidateRowToObject(
          headers,
          row
        );

      if (
        candidate.Status &&
        candidate.Status !== 'PENDING'
      ) {
        return;
      }

      candidatesProcessed++;

      const observation = {
        address: candidate.Address,
        city: candidate.City,
        zip: candidate.Zip,
        apn: candidate.APN,
        source:
          candidate.Source ||
          'PROPERTY_CANDIDATE_PROCESSOR'
      };

      const match =
        sciipResolveObservation(
          observation
        );

      if (match.action === 'MATCH') {

        matchesFound++;

        sciipCreateAndRecordEvent(
          SCIIP.VOCABULARY.EVENT_TYPES.PROPERTY_OBSERVED,
          {
            assetId:
              match.asset.Asset_ID ||
              match.asset.assetId,
            businessKey:
              match.identity.businessKey,
            source:
              observation.source,
            matchConfidence:
              match.confidence
          }
        );

        return;
      }

      const assetCandidate =
        sciipCreateAssetCandidate(
          observation
        );

      const asset =
        sciipCreateAssetFromCandidate(
          assetCandidate
        );

      sciipRegisterAsset(
        asset
      );

      sciipBuildAssetGraph(
        asset
      );

      assetsCreated++;
    });

  return {
    processor: 'PropertyCandidateProcessor',
    status: 'SUCCESS',
    candidatesProcessed: candidatesProcessed,
    assetsCreated: assetsCreated,
    matchesFound: matchesFound,
    generatedAt: sciipNowIso()
  };
}

function sciipCandidateRowToObject(
  headers,
  row
) {

  const obj = {};

  headers.forEach(
    function(header, index) {
      obj[header] = row[index];
    }
  );

  return obj;
}