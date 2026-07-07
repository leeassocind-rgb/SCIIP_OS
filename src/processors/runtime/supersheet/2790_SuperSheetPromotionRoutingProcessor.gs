/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Production Intake
 * 2790_SuperSheetPromotionRoutingProcessor
 *
 * SUPERSHEET_PROMOTION_GATE_LEDGER_SUMMARY → SUPERSHEET_PROMOTION_ROUTING
 *
 * Routes certified SuperSheet promotion gate outcomes into
 * downstream promotion, review, or candidate workflows.
 *******************************************************/

function sciipGet2790_SuperSheetPromotionRoutingProcessorName_() {
  return '2790_SuperSheetPromotionRouting';
}

function sciipGet2790_SuperSheetPromotionRoutingHeaders_() {
  return [
    'Routing_ID',
    'Business_Key',
    'Routing_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Routing_Status',
    'Auto_Promote_Count',
    'Needs_Review_Count',
    'New_Candidate_Count',
    'Hold_Count',
    'Routing_Decision',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure2790_SuperSheetPromotionRoutingSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'SUPERSHEET_PROMOTION_ROUTING',
    sciipGet2790_SuperSheetPromotionRoutingHeaders_()
  );
}

function sciipRun2790_SuperSheetPromotionRoutingProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet2790_SuperSheetPromotionRoutingProcessorName_(),
    action: 'SUPERSHEET_PROMOTION_ROUTING_BUILD',
    sourceSheet: 'SUPERSHEET_PROMOTION_GATE_LEDGER_SUMMARY',
    targetSheet: 'SUPERSHEET_PROMOTION_ROUTING',
    ledgerSheet: 'SUPERSHEET_PROMOTION_ROUTING_RUNTIME_LEDGER',

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
        summary: 'SuperSheet promotion routing payload created.',
        refs: {
          migrationVersion: 'v5.4.0',
          processorMigrated: true,
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          inputSheets: [definition.sourceSheet]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const routingDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const routingBusinessKey = 'SUPERSHEET_PROMOTION_ROUTING|' + routingDate;

      if (sciip2790_BusinessKeyExists_(definition.targetSheet, routingBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet2790_SuperSheetPromotionRoutingProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            promotionRoutingStatus: 'DUPLICATE_SKIPPED',
            routingBusinessKey: routingBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet2790_SuperSheetPromotionRoutingProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            promotionRoutingStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 2780_SuperSheetPromotionGateLedgerProcessor after 2770 creates gate records.'
          })
        });
      }

      const latestRecords = sciip2790_FilterLatestDateRecords_(sourceRecords);
      const counts = sciip2790_CountRouteClasses_(latestRecords);
      const decision = sciip2790_DetermineRoutingDecision_(counts);

      const row = [
        'SUPERSHEET_PROMOTION_ROUTING_' + Utilities.getUuid(),
        routingBusinessKey,
        routingDate,
        definition.sourceSheet,
        latestRecords.length,
        decision.status,
        counts.autoPromote,
        counts.needsReview,
        counts.newCandidate,
        counts.hold,
        decision.decision,
        decision.nextAction,
        new Date().toISOString(),
        sciipGet2790_SuperSheetPromotionRoutingProcessorName_()
      ];

      const sheet = sciipEnsure2790_SuperSheetPromotionRoutingSheet_();
      sheet.appendRow(row);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet2790_SuperSheetPromotionRoutingProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: latestRecords.length,
        processed: 1,
        message: JSON.stringify({
          promotionRoutingStatus: decision.status,
          routingBusinessKey: routingBusinessKey,
          sourceRecordsReviewed: latestRecords.length,
          autoPromoteCount: counts.autoPromote,
          needsReviewCount: counts.needsReview,
          newCandidateCount: counts.newCandidate,
          holdCount: counts.hold,
          routingDecision: decision.decision,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciip2790_BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKey || key.indexOf(businessKey + '|') === 0;
  });
}

function sciip2790_FilterLatestDateRecords_(records) {
  if (!records || !records.length) return [];

  const dateFields = [
    'Ledger_Date',
    'Gate_Date',
    'Summary_Date',
    'Created_At',
    'Completed_At'
  ];

  const dated = records.map(function(record) {
    return {
      record: record,
      dateKey: sciip2790_ResolveRecordDate_(record, dateFields)
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

function sciip2790_ResolveRecordDate_(record, fields) {
  for (let i = 0; i < fields.length; i++) {
    const value = record[fields[i]];
    const normalized = sciip2790_NormalizeDate_(value);
    if (normalized) return normalized;
  }
  return '';
}

function sciip2790_NormalizeDate_(value) {
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

function sciip2790_CountRouteClasses_(records) {
  const counts = {
    autoPromote: 0,
    needsReview: 0,
    newCandidate: 0,
    hold: 0
  };

  records.forEach(function(record) {
    const text = [
      record.Routing_Decision,
      record.Gate_Decision,
      record.Promotion_Decision,
      record.Certification_Status,
      record.Quality_Status,
      record.Status,
      record.Message
    ].map(function(value) {
      return String(value || '').toUpperCase();
    }).join(' ');

    if (text.indexOf('AUTO_PROMOTE') !== -1 || text.indexOf('AUTO PROMOTE') !== -1 || text.indexOf('PROMOTE_READY') !== -1) {
      counts.autoPromote += 1;
    } else if (text.indexOf('NEW_CANDIDATE') !== -1 || text.indexOf('NEW CANDIDATE') !== -1 || text.indexOf('CANDIDATE') !== -1) {
      counts.newCandidate += 1;
    } else if (text.indexOf('REVIEW') !== -1 || text.indexOf('NEEDS_REVIEW') !== -1) {
      counts.needsReview += 1;
    } else {
      counts.hold += 1;
    }
  });

  return counts;
}

function sciip2790_DetermineRoutingDecision_(counts) {
  const total = counts.autoPromote + counts.needsReview + counts.newCandidate + counts.hold;

  if (!total) {
    return {
      status: 'NO_ROUTEABLE_RECORDS',
      decision: 'HOLD_ALL',
      nextAction: 'No routeable SuperSheet promotion gate records were found.'
    };
  }

  if (counts.hold > 0) {
    return {
      status: 'ROUTING_REVIEW_REQUIRED',
      decision: 'HOLD_AND_REVIEW',
      nextAction: 'Review held promotion gate records before releasing to downstream promotion.'
    };
  }

  if (counts.needsReview > 0 || counts.newCandidate > 0) {
    return {
      status: 'ROUTED_WITH_REVIEW_ITEMS',
      decision: 'ROUTE_TO_REVIEW_AND_CANDIDATE_WORKFLOWS',
      nextAction: 'Route review items to manual review and candidate records to candidate workflow.'
    };
  }

  return {
    status: 'ROUTED_AUTO_PROMOTE_READY',
    decision: 'ROUTE_TO_AUTO_PROMOTION',
    nextAction: 'Route certified records to downstream auto-promotion workflow.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest2790_SuperSheetPromotionRoutingProcessor() {
  const result = sciipRun2790_SuperSheetPromotionRoutingProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2790_SuperSheetPromotionRoutingProcessor',
    result: result
  }));

  return result;
}
