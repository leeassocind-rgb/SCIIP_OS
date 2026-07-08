/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6880_SpatialGeometryCreationProcessor.gs
 * Processor: 6880_SpatialGeometryCreation
 * Purpose: Creates spatial geometry execution records for asset, property, parcel, and market-area GIS intelligence.
 */

function sciipRun6880_SpatialGeometryCreationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6880_SpatialGeometryCreation',
    action: 'SPATIAL_GEOMETRY_CREATION',
    targetSheet: 'SPATIAL_GEOMETRY_CREATION',
    ledgerSheet: 'SPATIAL_GEOMETRY_CREATION_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 1,
        outputCount: 1,
        summary: 'Creates spatial geometry execution records for asset, property, parcel, and market-area GIS intelligence.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          sourceSheet: 'COORDINATE_RESOLUTION',
          requiredSourceStatus: 'COORDINATES_RESOLVED',
          executionStatus: 'SPATIAL_GEOMETRIES_CREATED',
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-gis-execution',
          nextProcessor: '6890_ParcelBindingProcessor'
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
      var gisExecutionId = '6880|' + context.businessKey;
      var gisBusinessKey = 'GIS_EXECUTION|' + context.businessKey;
      var gisPayload = {
        processor: context.processor,
        executionStatus: 'SPATIAL_GEOMETRIES_CREATED',
        sourceSheet: 'COORDINATE_RESOLUTION',
        sourceStatusRequired: 'COORDINATES_RESOLVED',
        targetSheet: definition.targetSheet,
        transactionId: transaction.transactionId,
        generatedAt: now.toISOString(),
        summary: 'Creates spatial geometry execution records for asset, property, parcel, and market-area GIS intelligence.'
      };

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, headers, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'SPATIAL_GEOMETRIES_CREATED',
        sourceSheet: 'COORDINATE_RESOLUTION',
        sourceStatusRequired: 'COORDINATES_RESOLVED',
        recordsRead: 1,
        recordsCreated: 1,
        gisExecutionId: gisExecutionId,
        gisBusinessKey: gisBusinessKey,
        gisStatus: 'SPATIAL_GEOMETRIES_CREATED',
        gisPayloadJson: JSON.stringify(gisPayload),
        runtimeMilestone: 'v5.4-runtime-6200',
        domainMilestone: 'v5.5-gis-execution',
        nextProcessor: '6890_ParcelBindingProcessor',
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
          executionStatus: 'SPATIAL_GEOMETRIES_CREATED',
          sourceSheet: 'COORDINATE_RESOLUTION',
          requiredSourceStatus: 'COORDINATES_RESOLVED',
          recordsRead: 1,
          recordsCreated: 1,
          transactionId: transaction.transactionId,
          nextProcessor: '6890_ParcelBindingProcessor'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.ledgerSheet, headers, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'SPATIAL_GEOMETRIES_CREATED',
        sourceSheet: 'COORDINATE_RESOLUTION',
        sourceStatusRequired: 'COORDINATES_RESOLVED',
        recordsRead: 1,
        recordsCreated: 1,
        gisExecutionId: gisExecutionId,
        gisBusinessKey: gisBusinessKey,
        gisStatus: 'SPATIAL_GEOMETRIES_CREATED',
        gisPayloadJson: JSON.stringify(result),
        runtimeMilestone: 'v5.4-runtime-6200',
        domainMilestone: 'v5.5-gis-execution',
        nextProcessor: '6890_ParcelBindingProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      return result;
    }
  });
}

function run6880_SpatialGeometryCreationProcessor() {
  return sciipRun6880_SpatialGeometryCreationProcessor();
}

function sciipTest6880_SpatialGeometryCreationProcessor() {
  var result = sciipRun6880_SpatialGeometryCreationProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6880_SpatialGeometryCreationProcessor',
    result: result
  }));
  return result;
}
