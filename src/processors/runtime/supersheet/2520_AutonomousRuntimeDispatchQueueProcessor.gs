/**
 * SCIIP_OS v5.3
 * Autonomous Runtime Dispatch Queue Processor
 * File: 2520_AutonomousRuntimeDispatchQueueProcessor.gs
 *
 * Processor: 2520_AutonomousRuntimeDispatchQueue
 *
 * Purpose:
 * Reads the autonomous runtime schedule and creates a dispatch queue
 * of scheduled processors ready for future dynamic dispatch.
 */

function sciipRun2520_AutonomousRuntimeDispatchQueueProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2520_AutonomousRuntimeDispatchQueue',
    action: 'AUTONOMOUS_RUNTIME_DISPATCH_QUEUE_BUILD',
    sourceSheet: 'SCIIP_AUTONOMOUS_RUNTIME_SCHEDULE',
    targetSheet: 'SCIIP_AUTONOMOUS_RUNTIME_DISPATCH_QUEUE',
    ledgerSheet: 'SCIIP_AUTONOMOUS_RUNTIME_DISPATCH_QUEUE_LEDGER',

    buildPayload: function(context, definition) {
      var scheduleRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: scheduleRecords.length,
        outputCount: 0,
        summary: 'Autonomous runtime dispatch queue payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          priorProcessor: '2510_AutonomousRuntimeScheduleBuilder',
          runtimeVersion: 'v5.3'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Missing runtime schedule source sheet.');
      if (!definition.targetSheet) errors.push('Missing dispatch queue target sheet.');
      if (!definition.ledgerSheet) errors.push('Missing dispatch queue ledger sheet.');

      var scheduleRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      if (!scheduleRecords || scheduleRecords.length === 0) {
        errors.push('No runtime schedule records available.');
      }

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var scheduleRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      var queueHeaders = [
        'Timestamp',
        'Runtime_Version',
        'Queue_Date',
        'Queue_Key',
        'Schedule_Key',
        'Processor_Id',
        'Processor_Name',
        'Run_Function',
        'Default_Priority',
        'Default_Cadence',
        'Depends_On',
        'Produces',
        'Queue_Status',
        'Dispatch_Attempts',
        'Last_Dispatch_At',
        'Source_Business_Key'
      ];

      var ledgerHeaders = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Ledger_Status',
        'Transaction_Id',
        'Runtime_Version',
        'Schedule_Records_Read',
        'Queue_Items_Created',
        'Result_JSON'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
        definition.targetSheet,
        queueHeaders
      );

      var queueDate = SCIIP_RUNTIME.getDateKey({});
      var queued = [];

      scheduleRecords.forEach(function(record) {
        var scheduleStatus =
          String(record.Schedule_Status || '').toUpperCase();

        var dispatchEligible =
          String(record.Dispatch_Eligible || '').toUpperCase() === 'YES';

        var hasRunFunction =
          String(record.Run_Function || '').trim() !== '';

        var shouldQueue =
          scheduleStatus === 'SCHEDULED' &&
          dispatchEligible &&
          hasRunFunction;

        if (!shouldQueue) return;

        var queueKey = SCIIP_RUNTIME.makeBusinessKey([
          'QUEUE',
          record.Processor_Id,
          record.Processor_Name,
          queueDate
        ]);

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
          definition.targetSheet,
          queueHeaders,
          {
            Timestamp: new Date(),
            Runtime_Version: record.Runtime_Version || 'v5.3',
            Queue_Date: queueDate,
            Queue_Key: queueKey,
            Schedule_Key: record.Schedule_Key || '',
            Processor_Id: record.Processor_Id || '',
            Processor_Name: record.Processor_Name || '',
            Run_Function: record.Run_Function || '',
            Default_Priority: record.Default_Priority || '',
            Default_Cadence: record.Default_Cadence || '',
            Depends_On: record.Depends_On || '',
            Produces: record.Produces || '',
            Queue_Status: 'QUEUED',
            Dispatch_Attempts: 0,
            Last_Dispatch_At: '',
            Source_Business_Key: context.businessKey
          }
        );

        queued.push(record);
      });

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: queued.length,
        recordsRead: scheduleRecords.length,
        processed: scheduleRecords.length,
        message: JSON.stringify({
          runtimeDispatchQueueStatus: 'QUEUE_BUILT',
          runtimeVersion: 'v5.3',
          scheduleRecordsRead: scheduleRecords.length,
          queueItemsCreated: queued.length,
          transactionId: transaction.transactionId,
          nextProcessor: '2530_AutonomousRuntimeDispatcher'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: 'DISPATCH_QUEUE_RECORDED',
          Transaction_Id: transaction.transactionId,
          Runtime_Version: 'v5.3',
          Schedule_Records_Read: scheduleRecords.length,
          Queue_Items_Created: queued.length,
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          scheduleRecordsRead: scheduleRecords.length,
          queueItemsCreated: queued.length,
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.3 autonomous runtime dispatch queue built.'
      });

      return result;
    }
  });
}

/**
 * Standalone validation test.
 */
function sciipTest2520_AutonomousRuntimeDispatchQueueProcessor() {
  var result = sciipRun2520_AutonomousRuntimeDispatchQueueProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2520_AutonomousRuntimeDispatchQueueProcessor',
    result: result
  }));

  return result;
}