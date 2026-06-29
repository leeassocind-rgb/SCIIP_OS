/************************************************************
 * SCIIP_OS v5.1
 * Processor Registry
 ************************************************************/

function sciipGetProcessorRegistry_() {
  return {
    ARCHITECTURE_REVIEW_FRAMEWORK_REFACTOR_RECOMMENDATION: {
      processorNumber: 2090,
      processorName:
        'AutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkRefactorRecommendationProcessor',
      processorFunction:
        'sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkRefactorRecommendationProcessor',
      testFunction:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkRefactorRecommendationProcessor',
      inputSheet:
        'ARCH_REVIEW_FRAMEWORK_PATTERN_REVIEW_LEDGER',
      outputSheet:
        'ARCH_REVIEW_FRAMEWORK_REFACTOR_RECOMMENDATION',
      businessKeyPrefix:
        'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_FRAMEWORK_REFACTOR_RECOMMENDATION',
      status: 'VALIDATED',
      track: 'ARCHITECTURE_REVIEW',
      version: 'SCIIP_OS v5.1'
    }
  };
}

function sciipGetRegisteredProcessor_(registryKey) {
  const registry = sciipGetProcessorRegistry_();
  return registry[registryKey] || null;
}

function sciipListRegisteredProcessors_() {
  const registry = sciipGetProcessorRegistry_();
  return Object.keys(registry).map(function(key) {
    const item = registry[key];
    return {
      registryKey: key,
      processorNumber: item.processorNumber,
      processorFunction: item.processorFunction,
      testFunction: item.testFunction,
      inputSheet: item.inputSheet,
      outputSheet: item.outputSheet,
      status: item.status,
      track: item.track,
      version: item.version
    };
  });
}
function sciipTest2100_ProcessorRegistry() {
  const processors = sciipListRegisteredProcessors_();

  Logger.log(JSON.stringify({
    test: 'sciipTest2100_ProcessorRegistry',
    registeredProcessors: processors.length,
    processors: processors
  }));

  return {
    status: processors.length > 0 ? 'SUCCESS' : 'FAILED_EMPTY_REGISTRY',
    registeredProcessors: processors.length
  };
}