/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3050_SuperSheetImportExecutionDispatchProcessor
 *
 * SUPERSHEET_IMPORT_EXECUTION_CONTROL_LEDGER_SUMMARY
 *   → SUPERSHEET_IMPORT_EXECUTION_DISPATCHES
 *******************************************************/

function sciipGet3050ProcessorName_() {
  return '3050_SuperSheetImportExecutionDispatch';
}

function sciipGet3050SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_CONTROL_LEDGER_SUMMARY';
}

function sciipGet3050TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_DISPATCHES';
}

function sciipGet3050Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_DISPATCH';
}

function sciipGet3050Headers_() {
  return [
    'Execution_Dispatch_ID',
    'Business_Key',
    'Dispatch_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Execution_Dispatch_Status',
    'Execution_Dispatch_Posture',
    'Dispatch_Decision',
    'Blocking_Reason',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3050TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3050TargetSheet_(),
    sciipGet3050Headers_()
  );
}

function sciipRun3050_SuperSheetImportExecutionDispatchProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3050ProcessorName_(),
    action: sciipGet3050Action_(),
    sourceSheet: sciipGet3050SourceSheet_(),
    targetSheet: sciipGet3050TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_DISPATCH_RUNTIME_LEDGER',

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
        summary: 'SuperSheet import execution dispatch runtime payload created.',
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
      const targetSheet = sciipEnsure3050TargetSheet_();
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3050ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            executionDispatchStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 3040_SuperSheetImportExecutionControlLedgerProcessor after 3030 creates execution control records.'
          })
        });
      }

      const dispatchDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const dispatchBusinessKey = 'SUPERSHEET_IMPORT_EXECUTION_DISPATCH|' + dispatchDate;

      if (sciip3050BusinessKeyExists_(definition.targetSheet, dispatchBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3050ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            executionDispatchStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            dispatchBusinessKey: dispatchBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const dispatch = sciip3050ResolveExecutionDispatch_(sourceRecords);

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_DISPATCH_' + Utilities.getUuid(),
        dispatchBusinessKey,
        dispatchDate,
        definition.sourceSheet,
        sourceRecords.length,
        dispatch.status,
        dispatch.posture,
        dispatch.decision,
        dispatch.blockingReason,
        dispatch.summary,
        dispatch.nextAction,
        new Date().toISOString(),
        sciipGet3050ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3050ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          executionDispatchStatus: dispatch.status,
          executionDispatchPosture: dispatch.posture,
          dispatchDecision: dispatch.decision,
          blockingReason: dispatch.blockingReason,
          sourceRecordsReviewed: sourceRecords.length,
          dispatchBusinessKey: dispatchBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: '3060_SuperSheetImportExecutionDispatchLedgerProcessor'
        })
      });
    }
  });
}

function sciip3050BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3050ResolveExecutionDispatch_(records) {
  const latest = records[records.length - 1] || {};
  const statusText = Object.keys(latest).map(function(key) {
    return String(latest[key] || '').toUpperCase();
  }).join(' ');

  if (
    statusText.indexOf('EXECUTION_CONTROL_LEDGER_OPEN') !== -1 &&
    statusText.indexOf('IMPORT_EXECUTION_CONTROL_OPEN') !== -1
  ) {
    return {
      status: 'EXECUTION_DISPATCHED',
      posture: 'IMPORT_EXECUTION_DISPATCHED',
      decision: 'DISPATCHED',
      blockingReason: '',
      summary: 'SuperSheet import execution dispatched from open execution control ledger posture.',
      nextAction: 'Proceed to execution dispatch ledger summary.'
    };
  }

  if (
    statusText.indexOf('BLOCK') !== -1 ||
    statusText.indexOf('FAIL') !== -1 ||
    statusText.indexOf('IMPORT_EXECUTION_BLOCKED') !== -1
  ) {
    return {
      status: 'EXECUTION_DISPATCH_BLOCKED',
      posture: 'IMPORT_EXECUTION_BLOCKED',
      decision: 'NOT_DISPATCHED',
      blockingReason: 'Execution control ledger indicates blocked or failed conditions.',
      summary: 'SuperSheet import execution dispatch is blocked.',
      nextAction: 'Review execution control ledger blockers before dispatch.'
    };
  }

  return {
    status: 'EXECUTION_DISPATCH_REVIEW_REQUIRED',
    posture: 'IMPORT_EXECUTION_REVIEW_REQUIRED',
    decision: 'REVIEW_REQUIRED',
    blockingReason: 'Execution control ledger did not produce a fully open execution control posture.',
    summary: 'SuperSheet import execution dispatch requires review.',
    nextAction: 'Review execution control ledger summary before dispatch.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3050_SuperSheetImportExecutionDispatchProcessor() {
  const result = sciipRun3050_SuperSheetImportExecutionDispatchProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3050_SuperSheetImportExecutionDispatchProcessor',
    result: result
  }));

  return result;
}