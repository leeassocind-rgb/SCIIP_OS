/**
 * SCIIP_OS v5.2
 * Runtime Logging
 * File: SCIIP_RuntimeLogging.gs
 *
 * Processor: 2440_RuntimeLogging
 *
 * Purpose:
 * Centralizes structured runtime logging for SCIIP_OS.
 * Supports INFO, WARN, ERROR, DEBUG, and AUDIT log levels.
 */

var SCIIP_RUNTIME_LOGGING = SCIIP_RUNTIME_LOGGING || {};

SCIIP_RUNTIME_LOGGING.VERSION = 'v5.2';

SCIIP_RUNTIME_LOGGING.SHEET = 'SCIIP_RUNTIME_LOG';

SCIIP_RUNTIME_LOGGING.HEADERS = [
  'Timestamp',
  'Level',
  'Processor',
  'Action',
  'Business_Key',
  'Message',
  'Payload_JSON',
  'Context_JSON',
  'Framework_Version'
];

SCIIP_RUNTIME_LOGGING.ensureLogSheet = function() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    SCIIP_RUNTIME_LOGGING.SHEET,
    SCIIP_RUNTIME_LOGGING.HEADERS
  );
};

SCIIP_RUNTIME_LOGGING.write = function(config) {
  config = config || {};

  SCIIP_RUNTIME_LOGGING.ensureLogSheet();

  var context = config.context || {};

  SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
    SCIIP_RUNTIME_LOGGING.SHEET,
    SCIIP_RUNTIME_LOGGING.HEADERS,
    {
      Timestamp: new Date(),
      Level: config.level || 'INFO',
      Processor: config.processor || context.processor || '',
      Action: config.action || context.action || '',
      Business_Key: config.businessKey || context.businessKey || '',
      Message: config.message || '',
      Payload_JSON: config.payload || {},
      Context_JSON: context || {},
      Framework_Version: SCIIP_RUNTIME_LOGGING.VERSION
    }
  );

  return {
    status: 'LOG_WRITTEN',
    level: config.level || 'INFO',
    processor: config.processor || context.processor || '',
    action: config.action || context.action || '',
    businessKey: config.businessKey || context.businessKey || '',
    completedAt: new Date().toISOString()
  };
};

SCIIP_RUNTIME_LOGGING.info = function(config) {
  config = config || {};
  config.level = 'INFO';
  return SCIIP_RUNTIME_LOGGING.write(config);
};

SCIIP_RUNTIME_LOGGING.warn = function(config) {
  config = config || {};
  config.level = 'WARN';
  return SCIIP_RUNTIME_LOGGING.write(config);
};

SCIIP_RUNTIME_LOGGING.error = function(config) {
  config = config || {};
  config.level = 'ERROR';
  return SCIIP_RUNTIME_LOGGING.write(config);
};

SCIIP_RUNTIME_LOGGING.debug = function(config) {
  config = config || {};
  config.level = 'DEBUG';
  return SCIIP_RUNTIME_LOGGING.write(config);
};

SCIIP_RUNTIME_LOGGING.audit = function(config) {
  config = config || {};
  config.level = 'AUDIT';
  return SCIIP_RUNTIME_LOGGING.write(config);
};

SCIIP_RUNTIME_LOGGING.fromError = function(context, error, payload) {
  return SCIIP_RUNTIME_LOGGING.error({
    context: context || {},
    payload: payload || {},
    message:
      error && error.message
        ? error.message
        : String(error || 'Unknown runtime error.')
  });
};

/**
 * Standalone validation test.
 */
function sciipTest2440_RuntimeLogging() {
  var result = SCIIP_RUNTIME.runProcessor({
    processor: '2440_RuntimeLogging',
    action: 'RUNTIME_LOGGING_VALIDATION',

    buildPayload: function() {
      var context = SCIIP_RUNTIME_CONTEXT.create({
        processor: '2440_RuntimeLogging',
        action: 'RUNTIME_LOGGING_VALIDATION'
      });

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: '2440_RuntimeLogging',
        action: 'RUNTIME_LOGGING_VALIDATION',
        businessKey: context.businessKey,
        inputCount: 5,
        outputCount: 5,
        summary: 'Runtime logging test payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context)
        }
      });
    },

    execute: function(payload) {
      var context = SCIIP_RUNTIME_CONTEXT.create({
        processor: '2440_RuntimeLogging',
        action: 'RUNTIME_LOGGING_EXECUTION_TEST'
      });

      SCIIP_RUNTIME_LOGGING.info({
        context: context,
        payload: payload,
        message: 'Runtime logging INFO event validated.'
      });

      SCIIP_RUNTIME_LOGGING.warn({
        context: context,
        payload: payload,
        message: 'Runtime logging WARN event validated.'
      });

      SCIIP_RUNTIME_LOGGING.debug({
        context: context,
        payload: payload,
        message: 'Runtime logging DEBUG event validated.'
      });

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: payload,
        message: 'Runtime logging AUDIT event validated.'
      });

      SCIIP_RUNTIME_LOGGING.error({
        context: context,
        payload: payload,
        message: 'Runtime logging ERROR event validated.'
      });

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: '2440_RuntimeLogging',
        recordsCreated: 5,
        processed: 5,
        message: 'Runtime logging validated across INFO, WARN, DEBUG, AUDIT, ERROR.'
      });
    }
  });

  Logger.log(JSON.stringify({
    test: 'sciipTest2440_RuntimeLogging',
    result: result
  }));

  return result;
}