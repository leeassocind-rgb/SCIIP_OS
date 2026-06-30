/**
 * SCIIP_OS v5.2
 * Runtime Payload Factory
 * File: SCIIP_RuntimePayloadFactory.gs
 *
 * Processor: 2400_RuntimePayloadFactory
 *
 * Purpose:
 * Centralizes compact runtime payload creation for SCIIP_OS.
 * Future processors should use this factory instead of hand-building
 * oversized JSON payloads.
 */

var SCIIP_RUNTIME = SCIIP_RUNTIME || {};
var SCIIP_RUNTIME_PAYLOAD_FACTORY = SCIIP_RUNTIME_PAYLOAD_FACTORY || {};

SCIIP_RUNTIME_PAYLOAD_FACTORY.VERSION = 'v5.2';

SCIIP_RUNTIME_PAYLOAD_FACTORY.create = function(config) {
  config = config || {};

  return {
    processor: config.processor || '',
    action: config.action || '',
    businessKey: config.businessKey || null,
    sourceSheet: config.sourceSheet || null,
    targetSheet: config.targetSheet || null,
    ledgerSheet: config.ledgerSheet || null,
    inputCount: config.inputCount || 0,
    outputCount: config.outputCount || 0,
    status: config.status || 'PAYLOAD_CREATED',
    summary: config.summary || '',
    refs: config.refs || {},
    flags: config.flags || {},
    frameworkVersion: SCIIP_RUNTIME_PAYLOAD_FACTORY.VERSION,
    createdAt: new Date().toISOString()
  };
};

SCIIP_RUNTIME_PAYLOAD_FACTORY.compact = function(payload) {
  payload = payload || {};

  return {
    processor: payload.processor || null,
    action: payload.action || null,
    businessKey: payload.businessKey || null,
    status: payload.status || null,
    inputCount: payload.inputCount || payload.count || 0,
    outputCount: payload.outputCount || payload.recordsCreated || 0,
    summary: payload.summary || '',
    createdAt: payload.createdAt || new Date().toISOString()
  };
};

SCIIP_RUNTIME_PAYLOAD_FACTORY.fromSheets = function(config) {
  config = config || {};

  return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
    processor: config.processor,
    action: config.action,
    businessKey: config.businessKey,
    sourceSheet: config.sourceSheet,
    targetSheet: config.targetSheet,
    ledgerSheet: config.ledgerSheet,
    inputCount: config.inputCount || 0,
    outputCount: config.outputCount || 0,
    summary: config.summary || 'Sheet-based payload created.',
    refs: config.refs || {},
    flags: config.flags || {}
  });
};

SCIIP_RUNTIME_PAYLOAD_FACTORY.fromLatestRecord = function(config) {
  config = config || {};
  var record = config.record || {};

  return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
    processor: config.processor,
    action: config.action,
    businessKey: config.businessKey || record.Business_Key || record.businessKey || null,
    sourceSheet: config.sourceSheet || null,
    targetSheet: config.targetSheet || null,
    ledgerSheet: config.ledgerSheet || null,
    inputCount: record ? 1 : 0,
    outputCount: 0,
    summary: config.summary || 'Latest-record payload created.',
    refs: {
      sourceBusinessKey: record.Business_Key || record.businessKey || null,
      sourceStatus: record.Status || record.status || null,
      sourceTimestamp: record.Timestamp || record.timestamp || null
    },
    flags: config.flags || {}
  });
};

SCIIP_RUNTIME_PAYLOAD_FACTORY.empty = function(config) {
  config = config || {};

  return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
    processor: config.processor,
    action: config.action,
    businessKey: config.businessKey || null,
    inputCount: 0,
    outputCount: 0,
    status: 'EMPTY_PAYLOAD',
    summary: config.summary || 'No input records available.',
    refs: {},
    flags: {
      noInputs: true
    }
  });
};

/**
 * Backward-compatible runtime hook.
 * Allows SCIIP_RUNTIME.compactPayload(payload) to use the payload factory.
 */
SCIIP_RUNTIME.compactPayload = function(payload) {
  return SCIIP_RUNTIME_PAYLOAD_FACTORY.compact(payload);
};

/**
 * Standalone validation test.
 */
function sciipTest2400_RuntimePayloadFactory() {
  var result = SCIIP_RUNTIME.runProcessor({
    processor: '2400_RuntimePayloadFactory',
    action: 'RUNTIME_PAYLOAD_FACTORY_VALIDATION',

    buildPayload: function() {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: '2400_RuntimePayloadFactory',
        action: 'RUNTIME_PAYLOAD_FACTORY_VALIDATION',
        inputCount: 3,
        outputCount: 3,
        summary: 'Runtime payload factory test payload created.'
      });
    },

    execute: function(payload) {
      var sheetPayload = SCIIP_RUNTIME_PAYLOAD_FACTORY.fromSheets({
        processor: '2400_RuntimePayloadFactory',
        action: 'SHEET_PAYLOAD_TEST',
        sourceSheet: 'TEST_SOURCE',
        targetSheet: 'TEST_TARGET',
        ledgerSheet: 'TEST_LEDGER',
        inputCount: 1,
        outputCount: 1
      });

      var latestPayload = SCIIP_RUNTIME_PAYLOAD_FACTORY.fromLatestRecord({
        processor: '2400_RuntimePayloadFactory',
        action: 'LATEST_RECORD_TEST',
        record: {
          Business_Key: 'TEST|LATEST',
          Status: 'SUCCESS',
          Timestamp: new Date().toISOString()
        }
      });

      var emptyPayload = SCIIP_RUNTIME_PAYLOAD_FACTORY.empty({
        processor: '2400_RuntimePayloadFactory',
        action: 'EMPTY_PAYLOAD_TEST'
      });

      return {
        status: 'SUCCESS',
        recordsCreated: 3,
        message: JSON.stringify({
          basePayloadStatus: payload.status,
          sheetPayloadStatus: sheetPayload.status,
          latestPayloadInputCount: latestPayload.inputCount,
          emptyPayloadStatus: emptyPayload.status
        })
      };
    }
  });

  Logger.log(JSON.stringify({
    test: 'sciipTest2400_RuntimePayloadFactory',
    result: result
  }));

  return result;
}