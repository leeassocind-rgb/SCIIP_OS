/************************************************************
 * SCIIP_OS v5.1
 * 2190 Processor Dependency Graph
 ************************************************************/

function sciipRun2190_ProcessorDependencyGraph() {
  const processor = '2190_ProcessorDependencyGraph';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_PROCESSOR_REGISTRY_VALIDATION',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'validationScope',
      'validationName',
      'validationStatus',
      'validationResult',
      'registeredProcessorCount',
      'validatedProcessorCount',
      'trackCount',
      'validationFinding',
      'validationRecommendation',
      'validationPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const graphSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_PROCESSOR_DEPENDENCY_GRAPH',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'graphScope',
      'graphName',
      'graphStatus',
      'nodeCount',
      'edgeCount',
      'rootProcessorCount',
      'terminalProcessorCount',
      'graphPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey = 'SCIIP_PROCESSOR_DEPENDENCY_GRAPH|' + dateKey;

  if (sciipSheetBusinessKeyExists_(graphSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      processorDependencyGraphsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_REGISTRY_VALIDATION',
      processorDependencyGraphsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const registry = sciipListRegisteredProcessors_();

  if (!registry || registry.length === 0) {
    const result = {
      processor,
      status: 'SKIPPED_NO_REGISTERED_PROCESSORS',
      processorDependencyGraphsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const nodes = registry.map(function(item) {
    return {
      processorNumber: item.processorNumber,
      registryKey: item.registryKey,
      processorFunction: item.processorFunction,
      testFunction: item.testFunction,
      inputSheet: item.inputSheet,
      outputSheet: item.outputSheet,
      status: item.status,
      track: item.track,
      version: item.version
    };
  });

  const edges = [];

  nodes.forEach(function(upstream) {
    nodes.forEach(function(downstream) {
      if (
        upstream.outputSheet &&
        downstream.inputSheet &&
        upstream.outputSheet === downstream.inputSheet
      ) {
        edges.push({
          fromProcessorNumber: upstream.processorNumber,
          fromRegistryKey: upstream.registryKey,
          toProcessorNumber: downstream.processorNumber,
          toRegistryKey: downstream.registryKey,
          relationshipType: 'OUTPUT_FEEDS_INPUT',
          sharedSheet: upstream.outputSheet
        });
      }
    });
  });

  const downstreamSet = {};
  const upstreamSet = {};

  edges.forEach(function(edge) {
    downstreamSet[edge.fromRegistryKey] = true;
    upstreamSet[edge.toRegistryKey] = true;
  });

  const rootProcessors = nodes.filter(function(node) {
    return !upstreamSet[node.registryKey];
  });

  const terminalProcessors = nodes.filter(function(node) {
    return !downstreamSet[node.registryKey];
  });

  const now = new Date();

  const graphPayload = {
    graphType: 'SCIIP_PROCESSOR_DEPENDENCY_GRAPH',
    nodeCount: nodes.length,
    edgeCount: edges.length,
    rootProcessorCount: rootProcessors.length,
    terminalProcessorCount: terminalProcessors.length,
    nodes,
    edges,
    rootProcessors,
    terminalProcessors,
    generatedAt: now.toISOString()
  };

  const sourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.validationStatus || '',
    validationResult: sourceRecord.validationResult || '',
    createdAt: sourceRecord.createdAt || ''
  };

  graphSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.validationStatus || '',
    'SCIIP_PROCESSOR_REGISTRY',
    'SCIIP Processor Dependency Graph',
    'GRAPHED',
    nodes.length,
    edges.length,
    rootProcessors.length,
    terminalProcessors.length,
    JSON.stringify(graphPayload),
    JSON.stringify(sourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    processorDependencyGraphsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    nodeCount: nodes.length,
    edgeCount: edges.length,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTest2190_ProcessorDependencyGraph() {
  const result = sciipRun2190_ProcessorDependencyGraph();

  Logger.log(JSON.stringify({
    test: 'sciipTest2190_ProcessorDependencyGraph',
    result
  }));

  return result;
}