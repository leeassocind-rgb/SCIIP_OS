/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3110_SuperSheetImportExecutionCompletionProcessor
 *******************************************************/

function sciipGet3110ProcessorName_() {
  return '3110_SuperSheetImportExecutionCompletion';
}

function sciipGet3110SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_STATUS_LEDGER_SUMMARY';
}

function sciipGet3110TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_COMPLETIONS';
}

function sciipGet3110Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_COMPLETIONS';
}

function sciipGet3110Headers_() {
  return [
    'Completion_ID',
    'Business_Key',
    'Completion_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Execution_Active_Count',
    'Execution_Blocked_Count',
    'Review_Required_Count',
    'Completion_Status',
    'Completion_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3110TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3110TargetSheet_(),
    sciipGet3110Headers_()
  );
}

function sciipRun3110_SuperSheetImportExecutionCompletionProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3110ProcessorName_(),
    action: sciipGet3110Action_(),
    sourceSheet: sciipGet3110SourceSheet_(),
    targetSheet: sciipGet3110TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_COMPLETION_RUNTIME_LEDGER',

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
        summary: 'SuperSheet import execution completion runtime payload created.',
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
      const targetSheet = sciipEnsure3110TargetSheet_();
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3110ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            executionCompletionStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3100_SuperSheetImportExecutionStatusLedgerProcessor after execution status records are available.'
          })
        });
      }

      const completionDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const completionBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_COMPLETION|' + completionDate;

      if (sciip3110BusinessKeyExists_(definition.targetSheet, completionBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3110ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            executionCompletionStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            completionBusinessKey: completionBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip3110CountExecutionCompletionRecords_(sourceRecords);
      const posture = sciip3110ResolveCompletionPosture_(counts, sourceRecords.length);

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_COMPLETION_' + Utilities.getUuid(),
        completionBusinessKey,
        completionDate,
        definition.sourceSheet,
        sourceRecords.length,
        counts.active,
        counts.blocked,
        counts.reviewRequired,
        posture.status,
        posture.posture,
        posture.summary,
        posture.nextAction,
        new Date().toISOString(),
        sciipGet3110ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3110ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          executionCompletionStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          executionActiveCount: counts.active,
          executionBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          executionCompletionPosture: posture.posture,
          completionBusinessKey: completionBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: '3120_SuperSheetImportExecutionCompletionLedgerProcessor'
        })
      });
    }
  });
}

function sciip3110BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3110CountExecutionCompletionRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('EXECUTION_STATUS_LEDGER_ACTIVE') !== -1 ||
      statusText.indexOf('IMPORT_EXECUTION_ACTIVE') !== -1 ||
      statusText.indexOf('EXECUTION_ACTIVE') !== -1
    ) {
      counts.active += 1;
    } else if (
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1 ||
      statusText.indexOf('IMPORT_EXECUTION_BLOCKED') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { active: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3110ResolveCompletionPosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'EXECUTION_COMPLETION_BLOCKED',
      posture: 'IMPORT_EXECUTION_COMPLETION_BLOCKED',
      summary: 'SuperSheet import execution completion blocked by execution status ledger conditions.',
      nextAction: 'Review blocked execution status ledger records before completion.'
    };
  }

  if (counts.active > 0 && counts.active === total) {
    return {
      status: 'EXECUTION_COMPLETION_READY',
      posture: 'IMPORT_EXECUTION_COMPLETION_READY',
      summary: 'SuperSheet import execution is ready for completion.',
      nextAction: 'Proceed to SuperSheet import execution completion ledger summary.'
    };
  }

  if (counts.active > 0) {
    return {
      status: 'EXECUTION_COMPLETION_PARTIAL_READY',
      posture: 'IMPORT_EXECUTION_COMPLETION_REVIEW_REQUIRED',
      summary: 'Some execution status ledger records are active, but completion requires review.',
      nextAction: 'Review execution status ledger records before completion ledger summary.'
    };
  }

  return {
    status: 'EXECUTION_COMPLETION_REVIEW_REQUIRED',
    posture: 'IMPORT_EXECUTION_COMPLETION_REVIEW_REQUIRED',
    summary: 'No active execution status ledger records were found for completion.',
    nextAction: 'Run upstream execution status ledger processor with active execution inputs.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3110_SuperSheetImportExecutionCompletionProcessor() {
  const result = sciipRun3110_SuperSheetImportExecutionCompletionProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3110_SuperSheetImportExecutionCompletionProcessor',
    result: result
  }));

  return result;
}