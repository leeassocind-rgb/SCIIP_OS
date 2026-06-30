/************************************************************
 * SCIIP_OS v5.1
 * 2200 Processor Execution Planner
 ************************************************************/

function sciipRun2200_ProcessorExecutionPlanner() {
  const processor = '2200_ProcessorExecutionPlanner';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
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

  const planSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_PROCESSOR_EXECUTION_PLAN',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'planScope',
      'planName',
      'planStatus',
      'plannedProcessorCount',
      'plannedEdgeCount',
      'rootProcessorCount',
      'terminalProcessorCount',
      'executionStageCount',
      'executionPlanPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey = 'SCIIP_PROCESSOR_EXECUTION_PLAN|' + dateKey;

  if (sciipSheetBusinessKeyExists_(planSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      processorExecutionPlansCreated: 0,
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
      status: 'SKIPPED_NO_DEPENDENCY_GRAPH',
      processorExecutionPlansCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  let graphPayload = {};

  try {
    graphPayload = JSON.parse(sourceRecord.graphPayloadJson || '{}');
  } catch (err) {
    graphPayload = {};
  }

  const nodes = graphPayload.nodes || [];
  const edges = graphPayload.edges || [];

  if (!nodes.length) {
    const result = {
      processor,
      status: 'SKIPPED_EMPTY_DEPENDENCY_GRAPH',
      processorExecutionPlansCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const incoming = {};
  const outgoing = {};

  nodes.forEach(function(node) {
    incoming[node.registryKey] = [];
    outgoing[node.registryKey] = [];
  });

  edges.forEach(function(edge) {
    if (!incoming[edge.toRegistryKey]) incoming[edge.toRegistryKey] = [];
    if (!outgoing[edge.fromRegistryKey]) outgoing[edge.fromRegistryKey] = [];

    incoming[edge.toRegistryKey].push(edge.fromRegistryKey);
    outgoing[edge.fromRegistryKey].push(edge.toRegistryKey);
  });

  const planned = {};
  const stages = [];
  let remaining = nodes.map(function(node) {
    return node.registryKey;
  });

  while (remaining.length > 0) {
    const ready = remaining.filter(function(registryKey) {
      const dependencies = incoming[registryKey] || [];
      return dependencies.every(function(dep) {
        return planned[dep] === true;
      });
    });

    if (ready.length === 0) {
      break;
    }

    stages.push({
      stageNumber: stages.length + 1,
      processorRegistryKeys: ready
    });

    ready.forEach(function(registryKey) {
      planned[registryKey] = true;
    });

    remaining = remaining.filter(function(registryKey) {
      return planned[registryKey] !== true;
    });
  }

  const unresolved = remaining;

  const rootProcessors = nodes.filter(function(node) {
    return !incoming[node.registryKey] || incoming[node.registryKey].length === 0;
  });

  const terminalProcessors = nodes.filter(function(node) {
    return !outgoing[node.registryKey] || outgoing[node.registryKey].length === 0;
  });

  const planStatus =
    unresolved.length === 0
      ? 'PLANNED'
      : 'PLANNED_WITH_UNRESOLVED_DEPENDENCIES';

  const now = new Date();

  const executionPlanPayload = {
    planType: 'SCIIP_PROCESSOR_EXECUTION_PLAN',
    plannedProcessorCount: nodes.length,
    plannedEdgeCount: edges.length,
    rootProcessorCount: rootProcessors.length,
    terminalProcessorCount: terminalProcessors.length,
    executionStageCount: stages.length,
    stages: stages,
    unresolvedProcessorRegistryKeys: unresolved,
    generatedFromDependencyGraphBusinessKey: sourceRecord.businessKey || '',
    plannedAt: now.toISOString()
  };

  const sourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.graphStatus || '',
    nodeCount: sourceRecord.nodeCount || '',
    edgeCount: sourceRecord.edgeCount || '',
    createdAt: sourceRecord.createdAt || ''
  };

  planSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.graphStatus || '',
    'SCIIP_PROCESSOR_EXECUTION',
    'SCIIP Processor Execution Plan',
    planStatus,
    nodes.length,
    edges.length,
    rootProcessors.length,
    terminalProcessors.length,
    stages.length,
    JSON.stringify(executionPlanPayload),
    JSON.stringify(sourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    processorExecutionPlansCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    planStatus,
    executionStageCount: stages.length,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTest2200_ProcessorExecutionPlanner() {
  const result = sciipRun2200_ProcessorExecutionPlanner();

  Logger.log(JSON.stringify({
    test: 'sciipTest2200_ProcessorExecutionPlanner',
    result
  }));

  return result;
}