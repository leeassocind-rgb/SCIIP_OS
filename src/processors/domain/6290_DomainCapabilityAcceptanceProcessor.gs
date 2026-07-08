/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6290_DomainCapabilityAcceptanceProcessor.gs
 *
 * Processor: 6290_DomainCapabilityAcceptance
 *
 * Purpose:
 * Certifies the SCIIP_OS v5.5 domain foundation after processors 6210–6280
 * have registered, ledgered, and activated the first production domain capabilities.
 *
 * Design:
 * - Uses SCIIP_RUNTIME_PROCESSOR_BASE
 * - Reads all v5.5 domain activation sheets
 * - Creates DOMAIN_CAPABILITY_ACCEPTANCE
 * - Creates DOMAIN_CAPABILITY_ACCEPTANCE_LEDGER_SUMMARY
 * - Transaction-aware through SCIIP runtime transaction manager
 * - Duplicate-safe through shared runtime business-key framework and sheet factory
 * - Skip-safe / validation-safe when required domain activation records are missing
 * - Preserves permanent acceptance ledger history
 */

function sciipRun6290_DomainCapabilityAcceptanceProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6290_DomainCapabilityAcceptance',
    action: 'DOMAIN_CAPABILITY_ACCEPTANCE',
    targetSheet: 'DOMAIN_CAPABILITY_ACCEPTANCE',
    ledgerSheet: 'DOMAIN_CAPABILITY_ACCEPTANCE_LEDGER_SUMMARY',

    buildPayload: function(context, definition) {
      var requirements = sciip6290DomainAcceptanceRequirements_();
      var assessment = sciip6290AssessDomainFoundation_(requirements);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: assessment.recordsRead,
        outputCount: assessment.acceptedCount,
        summary: 'SCIIP_OS v5.5 domain capability acceptance payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-domain-foundation-6290',
          requiredCapabilityCount: requirements.length,
          acceptedCapabilityCount: assessment.acceptedCount,
          missingCapabilityCount: assessment.missing.length,
          nextProcessor: '6300_DomainExecutionReadinessProcessor'
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

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var targetHeaders = [
        'businessKey',
        'transactionId',
        'acceptanceStatus',
        'runtimeMilestone',
        'domainMilestone',
        'requiredCapabilityCount',
        'acceptedCapabilityCount',
        'missingCapabilityCount',
        'acceptedCapabilityIds',
        'missingCapabilityIds',
        'acceptanceScope',
        'certificationSummary',
        'nextProcessor',
        'frameworkVersion',
        'createdAt'
      ];

      var ledgerHeaders = [
        'businessKey',
        'transactionId',
        'processor',
        'acceptanceStatus',
        'targetSheet',
        'recordsRead',
        'recordsCreated',
        'skippedDuplicate',
        'skippedValidation',
        'requiredCapabilityCount',
        'acceptedCapabilityCount',
        'missingCapabilityCount',
        'runtimeMilestone',
        'domainMilestone',
        'nextProcessor',
        'resultJson',
        'frameworkVersion',
        'createdAt'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, targetHeaders);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, ledgerHeaders);

      var requirements = sciip6290DomainAcceptanceRequirements_();
      var assessment = sciip6290AssessDomainFoundation_(requirements);
      var now = new Date();

      if (assessment.acceptedCount === 0) {
        var skippedResult = SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: assessment.recordsRead,
          message: JSON.stringify({
            acceptanceStatus: 'SKIPPED_NO_INPUTS',
            requiredCapabilityCount: requirements.length,
            acceptedCapabilityCount: assessment.acceptedCount,
            missingCapabilityCount: assessment.missing.length,
            missingCapabilityIds: assessment.missing.join(','),
            transactionId: transaction.transactionId,
            nextAction: 'Run 6240 through 6280 before 6290 so all domain capability activation records exist.'
          })
        });

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
          definition.ledgerSheet,
          ledgerHeaders,
          {
            businessKey: context.businessKey,
            transactionId: transaction.transactionId,
            processor: context.processor,
            acceptanceStatus: 'SKIPPED_NO_INPUTS',
            targetSheet: definition.targetSheet,
            recordsRead: assessment.recordsRead,
            recordsCreated: 0,
            skippedDuplicate: 0,
            skippedValidation: 0,
            requiredCapabilityCount: requirements.length,
            acceptedCapabilityCount: assessment.acceptedCount,
            missingCapabilityCount: assessment.missing.length,
            runtimeMilestone: 'v5.4-runtime-6200',
            domainMilestone: 'v5.5-domain-foundation-6290',
            nextProcessor: '6240_AssetDomainCapabilityActivationProcessor',
            resultJson: skippedResult,
            frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
            createdAt: now
          }
        );

        return skippedResult;
      }

      if (assessment.missing.length > 0) {
        var validationResult = SCIIP_RUNTIME_RESULT_FACTORY.validationFailure({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: assessment.recordsRead,
          message: JSON.stringify({
            acceptanceStatus: 'DOMAIN_CAPABILITY_ACCEPTANCE_INCOMPLETE',
            requiredCapabilityCount: requirements.length,
            acceptedCapabilityCount: assessment.acceptedCount,
            missingCapabilityCount: assessment.missing.length,
            acceptedCapabilityIds: assessment.accepted.join(','),
            missingCapabilityIds: assessment.missing.join(','),
            transactionId: transaction.transactionId,
            nextAction: 'Run missing domain activation processors before certifying the v5.5 domain foundation.'
          })
        });

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
          definition.ledgerSheet,
          ledgerHeaders,
          {
            businessKey: context.businessKey,
            transactionId: transaction.transactionId,
            processor: context.processor,
            acceptanceStatus: 'DOMAIN_CAPABILITY_ACCEPTANCE_INCOMPLETE',
            targetSheet: definition.targetSheet,
            recordsRead: assessment.recordsRead,
            recordsCreated: 0,
            skippedDuplicate: 0,
            skippedValidation: 1,
            requiredCapabilityCount: requirements.length,
            acceptedCapabilityCount: assessment.acceptedCount,
            missingCapabilityCount: assessment.missing.length,
            runtimeMilestone: 'v5.4-runtime-6200',
            domainMilestone: 'v5.5-domain-foundation-6290',
            nextProcessor: '6240_AssetDomainCapabilityActivationProcessor',
            resultJson: validationResult,
            frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
            createdAt: now
          }
        );

        return validationResult;
      }

      var rowBusinessKey = SCIIP_RUNTIME.makeBusinessKey([
        context.processor,
        definition.targetSheet,
        'DOMAIN_FOUNDATION_ACCEPTED',
        SCIIP_RUNTIME.getDateKey({})
      ]);

      var created = 0;
      var skippedDuplicate = 0;

      if (SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(definition.targetSheet, rowBusinessKey)) {
        skippedDuplicate = 1;
      } else {
        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
          definition.targetSheet,
          targetHeaders,
          {
            businessKey: rowBusinessKey,
            transactionId: transaction.transactionId,
            acceptanceStatus: 'DOMAIN_CAPABILITY_FOUNDATION_ACCEPTED',
            runtimeMilestone: 'v5.4-runtime-6200',
            domainMilestone: 'v5.5-domain-foundation-6290',
            requiredCapabilityCount: requirements.length,
            acceptedCapabilityCount: assessment.acceptedCount,
            missingCapabilityCount: assessment.missing.length,
            acceptedCapabilityIds: assessment.accepted.join(','),
            missingCapabilityIds: assessment.missing.join(','),
            acceptanceScope: 'Certifies that the v5.5 asset, supersheet, identity, graph, and GIS domain capabilities are active on the SCIIP runtime foundation.',
            certificationSummary: 'SCIIP_OS v5.5 domain foundation certified for execution-oriented domain processors.',
            nextProcessor: '6300_DomainExecutionReadinessProcessor',
            frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
            createdAt: now
          }
        );
        created = 1;
      }

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: created,
        recordsRead: assessment.recordsRead,
        processed: created,
        skippedDuplicate: skippedDuplicate,
        message: JSON.stringify({
          acceptanceStatus: 'DOMAIN_CAPABILITY_FOUNDATION_ACCEPTED',
          requiredCapabilityCount: requirements.length,
          acceptedCapabilityCount: assessment.acceptedCount,
          missingCapabilityCount: assessment.missing.length,
          recordsRead: assessment.recordsRead,
          recordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          transactionId: transaction.transactionId,
          nextProcessor: '6300_DomainExecutionReadinessProcessor'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          businessKey: context.businessKey,
          transactionId: transaction.transactionId,
          processor: context.processor,
          acceptanceStatus: 'DOMAIN_CAPABILITY_FOUNDATION_ACCEPTED',
          targetSheet: definition.targetSheet,
          recordsRead: assessment.recordsRead,
          recordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          skippedValidation: 0,
          requiredCapabilityCount: requirements.length,
          acceptedCapabilityCount: assessment.acceptedCount,
          missingCapabilityCount: assessment.missing.length,
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-domain-foundation-6290',
          nextProcessor: '6300_DomainExecutionReadinessProcessor',
          resultJson: result,
          frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
          createdAt: now
        }
      );

      return result;
    }
  });
}

function run6290_DomainCapabilityAcceptanceProcessor() {
  return sciipRun6290_DomainCapabilityAcceptanceProcessor();
}

function sciipTest6290_DomainCapabilityAcceptanceProcessor() {
  var result = sciipRun6290_DomainCapabilityAcceptanceProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest6290_DomainCapabilityAcceptanceProcessor',
    result: result
  }));

  return result;
}

function sciip6290DomainAcceptanceRequirements_() {
  return [
    {
      capabilityId: 'DOMAIN_CAPABILITY|ASSET_REGISTRY_EXECUTION',
      activationSheet: 'ASSET_DOMAIN_CAPABILITY_ACTIVATIONS',
      activeStatus: 'ASSET_DOMAIN_CAPABILITY_ACTIVE'
    },
    {
      capabilityId: 'DOMAIN_CAPABILITY|SUPERSHEET_DOMAIN_EXECUTION',
      activationSheet: 'SUPERSHEET_DOMAIN_CAPABILITY_ACTIVATIONS',
      activeStatus: 'SUPERSHEET_DOMAIN_CAPABILITY_ACTIVE'
    },
    {
      capabilityId: 'DOMAIN_CAPABILITY|IDENTITY_RESOLUTION_EXECUTION',
      activationSheet: 'IDENTITY_DOMAIN_CAPABILITY_ACTIVATIONS',
      activeStatus: 'IDENTITY_DOMAIN_CAPABILITY_ACTIVE'
    },
    {
      capabilityId: 'DOMAIN_CAPABILITY|KNOWLEDGE_GRAPH_EXECUTION',
      activationSheet: 'GRAPH_DOMAIN_CAPABILITY_ACTIVATIONS',
      activeStatus: 'GRAPH_DOMAIN_CAPABILITY_ACTIVE'
    },
    {
      capabilityId: 'DOMAIN_CAPABILITY|GIS_INTELLIGENCE_EXECUTION',
      activationSheet: 'GIS_DOMAIN_CAPABILITY_ACTIVATIONS',
      activeStatus: 'GIS_DOMAIN_CAPABILITY_ACTIVE'
    }
  ];
}

function sciip6290AssessDomainFoundation_(requirements) {
  var accepted = [];
  var missing = [];
  var recordsRead = 0;

  requirements.forEach(function(requirement) {
    var records = [];

    if (
      typeof SCIIP_RUNTIME_SHEET_FACTORY !== 'undefined' &&
      SCIIP_RUNTIME_SHEET_FACTORY &&
      SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords
    ) {
      records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(requirement.activationSheet) || [];
    }

    recordsRead += records.length;

    var active = records.some(function(record) {
      var capabilityId = record.domainCapabilityId || record.DomainCapabilityId || '';
      var activationStatus = record.activationStatus || record.ActivationStatus || '';

      return String(capabilityId) === String(requirement.capabilityId) &&
        String(activationStatus) === String(requirement.activeStatus);
    });

    if (active) {
      accepted.push(requirement.capabilityId);
    } else {
      missing.push(requirement.capabilityId);
    }
  });

  return {
    recordsRead: recordsRead,
    accepted: accepted,
    missing: missing,
    acceptedCount: accepted.length,
    missingCount: missing.length
  };
}
