/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Protection Layer
 * 2880_SuperSheetImportFinalCertificationLedgerProcessor
 *
 * SUPERSHEET_IMPORT_FINAL_CERTIFICATIONS → SUPERSHEET_IMPORT_FINAL_CERTIFICATION_LEDGER_SUMMARY
 *
 * Purpose:
 * Creates a durable ledger summary of final SuperSheet import
 * certification outcomes before production SuperSheet import,
 * promotion, or matching activity proceeds.
 *******************************************************/

function sciipGet2880_SuperSheetImportFinalCertificationLedgerProcessorName_() {
  return '2880_SuperSheetImportFinalCertificationLedger';
}

function sciipGet2880_SuperSheetImportFinalCertificationLedgerHeaders_() {
  return [
    'Ledger_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Certified_Count',
    'Conditional_Count',
    'Not_Certified_Count',
    'Pending_Count',
    'Ledger_Status',
    'Certification_Posture',
    'Ledger_Summary',
    'Next_Action',
    'Created_At',
    'Processor',
    'Transaction_Id',
    'Summary_JSON'
  ];
}

function sciipEnsure2880_SuperSheetImportFinalCertificationLedgerSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'SUPERSHEET_IMPORT_FINAL_CERTIFICATION_LEDGER_SUMMARY',
    sciipGet2880_SuperSheetImportFinalCertificationLedgerHeaders_()
  );
}

function sciipRun2880_SuperSheetImportFinalCertificationLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet2880_SuperSheetImportFinalCertificationLedgerProcessorName_(),
    action: 'SUPERSHEET_IMPORT_FINAL_CERTIFICATION_LEDGER_SUMMARY',
    sourceSheet: 'SUPERSHEET_IMPORT_FINAL_CERTIFICATIONS',
    targetSheet: 'SUPERSHEET_IMPORT_FINAL_CERTIFICATION_LEDGER_SUMMARY',
    ledgerSheet: 'SUPERSHEET_IMPORT_FINAL_CERTIFICATION_LEDGER_RUNTIME_LEDGER',

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
        summary: 'SuperSheet import final certification ledger runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          runtimeVersion: 'v5.4',
          originalProcessor: sciipGet2880_SuperSheetImportFinalCertificationLedgerProcessorName_(),
          inputSheets: [definition.sourceSheet],
          upstreamProcessor: '2870_SuperSheetImportFinalCertification'
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
      const ledgerBusinessKey = 'SUPERSHEET_IMPORT_FINAL_CERTIFICATION_LEDGER|' + ledgerDate;
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet2880_SuperSheetImportFinalCertificationLedgerProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            importFinalCertificationLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 2870_SuperSheetImportFinalCertificationProcessor after 2860 creates daily brief records.'
          })
        });
      }

      if (sciip2880_BusinessKeyExists_(definition.targetSheet, ledgerBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet2880_SuperSheetImportFinalCertificationLedgerProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            importFinalCertificationLedgerStatus: 'DUPLICATE_SKIPPED',
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const latestRecords = sciip2880_FilterLatestDateRecords_(sourceRecords);
      const summary = sciip2880_SummarizeFinalCertificationRecords_(latestRecords);
      const sheet = sciipEnsure2880_SuperSheetImportFinalCertificationLedgerSheet_();

      sheet.appendRow([
        'SUPERSHEET_IMPORT_FINAL_CERTIFICATION_LEDGER_' + Utilities.getUuid(),
        ledgerBusinessKey,
        ledgerDate,
        definition.sourceSheet,
        latestRecords.length,
        summary.certifiedCount,
        summary.conditionalCount,
        summary.notCertifiedCount,
        summary.pendingCount,
        summary.ledgerStatus,
        summary.certificationPosture,
        sciip2880_CreateFinalCertificationLedgerSummary_(summary),
        sciip2880_CreateFinalCertificationLedgerNextAction_(summary),
        new Date().toISOString(),
        sciipGet2880_SuperSheetImportFinalCertificationLedgerProcessorName_(),
        transaction.transactionId,
        JSON.stringify(summary)
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet2880_SuperSheetImportFinalCertificationLedgerProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: latestRecords.length,
        message: JSON.stringify({
          importFinalCertificationLedgerStatus: summary.ledgerStatus,
          ledgerBusinessKey: ledgerBusinessKey,
          sourceRecordsReviewed: latestRecords.length,
          certifiedCount: summary.certifiedCount,
          conditionalCount: summary.conditionalCount,
          notCertifiedCount: summary.notCertifiedCount,
          pendingCount: summary.pendingCount,
          certificationPosture: summary.certificationPosture,
          transactionId: transaction.transactionId,
          nextProcessor: 'Controlled SuperSheet production import / promotion workflow'
        })
      });
    }
  });
}

function sciip2880_BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKey || key.indexOf(businessKey + '|') === 0;
  });
}

function sciip2880_FilterLatestDateRecords_(records) {
  if (!records || !records.length) return [];

  const dated = records.map(function(record) {
    return {
      record: record,
      dateKey: sciip2880_ResolveRecordDate_(record)
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

function sciip2880_ResolveRecordDate_(record) {
  const fields = [
    'Certification_Date',
    'Ledger_Date',
    'Assessment_Date',
    'Created_At',
    'Completed_At'
  ];

  for (let i = 0; i < fields.length; i++) {
    const normalized = sciip2880_NormalizeDate_(record[fields[i]]);
    if (normalized) return normalized;
  }

  return '';
}

function sciip2880_NormalizeDate_(value) {
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

function sciip2880_SummarizeFinalCertificationRecords_(records) {
  const summary = {
    certifiedCount: 0,
    conditionalCount: 0,
    notCertifiedCount: 0,
    pendingCount: 0,
    totalRecords: records.length,
    ledgerStatus: 'FINAL_CERTIFICATION_PENDING',
    certificationPosture: 'UNKNOWN'
  };

  records.forEach(function(record) {
    const status = sciip2880_ResolveCertificationStatus_(record);

    if (status === 'CERTIFIED') {
      summary.certifiedCount += 1;
    } else if (status === 'CONDITIONALLY_CERTIFIED_REVIEW_REQUIRED' || status === 'CONDITIONAL' || status === 'REVIEW_REQUIRED') {
      summary.conditionalCount += 1;
    } else if (status === 'NOT_CERTIFIED' || status === 'FAILED' || status === 'BLOCKED') {
      summary.notCertifiedCount += 1;
    } else {
      summary.pendingCount += 1;
    }
  });

  summary.ledgerStatus = sciip2880_DeriveFinalCertificationLedgerStatus_(summary);
  summary.certificationPosture = sciip2880_DeriveFinalCertificationPosture_(summary);

  return summary;
}

function sciip2880_ResolveCertificationStatus_(record) {
  return String(
    record.Certification_Status ||
    record.Import_Final_Certification_Status ||
    record.Final_Certification_Status ||
    record.Status ||
    ''
  ).trim().toUpperCase();
}

function sciip2880_DeriveFinalCertificationLedgerStatus_(summary) {
  if (summary.notCertifiedCount > 0) return 'FINAL_CERTIFICATION_BLOCKED';
  if (summary.certifiedCount > 0 && summary.conditionalCount === 0 && summary.pendingCount === 0) return 'FINAL_CERTIFICATION_LEDGER_CERTIFIED';
  if (summary.certifiedCount > 0 || summary.conditionalCount > 0) return 'FINAL_CERTIFICATION_REVIEW_REQUIRED';
  return 'FINAL_CERTIFICATION_PENDING';
}

function sciip2880_DeriveFinalCertificationPosture_(summary) {
  if (summary.ledgerStatus === 'FINAL_CERTIFICATION_LEDGER_CERTIFIED') return 'READY_FOR_CONTROLLED_IMPORT';
  if (summary.ledgerStatus === 'FINAL_CERTIFICATION_REVIEW_REQUIRED') return 'OPERATOR_REVIEW_REQUIRED';
  if (summary.ledgerStatus === 'FINAL_CERTIFICATION_BLOCKED') return 'IMPORT_BLOCKED';
  return 'AWAITING_FINAL_CERTIFICATION';
}

function sciip2880_CreateFinalCertificationLedgerSummary_(summary) {
  return [
    'SuperSheet import final certification ledger summary recorded.',
    'Ledger status: ' + summary.ledgerStatus + '.',
    'Certification posture: ' + summary.certificationPosture + '.',
    'Certified: ' + summary.certifiedCount + '.',
    'Conditional/review-required: ' + summary.conditionalCount + '.',
    'Not certified/blocked: ' + summary.notCertifiedCount + '.',
    'Pending or unclassified: ' + summary.pendingCount + '.'
  ].join(' ');
}

function sciip2880_CreateFinalCertificationLedgerNextAction_(summary) {
  if (summary.ledgerStatus === 'FINAL_CERTIFICATION_LEDGER_CERTIFIED') {
    return 'Proceed to controlled SuperSheet production import / promotion workflow subject to operator release controls.';
  }

  if (summary.ledgerStatus === 'FINAL_CERTIFICATION_REVIEW_REQUIRED') {
    return 'Review final certification records before enabling SuperSheet production import.';
  }

  if (summary.ledgerStatus === 'FINAL_CERTIFICATION_BLOCKED') {
    return 'Hold SuperSheet production import and resolve failed final certification records.';
  }

  return 'Continue upstream SuperSheet import certification processing before production import.';
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest2880_SuperSheetImportFinalCertificationLedgerProcessor() {
  const result = sciipRun2880_SuperSheetImportFinalCertificationLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2880_SuperSheetImportFinalCertificationLedgerProcessor',
    result: result
  }));

  return result;
}
