/**
 * SCIIP_OS v5.3.1
 * Processor Migration Validation Processor
 * File: 2630_ProcessorMigrationValidationProcessor.gs
 *
 * Processor: 2630_ProcessorMigrationValidation
 *
 * Purpose:
 * Validates the processor migration framework outputs and confirms
 * safety constraints before certification.
 */

function sciipRun2630_ProcessorMigrationValidationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2630_ProcessorMigrationValidation',
    action: 'PROCESSOR_MIGRATION_VALIDATION',
    targetSheet: 'SCIIP_PROCESSOR_MIGRATION_VALIDATION',
    ledgerSheet: 'SCIIP_PROCESSOR_MIGRATION_VALIDATION_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 5,
        outputCount: 1,
        summary: 'Processor migration validation payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          priorProcessor: '2620_ProcessorMigrationLedger',
          migrationPhase: 'v5.3.1 Runtime Refactor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Missing validation target sheet.');
      if (!definition.ledgerSheet) errors.push('Missing validation ledger sheet.');

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var requiredSurfaces = [
        'SCIIP_RUNTIME_MIGRATION_FRAMEWORK',
        'SCIIP_PROCESSOR_MIGRATION_INVENTORY',
        'SCIIP_PROCESSOR_MIGRATION_PLAN',
        'SCIIP_PROCESSOR_MIGRATION_QUEUE',
        'SCIIP_PROCESSOR_MIGRATION_LEDGER'
      ];

      var validationHeaders = [
        'Timestamp',
        'Migration_Phase',
        'Processor',
        'Business_Key',
        'Validation_Status',
        'Surfaces_Checked',
        'Missing_Surfaces',
        'Blocked_Items_In_Queue',
        'Deferred_Items_In_Queue',
        'Live_Dispatch_Allowed',
        'Validation_Summary_JSON',
        'Next_Processor',
        'Transaction_Id',
        'Payload_JSON'
      ];

      var ledgerHeaders = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Ledger_Status',
        'Transaction_Id',
        'Migration_Phase',
        'Validation_Status',
        'Result_JSON'
      ];

      var ss = SCIIP_RUNTIME_SHEET_FACTORY.getSpreadsheet();
      var missingSurfaces = [];

      requiredSurfaces.forEach(function(surfaceName) {
        if (!ss.getSheetByName(surfaceName)) {
          missingSurfaces.push(surfaceName);
        }
      });

      var queueRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('SCIIP_PROCESSOR_MIGRATION_QUEUE');

      var blockedItemsInQueue = queueRecords.filter(function(record) {
        return String(record.Plan_Status || '').toUpperCase() === 'BLOCKED';
      }).length;

      var deferredItemsInQueue = queueRecords.filter(function(record) {
        return String(record.Plan_Status || '').toUpperCase() === 'DEFERRED';
      }).length;

      var liveDispatchAllowed = 'NO';

      var validationStatus = 'PASSED';

      if (
        missingSurfaces.length > 0 ||
        blockedItemsInQueue > 0 ||
        deferredItemsInQueue > 0 ||
        liveDispatchAllowed !== 'NO'
      ) {
        validationStatus = 'FAILED';
      }

      var validationSummary = {
        migrationPhase: 'v5.3.1 Runtime Refactor',
        validationStatus: validationStatus,
        surfacesChecked: requiredSurfaces.length,
        missingSurfaces: missingSurfaces,
        blockedItemsInQueue: blockedItemsInQueue,
        deferredItemsInQueue: deferredItemsInQueue,
        liveDispatchAllowed: liveDispatchAllowed,
        validatedAt: new Date().toISOString()
      };

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.targetSheet,
        validationHeaders,
        {
          Timestamp: new Date(),
          Migration_Phase: 'v5.3.1 Runtime Refactor',
          Processor: context.processor,
          Business_Key: context.businessKey,
          Validation_Status: validationStatus,
          Surfaces_Checked: requiredSurfaces.join(', '),
          Missing_Surfaces: missingSurfaces.join(', '),
          Blocked_Items_In_Queue: blockedItemsInQueue,
          Deferred_Items_In_Queue: deferredItemsInQueue,
          Live_Dispatch_Allowed: liveDispatchAllowed,
          Validation_Summary_JSON: validationSummary,
          Next_Processor: '2640_ProcessorMigrationCertification',
          Transaction_Id: transaction.transactionId,
          Payload_JSON: payload
        }
      );

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        processed: requiredSurfaces.length,
        message: JSON.stringify({
          processorMigrationValidationStatus: validationStatus,
          migrationPhase: 'v5.3.1 Runtime Refactor',
          missingSurfaces: missingSurfaces.length,
          blockedItemsInQueue: blockedItemsInQueue,
          deferredItemsInQueue: deferredItemsInQueue,
          liveDispatchAllowed: liveDispatchAllowed,
          transactionId: transaction.transactionId,
          nextProcessor: '2640_ProcessorMigrationCertification'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: 'MIGRATION_VALIDATION_RECORDED',
          Transaction_Id: transaction.transactionId,
          Migration_Phase: 'v5.3.1 Runtime Refactor',
          Validation_Status: validationStatus,
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          validationSummary: validationSummary,
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.3.1 processor migration validation completed.'
      });

      return result;
    }
  });
}

/**
 * Standalone validation test.
 */
function sciipTest2630_ProcessorMigrationValidationProcessor() {
  var result = sciipRun2630_ProcessorMigrationValidationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2630_ProcessorMigrationValidationProcessor',
    result: result
  }));

  return result;
}