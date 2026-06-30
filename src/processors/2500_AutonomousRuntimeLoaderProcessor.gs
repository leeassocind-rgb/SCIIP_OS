/**
 * SCIIP_OS v5.3
 * Autonomous Runtime Loader Processor
 * File: 2500_AutonomousRuntimeLoaderProcessor.gs
 *
 * Processor: 2500_AutonomousRuntimeLoader
 *
 * Purpose:
 * Reads the autonomous runtime registry and creates a runtime load index
 * of processors eligible for dynamic scheduling and dispatch.
 */

function sciipRun2500_AutonomousRuntimeLoaderProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2500_AutonomousRuntimeLoader',
    action: 'AUTONOMOUS_RUNTIME_LOAD_INDEX_BUILD',
    sourceSheet: 'SCIIP_AUTONOMOUS_RUNTIME_REGISTRY',
    targetSheet: 'SCIIP_AUTONOMOUS_RUNTIME_LOAD_INDEX',
    ledgerSheet: 'SCIIP_AUTONOMOUS_RUNTIME_LOAD_INDEX_LEDGER',

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
        summary: 'Autonomous runtime loader payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          priorProcessor: '2490_AutonomousRuntimeRegistry',
          runtimeVersion: 'v5.3'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Missing registry source sheet.');
      if (!definition.targetSheet) errors.push('Missing load index target sheet.');
      if (!definition.ledgerSheet) errors.push('Missing load index ledger sheet.');

      var registryRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      if (!registryRecords || registryRecords.length === 0) {
        errors.push('No runtime registry records available.');
      }

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var registryRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      var loadIndexHeaders = [
        'Timestamp',
        'Runtime_Version',
        'Processor_Id',
        'Processor_Name',
        'Run_Function',
        'Test_Function',
        'Runtime_Status',
        'Dispatch_Eligible',
        'Default_Priority',
        'Default_Cadence',
        'Depends_On',
        'Produces',
        'Load_Status',
        'Load_Reason',
        'Source_Business_Key'
      ];

      var ledgerHeaders = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Ledger_Status',
        'Transaction_Id',
        'Runtime_Version',
        'Registry_Records_Read',
        'Processors_Loaded',
        'Result_JSON'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
        definition.targetSheet,
        loadIndexHeaders
      );

      var loaded = [];

      registryRecords.forEach(function(record) {
        var dispatchEligible =
          String(record.Dispatch_Eligible || '').toUpperCase() === 'YES';

        var activeOrPlanned = [
          'ACTIVE',
          'PLANNED'
        ].indexOf(String(record.Runtime_Status || '').toUpperCase()) !== -1;

        var hasRunFunction =
          String(record.Run_Function || '').trim() !== '';

        var shouldLoad = dispatchEligible && activeOrPlanned && hasRunFunction;

        var loadStatus = shouldLoad ? 'LOADED' : 'SKIPPED';

        var loadReason = shouldLoad
          ? 'Dispatch eligible and runtime-loadable.'
          : 'Not dispatch eligible, inactive, or missing run function.';

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
          definition.targetSheet,
          loadIndexHeaders,
          {
            Timestamp: new Date(),
            Runtime_Version: record.Runtime_Version || 'v5.3',
            Processor_Id: record.Processor_Id || '',
            Processor_Name: record.Processor_Name || '',
            Run_Function: record.Run_Function || '',
            Test_Function: record.Test_Function || '',
            Runtime_Status: record.Runtime_Status || '',
            Dispatch_Eligible: record.Dispatch_Eligible || '',
            Default_Priority: record.Default_Priority || '',
            Default_Cadence: record.Default_Cadence || '',
            Depends_On: record.Depends_On || '',
            Produces: record.Produces || '',
            Load_Status: loadStatus,
            Load_Reason: loadReason,
            Source_Business_Key: context.businessKey
          }
        );

        if (shouldLoad) {
          loaded.push(record);
        }
      });

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: loaded.length,
        recordsRead: registryRecords.length,
        processed: registryRecords.length,
        message: JSON.stringify({
          runtimeLoaderStatus: 'LOAD_INDEX_BUILT',
          runtimeVersion: 'v5.3',
          registryRecordsRead: registryRecords.length,
          processorsLoaded: loaded.length,
          transactionId: transaction.transactionId,
          nextProcessor: '2510_AutonomousRuntimeScheduleBuilder'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: 'LOAD_INDEX_RECORDED',
          Transaction_Id: transaction.transactionId,
          Runtime_Version: 'v5.3',
          Registry_Records_Read: registryRecords.length,
          Processors_Loaded: loaded.length,
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          registryRecordsRead: registryRecords.length,
          processorsLoaded: loaded.length,
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.3 autonomous runtime load index built.'
      });

      return result;
    }
  });
}

/**
 * Standalone validation test.
 */
function sciipTest2500_AutonomousRuntimeLoaderProcessor() {
  var result = sciipRun2500_AutonomousRuntimeLoaderProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2500_AutonomousRuntimeLoaderProcessor',
    result: result
  }));

  return result;
}