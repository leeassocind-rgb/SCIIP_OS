/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3080_SuperSheetImportExecutionMonitorLedgerProcessor
 *******************************************************/

function sciipGet3080ProcessorName_() {
  return '3080_SuperSheetImportExecutionMonitorLedger';
}

function sciipGet3080SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_MONITORS';
}

function sciipGet3080TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_MONITOR_LEDGER_SUMMARY';
}

function sciipGet3080Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_MONITOR_LEDGER_SUMMARY';
}

function sciipGet3080Headers_() {
  return [
    'Ledger_Summary_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Monitor_Active_Count',
    'Monitor_Blocked_Count',
    'Review_Required_Count',
    'Execution_Monitor_Ledger_Status',
    'Execution_Monitor_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3080TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3080TargetSheet_(),
    sciipGet3080Headers_()
  );
}

function sciipRun3080_SuperSheetImportExecutionMonitorLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3080ProcessorName_(),
    action: sciipGet3080Action_(),
    sourceSheet: sciipGet3080SourceSheet_(),
    targetSheet: sciipGet3080TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_MONITOR_LEDGER_RUNTIME_LEDGER',

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
        summary: 'SuperSheet import execution monitor ledger runtime payload created.',
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
      const targetSheet = sciipEnsure3080TargetSheet_();
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3080ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            executionMonitorLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 3070_SuperSheetImportExecutionMonitorProcessor after 3060 creates execution dispatch ledger summaries.'
          })
        });
      }

      const ledgerDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const ledgerBusinessKey = 'SUPERSHEET_IMPORT_EXECUTION_MONITOR_LEDGER|' + ledgerDate;

      if (sciip3080BusinessKeyExists_(definition.targetSheet, ledgerBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3080ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            executionMonitorLedgerStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip3080CountExecutionMonitorStatuses_(sourceRecords);
      const posture = sciip3080ResolvePosture_(counts, sourceRecords.length);

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_MONITOR_LEDGER_' + Utilities.getUuid(),
        ledgerBusinessKey,
        ledgerDate,
        definition.sourceSheet,
        sourceRecords.length,
        counts.active,
        counts.blocked,
        counts.reviewRequired,
        posture.status,
        posture.posture,
        posture.summary,
        posture.nextAction,
        new Date().toISOString(),
        sciipGet3080ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3080ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          executionMonitorLedgerStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          monitorActiveCount: counts.active,
          monitorBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          executionMonitorPosture: posture.posture,
          ledgerBusinessKey: ledgerBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: '3090_SuperSheetImportExecutionStatusProcessor'
        })
      });
    }
  });
}

function sciip3080BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3080CountExecutionMonitorStatuses_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('EXECUTION_MONITOR_ACTIVE') !== -1 ||
      statusText.indexOf('IMPORT_EXECUTION_MONITOR_ACTIVE') !== -1 ||
      statusText.indexOf('MONITORING_ACTIVE') !== -1
    ) {
      counts.active += 1;
    } else if (
      statusText.indexOf('EXECUTION_MONITOR_BLOCKED') !== -1 ||
      statusText.indexOf('MONITORING_NOT_ACTIVE') !== -1 ||
      statusText.indexOf('IMPORT_EXECUTION_BLOCKED') !== -1 ||
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { active: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3080ResolvePosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'EXECUTION_MONITOR_LEDGER_RECORDED_WITH_BLOCKERS',
      posture: 'IMPORT_EXECUTION_BLOCKED',
      summary: 'SuperSheet import execution monitor ledger recorded blocking conditions.',
      nextAction: 'Review blocked execution monitor records before execution status confirmation.'
    };
  }

  if (counts.active > 0 && counts.active === total) {
    return {
      status: 'EXECUTION_MONITOR_LEDGER_ACTIVE',
      posture: 'IMPORT_EXECUTION_MONITOR_ACTIVE',
      summary: 'All SuperSheet import execution monitor records are active.',
      nextAction: 'Proceed to SuperSheet import execution status confirmation.'
    };
  }

  if (counts.active > 0) {
    return {
      status: 'EXECUTION_MONITOR_LEDGER_PARTIAL_ACTIVE',
      posture: 'IMPORT_EXECUTION_REVIEW_REQUIRED',
      summary: 'Some SuperSheet import execution monitor records are active, but not all records reached active monitoring posture.',
      nextAction: 'Review execution monitor records before status confirmation.'
    };
  }

  return {
    status: 'EXECUTION_MONITOR_LEDGER_REVIEW_REQUIRED',
    posture: 'IMPORT_EXECUTION_REVIEW_REQUIRED',
    summary: 'No active SuperSheet import execution monitor records were found.',
    nextAction: 'Run upstream execution monitor processor with dispatched execution input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3080_SuperSheetImportExecutionMonitorLedgerProcessor() {
  const result = sciipRun3080_SuperSheetImportExecutionMonitorLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3080_SuperSheetImportExecutionMonitorLedgerProcessor',
    result: result
  }));

  return result;
}