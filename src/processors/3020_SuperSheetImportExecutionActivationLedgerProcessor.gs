/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3020_SuperSheetImportExecutionActivationLedgerProcessor
 *
 * SUPERSHEET_IMPORT_EXECUTION_ACTIVATIONS
 *   → SUPERSHEET_IMPORT_EXECUTION_ACTIVATION_LEDGER_SUMMARY
 *******************************************************/

function sciipGet3020ProcessorName_() {
  return '3020_SuperSheetImportExecutionActivationLedger';
}

function sciipGet3020SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_ACTIVATIONS';
}

function sciipGet3020TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_ACTIVATION_LEDGER_SUMMARY';
}

function sciipGet3020Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_ACTIVATION_LEDGER_SUMMARY';
}

function sciipGet3020Headers_() {
  return [
    'Ledger_Summary_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Execution_Activated_Count',
    'Execution_Blocked_Count',
    'Review_Required_Count',
    'Execution_Activation_Ledger_Status',
    'Execution_Activation_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3020TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3020TargetSheet_(),
    sciipGet3020Headers_()
  );
}

function sciipRun3020_SuperSheetImportExecutionActivationLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3020ProcessorName_(),
    action: sciipGet3020Action_(),
    sourceSheet: sciipGet3020SourceSheet_(),
    targetSheet: sciipGet3020TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_ACTIVATION_LEDGER_RUNTIME_LEDGER',

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
        summary: 'SuperSheet import execution activation ledger runtime payload created.',
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
      const targetSheet = sciipEnsure3020TargetSheet_();
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3020ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            executionActivationLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 3010_SuperSheetImportExecutionActivationProcessor after 3000 creates execution readiness ledger summaries.'
          })
        });
      }

      const ledgerDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const ledgerBusinessKey = 'SUPERSHEET_IMPORT_EXECUTION_ACTIVATION_LEDGER|' + ledgerDate;

      if (sciip3020BusinessKeyExists_(definition.targetSheet, ledgerBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3020ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            executionActivationLedgerStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip3020CountExecutionActivationStatuses_(sourceRecords);
      const posture = sciip3020ResolvePosture_(counts, sourceRecords.length);

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_ACTIVATION_LEDGER_' + Utilities.getUuid(),
        ledgerBusinessKey,
        ledgerDate,
        definition.sourceSheet,
        sourceRecords.length,
        counts.activated,
        counts.blocked,
        counts.reviewRequired,
        posture.status,
        posture.posture,
        posture.summary,
        posture.nextAction,
        new Date().toISOString(),
        sciipGet3020ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3020ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          executionActivationLedgerStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          executionActivatedCount: counts.activated,
          executionBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          executionActivationPosture: posture.posture,
          ledgerBusinessKey: ledgerBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: '3030_SuperSheetImportExecutionControlProcessor'
        })
      });
    }
  });
}

function sciip3020BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3020CountExecutionActivationStatuses_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('EXECUTION_ACTIVATED') !== -1 ||
      statusText.indexOf('IMPORT_EXECUTION_ACTIVATED') !== -1 ||
      statusText.indexOf('ACTIVATED') !== -1
    ) {
      counts.activated += 1;
    } else if (
      statusText.indexOf('EXECUTION_ACTIVATION_BLOCKED') !== -1 ||
      statusText.indexOf('NOT_ACTIVATED') !== -1 ||
      statusText.indexOf('IMPORT_EXECUTION_BLOCKED') !== -1 ||
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { activated: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3020ResolvePosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'EXECUTION_ACTIVATION_LEDGER_RECORDED_WITH_BLOCKERS',
      posture: 'IMPORT_EXECUTION_BLOCKED',
      summary: 'SuperSheet import execution activation ledger recorded blocking conditions.',
      nextAction: 'Review blocked execution activation records before execution control.'
    };
  }

  if (counts.activated > 0 && counts.activated === total) {
    return {
      status: 'EXECUTION_ACTIVATION_LEDGER_ACTIVATED',
      posture: 'IMPORT_EXECUTION_ACTIVATED',
      summary: 'All SuperSheet import execution activation records were activated successfully.',
      nextAction: 'Proceed to SuperSheet import execution control.'
    };
  }

  if (counts.activated > 0) {
    return {
      status: 'EXECUTION_ACTIVATION_LEDGER_PARTIAL_ACTIVATION',
      posture: 'IMPORT_EXECUTION_REVIEW_REQUIRED',
      summary: 'Some SuperSheet import execution activation records were activated, but not all records reached activated posture.',
      nextAction: 'Review execution activation records before execution control.'
    };
  }

  return {
    status: 'EXECUTION_ACTIVATION_LEDGER_REVIEW_REQUIRED',
    posture: 'IMPORT_EXECUTION_REVIEW_REQUIRED',
    summary: 'No activated SuperSheet import execution activation records were found.',
    nextAction: 'Run upstream execution activation processor with ready execution input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3020_SuperSheetImportExecutionActivationLedgerProcessor() {
  const result = sciipRun3020_SuperSheetImportExecutionActivationLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3020_SuperSheetImportExecutionActivationLedgerProcessor',
    result: result
  }));

  return result;
}