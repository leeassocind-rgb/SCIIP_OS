/**
 * SCIIP_OS v5.5 — 8090_EnterpriseKnowledgeRefinementProcessor
 * Enterprise Knowledge Refinement completed for Enterprise Learning Execution.
 */
function sciipRun8090_EnterpriseKnowledgeRefinementProcessor() {
  var cfg = {
    processorNumber: 8090,
    processorName: 'EnterpriseKnowledgeRefinement',
    layer: 'Enterprise Knowledge Refinement',
    sourceSheet: 'ENTERPRISE_PATTERN_RECOGNITION',
    targetSheet: 'ENTERPRISE_KNOWLEDGE_REFINEMENT',
    statusField: 'enterpriseKnowledgeRefinementStatus',
    requiresSource: false,
    successMessage: 'Enterprise Knowledge Refinement completed for Enterprise Learning Execution.',
    nextAction: 'Run 8100_EnterpriseModelAdaptationProcessor after this processor completes.'
  };
  return SCIIP_ENTERPRISE_LEARNING_EXECUTION.runWithRuntimeBase(cfg);
}

function sciipTest8090_EnterpriseKnowledgeRefinementProcessor() {
  var result = sciipRun8090_EnterpriseKnowledgeRefinementProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest8090_EnterpriseKnowledgeRefinementProcessor', result: result }));
  return result;
}
