/**
 * SCIIP_OS v5.4
 * SuperSheet Data Quality Processor
 * File: 2730_SuperSheetDataQualityProcessor.gs
 *
 * Processor: 2730_SuperSheetDataQuality
 *
 * Purpose:
 * Scores imported SuperSheet / Bridge records before downstream
 * matching, promotion, and knowledge graph mutation.
 *
 * This processor is non-destructive.
 * It does not modify source rows.
 * It does not promote records.
 * It only writes durable quality assessment records.
 */

function sciipRun2730_SuperSheetDataQualityProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2730_SuperSheetDataQuality',
    action: 'SUPERSHEET_DATA_QUALITY_ASSESSMENT',
    sourceSheet: 'APPROVAL_QUEUE',
    targetSheet: 'SUPERSHEET_DATA_QUALITY',
    ledgerSheet: 'SUPERSHEET_DATA_QUALITY_LEDGER',

    buildPayload: function(context, definition) {
      var sourceSheetName = sciipResolve2730_SuperSheetDataQualitySourceSheet_();
      var sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sourceSheetName);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: sourceSheetName,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length,
        summary: 'SuperSheet data quality assessment payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          version: 'v5.4',
          qualitySurface: 'SUPERSHEET_IMPORT_FIREWALL',
          sourceResolutionMode: 'FIRST_AVAILABLE_NON_EMPTY_SOURCE',
          candidateSourceSheets: sciipGet2730_SuperSheetDataQualityCandidateSourceSheets_()
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Missing target sheet.');
      if (!definition.ledgerSheet) errors.push('Missing ledger sheet.');

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var sourceSheetName = payload.sourceSheet ||
        sciipResolve2730_SuperSheetDataQualitySourceSheet_();

      var sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sourceSheetName);

      var qualityHeaders = sciipGet2730_SuperSheetDataQualityHeaders_();
      var ledgerHeaders = sciipGet2730_SuperSheetDataQualityLedgerHeaders_();

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
        definition.targetSheet,
        qualityHeaders
      );

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
        definition.ledgerSheet,
        ledgerHeaders
      );

      if (!sourceRecords || sourceRecords.length === 0) {
        var skippedResult = SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            dataQualityStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: sourceSheetName,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Load SuperSheet / Bridge rows before running data quality assessment.'
          })
        });

        sciipAppend2730_SuperSheetDataQualityLedger_(
          definition.ledgerSheet,
          ledgerHeaders,
          {
            Timestamp: new Date(),
            Processor: context.processor,
            Business_Key: context.businessKey,
            Ledger_Status: 'SKIPPED_NO_INPUTS',
            Source_Sheet: sourceSheetName,
            Source_Record_Count: 0,
            Records_Assessed: 0,
            Auto_Promote_Ready: 0,
            Needs_Review: 0,
            New_Candidate: 0,
            Average_Quality_Score: 0,
            Transaction_Id: transaction.transactionId,
            Result_JSON: skippedResult
          }
        );

        return skippedResult;
      }

      var existingKeys = sciipGet2730_ExistingQualityRecordKeys_(definition.targetSheet);
      var assessed = [];
      var skippedDuplicateRecords = 0;

      sourceRecords.forEach(function(record, index) {
        var sourceRowNumber = index + 2;
        var sourceRecordKey = sciipBuild2730_SourceRecordKey_(
          sourceSheetName,
          sourceRowNumber,
          record
        );

        if (existingKeys[sourceRecordKey]) {
          skippedDuplicateRecords++;
          return;
        }

        var assessment = sciipAssess2730_SuperSheetRecordQuality_(
          record,
          sourceSheetName,
          sourceRowNumber,
          sourceRecordKey,
          context,
          transaction
        );

        assessed.push(assessment);

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
          definition.targetSheet,
          qualityHeaders,
          assessment
        );
      });

      var summary = sciipSummarize2730_QualityAssessments_(assessed);

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: assessed.length,
        recordsRead: sourceRecords.length,
        processed: assessed.length,
        skippedDuplicate: skippedDuplicateRecords,
        message: JSON.stringify({
          dataQualityStatus: 'ASSESSMENT_COMPLETED',
          version: 'v5.4',
          sourceSheet: sourceSheetName,
          sourceRecordsRead: sourceRecords.length,
          qualityRecordsCreated: assessed.length,
          skippedDuplicateRecords: skippedDuplicateRecords,
          autoPromoteReady: summary.autoPromoteReady,
          needsReview: summary.needsReview,
          newCandidate: summary.newCandidate,
          averageQualityScore: summary.averageQualityScore,
          transactionId: transaction.transactionId,
          nextProcessorRecommendation: 'Run matching / approval queue processors using SUPERSHEET_DATA_QUALITY classifications.'
        })
      });

      sciipAppend2730_SuperSheetDataQualityLedger_(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: 'DATA_QUALITY_ASSESSMENT_RECORDED',
          Source_Sheet: sourceSheetName,
          Source_Record_Count: sourceRecords.length,
          Records_Assessed: assessed.length,
          Auto_Promote_Ready: summary.autoPromoteReady,
          Needs_Review: summary.needsReview,
          New_Candidate: summary.newCandidate,
          Average_Quality_Score: summary.averageQualityScore,
          Transaction_Id: transaction.transactionId,
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          sourceSheet: sourceSheetName,
          sourceRecordsRead: sourceRecords.length,
          qualityRecordsCreated: assessed.length,
          skippedDuplicateRecords: skippedDuplicateRecords,
          summary: summary,
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.4 SuperSheet data quality assessment completed.'
      });

      return result;
    }
  });
}

function sciipGet2730_SuperSheetDataQualityCandidateSourceSheets_() {
  return [
    'SUPERSHEET_BRIDGE_ROWS',
    'BRIDGE_IMPORT_ROWS',
    'APPROVAL_QUEUE'
  ];
}

function sciipResolve2730_SuperSheetDataQualitySourceSheet_() {
  var candidates = sciipGet2730_SuperSheetDataQualityCandidateSourceSheets_();

  for (var i = 0; i < candidates.length; i++) {
    var records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(candidates[i]);
    if (records && records.length > 0) return candidates[i];
  }

  return 'APPROVAL_QUEUE';
}

function sciipGet2730_SuperSheetDataQualityHeaders_() {
  return [
    'Quality_Record_ID',
    'Business_Key',
    'Assessment_Date',
    'Source_Sheet',
    'Source_Row_Number',
    'Source_Record_Key',
    'Address_Value',
    'City_Value',
    'Building_Name_Value',
    'APN_Value',
    'Square_Feet_Value',
    'Latitude_Value',
    'Longitude_Value',
    'Address_Confidence',
    'City_Confidence',
    'Identity_Confidence',
    'Size_Confidence',
    'Geocode_Confidence',
    'Overall_Quality_Score',
    'Quality_Band',
    'Routing_Decision',
    'Review_Flags',
    'Recommended_Next_Action',
    'Created_At',
    'Processor',
    'Transaction_Id',
    'Source_JSON'
  ];
}

function sciipGet2730_SuperSheetDataQualityLedgerHeaders_() {
  return [
    'Timestamp',
    'Processor',
    'Business_Key',
    'Ledger_Status',
    'Source_Sheet',
    'Source_Record_Count',
    'Records_Assessed',
    'Auto_Promote_Ready',
    'Needs_Review',
    'New_Candidate',
    'Average_Quality_Score',
    'Transaction_Id',
    'Result_JSON'
  ];
}

function sciipAssess2730_SuperSheetRecordQuality_(
  record,
  sourceSheetName,
  sourceRowNumber,
  sourceRecordKey,
  context,
  transaction
) {
  var addressValue = sciipPick2730_FirstPresentValue_(record, [
    'Address',
    'Property_Address',
    'Street_Address',
    'Building_Address',
    'Site_Address',
    'Full_Address',
    'Formatted_Address'
  ]);

  var cityValue = sciipPick2730_FirstPresentValue_(record, [
    'City',
    'Market_City',
    'Property_City'
  ]);

  var buildingNameValue = sciipPick2730_FirstPresentValue_(record, [
    'Building_Name',
    'Property_Name',
    'Project_Name',
    'Name',
    'Asset_Name'
  ]);

  var apnValue = sciipPick2730_FirstPresentValue_(record, [
    'APN',
    'Parcel',
    'Parcel_Number',
    'Assessor_Parcel_Number'
  ]);

  var squareFeetValue = sciipPick2730_FirstPresentValue_(record, [
    'SF',
    'Square_Feet',
    'Building_SF',
    'Available_SF',
    'Size_SF',
    'Total_SF'
  ]);

  var latitudeValue = sciipPick2730_FirstPresentValue_(record, [
    'Latitude',
    'Lat'
  ]);

  var longitudeValue = sciipPick2730_FirstPresentValue_(record, [
    'Longitude',
    'Long',
    'Lng'
  ]);

  var addressConfidence = sciipScore2730_AddressConfidence_(addressValue);
  var cityConfidence = sciipScore2730_CityConfidence_(cityValue);
  var identityConfidence = sciipScore2730_IdentityConfidence_(
    addressValue,
    buildingNameValue,
    apnValue
  );
  var sizeConfidence = sciipScore2730_SizeConfidence_(squareFeetValue);
  var geocodeConfidence = sciipScore2730_GeocodeConfidence_(
    latitudeValue,
    longitudeValue
  );

  var overallScore = Math.round(
    addressConfidence * 0.35 +
    cityConfidence * 0.15 +
    identityConfidence * 0.20 +
    sizeConfidence * 0.15 +
    geocodeConfidence * 0.15
  );

  var flags = sciipBuild2730_ReviewFlags_({
    addressValue: addressValue,
    cityValue: cityValue,
    buildingNameValue: buildingNameValue,
    apnValue: apnValue,
    squareFeetValue: squareFeetValue,
    latitudeValue: latitudeValue,
    longitudeValue: longitudeValue,
    addressConfidence: addressConfidence,
    cityConfidence: cityConfidence,
    identityConfidence: identityConfidence,
    sizeConfidence: sizeConfidence,
    geocodeConfidence: geocodeConfidence
  });

  var qualityBand = sciipDetermine2730_QualityBand_(overallScore);
  var routingDecision = sciipDetermine2730_RoutingDecision_(overallScore, flags);
  var nextAction = sciipDetermine2730_RecommendedNextAction_(routingDecision);

  return {
    Quality_Record_ID: 'SUPERSHEET_DATA_QUALITY_' + Utilities.getUuid(),
    Business_Key: 'SUPERSHEET_DATA_QUALITY|' + sourceRecordKey,
    Assessment_Date: SCIIP_RUNTIME.getDateKey({}),
    Source_Sheet: sourceSheetName,
    Source_Row_Number: sourceRowNumber,
    Source_Record_Key: sourceRecordKey,
    Address_Value: addressValue,
    City_Value: cityValue,
    Building_Name_Value: buildingNameValue,
    APN_Value: apnValue,
    Square_Feet_Value: squareFeetValue,
    Latitude_Value: latitudeValue,
    Longitude_Value: longitudeValue,
    Address_Confidence: addressConfidence,
    City_Confidence: cityConfidence,
    Identity_Confidence: identityConfidence,
    Size_Confidence: sizeConfidence,
    Geocode_Confidence: geocodeConfidence,
    Overall_Quality_Score: overallScore,
    Quality_Band: qualityBand,
    Routing_Decision: routingDecision,
    Review_Flags: flags.join('|'),
    Recommended_Next_Action: nextAction,
    Created_At: new Date().toISOString(),
    Processor: context.processor,
    Transaction_Id: transaction.transactionId,
    Source_JSON: record
  };
}

function sciipPick2730_FirstPresentValue_(record, candidateFields) {
  for (var i = 0; i < candidateFields.length; i++) {
    var key = candidateFields[i];
    if (
      record &&
      record.hasOwnProperty(key) &&
      record[key] !== null &&
      record[key] !== undefined &&
      String(record[key]).trim() !== ''
    ) {
      return String(record[key]).trim();
    }
  }

  return '';
}

function sciipScore2730_AddressConfidence_(value) {
  var text = String(value || '').trim();
  if (!text) return 0;

  var score = 40;
  if (/\d/.test(text)) score += 20;
  if (/(street|st\.?|avenue|ave\.?|road|rd\.?|boulevard|blvd\.?|drive|dr\.?|way|parkway|pkwy\.?|court|ct\.?|lane|ln\.?)$/i.test(text)) score += 20;
  if (text.length >= 8) score += 10;
  if (text.length >= 15) score += 10;

  return Math.min(score, 100);
}

function sciipScore2730_CityConfidence_(value) {
  var text = String(value || '').trim();
  if (!text) return 0;
  if (/^\d+$/.test(text)) return 25;
  if (text.length < 3) return 40;
  return 100;
}

function sciipScore2730_IdentityConfidence_(addressValue, buildingNameValue, apnValue) {
  var score = 0;
  if (String(addressValue || '').trim()) score += 45;
  if (String(buildingNameValue || '').trim()) score += 25;
  if (String(apnValue || '').trim()) score += 30;
  return Math.min(score, 100);
}

function sciipScore2730_SizeConfidence_(value) {
  var text = String(value || '').replace(/,/g, '').trim();
  if (!text) return 0;

  var number = Number(text);
  if (isNaN(number) || number <= 0) return 30;
  if (number < 1000) return 50;
  return 100;
}

function sciipScore2730_GeocodeConfidence_(latitudeValue, longitudeValue) {
  var latText = String(latitudeValue || '').trim();
  var lonText = String(longitudeValue || '').trim();

  if (!latText && !lonText) return 0;

  var lat = Number(latText);
  var lon = Number(lonText);

  if (isNaN(lat) || isNaN(lon)) return 25;
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return 25;

  return 100;
}

function sciipBuild2730_ReviewFlags_(args) {
  var flags = [];

  if (!args.addressValue) flags.push('MISSING_ADDRESS');
  if (!args.cityValue) flags.push('MISSING_CITY');
  if (!args.buildingNameValue && !args.apnValue) flags.push('WEAK_IDENTITY_FIELDS');
  if (!args.squareFeetValue) flags.push('MISSING_SIZE');
  if (!args.latitudeValue || !args.longitudeValue) flags.push('MISSING_GEOCODE');
  if (args.addressConfidence < 70) flags.push('LOW_ADDRESS_CONFIDENCE');
  if (args.cityConfidence < 70) flags.push('LOW_CITY_CONFIDENCE');
  if (args.identityConfidence < 70) flags.push('LOW_IDENTITY_CONFIDENCE');
  if (args.sizeConfidence < 70) flags.push('LOW_SIZE_CONFIDENCE');
  if (args.geocodeConfidence < 70) flags.push('LOW_GEOCODE_CONFIDENCE');

  if (flags.length === 0) flags.push('NO_REVIEW_FLAGS');

  return flags;
}

function sciipDetermine2730_QualityBand_(score) {
  if (score >= 90) return 'HIGH';
  if (score >= 70) return 'MEDIUM';
  return 'LOW';
}

function sciipDetermine2730_RoutingDecision_(score, flags) {
  var flagText = flags.join('|');

  if (score >= 90 && flagText === 'NO_REVIEW_FLAGS') {
    return 'AUTO_PROMOTE_READY';
  }

  if (score >= 70) {
    return 'NEEDS_REVIEW';
  }

  return 'NEW_CANDIDATE';
}

function sciipDetermine2730_RecommendedNextAction_(routingDecision) {
  if (routingDecision === 'AUTO_PROMOTE_READY') {
    return 'Allow downstream match and promotion processors to evaluate for automated promotion.';
  }

  if (routingDecision === 'NEEDS_REVIEW') {
    return 'Route to manual review / approval queue before promotion.';
  }

  return 'Treat as possible new property candidate and preserve full source record for review.';
}

function sciipBuild2730_SourceRecordKey_(sourceSheetName, sourceRowNumber, record) {
  var candidateKey = sciipPick2730_FirstPresentValue_(record, [
    'Business_Key',
    'Source_Record_Key',
    'Property_ID',
    'Candidate_ID',
    'Approval_ID',
    'Asset_ID'
  ]);

  if (candidateKey) {
    return sourceSheetName + '|' + candidateKey;
  }

  var address = sciipPick2730_FirstPresentValue_(record, [
    'Address',
    'Property_Address',
    'Street_Address',
    'Building_Address',
    'Site_Address',
    'Full_Address',
    'Formatted_Address'
  ]);

  var city = sciipPick2730_FirstPresentValue_(record, [
    'City',
    'Market_City',
    'Property_City'
  ]);

  if (address || city) {
    return sourceSheetName + '|' + sciipNormalize2730_KeyPart_(address) + '|' + sciipNormalize2730_KeyPart_(city);
  }

  return sourceSheetName + '|ROW_' + sourceRowNumber;
}

function sciipNormalize2730_KeyPart_(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function sciipGet2730_ExistingQualityRecordKeys_(targetSheetName) {
  var records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(targetSheetName);
  var keys = {};

  records.forEach(function(record) {
    var key = String(record.Source_Record_Key || '').trim();
    if (key) keys[key] = true;
  });

  return keys;
}

function sciipSummarize2730_QualityAssessments_(assessments) {
  var total = 0;
  var autoPromoteReady = 0;
  var needsReview = 0;
  var newCandidate = 0;

  assessments.forEach(function(row) {
    total += Number(row.Overall_Quality_Score || 0);

    if (row.Routing_Decision === 'AUTO_PROMOTE_READY') autoPromoteReady++;
    if (row.Routing_Decision === 'NEEDS_REVIEW') needsReview++;
    if (row.Routing_Decision === 'NEW_CANDIDATE') newCandidate++;
  });

  return {
    autoPromoteReady: autoPromoteReady,
    needsReview: needsReview,
    newCandidate: newCandidate,
    averageQualityScore: assessments.length
      ? Math.round(total / assessments.length)
      : 0
  };
}

function sciipAppend2730_SuperSheetDataQualityLedger_(sheetName, headers, row) {
  SCIIP_RUNTIME_SHEET_FACTORY.appendObject(sheetName, headers, row);
}

/**
 * Standalone validation test.
 */
function sciipTest2730_SuperSheetDataQualityProcessor() {
  var result = sciipRun2730_SuperSheetDataQualityProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2730_SuperSheetDataQualityProcessor',
    result: result
  }));

  return result;
}
