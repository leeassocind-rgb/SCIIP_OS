/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3160_SuperSheetImportExecutionArchiveLedgerProcessor
 *******************************************************/

function sciipGet3160ProcessorName_() {
  return '3160_SuperSheetImportExecutionArchiveLedger';
}

function sciipGet3160SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_ARCHIVES';
}

function sciipGet3160TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_ARCHIVE_LEDGER_SUMMARY';
}

function sciipGet3160Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_ARCHIVE_LEDGER_SUMMARY';
}

function sciipGet3160Headers_() {
  return [
    'Ledger_Summary_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Archive_Ready_Count',
    'Archive_Blocked_Count',
    'Review_Required_Count',
    'Archive_Ledger_Status',
    'Archive_Ledger_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3160TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3160TargetSheet_(),
    sciipGet3160Headers_()
  );
}

function sciipRun3160_SuperSheetImportExecutionArchiveLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3160ProcessorName_(),
    action: sciipGet3160Action_(),
    sourceSheet: sciipGet3160SourceSheet_(),
    targetSheet: sciipGet3160TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_ARCHIVE_LEDGER_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary: 'SuperSheet import execution archive ledger runtime payload created.',
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
      const targetSheet = sciipEnsure3160TargetSheet_();
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3160ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            archiveLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3150_SuperSheetImportExecutionArchiveProcessor after 3140 creates archive-ready finalization ledger summaries.'
          })
        });
      }

      const ledgerDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const ledgerBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_ARCHIVE_LEDGER|' + ledgerDate;

      if (sciip3160BusinessKeyExists_(definition.targetSheet, ledgerBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3160ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            archiveLedgerStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip3160CountArchiveLedgerRecords_(sourceRecords);
      const posture = sciip3160ResolveArchiveLedgerPosture_(
        counts,
        sourceRecords.length
      );

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_ARCHIVE_LEDGER_' + Utilities.getUuid(),
        ledgerBusinessKey,
        ledgerDate,
        definition.sourceSheet,
        sourceRecords.length,
        counts.ready,
        counts.blocked,
        counts.reviewRequired,
        posture.status,
        posture.posture,
        posture.summary,
        posture.nextAction,
        new Date().toISOString(),
        sciipGet3160ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3160ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          archiveLedgerStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          archiveReadyCount: counts.ready,
          archiveBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          archiveLedgerPosture: posture.posture,
          ledgerBusinessKey: ledgerBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: '3170_SuperSheetImportExecutionReconciliationProcessor'
        })
      });
    }
  });
}

function sciip3160BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3160CountArchiveLedgerRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('ARCHIVE_READY') !== -1 ||
      statusText.indexOf('IMPORT_ARCHIVE_READY') !== -1 ||
      statusText.indexOf('ARCHIVE_LEDGER_READY') !== -1
    ) {
      counts.ready += 1;
    } else if (
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1 ||
      statusText.indexOf('ARCHIVE_BLOCKED') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { ready: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3160ResolveArchiveLedgerPosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'ARCHIVE_LEDGER_RECORDED_WITH_BLOCKERS',
      posture: 'IMPORT_RECONCILIATION_BLOCKED',
      summary:
        'SuperSheet import execution archive ledger recorded blocking conditions.',
      nextAction:
        'Review blocked archive records before execution reconciliation.'
    };
  }

  if (counts.ready > 0 && counts.ready === total) {
    return {
      status: 'ARCHIVE_LEDGER_READY',
      posture: 'IMPORT_RECONCILIATION_READY',
      summary:
        'All SuperSheet import execution archive records are ready for reconciliation.',
      nextAction:
        'Proceed to SuperSheet import execution reconciliation.'
    };
  }

  if (counts.ready > 0) {
    return {
      status: 'ARCHIVE_LEDGER_PARTIAL_READY',
      posture: 'IMPORT_RECONCILIATION_REVIEW_REQUIRED',
      summary:
        'Some archive records are ready, but reconciliation requires review.',
      nextAction:
        'Review archive records before execution reconciliation.'
    };
  }

  return {
    status: 'ARCHIVE_LEDGER_REVIEW_REQUIRED',
    posture: 'IMPORT_RECONCILIATION_REVIEW_REQUIRED',
    summary:
      'No reconciliation-ready SuperSheet import execution archive records were found.',
    nextAction:
      'Run upstream archive processor with archive-ready input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3160_SuperSheetImportExecutionArchiveLedgerProcessor() {
  const result =
    sciipRun3160_SuperSheetImportExecutionArchiveLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3160_SuperSheetImportExecutionArchiveLedgerProcessor',
    result: result
  }));

  return result;
}