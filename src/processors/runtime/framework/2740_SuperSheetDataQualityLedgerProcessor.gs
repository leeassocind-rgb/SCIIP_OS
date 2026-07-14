/**
 * SCIIP_OS v6.1 Repository Consolidation
 * Corrected filename. This source already implemented processor 2740.
 */
/**
 * SCIIP_OS v5.4
 * SuperSheet Data Quality Ledger Processor
 * File: 2740_SuperSheetDataQualityLedgerProcessor.gs
 *
 * Processor: 2740_SuperSheetDataQualityLedger
 *
 * Purpose:
 * Creates a durable ledger summary from SUPERSHEET_DATA_QUALITY
 * records produced by 2730_SuperSheetDataQualityProcessor.
 *
 * This processor is non-destructive.
 * It does not modify source quality records.
 * It records batch-level data quality ledger entries only.
 */

function sciipRun2740_SuperSheetDataQualityLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2740_SuperSheetDataQualityLedger',
    action: 'SUPERSHEET_DATA_QUALITY_LEDGER_SUMMARY',
    sourceSheet: 'SUPERSHEET_DATA_QUALITY',
    targetSheet: 'SUPERSHEET_DATA_QUALITY_LEDGER_SUMMARY',
    ledgerSheet: 'SUPERSHEET_DATA_QUALITY_LEDGER_SUMMARY_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      var qualityRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: qualityRecords.length,
        outputCount: qualityRecords.length ? 1 : 0,
        summary: 'SuperSheet data quality ledger summary payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          version: 'v5.4',
          qualitySurface: 'SUPERSHEET_IMPORT_FIREWALL_LEDGER',
          upstreamProcessor: '2730_SuperSheetDataQuality'
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
      var summaryHeaders = sciipGet2740_SuperSheetDataQualityLedgerSummaryHeaders_();
      var runtimeLedgerHeaders = sciipGet2740_SuperSheetDataQualityRuntimeLedgerHeaders_();

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
        definition.targetSheet,
        summaryHeaders
      );

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
        definition.ledgerSheet,
        runtimeLedgerHeaders
      );

      var qualityRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      if (!qualityRecords || qualityRecords.length === 0) {
        var skippedResult = SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            dataQualityLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 2730_SuperSheetDataQualityProcessor after loading SuperSheet / Bridge rows.'
          })
        });

        sciipAppend2740_SuperSheetDataQualityRuntimeLedger_(
          definition.ledgerSheet,
          runtimeLedgerHeaders,
          {
            Timestamp: new Date(),
            Processor: context.processor,
            Business_Key: context.businessKey,
            Ledger_Status: 'SKIPPED_NO_INPUTS',
            Source_Sheet: definition.sourceSheet,
            Source_Record_Count: 0,
            Summary_Records_Created: 0,
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

      var assessmentDate = sciipResolve2740_LatestAssessmentDate_(qualityRecords) ||
        SCIIP_RUNTIME.getDateKey({});

      var ledgerBusinessKey = 'SUPERSHEET_DATA_QUALITY_LEDGER|' + assessmentDate;

      if (sciip2740_SummaryBusinessKeyExists_(definition.targetSheet, ledgerBusinessKey)) {
        var duplicateResult = SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: qualityRecords.length,
          processed: 0,
          message: JSON.stringify({
            dataQualityLedgerStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            sourceRecordsRead: qualityRecords.length,
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });

        sciipAppend2740_SuperSheetDataQualityRuntimeLedger_(
          definition.ledgerSheet,
          runtimeLedgerHeaders,
          {
            Timestamp: new Date(),
            Processor: context.processor,
            Business_Key: context.businessKey,
            Ledger_Status: 'DUPLICATE_SKIPPED',
            Source_Sheet: definition.sourceSheet,
            Source_Record_Count: qualityRecords.length,
            Summary_Records_Created: 0,
            Auto_Promote_Ready: 0,
            Needs_Review: 0,
            New_Candidate: 0,
            Average_Quality_Score: 0,
            Transaction_Id: transaction.transactionId,
            Result_JSON: duplicateResult
          }
        );

        return duplicateResult;
      }

      var recordsForDate = sciipFilter2740_QualityRecordsByAssessmentDate_(
        qualityRecords,
        assessmentDate
      );

      var summary = sciipSummarize2740_SuperSheetDataQualityRecords_(recordsForDate);

      var summaryRecord = {
        Ledger_Summary_ID: 'SUPERSHEET_DATA_QUALITY_LEDGER_SUMMARY_' + Utilities.getUuid(),
        Business_Key: ledgerBusinessKey,
        Ledger_Date: assessmentDate,
        Source_Sheet: definition.sourceSheet,
        Source_Record_Count: recordsForDate.length,
        Auto_Promote_Ready: summary.autoPromoteReady,
        Needs_Review: summary.needsReview,
        New_Candidate: summary.newCandidate,
        High_Quality_Count: summary.highQualityCount,
        Medium_Quality_Count: summary.mediumQualityCount,
        Low_Quality_Count: summary.lowQualityCount,
        Average_Quality_Score: summary.averageQualityScore,
        Lowest_Quality_Score: summary.lowestQualityScore,
        Highest_Quality_Score: summary.highestQualityScore,
        Dominant_Routing_Decision: summary.dominantRoutingDecision,
        Ledger_Status: summary.recordsAssessed > 0 ? 'DATA_QUALITY_LEDGER_RECORDED' : 'NO_RECORDS_FOR_DATE',
        Recommended_Next_Action: sciipDetermine2740_RecommendedNextAction_(summary),
        Created_At: new Date().toISOString(),
        Processor: context.processor,
        Transaction_Id: transaction.transactionId,
        Summary_JSON: summary
      };

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.targetSheet,
        summaryHeaders,
        summaryRecord
      );

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: qualityRecords.length,
        processed: recordsForDate.length,
        skippedDuplicate: 0,
        message: JSON.stringify({
          dataQualityLedgerStatus: summaryRecord.Ledger_Status,
          version: 'v5.4',
          sourceSheet: definition.sourceSheet,
          sourceRecordsRead: qualityRecords.length,
          recordsAssessedForLedgerDate: recordsForDate.length,
          ledgerDate: assessmentDate,
          ledgerBusinessKey: ledgerBusinessKey,
          autoPromoteReady: summary.autoPromoteReady,
          needsReview: summary.needsReview,
          newCandidate: summary.newCandidate,
          averageQualityScore: summary.averageQualityScore,
          transactionId: transaction.transactionId,
          nextProcessorRecommendation: summaryRecord.Recommended_Next_Action
        })
      });

      sciipAppend2740_SuperSheetDataQualityRuntimeLedger_(
        definition.ledgerSheet,
        runtimeLedgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: 'DATA_QUALITY_LEDGER_SUMMARY_RECORDED',
          Source_Sheet: definition.sourceSheet,
          Source_Record_Count: qualityRecords.length,
          Summary_Records_Created: 1,
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
          sourceSheet: definition.sourceSheet,
          sourceRecordsRead: qualityRecords.length,
          recordsAssessedForLedgerDate: recordsForDate.length,
          summary: summary,
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.4 SuperSheet data quality ledger summary completed.'
      });

      return result;
    }
  });
}

function sciipGet2740_SuperSheetDataQualityLedgerSummaryHeaders_() {
  return [
    'Ledger_Summary_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Auto_Promote_Ready',
    'Needs_Review',
    'New_Candidate',
    'High_Quality_Count',
    'Medium_Quality_Count',
    'Low_Quality_Count',
    'Average_Quality_Score',
    'Lowest_Quality_Score',
    'Highest_Quality_Score',
    'Dominant_Routing_Decision',
    'Ledger_Status',
    'Recommended_Next_Action',
    'Created_At',
    'Processor',
    'Transaction_Id',
    'Summary_JSON'
  ];
}

function sciipGet2740_SuperSheetDataQualityRuntimeLedgerHeaders_() {
  return [
    'Timestamp',
    'Processor',
    'Business_Key',
    'Ledger_Status',
    'Source_Sheet',
    'Source_Record_Count',
    'Summary_Records_Created',
    'Auto_Promote_Ready',
    'Needs_Review',
    'New_Candidate',
    'Average_Quality_Score',
    'Transaction_Id',
    'Result_JSON'
  ];
}

function sciipResolve2740_LatestAssessmentDate_(records) {
  var dates = [];

  records.forEach(function(record) {
    var dateValue = sciipNormalize2740_DateValue_(record.Assessment_Date);
    if (dateValue) dates.push(dateValue);
  });

  if (!dates.length) return null;

  dates.sort();
  return dates[dates.length - 1];
}

function sciipFilter2740_QualityRecordsByAssessmentDate_(records, assessmentDate) {
  return records.filter(function(record) {
    return sciipNormalize2740_DateValue_(record.Assessment_Date) === assessmentDate;
  });
}

function sciipNormalize2740_DateValue_(value) {
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

function sciipSummarize2740_SuperSheetDataQualityRecords_(records) {
  var totalScore = 0;
  var lowestScore = null;
  var highestScore = null;

  var counts = {
    AUTO_PROMOTE_READY: 0,
    NEEDS_REVIEW: 0,
    NEW_CANDIDATE: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0
  };

  records.forEach(function(record) {
    var score = Number(record.Overall_Quality_Score || 0);
    totalScore += score;

    if (lowestScore === null || score < lowestScore) lowestScore = score;
    if (highestScore === null || score > highestScore) highestScore = score;

    var routingDecision = String(record.Routing_Decision || '').trim();
    if (counts.hasOwnProperty(routingDecision)) counts[routingDecision]++;

    var qualityBand = String(record.Quality_Band || '').trim();
    if (counts.hasOwnProperty(qualityBand)) counts[qualityBand]++;
  });

  return {
    recordsAssessed: records.length,
    autoPromoteReady: counts.AUTO_PROMOTE_READY,
    needsReview: counts.NEEDS_REVIEW,
    newCandidate: counts.NEW_CANDIDATE,
    highQualityCount: counts.HIGH,
    mediumQualityCount: counts.MEDIUM,
    lowQualityCount: counts.LOW,
    averageQualityScore: records.length ? Math.round(totalScore / records.length) : 0,
    lowestQualityScore: lowestScore === null ? 0 : lowestScore,
    highestQualityScore: highestScore === null ? 0 : highestScore,
    dominantRoutingDecision: sciipDetermine2740_DominantRoutingDecision_(counts)
  };
}

function sciipDetermine2740_DominantRoutingDecision_(counts) {
  var decisions = [
    { name: 'AUTO_PROMOTE_READY', count: counts.AUTO_PROMOTE_READY || 0 },
    { name: 'NEEDS_REVIEW', count: counts.NEEDS_REVIEW || 0 },
    { name: 'NEW_CANDIDATE', count: counts.NEW_CANDIDATE || 0 }
  ];

  decisions.sort(function(a, b) {
    return b.count - a.count;
  });

  return decisions[0].count > 0 ? decisions[0].name : 'NO_RECORDS';
}

function sciipDetermine2740_RecommendedNextAction_(summary) {
  if (!summary || !summary.recordsAssessed) {
    return 'Run 2730_SuperSheetDataQualityProcessor after loading SuperSheet / Bridge rows.';
  }

  if (summary.newCandidate > 0 || summary.needsReview > 0) {
    return 'Route non-auto-promote records to approval and candidate review before promotion.';
  }

  return 'Proceed to matching and promotion processors with quality ledger available for audit.';
}

function sciip2740_SummaryBusinessKeyExists_(targetSheetName, businessKey) {
  var records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(targetSheetName);

  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === String(businessKey || '').trim();
  });
}

function sciipAppend2740_SuperSheetDataQualityRuntimeLedger_(sheetName, headers, row) {
  SCIIP_RUNTIME_SHEET_FACTORY.appendObject(sheetName, headers, row);
}

/**
 * Standalone validation test.
 */
function sciipTest2740_SuperSheetDataQualityLedgerProcessor() {
  var result = sciipRun2740_SuperSheetDataQualityLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2740_SuperSheetDataQualityLedgerProcessor',
    result: result
  }));

  return result;
}
