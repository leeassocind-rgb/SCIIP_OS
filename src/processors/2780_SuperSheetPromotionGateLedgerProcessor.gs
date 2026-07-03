/**
 * SCIIP_OS v5.4
 * SuperSheet Promotion Gate Ledger Processor
 * File: 2780_SuperSheetPromotionGateLedgerProcessor.gs
 *
 * Processor: 2780_SuperSheetPromotionGateLedger
 *
 * Purpose:
 * Creates a durable ledger summary from SUPERSHEET_PROMOTION_GATE
 * records produced by 2770_SuperSheetPromotionGateProcessor.
 *
 * This processor is non-destructive and skip-safe.
 */

function sciipRun2780_SuperSheetPromotionGateLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2780_SuperSheetPromotionGateLedger',
    action: 'SUPERSHEET_PROMOTION_GATE_LEDGER_SUMMARY',
    sourceSheet: 'SUPERSHEET_PROMOTION_GATE',
    targetSheet: 'SUPERSHEET_PROMOTION_GATE_LEDGER_SUMMARY',
    ledgerSheet: 'SUPERSHEET_PROMOTION_GATE_LEDGER_SUMMARY_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      var gateRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: gateRecords.length,
        outputCount: gateRecords.length ? 1 : 0,
        summary: 'SuperSheet promotion gate ledger summary payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          version: 'v5.4',
          qualitySurface: 'SUPERSHEET_IMPORT_FIREWALL_PROMOTION_GATE_LEDGER',
          upstreamProcessor: '2770_SuperSheetPromotionGate'
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
      var summaryHeaders = sciipGet2780_SuperSheetPromotionGateLedgerSummaryHeaders_();
      var runtimeLedgerHeaders = sciipGet2780_SuperSheetPromotionGateRuntimeLedgerHeaders_();

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, summaryHeaders);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, runtimeLedgerHeaders);

      var gateRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      if (!gateRecords || gateRecords.length === 0) {
        var skippedResult = SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            promotionGateLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 2770_SuperSheetPromotionGateProcessor after 2760 creates certification records.'
          })
        });

        sciipAppend2780_SuperSheetPromotionGateRuntimeLedger_(
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
            Gate_Date: '',
            Open_Gates: 0,
            Review_Required_Gates: 0,
            Closed_Gates: 0,
            Auto_Promotion_Allowed: 0,
            Matching_Allowed: 0,
            Knowledge_Graph_Write_Allowed: 0,
            Transaction_Id: transaction.transactionId,
            Result_JSON: skippedResult
          }
        );

        return skippedResult;
      }

      var gateDate = sciipResolve2780_LatestGateDate_(gateRecords) || SCIIP_RUNTIME.getDateKey({});
      var ledgerBusinessKey = 'SUPERSHEET_PROMOTION_GATE_LEDGER|' + gateDate;

      if (sciip2780_SummaryBusinessKeyExists_(definition.targetSheet, ledgerBusinessKey)) {
        var duplicateResult = SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: gateRecords.length,
          processed: 0,
          message: JSON.stringify({
            promotionGateLedgerStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            sourceRecordsRead: gateRecords.length,
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });

        sciipAppend2780_SuperSheetPromotionGateRuntimeLedger_(
          definition.ledgerSheet,
          runtimeLedgerHeaders,
          {
            Timestamp: new Date(),
            Processor: context.processor,
            Business_Key: context.businessKey,
            Ledger_Status: 'DUPLICATE_SKIPPED',
            Source_Sheet: definition.sourceSheet,
            Source_Record_Count: gateRecords.length,
            Summary_Records_Created: 0,
            Gate_Date: gateDate,
            Open_Gates: 0,
            Review_Required_Gates: 0,
            Closed_Gates: 0,
            Auto_Promotion_Allowed: 0,
            Matching_Allowed: 0,
            Knowledge_Graph_Write_Allowed: 0,
            Transaction_Id: transaction.transactionId,
            Result_JSON: duplicateResult
          }
        );

        return duplicateResult;
      }

      var recordsForDate = sciipFilter2780_GateRecordsByGateDate_(gateRecords, gateDate);
      var summary = sciipSummarize2780_SuperSheetPromotionGateRecords_(recordsForDate);

      var summaryRecord = {
        Ledger_Summary_ID: 'SUPERSHEET_PROMOTION_GATE_LEDGER_SUMMARY_' + Utilities.getUuid(),
        Business_Key: ledgerBusinessKey,
        Ledger_Date: gateDate,
        Source_Sheet: definition.sourceSheet,
        Source_Record_Count: recordsForDate.length,
        Open_Gates: summary.openGates,
        Review_Required_Gates: summary.reviewRequiredGates,
        Closed_Gates: summary.closedGates,
        Auto_Promotion_Allowed: summary.autoPromotionAllowed,
        Matching_Allowed: summary.matchingAllowed,
        Manual_Review_Required: summary.manualReviewRequired,
        Knowledge_Graph_Write_Allowed: summary.knowledgeGraphWriteAllowed,
        Low_Risk_Gates: summary.lowRiskGates,
        Medium_Risk_Gates: summary.mediumRiskGates,
        High_Risk_Gates: summary.highRiskGates,
        Dominant_Gate_Status: summary.dominantGateStatus,
        Dominant_Gate_Decision: summary.dominantGateDecision,
        Promotion_Posture: summary.promotionPosture,
        Ledger_Status: summary.recordsAssessed > 0 ? 'PROMOTION_GATE_LEDGER_RECORDED' : 'NO_GATE_RECORDS_FOR_DATE',
        Recommended_Next_Action: sciipDetermine2780_RecommendedNextAction_(summary),
        Created_At: new Date().toISOString(),
        Processor: context.processor,
        Transaction_Id: transaction.transactionId,
        Summary_JSON: summary
      };

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, summaryHeaders, summaryRecord);

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: gateRecords.length,
        processed: recordsForDate.length,
        skippedDuplicate: 0,
        message: JSON.stringify({
          promotionGateLedgerStatus: summaryRecord.Ledger_Status,
          version: 'v5.4',
          sourceSheet: definition.sourceSheet,
          sourceRecordsRead: gateRecords.length,
          recordsAssessedForLedgerDate: recordsForDate.length,
          ledgerDate: gateDate,
          ledgerBusinessKey: ledgerBusinessKey,
          openGates: summary.openGates,
          reviewRequiredGates: summary.reviewRequiredGates,
          closedGates: summary.closedGates,
          promotionPosture: summary.promotionPosture,
          transactionId: transaction.transactionId,
          nextProcessorRecommendation: summaryRecord.Recommended_Next_Action
        })
      });

      sciipAppend2780_SuperSheetPromotionGateRuntimeLedger_(
        definition.ledgerSheet,
        runtimeLedgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: summaryRecord.Ledger_Status,
          Source_Sheet: definition.sourceSheet,
          Source_Record_Count: gateRecords.length,
          Summary_Records_Created: 1,
          Gate_Date: gateDate,
          Open_Gates: summary.openGates,
          Review_Required_Gates: summary.reviewRequiredGates,
          Closed_Gates: summary.closedGates,
          Auto_Promotion_Allowed: summary.autoPromotionAllowed,
          Matching_Allowed: summary.matchingAllowed,
          Knowledge_Graph_Write_Allowed: summary.knowledgeGraphWriteAllowed,
          Transaction_Id: transaction.transactionId,
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          sourceSheet: definition.sourceSheet,
          sourceRecordsRead: gateRecords.length,
          recordsAssessedForLedgerDate: recordsForDate.length,
          summary: summary,
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.4 SuperSheet promotion gate ledger completed.'
      });

      return result;
    }
  });
}

function sciipGet2780_SuperSheetPromotionGateLedgerSummaryHeaders_() {
  return [
    'Ledger_Summary_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Open_Gates',
    'Review_Required_Gates',
    'Closed_Gates',
    'Auto_Promotion_Allowed',
    'Matching_Allowed',
    'Manual_Review_Required',
    'Knowledge_Graph_Write_Allowed',
    'Low_Risk_Gates',
    'Medium_Risk_Gates',
    'High_Risk_Gates',
    'Dominant_Gate_Status',
    'Dominant_Gate_Decision',
    'Promotion_Posture',
    'Ledger_Status',
    'Recommended_Next_Action',
    'Created_At',
    'Processor',
    'Transaction_Id',
    'Summary_JSON'
  ];
}

function sciipGet2780_SuperSheetPromotionGateRuntimeLedgerHeaders_() {
  return [
    'Timestamp',
    'Processor',
    'Business_Key',
    'Ledger_Status',
    'Source_Sheet',
    'Source_Record_Count',
    'Summary_Records_Created',
    'Gate_Date',
    'Open_Gates',
    'Review_Required_Gates',
    'Closed_Gates',
    'Auto_Promotion_Allowed',
    'Matching_Allowed',
    'Knowledge_Graph_Write_Allowed',
    'Transaction_Id',
    'Result_JSON'
  ];
}

function sciipResolve2780_LatestGateDate_(records) {
  var dates = [];

  records.forEach(function(record) {
    var dateValue = sciipNormalize2780_DateValue_(record.Gate_Date);
    if (dateValue) dates.push(dateValue);
  });

  if (!dates.length) return null;

  dates.sort();
  return dates[dates.length - 1];
}

function sciipFilter2780_GateRecordsByGateDate_(records, gateDate) {
  return records.filter(function(record) {
    return sciipNormalize2780_DateValue_(record.Gate_Date) === gateDate;
  });
}

function sciipNormalize2780_DateValue_(value) {
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

function sciipSummarize2780_SuperSheetPromotionGateRecords_(records) {
  var summary = {
    recordsAssessed: records.length,
    openGates: 0,
    reviewRequiredGates: 0,
    closedGates: 0,
    autoPromotionAllowed: 0,
    matchingAllowed: 0,
    manualReviewRequired: 0,
    knowledgeGraphWriteAllowed: 0,
    lowRiskGates: 0,
    mediumRiskGates: 0,
    highRiskGates: 0,
    gateStatusCounts: {},
    gateDecisionCounts: {},
    dominantGateStatus: 'NONE',
    dominantGateDecision: 'NONE',
    promotionPosture: 'NO_GATE_RECORDS'
  };

  records.forEach(function(record) {
    var gateStatus = String(record.Gate_Status || '').trim() || 'UNKNOWN';
    var gateDecision = String(record.Gate_Decision || '').trim() || 'UNKNOWN';
    var gateRiskLevel = String(record.Gate_Risk_Level || '').trim().toUpperCase() || 'UNKNOWN';

    sciipIncrement2780_Count_(summary.gateStatusCounts, gateStatus);
    sciipIncrement2780_Count_(summary.gateDecisionCounts, gateDecision);

    if (gateStatus === 'OPEN') summary.openGates++;
    else if (gateStatus.indexOf('REVIEW') !== -1 || gateDecision.indexOf('REVIEW') !== -1) summary.reviewRequiredGates++;
    else summary.closedGates++;

    if (String(record.Auto_Promotion_Allowed || '').trim().toUpperCase() === 'YES') summary.autoPromotionAllowed++;
    if (String(record.Matching_Allowed || '').trim().toUpperCase() === 'YES') summary.matchingAllowed++;
    if (String(record.Manual_Review_Required || '').trim().toUpperCase() === 'YES') summary.manualReviewRequired++;
    if (String(record.Knowledge_Graph_Write_Allowed || '').trim().toUpperCase() === 'YES') summary.knowledgeGraphWriteAllowed++;

    if (gateRiskLevel === 'LOW') summary.lowRiskGates++;
    else if (gateRiskLevel.indexOf('MEDIUM') !== -1 || gateRiskLevel === 'UNKNOWN') summary.mediumRiskGates++;
    else summary.highRiskGates++;
  });

  summary.dominantGateStatus = sciipDetermine2780_DominantKey_(summary.gateStatusCounts) || 'NONE';
  summary.dominantGateDecision = sciipDetermine2780_DominantKey_(summary.gateDecisionCounts) || 'NONE';
  summary.promotionPosture = sciipDetermine2780_PromotionPosture_(summary);

  return summary;
}

function sciipDetermine2780_PromotionPosture_(summary) {
  if (!summary.recordsAssessed) return 'NO_GATE_RECORDS';
  if (summary.openGates > 0 && summary.autoPromotionAllowed > 0 && summary.knowledgeGraphWriteAllowed > 0) {
    return 'AUTO_PROMOTION_READY';
  }
  if (summary.matchingAllowed > 0 && summary.manualReviewRequired > 0) {
    return 'MATCHING_ALLOWED_REVIEW_REQUIRED';
  }
  if (summary.reviewRequiredGates > 0) return 'REVIEW_REQUIRED';
  return 'PROMOTION_BLOCKED';
}

function sciipDetermine2780_RecommendedNextAction_(summary) {
  if (!summary.recordsAssessed) {
    return 'Run 2770_SuperSheetPromotionGateProcessor after 2760 creates certification records.';
  }

  if (summary.promotionPosture === 'AUTO_PROMOTION_READY') {
    return 'Proceed to match engine and automatic promotion processors.';
  }

  if (summary.promotionPosture === 'MATCHING_ALLOWED_REVIEW_REQUIRED') {
    return 'Proceed to matching, but require manual approval before promotion or knowledge graph writes.';
  }

  if (summary.promotionPosture === 'REVIEW_REQUIRED') {
    return 'Resolve SuperSheet data quality review items before promotion.';
  }

  return 'Hold promotion and remediate SuperSheet source data quality issues.';
}

function sciipIncrement2780_Count_(counts, key) {
  counts[key] = Number(counts[key] || 0) + 1;
}

function sciipDetermine2780_DominantKey_(counts) {
  var dominant = '';
  var dominantCount = -1;

  Object.keys(counts || {}).forEach(function(key) {
    var count = Number(counts[key] || 0);
    if (count > dominantCount) {
      dominant = key;
      dominantCount = count;
    }
  });

  return dominant;
}

function sciip2780_SummaryBusinessKeyExists_(targetSheetName, businessKey) {
  var records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(targetSheetName);

  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === String(businessKey || '').trim();
  });
}

function sciipAppend2780_SuperSheetPromotionGateRuntimeLedger_(sheetName, headers, row) {
  SCIIP_RUNTIME_SHEET_FACTORY.appendObject(sheetName, headers, row);
}

/**
 * Standalone validation test.
 */
function sciipTest2780_SuperSheetPromotionGateLedgerProcessor() {
  var result = sciipRun2780_SuperSheetPromotionGateLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2780_SuperSheetPromotionGateLedgerProcessor',
    result: result
  }));

  return result;
}
