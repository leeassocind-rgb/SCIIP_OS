/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3040_SuperSheetImportExecutionControlLedgerProcessor
 *
 * SUPERSHEET_IMPORT_EXECUTION_CONTROLS
 *   → SUPERSHEET_IMPORT_EXECUTION_CONTROL_LEDGER_SUMMARY
 *******************************************************/

function sciipGet3040ProcessorName_() {
  return '3040_SuperSheetImportExecutionControlLedger';
}

function sciipGet3040SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_CONTROLS';
}

function sciipGet3040TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_CONTROL_LEDGER_SUMMARY';
}

function sciipGet3040Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_CONTROL_LEDGER_SUMMARY';
}

function sciipGet3040Headers_() {
  return [
    'Ledger_Summary_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Execution_Control_Open_Count',
    'Execution_Control_Blocked_Count',
    'Review_Required_Count',
    'Execution_Control_Ledger_Status',
    'Execution_Control_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3040TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3040TargetSheet_(),
    sciipGet3040Headers_()
  );
}

function sciipRun3040_SuperSheetImportExecutionControlLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3040ProcessorName_(),
    action: sciipGet3040Action_(),
    sourceSheet: sciipGet3040SourceSheet_(),
    targetSheet: sciipGet3040TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_CONTROL_LEDGER_RUNTIME_LEDGER',

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
        summary: 'SuperSheet import execution control ledger runtime payload created.',
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
      const targetSheet = sciipEnsure3040TargetSheet_();
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3040ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            executionControlLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 3030_SuperSheetImportExecutionControlProcessor after 3020 creates execution activation ledger summaries.'
          })
        });
      }

      const ledgerDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const ledgerBusinessKey = 'SUPERSHEET_IMPORT_EXECUTION_CONTROL_LEDGER|' + ledgerDate;

      if (sciip3040BusinessKeyExists_(definition.targetSheet, ledgerBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3040ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            executionControlLedgerStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip3040CountExecutionControlStatuses_(sourceRecords);
      const posture = sciip3040ResolvePosture_(counts, sourceRecords.length);

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_CONTROL_LEDGER_' + Utilities.getUuid(),
        ledgerBusinessKey,
        ledgerDate,
        definition.sourceSheet,
        sourceRecords.length,
        counts.open,
        counts.blocked,
        counts.reviewRequired,
        posture.status,
        posture.posture,
        posture.summary,
        posture.nextAction,
        new Date().toISOString(),
        sciipGet3040ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3040ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          executionControlLedgerStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          executionControlOpenCount: counts.open,
          executionControlBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          executionControlPosture: posture.posture,
          ledgerBusinessKey: ledgerBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: '3050_SuperSheetImportExecutionDispatchProcessor'
        })
      });
    }
  });
}

function sciip3040BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3040CountExecutionControlStatuses_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('EXECUTION_CONTROL_OPEN') !== -1 ||
      statusText.indexOf('IMPORT_EXECUTION_CONTROL_OPEN') !== -1 ||
      statusText.indexOf('CONTROL_OPENED') !== -1
    ) {
      counts.open += 1;
    } else if (
      statusText.indexOf('EXECUTION_CONTROL_BLOCKED') !== -1 ||
      statusText.indexOf('CONTROL_NOT_OPENED') !== -1 ||
      statusText.indexOf('IMPORT_EXECUTION_BLOCKED') !== -1 ||
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { open: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3040ResolvePosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'EXECUTION_CONTROL_LEDGER_RECORDED_WITH_BLOCKERS',
      posture: 'IMPORT_EXECUTION_BLOCKED',
      summary: 'SuperSheet import execution control ledger recorded blocking conditions.',
      nextAction: 'Review blocked execution control records before execution dispatch.'
    };
  }

  if (counts.open > 0 && counts.open === total) {
    return {
      status: 'EXECUTION_CONTROL_LEDGER_OPEN',
      posture: 'IMPORT_EXECUTION_CONTROL_OPEN',
      summary: 'All SuperSheet import execution control records are open.',
      nextAction: 'Proceed to SuperSheet import execution dispatch.'
    };
  }

  if (counts.open > 0) {
    return {
      status: 'EXECUTION_CONTROL_LEDGER_PARTIAL_OPEN',
      posture: 'IMPORT_EXECUTION_REVIEW_REQUIRED',
      summary: 'Some SuperSheet import execution control records are open, but not all records reached control-open posture.',
      nextAction: 'Review execution control records before dispatch.'
    };
  }

  return {
    status: 'EXECUTION_CONTROL_LEDGER_REVIEW_REQUIRED',
    posture: 'IMPORT_EXECUTION_REVIEW_REQUIRED',
    summary: 'No open SuperSheet import execution control records were found.',
    nextAction: 'Run upstream execution control processor with activated execution input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3040_SuperSheetImportExecutionControlLedgerProcessor() {
  const result = sciipRun3040_SuperSheetImportExecutionControlLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3040_SuperSheetImportExecutionControlLedgerProcessor',
    result: result
  }));

  return result;
}