/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6220_DomainCapabilityRegistryProcessor.gs
 *
 * Processor: 6220_DomainCapabilityRegistry
 *
 * Purpose:
 * Creates the first SCIIP_OS v5.5 domain capability registry.
 * This processor formally declares the production domain capabilities
 * that will execute on top of the completed runtime foundation.
 *
 * Design:
 * - Self-certifying domain-layer processor
 * - Uses SCIIP_RUNTIME_PROCESSOR_BASE
 * - Transaction-aware through SCIIP runtime transaction manager
 * - Duplicate-safe through shared runtime business-key framework
 * - Creates required target and ledger sheets automatically
 * - Preserves permanent registry and ledger history
 */

function sciipRun6220_DomainCapabilityRegistryProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6220_DomainCapabilityRegistry',
    action: 'DOMAIN_CAPABILITY_REGISTRY',
    targetSheet: 'DOMAIN_CAPABILITY_REGISTRY',
    ledgerSheet: 'DOMAIN_CAPABILITY_REGISTRY_LEDGER',

    buildPayload: function(context, definition) {
      var capabilities = sciip6220DomainCapabilities_();

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: capabilities.length,
        outputCount: capabilities.length,
        summary: 'SCIIP_OS v5.5 domain capability registry payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-domain-capability-layer',
          readinessProcessor: '6210_DomainCapabilityExpansionReadiness',
          capabilityCount: capabilities.length,
          nextProcessor: '6230_DomainCapabilityExecutionLedgerProcessor'
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

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var targetHeaders = [
        'businessKey',
        'transactionId',
        'domainCapabilityId',
        'domainCapabilityName',
        'domainCapabilityStatus',
        'domainCapabilityLayer',
        'domainCapabilityScope',
        'domainCapabilityRuntimeDependency',
        'domainCapabilityExecutionMode',
        'domainCapabilitySummary',
        'nextProcessor',
        'frameworkVersion',
        'createdAt'
      ];

      var ledgerHeaders = [
        'businessKey',
        'transactionId',
        'processor',
        'registryStatus',
        'capabilitiesRegistered',
        'runtimeMilestone',
        'domainMilestone',
        'nextProcessor',
        'resultJson',
        'frameworkVersion',
        'createdAt'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, targetHeaders);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, ledgerHeaders);

      var capabilities = sciip6220DomainCapabilities_();
      var now = new Date();
      var created = 0;
      var skippedDuplicate = 0;

      capabilities.forEach(function(capability) {
        var rowBusinessKey = context.businessKey + '|' + capability.id;

        if (sciip6220BusinessKeyExists_(definition.targetSheet, rowBusinessKey, targetHeaders)) {
          skippedDuplicate += 1;
          return;
        }

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
          definition.targetSheet,
          targetHeaders,
          {
            businessKey: rowBusinessKey,
            transactionId: transaction.transactionId,
            domainCapabilityId: capability.id,
            domainCapabilityName: capability.name,
            domainCapabilityStatus: 'REGISTERED',
            domainCapabilityLayer: capability.layer,
            domainCapabilityScope: capability.scope,
            domainCapabilityRuntimeDependency: 'SCIIP_RUNTIME_PROCESSOR_BASE|Runtime v5.2|v5.4-runtime-6200',
            domainCapabilityExecutionMode: capability.executionMode,
            domainCapabilitySummary: capability.summary,
            nextProcessor: capability.nextProcessor,
            frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
            createdAt: now
          }
        );

        created += 1;
      });

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: created,
        recordsRead: capabilities.length,
        processed: created,
        skippedDuplicate: skippedDuplicate,
        message: JSON.stringify({
          registryStatus: 'DOMAIN_CAPABILITY_REGISTRY_READY',
          capabilitiesRegistered: created,
          skippedDuplicate: skippedDuplicate,
          totalCapabilities: capabilities.length,
          transactionId: transaction.transactionId,
          nextProcessor: '6230_DomainCapabilityExecutionLedgerProcessor'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          businessKey: context.businessKey,
          transactionId: transaction.transactionId,
          processor: context.processor,
          registryStatus: 'DOMAIN_CAPABILITY_REGISTRY_READY',
          capabilitiesRegistered: created,
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-domain-capability-layer',
          nextProcessor: '6230_DomainCapabilityExecutionLedgerProcessor',
          resultJson: result,
          frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
          createdAt: now
        }
      );

      return result;
    }
  });
}

function run6220_DomainCapabilityRegistryProcessor() {
  return sciipRun6220_DomainCapabilityRegistryProcessor();
}

function sciipTest6220_DomainCapabilityRegistryProcessor() {
  var result = sciipRun6220_DomainCapabilityRegistryProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest6220_DomainCapabilityRegistryProcessor',
    result: result
  }));

  return result;
}

function sciip6220DomainCapabilities_() {
  return [
    {
      id: 'DOMAIN_CAPABILITY|ASSET_REGISTRY_EXECUTION',
      name: 'Asset Registry Execution',
      layer: 'asset',
      scope: 'Create and maintain asset-level industrial property intelligence on top of the permanent SCIIP runtime.',
      executionMode: 'RUNTIME_DOMAIN_PROCESSOR',
      summary: 'Activates asset-driven SCIIP domain processing for PROPERTY, ASSET, ADDRESS, CITY, ZIP, and STATUS graph records.',
      nextProcessor: '6240_AssetDomainCapabilityActivationProcessor'
    },
    {
      id: 'DOMAIN_CAPABILITY|SUPERSHEET_DOMAIN_EXECUTION',
      name: 'SuperSheet Domain Execution',
      layer: 'supersheet',
      scope: 'Transform AIR CRE SuperSheet import events into domain-ready property intelligence events.',
      executionMode: 'RUNTIME_DOMAIN_PROCESSOR',
      summary: 'Connects completed SuperSheet runtime infrastructure to asset registry, identity, graph, and GIS domain processors.',
      nextProcessor: '6250_SuperSheetDomainCapabilityActivationProcessor'
    },
    {
      id: 'DOMAIN_CAPABILITY|IDENTITY_RESOLUTION_EXECUTION',
      name: 'Identity Resolution Execution',
      layer: 'identity',
      scope: 'Resolve property candidates, aliases, parent addresses, and durable asset identities.',
      executionMode: 'RUNTIME_DOMAIN_PROCESSOR',
      summary: 'Prepares duplicate-safe identity resolution for industrial property records without overwrites.',
      nextProcessor: '6260_IdentityDomainCapabilityActivationProcessor'
    },
    {
      id: 'DOMAIN_CAPABILITY|KNOWLEDGE_GRAPH_EXECUTION',
      name: 'Knowledge Graph Execution',
      layer: 'graph',
      scope: 'Create and preserve graph-native nodes, edges, relationships, and domain events.',
      executionMode: 'RUNTIME_DOMAIN_PROCESSOR',
      summary: 'Moves SCIIP_OS from runtime control plane into production graph-native industrial intelligence.',
      nextProcessor: '6270_GraphDomainCapabilityActivationProcessor'
    },
    {
      id: 'DOMAIN_CAPABILITY|GIS_INTELLIGENCE_EXECUTION',
      name: 'GIS Intelligence Execution',
      layer: 'gis',
      scope: 'Bind asset intelligence to spatial, market, proximity, and map-ready industrial intelligence.',
      executionMode: 'RUNTIME_DOMAIN_PROCESSOR',
      summary: 'Prepares GIS-native domain execution for SoCal industrial market intelligence.',
      nextProcessor: '6280_GISDomainCapabilityActivationProcessor'
    }
  ];
}

function sciip6220BusinessKeyExists_(sheetName, businessKey, headers) {
  // Use the shared runtime sheet factory only. Do not call SpreadsheetApp.getActiveSpreadsheet(),
  // because standalone Apps Script projects can return null for active spreadsheet.
  if (typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined' || !SCIIP_RUNTIME_SHEET_FACTORY) {
    return false;
  }

  if (typeof SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey === 'function') {
    return !!SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(sheetName, businessKey);
  }

  if (typeof SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords === 'function') {
    var records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];

    for (var i = records.length - 1; i >= 0; i--) {
      if (String(records[i].businessKey) === String(businessKey)) return true;
      if (String(records[i].Business_Key) === String(businessKey)) return true;
    }
  }

  return false;
}
