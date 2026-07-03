/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Protection Layer
 * 2840_SuperSheetImportCertificationLedgerProcessor
 *
 * SUPERSHEET_IMPORT_CERTIFICATIONS → SUPERSHEET_IMPORT_CERTIFICATION_LEDGER_SUMMARY
 *
 * Purpose:
 * Creates a durable ledger summary of SuperSheet import certification
 * outcomes before any downstream import activation occurs.
 *******************************************************/

function sciipGet2840_SuperSheetImportCertificationLedgerProcessorName_() {
  return '2840_SuperSheetImportCertificationLedger';
}

function sciipGet2840_SuperSheetImportCertificationLedgerHeaders_() {
  return [
    'Ledger_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Certified_Count',
    'Failed_Count',
    'Pending_Count',
    'Ledger_Status',
    'Ledger_Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure2840_SuperSheetImportCertificationLedgerSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'SUPERSHEET_IMPORT_CERTIFICATION_LEDGER_SUMMARY',
    sciipGet2840_SuperSheetImportCertificationLedgerHeaders_()
  );
}

function sciipRun2840_SuperSheetImportCertificationLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet2840_SuperSheetImportCertificationLedgerProcessorName_(),
    action: 'SUPERSHEET_IMPORT_CERTIFICATION_LEDGER_SUMMARY',
    sourceSheet: 'SUPERSHEET_IMPORT_CERTIFICATIONS',
    targetSheet: 'SUPERSHEET_IMPORT_CERTIFICATION_LEDGER_SUMMARY',
    ledgerSheet: 'SUPERSHEET_IMPORT_CERTIFICATION_LEDGER_RUNTIME_LEDGER',

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
        summary: 'SuperSheet import certification ledger runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.4',
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
      const outputSheet = sciipEnsure2840_SuperSheetImportCertificationLedgerSheet_();
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet2840_SuperSheetImportCertificationLedgerProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            importCertificationLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 2830_SuperSheetImportCertificationProcessor after 2820 creates readiness ledger summaries.'
          })
        });
      }

      const ledgerDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const importCertificationLedgerBusinessKey = 'SUPERSHEET_IMPORT_CERTIFICATION_LEDGER|' + ledgerDate;

      if (sciip2840_RuntimeBusinessKeyPrefixExists_(definition.targetSheet, importCertificationLedgerBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet2840_SuperSheetImportCertificationLedgerProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            importCertificationLedgerStatus: 'DUPLICATE_SKIPPED',
            skippedDuplicate: 1,
            importCertificationLedgerBusinessKey: importCertificationLedgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip2840_CountImportCertificationStatuses_(sourceRecords);
      const ledgerStatus = sciip2840_DeriveImportCertificationLedgerStatus_(counts);
      const summary = sciip2840_CreateImportCertificationLedgerSummary_(counts, ledgerStatus);
      const nextAction = sciip2840_CreateImportCertificationLedgerNextAction_(ledgerStatus);

      outputSheet.appendRow([
        'SUPERSHEET_IMPORT_CERTIFICATION_LEDGER_' + Utilities.getUuid(),
        importCertificationLedgerBusinessKey,
        ledgerDate,
        definition.sourceSheet,
        sourceRecords.length,
        counts.certified,
        counts.failed,
        counts.pending,
        ledgerStatus,
        summary,
        nextAction,
        new Date().toISOString(),
        sciipGet2840_SuperSheetImportCertificationLedgerProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet2840_SuperSheetImportCertificationLedgerProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          importCertificationLedgerStatus: ledgerStatus,
          sourceSheet: definition.sourceSheet,
          targetSheet: definition.targetSheet,
          sourceRecordsReviewed: sourceRecords.length,
          certifiedCount: counts.certified,
          failedCount: counts.failed,
          pendingCount: counts.pending,
          transactionId: transaction.transactionId,
          nextProcessor: '2850_SuperSheetImportActivationProcessor'
        })
      });
    }
  });
}

function sciip2840_CountImportCertificationStatuses_(records) {
  const counts = {
    certified: 0,
    failed: 0,
    pending: 0
  };

  records.forEach(function(record) {
    const status = String(
      record.Certification_Status ||
      record.Import_Certification_Status ||
      record.Status ||
      ''
    ).trim().toUpperCase();

    if (status === 'CERTIFIED' || status === 'IMPORT_CERTIFIED' || status === 'PASS') {
      counts.certified += 1;
    } else if (status === 'FAILED' || status === 'FAIL' || status === 'BLOCKED') {
      counts.failed += 1;
    } else {
      counts.pending += 1;
    }
  });

  return counts;
}

function sciip2840_DeriveImportCertificationLedgerStatus_(counts) {
  if (counts.failed > 0) return 'IMPORT_CERTIFICATION_BLOCKED';
  if (counts.certified > 0 && counts.pending === 0) return 'IMPORT_CERTIFICATION_LEDGER_CERTIFIED';
  if (counts.certified > 0 && counts.pending > 0) return 'IMPORT_CERTIFICATION_PARTIAL';
  return 'IMPORT_CERTIFICATION_PENDING';
}

function sciip2840_CreateImportCertificationLedgerSummary_(counts, ledgerStatus) {
  return [
    'SuperSheet import certification ledger summary recorded.',
    'Status: ' + ledgerStatus + '.',
    'Certified: ' + counts.certified + '.',
    'Failed: ' + counts.failed + '.',
    'Pending or unclassified: ' + counts.pending + '.'
  ].join(' ');
}

function sciip2840_CreateImportCertificationLedgerNextAction_(ledgerStatus) {
  if (ledgerStatus === 'IMPORT_CERTIFICATION_LEDGER_CERTIFIED') {
    return 'Proceed to SuperSheet import activation review.';
  }

  if (ledgerStatus === 'IMPORT_CERTIFICATION_BLOCKED') {
    return 'Hold import activation and review failed certification records.';
  }

  return 'Continue upstream certification processing before activation.';
}

function sciip2840_RuntimeBusinessKeyPrefixExists_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest2840_SuperSheetImportCertificationLedgerProcessor() {
  const result = sciipRun2840_SuperSheetImportCertificationLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2840_SuperSheetImportCertificationLedgerProcessor',
    result: result
  }));

  return result;
}
