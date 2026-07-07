/**
 * SCIIP_OS v5.3.1
 * Processor Migration Inventory Processor
 * File: 2590_ProcessorMigrationInventoryProcessor.gs
 *
 * Processor: 2590_ProcessorMigrationInventory
 *
 * Purpose:
 * Inventories runtime-registered processors and classifies their migration
 * readiness for adoption of SCIIP_RuntimeProcessorBase.
 */

function sciipRun2590_ProcessorMigrationInventoryProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2590_ProcessorMigrationInventory',
    action: 'PROCESSOR_MIGRATION_INVENTORY_BUILD',
    sourceSheet: 'SCIIP_AUTONOMOUS_RUNTIME_REGISTRY',
    targetSheet: 'SCIIP_PROCESSOR_MIGRATION_INVENTORY',
    ledgerSheet: 'SCIIP_PROCESSOR_MIGRATION_INVENTORY_LEDGER',

    buildPayload: function(context, definition) {
      var registryRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: registryRecords.length,
        outputCount: 0,
        summary: 'Processor migration inventory payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          priorProcessor: '2580_RuntimeMigrationFramework',
          migrationPhase: 'v5.3.1 Runtime Refactor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Missing autonomous runtime registry source sheet.');
      if (!definition.targetSheet) errors.push('Missing processor migration inventory target sheet.');
      if (!definition.ledgerSheet) errors.push('Missing processor migration inventory ledger sheet.');

      var registryRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      if (!registryRecords || registryRecords.length === 0) {
        errors.push('No autonomous runtime registry records available.');
      }

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var registryRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      var inventoryHeaders = [
        'Timestamp',
        'Migration_Phase',
        'Processor_Id',
        'Processor_Name',
        'Run_Function',
        'Test_Function',
        'Processor_Category',
        'Runtime_Status',
        'Dispatch_Eligible',
        'Migration_Status',
        'Migration_Readiness',
        'Migration_Priority',
        'Recommended_Action',
        'Notes',
        'Source_Business_Key'
      ];

      var ledgerHeaders = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Ledger_Status',
        'Transaction_Id',
        'Migration_Phase',
        'Registry_Records_Read',
        'Inventory_Items_Created',
        'Result_JSON'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
        definition.targetSheet,
        inventoryHeaders
      );

      var inventoryCount = 0;

      registryRecords.forEach(function(record) {
        var processorName = String(record.Processor_Name || '');
        var runtimeStatus = String(record.Runtime_Status || '').toUpperCase();
        var dispatchEligible = String(record.Dispatch_Eligible || '').toUpperCase();
        var runFunction = String(record.Run_Function || '').trim();

        var migrationStatus = 'NEEDS_REVIEW';
        var migrationReadiness = 'UNKNOWN';
        var migrationPriority = 5;
        var recommendedAction = 'Review processor for runtime-base migration.';
        var notes = '';

        if (!runFunction) {
          migrationStatus = 'BLOCKED';
          migrationReadiness = 'MISSING_RUN_FUNCTION';
          migrationPriority = 9;
          recommendedAction = 'Add or verify run function before migration.';
          notes = 'Processor is missing a run function.';
        } else if (runtimeStatus === 'PLANNED') {
          migrationStatus = 'PLANNED';
          migrationReadiness = 'FUTURE_PROCESSOR';
          migrationPriority = 7;
          recommendedAction = 'Implement using SCIIP_RuntimeProcessorBase from inception.';
          notes = 'Planned processor should be born runtime-native.';
        } else if (processorName.indexOf('Runtime') !== -1) {
          migrationStatus = 'ALREADY_RUNTIME_NATIVE';
          migrationReadiness = 'READY';
          migrationPriority = 1;
          recommendedAction = 'No migration required; maintain as runtime-native.';
          notes = 'Runtime framework or autonomous runtime processor.';
        } else if (dispatchEligible === 'NO') {
          migrationStatus = 'LOW_PRIORITY';
          migrationReadiness = 'NOT_DISPATCH_ELIGIBLE';
          migrationPriority = 6;
          recommendedAction = 'Migrate later unless needed by autonomous runtime.';
          notes = 'Processor is not currently dispatch eligible.';
        } else {
          migrationStatus = 'NEEDS_MIGRATION';
          migrationReadiness = 'CANDIDATE';
          migrationPriority = 3;
          recommendedAction = 'Refactor processor to SCIIP_RuntimeProcessorBase.';
          notes = 'Dispatch-eligible processor should be runtime-native before live dispatch.';
        }

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
          definition.targetSheet,
          inventoryHeaders,
          {
            Timestamp: new Date(),
            Migration_Phase: 'v5.3.1 Runtime Refactor',
            Processor_Id: record.Processor_Id || '',
            Processor_Name: record.Processor_Name || '',
            Run_Function: record.Run_Function || '',
            Test_Function: record.Test_Function || '',
            Processor_Category: record.Processor_Category || '',
            Runtime_Status: record.Runtime_Status || '',
            Dispatch_Eligible: record.Dispatch_Eligible || '',
            Migration_Status: migrationStatus,
            Migration_Readiness: migrationReadiness,
            Migration_Priority: migrationPriority,
            Recommended_Action: recommendedAction,
            Notes: notes,
            Source_Business_Key: context.businessKey
          }
        );

        inventoryCount++;
      });

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: inventoryCount,
        recordsRead: registryRecords.length,
        processed: registryRecords.length,
        message: JSON.stringify({
          processorMigrationInventoryStatus: 'BUILT',
          migrationPhase: 'v5.3.1 Runtime Refactor',
          registryRecordsRead: registryRecords.length,
          inventoryItemsCreated: inventoryCount,
          transactionId: transaction.transactionId,
          nextProcessor: '2600_ProcessorMigrationPlan'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: 'MIGRATION_INVENTORY_RECORDED',
          Transaction_Id: transaction.transactionId,
          Migration_Phase: 'v5.3.1 Runtime Refactor',
          Registry_Records_Read: registryRecords.length,
          Inventory_Items_Created: inventoryCount,
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          registryRecordsRead: registryRecords.length,
          inventoryItemsCreated: inventoryCount,
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.3.1 processor migration inventory built.'
      });

      return result;
    }
  });
}

/**
 * Standalone validation test.
 */
function sciipTest2590_ProcessorMigrationInventoryProcessor() {
  var result = sciipRun2590_ProcessorMigrationInventoryProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2590_ProcessorMigrationInventoryProcessor',
    result: result
  }));

  return result;
}