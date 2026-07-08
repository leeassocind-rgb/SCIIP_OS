/**
 * SCIIP_OS v5.5 / Testing Framework v3
 * File: SCIIP_TestRegistry.gs
 *
 * Purpose:
 * Central test registry for processor test discovery by range, suite,
 * subsystem, explicit processor numbers, and ad hoc test function lists.
 */

var SCIIP_TEST_REGISTRY = SCIIP_TEST_REGISTRY || {};

SCIIP_TEST_REGISTRY.VERSION = 'v3.1';

SCIIP_TEST_REGISTRY.TESTS = [
  { number: 6210, subsystem: 'domain', suite: 'DomainFoundation', processor: '6210_DomainCapabilityExpansionReadiness', testFunction: 'sciipTest6210_DomainCapabilityExpansionReadinessProcessor' },
  { number: 6220, subsystem: 'domain', suite: 'DomainFoundation', processor: '6220_DomainCapabilityRegistry', testFunction: 'sciipTest6220_DomainCapabilityRegistryProcessor' },
  { number: 6230, subsystem: 'domain', suite: 'DomainFoundation', processor: '6230_DomainCapabilityExecutionLedger', testFunction: 'sciipTest6230_DomainCapabilityExecutionLedgerProcessor' },
  { number: 6240, subsystem: 'domain', suite: 'DomainFoundation', processor: '6240_AssetDomainCapabilityActivation', testFunction: 'sciipTest6240_AssetDomainCapabilityActivationProcessor' },
  { number: 6250, subsystem: 'domain', suite: 'DomainFoundation', processor: '6250_SuperSheetDomainCapabilityActivation', testFunction: 'sciipTest6250_SuperSheetDomainCapabilityActivationProcessor' },
  { number: 6260, subsystem: 'domain', suite: 'DomainFoundation', processor: '6260_IdentityDomainCapabilityActivation', testFunction: 'sciipTest6260_IdentityDomainCapabilityActivationProcessor' },
  { number: 6270, subsystem: 'domain', suite: 'DomainFoundation', processor: '6270_GraphDomainCapabilityActivation', testFunction: 'sciipTest6270_GraphDomainCapabilityActivationProcessor' },
  { number: 6280, subsystem: 'domain', suite: 'DomainFoundation', processor: '6280_GISDomainCapabilityActivation', testFunction: 'sciipTest6280_GISDomainCapabilityActivationProcessor' },
  { number: 6290, subsystem: 'domain', suite: 'DomainFoundation', processor: '6290_DomainCapabilityAcceptance', testFunction: 'sciipTest6290_DomainCapabilityAcceptanceProcessor' },

  { number: 6300, subsystem: 'domain', suite: 'DomainExecutionReadiness', processor: '6300_DomainExecutionReadiness', testFunction: 'sciipTest6300_DomainExecutionReadinessProcessor' },
  { number: 6310, subsystem: 'domain', suite: 'DomainExecutionReadiness', processor: '6310_AssetDomainExecutionPlan', testFunction: 'sciipTest6310_AssetDomainExecutionPlanProcessor' },
  { number: 6320, subsystem: 'domain', suite: 'DomainExecutionReadiness', processor: '6320_SuperSheetDomainExecutionPlan', testFunction: 'sciipTest6320_SuperSheetDomainExecutionPlanProcessor' },
  { number: 6330, subsystem: 'domain', suite: 'DomainExecutionReadiness', processor: '6330_IdentityDomainExecutionPlan', testFunction: 'sciipTest6330_IdentityDomainExecutionPlanProcessor' },
  { number: 6340, subsystem: 'domain', suite: 'DomainExecutionReadiness', processor: '6340_GraphDomainExecutionPlan', testFunction: 'sciipTest6340_GraphDomainExecutionPlanProcessor' },
  { number: 6350, subsystem: 'domain', suite: 'DomainExecutionReadiness', processor: '6350_GISDomainExecutionPlan', testFunction: 'sciipTest6350_GISDomainExecutionPlanProcessor' },
  { number: 6360, subsystem: 'domain', suite: 'DomainExecutionReadiness', processor: '6360_DomainExecutionCoordinationLedger', testFunction: 'sciipTest6360_DomainExecutionCoordinationLedgerProcessor' },
  { number: 6370, subsystem: 'domain', suite: 'DomainExecutionReadiness', processor: '6370_DomainExecutionHandoff', testFunction: 'sciipTest6370_DomainExecutionHandoffProcessor' },
  { number: 6380, subsystem: 'domain', suite: 'DomainExecutionReadiness', processor: '6380_DomainExecutionAcceptance', testFunction: 'sciipTest6380_DomainExecutionAcceptanceProcessor' },

  { number: 6390, subsystem: 'asset', suite: 'AssetRegistryExecutionReadiness', processor: '6390_AssetRegistryExecutionReadiness', testFunction: 'sciipTest6390_AssetRegistryExecutionReadinessProcessor' },
  { number: 6400, subsystem: 'asset', suite: 'AssetRegistryExecutionReadiness', processor: '6400_AssetRegistrySourceDiscoveryPlan', testFunction: 'sciipTest6400_AssetRegistrySourceDiscoveryPlanProcessor' },
  { number: 6410, subsystem: 'asset', suite: 'AssetRegistryExecutionReadiness', processor: '6410_AssetRegistrySchemaReadiness', testFunction: 'sciipTest6410_AssetRegistrySchemaReadinessProcessor' },
  { number: 6420, subsystem: 'asset', suite: 'AssetRegistryExecutionReadiness', processor: '6420_AssetRegistryIdentityBindingPlan', testFunction: 'sciipTest6420_AssetRegistryIdentityBindingPlanProcessor' },
  { number: 6430, subsystem: 'asset', suite: 'AssetRegistryExecutionReadiness', processor: '6430_AssetRegistryGraphBindingPlan', testFunction: 'sciipTest6430_AssetRegistryGraphBindingPlanProcessor' },
  { number: 6440, subsystem: 'asset', suite: 'AssetRegistryExecutionReadiness', processor: '6440_AssetRegistryGISBindingPlan', testFunction: 'sciipTest6440_AssetRegistryGISBindingPlanProcessor' },
  { number: 6450, subsystem: 'asset', suite: 'AssetRegistryExecutionReadiness', processor: '6450_AssetRegistryExecutionCoordinationLedger', testFunction: 'sciipTest6450_AssetRegistryExecutionCoordinationLedgerProcessor' },
  { number: 6460, subsystem: 'asset', suite: 'AssetRegistryExecutionReadiness', processor: '6460_AssetRegistryExecutionHandoff', testFunction: 'sciipTest6460_AssetRegistryExecutionHandoffProcessor' },
  { number: 6470, subsystem: 'asset', suite: 'AssetRegistryExecutionReadiness', processor: '6470_AssetRegistryExecutionAcceptance', testFunction: 'sciipTest6470_AssetRegistryExecutionAcceptanceProcessor' },

  { number: 6480, subsystem: 'asset', suite: 'AssetRegistryExecution', processor: '6480_AssetRegistryExecution', testFunction: 'sciipTest6480_AssetRegistryExecutionProcessor' },
  { number: 6490, subsystem: 'asset', suite: 'AssetRegistryExecution', processor: '6490_AssetDiscoveryExecution', testFunction: 'sciipTest6490_AssetDiscoveryExecutionProcessor' },
  { number: 6500, subsystem: 'asset', suite: 'AssetRegistryExecution', processor: '6500_AssetRegistryBuilder', testFunction: 'sciipTest6500_AssetRegistryBuilderProcessor' },
  { number: 6510, subsystem: 'asset', suite: 'AssetRegistryExecution', processor: '6510_AssetRelationshipBuilder', testFunction: 'sciipTest6510_AssetRelationshipBuilderProcessor' },
  { number: 6520, subsystem: 'asset', suite: 'AssetRegistryExecution', processor: '6520_AssetRegistryValidation', testFunction: 'sciipTest6520_AssetRegistryValidationProcessor' },
  { number: 6530, subsystem: 'asset', suite: 'AssetRegistryExecution', processor: '6530_AssetRegistryLedger', testFunction: 'sciipTest6530_AssetRegistryLedgerProcessor' },
  { number: 6540, subsystem: 'asset', suite: 'AssetRegistryExecution', processor: '6540_AssetRegistryCertification', testFunction: 'sciipTest6540_AssetRegistryCertificationProcessor' },
  { number: 6550, subsystem: 'asset', suite: 'AssetRegistryExecution', processor: '6550_AssetRegistryAcceptance', testFunction: 'sciipTest6550_AssetRegistryAcceptanceProcessor' },

  { number: 6560, subsystem: 'asset', suite: 'AssetDataExecution', processor: '6560_AssetDiscoveryImport', testFunction: 'sciipTest6560_AssetDiscoveryImportProcessor' },
  { number: 6570, subsystem: 'asset', suite: 'AssetDataExecution', processor: '6570_AssetIdentityResolution', testFunction: 'sciipTest6570_AssetIdentityResolutionProcessor' },
  { number: 6580, subsystem: 'asset', suite: 'AssetDataExecution', processor: '6580_AssetCreation', testFunction: 'sciipTest6580_AssetCreationProcessor' },
  { number: 6590, subsystem: 'asset', suite: 'AssetDataExecution', processor: '6590_AssetAddressBinding', testFunction: 'sciipTest6590_AssetAddressBindingProcessor' },
  { number: 6600, subsystem: 'asset', suite: 'AssetDataExecution', processor: '6600_AssetRegistryPopulation', testFunction: 'sciipTest6600_AssetRegistryPopulationProcessor' },
  { number: 6610, subsystem: 'asset', suite: 'AssetDataExecution', processor: '6610_AssetEventGeneration', testFunction: 'sciipTest6610_AssetEventGenerationProcessor' },
  { number: 6620, subsystem: 'asset', suite: 'AssetDataExecution', processor: '6620_AssetGraphNodeCreation', testFunction: 'sciipTest6620_AssetGraphNodeCreationProcessor' },
  { number: 6630, subsystem: 'asset', suite: 'AssetDataExecution', processor: '6630_AssetGISBinding', testFunction: 'sciipTest6630_AssetGISBindingProcessor' },
  { number: 6640, subsystem: 'asset', suite: 'AssetDataExecution', processor: '6640_AssetExecutionCertification', testFunction: 'sciipTest6640_AssetExecutionCertificationProcessor' },
  { number: 6650, subsystem: 'asset', suite: 'AssetDataExecution', processor: '6650_AssetAcceptance', testFunction: 'sciipTest6650_AssetAcceptanceProcessor' }
,
  { number: 6660, subsystem: 'identity', suite: 'IdentityExecution', processor: '6660_IdentityExecutionReadiness', testFunction: 'sciipTest6660_IdentityExecutionReadinessProcessor' },
  { number: 6670, subsystem: 'identity', suite: 'IdentityExecution', processor: '6670_IdentityCandidateImport', testFunction: 'sciipTest6670_IdentityCandidateImportProcessor' },
  { number: 6680, subsystem: 'identity', suite: 'IdentityExecution', processor: '6680_IdentityAliasResolution', testFunction: 'sciipTest6680_IdentityAliasResolutionProcessor' },
  { number: 6690, subsystem: 'identity', suite: 'IdentityExecution', processor: '6690_ParentAddressResolution', testFunction: 'sciipTest6690_ParentAddressResolutionProcessor' },
  { number: 6700, subsystem: 'identity', suite: 'IdentityExecution', processor: '6700_CanonicalIdentityCreation', testFunction: 'sciipTest6700_CanonicalIdentityCreationProcessor' },
  { number: 6710, subsystem: 'identity', suite: 'IdentityExecution', processor: '6710_IdentityRelationshipBinding', testFunction: 'sciipTest6710_IdentityRelationshipBindingProcessor' },
  { number: 6720, subsystem: 'identity', suite: 'IdentityExecution', processor: '6720_IdentityEventGeneration', testFunction: 'sciipTest6720_IdentityEventGenerationProcessor' },
  { number: 6730, subsystem: 'identity', suite: 'IdentityExecution', processor: '6730_IdentityGraphBinding', testFunction: 'sciipTest6730_IdentityGraphBindingProcessor' },
  { number: 6740, subsystem: 'identity', suite: 'IdentityExecution', processor: '6740_IdentityExecutionCertification', testFunction: 'sciipTest6740_IdentityExecutionCertificationProcessor' },
  { number: 6750, subsystem: 'identity', suite: 'IdentityExecution', processor: '6750_IdentityAcceptance', testFunction: 'sciipTest6750_IdentityAcceptanceProcessor' }

];

SCIIP_TEST_REGISTRY.normalizeKey = function(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
};

SCIIP_TEST_REGISTRY.all = function() {
  return SCIIP_TEST_REGISTRY.TESTS.slice().sort(function(a, b) {
    return Number(a.number) - Number(b.number);
  });
};

SCIIP_TEST_REGISTRY.byRange = function(startProcessorNumber, endProcessorNumber) {
  var start = Number(startProcessorNumber);
  var end = Number(endProcessorNumber);
  return SCIIP_TEST_REGISTRY.all().filter(function(test) {
    return Number(test.number) >= start && Number(test.number) <= end;
  });
};

SCIIP_TEST_REGISTRY.byNumbers = function(processorNumbers) {
  var numberMap = {};
  (processorNumbers || []).forEach(function(number) {
    numberMap[String(Number(number))] = true;
  });
  return SCIIP_TEST_REGISTRY.all().filter(function(test) {
    return !!numberMap[String(Number(test.number))];
  });
};

SCIIP_TEST_REGISTRY.bySuite = function(suiteName) {
  var key = SCIIP_TEST_REGISTRY.normalizeKey(suiteName);
  if (key === 'domainregression' || key === 'regression' || key === 'all') {
    return SCIIP_TEST_REGISTRY.byRange(6210, 6750);
  }
  return SCIIP_TEST_REGISTRY.all().filter(function(test) {
    return SCIIP_TEST_REGISTRY.normalizeKey(test.suite) === key;
  });
};

SCIIP_TEST_REGISTRY.bySubsystem = function(subsystemName) {
  var key = SCIIP_TEST_REGISTRY.normalizeKey(subsystemName);
  return SCIIP_TEST_REGISTRY.all().filter(function(test) {
    return SCIIP_TEST_REGISTRY.normalizeKey(test.subsystem) === key;
  });
};

SCIIP_TEST_REGISTRY.find = function(processorNumber) {
  var matches = SCIIP_TEST_REGISTRY.byNumbers([processorNumber]);
  return matches.length ? matches[0] : null;
};

SCIIP_TEST_REGISTRY.describe = function() {
  var all = SCIIP_TEST_REGISTRY.all();
  var suites = {};
  var subsystems = {};
  all.forEach(function(test) {
    suites[test.suite] = (suites[test.suite] || 0) + 1;
    subsystems[test.subsystem] = (subsystems[test.subsystem] || 0) + 1;
  });
  var result = {
    registry: 'SCIIP_TEST_REGISTRY',
    version: SCIIP_TEST_REGISTRY.VERSION,
    testsRegistered: all.length,
    firstProcessor: all.length ? all[0].number : null,
    lastProcessor: all.length ? all[all.length - 1].number : null,
    suites: suites,
    subsystems: subsystems
  };
  Logger.log(JSON.stringify(result));
  return result;
};
