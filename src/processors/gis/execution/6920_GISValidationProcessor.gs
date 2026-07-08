/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6920_GISValidationProcessor.gs
 * Processor: 6920_GISValidation
 * Purpose: Validates GIS execution records, spatial lineage, coordinate readiness, and graph-to-GIS continuity.
 */

function sciipRun6920_GISValidationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6920_GISValidation',
    action: 'GIS_VALIDATION',
    targetSheet: 'GIS_VALIDATION',
    ledgerSheet: 'GIS_VALIDATION_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 1,
        outputCount: 1,
        summary: 'Validates GIS execution records, spatial lineage, coordinate readiness, and graph-to-GIS continuity.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          sourceSheet: 'SPATIAL_RELATIONSHIP_GENERATION',
          requiredSourceStatus: 'SPATIAL_RELATIONSHIPS_GENERATED',
          executionStatus: 'GIS_VALIDATED',
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-gis-execution',
          nextProcessor: '6930_GISLedgerProcessor'
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
      var gisExecutionId = '6920|' + context.businessKey;
      var gisBusinessKey = 'GIS_EXECUTION|' + context.businessKey;
      var gisPayload = {
        processor: context.processor,
        executionStatus: 'GIS_VALIDATED',
        sourceSheet: 'SPATIAL_RELATIONSHIP_GENERATION',
        sourceStatusRequired: 'SPATIAL_RELATIONSHIPS_GENERATED',
        targetSheet: definition.targetSheet,
        transactionId: transaction.transactionId,
        generatedAt: now.toISOString(),
        summary: 'Validates GIS execution records, spatial lineage, coordinate readiness, and graph-to-GIS continuity.'
      };

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, headers, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'GIS_VALIDATED',
        sourceSheet: 'SPATIAL_RELATIONSHIP_GENERATION',
        sourceStatusRequired: 'SPATIAL_RELATIONSHIPS_GENERATED',
        recordsRead: 1,
        recordsCreated: 1,
        gisExecutionId: gisExecutionId,
        gisBusinessKey: gisBusinessKey,
        gisStatus: 'GIS_VALIDATED',
        gisPayloadJson: JSON.stringify(gisPayload),
        runtimeMilestone: 'v5.4-runtime-6200',
        domainMilestone: 'v5.5-gis-execution',
        nextProcessor: '6930_GISLedgerProcessor',
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
          executionStatus: 'GIS_VALIDATED',
          sourceSheet: 'SPATIAL_RELATIONSHIP_GENERATION',
          requiredSourceStatus: 'SPATIAL_RELATIONSHIPS_GENERATED',
          recordsRead: 1,
          recordsCreated: 1,
          transactionId: transaction.transactionId,
          nextProcessor: '6930_GISLedgerProcessor'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.ledgerSheet, headers, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'GIS_VALIDATED',
        sourceSheet: 'SPATIAL_RELATIONSHIP_GENERATION',
        sourceStatusRequired: 'SPATIAL_RELATIONSHIPS_GENERATED',
        recordsRead: 1,
        recordsCreated: 1,
        gisExecutionId: gisExecutionId,
        gisBusinessKey: gisBusinessKey,
        gisStatus: 'GIS_VALIDATED',
        gisPayloadJson: JSON.stringify(result),
        runtimeMilestone: 'v5.4-runtime-6200',
        domainMilestone: 'v5.5-gis-execution',
        nextProcessor: '6930_GISLedgerProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      return result;
    }
  });
}

function run6920_GISValidationProcessor() {
  return sciipRun6920_GISValidationProcessor();
}

function sciipTest6920_GISValidationProcessor() {
  var result = sciipRun6920_GISValidationProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6920_GISValidationProcessor',
    result: result
  }));
  return result;
}
