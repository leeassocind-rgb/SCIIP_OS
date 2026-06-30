/**
 * SCIIP_OS v5.2
 * Runtime Processor Base
 * File: SCIIP_RuntimeProcessorBase.gs
 *
 * Processor: 2450_RuntimeProcessorBase
 *
 * Purpose:
 * Provides the reusable base runner for future SCIIP_OS runtime processors.
 * Centralizes context creation, payload creation, transaction handling,
 * logging, execution, result creation, and error handling.
 */

var SCIIP_RUNTIME = SCIIP_RUNTIME || {};
var SCIIP_RUNTIME_PROCESSOR_BASE = SCIIP_RUNTIME_PROCESSOR_BASE || {};

SCIIP_RUNTIME_PROCESSOR_BASE.VERSION = 'v5.2';

SCIIP_RUNTIME_PROCESSOR_BASE.createDefinition = function(config) {
  config = config || {};

  return {
    processor: config.processor || '',
    action: config.action || '',
    sourceSheet: config.sourceSheet || null,
    targetSheet: config.targetSheet || null,
    ledgerSheet: config.ledgerSheet || null,
    buildPayload: config.buildPayload || null,
    execute: config.execute || null,
    validate: config.validate || null,
    onSuccess: config.onSuccess || null,
    onError: config.onError || null,
    flags: config.flags || {},
    refs: config.refs || {},
    frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION
  };
};

SCIIP_RUNTIME_PROCESSOR_BASE.validateDefinition = function(definition) {
  var errors = [];

  if (!definition) {
    errors.push('Missing processor definition.');
  } else {
    if (!definition.processor) errors.push('Missing processor.');
    if (!definition.action) errors.push('Missing action.');
    if (!definition.execute || typeof definition.execute !== 'function') {
      errors.push('Missing execute function.');
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors
  };
};

SCIIP_RUNTIME_PROCESSOR_BASE.buildDefaultPayload = function(context, definition) {
  return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
    processor: context.processor,
    action: context.action,
    businessKey: context.businessKey,
    sourceSheet: definition.sourceSheet,
    targetSheet: definition.targetSheet,
    ledgerSheet: definition.ledgerSheet,
    inputCount: 0,
    outputCount: 0,
    summary: 'Default runtime processor base payload created.',
    refs: {
      context: SCIIP_RUNTIME_CONTEXT.compact(context)
    },
    flags: definition.flags || {}
  });
};

SCIIP_RUNTIME_PROCESSOR_BASE.run = function(config) {
  var definition =
    SCIIP_RUNTIME_PROCESSOR_BASE.createDefinition(config);

  var definitionValidation =
    SCIIP_RUNTIME_PROCESSOR_BASE.validateDefinition(definition);

  if (!definitionValidation.valid) {
    return SCIIP_RUNTIME_RESULT_FACTORY.validationFailure({
      processor: definition.processor || 'UNKNOWN_PROCESSOR',
      message: JSON.stringify(definitionValidation.errors)
    });
  }

  return SCIIP_RUNTIME.runProcessor({
    processor: definition.processor,
    action: definition.action,

    buildPayload: function() {
      var context = SCIIP_RUNTIME_CONTEXT.create({
        processor: definition.processor,
        action: definition.action,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        flags: definition.flags,
        refs: definition.refs
      });

      var payload = definition.buildPayload
        ? definition.buildPayload(context, definition)
        : SCIIP_RUNTIME_PROCESSOR_BASE.buildDefaultPayload(
            context,
            definition
          );

      if (!payload.businessKey) {
        payload.businessKey = context.businessKey;
      }

      if (!payload.processor) {
        payload.processor = context.processor;
      }

      if (!payload.action) {
        payload.action = context.action;
      }

      return payload;
    },

    execute: function(payload) {
      var context = SCIIP_RUNTIME_CONTEXT.create({
        processor: definition.processor,
        action: definition.action,
        businessKey: payload.businessKey || null,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        flags: definition.flags,
        refs: definition.refs
      });

      var contextValidation = SCIIP_RUNTIME_CONTEXT.validate(context);

      if (!contextValidation.valid) {
        return SCIIP_RUNTIME_RESULT_FACTORY.validationFailure({
          processor: definition.processor,
          businessKey: context.businessKey,
          message: JSON.stringify(contextValidation.errors)
        });
      }

      if (definition.validate) {
        var customValidation =
          definition.validate(payload, context, definition);

        if (customValidation && customValidation.valid === false) {
          return SCIIP_RUNTIME_RESULT_FACTORY.validationFailure({
            processor: definition.processor,
            businessKey: context.businessKey,
            message: JSON.stringify(customValidation.errors || [])
          });
        }
      }

      SCIIP_RUNTIME_LOGGING.info({
        context: context,
        payload: payload,
        message: 'Runtime processor base execution started.'
      });

      var executionResult =
        SCIIP_RUNTIME_TRANSACTION_MANAGER.run(
          context,
          payload,
          function(txPayload, txContext, transaction) {
            return definition.execute(
              txPayload,
              txContext,
              transaction,
              definition
            );
          }
        );

      var result =
        executionResult && executionResult.status
          ? executionResult
          : SCIIP_RUNTIME_RESULT_FACTORY.success({
              processor: definition.processor,
              businessKey: context.businessKey,
              recordsCreated:
                executionResult && executionResult.recordsCreated
                  ? executionResult.recordsCreated
                  : 0,
              processed:
                executionResult && executionResult.processed
                  ? executionResult.processed
                  : 0,
              message:
                executionResult && executionResult.message
                  ? executionResult.message
                  : 'Runtime processor base execution completed.'
            });

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'Runtime processor base execution completed.'
      });

      if (definition.onSuccess) {
        definition.onSuccess(result, payload, context, definition);
      }

      return result;
    }
  });
};

/**
 * Backward-compatible runtime hook.
 */
SCIIP_RUNTIME.runBaseProcessor = function(config) {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run(config);
};

/**
 * Standalone validation test.
 */
function sciipTest2450_RuntimeProcessorBase() {
  var result = SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2450_RuntimeProcessorBase',
    action: 'RUNTIME_PROCESSOR_BASE_VALIDATION',
    sourceSheet: 'SCIIP_RUNTIME_PROCESSOR_BASE_SOURCE_TEST',
    targetSheet: 'SCIIP_RUNTIME_PROCESSOR_BASE_TARGET_TEST',
    ledgerSheet: 'SCIIP_RUNTIME_PROCESSOR_BASE_LEDGER_TEST',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 1,
        outputCount: 1,
        summary: 'Runtime processor base validation payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context)
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.processor) errors.push('Definition missing processor.');

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var testSheetName = 'SCIIP_RUNTIME_PROCESSOR_BASE_TEST';

      var headers = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Status',
        'Payload_JSON'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(testSheetName, headers, {
        Timestamp: new Date(),
        Processor: context.processor,
        Business_Key: context.businessKey,
        Status: 'SUCCESS',
        Payload_JSON: payload
      });

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        processed: 1,
        message: JSON.stringify({
          processorBaseValidated: true,
          transactionId: transaction.transactionId,
          testSheetName: testSheetName
        })
      });
    }
  });

  Logger.log(JSON.stringify({
    test: 'sciipTest2450_RuntimeProcessorBase',
    result: result
  }));

  return result;
}