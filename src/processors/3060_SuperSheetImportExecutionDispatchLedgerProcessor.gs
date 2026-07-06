/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3060_SuperSheetImportExecutionDispatchLedgerProcessor
 *******************************************************/

function sciipGet3060ProcessorName_() {
  return '3060_SuperSheetImportExecutionDispatchLedger';
}

function sciipGet3060SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_DISPATCHES';
}

function sciipGet3060TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_DISPATCH_LEDGER_SUMMARY';
}

function sciipGet3060Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_DISPATCH_LEDGER_SUMMARY';
}

function sciipGet3060Headers_() {
  return [
    'Ledger_Summary_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Execution_Dispatched_Count',
    'Execution_Blocked_Count',
    'Review_Required_Count',
    'Execution_Dispatch_Ledger_Status',
    'Execution_Dispatch_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3060TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3060TargetSheet_(),
    sciipGet3060Headers_()
  );
}

function sciipRun3060_SuperSheetImportExecutionDispatchLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3060ProcessorName_(),
    action: sciipGet3060Action_(),
    sourceSheet: sciipGet3060SourceSheet_(),
    targetSheet: sciipGet3060TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_DISPATCH_LEDGER_RUNTIME_LEDGER',

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
        summary: 'SuperSheet import execution dispatch ledger runtime payload created.',
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
      const targetSheet = sciipEnsure3060TargetSheet_();
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3060ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            executionDispatchLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 3050_SuperSheetImportExecutionDispatchProcessor after 3040 creates execution control ledger summaries.'
          })
        });
      }

      const ledgerDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const ledgerBusinessKey = 'SUPERSHEET_IMPORT_EXECUTION_DISPATCH_LEDGER|' + ledgerDate;

      if (sciip3060BusinessKeyExists_(definition.targetSheet, ledgerBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3060ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            executionDispatchLedgerStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip3060CountExecutionDispatchStatuses_(sourceRecords);
      const posture = sciip3060ResolvePosture_(counts, sourceRecords.length);

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_DISPATCH_LEDGER_' + Utilities.getUuid(),
        ledgerBusinessKey,
        ledgerDate,
        definition.sourceSheet,
        sourceRecords.length,
        counts.dispatched,
        counts.blocked,
        counts.reviewRequired,
        posture.status,
        posture.posture,
        posture.summary,
        posture.nextAction,
        new Date().toISOString(),
        sciipGet3060ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3060ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          executionDispatchLedgerStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          executionDispatchedCount: counts.dispatched,
          executionBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          executionDispatchPosture: posture.posture,
          ledgerBusinessKey: ledgerBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: '3070_SuperSheetImportExecutionMonitorProcessor'
        })
      });
    }
  });
}

function sciip3060BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3060CountExecutionDispatchStatuses_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('EXECUTION_DISPATCHED') !== -1 ||
      statusText.indexOf('IMPORT_EXECUTION_DISPATCHED') !== -1 ||
      statusText.indexOf('DISPATCHED') !== -1
    ) {
      counts.dispatched += 1;
    } else if (
      statusText.indexOf('EXECUTION_DISPATCH_BLOCKED') !== -1 ||
      statusText.indexOf('NOT_DISPATCHED') !== -1 ||
      statusText.indexOf('IMPORT_EXECUTION_BLOCKED') !== -1 ||
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { dispatched: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3060ResolvePosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'EXECUTION_DISPATCH_LEDGER_RECORDED_WITH_BLOCKERS',
      posture: 'IMPORT_EXECUTION_BLOCKED',
      summary: 'SuperSheet import execution dispatch ledger recorded blocking conditions.',
      nextAction: 'Review blocked execution dispatch records before execution monitoring.'
    };
  }

  if (counts.dispatched > 0 && counts.dispatched === total) {
    return {
      status: 'EXECUTION_DISPATCH_LEDGER_DISPATCHED',
      posture: 'IMPORT_EXECUTION_DISPATCHED',
      summary: 'All SuperSheet import execution dispatch records were dispatched successfully.',
      nextAction: 'Proceed to SuperSheet import execution monitoring.'
    };
  }

  if (counts.dispatched > 0) {
    return {
      status: 'EXECUTION_DISPATCH_LEDGER_PARTIAL_DISPATCH',
      posture: 'IMPORT_EXECUTION_REVIEW_REQUIRED',
      summary: 'Some SuperSheet import execution dispatch records were dispatched, but not all records reached dispatched posture.',
      nextAction: 'Review execution dispatch records before monitoring.'
    };
  }

  return {
    status: 'EXECUTION_DISPATCH_LEDGER_REVIEW_REQUIRED',
    posture: 'IMPORT_EXECUTION_REVIEW_REQUIRED',
    summary: 'No dispatched SuperSheet import execution dispatch records were found.',
    nextAction: 'Run upstream execution dispatch processor with open execution control input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3060_SuperSheetImportExecutionDispatchLedgerProcessor() {
  const result = sciipRun3060_SuperSheetImportExecutionDispatchLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3060_SuperSheetImportExecutionDispatchLedgerProcessor',
    result: result
  }));

  return result;
}