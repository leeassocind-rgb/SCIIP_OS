/**
 * SCIIP_OS v5.3
 * Autonomous Runtime Bootstrap Processor
 * File: 2480_AutonomousRuntimeBootstrapProcessor.gs
 *
 * Processor: 2480_AutonomousRuntimeBootstrap
 *
 * Purpose:
 * Boots the v5.3 Autonomous Runtime layer after v5.2 Runtime Framework certification.
 * Creates the foundational autonomous runtime control surfaces for dynamic loading,
 * scheduling, dispatching, monitoring, and orchestration.
 */

function sciipRun2480_AutonomousRuntimeBootstrapProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2480_AutonomousRuntimeBootstrap',
    action: 'AUTONOMOUS_RUNTIME_BOOTSTRAP',
    targetSheet: 'SCIIP_AUTONOMOUS_RUNTIME_BOOTSTRAP',
    ledgerSheet: 'SCIIP_AUTONOMOUS_RUNTIME_BOOTSTRAP_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 1,
        outputCount: 1,
        summary: 'Autonomous runtime bootstrap payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          priorCertification: '2470_RuntimeFrameworkCertification',
          runtimeFrameworkVersion: 'v5.2',
          autonomousRuntimeVersion: 'v5.3'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Missing bootstrap sheet.');
      if (!definition.ledgerSheet) errors.push('Missing bootstrap ledger sheet.');

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
      var bootstrapHeaders = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Bootstrap_Status',
        'Runtime_Version',
        'Prior_Framework_Version',
        'Control_Surfaces_Created',
        'Next_Processor',
        'Payload_JSON'
      ];

      var ledgerHeaders = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Ledger_Status',
        'Transaction_Id',
        'Runtime_Version',
        'Result_JSON'
      ];

      var controlSurfaces = [
        'SCIIP_AUTONOMOUS_RUNTIME_BOOTSTRAP',
        'SCIIP_AUTONOMOUS_RUNTIME_BOOTSTRAP_LEDGER',
        'SCIIP_AUTONOMOUS_RUNTIME_CONTROL',
        'SCIIP_AUTONOMOUS_RUNTIME_REGISTRY',
        'SCIIP_AUTONOMOUS_RUNTIME_SCHEDULE',
        'SCIIP_AUTONOMOUS_RUNTIME_DISPATCH_QUEUE',
        'SCIIP_AUTONOMOUS_RUNTIME_MONITOR',
        'SCIIP_AUTONOMOUS_RUNTIME_ORCHESTRATION_LEDGER'
      ];

      var controlHeaders = [
        'Timestamp',
        'Runtime_Version',
        'Surface_Name',
        'Surface_Type',
        'Status',
        'Notes'
      ];

      controlSurfaces.forEach(function(surfaceName) {
        SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(surfaceName, controlHeaders);
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.targetSheet,
        bootstrapHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Bootstrap_Status: 'BOOTSTRAPPED',
          Runtime_Version: 'v5.3',
          Prior_Framework_Version: 'v5.2',
          Control_Surfaces_Created: controlSurfaces.join(', '),
          Next_Processor: '2490_AutonomousRuntimeRegistry',
          Payload_JSON: payload
        }
      );

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        processed: controlSurfaces.length,
        message: JSON.stringify({
          bootstrapStatus: 'BOOTSTRAPPED',
          runtimeVersion: 'v5.3',
          controlSurfacesCreated: controlSurfaces.length,
          transactionId: transaction.transactionId,
          nextProcessor: '2490_AutonomousRuntimeRegistry'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: 'BOOTSTRAP_RECORDED',
          Transaction_Id: transaction.transactionId,
          Runtime_Version: 'v5.3',
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          controlSurfaces: controlSurfaces,
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.3 Autonomous Runtime bootstrap completed.'
      });

      return result;
    }
  });
}

/**
 * Standalone validation test.
 */
function sciipTest2480_AutonomousRuntimeBootstrapProcessor() {
  var result = sciipRun2480_AutonomousRuntimeBootstrapProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2480_AutonomousRuntimeBootstrapProcessor',
    result: result
  }));

  return result;
}