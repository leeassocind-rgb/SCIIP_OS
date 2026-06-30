/**
 * SCIIP_OS v5.3
 * Autonomous Runtime Monitor Processor
 * File: 2540_AutonomousRuntimeMonitorProcessor.gs
 *
 * Processor: 2540_AutonomousRuntimeMonitor
 *
 * Purpose:
 * Monitors v5.3 autonomous runtime health across registry, load index,
 * schedule, dispatch queue, and dispatch ledger surfaces.
 */

function sciipRun2540_AutonomousRuntimeMonitorProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2540_AutonomousRuntimeMonitor',
    action: 'AUTONOMOUS_RUNTIME_MONITOR_BUILD',
    targetSheet: 'SCIIP_AUTONOMOUS_RUNTIME_MONITOR',
    ledgerSheet: 'SCIIP_AUTONOMOUS_RUNTIME_MONITOR_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 5,
        outputCount: 1,
        summary: 'Autonomous runtime monitor payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          runtimeVersion: 'v5.3',
          monitoredSurfaces: [
            'SCIIP_AUTONOMOUS_RUNTIME_REGISTRY',
            'SCIIP_AUTONOMOUS_RUNTIME_LOAD_INDEX',
            'SCIIP_AUTONOMOUS_RUNTIME_SCHEDULE',
            'SCIIP_AUTONOMOUS_RUNTIME_DISPATCH_QUEUE',
            'SCIIP_AUTONOMOUS_RUNTIME_DISPATCH_LEDGER'
          ]
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Missing monitor target sheet.');
      if (!definition.ledgerSheet) errors.push('Missing monitor ledger sheet.');

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var surfaces = [
        'SCIIP_AUTONOMOUS_RUNTIME_REGISTRY',
        'SCIIP_AUTONOMOUS_RUNTIME_LOAD_INDEX',
        'SCIIP_AUTONOMOUS_RUNTIME_SCHEDULE',
        'SCIIP_AUTONOMOUS_RUNTIME_DISPATCH_QUEUE',
        'SCIIP_AUTONOMOUS_RUNTIME_DISPATCH_LEDGER'
      ];

      var monitorHeaders = [
        'Timestamp',
        'Runtime_Version',
        'Processor',
        'Business_Key',
        'Monitor_Status',
        'Surfaces_Checked',
        'Total_Records_Observed',
        'Registry_Count',
        'Load_Index_Count',
        'Schedule_Count',
        'Queue_Count',
        'Dispatch_Decision_Count',
        'Health_Summary_JSON',
        'Next_Processor'
      ];

      var ledgerHeaders = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Ledger_Status',
        'Transaction_Id',
        'Runtime_Version',
        'Monitor_Status',
        'Result_JSON'
      ];

      var counts = {
        registry: SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('SCIIP_AUTONOMOUS_RUNTIME_REGISTRY').length,
        loadIndex: SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('SCIIP_AUTONOMOUS_RUNTIME_LOAD_INDEX').length,
        schedule: SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('SCIIP_AUTONOMOUS_RUNTIME_SCHEDULE').length,
        queue: SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('SCIIP_AUTONOMOUS_RUNTIME_DISPATCH_QUEUE').length,
        dispatch: SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('SCIIP_AUTONOMOUS_RUNTIME_DISPATCH_LEDGER').length
      };

      var total =
        counts.registry +
        counts.loadIndex +
        counts.schedule +
        counts.queue +
        counts.dispatch;

      var monitorStatus = 'HEALTHY';

      if (counts.registry === 0) monitorStatus = 'ATTENTION_REQUIRED';
      if (counts.loadIndex === 0) monitorStatus = 'ATTENTION_REQUIRED';
      if (counts.schedule === 0) monitorStatus = 'ATTENTION_REQUIRED';
      if (counts.queue === 0) monitorStatus = 'ATTENTION_REQUIRED';

      var healthSummary = {
        runtimeVersion: 'v5.3',
        monitorStatus: monitorStatus,
        registryCount: counts.registry,
        loadIndexCount: counts.loadIndex,
        scheduleCount: counts.schedule,
        queueCount: counts.queue,
        dispatchDecisionCount: counts.dispatch,
        executionMode: 'DRY_RUN_MONITORED',
        checkedAt: new Date().toISOString()
      };

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.targetSheet,
        monitorHeaders,
        {
          Timestamp: new Date(),
          Runtime_Version: 'v5.3',
          Processor: context.processor,
          Business_Key: context.businessKey,
          Monitor_Status: monitorStatus,
          Surfaces_Checked: surfaces.join(', '),
          Total_Records_Observed: total,
          Registry_Count: counts.registry,
          Load_Index_Count: counts.loadIndex,
          Schedule_Count: counts.schedule,
          Queue_Count: counts.queue,
          Dispatch_Decision_Count: counts.dispatch,
          Health_Summary_JSON: healthSummary,
          Next_Processor: '2550_AutonomousRuntimeOrchestrator'
        }
      );

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: total,
        processed: surfaces.length,
        message: JSON.stringify({
          autonomousRuntimeMonitorStatus: monitorStatus,
          runtimeVersion: 'v5.3',
          surfacesChecked: surfaces.length,
          totalRecordsObserved: total,
          transactionId: transaction.transactionId,
          nextProcessor: '2550_AutonomousRuntimeOrchestrator'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: 'MONITOR_RECORDED',
          Transaction_Id: transaction.transactionId,
          Runtime_Version: 'v5.3',
          Monitor_Status: monitorStatus,
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          healthSummary: healthSummary,
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.3 autonomous runtime monitor completed.'
      });

      return result;
    }
  });
}

/**
 * Standalone validation test.
 */
function sciipTest2540_AutonomousRuntimeMonitorProcessor() {
  var result = sciipRun2540_AutonomousRuntimeMonitorProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2540_AutonomousRuntimeMonitorProcessor',
    result: result
  }));

  return result;
}