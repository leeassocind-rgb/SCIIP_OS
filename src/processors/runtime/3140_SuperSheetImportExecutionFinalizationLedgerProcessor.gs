/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3140_SuperSheetImportExecutionFinalizationLedgerProcessor
 *******************************************************/

function sciipGet3140ProcessorName_() {
  return '3140_SuperSheetImportExecutionFinalizationLedger';
}

function sciipGet3140SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_FINALIZATIONS';
}

function sciipGet3140TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_FINALIZATION_LEDGER_SUMMARY';
}

function sciipGet3140Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_FINALIZATION_LEDGER_SUMMARY';
}

function sciipGet3140Headers_() {
  return [
    'Ledger_Summary_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Finalization_Ready_Count',
    'Finalization_Blocked_Count',
    'Review_Required_Count',
    'Finalization_Ledger_Status',
    'Finalization_Ledger_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3140TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3140TargetSheet_(),
    sciipGet3140Headers_()
  );
}

function sciipRun3140_SuperSheetImportExecutionFinalizationLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3140ProcessorName_(),
    action: sciipGet3140Action_(),
    sourceSheet: sciipGet3140SourceSheet_(),
    targetSheet: sciipGet3140TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_FINALIZATION_LEDGER_RUNTIME_LEDGER',

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
        summary: 'SuperSheet import execution finalization ledger runtime payload created.',
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
      const targetSheet = sciipEnsure3140TargetSheet_();
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3140ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            finalizationLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3130_SuperSheetImportExecutionFinalizationProcessor after 3120 creates finalization-ready ledger summaries.'
          })
        });
      }

      const ledgerDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const ledgerBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_FINALIZATION_LEDGER|' + ledgerDate;

      if (sciip3140BusinessKeyExists_(definition.targetSheet, ledgerBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3140ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            finalizationLedgerStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip3140CountFinalizationLedgerRecords_(sourceRecords);
      const posture = sciip3140ResolveFinalizationLedgerPosture_(
        counts,
        sourceRecords.length
      );

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_FINALIZATION_LEDGER_' + Utilities.getUuid(),
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
        sciipGet3140ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3140ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          finalizationLedgerStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          finalizationReadyCount: counts.ready,
          finalizationBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          finalizationLedgerPosture: posture.posture,
          ledgerBusinessKey: ledgerBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: '3150_SuperSheetImportExecutionArchiveProcessor'
        })
      });
    }
  });
}

function sciip3140BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3140CountFinalizationLedgerRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('FINALIZATION_READY') !== -1 ||
      statusText.indexOf('IMPORT_FINALIZATION_READY') !== -1 ||
      statusText.indexOf('FINALIZATION_LEDGER_READY') !== -1
    ) {
      counts.ready += 1;
    } else if (
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1 ||
      statusText.indexOf('FINALIZATION_BLOCKED') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { ready: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3140ResolveFinalizationLedgerPosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'FINALIZATION_LEDGER_RECORDED_WITH_BLOCKERS',
      posture: 'IMPORT_ARCHIVE_BLOCKED',
      summary:
        'SuperSheet import execution finalization ledger recorded blocking conditions.',
      nextAction:
        'Review blocked finalization records before archive processing.'
    };
  }

  if (counts.ready > 0 && counts.ready === total) {
    return {
      status: 'FINALIZATION_LEDGER_READY',
      posture: 'IMPORT_ARCHIVE_READY',
      summary:
        'All SuperSheet import execution finalization records are ready for archive processing.',
      nextAction:
        'Proceed to SuperSheet import execution archive processing.'
    };
  }

  if (counts.ready > 0) {
    return {
      status: 'FINALIZATION_LEDGER_PARTIAL_READY',
      posture: 'IMPORT_ARCHIVE_REVIEW_REQUIRED',
      summary:
        'Some finalization records are ready, but archive processing requires review.',
      nextAction:
        'Review finalization records before archive processing.'
    };
  }

  return {
    status: 'FINALIZATION_LEDGER_REVIEW_REQUIRED',
    posture: 'IMPORT_ARCHIVE_REVIEW_REQUIRED',
    summary:
      'No archive-ready SuperSheet import execution finalization records were found.',
    nextAction:
      'Run upstream finalization processor with finalization-ready input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3140_SuperSheetImportExecutionFinalizationLedgerProcessor() {
  const result =
    sciipRun3140_SuperSheetImportExecutionFinalizationLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3140_SuperSheetImportExecutionFinalizationLedgerProcessor',
    result: result
  }));

  return result;
}