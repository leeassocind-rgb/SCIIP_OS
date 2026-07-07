/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 2980_SuperSheetImportExecutionHandoffLedgerProcessor
 *******************************************************/

function sciipGet2980ProcessorName_() {
  return '2980_SuperSheetImportExecutionHandoffLedger';
}

function sciipGet2980SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_HANDOFFS';
}

function sciipGet2980TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_HANDOFF_LEDGER_SUMMARY';
}

function sciipGet2980Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_HANDOFF_LEDGER_SUMMARY';
}

function sciipGet2980Headers_() {
  return [
    'Ledger_Summary_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Handoff_Created_Count',
    'Handoff_Blocked_Count',
    'Review_Required_Count',
    'Execution_Handoff_Ledger_Status',
    'Execution_Handoff_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure2980TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet2980TargetSheet_(),
    sciipGet2980Headers_()
  );
}

function sciipRun2980_SuperSheetImportExecutionHandoffLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet2980ProcessorName_(),
    action: sciipGet2980Action_(),
    sourceSheet: sciipGet2980SourceSheet_(),
    targetSheet: sciipGet2980TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_HANDOFF_LEDGER_RUNTIME_LEDGER',

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
        summary: 'SuperSheet import execution handoff ledger runtime payload created.',
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
      const targetSheet = sciipEnsure2980TargetSheet_();
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet2980ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            executionHandoffLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 2970_SuperSheetImportExecutionHandoffProcessor after 2960 creates release command ledger summaries.'
          })
        });
      }

      const ledgerDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const ledgerBusinessKey = 'SUPERSHEET_IMPORT_EXECUTION_HANDOFF_LEDGER|' + ledgerDate;

      if (sciip2980BusinessKeyExists_(definition.targetSheet, ledgerBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet2980ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            executionHandoffLedgerStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip2980CountHandoffStatuses_(sourceRecords);
      const posture = sciip2980ResolvePosture_(counts, sourceRecords.length);

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_HANDOFF_LEDGER_' + Utilities.getUuid(),
        ledgerBusinessKey,
        ledgerDate,
        definition.sourceSheet,
        sourceRecords.length,
        counts.handoffCreated,
        counts.handoffBlocked,
        counts.reviewRequired,
        posture.status,
        posture.posture,
        posture.summary,
        posture.nextAction,
        new Date().toISOString(),
        sciipGet2980ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet2980ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          executionHandoffLedgerStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          handoffCreatedCount: counts.handoffCreated,
          handoffBlockedCount: counts.handoffBlocked,
          reviewRequiredCount: counts.reviewRequired,
          executionHandoffPosture: posture.posture,
          ledgerBusinessKey: ledgerBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: '2990_SuperSheetImportExecutionReadinessProcessor'
        })
      });
    }
  });
}

function sciip2980BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip2980CountHandoffStatuses_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('EXECUTION_HANDOFF_CREATED') !== -1 ||
      statusText.indexOf('IMPORT_EXECUTION_READY') !== -1 ||
      statusText.indexOf('HANDOFF_CREATED') !== -1
    ) {
      counts.handoffCreated += 1;
    } else if (
      statusText.indexOf('EXECUTION_HANDOFF_BLOCKED') !== -1 ||
      statusText.indexOf('HANDOFF_NOT_CREATED') !== -1 ||
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1
    ) {
      counts.handoffBlocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { handoffCreated: 0, handoffBlocked: 0, reviewRequired: 0 });
}

function sciip2980ResolvePosture_(counts, total) {
  if (counts.handoffBlocked > 0) {
    return {
      status: 'EXECUTION_HANDOFF_LEDGER_RECORDED_WITH_BLOCKERS',
      posture: 'IMPORT_EXECUTION_BLOCKED',
      summary: 'SuperSheet import execution handoff ledger recorded blocking conditions.',
      nextAction: 'Review blocked execution handoff records before execution readiness.'
    };
  }

  if (counts.handoffCreated > 0 && counts.handoffCreated === total) {
    return {
      status: 'EXECUTION_HANDOFF_LEDGER_CREATED',
      posture: 'IMPORT_EXECUTION_READY',
      summary: 'All SuperSheet import execution handoff records were created successfully.',
      nextAction: 'Proceed to SuperSheet import execution readiness.'
    };
  }

  if (counts.handoffCreated > 0) {
    return {
      status: 'EXECUTION_HANDOFF_LEDGER_PARTIAL_HANDOFF',
      posture: 'IMPORT_EXECUTION_REVIEW_REQUIRED',
      summary: 'Some SuperSheet import execution handoff records were created, but not all records reached execution-ready posture.',
      nextAction: 'Review execution handoff records before execution readiness.'
    };
  }

  return {
    status: 'EXECUTION_HANDOFF_LEDGER_REVIEW_REQUIRED',
    posture: 'IMPORT_EXECUTION_REVIEW_REQUIRED',
    summary: 'No created SuperSheet import execution handoff records were found.',
    nextAction: 'Run upstream execution handoff processor with issued release command input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest2980_SuperSheetImportExecutionHandoffLedgerProcessor() {
  const result = sciipRun2980_SuperSheetImportExecutionHandoffLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2980_SuperSheetImportExecutionHandoffLedgerProcessor',
    result: result
  }));

  return result;
}