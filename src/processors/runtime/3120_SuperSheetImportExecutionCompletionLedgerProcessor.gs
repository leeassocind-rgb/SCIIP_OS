/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3120_SuperSheetImportExecutionCompletionLedgerProcessor
 *******************************************************/

function sciipGet3120ProcessorName_() {
  return '3120_SuperSheetImportExecutionCompletionLedger';
}

function sciipGet3120SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_COMPLETIONS';
}

function sciipGet3120TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_COMPLETION_LEDGER_SUMMARY';
}

function sciipGet3120Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_COMPLETION_LEDGER_SUMMARY';
}

function sciipGet3120Headers_() {
  return [
    'Ledger_Summary_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Completion_Ready_Count',
    'Completion_Blocked_Count',
    'Review_Required_Count',
    'Completion_Ledger_Status',
    'Completion_Ledger_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3120TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3120TargetSheet_(),
    sciipGet3120Headers_()
  );
}

function sciipRun3120_SuperSheetImportExecutionCompletionLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3120ProcessorName_(),
    action: sciipGet3120Action_(),
    sourceSheet: sciipGet3120SourceSheet_(),
    targetSheet: sciipGet3120TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_COMPLETION_LEDGER_RUNTIME_LEDGER',

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
        summary: 'SuperSheet import execution completion ledger runtime payload created.',
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
      const targetSheet = sciipEnsure3120TargetSheet_();
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3120ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            completionLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3110_SuperSheetImportExecutionCompletionProcessor after 3100 creates execution status ledger summaries.'
          })
        });
      }

      const ledgerDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const ledgerBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_COMPLETION_LEDGER|' + ledgerDate;

      if (sciip3120BusinessKeyExists_(definition.targetSheet, ledgerBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3120ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            completionLedgerStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip3120CountCompletionRecords_(sourceRecords);
      const posture = sciip3120ResolveCompletionLedgerPosture_(
        counts,
        sourceRecords.length
      );

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_COMPLETION_LEDGER_' + Utilities.getUuid(),
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
        sciipGet3120ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3120ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          completionLedgerStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          completionReadyCount: counts.ready,
          completionBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          completionLedgerPosture: posture.posture,
          ledgerBusinessKey: ledgerBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: '3130_SuperSheetImportExecutionFinalizationProcessor'
        })
      });
    }
  });
}

function sciip3120BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3120CountCompletionRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('EXECUTION_COMPLETION_READY') !== -1 ||
      statusText.indexOf('IMPORT_EXECUTION_COMPLETION_READY') !== -1 ||
      statusText.indexOf('COMPLETION_READY') !== -1
    ) {
      counts.ready += 1;
    } else if (
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1 ||
      statusText.indexOf('COMPLETION_BLOCKED') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { ready: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3120ResolveCompletionLedgerPosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'COMPLETION_LEDGER_RECORDED_WITH_BLOCKERS',
      posture: 'IMPORT_COMPLETION_BLOCKED',
      summary:
        'SuperSheet import execution completion ledger recorded blocking conditions.',
      nextAction:
        'Review blocked completion records before import finalization.'
    };
  }

  if (counts.ready > 0 && counts.ready === total) {
    return {
      status: 'COMPLETION_LEDGER_READY',
      posture: 'IMPORT_FINALIZATION_READY',
      summary:
        'All SuperSheet import execution completion records are ready for finalization.',
      nextAction:
        'Proceed to SuperSheet import execution finalization.'
    };
  }

  if (counts.ready > 0) {
    return {
      status: 'COMPLETION_LEDGER_PARTIAL_READY',
      posture: 'IMPORT_FINALIZATION_REVIEW_REQUIRED',
      summary:
        'Some completion records are ready, but finalization requires review.',
      nextAction:
        'Review completion records before import finalization.'
    };
  }

  return {
    status: 'COMPLETION_LEDGER_REVIEW_REQUIRED',
    posture: 'IMPORT_FINALIZATION_REVIEW_REQUIRED',
    summary:
      'No completion-ready SuperSheet import execution records were found.',
    nextAction:
      'Run upstream execution completion processor with active execution ledger input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3120_SuperSheetImportExecutionCompletionLedgerProcessor() {
  const result =
    sciipRun3120_SuperSheetImportExecutionCompletionLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3120_SuperSheetImportExecutionCompletionLedgerProcessor',
    result: result
  }));

  return result;
}