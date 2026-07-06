/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3030_SuperSheetImportExecutionControlProcessor
 *
 * SUPERSHEET_IMPORT_EXECUTION_ACTIVATION_LEDGER_SUMMARY
 *   → SUPERSHEET_IMPORT_EXECUTION_CONTROLS
 *******************************************************/

function sciipGet3030ProcessorName_() {
  return '3030_SuperSheetImportExecutionControl';
}

function sciipGet3030SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_ACTIVATION_LEDGER_SUMMARY';
}

function sciipGet3030TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_CONTROLS';
}

function sciipGet3030Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_CONTROL';
}

function sciipGet3030Headers_() {
  return [
    'Execution_Control_ID',
    'Business_Key',
    'Control_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Execution_Control_Status',
    'Execution_Control_Posture',
    'Control_Decision',
    'Blocking_Reason',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3030TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3030TargetSheet_(),
    sciipGet3030Headers_()
  );
}

function sciipRun3030_SuperSheetImportExecutionControlProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3030ProcessorName_(),
    action: sciipGet3030Action_(),
    sourceSheet: sciipGet3030SourceSheet_(),
    targetSheet: sciipGet3030TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_CONTROL_RUNTIME_LEDGER',

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
        summary: 'SuperSheet import execution control runtime payload created.',
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
      const targetSheet = sciipEnsure3030TargetSheet_();
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3030ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            executionControlStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 3020_SuperSheetImportExecutionActivationLedgerProcessor after 3010 creates execution activation records.'
          })
        });
      }

      const controlDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const controlBusinessKey = 'SUPERSHEET_IMPORT_EXECUTION_CONTROL|' + controlDate;

      if (sciip3030BusinessKeyExists_(definition.targetSheet, controlBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3030ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            executionControlStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            controlBusinessKey: controlBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const control = sciip3030ResolveExecutionControl_(sourceRecords);

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_CONTROL_' + Utilities.getUuid(),
        controlBusinessKey,
        controlDate,
        definition.sourceSheet,
        sourceRecords.length,
        control.status,
        control.posture,
        control.decision,
        control.blockingReason,
        control.summary,
        control.nextAction,
        new Date().toISOString(),
        sciipGet3030ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3030ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          executionControlStatus: control.status,
          executionControlPosture: control.posture,
          controlDecision: control.decision,
          blockingReason: control.blockingReason,
          sourceRecordsReviewed: sourceRecords.length,
          controlBusinessKey: controlBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: '3040_SuperSheetImportExecutionControlLedgerProcessor'
        })
      });
    }
  });
}

function sciip3030BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3030ResolveExecutionControl_(records) {
  const latest = records[records.length - 1] || {};
  const statusText = Object.keys(latest).map(function(key) {
    return String(latest[key] || '').toUpperCase();
  }).join(' ');

  if (
    statusText.indexOf('EXECUTION_ACTIVATION_LEDGER_ACTIVATED') !== -1 &&
    statusText.indexOf('IMPORT_EXECUTION_ACTIVATED') !== -1
  ) {
    return {
      status: 'EXECUTION_CONTROL_OPEN',
      posture: 'IMPORT_EXECUTION_CONTROL_OPEN',
      decision: 'CONTROL_OPENED',
      blockingReason: '',
      summary: 'SuperSheet import execution control opened from activated execution ledger posture.',
      nextAction: 'Proceed to execution control ledger summary.'
    };
  }

  if (
    statusText.indexOf('BLOCK') !== -1 ||
    statusText.indexOf('FAIL') !== -1 ||
    statusText.indexOf('IMPORT_EXECUTION_BLOCKED') !== -1
  ) {
    return {
      status: 'EXECUTION_CONTROL_BLOCKED',
      posture: 'IMPORT_EXECUTION_BLOCKED',
      decision: 'CONTROL_NOT_OPENED',
      blockingReason: 'Execution activation ledger indicates blocked or failed conditions.',
      summary: 'SuperSheet import execution control is blocked.',
      nextAction: 'Review execution activation ledger blockers before execution control.'
    };
  }

  return {
    status: 'EXECUTION_CONTROL_REVIEW_REQUIRED',
    posture: 'IMPORT_EXECUTION_REVIEW_REQUIRED',
    decision: 'REVIEW_REQUIRED',
    blockingReason: 'Execution activation ledger did not produce a fully activated posture.',
    summary: 'SuperSheet import execution control requires review.',
    nextAction: 'Review execution activation ledger summary before execution control.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3030_SuperSheetImportExecutionControlProcessor() {
  const result = sciipRun3030_SuperSheetImportExecutionControlProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3030_SuperSheetImportExecutionControlProcessor',
    result: result
  }));

  return result;
}