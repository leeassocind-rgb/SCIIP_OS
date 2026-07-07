/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3070_SuperSheetImportExecutionMonitorProcessor
 *******************************************************/

function sciipGet3070ProcessorName_() {
  return '3070_SuperSheetImportExecutionMonitor';
}

function sciipGet3070SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_DISPATCH_LEDGER_SUMMARY';
}

function sciipGet3070TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_MONITORS';
}

function sciipGet3070Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_MONITOR';
}

function sciipGet3070Headers_() {
  return [
    'Execution_Monitor_ID',
    'Business_Key',
    'Monitor_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Execution_Monitor_Status',
    'Execution_Monitor_Posture',
    'Monitor_Decision',
    'Blocking_Reason',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3070TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3070TargetSheet_(),
    sciipGet3070Headers_()
  );
}

function sciipRun3070_SuperSheetImportExecutionMonitorProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3070ProcessorName_(),
    action: sciipGet3070Action_(),
    sourceSheet: sciipGet3070SourceSheet_(),
    targetSheet: sciipGet3070TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_MONITOR_RUNTIME_LEDGER',

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
        summary: 'SuperSheet import execution monitor runtime payload created.',
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
      const targetSheet = sciipEnsure3070TargetSheet_();
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3070ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            executionMonitorStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 3060_SuperSheetImportExecutionDispatchLedgerProcessor after 3050 creates execution dispatch records.'
          })
        });
      }

      const monitorDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const monitorBusinessKey = 'SUPERSHEET_IMPORT_EXECUTION_MONITOR|' + monitorDate;

      if (sciip3070BusinessKeyExists_(definition.targetSheet, monitorBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3070ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            executionMonitorStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            monitorBusinessKey: monitorBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const monitor = sciip3070ResolveExecutionMonitor_(sourceRecords);

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_MONITOR_' + Utilities.getUuid(),
        monitorBusinessKey,
        monitorDate,
        definition.sourceSheet,
        sourceRecords.length,
        monitor.status,
        monitor.posture,
        monitor.decision,
        monitor.blockingReason,
        monitor.summary,
        monitor.nextAction,
        new Date().toISOString(),
        sciipGet3070ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3070ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          executionMonitorStatus: monitor.status,
          executionMonitorPosture: monitor.posture,
          monitorDecision: monitor.decision,
          blockingReason: monitor.blockingReason,
          sourceRecordsReviewed: sourceRecords.length,
          monitorBusinessKey: monitorBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: '3080_SuperSheetImportExecutionMonitorLedgerProcessor'
        })
      });
    }
  });
}

function sciip3070BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3070ResolveExecutionMonitor_(records) {
  const latest = records[records.length - 1] || {};
  const statusText = Object.keys(latest).map(function(key) {
    return String(latest[key] || '').toUpperCase();
  }).join(' ');

  if (
    statusText.indexOf('EXECUTION_DISPATCH_LEDGER_DISPATCHED') !== -1 &&
    statusText.indexOf('IMPORT_EXECUTION_DISPATCHED') !== -1
  ) {
    return {
      status: 'EXECUTION_MONITOR_ACTIVE',
      posture: 'IMPORT_EXECUTION_MONITOR_ACTIVE',
      decision: 'MONITORING_ACTIVE',
      blockingReason: '',
      summary: 'SuperSheet import execution monitoring activated from dispatched execution ledger posture.',
      nextAction: 'Proceed to execution monitor ledger summary.'
    };
  }

  if (
    statusText.indexOf('BLOCK') !== -1 ||
    statusText.indexOf('FAIL') !== -1 ||
    statusText.indexOf('IMPORT_EXECUTION_BLOCKED') !== -1
  ) {
    return {
      status: 'EXECUTION_MONITOR_BLOCKED',
      posture: 'IMPORT_EXECUTION_BLOCKED',
      decision: 'MONITORING_NOT_ACTIVE',
      blockingReason: 'Execution dispatch ledger indicates blocked or failed conditions.',
      summary: 'SuperSheet import execution monitoring is blocked.',
      nextAction: 'Review execution dispatch ledger blockers before monitoring.'
    };
  }

  return {
    status: 'EXECUTION_MONITOR_REVIEW_REQUIRED',
    posture: 'IMPORT_EXECUTION_REVIEW_REQUIRED',
    decision: 'REVIEW_REQUIRED',
    blockingReason: 'Execution dispatch ledger did not produce a fully dispatched posture.',
    summary: 'SuperSheet import execution monitoring requires review.',
    nextAction: 'Review execution dispatch ledger summary before monitoring.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3070_SuperSheetImportExecutionMonitorProcessor() {
  const result = sciipRun3070_SuperSheetImportExecutionMonitorProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3070_SuperSheetImportExecutionMonitorProcessor',
    result: result
  }));

  return result;
}