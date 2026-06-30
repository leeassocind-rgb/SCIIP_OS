/**
 * SCIIP_OS v5.3.1
 * Processor Migration Queue Processor
 * File: 2610_ProcessorMigrationQueueProcessor.gs
 *
 * Processor: 2610_ProcessorMigrationQueue
 *
 * Purpose:
 * Converts the processor migration plan into a safe migration queue.
 * Only queues safe categories:
 * READY_FOR_QUEUE, FUTURE_BUILD_STANDARD, NO_ACTION_REQUIRED.
 * Blocked and deferred items remain excluded.
 */

function sciipRun2610_ProcessorMigrationQueueProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2610_ProcessorMigrationQueue',
    action: 'PROCESSOR_MIGRATION_QUEUE_BUILD',
    sourceSheet: 'SCIIP_PROCESSOR_MIGRATION_PLAN',
    targetSheet: 'SCIIP_PROCESSOR_MIGRATION_QUEUE',
    ledgerSheet: 'SCIIP_PROCESSOR_MIGRATION_QUEUE_LEDGER',

    buildPayload: function(context, definition) {
      var planRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: planRecords.length,
        outputCount: 0,
        summary: 'Processor migration queue payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          priorProcessor: '2600_ProcessorMigrationPlan',
          migrationPhase: 'v5.3.1 Runtime Refactor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Missing migration plan source sheet.');
      if (!definition.targetSheet) errors.push('Missing migration queue target sheet.');
      if (!definition.ledgerSheet) errors.push('Missing migration queue ledger sheet.');

      var planRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      if (!planRecords || planRecords.length === 0) {
        errors.push('No processor migration plan records available.');
      }

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var planRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      var queueHeaders = [
        'Timestamp',
        'Migration_Phase',
        'Queue_Key',
        'Plan_Key',
        'Processor_Id',
        'Processor_Name',
        'Run_Function',
        'Test_Function',
        'Plan_Status',
        'Migration_Strategy',
        'Migration_Priority',
        'Plan_Order',
        'Queue_Status',
        'Queue_Reason',
        'Risk_Level',
        'Requires_Manual_Review',
        'Source_Business_Key'
      ];

      var ledgerHeaders = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Ledger_Status',
        'Transaction_Id',
        'Migration_Phase',
        'Plan_Records_Read',
        'Queue_Items_Created',
        'Items_Excluded',
        'Result_JSON'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
        definition.targetSheet,
        queueHeaders
      );

      var queueableStatuses = [
        'READY_FOR_QUEUE',
        'FUTURE_BUILD_STANDARD',
        'NO_ACTION_REQUIRED'
      ];

      var queuedCount = 0;
      var excludedCount = 0;

      planRecords.forEach(function(record) {
        var planStatus = String(record.Plan_Status || '').toUpperCase();

        var shouldQueue = queueableStatuses.indexOf(planStatus) !== -1;

        if (!shouldQueue) {
          excludedCount++;
          return;
        }

        var queueKey = SCIIP_RUNTIME.makeBusinessKey([
          'MIGRATION_QUEUE',
          record.Processor_Id || '',
          record.Processor_Name || '',
          SCIIP_RUNTIME.getDateKey({})
        ]);

        var queueStatus = 'QUEUED';
        var queueReason = 'Processor migration item queued.';

        if (planStatus === 'NO_ACTION_REQUIRED') {
          queueStatus = 'RECORDED_NO_ACTION_REQUIRED';
          queueReason = 'Processor already runtime-native; recorded for completeness.';
        }

        if (planStatus === 'FUTURE_BUILD_STANDARD') {
          queueStatus = 'RECORDED_FUTURE_STANDARD';
          queueReason = 'Future processor should be built runtime-native from inception.';
        }

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
          definition.targetSheet,
          queueHeaders,
          {
            Timestamp: new Date(),
            Migration_Phase: 'v5.3.1 Runtime Refactor',
            Queue_Key: queueKey,
            Plan_Key: record.Plan_Key || '',
            Processor_Id: record.Processor_Id || '',
            Processor_Name: record.Processor_Name || '',
            Run_Function: record.Run_Function || '',
            Test_Function: record.Test_Function || '',
            Plan_Status: record.Plan_Status || '',
            Migration_Strategy: record.Migration_Strategy || '',
            Migration_Priority: record.Migration_Priority || '',
            Plan_Order: record.Plan_Order || '',
            Queue_Status: queueStatus,
            Queue_Reason: queueReason,
            Risk_Level: record.Risk_Level || '',
            Requires_Manual_Review: record.Requires_Manual_Review || '',
            Source_Business_Key: context.businessKey
          }
        );

        queuedCount++;
      });

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: queuedCount,
        recordsRead: planRecords.length,
        processed: planRecords.length,
        message: JSON.stringify({
          processorMigrationQueueStatus: 'BUILT',
          migrationPhase: 'v5.3.1 Runtime Refactor',
          planRecordsRead: planRecords.length,
          queueItemsCreated: queuedCount,
          itemsExcluded: excludedCount,
          transactionId: transaction.transactionId,
          nextProcessor: '2620_ProcessorMigrationLedger'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: 'MIGRATION_QUEUE_RECORDED',
          Transaction_Id: transaction.transactionId,
          Migration_Phase: 'v5.3.1 Runtime Refactor',
          Plan_Records_Read: planRecords.length,
          Queue_Items_Created: queuedCount,
          Items_Excluded: excludedCount,
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          planRecordsRead: planRecords.length,
          queueItemsCreated: queuedCount,
          itemsExcluded: excludedCount,
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.3.1 processor migration queue built.'
      });

      return result;
    }
  });
}

/**
 * Standalone validation test.
 */
function sciipTest2610_ProcessorMigrationQueueProcessor() {
  var result = sciipRun2610_ProcessorMigrationQueueProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2610_ProcessorMigrationQueueProcessor',
    result: result
  }));

  return result;
}