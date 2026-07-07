/**
 * SCIIP_OS v5.3
 * Autonomous Runtime Dispatcher Processor
 * File: 2530_AutonomousRuntimeDispatcherProcessor.gs
 *
 * Processor: 2530_AutonomousRuntimeDispatcher
 *
 * Purpose:
 * Reads the autonomous runtime dispatch queue and records dry-run
 * dispatch decisions. This is intentionally non-executing until
 * governance and guardrails are certified.
 */

function sciipRun2530_AutonomousRuntimeDispatcherProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2530_AutonomousRuntimeDispatcher',
    action: 'AUTONOMOUS_RUNTIME_DISPATCH_DRY_RUN',
    sourceSheet: 'SCIIP_AUTONOMOUS_RUNTIME_DISPATCH_QUEUE',
    targetSheet: 'SCIIP_AUTONOMOUS_RUNTIME_DISPATCH_LEDGER',
    ledgerSheet: 'SCIIP_AUTONOMOUS_RUNTIME_DISPATCH_DECISION_LEDGER',

    buildPayload: function(context, definition) {
      var queueRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: queueRecords.length,
        outputCount: 0,
        summary: 'Autonomous runtime dispatcher dry-run payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          priorProcessor: '2520_AutonomousRuntimeDispatchQueue',
          runtimeVersion: 'v5.3',
          dispatchMode: 'DRY_RUN'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Missing dispatch queue source sheet.');
      if (!definition.targetSheet) errors.push('Missing dispatch ledger target sheet.');
      if (!definition.ledgerSheet) errors.push('Missing dispatch decision ledger sheet.');

      var queueRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      if (!queueRecords || queueRecords.length === 0) {
        errors.push('No autonomous runtime dispatch queue records available.');
      }

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var queueRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      var dispatchHeaders = [
        'Timestamp',
        'Runtime_Version',
        'Dispatch_Mode',
        'Dispatch_Key',
        'Queue_Key',
        'Processor_Id',
        'Processor_Name',
        'Run_Function',
        'Dispatch_Decision',
        'Dispatch_Status',
        'Dispatch_Reason',
        'Default_Priority',
        'Depends_On',
        'Produces',
        'Transaction_Id',
        'Source_Business_Key'
      ];

      var decisionLedgerHeaders = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Ledger_Status',
        'Transaction_Id',
        'Runtime_Version',
        'Queue_Records_Read',
        'Dispatch_Decisions_Created',
        'Dispatches_Executed',
        'Result_JSON'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
        definition.targetSheet,
        dispatchHeaders
      );

      var dispatchDate = SCIIP_RUNTIME.getDateKey({});
      var decisionsCreated = 0;
      var dispatchesExecuted = 0;

      queueRecords.forEach(function(record) {
        var queueStatus =
          String(record.Queue_Status || '').toUpperCase();

        var hasRunFunction =
          String(record.Run_Function || '').trim() !== '';

        var dispatchDecision = 'DO_NOT_DISPATCH';
        var dispatchStatus = 'DRY_RUN_SKIPPED';
        var dispatchReason = 'Queue item is not dispatchable.';

        if (queueStatus === 'QUEUED' && hasRunFunction) {
          dispatchDecision = 'DISPATCHABLE';
          dispatchStatus = 'DRY_RUN_RECORDED';
          dispatchReason =
            'Dry-run dispatch decision recorded. Execution intentionally disabled until governance certification.';
        }

        var dispatchKey = SCIIP_RUNTIME.makeBusinessKey([
          'DISPATCH',
          record.Processor_Id,
          record.Processor_Name,
          dispatchDate,
          record.Queue_Key || ''
        ]);

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
          definition.targetSheet,
          dispatchHeaders,
          {
            Timestamp: new Date(),
            Runtime_Version: record.Runtime_Version || 'v5.3',
            Dispatch_Mode: 'DRY_RUN',
            Dispatch_Key: dispatchKey,
            Queue_Key: record.Queue_Key || '',
            Processor_Id: record.Processor_Id || '',
            Processor_Name: record.Processor_Name || '',
            Run_Function: record.Run_Function || '',
            Dispatch_Decision: dispatchDecision,
            Dispatch_Status: dispatchStatus,
            Dispatch_Reason: dispatchReason,
            Default_Priority: record.Default_Priority || '',
            Depends_On: record.Depends_On || '',
            Produces: record.Produces || '',
            Transaction_Id: transaction.transactionId,
            Source_Business_Key: context.businessKey
          }
        );

        decisionsCreated++;
      });

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: decisionsCreated,
        recordsRead: queueRecords.length,
        processed: queueRecords.length,
        message: JSON.stringify({
          runtimeDispatcherStatus: 'DRY_RUN_DISPATCH_DECISIONS_RECORDED',
          runtimeVersion: 'v5.3',
          queueRecordsRead: queueRecords.length,
          dispatchDecisionsCreated: decisionsCreated,
          dispatchesExecuted: dispatchesExecuted,
          executionMode: 'DRY_RUN_ONLY',
          transactionId: transaction.transactionId,
          nextProcessor: '2540_AutonomousRuntimeMonitor'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        decisionLedgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: 'DISPATCH_DRY_RUN_RECORDED',
          Transaction_Id: transaction.transactionId,
          Runtime_Version: 'v5.3',
          Queue_Records_Read: queueRecords.length,
          Dispatch_Decisions_Created: decisionsCreated,
          Dispatches_Executed: dispatchesExecuted,
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          queueRecordsRead: queueRecords.length,
          dispatchDecisionsCreated: decisionsCreated,
          dispatchesExecuted: dispatchesExecuted,
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.3 autonomous runtime dispatcher dry-run completed.'
      });

      return result;
    }
  });
}

/**
 * Standalone validation test.
 */
function sciipTest2530_AutonomousRuntimeDispatcherProcessor() {
  var result = sciipRun2530_AutonomousRuntimeDispatcherProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2530_AutonomousRuntimeDispatcherProcessor',
    result: result
  }));

  return result;
}