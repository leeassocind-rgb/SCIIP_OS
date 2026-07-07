/**
 * SCIIP_OS v5.3.1
 * Processor Migration Plan Processor
 * File: 2600_ProcessorMigrationPlanProcessor.gs
 *
 * Processor: 2600_ProcessorMigrationPlan
 *
 * Purpose:
 * Converts processor migration inventory into a prioritized migration plan.
 * Does not modify processor code. Produces an execution-ready plan for
 * downstream migration queue processors.
 */

function sciipRun2600_ProcessorMigrationPlanProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2600_ProcessorMigrationPlan',
    action: 'PROCESSOR_MIGRATION_PLAN_BUILD',
    sourceSheet: 'SCIIP_PROCESSOR_MIGRATION_INVENTORY',
    targetSheet: 'SCIIP_PROCESSOR_MIGRATION_PLAN',
    ledgerSheet: 'SCIIP_PROCESSOR_MIGRATION_PLAN_LEDGER',

    buildPayload: function(context, definition) {
      var inventoryRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: inventoryRecords.length,
        outputCount: 0,
        summary: 'Processor migration plan payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          priorProcessor: '2590_ProcessorMigrationInventory',
          migrationPhase: 'v5.3.1 Runtime Refactor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Missing migration inventory source sheet.');
      if (!definition.targetSheet) errors.push('Missing migration plan target sheet.');
      if (!definition.ledgerSheet) errors.push('Missing migration plan ledger sheet.');

      var inventoryRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      if (!inventoryRecords || inventoryRecords.length === 0) {
        errors.push('No processor migration inventory records available.');
      }

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var inventoryRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      var planHeaders = [
        'Timestamp',
        'Migration_Phase',
        'Plan_Key',
        'Processor_Id',
        'Processor_Name',
        'Run_Function',
        'Test_Function',
        'Migration_Status',
        'Migration_Readiness',
        'Migration_Priority',
        'Plan_Status',
        'Plan_Order',
        'Recommended_Action',
        'Migration_Strategy',
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
        'Inventory_Records_Read',
        'Plan_Items_Created',
        'Result_JSON'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
        definition.targetSheet,
        planHeaders
      );

      var sortedRecords = inventoryRecords.slice().sort(function(a, b) {
        var aPriority = Number(a.Migration_Priority || 99);
        var bPriority = Number(b.Migration_Priority || 99);

        if (aPriority !== bPriority) return aPriority - bPriority;

        return String(a.Processor_Id || '').localeCompare(
          String(b.Processor_Id || '')
        );
      });

      var planCount = 0;

      sortedRecords.forEach(function(record, index) {
        var migrationStatus = String(record.Migration_Status || '');
        var migrationReadiness = String(record.Migration_Readiness || '');

        var planStatus = 'PLANNED';
        var migrationStrategy = 'REVIEW_AND_CLASSIFY';
        var riskLevel = 'MEDIUM';
        var requiresManualReview = 'YES';

        if (migrationStatus === 'ALREADY_RUNTIME_NATIVE') {
          planStatus = 'NO_ACTION_REQUIRED';
          migrationStrategy = 'MAINTAIN_RUNTIME_NATIVE';
          riskLevel = 'LOW';
          requiresManualReview = 'NO';
        } else if (migrationStatus === 'PLANNED') {
          planStatus = 'FUTURE_BUILD_STANDARD';
          migrationStrategy = 'BUILD_RUNTIME_NATIVE_FROM_START';
          riskLevel = 'LOW';
          requiresManualReview = 'NO';
        } else if (migrationStatus === 'NEEDS_MIGRATION') {
          planStatus = 'READY_FOR_QUEUE';
          migrationStrategy = 'REFACTOR_TO_RUNTIME_PROCESSOR_BASE';
          riskLevel = 'MEDIUM';
          requiresManualReview = 'YES';
        } else if (migrationStatus === 'LOW_PRIORITY') {
          planStatus = 'DEFERRED';
          migrationStrategy = 'MIGRATE_AFTER_DISPATCH_ELIGIBLE_PROCESSORS';
          riskLevel = 'LOW';
          requiresManualReview = 'YES';
        } else if (migrationStatus === 'BLOCKED') {
          planStatus = 'BLOCKED';
          migrationStrategy = 'RESOLVE_BLOCKER_BEFORE_MIGRATION';
          riskLevel = 'HIGH';
          requiresManualReview = 'YES';
        }

        if (migrationReadiness === 'MISSING_RUN_FUNCTION') {
          riskLevel = 'HIGH';
          requiresManualReview = 'YES';
        }

        var planKey = SCIIP_RUNTIME.makeBusinessKey([
          'MIGRATION_PLAN',
          record.Processor_Id || '',
          record.Processor_Name || '',
          SCIIP_RUNTIME.getDateKey({})
        ]);

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
          definition.targetSheet,
          planHeaders,
          {
            Timestamp: new Date(),
            Migration_Phase: 'v5.3.1 Runtime Refactor',
            Plan_Key: planKey,
            Processor_Id: record.Processor_Id || '',
            Processor_Name: record.Processor_Name || '',
            Run_Function: record.Run_Function || '',
            Test_Function: record.Test_Function || '',
            Migration_Status: migrationStatus,
            Migration_Readiness: migrationReadiness,
            Migration_Priority: record.Migration_Priority || '',
            Plan_Status: planStatus,
            Plan_Order: index + 1,
            Recommended_Action: record.Recommended_Action || '',
            Migration_Strategy: migrationStrategy,
            Risk_Level: riskLevel,
            Requires_Manual_Review: requiresManualReview,
            Source_Business_Key: context.businessKey
          }
        );

        planCount++;
      });

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: planCount,
        recordsRead: inventoryRecords.length,
        processed: inventoryRecords.length,
        message: JSON.stringify({
          processorMigrationPlanStatus: 'BUILT',
          migrationPhase: 'v5.3.1 Runtime Refactor',
          inventoryRecordsRead: inventoryRecords.length,
          planItemsCreated: planCount,
          transactionId: transaction.transactionId,
          nextProcessor: '2610_ProcessorMigrationQueue'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: 'MIGRATION_PLAN_RECORDED',
          Transaction_Id: transaction.transactionId,
          Migration_Phase: 'v5.3.1 Runtime Refactor',
          Inventory_Records_Read: inventoryRecords.length,
          Plan_Items_Created: planCount,
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          inventoryRecordsRead: inventoryRecords.length,
          planItemsCreated: planCount,
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.3.1 processor migration plan built.'
      });

      return result;
    }
  });
}

/**
 * Standalone validation test.
 */
function sciipTest2600_ProcessorMigrationPlanProcessor() {
  var result = sciipRun2600_ProcessorMigrationPlanProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2600_ProcessorMigrationPlanProcessor',
    result: result
  }));

  return result;
}