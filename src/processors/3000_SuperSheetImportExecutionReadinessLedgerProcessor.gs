/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3000_SuperSheetImportExecutionReadinessLedgerProcessor
 *
 * SUPERSHEET_IMPORT_EXECUTION_READINESS
 *   → SUPERSHEET_IMPORT_EXECUTION_READINESS_LEDGER_SUMMARY
 *******************************************************/

function sciipGet3000ProcessorName_() {
  return '3000_SuperSheetImportExecutionReadinessLedger';
}

function sciipGet3000SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_READINESS';
}

function sciipGet3000TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_READINESS_LEDGER_SUMMARY';
}

function sciipGet3000Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_READINESS_LEDGER_SUMMARY';
}

function sciipGet3000Headers_() {
  return [
    'Ledger_Summary_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Execution_Ready_Count',
    'Execution_Blocked_Count',
    'Review_Required_Count',
    'Execution_Readiness_Ledger_Status',
    'Execution_Readiness_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3000TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3000TargetSheet_(),
    sciipGet3000Headers_()
  );
}

function sciipRun3000_SuperSheetImportExecutionReadinessLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3000ProcessorName_(),
    action: sciipGet3000Action_(),
    sourceSheet: sciipGet3000SourceSheet_(),
    targetSheet: sciipGet3000TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_READINESS_LEDGER_RUNTIME_LEDGER',

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
        summary: 'SuperSheet import execution readiness ledger runtime payload created.',
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
      const targetSheet = sciipEnsure3000TargetSheet_();
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3000ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            executionReadinessLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 2990_SuperSheetImportExecutionReadinessProcessor after 2980 creates execution handoff ledger summaries.'
          })
        });
      }

      const ledgerDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const ledgerBusinessKey = 'SUPERSHEET_IMPORT_EXECUTION_READINESS_LEDGER|' + ledgerDate;

      if (sciip3000BusinessKeyExists_(definition.targetSheet, ledgerBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3000ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            executionReadinessLedgerStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip3000CountExecutionReadinessStatuses_(sourceRecords);
      const posture = sciip3000ResolvePosture_(counts, sourceRecords.length);

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_READINESS_LEDGER_' + Utilities.getUuid(),
        ledgerBusinessKey,
        ledgerDate,
        definition.sourceSheet,
        sourceRecords.length,
        counts.ready,
        counts.blocked,
        counts.reviewRequired,
        posture.status,
        posture.posture,
        posture.summary,
        posture.nextAction,
        new Date().toISOString(),
        sciipGet3000ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3000ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          executionReadinessLedgerStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          executionReadyCount: counts.ready,
          executionBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          executionReadinessPosture: posture.posture,
          ledgerBusinessKey: ledgerBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: '3010_SuperSheetImportExecutionActivationProcessor'
        })
      });
    }
  });
}

function sciip3000BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3000CountExecutionReadinessStatuses_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('EXECUTION_READY') !== -1 ||
      statusText.indexOf('IMPORT_EXECUTION_READY') !== -1 ||
      statusText.indexOf('READY_FOR_EXECUTION') !== -1
    ) {
      counts.ready += 1;
    } else if (
      statusText.indexOf('EXECUTION_READINESS_BLOCKED') !== -1 ||
      statusText.indexOf('NOT_READY_FOR_EXECUTION') !== -1 ||
      statusText.indexOf('IMPORT_EXECUTION_BLOCKED') !== -1 ||
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { ready: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3000ResolvePosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'EXECUTION_READINESS_LEDGER_RECORDED_WITH_BLOCKERS',
      posture: 'IMPORT_EXECUTION_BLOCKED',
      summary: 'SuperSheet import execution readiness ledger recorded blocking conditions.',
      nextAction: 'Review blocked execution readiness records before execution activation.'
    };
  }

  if (counts.ready > 0 && counts.ready === total) {
    return {
      status: 'EXECUTION_READINESS_LEDGER_READY',
      posture: 'IMPORT_EXECUTION_READY',
      summary: 'All SuperSheet import execution readiness records are ready for execution.',
      nextAction: 'Proceed to SuperSheet import execution activation.'
    };
  }

  if (counts.ready > 0) {
    return {
      status: 'EXECUTION_READINESS_LEDGER_PARTIAL_READY',
      posture: 'IMPORT_EXECUTION_REVIEW_REQUIRED',
      summary: 'Some SuperSheet import execution readiness records are ready, but not all records reached execution-ready posture.',
      nextAction: 'Review execution readiness records before activation.'
    };
  }

  return {
    status: 'EXECUTION_READINESS_LEDGER_REVIEW_REQUIRED',
    posture: 'IMPORT_EXECUTION_REVIEW_REQUIRED',
    summary: 'No execution-ready SuperSheet import readiness records were found.',
    nextAction: 'Run upstream execution readiness processor with valid handoff ledger input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3000_SuperSheetImportExecutionReadinessLedgerProcessor() {
  const result = sciipRun3000_SuperSheetImportExecutionReadinessLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3000_SuperSheetImportExecutionReadinessLedgerProcessor',
    result: result
  }));

  return result;
}