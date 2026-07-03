/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Production Intake
 * 2800_SuperSheetPromotionRoutingLedgerProcessor
 *
 * SUPERSHEET_PROMOTION_ROUTING → SUPERSHEET_PROMOTION_ROUTING_LEDGER_SUMMARY
 *
 * Creates a durable ledger summary from SuperSheet promotion
 * routing outcomes produced by 2790.
 *******************************************************/

function sciipGet2800_SuperSheetPromotionRoutingLedgerProcessorName_() {
  return '2800_SuperSheetPromotionRoutingLedger';
}

function sciipGet2800_SuperSheetPromotionRoutingLedgerHeaders_() {
  return [
    'Ledger_Summary_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Auto_Promote_Count',
    'Needs_Review_Count',
    'New_Candidate_Count',
    'Hold_Count',
    'Dominant_Routing_Status',
    'Dominant_Routing_Decision',
    'Routing_Posture',
    'Ledger_Status',
    'Recommended_Next_Action',
    'Created_At',
    'Processor',
    'Transaction_Id',
    'Summary_JSON'
  ];
}

function sciipEnsure2800_SuperSheetPromotionRoutingLedgerSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'SUPERSHEET_PROMOTION_ROUTING_LEDGER_SUMMARY',
    sciipGet2800_SuperSheetPromotionRoutingLedgerHeaders_()
  );
}

function sciipRun2800_SuperSheetPromotionRoutingLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet2800_SuperSheetPromotionRoutingLedgerProcessorName_(),
    action: 'SUPERSHEET_PROMOTION_ROUTING_LEDGER_SUMMARY',
    sourceSheet: 'SUPERSHEET_PROMOTION_ROUTING',
    targetSheet: 'SUPERSHEET_PROMOTION_ROUTING_LEDGER_SUMMARY',
    ledgerSheet: 'SUPERSHEET_PROMOTION_ROUTING_LEDGER_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary: 'SuperSheet promotion routing ledger summary payload created.',
        refs: {
          migrationVersion: 'v5.4.0',
          processorMigrated: true,
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          inputSheets: [definition.sourceSheet],
          upstreamProcessor: '2790_SuperSheetPromotionRouting'
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const ledgerDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const ledgerBusinessKey = 'SUPERSHEET_PROMOTION_ROUTING_LEDGER|' + ledgerDate;

      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet2800_SuperSheetPromotionRoutingLedgerProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            promotionRoutingLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 2790_SuperSheetPromotionRoutingProcessor after 2780 creates routing source records.'
          })
        });
      }

      if (sciip2800_BusinessKeyExists_(definition.targetSheet, ledgerBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet2800_SuperSheetPromotionRoutingLedgerProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            promotionRoutingLedgerStatus: 'DUPLICATE_SKIPPED',
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const latestRecords = sciip2800_FilterLatestDateRecords_(sourceRecords);
      const summary = sciip2800_SummarizeRoutingRecords_(latestRecords);

      const row = [
        'SUPERSHEET_PROMOTION_ROUTING_LEDGER_SUMMARY_' + Utilities.getUuid(),
        ledgerBusinessKey,
        ledgerDate,
        definition.sourceSheet,
        latestRecords.length,
        summary.autoPromoteCount,
        summary.needsReviewCount,
        summary.newCandidateCount,
        summary.holdCount,
        summary.dominantRoutingStatus,
        summary.dominantRoutingDecision,
        summary.routingPosture,
        summary.ledgerStatus,
        sciip2800_DetermineNextAction_(summary),
        new Date().toISOString(),
        sciipGet2800_SuperSheetPromotionRoutingLedgerProcessorName_(),
        transaction.transactionId,
        JSON.stringify(summary)
      ];

      const sheet = sciipEnsure2800_SuperSheetPromotionRoutingLedgerSheet_();
      sheet.appendRow(row);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet2800_SuperSheetPromotionRoutingLedgerProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: latestRecords.length,
        message: JSON.stringify({
          promotionRoutingLedgerStatus: summary.ledgerStatus,
          ledgerBusinessKey: ledgerBusinessKey,
          sourceRecordsReviewed: latestRecords.length,
          autoPromoteCount: summary.autoPromoteCount,
          needsReviewCount: summary.needsReviewCount,
          newCandidateCount: summary.newCandidateCount,
          holdCount: summary.holdCount,
          routingPosture: summary.routingPosture,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciip2800_BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKey || key.indexOf(businessKey + '|') === 0;
  });
}

function sciip2800_FilterLatestDateRecords_(records) {
  if (!records || !records.length) return [];

  const dated = records.map(function(record) {
    return {
      record: record,
      dateKey: sciip2800_ResolveRecordDate_(record)
    };
  }).filter(function(item) {
    return item.dateKey;
  });

  if (!dated.length) return records;

  const dates = dated.map(function(item) { return item.dateKey; }).sort();
  const latest = dates[dates.length - 1];

  return dated.filter(function(item) {
    return item.dateKey === latest;
  }).map(function(item) {
    return item.record;
  });
}

function sciip2800_ResolveRecordDate_(record) {
  const fields = ['Routing_Date', 'Ledger_Date', 'Gate_Date', 'Created_At', 'Completed_At'];
  for (let i = 0; i < fields.length; i++) {
    const normalized = sciip2800_NormalizeDate_(record[fields[i]]);
    if (normalized) return normalized;
  }
  return '';
}

function sciip2800_NormalizeDate_(value) {
  if (!value) return '';
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  const text = String(value).trim();
  const match = text.match(/^\d{4}-\d{2}-\d{2}/);
  if (match) return match[0];
  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return '';
}

function sciip2800_SummarizeRoutingRecords_(records) {
  const summary = {
    recordsAssessed: records.length,
    autoPromoteCount: 0,
    needsReviewCount: 0,
    newCandidateCount: 0,
    holdCount: 0,
    routingStatusCounts: {},
    routingDecisionCounts: {},
    dominantRoutingStatus: 'NONE',
    dominantRoutingDecision: 'NONE',
    routingPosture: 'NO_ROUTING_RECORDS',
    ledgerStatus: 'NO_ROUTING_RECORDS'
  };

  records.forEach(function(record) {
    const status = String(record.Routing_Status || record.Status || 'UNKNOWN').trim() || 'UNKNOWN';
    const decision = String(record.Routing_Decision || record.Promotion_Decision || 'UNKNOWN').trim() || 'UNKNOWN';

    sciip2800_Increment_(summary.routingStatusCounts, status);
    sciip2800_Increment_(summary.routingDecisionCounts, decision);

    summary.autoPromoteCount += Number(record.Auto_Promote_Count || 0);
    summary.needsReviewCount += Number(record.Needs_Review_Count || 0);
    summary.newCandidateCount += Number(record.New_Candidate_Count || 0);
    summary.holdCount += Number(record.Hold_Count || 0);
  });

  summary.dominantRoutingStatus = sciip2800_DominantKey_(summary.routingStatusCounts) || 'NONE';
  summary.dominantRoutingDecision = sciip2800_DominantKey_(summary.routingDecisionCounts) || 'NONE';
  summary.routingPosture = sciip2800_DetermineRoutingPosture_(summary);
  summary.ledgerStatus = summary.recordsAssessed ? 'PROMOTION_ROUTING_LEDGER_RECORDED' : 'NO_ROUTING_RECORDS';

  return summary;
}

function sciip2800_DetermineRoutingPosture_(summary) {
  if (!summary.recordsAssessed) return 'NO_ROUTING_RECORDS';
  if (summary.holdCount > 0) return 'ROUTING_HELD_FOR_REVIEW';
  if (summary.needsReviewCount > 0 || summary.newCandidateCount > 0) return 'ROUTING_REVIEW_AND_CANDIDATE_WORKFLOWS';
  if (summary.autoPromoteCount > 0) return 'ROUTING_AUTO_PROMOTE_READY';
  return 'ROUTING_UNCLASSIFIED';
}

function sciip2800_DetermineNextAction_(summary) {
  if (!summary.recordsAssessed) {
    return 'Run 2790_SuperSheetPromotionRoutingProcessor after 2780 creates routing source records.';
  }
  if (summary.routingPosture === 'ROUTING_AUTO_PROMOTE_READY') {
    return 'Proceed to downstream auto-promotion workflow.';
  }
  if (summary.routingPosture === 'ROUTING_REVIEW_AND_CANDIDATE_WORKFLOWS') {
    return 'Route review records to manual approval and candidate records to candidate workflow.';
  }
  if (summary.routingPosture === 'ROUTING_HELD_FOR_REVIEW') {
    return 'Hold promotion and resolve routing review conditions.';
  }
  return 'Review SuperSheet promotion routing posture before downstream action.';
}

function sciip2800_Increment_(counts, key) {
  counts[key] = Number(counts[key] || 0) + 1;
}

function sciip2800_DominantKey_(counts) {
  let dominant = '';
  let dominantCount = -1;
  Object.keys(counts || {}).forEach(function(key) {
    const count = Number(counts[key] || 0);
    if (count > dominantCount) {
      dominant = key;
      dominantCount = count;
    }
  });
  return dominant;
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest2800_SuperSheetPromotionRoutingLedgerProcessor() {
  const result = sciipRun2800_SuperSheetPromotionRoutingLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2800_SuperSheetPromotionRoutingLedgerProcessor',
    result: result
  }));

  return result;
}
