/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3010_SuperSheetImportExecutionActivationProcessor
 *
 * SUPERSHEET_IMPORT_EXECUTION_READINESS_LEDGER_SUMMARY
 *   → SUPERSHEET_IMPORT_EXECUTION_ACTIVATIONS
 *******************************************************/

function sciipGet3010ProcessorName_() {
  return '3010_SuperSheetImportExecutionActivation';
}

function sciipGet3010SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_READINESS_LEDGER_SUMMARY';
}

function sciipGet3010TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_ACTIVATIONS';
}

function sciipGet3010Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_ACTIVATION';
}

function sciipGet3010Headers_() {
  return [
    'Execution_Activation_ID',
    'Business_Key',
    'Activation_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Execution_Activation_Status',
    'Execution_Activation_Posture',
    'Activation_Decision',
    'Blocking_Reason',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3010TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3010TargetSheet_(),
    sciipGet3010Headers_()
  );
}

function sciipRun3010_SuperSheetImportExecutionActivationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3010ProcessorName_(),
    action: sciipGet3010Action_(),
    sourceSheet: sciipGet3010SourceSheet_(),
    targetSheet: sciipGet3010TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_ACTIVATION_RUNTIME_LEDGER',

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
        summary: 'SuperSheet import execution activation runtime payload created.',
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
      const targetSheet = sciipEnsure3010TargetSheet_();
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3010ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            executionActivationStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 3000_SuperSheetImportExecutionReadinessLedgerProcessor after 2990 creates execution readiness records.'
          })
        });
      }

      const activationDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const activationBusinessKey = 'SUPERSHEET_IMPORT_EXECUTION_ACTIVATION|' + activationDate;

      if (sciip3010BusinessKeyExists_(definition.targetSheet, activationBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3010ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            executionActivationStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            activationBusinessKey: activationBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const activation = sciip3010ResolveExecutionActivation_(sourceRecords);

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_ACTIVATION_' + Utilities.getUuid(),
        activationBusinessKey,
        activationDate,
        definition.sourceSheet,
        sourceRecords.length,
        activation.status,
        activation.posture,
        activation.decision,
        activation.blockingReason,
        activation.summary,
        activation.nextAction,
        new Date().toISOString(),
        sciipGet3010ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3010ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          executionActivationStatus: activation.status,
          executionActivationPosture: activation.posture,
          activationDecision: activation.decision,
          blockingReason: activation.blockingReason,
          sourceRecordsReviewed: sourceRecords.length,
          activationBusinessKey: activationBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: '3020_SuperSheetImportExecutionActivationLedgerProcessor'
        })
      });
    }
  });
}

function sciip3010BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3010ResolveExecutionActivation_(records) {
  const latest = records[records.length - 1] || {};
  const statusText = Object.keys(latest).map(function(key) {
    return String(latest[key] || '').toUpperCase();
  }).join(' ');

  if (
    statusText.indexOf('EXECUTION_READINESS_LEDGER_READY') !== -1 &&
    statusText.indexOf('IMPORT_EXECUTION_READY') !== -1
  ) {
    return {
      status: 'EXECUTION_ACTIVATED',
      posture: 'IMPORT_EXECUTION_ACTIVATED',
      decision: 'ACTIVATED',
      blockingReason: '',
      summary: 'SuperSheet import execution activated from ready execution-readiness ledger posture.',
      nextAction: 'Proceed to execution activation ledger summary.'
    };
  }

  if (
    statusText.indexOf('BLOCK') !== -1 ||
    statusText.indexOf('FAIL') !== -1 ||
    statusText.indexOf('IMPORT_EXECUTION_BLOCKED') !== -1
  ) {
    return {
      status: 'EXECUTION_ACTIVATION_BLOCKED',
      posture: 'IMPORT_EXECUTION_BLOCKED',
      decision: 'NOT_ACTIVATED',
      blockingReason: 'Execution readiness ledger indicates blocked or failed conditions.',
      summary: 'SuperSheet import execution activation is blocked.',
      nextAction: 'Review execution readiness ledger blockers before activation.'
    };
  }

  return {
    status: 'EXECUTION_ACTIVATION_REVIEW_REQUIRED',
    posture: 'IMPORT_EXECUTION_REVIEW_REQUIRED',
    decision: 'REVIEW_REQUIRED',
    blockingReason: 'Execution readiness ledger did not produce a fully ready execution posture.',
    summary: 'SuperSheet import execution activation requires review.',
    nextAction: 'Review execution readiness ledger summary before activation.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3010_SuperSheetImportExecutionActivationProcessor() {
  const result = sciipRun3010_SuperSheetImportExecutionActivationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3010_SuperSheetImportExecutionActivationProcessor',
    result: result
  }));

  return result;
}