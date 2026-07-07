/**
 * SCIIP_OS v5.3.1
 * Processor Migration Ledger Processor
 * File: 2620_ProcessorMigrationLedgerProcessor.gs
 *
 * Processor: 2620_ProcessorMigrationLedger
 *
 * Purpose:
 * Creates a permanent roll-up ledger summary of the runtime migration
 * framework, inventory, plan, and queue surfaces.
 */

function sciipRun2620_ProcessorMigrationLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2620_ProcessorMigrationLedger',
    action: 'PROCESSOR_MIGRATION_LEDGER_BUILD',
    targetSheet: 'SCIIP_PROCESSOR_MIGRATION_LEDGER',
    ledgerSheet: 'SCIIP_PROCESSOR_MIGRATION_LEDGER_AUDIT',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 4,
        outputCount: 1,
        summary: 'Processor migration ledger payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          priorProcessor: '2610_ProcessorMigrationQueue',
          migrationPhase: 'v5.3.1 Runtime Refactor',
          sourceSurfaces: [
            'SCIIP_RUNTIME_MIGRATION_FRAMEWORK',
            'SCIIP_PROCESSOR_MIGRATION_INVENTORY',
            'SCIIP_PROCESSOR_MIGRATION_PLAN',
            'SCIIP_PROCESSOR_MIGRATION_QUEUE'
          ]
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Missing processor migration ledger target sheet.');
      if (!definition.ledgerSheet) errors.push('Missing processor migration ledger audit sheet.');

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var frameworkRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('SCIIP_RUNTIME_MIGRATION_FRAMEWORK');

      var inventoryRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('SCIIP_PROCESSOR_MIGRATION_INVENTORY');

      var planRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('SCIIP_PROCESSOR_MIGRATION_PLAN');

      var queueRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('SCIIP_PROCESSOR_MIGRATION_QUEUE');

      var ledgerHeaders = [
        'Timestamp',
        'Migration_Phase',
        'Processor',
        'Business_Key',
        'Ledger_Status',
        'Framework_Records',
        'Inventory_Records',
        'Plan_Records',
        'Queue_Records',
        'Already_Runtime_Native',
        'Needs_Migration',
        'Planned_Runtime_Native',
        'Blocked',
        'Deferred',
        'Queued',
        'No_Action_Required',
        'Future_Build_Standard',
        'Summary_JSON',
        'Next_Processor',
        'Transaction_Id'
      ];

      var auditHeaders = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Audit_Status',
        'Transaction_Id',
        'Migration_Phase',
        'Result_JSON'
      ];

      function countWhere(records, field, expected) {
        return records.filter(function(record) {
          return String(record[field] || '').toUpperCase() === expected;
        }).length;
      }

      var alreadyRuntimeNative =
        countWhere(inventoryRecords, 'Migration_Status', 'ALREADY_RUNTIME_NATIVE');

      var needsMigration =
        countWhere(inventoryRecords, 'Migration_Status', 'NEEDS_MIGRATION');

      var plannedRuntimeNative =
        countWhere(inventoryRecords, 'Migration_Status', 'PLANNED');

      var blocked =
        countWhere(inventoryRecords, 'Migration_Status', 'BLOCKED');

      var deferred =
        countWhere(planRecords, 'Plan_Status', 'DEFERRED');

      var queued =
        countWhere(queueRecords, 'Queue_Status', 'QUEUED');

      var noActionRequired =
        countWhere(queueRecords, 'Queue_Status', 'RECORDED_NO_ACTION_REQUIRED');

      var futureBuildStandard =
        countWhere(queueRecords, 'Queue_Status', 'RECORDED_FUTURE_STANDARD');

      var summary = {
        migrationPhase: 'v5.3.1 Runtime Refactor',
        frameworkRecords: frameworkRecords.length,
        inventoryRecords: inventoryRecords.length,
        planRecords: planRecords.length,
        queueRecords: queueRecords.length,
        alreadyRuntimeNative: alreadyRuntimeNative,
        needsMigration: needsMigration,
        plannedRuntimeNative: plannedRuntimeNative,
        blocked: blocked,
        deferred: deferred,
        queued: queued,
        noActionRequired: noActionRequired,
        futureBuildStandard: futureBuildStandard,
        liveDispatchAllowed: 'NO',
        summarizedAt: new Date().toISOString()
      };

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.targetSheet,
        ledgerHeaders,
        {
          Timestamp: new Date(),
          Migration_Phase: 'v5.3.1 Runtime Refactor',
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: 'MIGRATION_LEDGER_SUMMARY_RECORDED',
          Framework_Records: frameworkRecords.length,
          Inventory_Records: inventoryRecords.length,
          Plan_Records: planRecords.length,
          Queue_Records: queueRecords.length,
          Already_Runtime_Native: alreadyRuntimeNative,
          Needs_Migration: needsMigration,
          Planned_Runtime_Native: plannedRuntimeNative,
          Blocked: blocked,
          Deferred: deferred,
          Queued: queued,
          No_Action_Required: noActionRequired,
          Future_Build_Standard: futureBuildStandard,
          Summary_JSON: summary,
          Next_Processor: '2630_ProcessorMigrationValidation',
          Transaction_Id: transaction.transactionId
        }
      );

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead:
          frameworkRecords.length +
          inventoryRecords.length +
          planRecords.length +
          queueRecords.length,
        processed: 4,
        message: JSON.stringify({
          processorMigrationLedgerStatus: 'SUMMARY_RECORDED',
          migrationPhase: 'v5.3.1 Runtime Refactor',
          summary: summary,
          transactionId: transaction.transactionId,
          nextProcessor: '2630_ProcessorMigrationValidation'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        auditHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Audit_Status: 'MIGRATION_LEDGER_AUDIT_RECORDED',
          Transaction_Id: transaction.transactionId,
          Migration_Phase: 'v5.3.1 Runtime Refactor',
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          summary: summary,
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.3.1 processor migration ledger summary recorded.'
      });

      return result;
    }
  });
}

/**
 * Standalone validation test.
 */
function sciipTest2620_ProcessorMigrationLedgerProcessor() {
  var result = sciipRun2620_ProcessorMigrationLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2620_ProcessorMigrationLedgerProcessor',
    result: result
  }));

  return result;
}