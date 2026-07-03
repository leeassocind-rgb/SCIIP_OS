/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Production Intake
 * 2820_SuperSheetImportReadinessLedgerProcessor
 *
 * SUPERSHEET_IMPORT_READINESS → SUPERSHEET_IMPORT_READINESS_LEDGER_SUMMARY
 *
 * Creates a durable ledger summary from SuperSheet import
 * readiness outcomes produced by 2810.
 *******************************************************/

function sciipGet2820_SuperSheetImportReadinessLedgerProcessorName_() {
  return '2820_SuperSheetImportReadinessLedger';
}

function sciipGet2820_SuperSheetImportReadinessLedgerHeaders_() {
  return [
    'Ledger_Summary_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Ready_For_Import_Count',
    'Review_Required_Count',
    'Candidate_Count',
    'Average_Ready_Percent',
    'Dominant_Readiness_Status',
    'Dominant_Import_Directive',
    'Import_Readiness_Posture',
    'Ledger_Status',
    'Recommended_Next_Action',
    'Created_At',
    'Processor',
    'Transaction_Id',
    'Summary_JSON'
  ];
}

function sciipEnsure2820_SuperSheetImportReadinessLedgerSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'SUPERSHEET_IMPORT_READINESS_LEDGER_SUMMARY',
    sciipGet2820_SuperSheetImportReadinessLedgerHeaders_()
  );
}

function sciipRun2820_SuperSheetImportReadinessLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet2820_SuperSheetImportReadinessLedgerProcessorName_(),
    action: 'SUPERSHEET_IMPORT_READINESS_LEDGER_SUMMARY',
    sourceSheet: 'SUPERSHEET_IMPORT_READINESS',
    targetSheet: 'SUPERSHEET_IMPORT_READINESS_LEDGER_SUMMARY',
    ledgerSheet: 'SUPERSHEET_IMPORT_READINESS_LEDGER_RUNTIME_LEDGER',

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
        summary: 'SuperSheet import readiness ledger summary payload created.',
        refs: {
          migrationVersion: 'v5.4.0',
          processorMigrated: true,
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          inputSheets: [definition.sourceSheet],
          upstreamProcessor: '2810_SuperSheetImportReadiness'
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
      const ledgerBusinessKey = 'SUPERSHEET_IMPORT_READINESS_LEDGER|' + ledgerDate;

      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet2820_SuperSheetImportReadinessLedgerProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            importReadinessLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 2810_SuperSheetImportReadinessProcessor after 2800 creates routing ledger summaries.'
          })
        });
      }

      if (sciip2820_BusinessKeyExists_(definition.targetSheet, ledgerBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet2820_SuperSheetImportReadinessLedgerProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            importReadinessLedgerStatus: 'DUPLICATE_SKIPPED',
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const latestRecords = sciip2820_FilterLatestDateRecords_(sourceRecords);
      const summary = sciip2820_SummarizeReadinessRecords_(latestRecords);

      const row = [
        'SUPERSHEET_IMPORT_READINESS_LEDGER_SUMMARY_' + Utilities.getUuid(),
        ledgerBusinessKey,
        ledgerDate,
        definition.sourceSheet,
        latestRecords.length,
        summary.readyForImportCount,
        summary.reviewRequiredCount,
        summary.candidateCount,
        summary.averageReadyPercent,
        summary.dominantReadinessStatus,
        summary.dominantImportDirective,
        summary.importReadinessPosture,
        summary.ledgerStatus,
        sciip2820_DetermineNextAction_(summary),
        new Date().toISOString(),
        sciipGet2820_SuperSheetImportReadinessLedgerProcessorName_(),
        transaction.transactionId,
        JSON.stringify(summary)
      ];

      const sheet = sciipEnsure2820_SuperSheetImportReadinessLedgerSheet_();
      sheet.appendRow(row);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet2820_SuperSheetImportReadinessLedgerProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: latestRecords.length,
        message: JSON.stringify({
          importReadinessLedgerStatus: summary.ledgerStatus,
          ledgerBusinessKey: ledgerBusinessKey,
          sourceRecordsReviewed: latestRecords.length,
          readyForImportCount: summary.readyForImportCount,
          reviewRequiredCount: summary.reviewRequiredCount,
          candidateCount: summary.candidateCount,
          averageReadyPercent: summary.averageReadyPercent,
          importReadinessPosture: summary.importReadinessPosture,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciip2820_BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKey || key.indexOf(businessKey + '|') === 0;
  });
}

function sciip2820_FilterLatestDateRecords_(records) {
  if (!records || !records.length) return [];

  const dated = records.map(function(record) {
    return {
      record: record,
      dateKey: sciip2820_ResolveRecordDate_(record)
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

function sciip2820_ResolveRecordDate_(record) {
  const fields = ['Assessment_Date', 'Readiness_Date', 'Ledger_Date', 'Created_At', 'Completed_At'];
  for (let i = 0; i < fields.length; i++) {
    const normalized = sciip2820_NormalizeDate_(record[fields[i]]);
    if (normalized) return normalized;
  }
  return '';
}

function sciip2820_NormalizeDate_(value) {
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

function sciip2820_SummarizeReadinessRecords_(records) {
  const summary = {
    recordsAssessed: records.length,
    readyForImportCount: 0,
    reviewRequiredCount: 0,
    candidateCount: 0,
    readyPercentTotal: 0,
    readyPercentSamples: 0,
    averageReadyPercent: 0,
    readinessStatusCounts: {},
    importDirectiveCounts: {},
    dominantReadinessStatus: 'NONE',
    dominantImportDirective: 'NONE',
    importReadinessPosture: 'NO_READINESS_RECORDS',
    ledgerStatus: 'NO_READINESS_RECORDS'
  };

  records.forEach(function(record) {
    const status = String(record.Readiness_Status || record.Import_Readiness_Status || record.Status || 'UNKNOWN').trim() || 'UNKNOWN';
    const directive = String(record.Import_Directive || record.Directive || 'UNKNOWN').trim() || 'UNKNOWN';

    sciip2820_Increment_(summary.readinessStatusCounts, status);
    sciip2820_Increment_(summary.importDirectiveCounts, directive);

    summary.readyForImportCount += Number(record.Ready_For_Import_Count || 0);
    summary.reviewRequiredCount += Number(record.Review_Required_Count || 0);
    summary.candidateCount += Number(record.Candidate_Count || 0);

    const readyPercent = Number(record.Ready_Percent || record.Readiness_Percent || 0);
    if (!isNaN(readyPercent) && readyPercent > 0) {
      summary.readyPercentTotal += readyPercent;
      summary.readyPercentSamples += 1;
    }
  });

  summary.averageReadyPercent = summary.readyPercentSamples
    ? Math.round((summary.readyPercentTotal / summary.readyPercentSamples) * 100) / 100
    : 0;

  summary.dominantReadinessStatus = sciip2820_DominantKey_(summary.readinessStatusCounts) || 'NONE';
  summary.dominantImportDirective = sciip2820_DominantKey_(summary.importDirectiveCounts) || 'NONE';
  summary.importReadinessPosture = sciip2820_DetermineReadinessPosture_(summary);
  summary.ledgerStatus = summary.recordsAssessed ? 'IMPORT_READINESS_LEDGER_RECORDED' : 'NO_READINESS_RECORDS';

  return summary;
}

function sciip2820_DetermineReadinessPosture_(summary) {
  if (!summary.recordsAssessed) return 'NO_READINESS_RECORDS';
  if (summary.dominantImportDirective === 'ALLOW_CONTROLLED_IMPORT' || summary.dominantReadinessStatus === 'READY_FOR_IMPORT') {
    return 'IMPORT_READY';
  }
  if (summary.readyForImportCount > 0 && (summary.reviewRequiredCount > 0 || summary.candidateCount > 0)) {
    return 'PARTIAL_IMPORT_READY_REVIEW_REQUIRED';
  }
  if (summary.reviewRequiredCount > 0 || summary.candidateCount > 0) {
    return 'IMPORT_REVIEW_REQUIRED';
  }
  return 'IMPORT_NOT_READY_OR_UNCLASSIFIED';
}

function sciip2820_DetermineNextAction_(summary) {
  if (!summary.recordsAssessed) {
    return 'Run 2810_SuperSheetImportReadinessProcessor after 2800 creates routing ledger summaries.';
  }
  if (summary.importReadinessPosture === 'IMPORT_READY') {
    return 'Proceed to controlled SuperSheet import activation.';
  }
  if (summary.importReadinessPosture === 'PARTIAL_IMPORT_READY_REVIEW_REQUIRED') {
    return 'Separate ready records from review/candidate records before import activation.';
  }
  if (summary.importReadinessPosture === 'IMPORT_REVIEW_REQUIRED') {
    return 'Resolve review/candidate records before import activation.';
  }
  return 'Review SuperSheet import readiness before downstream action.';
}

function sciip2820_Increment_(counts, key) {
  counts[key] = Number(counts[key] || 0) + 1;
}

function sciip2820_DominantKey_(counts) {
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

function sciipTest2820_SuperSheetImportReadinessLedgerProcessor() {
  const result = sciipRun2820_SuperSheetImportReadinessLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2820_SuperSheetImportReadinessLedgerProcessor',
    result: result
  }));

  return result;
}
