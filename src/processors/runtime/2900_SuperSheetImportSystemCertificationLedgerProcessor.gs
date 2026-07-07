/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 2900_SuperSheetImportSystemCertificationLedgerProcessor
 *
 * SUPERSHEET_IMPORT_SYSTEM_CERTIFICATIONS
 *   → SUPERSHEET_IMPORT_SYSTEM_CERTIFICATION_LEDGER_SUMMARY
 *
 * Purpose:
 * Creates a durable ledger summary for SuperSheet import
 * system-level certification records.
 *******************************************************/

function sciipGet2900ProcessorName_() {
  return '2900_SuperSheetImportSystemCertificationLedger';
}

function sciipGet2900SourceSheet_() {
  return 'SUPERSHEET_IMPORT_SYSTEM_CERTIFICATIONS';
}

function sciipGet2900TargetSheet_() {
  return 'SUPERSHEET_IMPORT_SYSTEM_CERTIFICATION_LEDGER_SUMMARY';
}

function sciipGet2900Action_() {
  return 'SUPERSHEET_IMPORT_SYSTEM_CERTIFICATION_LEDGER_SUMMARY';
}

function sciipGet2900Headers_() {
  return [
    'Ledger_Summary_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Certified_Count',
    'Failed_Count',
    'Skipped_Count',
    'System_Certification_Ledger_Status',
    'System_Certification_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure2900TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet2900TargetSheet_(),
    sciipGet2900Headers_()
  );
}

function sciipRun2900_SuperSheetImportSystemCertificationLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet2900ProcessorName_(),
    action: sciipGet2900Action_(),
    sourceSheet: sciipGet2900SourceSheet_(),
    targetSheet: sciipGet2900TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_SYSTEM_CERTIFICATION_LEDGER_RUNTIME_LEDGER',

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
        summary: 'SuperSheet import system certification ledger runtime payload created.',
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
      const targetSheet = sciipEnsure2900TargetSheet_();
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet2900ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            importSystemCertificationLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 2890_SuperSheetImportSystemCertificationProcessor after 2880 creates final certification ledger summaries.'
          })
        });
      }

      const ledgerDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const ledgerBusinessKey = 'SUPERSHEET_IMPORT_SYSTEM_CERTIFICATION_LEDGER|' + ledgerDate;

      if (sciip2900BusinessKeyExists_(definition.targetSheet, ledgerBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet2900ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            importSystemCertificationLedgerStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip2900CountCertificationStatuses_(sourceRecords);
      const posture = sciip2900ResolvePosture_(counts, sourceRecords.length);

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_SYSTEM_CERTIFICATION_LEDGER_' + Utilities.getUuid(),
        ledgerBusinessKey,
        ledgerDate,
        definition.sourceSheet,
        sourceRecords.length,
        counts.certified,
        counts.failed,
        counts.skipped,
        posture.status,
        posture.posture,
        posture.summary,
        posture.nextAction,
        new Date().toISOString(),
        sciipGet2900ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet2900ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          importSystemCertificationLedgerStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          certifiedCount: counts.certified,
          failedCount: counts.failed,
          skippedCount: counts.skipped,
          systemCertificationPosture: posture.posture,
          ledgerBusinessKey: ledgerBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: '2910_SuperSheetImportReleaseGateProcessor'
        })
      });
    }
  });
}

function sciip2900BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKey;
  });
}

function sciip2900CountCertificationStatuses_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (statusText.indexOf('CERTIFIED') !== -1 || statusText.indexOf('PASS') !== -1) {
      counts.certified += 1;
    } else if (statusText.indexOf('FAIL') !== -1 || statusText.indexOf('BLOCK') !== -1 || statusText.indexOf('NOT_CERTIFIED') !== -1) {
      counts.failed += 1;
    } else if (statusText.indexOf('SKIPPED') !== -1 || statusText.indexOf('NO_INPUT') !== -1) {
      counts.skipped += 1;
    } else {
      counts.skipped += 1;
    }

    return counts;
  }, { certified: 0, failed: 0, skipped: 0 });
}

function sciip2900ResolvePosture_(counts, total) {
  if (counts.failed > 0) {
    return {
      status: 'SYSTEM_CERTIFICATION_LEDGER_RECORDED_WITH_FAILURES',
      posture: 'IMPORT_NOT_READY',
      summary: 'SuperSheet import system certification ledger recorded failures or blocking conditions.',
      nextAction: 'Review failed certification records before releasing SuperSheet import workflow.'
    };
  }

  if (counts.certified > 0 && counts.certified === total) {
    return {
      status: 'SYSTEM_CERTIFICATION_LEDGER_CERTIFIED',
      posture: 'IMPORT_READY',
      summary: 'All SuperSheet import system certification records are certified.',
      nextAction: 'Proceed to SuperSheet import release gate.'
    };
  }

  if (counts.certified > 0) {
    return {
      status: 'SYSTEM_CERTIFICATION_LEDGER_PARTIAL_CERTIFICATION',
      posture: 'IMPORT_REVIEW_REQUIRED',
      summary: 'Some SuperSheet import system certification records are certified, but not all records reached a certified posture.',
      nextAction: 'Review skipped or incomplete certification records before release.'
    };
  }

  return {
    status: 'SYSTEM_CERTIFICATION_LEDGER_UNCERTIFIED',
    posture: 'IMPORT_NOT_READY',
    summary: 'No certified SuperSheet import system certification records were found.',
    nextAction: 'Run upstream SuperSheet import certification processors with valid input records.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest2900_SuperSheetImportSystemCertificationLedgerProcessor() {
  const result = sciipRun2900_SuperSheetImportSystemCertificationLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2900_SuperSheetImportSystemCertificationLedgerProcessor',
    result: result
  }));

  return result;
}
