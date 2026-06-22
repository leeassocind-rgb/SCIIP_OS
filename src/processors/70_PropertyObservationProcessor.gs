/* ==========================================================
   SCIIP_OS
   Module: Processors
   File: 70_PropertyObservationProcessor.gs

   Purpose:
   Processes raw property observations into SCIIP events,
   candidates, assets, graph records, and timeline history.

   Observation
      ↓
   Event
      ↓
   Identity Resolution
      ↓
   Candidate / Match
      ↓
   Asset Registry
      ↓
   Knowledge Graph
      ↓
   Timeline

   Source of Truth:
   GitHub

   Runtime:
   Google Apps Script
========================================================== */

const SCIIP_OBSERVATION_QUEUE_SHEET =
  'OBSERVATION_QUEUE';

function sciipGetObservationQueueSheet() {
  return sciipGetOrCreateSheet(
    SCIIP_OBSERVATION_QUEUE_SHEET
  );
}

function sciipInitializeObservationQueue() {
  const sheet =
    sciipGetObservationQueueSheet();

  if (sheet.getLastRow() > 0) {
    return;
  }

  sheet.appendRow([
    'Observation_ID',
    'Observation_Type',
    'Address',
    'City',
    'Zip',
    'APN',
    'Source',
    'Raw_Text',
    'Status',
    'Created_At',
    'Processed_At'
  ]);
}

function sciipRunPropertyObservationProcessor(context) {
  sciipInitializeObservationQueue();
  sciipInitializeCandidateSheet();
  sciipInitializeAssetRegistry();
  sciipInitializeEventStore();
  sciipInitializeTimelineSheet();
  sciipInitializeGraphNodeSheet();
  sciipInitializeGraphEdgeSheet();

  const rows =
    sciipGetSheetValues(
      SCIIP_OBSERVATION_QUEUE_SHEET
    );

  if (rows.length < 2) {
    return sciipObservationProcessorResult_(
      0,
      0,
      0,
      0
    );
  }

  const headers =
    rows[0];

  let observationsProcessed = 0;
  let matchedAssets = 0;
  let candidatesCreated = 0;
  let assetsCreated = 0;

  rows
    .slice(1)
    .forEach(function(row) {
      const observation =
        sciipObservationRowToObject_(
          headers,
          row
        );

      if (
        observation.Status &&
        observation.Status !== 'PENDING'
      ) {
        return;
      }

      observationsProcessed++;

      const payload =
        sciipNormalizePropertyObservation_(
          observation
        );

      sciipCreateAndRecordEvent(
        SCIIP.VOCABULARY.EVENT_TYPES.PROPERTY_OBSERVED,
        payload
      );

      const match =
        sciipResolveObservation(
          payload
        );

      if (match.action === 'MATCH') {
        matchedAssets++;

        sciipCreateAndRecordEvent(
          SCIIP.VOCABULARY.EVENT_TYPES.PROPERTY_OBSERVED,
          {
            assetId:
              match.asset.Asset_ID ||
              match.asset.assetId,
            businessKey:
              match.identity.businessKey,
            source:
              payload.source,
            observationType:
              payload.observationType,
            rawText:
              payload.rawText,
            matchConfidence:
              match.confidence
          }
        );

        return;
      }

      const candidate =
        sciipCreateCandidate(
          {
            address: payload.address,
            city: payload.city,
            zip: payload.zip,
            apn: payload.apn,
            source: payload.source
          }
        );

      candidatesCreated++;

      if (match.action === 'CREATE_ASSET') {
        const assetCandidate =
          sciipCreateAssetCandidate(
            payload
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
      }
    });

  return sciipObservationProcessorResult_(
    observationsProcessed,
    matchedAssets,
    candidatesCreated,
    assetsCreated
  );
}

function sciipNormalizePropertyObservation_(
  observation
) {
  return {
    observationId:
      observation.Observation_ID ||
      observation.observationId ||
      'OBS_' + sciipUuid(),

    observationType:
      observation.Observation_Type ||
      observation.observationType ||
      'PROPERTY_OBSERVED',

    address:
      observation.Address ||
      observation.address ||
      '',

    city:
      observation.City ||
      observation.city ||
      '',

    zip:
      observation.Zip ||
      observation.zip ||
      '',

    apn:
      observation.APN ||
      observation.apn ||
      '',

    source:
      observation.Source ||
      observation.source ||
      'OBSERVATION_QUEUE',

    rawText:
      observation.Raw_Text ||
      observation.rawText ||
      '',

    createdAt:
      observation.Created_At ||
      observation.createdAt ||
      sciipNowIso()
  };
}

function sciipObservationRowToObject_(
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

function sciipObservationProcessorResult_(
  observationsProcessed,
  matchedAssets,
  candidatesCreated,
  assetsCreated
) {
  return {
    processor:
      'PropertyObservationProcessor',

    status:
      'SUCCESS',

    observationsProcessed:
      observationsProcessed,

    matchedAssets:
      matchedAssets,

    candidatesCreated:
      candidatesCreated,

    assetsCreated:
      assetsCreated,

    generatedAt:
      sciipNowIso()
  };
}