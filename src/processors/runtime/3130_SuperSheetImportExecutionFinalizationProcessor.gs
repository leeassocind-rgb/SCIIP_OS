/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3130_SuperSheetImportExecutionFinalizationProcessor
 *******************************************************/

function sciipGet3130ProcessorName_() {
  return '3130_SuperSheetImportExecutionFinalization';
}

function sciipGet3130SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_COMPLETION_LEDGER_SUMMARY';
}

function sciipGet3130TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_FINALIZATIONS';
}

function sciipGet3130Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_FINALIZATIONS';
}

function sciipGet3130Headers_() {
  return [
    'Finalization_ID',
    'Business_Key',
    'Finalization_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Finalization_Ready_Count',
    'Finalization_Blocked_Count',
    'Review_Required_Count',
    'Finalization_Status',
    'Finalization_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3130TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3130TargetSheet_(),
    sciipGet3130Headers_()
  );
}

function sciipRun3130_SuperSheetImportExecutionFinalizationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3130ProcessorName_(),
    action: sciipGet3130Action_(),
    sourceSheet: sciipGet3130SourceSheet_(),
    targetSheet: sciipGet3130TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_FINALIZATION_RUNTIME_LEDGER',

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
        summary: 'SuperSheet import execution finalization runtime payload created.',
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
      const targetSheet = sciipEnsure3130TargetSheet_();
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3130ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            finalizationStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3120_SuperSheetImportExecutionCompletionLedgerProcessor after 3110 creates completion records.'
          })
        });
      }

      const finalizationDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const finalizationBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_FINALIZATION|' + finalizationDate;

      if (sciip3130BusinessKeyExists_(definition.targetSheet, finalizationBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3130ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            finalizationStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            finalizationBusinessKey: finalizationBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip3130CountFinalizationRecords_(sourceRecords);
      const posture = sciip3130ResolveFinalizationPosture_(
        counts,
        sourceRecords.length
      );

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_FINALIZATION_' + Utilities.getUuid(),
        finalizationBusinessKey,
        finalizationDate,
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
        sciipGet3130ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3130ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          finalizationStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          finalizationReadyCount: counts.ready,
          finalizationBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          finalizationPosture: posture.posture,
          finalizationBusinessKey: finalizationBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: '3140_SuperSheetImportExecutionFinalizationLedgerProcessor'
        })
      });
    }
  });
}

function sciip3130BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3130CountFinalizationRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('COMPLETION_LEDGER_READY') !== -1 ||
      statusText.indexOf('IMPORT_FINALIZATION_READY') !== -1 ||
      statusText.indexOf('FINALIZATION_READY') !== -1
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

function sciip3130ResolveFinalizationPosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'FINALIZATION_BLOCKED',
      posture: 'IMPORT_FINALIZATION_BLOCKED',
      summary:
        'SuperSheet import execution finalization is blocked by completion ledger conditions.',
      nextAction:
        'Review blocked completion ledger records before finalization ledger summary.'
    };
  }

  if (counts.ready > 0 && counts.ready === total) {
    return {
      status: 'FINALIZATION_READY',
      posture: 'IMPORT_FINALIZATION_READY',
      summary:
        'SuperSheet import execution is ready for finalization.',
      nextAction:
        'Proceed to SuperSheet import execution finalization ledger summary.'
    };
  }

  if (counts.ready > 0) {
    return {
      status: 'FINALIZATION_PARTIAL_READY',
      posture: 'IMPORT_FINALIZATION_REVIEW_REQUIRED',
      summary:
        'Some completion ledger records are ready, but finalization requires review.',
      nextAction:
        'Review completion ledger records before finalization ledger summary.'
    };
  }

  return {
    status: 'FINALIZATION_REVIEW_REQUIRED',
    posture: 'IMPORT_FINALIZATION_REVIEW_REQUIRED',
    summary:
      'No finalization-ready SuperSheet import execution completion ledger records were found.',
    nextAction:
      'Run upstream completion ledger processor with completion-ready input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3130_SuperSheetImportExecutionFinalizationProcessor() {
  const result =
    sciipRun3130_SuperSheetImportExecutionFinalizationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3130_SuperSheetImportExecutionFinalizationProcessor',
    result: result
  }));

  return result;
}