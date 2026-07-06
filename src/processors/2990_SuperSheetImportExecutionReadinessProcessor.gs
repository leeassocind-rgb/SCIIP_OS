/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 2990_SuperSheetImportExecutionReadinessProcessor
 *
 * SUPERSHEET_IMPORT_EXECUTION_HANDOFF_LEDGER_SUMMARY
 *   → SUPERSHEET_IMPORT_EXECUTION_READINESS
 *
 * Purpose:
 * Determines whether the SuperSheet import workflow is
 * ready to enter execution after firewall release handoff.
 *******************************************************/

function sciipGet2990ProcessorName_() {
  return '2990_SuperSheetImportExecutionReadiness';
}

function sciipGet2990SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_HANDOFF_LEDGER_SUMMARY';
}

function sciipGet2990TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_READINESS';
}

function sciipGet2990Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_READINESS';
}

function sciipGet2990Headers_() {
  return [
    'Execution_Readiness_ID',
    'Business_Key',
    'Readiness_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Execution_Readiness_Status',
    'Execution_Readiness_Posture',
    'Readiness_Decision',
    'Blocking_Reason',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure2990TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet2990TargetSheet_(),
    sciipGet2990Headers_()
  );
}

function sciipRun2990_SuperSheetImportExecutionReadinessProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet2990ProcessorName_(),
    action: sciipGet2990Action_(),
    sourceSheet: sciipGet2990SourceSheet_(),
    targetSheet: sciipGet2990TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_READINESS_RUNTIME_LEDGER',

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
        summary: 'SuperSheet import execution readiness runtime payload created.',
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
      const targetSheet = sciipEnsure2990TargetSheet_();
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet2990ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            executionReadinessStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 2980_SuperSheetImportExecutionHandoffLedgerProcessor after 2970 creates execution handoff records.'
          })
        });
      }

      const readinessDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const readinessBusinessKey = 'SUPERSHEET_IMPORT_EXECUTION_READINESS|' + readinessDate;

      if (sciip2990BusinessKeyExists_(definition.targetSheet, readinessBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet2990ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            executionReadinessStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            readinessBusinessKey: readinessBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const readiness = sciip2990ResolveExecutionReadiness_(sourceRecords);

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_READINESS_' + Utilities.getUuid(),
        readinessBusinessKey,
        readinessDate,
        definition.sourceSheet,
        sourceRecords.length,
        readiness.status,
        readiness.posture,
        readiness.decision,
        readiness.blockingReason,
        readiness.summary,
        readiness.nextAction,
        new Date().toISOString(),
        sciipGet2990ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet2990ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          executionReadinessStatus: readiness.status,
          executionReadinessPosture: readiness.posture,
          readinessDecision: readiness.decision,
          blockingReason: readiness.blockingReason,
          sourceRecordsReviewed: sourceRecords.length,
          readinessBusinessKey: readinessBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: '3000_SuperSheetImportExecutionReadinessLedgerProcessor'
        })
      });
    }
  });
}

function sciip2990BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip2990ResolveExecutionReadiness_(records) {
  const latest = records[records.length - 1] || {};
  const statusText = Object.keys(latest).map(function(key) {
    return String(latest[key] || '').toUpperCase();
  }).join(' ');

  if (
    statusText.indexOf('EXECUTION_HANDOFF_LEDGER_CREATED') !== -1 &&
    statusText.indexOf('IMPORT_EXECUTION_READY') !== -1
  ) {
    return {
      status: 'EXECUTION_READY',
      posture: 'IMPORT_EXECUTION_READY',
      decision: 'READY_FOR_EXECUTION',
      blockingReason: '',
      summary: 'SuperSheet import execution readiness confirmed from execution handoff ledger.',
      nextAction: 'Proceed to execution readiness ledger summary.'
    };
  }

  if (
    statusText.indexOf('BLOCK') !== -1 ||
    statusText.indexOf('FAIL') !== -1 ||
    statusText.indexOf('IMPORT_EXECUTION_BLOCKED') !== -1
  ) {
    return {
      status: 'EXECUTION_READINESS_BLOCKED',
      posture: 'IMPORT_EXECUTION_BLOCKED',
      decision: 'NOT_READY_FOR_EXECUTION',
      blockingReason: 'Execution handoff ledger indicates blocked or failed conditions.',
      summary: 'SuperSheet import execution readiness is blocked.',
      nextAction: 'Review execution handoff ledger blockers before execution.'
    };
  }

  return {
    status: 'EXECUTION_READINESS_REVIEW_REQUIRED',
    posture: 'IMPORT_EXECUTION_REVIEW_REQUIRED',
    decision: 'REVIEW_REQUIRED',
    blockingReason: 'Execution handoff ledger did not produce a fully execution-ready posture.',
    summary: 'SuperSheet import execution readiness requires review.',
    nextAction: 'Review execution handoff ledger summary before execution.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest2990_SuperSheetImportExecutionReadinessProcessor() {
  const result = sciipRun2990_SuperSheetImportExecutionReadinessProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2990_SuperSheetImportExecutionReadinessProcessor',
    result: result
  }));

  return result;
}