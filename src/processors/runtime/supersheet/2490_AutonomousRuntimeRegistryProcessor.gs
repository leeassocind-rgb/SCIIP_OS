/**
 * SCIIP_OS v5.3
 * Autonomous Runtime Registry Processor
 * File: 2490_AutonomousRuntimeRegistryProcessor.gs
 *
 * Processor: 2490_AutonomousRuntimeRegistry
 *
 * Purpose:
 * Creates and maintains the v5.3 autonomous runtime registry.
 * This registry is the foundation for dynamic processor loading,
 * dispatch eligibility, scheduling, orchestration, and monitoring.
 */

function sciipRun2490_AutonomousRuntimeRegistryProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2490_AutonomousRuntimeRegistry',
    action: 'AUTONOMOUS_RUNTIME_REGISTRY_BUILD',
    targetSheet: 'SCIIP_AUTONOMOUS_RUNTIME_REGISTRY',
    ledgerSheet: 'SCIIP_AUTONOMOUS_RUNTIME_REGISTRY_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 10,
        outputCount: 10,
        summary: 'Autonomous runtime registry payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          priorProcessor: '2480_AutonomousRuntimeBootstrap',
          runtimeVersion: 'v5.3'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Missing runtime registry sheet.');
      if (!definition.ledgerSheet) errors.push('Missing runtime registry ledger sheet.');

      if (
        typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined' ||
        typeof SCIIP_RUNTIME_SHEET_FACTORY.appendObject !== 'function'
      ) {
        errors.push('RuntimeSheetFactory appendObject unavailable.');
      }

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var registryHeaders = [
        'Timestamp',
        'Runtime_Version',
        'Processor_Id',
        'Processor_Name',
        'Run_Function',
        'Test_Function',
        'Processor_Category',
        'Runtime_Status',
        'Dispatch_Eligible',
        'Default_Priority',
        'Default_Cadence',
        'Depends_On',
        'Produces',
        'Notes'
      ];

      var ledgerHeaders = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Ledger_Status',
        'Transaction_Id',
        'Runtime_Version',
        'Processors_Registered',
        'Result_JSON'
      ];

      var registrySheet = definition.targetSheet;

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
        registrySheet,
        registryHeaders
      );

      var registeredProcessors = [
        {
          Processor_Id: '2480',
          Processor_Name: 'AutonomousRuntimeBootstrap',
          Run_Function: 'sciipRun2480_AutonomousRuntimeBootstrapProcessor',
          Test_Function: 'sciipTest2480_AutonomousRuntimeBootstrapProcessor',
          Processor_Category: 'AUTONOMOUS_RUNTIME',
          Runtime_Status: 'ACTIVE',
          Dispatch_Eligible: 'NO',
          Default_Priority: 1,
          Default_Cadence: 'MANUAL',
          Depends_On: '2470_RuntimeFrameworkCertification',
          Produces: 'SCIIP_AUTONOMOUS_RUNTIME_BOOTSTRAP',
          Notes: 'Bootstraps v5.3 autonomous runtime control surfaces.'
        },
        {
          Processor_Id: '2490',
          Processor_Name: 'AutonomousRuntimeRegistry',
          Run_Function: 'sciipRun2490_AutonomousRuntimeRegistryProcessor',
          Test_Function: 'sciipTest2490_AutonomousRuntimeRegistryProcessor',
          Processor_Category: 'AUTONOMOUS_RUNTIME',
          Runtime_Status: 'ACTIVE',
          Dispatch_Eligible: 'NO',
          Default_Priority: 1,
          Default_Cadence: 'MANUAL',
          Depends_On: '2480_AutonomousRuntimeBootstrap',
          Produces: 'SCIIP_AUTONOMOUS_RUNTIME_REGISTRY',
          Notes: 'Creates runtime-discoverable processor registry.'
        },
        {
          Processor_Id: '2500',
          Processor_Name: 'AutonomousRuntimeLoader',
          Run_Function: 'sciipRun2500_AutonomousRuntimeLoaderProcessor',
          Test_Function: 'sciipTest2500_AutonomousRuntimeLoaderProcessor',
          Processor_Category: 'AUTONOMOUS_RUNTIME',
          Runtime_Status: 'PLANNED',
          Dispatch_Eligible: 'YES',
          Default_Priority: 2,
          Default_Cadence: 'ON_DEMAND',
          Depends_On: '2490_AutonomousRuntimeRegistry',
          Produces: 'SCIIP_AUTONOMOUS_RUNTIME_LOAD_INDEX',
          Notes: 'Loads eligible runtime processors from registry.'
        },
        {
          Processor_Id: '2510',
          Processor_Name: 'AutonomousRuntimeScheduleBuilder',
          Run_Function: 'sciipRun2510_AutonomousRuntimeScheduleBuilderProcessor',
          Test_Function: 'sciipTest2510_AutonomousRuntimeScheduleBuilderProcessor',
          Processor_Category: 'AUTONOMOUS_RUNTIME',
          Runtime_Status: 'PLANNED',
          Dispatch_Eligible: 'YES',
          Default_Priority: 3,
          Default_Cadence: 'DAILY',
          Depends_On: '2500_AutonomousRuntimeLoader',
          Produces: 'SCIIP_AUTONOMOUS_RUNTIME_SCHEDULE',
          Notes: 'Builds dynamic runtime execution schedule.'
        },
        {
          Processor_Id: '2520',
          Processor_Name: 'AutonomousRuntimeDispatchQueue',
          Run_Function: 'sciipRun2520_AutonomousRuntimeDispatchQueueProcessor',
          Test_Function: 'sciipTest2520_AutonomousRuntimeDispatchQueueProcessor',
          Processor_Category: 'AUTONOMOUS_RUNTIME',
          Runtime_Status: 'PLANNED',
          Dispatch_Eligible: 'YES',
          Default_Priority: 4,
          Default_Cadence: 'ON_DEMAND',
          Depends_On: '2510_AutonomousRuntimeScheduleBuilder',
          Produces: 'SCIIP_AUTONOMOUS_RUNTIME_DISPATCH_QUEUE',
          Notes: 'Creates dispatch queue from dynamic runtime schedule.'
        },
        {
          Processor_Id: '2530',
          Processor_Name: 'AutonomousRuntimeDispatcher',
          Run_Function: 'sciipRun2530_AutonomousRuntimeDispatcherProcessor',
          Test_Function: 'sciipTest2530_AutonomousRuntimeDispatcherProcessor',
          Processor_Category: 'AUTONOMOUS_RUNTIME',
          Runtime_Status: 'PLANNED',
          Dispatch_Eligible: 'YES',
          Default_Priority: 5,
          Default_Cadence: 'ON_DEMAND',
          Depends_On: '2520_AutonomousRuntimeDispatchQueue',
          Produces: 'SCIIP_AUTONOMOUS_RUNTIME_DISPATCH_LEDGER',
          Notes: 'Dispatches queued processor execution by registry metadata.'
        },
        {
          Processor_Id: '2540',
          Processor_Name: 'AutonomousRuntimeMonitor',
          Run_Function: 'sciipRun2540_AutonomousRuntimeMonitorProcessor',
          Test_Function: 'sciipTest2540_AutonomousRuntimeMonitorProcessor',
          Processor_Category: 'AUTONOMOUS_RUNTIME',
          Runtime_Status: 'PLANNED',
          Dispatch_Eligible: 'YES',
          Default_Priority: 6,
          Default_Cadence: 'DAILY',
          Depends_On: '2530_AutonomousRuntimeDispatcher',
          Produces: 'SCIIP_AUTONOMOUS_RUNTIME_MONITOR',
          Notes: 'Monitors dynamic runtime execution health.'
        },
        {
          Processor_Id: '2550',
          Processor_Name: 'AutonomousRuntimeOrchestrator',
          Run_Function: 'sciipRun2550_AutonomousRuntimeOrchestratorProcessor',
          Test_Function: 'sciipTest2550_AutonomousRuntimeOrchestratorProcessor',
          Processor_Category: 'AUTONOMOUS_RUNTIME',
          Runtime_Status: 'PLANNED',
          Dispatch_Eligible: 'YES',
          Default_Priority: 7,
          Default_Cadence: 'DAILY',
          Depends_On: '2540_AutonomousRuntimeMonitor',
          Produces: 'SCIIP_AUTONOMOUS_RUNTIME_ORCHESTRATION_LEDGER',
          Notes: 'Coordinates runtime scheduling, dispatch, and monitoring loop.'
        },
        {
          Processor_Id: '2560',
          Processor_Name: 'AutonomousRuntimeGovernance',
          Run_Function: 'sciipRun2560_AutonomousRuntimeGovernanceProcessor',
          Test_Function: 'sciipTest2560_AutonomousRuntimeGovernanceProcessor',
          Processor_Category: 'AUTONOMOUS_RUNTIME',
          Runtime_Status: 'PLANNED',
          Dispatch_Eligible: 'YES',
          Default_Priority: 8,
          Default_Cadence: 'DAILY',
          Depends_On: '2550_AutonomousRuntimeOrchestrator',
          Produces: 'SCIIP_AUTONOMOUS_RUNTIME_GOVERNANCE',
          Notes: 'Applies autonomous runtime governance and guardrails.'
        },
        {
          Processor_Id: '2570',
          Processor_Name: 'AutonomousRuntimeCertification',
          Run_Function: 'sciipRun2570_AutonomousRuntimeCertificationProcessor',
          Test_Function: 'sciipTest2570_AutonomousRuntimeCertificationProcessor',
          Processor_Category: 'AUTONOMOUS_RUNTIME',
          Runtime_Status: 'PLANNED',
          Dispatch_Eligible: 'NO',
          Default_Priority: 9,
          Default_Cadence: 'MANUAL',
          Depends_On: '2560_AutonomousRuntimeGovernance',
          Produces: 'SCIIP_AUTONOMOUS_RUNTIME_CERTIFICATION',
          Notes: 'Certifies v5.3 Autonomous Runtime.'
        }
      ];

      registeredProcessors.forEach(function(row) {
        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
          registrySheet,
          registryHeaders,
          {
            Timestamp: new Date(),
            Runtime_Version: 'v5.3',
            Processor_Id: row.Processor_Id,
            Processor_Name: row.Processor_Name,
            Run_Function: row.Run_Function,
            Test_Function: row.Test_Function,
            Processor_Category: row.Processor_Category,
            Runtime_Status: row.Runtime_Status,
            Dispatch_Eligible: row.Dispatch_Eligible,
            Default_Priority: row.Default_Priority,
            Default_Cadence: row.Default_Cadence,
            Depends_On: row.Depends_On,
            Produces: row.Produces,
            Notes: row.Notes
          }
        );
      });

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: registeredProcessors.length,
        processed: registeredProcessors.length,
        message: JSON.stringify({
          runtimeRegistryStatus: 'BUILT',
          runtimeVersion: 'v5.3',
          processorsRegistered: registeredProcessors.length,
          transactionId: transaction.transactionId,
          nextProcessor: '2500_AutonomousRuntimeLoader'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: 'REGISTRY_RECORDED',
          Transaction_Id: transaction.transactionId,
          Runtime_Version: 'v5.3',
          Processors_Registered: registeredProcessors.length,
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          processorsRegistered: registeredProcessors.length,
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.3 autonomous runtime registry built.'
      });

      return result;
    }
  });
}

/**
 * Standalone validation test.
 */
function sciipTest2490_AutonomousRuntimeRegistryProcessor() {
  var result = sciipRun2490_AutonomousRuntimeRegistryProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2490_AutonomousRuntimeRegistryProcessor',
    result: result
  }));

  return result;
}