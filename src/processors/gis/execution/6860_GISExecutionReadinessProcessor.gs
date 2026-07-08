/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6860_GISExecutionReadinessProcessor.gs
 * Processor: 6860_GISExecutionReadiness
 * Purpose: Prepares the GIS execution layer after accepted graph execution records exist.
 */

function sciipRun6860_GISExecutionReadinessProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6860_GISExecutionReadiness',
    action: 'GIS_EXECUTION_READINESS',
    targetSheet: 'GIS_EXECUTION_READINESS',
    ledgerSheet: 'GIS_EXECUTION_READINESS_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 1,
        outputCount: 1,
        summary: 'Prepares the GIS execution layer after accepted graph execution records exist.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          sourceSheet: 'GRAPH_ACCEPTANCE',
          requiredSourceStatus: 'GRAPH_EXECUTION_ACCEPTED',
          executionStatus: 'GIS_EXECUTION_READY',
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-gis-execution',
          nextProcessor: '6870_CoordinateResolutionProcessor'
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
      var gisExecutionId = '6860|' + context.businessKey;
      var gisBusinessKey = 'GIS_EXECUTION|' + context.businessKey;
      var gisPayload = {
        processor: context.processor,
        executionStatus: 'GIS_EXECUTION_READY',
        sourceSheet: 'GRAPH_ACCEPTANCE',
        sourceStatusRequired: 'GRAPH_EXECUTION_ACCEPTED',
        targetSheet: definition.targetSheet,
        transactionId: transaction.transactionId,
        generatedAt: now.toISOString(),
        summary: 'Prepares the GIS execution layer after accepted graph execution records exist.'
      };

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, headers, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'GIS_EXECUTION_READY',
        sourceSheet: 'GRAPH_ACCEPTANCE',
        sourceStatusRequired: 'GRAPH_EXECUTION_ACCEPTED',
        recordsRead: 1,
        recordsCreated: 1,
        gisExecutionId: gisExecutionId,
        gisBusinessKey: gisBusinessKey,
        gisStatus: 'GIS_EXECUTION_READY',
        gisPayloadJson: JSON.stringify(gisPayload),
        runtimeMilestone: 'v5.4-runtime-6200',
        domainMilestone: 'v5.5-gis-execution',
        nextProcessor: '6870_CoordinateResolutionProcessor',
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
          executionStatus: 'GIS_EXECUTION_READY',
          sourceSheet: 'GRAPH_ACCEPTANCE',
          requiredSourceStatus: 'GRAPH_EXECUTION_ACCEPTED',
          recordsRead: 1,
          recordsCreated: 1,
          transactionId: transaction.transactionId,
          nextProcessor: '6870_CoordinateResolutionProcessor'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.ledgerSheet, headers, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'GIS_EXECUTION_READY',
        sourceSheet: 'GRAPH_ACCEPTANCE',
        sourceStatusRequired: 'GRAPH_EXECUTION_ACCEPTED',
        recordsRead: 1,
        recordsCreated: 1,
        gisExecutionId: gisExecutionId,
        gisBusinessKey: gisBusinessKey,
        gisStatus: 'GIS_EXECUTION_READY',
        gisPayloadJson: JSON.stringify(result),
        runtimeMilestone: 'v5.4-runtime-6200',
        domainMilestone: 'v5.5-gis-execution',
        nextProcessor: '6870_CoordinateResolutionProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      return result;
    }
  });
}

function run6860_GISExecutionReadinessProcessor() {
  return sciipRun6860_GISExecutionReadinessProcessor();
}

function sciipTest6860_GISExecutionReadinessProcessor() {
  var result = sciipRun6860_GISExecutionReadinessProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6860_GISExecutionReadinessProcessor',
    result: result
  }));
  return result;
}
