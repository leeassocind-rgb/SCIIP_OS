/**
 * SCIIP_OS v5.2
 * Runtime Framework Validation Processor
 * File: 2460_RuntimeFrameworkValidationProcessor.gs
 *
 * Processor: 2460_RuntimeFrameworkValidation
 *
 * Purpose:
 * Validates the integrated SCIIP_OS v5.2 shared runtime framework:
 * RuntimeCommon, ResultFactory, PayloadFactory, SheetFactory,
 * Context, TransactionManager, RuntimeLogging, and ProcessorBase.
 */

function sciipRun2460_RuntimeFrameworkValidationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2460_RuntimeFrameworkValidation',
    action: 'RUNTIME_FRAMEWORK_VALIDATION',
    targetSheet: 'SCIIP_RUNTIME_FRAMEWORK_VALIDATION',
    ledgerSheet: 'SCIIP_RUNTIME_FRAMEWORK_VALIDATION_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 8,
        outputCount: 1,
        summary: 'Runtime framework integrated validation payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          modules: [
            'SCIIP_RUNTIME',
            'SCIIP_RUNTIME_RESULT_FACTORY',
            'SCIIP_RUNTIME_PAYLOAD_FACTORY',
            'SCIIP_RUNTIME_SHEET_FACTORY',
            'SCIIP_RUNTIME_CONTEXT',
            'SCIIP_RUNTIME_TRANSACTION_MANAGER',
            'SCIIP_RUNTIME_LOGGING',
            'SCIIP_RUNTIME_PROCESSOR_BASE'
          ]
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      var requiredChecks = [
        {
          name: 'SCIIP_RUNTIME.runProcessor',
          valid:
            typeof SCIIP_RUNTIME !== 'undefined' &&
            typeof SCIIP_RUNTIME.runProcessor === 'function'
        },
        {
          name: 'SCIIP_RUNTIME_RESULT_FACTORY.success',
          valid:
            typeof SCIIP_RUNTIME_RESULT_FACTORY !== 'undefined' &&
            typeof SCIIP_RUNTIME_RESULT_FACTORY.success === 'function'
        },
        {
          name: 'SCIIP_RUNTIME_PAYLOAD_FACTORY.create',
          valid:
            typeof SCIIP_RUNTIME_PAYLOAD_FACTORY !== 'undefined' &&
            typeof SCIIP_RUNTIME_PAYLOAD_FACTORY.create === 'function'
        },
        {
          name: 'SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet',
          valid:
            typeof SCIIP_RUNTIME_SHEET_FACTORY !== 'undefined' &&
            typeof SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet === 'function'
        },
        {
          name: 'SCIIP_RUNTIME_CONTEXT.create',
          valid:
            typeof SCIIP_RUNTIME_CONTEXT !== 'undefined' &&
            typeof SCIIP_RUNTIME_CONTEXT.create === 'function'
        },
        {
          name: 'SCIIP_RUNTIME_TRANSACTION_MANAGER.run',
          valid:
            typeof SCIIP_RUNTIME_TRANSACTION_MANAGER !== 'undefined' &&
            typeof SCIIP_RUNTIME_TRANSACTION_MANAGER.run === 'function'
        },
        {
          name: 'SCIIP_RUNTIME_LOGGING.info',
          valid:
            typeof SCIIP_RUNTIME_LOGGING !== 'undefined' &&
            typeof SCIIP_RUNTIME_LOGGING.info === 'function'
        },
        {
          name: 'SCIIP_RUNTIME_PROCESSOR_BASE.run',
          valid:
            typeof SCIIP_RUNTIME_PROCESSOR_BASE !== 'undefined' &&
            typeof SCIIP_RUNTIME_PROCESSOR_BASE.run === 'function'
        }
      ];

      requiredChecks.forEach(function(check) {
        if (!check.valid) {
          errors.push('Missing or invalid runtime module: ' + check.name);
        }
      });

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var validationSheet = definition.targetSheet;
      var validationLedgerSheet = definition.ledgerSheet;

      var headers = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Validation_Status',
        'Modules_Validated',
        'Framework_Version',
        'Payload_JSON'
      ];

      var ledgerHeaders = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Ledger_Status',
        'Transaction_Id',
        'Framework_Version',
        'Result_JSON'
      ];

      var modulesValidated = [
        'RuntimeCommon',
        'RuntimeResultFactory',
        'RuntimePayloadFactory',
        'RuntimeSheetFactory',
        'RuntimeContext',
        'RuntimeTransactionManager',
        'RuntimeLogging',
        'RuntimeProcessorBase'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        validationSheet,
        headers,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Validation_Status: 'PASSED',
          Modules_Validated: modulesValidated.join(', '),
          Framework_Version: 'v5.2',
          Payload_JSON: payload
        }
      );

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        processed: modulesValidated.length,
        message: JSON.stringify({
          runtimeFrameworkValidation: 'PASSED',
          modulesValidated: modulesValidated.length,
          transactionId: transaction.transactionId,
          nextRecommendedBuild: '2470_RuntimeFrameworkCertification'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        validationLedgerSheet,
        ledgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: 'VALIDATION_RECORDED',
          Transaction_Id: transaction.transactionId,
          Framework_Version: 'v5.2',
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          modulesValidated: modulesValidated,
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.2 runtime framework validation passed.'
      });

      return result;
    }
  });
}

/**
 * Standalone validation test.
 */
function sciipTest2460_RuntimeFrameworkValidationProcessor() {
  var result = sciipRun2460_RuntimeFrameworkValidationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2460_RuntimeFrameworkValidationProcessor',
    result: result
  }));

  return result;
}