/**
 * SCIIP_OS v5.2
 * Runtime Transaction Manager
 * File: SCIIP_RuntimeTransactionManager.gs
 *
 * Processor: 2430_RuntimeTransactionManager
 *
 * Purpose:
 * Centralizes transaction lifecycle management for SCIIP_OS runtime execution.
 * Tracks transaction start, commit, failure, rollback intent, duration,
 * business key, status, and compact payloads.
 */

var SCIIP_RUNTIME = SCIIP_RUNTIME || {};
var SCIIP_RUNTIME_TRANSACTION_MANAGER =
  SCIIP_RUNTIME_TRANSACTION_MANAGER || {};

SCIIP_RUNTIME_TRANSACTION_MANAGER.VERSION = 'v5.2';

SCIIP_RUNTIME_TRANSACTION_MANAGER.SHEET =
  'SCIIP_RUNTIME_TRANSACTION_LEDGER';

SCIIP_RUNTIME_TRANSACTION_MANAGER.HEADERS = [
  'Timestamp',
  'Transaction_Id',
  'Processor',
  'Action',
  'Business_Key',
  'Transaction_Status',
  'Duration_Ms',
  'Payload_JSON',
  'Result_JSON',
  'Error_JSON',
  'Framework_Version'
];

SCIIP_RUNTIME_TRANSACTION_MANAGER.ensureLedger = function() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    SCIIP_RUNTIME_TRANSACTION_MANAGER.SHEET,
    SCIIP_RUNTIME_TRANSACTION_MANAGER.HEADERS
  );
};

SCIIP_RUNTIME_TRANSACTION_MANAGER.createTransactionId = function(context) {
  context = context || {};

  return SCIIP_RUNTIME.makeBusinessKey([
    'TXN',
    context.processor || 'UNKNOWN_PROCESSOR',
    context.action || 'UNKNOWN_ACTION',
    context.dateKey || SCIIP_RUNTIME.getDateKey({}),
    new Date().getTime()
  ]);
};

SCIIP_RUNTIME_TRANSACTION_MANAGER.begin = function(context, payload) {
  context = context || {};
  payload = payload || {};

  var transactionId =
    context.transactionId ||
    SCIIP_RUNTIME_TRANSACTION_MANAGER.createTransactionId(context);

  var startedAt = new Date();

  var transaction = {
    transactionId: transactionId,
    processor: context.processor || '',
    action: context.action || '',
    businessKey: context.businessKey || null,
    status: 'STARTED',
    startedAt: startedAt,
    startedAtIso: startedAt.toISOString(),
    durationMs: 0,
    payload: SCIIP_RUNTIME.compactPayload(payload),
    result: null,
    error: null,
    frameworkVersion: SCIIP_RUNTIME_TRANSACTION_MANAGER.VERSION
  };

  SCIIP_RUNTIME_TRANSACTION_MANAGER.log(transaction);

  return transaction;
};

SCIIP_RUNTIME_TRANSACTION_MANAGER.commit = function(transaction, result) {
  transaction = transaction || {};
  result = result || {};

  var completedAt = new Date();

  transaction.status = 'COMMITTED';
  transaction.completedAt = completedAt;
  transaction.completedAtIso = completedAt.toISOString();
  transaction.durationMs =
    completedAt.getTime() - new Date(transaction.startedAt).getTime();
  transaction.result = SCIIP_RUNTIME.compactPayload(result);
  transaction.error = null;

  SCIIP_RUNTIME_TRANSACTION_MANAGER.log(transaction);

  return transaction;
};

SCIIP_RUNTIME_TRANSACTION_MANAGER.fail = function(transaction, error) {
  transaction = transaction || {};
  error = error || {};

  var completedAt = new Date();

  transaction.status = 'FAILED';
  transaction.completedAt = completedAt;
  transaction.completedAtIso = completedAt.toISOString();
  transaction.durationMs =
    transaction.startedAt
      ? completedAt.getTime() - new Date(transaction.startedAt).getTime()
      : 0;
  transaction.error = {
    message: error && error.message ? error.message : String(error),
    stack: error && error.stack ? error.stack : ''
  };

  SCIIP_RUNTIME_TRANSACTION_MANAGER.log(transaction);

  return transaction;
};

SCIIP_RUNTIME_TRANSACTION_MANAGER.rollbackIntent = function(transaction, reason) {
  transaction = transaction || {};

  var completedAt = new Date();

  transaction.status = 'ROLLBACK_INTENT_RECORDED';
  transaction.completedAt = completedAt;
  transaction.completedAtIso = completedAt.toISOString();
  transaction.durationMs =
    transaction.startedAt
      ? completedAt.getTime() - new Date(transaction.startedAt).getTime()
      : 0;
  transaction.error = {
    message: reason || 'Rollback intent recorded.',
    stack: ''
  };

  SCIIP_RUNTIME_TRANSACTION_MANAGER.log(transaction);

  return transaction;
};

SCIIP_RUNTIME_TRANSACTION_MANAGER.log = function(transaction) {
  SCIIP_RUNTIME_TRANSACTION_MANAGER.ensureLedger();

  SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
    SCIIP_RUNTIME_TRANSACTION_MANAGER.SHEET,
    SCIIP_RUNTIME_TRANSACTION_MANAGER.HEADERS,
    {
      Timestamp: new Date(),
      Transaction_Id: transaction.transactionId || '',
      Processor: transaction.processor || '',
      Action: transaction.action || '',
      Business_Key: transaction.businessKey || '',
      Transaction_Status: transaction.status || '',
      Duration_Ms: transaction.durationMs || 0,
      Payload_JSON: transaction.payload || {},
      Result_JSON: transaction.result || {},
      Error_JSON: transaction.error || {},
      Framework_Version:
        transaction.frameworkVersion ||
        SCIIP_RUNTIME_TRANSACTION_MANAGER.VERSION
    }
  );
};

SCIIP_RUNTIME_TRANSACTION_MANAGER.run = function(context, payload, executor) {
  var transaction =
    SCIIP_RUNTIME_TRANSACTION_MANAGER.begin(context, payload);

  try {
    var result = executor ? executor(payload, context, transaction) : {};

    SCIIP_RUNTIME_TRANSACTION_MANAGER.commit(transaction, result);

    return result;

  } catch (err) {
    SCIIP_RUNTIME_TRANSACTION_MANAGER.fail(transaction, err);
    SCIIP_RUNTIME_TRANSACTION_MANAGER.rollbackIntent(
      transaction,
      'Rollback intent recorded after runtime execution failure.'
    );

    throw err;
  }
};

/**
 * Backward-compatible runtime hook.
 */
SCIIP_RUNTIME.runTransaction = function(context, payload, executor) {
  return SCIIP_RUNTIME_TRANSACTION_MANAGER.run(
    context,
    payload,
    executor
  );
};

/**
 * Standalone validation test.
 */
function sciipTest2430_RuntimeTransactionManager() {
  var result = SCIIP_RUNTIME.runProcessor({
    processor: '2430_RuntimeTransactionManager',
    action: 'RUNTIME_TRANSACTION_MANAGER_VALIDATION',

    buildPayload: function() {
      var context = SCIIP_RUNTIME_CONTEXT.create({
        processor: '2430_RuntimeTransactionManager',
        action: 'RUNTIME_TRANSACTION_MANAGER_VALIDATION'
      });

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: '2430_RuntimeTransactionManager',
        action: 'RUNTIME_TRANSACTION_MANAGER_VALIDATION',
        businessKey: context.businessKey,
        inputCount: 1,
        outputCount: 1,
        summary: 'Runtime transaction manager test payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context)
        }
      });
    },

    execute: function(payload) {
      var context = SCIIP_RUNTIME_CONTEXT.create({
        processor: '2430_RuntimeTransactionManager',
        action: 'TRANSACTION_EXECUTION_TEST'
      });

      var transactionResult =
        SCIIP_RUNTIME_TRANSACTION_MANAGER.run(
          context,
          payload,
          function(txPayload, txContext, transaction) {
            return SCIIP_RUNTIME_RESULT_FACTORY.success({
              processor: '2430_RuntimeTransactionManager',
              businessKey: txContext.businessKey,
              recordsCreated: 1,
              processed: 1,
              message: JSON.stringify({
                transactionId: transaction.transactionId,
                transactionStatus: transaction.status,
                payloadStatus: txPayload.status
              })
            });
          }
        );

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: '2430_RuntimeTransactionManager',
        recordsCreated: 1,
        processed: 1,
        message: JSON.stringify({
          transactionResultStatus: transactionResult.status,
          transactionBusinessKey: transactionResult.businessKey || null
        })
      });
    }
  });

  Logger.log(JSON.stringify({
    test: 'sciipTest2430_RuntimeTransactionManager',
    result: result
  }));

  return result;
}