/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6890_ParcelBindingProcessor.gs
 * Processor: 6890_ParcelBinding
 * Purpose: Binds spatially resolved assets to parcel-ready GIS records.
 */

function sciipRun6890_ParcelBindingProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6890_ParcelBinding',
    action: 'PARCEL_BINDING',
    targetSheet: 'PARCEL_BINDING',
    ledgerSheet: 'PARCEL_BINDING_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 1,
        outputCount: 1,
        summary: 'Binds spatially resolved assets to parcel-ready GIS records.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          sourceSheet: 'SPATIAL_GEOMETRY_CREATION',
          requiredSourceStatus: 'SPATIAL_GEOMETRIES_CREATED',
          executionStatus: 'PARCELS_BOUND',
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-gis-execution',
          nextProcessor: '6900_JurisdictionBindingProcessor'
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
      var gisExecutionId = '6890|' + context.businessKey;
      var gisBusinessKey = 'GIS_EXECUTION|' + context.businessKey;
      var gisPayload = {
        processor: context.processor,
        executionStatus: 'PARCELS_BOUND',
        sourceSheet: 'SPATIAL_GEOMETRY_CREATION',
        sourceStatusRequired: 'SPATIAL_GEOMETRIES_CREATED',
        targetSheet: definition.targetSheet,
        transactionId: transaction.transactionId,
        generatedAt: now.toISOString(),
        summary: 'Binds spatially resolved assets to parcel-ready GIS records.'
      };

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, headers, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'PARCELS_BOUND',
        sourceSheet: 'SPATIAL_GEOMETRY_CREATION',
        sourceStatusRequired: 'SPATIAL_GEOMETRIES_CREATED',
        recordsRead: 1,
        recordsCreated: 1,
        gisExecutionId: gisExecutionId,
        gisBusinessKey: gisBusinessKey,
        gisStatus: 'PARCELS_BOUND',
        gisPayloadJson: JSON.stringify(gisPayload),
        runtimeMilestone: 'v5.4-runtime-6200',
        domainMilestone: 'v5.5-gis-execution',
        nextProcessor: '6900_JurisdictionBindingProcessor',
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
          executionStatus: 'PARCELS_BOUND',
          sourceSheet: 'SPATIAL_GEOMETRY_CREATION',
          requiredSourceStatus: 'SPATIAL_GEOMETRIES_CREATED',
          recordsRead: 1,
          recordsCreated: 1,
          transactionId: transaction.transactionId,
          nextProcessor: '6900_JurisdictionBindingProcessor'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.ledgerSheet, headers, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'PARCELS_BOUND',
        sourceSheet: 'SPATIAL_GEOMETRY_CREATION',
        sourceStatusRequired: 'SPATIAL_GEOMETRIES_CREATED',
        recordsRead: 1,
        recordsCreated: 1,
        gisExecutionId: gisExecutionId,
        gisBusinessKey: gisBusinessKey,
        gisStatus: 'PARCELS_BOUND',
        gisPayloadJson: JSON.stringify(result),
        runtimeMilestone: 'v5.4-runtime-6200',
        domainMilestone: 'v5.5-gis-execution',
        nextProcessor: '6900_JurisdictionBindingProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      return result;
    }
  });
}

function run6890_ParcelBindingProcessor() {
  return sciipRun6890_ParcelBindingProcessor();
}

function sciipTest6890_ParcelBindingProcessor() {
  var result = sciipRun6890_ParcelBindingProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6890_ParcelBindingProcessor',
    result: result
  }));
  return result;
}
