/**
 * SCIIP_OS v5.5
 * File: SCIIP_TestFramework_v4.gs
 *
 * SCIIP Testing Framework v4.2
 *
 * Purpose:
 * Registry-free dynamic test execution for SCIIP_OS processors.
 *
 * Design Goals:
 * - Avoid hard-coded per-batch test registration.
 * - Run known processor ranges immediately after new processors are pushed.
 * - Discover callable test functions using generated candidate names.
 * - Preserve SCIIP_TEST.runRange(start, end) API.
 * - Provide durable framework summaries through Logger output.
 *
 * Note:
 * Google Apps Script does not provide a reliable enumerable global function registry
 * across all deployment/runtime contexts. v4 therefore uses deterministic candidate
 * discovery by processor number and known SCIIP processor suffix conventions.
 */

var SCIIP_TEST = (typeof SCIIP_TEST !== 'undefined') ? SCIIP_TEST : {};

SCIIP_TEST.VERSION = 'v4.2';

SCIIP_TEST.SUFFIX_CANDIDATES_BY_NUMBER = {
  6210: ['DomainCapabilityExpansionReadinessProcessor'],
  6220: ['DomainCapabilityRegistryProcessor'],
  6230: ['DomainCapabilityExecutionLedgerProcessor'],
  6240: ['AssetDomainCapabilityActivationProcessor'],
  6250: ['SuperSheetDomainCapabilityActivationProcessor'],
  6260: ['IdentityDomainCapabilityActivationProcessor'],
  6270: ['GraphDomainCapabilityActivationProcessor'],
  6280: ['GISDomainCapabilityActivationProcessor'],
  6290: ['DomainCapabilityAcceptanceProcessor'],

  6300: ['DomainExecutionReadinessProcessor'],
  6310: ['AssetDomainExecutionPlanProcessor'],
  6320: ['SuperSheetDomainExecutionPlanProcessor'],
  6330: ['IdentityDomainExecutionPlanProcessor'],
  6340: ['GraphDomainExecutionPlanProcessor'],
  6350: ['GISDomainExecutionPlanProcessor'],
  6360: ['DomainExecutionCoordinationLedgerProcessor'],
  6370: ['DomainExecutionHandoffProcessor'],
  6380: ['DomainExecutionAcceptanceProcessor'],

  6390: ['AssetRegistryExecutionReadinessProcessor'],
  6400: ['AssetRegistrySourceDiscoveryPlanProcessor'],
  6410: ['AssetRegistrySchemaReadinessProcessor'],
  6420: ['AssetRegistryIdentityBindingPlanProcessor'],
  6430: ['AssetRegistryGraphBindingPlanProcessor'],
  6440: ['AssetRegistryGISBindingPlanProcessor'],
  6450: ['AssetRegistryExecutionCoordinationLedgerProcessor'],
  6460: ['AssetRegistryExecutionHandoffProcessor'],
  6470: ['AssetRegistryExecutionAcceptanceProcessor'],

  6480: ['AssetRegistryExecutionProcessor'],
  6490: ['AssetDiscoveryExecutionProcessor'],
  6500: ['AssetRegistryBuilderProcessor'],
  6510: ['AssetRelationshipBuilderProcessor'],
  6520: ['AssetRegistryValidationProcessor'],
  6530: ['AssetRegistryLedgerProcessor'],
  6540: ['AssetRegistryCertificationProcessor'],
  6550: ['AssetRegistryAcceptanceProcessor'],

  6560: ['AssetDiscoveryImportProcessor'],
  6570: ['AssetIdentityResolutionProcessor'],
  6580: ['AssetCreationProcessor'],
  6590: ['AssetAddressBindingProcessor'],
  6600: ['AssetRegistryPopulationProcessor'],
  6610: ['AssetEventGenerationProcessor'],
  6620: ['AssetGraphNodeCreationProcessor'],
  6630: ['AssetGISBindingProcessor'],
  6640: ['AssetExecutionCertificationProcessor'],
  6650: ['AssetAcceptanceProcessor'],

  6660: ['IdentityExecutionReadinessProcessor'],
  6670: ['IdentityCandidateImportProcessor'],
  6680: ['IdentityAliasResolutionProcessor'],
  6690: ['ParentAddressResolutionProcessor'],
  6700: ['CanonicalIdentityCreationProcessor'],
  6710: ['IdentityRelationshipBindingProcessor'],
  6720: ['IdentityEventGenerationProcessor'],
  6730: ['IdentityGraphBindingProcessor'],
  6740: ['IdentityExecutionCertificationProcessor'],
  6750: ['IdentityAcceptanceProcessor'],

  6760: ['GraphExecutionReadinessProcessor'],
  6770: ['GraphNodeCreationProcessor'],
  6780: ['GraphEdgeCreationProcessor'],
  6790: ['AssetIdentityGraphRelationshipProcessor'],
  6800: ['GraphHierarchyConstructionProcessor'],
  6810: ['GraphEventGenerationProcessor'],
  6820: ['GraphValidationProcessor'],
  6830: ['GraphLedgerProcessor'],
  6840: ['GraphExecutionCertificationProcessor'],
  6850: ['GraphAcceptanceProcessor']
,
  6860: ['GISExecutionReadinessProcessor'],
  6870: ['CoordinateResolutionProcessor'],
  6880: ['SpatialGeometryCreationProcessor'],
  6890: ['ParcelBindingProcessor'],
  6900: ['JurisdictionBindingProcessor'],
  6910: ['SpatialRelationshipGenerationProcessor'],
  6920: ['GISValidationProcessor'],
  6930: ['GISLedgerProcessor'],
  6940: ['GISExecutionCertificationProcessor'],
  6950: ['GISAcceptanceProcessor']

};

SCIIP_TEST.SUITES = {
  DomainFoundation: { start: 6210, end: 6290, subsystem: 'domain' },
  DomainExecutionReadiness: { start: 6300, end: 6380, subsystem: 'domain' },
  AssetRegistryExecutionReadiness: { start: 6390, end: 6470, subsystem: 'asset' },
  AssetRegistryExecution: { start: 6480, end: 6550, subsystem: 'asset' },
  AssetDataExecution: { start: 6560, end: 6650, subsystem: 'asset' },
  IdentityExecution: { start: 6660, end: 6750, subsystem: 'identity' },
  GraphExecution: { start: 6760, end: 6850, subsystem: 'graph' },
  GISExecution: { start: 6860, end: 6950, subsystem: 'gis' }
};

SCIIP_TEST.getGlobal_ = function() {
  try {
    if (typeof globalThis !== 'undefined') return globalThis;
  } catch (err) {}
  try {
    return this;
  } catch (err2) {}
  return null;
};

SCIIP_TEST.getFunction_ = function(name) {
  var g = SCIIP_TEST.getGlobal_();
  if (g && typeof g[name] === 'function') return g[name];
  try {
    var fn = eval(name);
    if (typeof fn === 'function') return fn;
  } catch (err) {}
  return null;
};

SCIIP_TEST.resolveTestFunctionForNumber = function(processorNumber) {
  var suffixes = SCIIP_TEST.SUFFIX_CANDIDATES_BY_NUMBER[processorNumber] || [];
  for (var i = 0; i < suffixes.length; i++) {
    var testName = 'sciipTest' + processorNumber + '_' + suffixes[i];
    var fn = SCIIP_TEST.getFunction_(testName);
    if (fn) {
      return {
        processorNumber: processorNumber,
        testFunction: testName,
        fn: fn,
        discovered: true
      };
    }
  }

  // Last-resort conventional names for future processors if suffix is registered elsewhere.
  var genericNames = [
    'sciipTest' + processorNumber,
    'sciipTestProcessor' + processorNumber
  ];

  for (var j = 0; j < genericNames.length; j++) {
    var genericFn = SCIIP_TEST.getFunction_(genericNames[j]);
    if (genericFn) {
      return {
        processorNumber: processorNumber,
        testFunction: genericNames[j],
        fn: genericFn,
        discovered: true
      };
    }
  }

  return {
    processorNumber: processorNumber,
    testFunction: null,
    fn: null,
    discovered: false
  };
};

SCIIP_TEST.discoverRange = function(startProcessor, endProcessor) {
  var discovered = [];
  for (var n = startProcessor; n <= endProcessor; n += 10) {
    var resolved = SCIIP_TEST.resolveTestFunctionForNumber(n);
    if (resolved.discovered) discovered.push(resolved);
  }
  return discovered;
};

SCIIP_TEST.normalizeTestResult_ = function(testFunctionName, processorNumber, result, startedAt, completedAt) {
  result = result || {};
  var processorStatus = result.status || 'UNKNOWN';
  var passed = processorStatus === 'SUCCESS' || processorStatus === 'SKIPPED_NO_INPUTS';

  return {
    testFunction: testFunctionName,
    processorNumber: processorNumber,
    status: passed ? 'PASSED' : 'FAILED',
    processor: result.processor || null,
    processorStatus: processorStatus,
    businessKey: result.businessKey || null,
    recordsCreated: result.recordsCreated || 0,
    recordsUpdated: result.recordsUpdated || 0,
    recordsRead: result.recordsRead || 0,
    processed: result.processed || 0,
    skippedDuplicate: result.skippedDuplicate || 0,
    skippedNoInputs: result.skippedNoInputs || 0,
    skippedValidation: result.skippedValidation || 0,
    errors: result.errors || 0,
    message: result.message || '',
    frameworkVersion: result.frameworkVersion || null,
    startedAt: startedAt.toISOString(),
    completedAt: completedAt.toISOString(),
    durationMs: completedAt.getTime() - startedAt.getTime()
  };
};

SCIIP_TEST.runResolvedTests_ = function(suiteName, resolvedTests) {
  var startedAt = new Date();
  var results = [];
  var testsPassed = 0;
  var testsFailed = 0;
  var skippedNoInputs = 0;
  var duplicateSafeSuccess = 0;
  var missing = [];

  for (var i = 0; i < resolvedTests.length; i++) {
    var item = resolvedTests[i];
    if (!item.fn) {
      missing.push(item.processorNumber);
      continue;
    }

    var testStartedAt = new Date();
    try {
      var raw = item.fn();
      var testCompletedAt = new Date();
      var normalized = SCIIP_TEST.normalizeTestResult_(item.testFunction, item.processorNumber, raw, testStartedAt, testCompletedAt);
      results.push(normalized);
      if (normalized.status === 'PASSED') testsPassed += 1;
      else testsFailed += 1;
      if (normalized.processorStatus === 'SKIPPED_NO_INPUTS') skippedNoInputs += 1;
      if (normalized.processorStatus === 'SUCCESS' && normalized.skippedDuplicate > 0) duplicateSafeSuccess += 1;
    } catch (err) {
      var failedAt = new Date();
      testsFailed += 1;
      results.push({
        testFunction: item.testFunction,
        processorNumber: item.processorNumber,
        status: 'FAILED',
        processorStatus: 'ERROR',
        error: String(err && err.stack ? err.stack : err),
        startedAt: testStartedAt.toISOString(),
        completedAt: failedAt.toISOString(),
        durationMs: failedAt.getTime() - testStartedAt.getTime()
      });
    }
  }

  var completedAt = new Date();
  var summary = {
    framework: 'SCIIP_TEST_FRAMEWORK',
    frameworkVersion: SCIIP_TEST.VERSION,
    suiteName: suiteName,
    status: testsFailed === 0 ? 'PASSED' : 'FAILED',
    testsDiscovered: resolvedTests.length,
    testsRun: results.length,
    testsPassed: testsPassed,
    testsFailed: testsFailed,
    skippedNoInputs: skippedNoInputs,
    duplicateSafeSuccess: duplicateSafeSuccess,
    missingProcessorNumbers: missing,
    startedAt: startedAt.toISOString(),
    completedAt: completedAt.toISOString(),
    durationMs: completedAt.getTime() - startedAt.getTime(),
    results: results
  };

  Logger.log(JSON.stringify(summary));
  return summary;
};

SCIIP_TEST.runRange = function(startProcessor, endProcessor) {
  var resolved = [];
  var missing = [];
  for (var n = startProcessor; n <= endProcessor; n += 10) {
    var item = SCIIP_TEST.resolveTestFunctionForNumber(n);
    if (item.discovered) resolved.push(item);
    else missing.push(n);
  }

  var summary = SCIIP_TEST.runResolvedTests_('ProcessorRange_' + startProcessor + '_' + endProcessor, resolved);
  summary.expectedProcessorNumbers = [];
  for (var x = startProcessor; x <= endProcessor; x += 10) summary.expectedProcessorNumbers.push(x);
  summary.missingProcessorNumbers = missing;
  summary.testsExpected = summary.expectedProcessorNumbers.length;
  summary.testsDiscovered = resolved.length;
  if (missing.length > 0) {
    summary.status = summary.testsFailed === 0 && summary.testsRun > 0 ? 'PASSED_WITH_MISSING_TESTS' : summary.status;
    Logger.log(JSON.stringify({
      framework: 'SCIIP_TEST_FRAMEWORK',
      frameworkVersion: SCIIP_TEST.VERSION,
      warning: 'Missing test functions for processor numbers.',
      missingProcessorNumbers: missing
    }));
  }
  return summary;
};

SCIIP_TEST.runSuite = function(suiteName) {
  var suite = SCIIP_TEST.SUITES[suiteName];
  if (!suite) {
    var result = {
      framework: 'SCIIP_TEST_FRAMEWORK',
      frameworkVersion: SCIIP_TEST.VERSION,
      suiteName: suiteName,
      status: 'FAILED',
      error: 'Unknown suite: ' + suiteName,
      availableSuites: Object.keys(SCIIP_TEST.SUITES)
    };
    Logger.log(JSON.stringify(result));
    return result;
  }
  var summary = SCIIP_TEST.runRange(suite.start, suite.end);
  summary.suiteName = suiteName;
  summary.subsystem = suite.subsystem;
  Logger.log(JSON.stringify(summary));
  return summary;
};

SCIIP_TEST.registryReport = function() {
  var registered = [];
  var min = null;
  var max = null;
  var suiteCounts = {};

  Object.keys(SCIIP_TEST.SUFFIX_CANDIDATES_BY_NUMBER).forEach(function(key) {
    var n = Number(key);
    var resolved = SCIIP_TEST.resolveTestFunctionForNumber(n);
    if (resolved.discovered) {
      registered.push({ processorNumber: n, testFunction: resolved.testFunction });
      min = min === null ? n : Math.min(min, n);
      max = max === null ? n : Math.max(max, n);
    }
  });

  Object.keys(SCIIP_TEST.SUITES).forEach(function(name) {
    var suite = SCIIP_TEST.SUITES[name];
    suiteCounts[name] = SCIIP_TEST.discoverRange(suite.start, suite.end).length;
  });

  var report = {
    registry: 'SCIIP_TEST_DISCOVERY',
    version: SCIIP_TEST.VERSION,
    testsDiscovered: registered.length,
    firstProcessor: min,
    lastProcessor: max,
    suites: suiteCounts,
    tests: registered
  };
  Logger.log(JSON.stringify(report));
  return report;
};

function sciipTestFrameworkRegistryReport() {
  return SCIIP_TEST.registryReport();
}

function sciipTestFrameworkSmokeTest() {
  var report = SCIIP_TEST.registryReport();
  return {
    framework: 'SCIIP_TEST_FRAMEWORK',
    frameworkVersion: SCIIP_TEST.VERSION,
    status: report.testsDiscovered > 0 ? 'PASSED' : 'FAILED',
    testsDiscovered: report.testsDiscovered,
    firstProcessor: report.firstProcessor,
    lastProcessor: report.lastProcessor
  };
}
