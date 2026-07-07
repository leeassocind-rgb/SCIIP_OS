/**
 * SCIIP_OS v5.4
 * SuperSheet Data Quality Digest Processor
 * File: 2750_SuperSheetDataQualityDigestProcessor.gs
 *
 * Processor: 2750_SuperSheetDataQualityDigest
 *
 * Purpose:
 * Creates an operator-facing digest from SUPERSHEET_DATA_QUALITY_LEDGER_SUMMARY
 * records produced by 2740_SuperSheetDataQualityLedgerProcessor.
 *
 * This processor is non-destructive and skip-safe.
 */

function sciipRun2750_SuperSheetDataQualityDigestProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2750_SuperSheetDataQualityDigest',
    action: 'SUPERSHEET_DATA_QUALITY_DIGEST_BUILD',
    sourceSheet: 'SUPERSHEET_DATA_QUALITY_LEDGER_SUMMARY',
    targetSheet: 'SUPERSHEET_DATA_QUALITY_DIGEST',
    ledgerSheet: 'SUPERSHEET_DATA_QUALITY_DIGEST_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      var ledgerSummaries = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: ledgerSummaries.length,
        outputCount: ledgerSummaries.length ? 1 : 0,
        summary: 'SuperSheet data quality digest payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          version: 'v5.4',
          qualitySurface: 'SUPERSHEET_IMPORT_FIREWALL_DIGEST',
          upstreamProcessor: '2740_SuperSheetDataQualityLedger'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Missing source sheet.');
      if (!definition.targetSheet) errors.push('Missing target sheet.');
      if (!definition.ledgerSheet) errors.push('Missing ledger sheet.');

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var digestHeaders = sciipGet2750_SuperSheetDataQualityDigestHeaders_();
      var runtimeLedgerHeaders = sciipGet2750_SuperSheetDataQualityDigestRuntimeLedgerHeaders_();

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
        definition.targetSheet,
        digestHeaders
      );

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
        definition.ledgerSheet,
        runtimeLedgerHeaders
      );

      var ledgerSummaries = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      if (!ledgerSummaries || ledgerSummaries.length === 0) {
        var skippedResult = SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            dataQualityDigestStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 2740_SuperSheetDataQualityLedgerProcessor after 2730 creates quality records.'
          })
        });

        sciipAppend2750_SuperSheetDataQualityDigestRuntimeLedger_(
          definition.ledgerSheet,
          runtimeLedgerHeaders,
          {
            Timestamp: new Date(),
            Processor: context.processor,
            Business_Key: context.businessKey,
            Digest_Status: 'SKIPPED_NO_INPUTS',
            Source_Sheet: definition.sourceSheet,
            Source_Record_Count: 0,
            Digest_Records_Created: 0,
            Digest_Date: '',
            Digest_Rating: 'NO_INPUTS',
            Transaction_Id: transaction.transactionId,
            Result_JSON: skippedResult
          }
        );

        return skippedResult;
      }

      var digestDate = sciipResolve2750_LatestLedgerDate_(ledgerSummaries) ||
        SCIIP_RUNTIME.getDateKey({});

      var digestBusinessKey = 'SUPERSHEET_DATA_QUALITY_DIGEST|' + digestDate;

      if (sciip2750_DigestBusinessKeyExists_(definition.targetSheet, digestBusinessKey)) {
        var duplicateResult = SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: ledgerSummaries.length,
          processed: 0,
          message: JSON.stringify({
            dataQualityDigestStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            sourceRecordsRead: ledgerSummaries.length,
            digestBusinessKey: digestBusinessKey,
            transactionId: transaction.transactionId
          })
        });

        sciipAppend2750_SuperSheetDataQualityDigestRuntimeLedger_(
          definition.ledgerSheet,
          runtimeLedgerHeaders,
          {
            Timestamp: new Date(),
            Processor: context.processor,
            Business_Key: context.businessKey,
            Digest_Status: 'DUPLICATE_SKIPPED',
            Source_Sheet: definition.sourceSheet,
            Source_Record_Count: ledgerSummaries.length,
            Digest_Records_Created: 0,
            Digest_Date: digestDate,
            Digest_Rating: 'DUPLICATE',
            Transaction_Id: transaction.transactionId,
            Result_JSON: duplicateResult
          }
        );

        return duplicateResult;
      }

      var ledgerSummariesForDate = sciipFilter2750_LedgerSummariesByDate_(
        ledgerSummaries,
        digestDate
      );

      var digest = sciipBuild2750_SuperSheetDataQualityDigest_(ledgerSummariesForDate);

      var digestRecord = {
        Digest_ID: 'SUPERSHEET_DATA_QUALITY_DIGEST_' + Utilities.getUuid(),
        Business_Key: digestBusinessKey,
        Digest_Date: digestDate,
        Source_Sheet: definition.sourceSheet,
        Source_Record_Count: ledgerSummariesForDate.length,
        Total_Records_Assessed: digest.totalRecordsAssessed,
        Auto_Promote_Ready: digest.autoPromoteReady,
        Needs_Review: digest.needsReview,
        New_Candidate: digest.newCandidate,
        Average_Quality_Score: digest.averageQualityScore,
        Digest_Rating: digest.digestRating,
        Data_Quality_Posture: digest.dataQualityPosture,
        Key_Risk: digest.keyRisk,
        Recommended_Next_Action: digest.recommendedNextAction,
        Created_At: new Date().toISOString(),
        Processor: context.processor,
        Transaction_Id: transaction.transactionId,
        Digest_JSON: digest
      };

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.targetSheet,
        digestHeaders,
        digestRecord
      );

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: ledgerSummaries.length,
        processed: ledgerSummariesForDate.length,
        skippedDuplicate: 0,
        message: JSON.stringify({
          dataQualityDigestStatus: 'DIGEST_RECORDED',
          version: 'v5.4',
          sourceSheet: definition.sourceSheet,
          sourceRecordsRead: ledgerSummaries.length,
          ledgerSummariesReviewedForDigestDate: ledgerSummariesForDate.length,
          digestDate: digestDate,
          digestBusinessKey: digestBusinessKey,
          totalRecordsAssessed: digest.totalRecordsAssessed,
          averageQualityScore: digest.averageQualityScore,
          digestRating: digest.digestRating,
          dataQualityPosture: digest.dataQualityPosture,
          transactionId: transaction.transactionId,
          nextProcessorRecommendation: digest.recommendedNextAction
        })
      });

      sciipAppend2750_SuperSheetDataQualityDigestRuntimeLedger_(
        definition.ledgerSheet,
        runtimeLedgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Digest_Status: 'DIGEST_RECORDED',
          Source_Sheet: definition.sourceSheet,
          Source_Record_Count: ledgerSummaries.length,
          Digest_Records_Created: 1,
          Digest_Date: digestDate,
          Digest_Rating: digest.digestRating,
          Transaction_Id: transaction.transactionId,
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          sourceSheet: definition.sourceSheet,
          sourceRecordsRead: ledgerSummaries.length,
          ledgerSummariesReviewedForDigestDate: ledgerSummariesForDate.length,
          digest: digest,
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.4 SuperSheet data quality digest completed.'
      });

      return result;
    }
  });
}

function sciipGet2750_SuperSheetDataQualityDigestHeaders_() {
  return [
    'Digest_ID',
    'Business_Key',
    'Digest_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Total_Records_Assessed',
    'Auto_Promote_Ready',
    'Needs_Review',
    'New_Candidate',
    'Average_Quality_Score',
    'Digest_Rating',
    'Data_Quality_Posture',
    'Key_Risk',
    'Recommended_Next_Action',
    'Created_At',
    'Processor',
    'Transaction_Id',
    'Digest_JSON'
  ];
}

function sciipGet2750_SuperSheetDataQualityDigestRuntimeLedgerHeaders_() {
  return [
    'Timestamp',
    'Processor',
    'Business_Key',
    'Digest_Status',
    'Source_Sheet',
    'Source_Record_Count',
    'Digest_Records_Created',
    'Digest_Date',
    'Digest_Rating',
    'Transaction_Id',
    'Result_JSON'
  ];
}

function sciipResolve2750_LatestLedgerDate_(records) {
  var dates = [];

  records.forEach(function(record) {
    var dateValue = sciipNormalize2750_DateValue_(record.Ledger_Date);
    if (dateValue) dates.push(dateValue);
  });

  if (!dates.length) return null;

  dates.sort();
  return dates[dates.length - 1];
}

function sciipFilter2750_LedgerSummariesByDate_(records, digestDate) {
  return records.filter(function(record) {
    return sciipNormalize2750_DateValue_(record.Ledger_Date) === digestDate;
  });
}

function sciipNormalize2750_DateValue_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }

  var text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

  var parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }

  return text;
}

function sciipBuild2750_SuperSheetDataQualityDigest_(records) {
  var totalRecordsAssessed = 0;
  var autoPromoteReady = 0;
  var needsReview = 0;
  var newCandidate = 0;
  var weightedScoreTotal = 0;

  records.forEach(function(record) {
    var count = Number(record.Source_Record_Count || 0);
    var averageScore = Number(record.Average_Quality_Score || 0);

    totalRecordsAssessed += count;
    autoPromoteReady += Number(record.Auto_Promote_Ready || 0);
    needsReview += Number(record.Needs_Review || 0);
    newCandidate += Number(record.New_Candidate || 0);
    weightedScoreTotal += averageScore * count;
  });

  var averageQualityScore = totalRecordsAssessed
    ? Math.round(weightedScoreTotal / totalRecordsAssessed)
    : 0;

  var reviewBurden = needsReview + newCandidate;
  var digestRating = sciipDetermine2750_DigestRating_(averageQualityScore, reviewBurden, totalRecordsAssessed);
  var posture = sciipDetermine2750_DataQualityPosture_(digestRating, reviewBurden, totalRecordsAssessed);

  return {
    ledgerSummariesReviewed: records.length,
    totalRecordsAssessed: totalRecordsAssessed,
    autoPromoteReady: autoPromoteReady,
    needsReview: needsReview,
    newCandidate: newCandidate,
    averageQualityScore: averageQualityScore,
    reviewBurden: reviewBurden,
    digestRating: digestRating,
    dataQualityPosture: posture,
    keyRisk: sciipDetermine2750_KeyRisk_(averageQualityScore, needsReview, newCandidate, totalRecordsAssessed),
    recommendedNextAction: sciipDetermine2750_RecommendedNextAction_(digestRating, reviewBurden, totalRecordsAssessed)
  };
}

function sciipDetermine2750_DigestRating_(averageQualityScore, reviewBurden, totalRecordsAssessed) {
  if (!totalRecordsAssessed) return 'NO_RECORDS';
  if (averageQualityScore >= 90 && reviewBurden === 0) return 'GREEN';
  if (averageQualityScore >= 80 && reviewBurden <= Math.max(1, Math.ceil(totalRecordsAssessed * 0.10))) return 'GREEN_WITH_REVIEW';
  if (averageQualityScore >= 65) return 'YELLOW';
  return 'RED';
}

function sciipDetermine2750_DataQualityPosture_(digestRating, reviewBurden, totalRecordsAssessed) {
  if (digestRating === 'NO_RECORDS') return 'NO_SUPERSHEET_DATA_ASSESSED';
  if (digestRating === 'GREEN') return 'READY_FOR_AUTO_PROMOTION';
  if (digestRating === 'GREEN_WITH_REVIEW') return 'MOSTLY_READY_WITH_LIGHT_REVIEW';
  if (digestRating === 'YELLOW') return 'REVIEW_REQUIRED_BEFORE_PROMOTION';
  return 'HIGH_RISK_IMPORT_REQUIRES_MANUAL_REVIEW';
}

function sciipDetermine2750_KeyRisk_(averageQualityScore, needsReview, newCandidate, totalRecordsAssessed) {
  if (!totalRecordsAssessed) return 'No data quality records were available for digest.';
  if (newCandidate > 0) return 'New candidate records exist and should be reviewed before graph promotion.';
  if (needsReview > 0) return 'Some imported records require review before promotion.';
  if (averageQualityScore < 65) return 'Average data quality score is below the safe promotion threshold.';
  return 'No material data quality risk detected for this digest.';
}

function sciipDetermine2750_RecommendedNextAction_(digestRating, reviewBurden, totalRecordsAssessed) {
  if (!totalRecordsAssessed) {
    return 'Load SuperSheet / Bridge rows and rerun 2730, 2740, and 2750.';
  }

  if (digestRating === 'GREEN') {
    return 'Proceed to matching and promotion processors with digest available for audit.';
  }

  if (digestRating === 'GREEN_WITH_REVIEW') {
    return 'Review flagged records, then proceed to matching and promotion.';
  }

  return 'Pause promotion and resolve review/candidate records before knowledge graph ingestion.';
}

function sciip2750_DigestBusinessKeyExists_(targetSheetName, businessKey) {
  var records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(targetSheetName);

  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === String(businessKey || '').trim();
  });
}

function sciipAppend2750_SuperSheetDataQualityDigestRuntimeLedger_(sheetName, headers, row) {
  SCIIP_RUNTIME_SHEET_FACTORY.appendObject(sheetName, headers, row);
}

/**
 * Standalone validation test.
 */
function sciipTest2750_SuperSheetDataQualityDigestProcessor() {
  var result = sciipRun2750_SuperSheetDataQualityDigestProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2750_SuperSheetDataQualityDigestProcessor',
    result: result
  }));

  return result;
}
