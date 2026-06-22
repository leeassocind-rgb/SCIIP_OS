function sciipRunPropertyObservationProcessor(context) {

  sciipInitializeObservationQueue();
  sciipInitializeCandidateSheet();
  sciipInitializeAssetRegistry();
  sciipInitializeEventStore();
  sciipInitializeTimelineSheet();
  sciipInitializeGraphNodeSheet();
  sciipInitializeGraphEdgeSheet();

  const sheet =
    sciipGetObservationQueueSheet();

  const rows =
    sheet.getDataRange().getValues();

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

  const statusIndex =
    headers.indexOf(
      'Status'
    );

  const processedAtIndex =
    headers.indexOf(
      'Processed_At'
    );

  let observationsProcessed = 0;
  let matchedAssets = 0;
  let candidatesCreated = 0;
  let assetsCreated = 0;

  for (
    let i = 1;
    i < rows.length;
    i++
  ) {

    const row =
      rows[i];

    const observation =
      sciipObservationRowToObject_(
        headers,
        row
      );

    if (
      observation.Status &&
      observation.Status !== 'PENDING'
    ) {
      continue;
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

    if (
      match.action === 'MATCH'
    ) {

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

    } else {

      const candidate =
        sciipCreateCandidate({
          address:
            payload.address,

          city:
            payload.city,

          zip:
            payload.zip,

          apn:
            payload.apn,

          source:
            payload.source
        });

      candidatesCreated++;

      if (
        match.action ===
        'CREATE_ASSET'
      ) {

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
    }

    /*
     * Mark observation processed
     */

    sheet.getRange(
      i + 1,
      statusIndex + 1
    ).setValue(
      'PROCESSED'
    );

    sheet.getRange(
      i + 1,
      processedAtIndex + 1
    ).setValue(
      sciipNowIso()
    );
  }

  return sciipObservationProcessorResult_(
    observationsProcessed,
    matchedAssets,
    candidatesCreated,
    assetsCreated
  );
}