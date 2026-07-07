/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3090_SuperSheetImportExecutionStatusProcessor
 *******************************************************/

function sciipGet3090ProcessorName_() {
  return '3090_SuperSheetImportExecutionStatus';
}

function sciipGet3090SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_MONITOR_LEDGER_SUMMARY';
}

function sciipGet3090TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_STATUSES';
}

function sciipGet3090Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_STATUS';
}

function sciipGet3090Headers_() {
  return [
    'Execution_Status_ID',
    'Business_Key',
    'Status_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Execution_Status',
    'Execution_Status_Posture',
    'Status_Decision',
    'Blocking_Reason',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3090TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3090TargetSheet_(),
    sciipGet3090Headers_()
  );
}

function sciipRun3090_SuperSheetImportExecutionStatusProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3090ProcessorName_(),
    action: sciipGet3090Action_(),
    sourceSheet: sciipGet3090SourceSheet_(),
    targetSheet: sciipGet3090TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_STATUS_RUNTIME_LEDGER',

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
        summary: 'SuperSheet import execution status runtime payload created.',
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
      const targetSheet = sciipEnsure3090TargetSheet_();
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3090ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            executionStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 3080_SuperSheetImportExecutionMonitorLedgerProcessor after 3070 creates execution monitor records.'
          })
        });
      }

      const statusDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const statusBusinessKey = 'SUPERSHEET_IMPORT_EXECUTION_STATUS|' + statusDate;

      if (sciip3090BusinessKeyExists_(definition.targetSheet, statusBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3090ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            executionStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            statusBusinessKey: statusBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const status = sciip3090ResolveExecutionStatus_(sourceRecords);

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_STATUS_' + Utilities.getUuid(),
        statusBusinessKey,
        statusDate,
        definition.sourceSheet,
        sourceRecords.length,
        status.status,
        status.posture,
        status.decision,
        status.blockingReason,
        status.summary,
        status.nextAction,
        new Date().toISOString(),
        sciipGet3090ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3090ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          executionStatus: status.status,
          executionStatusPosture: status.posture,
          statusDecision: status.decision,
          blockingReason: status.blockingReason,
          sourceRecordsReviewed: sourceRecords.length,
          statusBusinessKey: statusBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: '3100_SuperSheetImportExecutionStatusLedgerProcessor'
        })
      });
    }
  });
}

function sciip3090BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3090ResolveExecutionStatus_(records) {
  const latest = records[records.length - 1] || {};
  const statusText = Object.keys(latest).map(function(key) {
    return String(latest[key] || '').toUpperCase();
  }).join(' ');

  if (
    statusText.indexOf('EXECUTION_MONITOR_LEDGER_ACTIVE') !== -1 &&
    statusText.indexOf('IMPORT_EXECUTION_MONITOR_ACTIVE') !== -1
  ) {
    return {
      status: 'EXECUTION_STATUS_ACTIVE',
      posture: 'IMPORT_EXECUTION_ACTIVE',
      decision: 'EXECUTION_ACTIVE',
      blockingReason: '',
      summary: 'SuperSheet import execution status confirmed as active from monitor ledger posture.',
      nextAction: 'Proceed to execution status ledger summary.'
    };
  }

  if (
    statusText.indexOf('BLOCK') !== -1 ||
    statusText.indexOf('FAIL') !== -1 ||
    statusText.indexOf('IMPORT_EXECUTION_BLOCKED') !== -1
  ) {
    return {
      status: 'EXECUTION_STATUS_BLOCKED',
      posture: 'IMPORT_EXECUTION_BLOCKED',
      decision: 'EXECUTION_NOT_ACTIVE',
      blockingReason: 'Execution monitor ledger indicates blocked or failed conditions.',
      summary: 'SuperSheet import execution status is blocked.',
      nextAction: 'Review execution monitor ledger blockers before status confirmation.'
    };
  }

  return {
    status: 'EXECUTION_STATUS_REVIEW_REQUIRED',
    posture: 'IMPORT_EXECUTION_REVIEW_REQUIRED',
    decision: 'REVIEW_REQUIRED',
    blockingReason: 'Execution monitor ledger did not produce an active monitoring posture.',
    summary: 'SuperSheet import execution status requires review.',
    nextAction: 'Review execution monitor ledger summary before status confirmation.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3090_SuperSheetImportExecutionStatusProcessor() {
  const result = sciipRun3090_SuperSheetImportExecutionStatusProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3090_SuperSheetImportExecutionStatusProcessor',
    result: result
  }));

  return result;
}