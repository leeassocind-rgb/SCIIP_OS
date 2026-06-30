/**
 * SCIIP_OS v5.3.1
 * Runtime Migration Framework Processor
 * File: 2580_RuntimeMigrationFrameworkProcessor.gs
 *
 * Processor: 2580_RuntimeMigrationFramework
 *
 * Purpose:
 * Initializes the processor migration framework for moving legacy SCIIP_OS
 * processors onto SCIIP_RuntimeProcessorBase without enabling live dispatch.
 */

function sciipRun2580_RuntimeMigrationFrameworkProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2580_RuntimeMigrationFramework',
    action: 'RUNTIME_MIGRATION_FRAMEWORK_BOOTSTRAP',
    targetSheet: 'SCIIP_RUNTIME_MIGRATION_FRAMEWORK',
    ledgerSheet: 'SCIIP_RUNTIME_MIGRATION_FRAMEWORK_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 1,
        outputCount: 1,
        summary: 'Runtime migration framework bootstrap payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          priorPhase: 'v5.3 Autonomous Runtime',
          migrationPhase: 'v5.3.1 Runtime Refactor',
          liveDispatchAllowed: 'NO'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Missing migration framework sheet.');
      if (!definition.ledgerSheet) errors.push('Missing migration framework ledger sheet.');

      if (
        typeof SCIIP_RUNTIME_PROCESSOR_BASE === 'undefined' ||
        typeof SCIIP_RUNTIME_PROCESSOR_BASE.run !== 'function'
      ) {
        errors.push('RuntimeProcessorBase unavailable.');
      }

      if (
        typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined' ||
        typeof SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet !== 'function'
      ) {
        errors.push('RuntimeSheetFactory unavailable.');
      }

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var migrationFrameworkHeaders = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Migration_Phase',
        'Framework_Status',
        'Runtime_Base',
        'Live_Dispatch_Allowed',
        'Migration_Control_Surfaces',
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
        'Result_JSON'
      ];

      var controlSurfaces = [
        'SCIIP_RUNTIME_MIGRATION_FRAMEWORK',
        'SCIIP_RUNTIME_MIGRATION_FRAMEWORK_LEDGER',
        'SCIIP_PROCESSOR_MIGRATION_INVENTORY',
        'SCIIP_PROCESSOR_MIGRATION_PLAN',
        'SCIIP_PROCESSOR_MIGRATION_QUEUE',
        'SCIIP_PROCESSOR_MIGRATION_LEDGER',
        'SCIIP_PROCESSOR_MIGRATION_VALIDATION',
        'SCIIP_PROCESSOR_MIGRATION_CERTIFICATION'
      ];

      var controlSurfaceHeaders = [
        'Timestamp',
        'Migration_Phase',
        'Surface_Name',
        'Surface_Type',
        'Status',
        'Notes'
      ];

      controlSurfaces.forEach(function(surfaceName) {
        SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
          surfaceName,
          controlSurfaceHeaders
        );
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.targetSheet,
        migrationFrameworkHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Migration_Phase: 'v5.3.1 Runtime Refactor',
          Framework_Status: 'BOOTSTRAPPED',
          Runtime_Base: 'SCIIP_RUNTIME_PROCESSOR_BASE',
          Live_Dispatch_Allowed: 'NO',
          Migration_Control_Surfaces: controlSurfaces.join(', '),
          Next_Processor: '2590_ProcessorMigrationInventory',
          Transaction_Id: transaction.transactionId,
          Payload_JSON: payload
        }
      );

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        processed: controlSurfaces.length,
        message: JSON.stringify({
          migrationFrameworkStatus: 'BOOTSTRAPPED',
          migrationPhase: 'v5.3.1 Runtime Refactor',
          controlSurfacesCreated: controlSurfaces.length,
          liveDispatchAllowed: 'NO',
          transactionId: transaction.transactionId,
          nextProcessor: '2590_ProcessorMigrationInventory'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: 'MIGRATION_FRAMEWORK_BOOTSTRAP_RECORDED',
          Transaction_Id: transaction.transactionId,
          Migration_Phase: 'v5.3.1 Runtime Refactor',
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          controlSurfaces: controlSurfaces,
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.3.1 runtime migration framework bootstrapped.'
      });

      return result;
    }
  });
}

/**
 * Standalone validation test.
 */
function sciipTest2580_RuntimeMigrationFrameworkProcessor() {
  var result = sciipRun2580_RuntimeMigrationFrameworkProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2580_RuntimeMigrationFrameworkProcessor',
    result: result
  }));

  return result;
}