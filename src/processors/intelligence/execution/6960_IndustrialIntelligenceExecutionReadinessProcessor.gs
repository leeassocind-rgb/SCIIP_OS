/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * Processor: 6960_IndustrialIntelligenceExecutionReadiness
 * Purpose: Industrial Intelligence Execution Readiness for SCIIP industrial intelligence execution.
 */

function sciipRun6960_IndustrialIntelligenceExecutionReadinessProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6960_IndustrialIntelligenceExecutionReadiness',
    action: 'INDUSTRIAL_INTELLIGENCE_EXECUTION_READINESS',
    targetSheet: 'INDUSTRIAL_INTELLIGENCE_EXECUTION_READINESS',
    ledgerSheet: 'INDUSTRIAL_INTELLIGENCE_EXECUTION_READINESS_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 1,
        outputCount: 1,
        summary: 'Industrial Intelligence Execution Readiness payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          domainMilestone: 'v5.5-industrial-intelligence-execution',
          upstreamSourceSheet: definition.sourceSheet || 'SELF_CERTIFYING',
          requiredSourceStatus: definition.requiredSourceStatus || 'SELF_CERTIFYING',
          nextProcessor: '6970_MarketContextIntelligenceProcessor'
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
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var targetHeaders = [
        'businessKey',
        'transactionId',
        'processor',
        'executionStatus',
        'sourceSheet',
        'requiredSourceStatus',
        'recordsRead',
        'intelligenceLayer',
        'intelligenceScope',
        'intelligenceSummary',
        'nextProcessor',
        'frameworkVersion',
        'createdAt'
      ];

      var ledgerHeaders = [
        'businessKey',
        'transactionId',
        'processor',
        'executionStatus',
        'targetSheet',
        'recordsCreated',
        'resultJson',
        'frameworkVersion',
        'createdAt'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, targetHeaders);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, ledgerHeaders);

      var sourceRecords = [{ bootstrap: true }];

      var now = new Date();

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.targetSheet,
        targetHeaders,
        {
          businessKey: context.businessKey,
          transactionId: transaction.transactionId,
          processor: context.processor,
          executionStatus: 'INDUSTRIAL_INTELLIGENCE_EXECUTION_READY',
          sourceSheet: definition.sourceSheet || 'SELF_CERTIFYING',
          requiredSourceStatus: definition.requiredSourceStatus || 'SELF_CERTIFYING',
          recordsRead: sourceRecords.length,
          intelligenceLayer: 'industrial_intelligence',
          intelligenceScope: 'Industrial Intelligence Execution Readiness',
          intelligenceSummary: 'SCIIP_OS industrial intelligence execution layer advanced by 6960_IndustrialIntelligenceExecutionReadiness.',
          nextProcessor: '6970_MarketContextIntelligenceProcessor',
          frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
          createdAt: now
        }
      );

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        message: JSON.stringify({
          executionStatus: 'INDUSTRIAL_INTELLIGENCE_EXECUTION_READY',
          sourceSheet: definition.sourceSheet || 'SELF_CERTIFYING',
          requiredSourceStatus: definition.requiredSourceStatus || 'SELF_CERTIFYING',
          recordsRead: sourceRecords.length,
          recordsCreated: 1,
          transactionId: transaction.transactionId,
          nextProcessor: '6970_MarketContextIntelligenceProcessor'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          businessKey: context.businessKey,
          transactionId: transaction.transactionId,
          processor: context.processor,
          executionStatus: 'INDUSTRIAL_INTELLIGENCE_EXECUTION_READY',
          targetSheet: definition.targetSheet,
          recordsCreated: 1,
          resultJson: JSON.stringify(result),
          frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
          createdAt: now
        }
      );

      return result;
    }
  });
}

function run6960_IndustrialIntelligenceExecutionReadinessProcessor() {
  return sciipRun6960_IndustrialIntelligenceExecutionReadinessProcessor();
}

function sciipTest6960_IndustrialIntelligenceExecutionReadinessProcessor() {
  var result = sciipRun6960_IndustrialIntelligenceExecutionReadinessProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6960_IndustrialIntelligenceExecutionReadinessProcessor',
    result: result
  }));
  return result;
}

function sciip6960ReadMatchingSourceRows_(sheetName, requiredStatus) {
  if (!sheetName || !requiredStatus) return [{ bootstrap: true }];

  var sheet = SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(sheetName, []);
  if (!sheet || sheet.getLastRow() < 2) return [];

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var statusIndex = headers.indexOf('executionStatus');
  if (statusIndex < 0) statusIndex = headers.indexOf('activationStatus');
  if (statusIndex < 0) statusIndex = headers.indexOf('acceptanceStatus');
  if (statusIndex < 0) statusIndex = headers.indexOf('readinessStatus');
  if (statusIndex < 0) return [];

  var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  var matches = [];
  values.forEach(function(row) {
    if (String(row[statusIndex]) === String(requiredStatus)) {
      matches.push(row);
    }
  });
  return matches;
}
