/*******************************************************
 * SCIIP_OS v5.x Runtime Processor
 * 2810_SuperSheetImportReadinessProcessor
 *
 * SUPERSHEET_PROMOTION_ROUTING_LEDGER_SUMMARY
 *   → SUPERSHEET_IMPORT_READINESS
 *******************************************************/

function sciipTest2810_SuperSheetImportReadinessProcessor() {
  const result = sciipRun2810_SuperSheetImportReadinessProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2810_SuperSheetImportReadinessProcessor',
    result: result
  }));

  return result;
}

function sciipRun2810_SuperSheetImportReadinessProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2810_SuperSheetImportReadiness',
    action: 'SUPERSHEET_IMPORT_READINESS_BUILD',
    sourceSheet: 'SUPERSHEET_PROMOTION_ROUTING_LEDGER_SUMMARY',
    targetSheet: 'SUPERSHEET_IMPORT_READINESS',
    ledgerSheet: 'SUPERSHEET_IMPORT_READINESS_RUNTIME_LEDGER',

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
        summary: 'SuperSheet import readiness payload created.',
        refs: {
          migrationVersion: 'v5.x',
          sourceSheet: definition.sourceSheet,
          targetSheet: definition.targetSheet
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            importReadinessStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 2800_SuperSheetPromotionRoutingLedgerProcessor after 2790 creates routing records.'
          })
        });
      }

      const sheet = sciipEnsure2810_SuperSheetImportReadinessSheet_();
      const latest = sourceRecords[sourceRecords.length - 1] || {};
      const assessmentDate = SCIIP_RUNTIME.getDateKey ? SCIIP_RUNTIME.getDateKey({}) : sciipFormatDateKey_(new Date());
      const importReadinessBusinessKey = 'SUPERSHEET_IMPORT_READINESS|' + assessmentDate;

      if (sciip2810_BusinessKeyExists_(definition.targetSheet, importReadinessBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            importReadinessStatus: 'DUPLICATE_SKIPPED',
            importReadinessBusinessKey: importReadinessBusinessKey,
            sourceRecordsReviewed: sourceRecords.length,
            transactionId: transaction.transactionId
          })
        });
      }

      const routedReady = sciip2810_CountByText_(sourceRecords, ['AUTO_PROMOTE', 'READY', 'APPROVED']);
      const routedReview = sciip2810_CountByText_(sourceRecords, ['REVIEW', 'HOLD', 'MANUAL']);
      const routedCandidate = sciip2810_CountByText_(sourceRecords, ['CANDIDATE', 'NEW']);
      const total = sourceRecords.length;
      const readyPct = total ? Math.round((routedReady / total) * 10000) / 100 : 0;

      const readinessStatus = readyPct >= 80 && routedReview === 0
        ? 'READY_FOR_IMPORT'
        : routedReady > 0
          ? 'PARTIAL_READY_REVIEW_REQUIRED'
          : 'NOT_READY_REVIEW_REQUIRED';

      sheet.appendRow([
        'SUPERSHEET_IMPORT_READINESS_' + Utilities.getUuid(),
        importReadinessBusinessKey,
        assessmentDate,
        definition.sourceSheet,
        total,
        routedReady,
        routedReview,
        routedCandidate,
        readyPct,
        readinessStatus,
        readinessStatus === 'READY_FOR_IMPORT' ? 'ALLOW_CONTROLLED_IMPORT' : 'DO_NOT_IMPORT_YET',
        new Date().toISOString(),
        context.processor
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: total,
        processed: 1,
        message: JSON.stringify({
          importReadinessStatus: readinessStatus,
          importReadinessBusinessKey: importReadinessBusinessKey,
          sourceRecordsReviewed: total,
          readyForImportCount: routedReady,
          reviewRequiredCount: routedReview,
          candidateCount: routedCandidate,
          readyPct: readyPct,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipEnsure2810_SuperSheetImportReadinessSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet('SUPERSHEET_IMPORT_READINESS', [
    'Import_Readiness_ID',
    'Business_Key',
    'Assessment_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Ready_For_Import_Count',
    'Review_Required_Count',
    'Candidate_Count',
    'Ready_Percent',
    'Readiness_Status',
    'Import_Directive',
    'Created_At',
    'Processor'
  ]);
}

function sciip2810_BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip2810_CountByText_(records, tokens) {
  return records.filter(function(record) {
    const text = JSON.stringify(record || {}).toUpperCase();
    return tokens.some(function(token) {
      return text.indexOf(token) !== -1;
    });
  }).length;
}
