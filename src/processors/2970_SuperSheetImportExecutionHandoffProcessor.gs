/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 2970_SuperSheetImportExecutionHandoffProcessor
 *******************************************************/

function sciipGet2970ProcessorName_() {
  return '2970_SuperSheetImportExecutionHandoff';
}

function sciipGet2970SourceSheet_() {
  return 'SUPERSHEET_IMPORT_RELEASE_COMMAND_LEDGER_SUMMARY';
}

function sciipGet2970TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_HANDOFFS';
}

function sciipGet2970Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_HANDOFF';
}

function sciipGet2970Headers_() {
  return [
    'Execution_Handoff_ID',
    'Business_Key',
    'Handoff_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Execution_Handoff_Status',
    'Execution_Posture',
    'Handoff_Decision',
    'Blocking_Reason',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure2970TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet2970TargetSheet_(),
    sciipGet2970Headers_()
  );
}

function sciipRun2970_SuperSheetImportExecutionHandoffProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet2970ProcessorName_(),
    action: sciipGet2970Action_(),
    sourceSheet: sciipGet2970SourceSheet_(),
    targetSheet: sciipGet2970TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_HANDOFF_RUNTIME_LEDGER',

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
        summary: 'SuperSheet import execution handoff runtime payload created.',
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
      const targetSheet = sciipEnsure2970TargetSheet_();
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet2970ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            executionHandoffStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 2960_SuperSheetImportReleaseCommandLedgerProcessor after 2950 creates release command records.'
          })
        });
      }

      const handoffDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const handoffBusinessKey = 'SUPERSHEET_IMPORT_EXECUTION_HANDOFF|' + handoffDate;

      if (sciip2970BusinessKeyExists_(definition.targetSheet, handoffBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet2970ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            executionHandoffStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            handoffBusinessKey: handoffBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const handoff = sciip2970ResolveExecutionHandoff_(sourceRecords);

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_HANDOFF_' + Utilities.getUuid(),
        handoffBusinessKey,
        handoffDate,
        definition.sourceSheet,
        sourceRecords.length,
        handoff.status,
        handoff.posture,
        handoff.decision,
        handoff.blockingReason,
        handoff.summary,
        handoff.nextAction,
        new Date().toISOString(),
        sciipGet2970ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet2970ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          executionHandoffStatus: handoff.status,
          executionPosture: handoff.posture,
          handoffDecision: handoff.decision,
          blockingReason: handoff.blockingReason,
          sourceRecordsReviewed: sourceRecords.length,
          handoffBusinessKey: handoffBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: '2980_SuperSheetImportExecutionHandoffLedgerProcessor'
        })
      });
    }
  });
}

function sciip2970BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip2970ResolveExecutionHandoff_(records) {
  const latest = records[records.length - 1] || {};
  const statusText = Object.keys(latest).map(function(key) {
    return String(latest[key] || '').toUpperCase();
  }).join(' ');

  if (
    statusText.indexOf('RELEASE_COMMAND_LEDGER_ISSUED') !== -1 &&
    statusText.indexOf('IMPORT_RELEASE_COMMAND_ISSUED') !== -1
  ) {
    return {
      status: 'EXECUTION_HANDOFF_CREATED',
      posture: 'IMPORT_EXECUTION_READY',
      decision: 'HANDOFF_CREATED',
      blockingReason: '',
      summary: 'SuperSheet import execution handoff created from issued release command ledger posture.',
      nextAction: 'Proceed to execution handoff ledger summary.'
    };
  }

  if (
    statusText.indexOf('BLOCK') !== -1 ||
    statusText.indexOf('FAIL') !== -1 ||
    statusText.indexOf('IMPORT_RELEASE_BLOCKED') !== -1
  ) {
    return {
      status: 'EXECUTION_HANDOFF_BLOCKED',
      posture: 'IMPORT_EXECUTION_BLOCKED',
      decision: 'HANDOFF_NOT_CREATED',
      blockingReason: 'Release command ledger indicates blocked or failed conditions.',
      summary: 'SuperSheet import execution handoff is blocked.',
      nextAction: 'Review release command ledger blockers before execution handoff.'
    };
  }

  return {
    status: 'EXECUTION_HANDOFF_REVIEW_REQUIRED',
    posture: 'IMPORT_EXECUTION_REVIEW_REQUIRED',
    decision: 'REVIEW_REQUIRED',
    blockingReason: 'Release command ledger did not produce a command-issued posture.',
    summary: 'SuperSheet import execution handoff requires review.',
    nextAction: 'Review release command ledger summary before execution handoff.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest2970_SuperSheetImportExecutionHandoffProcessor() {
  const result = sciipRun2970_SuperSheetImportExecutionHandoffProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2970_SuperSheetImportExecutionHandoffProcessor',
    result: result
  }));

  return result;
}