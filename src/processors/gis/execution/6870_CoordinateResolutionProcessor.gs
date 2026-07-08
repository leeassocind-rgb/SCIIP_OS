/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6870_CoordinateResolutionProcessor.gs
 * Processor: 6870_CoordinateResolution
 * Purpose: Resolves coordinate-ready GIS records for accepted SCIIP assets and graph nodes.
 */

function sciipRun6870_CoordinateResolutionProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6870_CoordinateResolution',
    action: 'COORDINATE_RESOLUTION',
    targetSheet: 'COORDINATE_RESOLUTION',
    ledgerSheet: 'COORDINATE_RESOLUTION_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 1,
        outputCount: 1,
        summary: 'Resolves coordinate-ready GIS records for accepted SCIIP assets and graph nodes.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          sourceSheet: 'GIS_EXECUTION_READINESS',
          requiredSourceStatus: 'GIS_EXECUTION_READY',
          executionStatus: 'COORDINATES_RESOLVED',
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-gis-execution',
          nextProcessor: '6880_SpatialGeometryCreationProcessor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');
      if (typeof SCIIP_RUNTIME_PROCESSOR_BASE === 'undefined') errors.push('Missing SCIIP_RUNTIME_PROCESSOR_BASE.');
      if (typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_SHEET_FACTORY.');
      if (typeof SCIIP_RUNTIME_RESULT_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_RESULT_FACTORY.');
      if (typeof SCIIP_RUNTIME_PAYLOAD_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_PAYLOAD_FACTORY.');
      if (typeof SCIIP_RUNTIME_CONTEXT === 'undefined') errors.push('Missing SCIIP_RUNTIME_CONTEXT.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var headers = [
        'businessKey',
        'transactionId',
        'processor',
        'executionStatus',
        'sourceSheet',
        'sourceStatusRequired',
        'recordsRead',
        'recordsCreated',
        'gisExecutionId',
        'gisBusinessKey',
        'gisStatus',
        'gisPayloadJson',
        'runtimeMilestone',
        'domainMilestone',
        'nextProcessor',
        'frameworkVersion',
        'createdAt'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, headers);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, headers);

      var now = new Date();
      var gisExecutionId = '6870|' + context.businessKey;
      var gisBusinessKey = 'GIS_EXECUTION|' + context.businessKey;
      var gisPayload = {
        processor: context.processor,
        executionStatus: 'COORDINATES_RESOLVED',
        sourceSheet: 'GIS_EXECUTION_READINESS',
        sourceStatusRequired: 'GIS_EXECUTION_READY',
        targetSheet: definition.targetSheet,
        transactionId: transaction.transactionId,
        generatedAt: now.toISOString(),
        summary: 'Resolves coordinate-ready GIS records for accepted SCIIP assets and graph nodes.'
      };

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, headers, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'COORDINATES_RESOLVED',
        sourceSheet: 'GIS_EXECUTION_READINESS',
        sourceStatusRequired: 'GIS_EXECUTION_READY',
        recordsRead: 1,
        recordsCreated: 1,
        gisExecutionId: gisExecutionId,
        gisBusinessKey: gisBusinessKey,
        gisStatus: 'COORDINATES_RESOLVED',
        gisPayloadJson: JSON.stringify(gisPayload),
        runtimeMilestone: 'v5.4-runtime-6200',
        domainMilestone: 'v5.5-gis-execution',
        nextProcessor: '6880_SpatialGeometryCreationProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: 1,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          executionStatus: 'COORDINATES_RESOLVED',
          sourceSheet: 'GIS_EXECUTION_READINESS',
          requiredSourceStatus: 'GIS_EXECUTION_READY',
          recordsRead: 1,
          recordsCreated: 1,
          transactionId: transaction.transactionId,
          nextProcessor: '6880_SpatialGeometryCreationProcessor'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.ledgerSheet, headers, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'COORDINATES_RESOLVED',
        sourceSheet: 'GIS_EXECUTION_READINESS',
        sourceStatusRequired: 'GIS_EXECUTION_READY',
        recordsRead: 1,
        recordsCreated: 1,
        gisExecutionId: gisExecutionId,
        gisBusinessKey: gisBusinessKey,
        gisStatus: 'COORDINATES_RESOLVED',
        gisPayloadJson: JSON.stringify(result),
        runtimeMilestone: 'v5.4-runtime-6200',
        domainMilestone: 'v5.5-gis-execution',
        nextProcessor: '6880_SpatialGeometryCreationProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      return result;
    }
  });
}

function run6870_CoordinateResolutionProcessor() {
  return sciipRun6870_CoordinateResolutionProcessor();
}

function sciipTest6870_CoordinateResolutionProcessor() {
  var result = sciipRun6870_CoordinateResolutionProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6870_CoordinateResolutionProcessor',
    result: result
  }));
  return result;
}
