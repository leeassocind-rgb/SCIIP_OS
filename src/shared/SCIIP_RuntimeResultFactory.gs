/**
 * SCIIP_OS v5.2
 * Runtime Result Factory
 * File: SCIIP_RuntimeResultFactory.gs
 *
 * Processor: 2390_RuntimeResultFactory
 *
 * Purpose:
 * Centralizes standardized runtime result-object creation for SCIIP_OS.
 * This reduces duplicated result construction across future processors.
 */

var SCIIP_RUNTIME_RESULT_FACTORY = SCIIP_RUNTIME_RESULT_FACTORY || {};

SCIIP_RUNTIME_RESULT_FACTORY.VERSION = 'v5.2';

SCIIP_RUNTIME_RESULT_FACTORY.create = function(config) {
  config = config || {};

  return {
    processor: config.processor || '',
    status: config.status || 'SUCCESS',
    businessKey: config.businessKey || null,
    recordsCreated: config.recordsCreated || 0,
    recordsUpdated: config.recordsUpdated || 0,
    recordsRead: config.recordsRead || 0,
    processed: config.processed || 0,
    skippedDuplicate: config.skippedDuplicate || 0,
    skippedNoInputs: config.skippedNoInputs || 0,
    skippedValidation: config.skippedValidation || 0,
    errors: config.errors || 0,
    message: config.message || '',
    frameworkVersion: SCIIP_RUNTIME_RESULT_FACTORY.VERSION,
    completedAt: new Date().toISOString()
  };
};

SCIIP_RUNTIME_RESULT_FACTORY.success = function(config) {
  config = config || {};
  config.status = 'SUCCESS';
  return SCIIP_RUNTIME_RESULT_FACTORY.create(config);
};

SCIIP_RUNTIME_RESULT_FACTORY.duplicate = function(config) {
  config = config || {};
  config.status = 'SUCCESS';
  config.skippedDuplicate = 1;
  config.recordsCreated = 0;
  config.message = config.message || 'Duplicate skipped by runtime result factory.';
  return SCIIP_RUNTIME_RESULT_FACTORY.create(config);
};

SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs = function(config) {
  config = config || {};
  config.status = 'SKIPPED_NO_INPUTS';
  config.skippedNoInputs = 1;
  config.recordsCreated = 0;
  config.message = config.message || 'No inputs available for processor.';
  return SCIIP_RUNTIME_RESULT_FACTORY.create(config);
};

SCIIP_RUNTIME_RESULT_FACTORY.validationFailure = function(config) {
  config = config || {};
  config.status = 'VALIDATION_FAILED';
  config.skippedValidation = 1;
  config.recordsCreated = 0;
  config.message = config.message || 'Validation failed.';
  return SCIIP_RUNTIME_RESULT_FACTORY.create(config);
};

SCIIP_RUNTIME_RESULT_FACTORY.error = function(config) {
  config = config || {};
  config.status = 'ERROR';
  config.errors = config.errors || 1;
  config.recordsCreated = 0;
  config.message = config.message || 'Runtime error occurred.';
  return SCIIP_RUNTIME_RESULT_FACTORY.create(config);
};

/**
 * Standalone validation test.
 */
function sciipTest2390_RuntimeResultFactory() {
  var result = SCIIP_RUNTIME.runProcessor({
    processor: '2390_RuntimeResultFactory',
    action: 'RUNTIME_RESULT_FACTORY_VALIDATION',

    buildPayload: function() {
      return {
        processor: '2390_RuntimeResultFactory',
        status: 'TEST_PAYLOAD_CREATED',
        count: 5
      };
    },

    execute: function(payload) {
      var successResult = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: '2390_RuntimeResultFactory',
        businessKey: 'TEST|SUCCESS',
        recordsCreated: 1,
        message: 'Success result created.'
      });

      var duplicateResult = SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
        processor: '2390_RuntimeResultFactory',
        businessKey: 'TEST|DUPLICATE'
      });

      var skippedResult = SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
        processor: '2390_RuntimeResultFactory',
        businessKey: 'TEST|NO_INPUTS'
      });

      var validationResult = SCIIP_RUNTIME_RESULT_FACTORY.validationFailure({
        processor: '2390_RuntimeResultFactory',
        businessKey: 'TEST|VALIDATION'
      });

      var errorResult = SCIIP_RUNTIME_RESULT_FACTORY.error({
        processor: '2390_RuntimeResultFactory',
        businessKey: 'TEST|ERROR',
        message: 'Synthetic error result created.'
      });

      return {
        status: 'SUCCESS',
        recordsCreated: 5,
        message: JSON.stringify({
          successResult: successResult.status,
          duplicateSkipped: duplicateResult.skippedDuplicate,
          skippedStatus: skippedResult.status,
          validationStatus: validationResult.status,
          errorStatus: errorResult.status
        })
      };
    }
  });

  Logger.log(JSON.stringify({
    test: 'sciipTest2390_RuntimeResultFactory',
    result: result
  }));

  return result;
}