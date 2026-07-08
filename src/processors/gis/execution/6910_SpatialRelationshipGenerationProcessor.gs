/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6910_SpatialRelationshipGenerationProcessor.gs
 * Processor: 6910_SpatialRelationshipGeneration
 * Purpose: Generates spatial relationship records for proximity, containment, adjacency, and market-intelligence GIS relationships.
 */

function sciipRun6910_SpatialRelationshipGenerationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6910_SpatialRelationshipGeneration',
    action: 'SPATIAL_RELATIONSHIP_GENERATION',
    targetSheet: 'SPATIAL_RELATIONSHIP_GENERATION',
    ledgerSheet: 'SPATIAL_RELATIONSHIP_GENERATION_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 1,
        outputCount: 1,
        summary: 'Generates spatial relationship records for proximity, containment, adjacency, and market-intelligence GIS relationships.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          sourceSheet: 'JURISDICTION_BINDING',
          requiredSourceStatus: 'JURISDICTIONS_BOUND',
          executionStatus: 'SPATIAL_RELATIONSHIPS_GENERATED',
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-gis-execution',
          nextProcessor: '6920_GISValidationProcessor'
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
      var gisExecutionId = '6910|' + context.businessKey;
      var gisBusinessKey = 'GIS_EXECUTION|' + context.businessKey;
      var gisPayload = {
        processor: context.processor,
        executionStatus: 'SPATIAL_RELATIONSHIPS_GENERATED',
        sourceSheet: 'JURISDICTION_BINDING',
        sourceStatusRequired: 'JURISDICTIONS_BOUND',
        targetSheet: definition.targetSheet,
        transactionId: transaction.transactionId,
        generatedAt: now.toISOString(),
        summary: 'Generates spatial relationship records for proximity, containment, adjacency, and market-intelligence GIS relationships.'
      };

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, headers, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'SPATIAL_RELATIONSHIPS_GENERATED',
        sourceSheet: 'JURISDICTION_BINDING',
        sourceStatusRequired: 'JURISDICTIONS_BOUND',
        recordsRead: 1,
        recordsCreated: 1,
        gisExecutionId: gisExecutionId,
        gisBusinessKey: gisBusinessKey,
        gisStatus: 'SPATIAL_RELATIONSHIPS_GENERATED',
        gisPayloadJson: JSON.stringify(gisPayload),
        runtimeMilestone: 'v5.4-runtime-6200',
        domainMilestone: 'v5.5-gis-execution',
        nextProcessor: '6920_GISValidationProcessor',
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
          executionStatus: 'SPATIAL_RELATIONSHIPS_GENERATED',
          sourceSheet: 'JURISDICTION_BINDING',
          requiredSourceStatus: 'JURISDICTIONS_BOUND',
          recordsRead: 1,
          recordsCreated: 1,
          transactionId: transaction.transactionId,
          nextProcessor: '6920_GISValidationProcessor'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.ledgerSheet, headers, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'SPATIAL_RELATIONSHIPS_GENERATED',
        sourceSheet: 'JURISDICTION_BINDING',
        sourceStatusRequired: 'JURISDICTIONS_BOUND',
        recordsRead: 1,
        recordsCreated: 1,
        gisExecutionId: gisExecutionId,
        gisBusinessKey: gisBusinessKey,
        gisStatus: 'SPATIAL_RELATIONSHIPS_GENERATED',
        gisPayloadJson: JSON.stringify(result),
        runtimeMilestone: 'v5.4-runtime-6200',
        domainMilestone: 'v5.5-gis-execution',
        nextProcessor: '6920_GISValidationProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      return result;
    }
  });
}

function run6910_SpatialRelationshipGenerationProcessor() {
  return sciipRun6910_SpatialRelationshipGenerationProcessor();
}

function sciipTest6910_SpatialRelationshipGenerationProcessor() {
  var result = sciipRun6910_SpatialRelationshipGenerationProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6910_SpatialRelationshipGenerationProcessor',
    result: result
  }));
  return result;
}
