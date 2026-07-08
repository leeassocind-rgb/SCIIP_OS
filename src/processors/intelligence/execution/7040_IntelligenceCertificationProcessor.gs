/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * Processor: 7040_IntelligenceCertification
 * Purpose: Intelligence Certification for SCIIP industrial intelligence execution.
 */

function sciipRun7040_IntelligenceCertificationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '7040_IntelligenceCertification',
    action: 'INTELLIGENCE_CERTIFICATION',
    targetSheet: 'INTELLIGENCE_CERTIFICATION',
    ledgerSheet: 'INTELLIGENCE_CERTIFICATION_LEDGER',
        sourceSheet: 'INTELLIGENCE_VALIDATION',
        requiredSourceStatus: 'INTELLIGENCE_VALIDATED',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 1,
        outputCount: 1,
        summary: 'Intelligence Certification payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          domainMilestone: 'v5.5-industrial-intelligence-execution',
          upstreamSourceSheet: definition.sourceSheet || 'SELF_CERTIFYING',
          requiredSourceStatus: definition.requiredSourceStatus || 'SELF_CERTIFYING',
          nextProcessor: '7050_IntelligenceAcceptanceProcessor'
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

      var sourceRecords = sciip7040ReadMatchingSourceRows_(definition.sourceSheet, definition.requiredSourceStatus);
      if (sourceRecords.length === 0) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: context.processor,
          businessKey: context.businessKey,
          message: JSON.stringify({
            executionStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            recordsRead: 0,
            matchingRecords: 0,
            requiredSourceStatus: definition.requiredSourceStatus,
            transactionId: transaction.transactionId,
            nextAction: 'Run upstream processor before 7040_IntelligenceCertification so required industrial intelligence records exist.'
          })
        });
      }

      var now = new Date();

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.targetSheet,
        targetHeaders,
        {
          businessKey: context.businessKey,
          transactionId: transaction.transactionId,
          processor: context.processor,
          executionStatus: 'INTELLIGENCE_CERTIFIED',
          sourceSheet: definition.sourceSheet || 'SELF_CERTIFYING',
          requiredSourceStatus: definition.requiredSourceStatus || 'SELF_CERTIFYING',
          recordsRead: sourceRecords.length,
          intelligenceLayer: 'industrial_intelligence',
          intelligenceScope: 'Intelligence Certification',
          intelligenceSummary: 'SCIIP_OS industrial intelligence execution layer advanced by 7040_IntelligenceCertification.',
          nextProcessor: '7050_IntelligenceAcceptanceProcessor',
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
          executionStatus: 'INTELLIGENCE_CERTIFIED',
          sourceSheet: definition.sourceSheet || 'SELF_CERTIFYING',
          requiredSourceStatus: definition.requiredSourceStatus || 'SELF_CERTIFYING',
          recordsRead: sourceRecords.length,
          recordsCreated: 1,
          transactionId: transaction.transactionId,
          nextProcessor: '7050_IntelligenceAcceptanceProcessor'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          businessKey: context.businessKey,
          transactionId: transaction.transactionId,
          processor: context.processor,
          executionStatus: 'INTELLIGENCE_CERTIFIED',
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

function run7040_IntelligenceCertificationProcessor() {
  return sciipRun7040_IntelligenceCertificationProcessor();
}

function sciipTest7040_IntelligenceCertificationProcessor() {
  var result = sciipRun7040_IntelligenceCertificationProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest7040_IntelligenceCertificationProcessor',
    result: result
  }));
  return result;
}

function sciip7040ReadMatchingSourceRows_(sheetName, requiredStatus) {
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
