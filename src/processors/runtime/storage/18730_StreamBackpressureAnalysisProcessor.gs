/**
 * SCIIP_OS v6.0 — 18730 StreamBackpressureAnalysis
 */
function sciipRun18730_StreamBackpressureAnalysisProcessor() {
  return SCIIP_STORAGE_EVENT_STREAMING_BACKEND.executeEventStreamingPlan({
    processorNumber: 18730,
    processorName: 'StreamBackpressureAnalysis',
    statusField: 'streamBackpressureAnalysisStatus',
    component: 'Storage Event Streaming Execution',
    backendLayer: 'Storage Event Streaming',
    sourceSheet: 'STREAM_COVERAGE_ASSESSMENT',
    targetSheet: 'STREAM_BACKPRESSURE_ANALYSIS',
    nextAction: 'Run 18740_EventStreamingPlanningProcessor after this processor completes.'
  });
}

function sciipTest18730_StreamBackpressureAnalysisProcessor() {
  var result = sciipRun18730_StreamBackpressureAnalysisProcessor();
  console.log(JSON.stringify({
    test: 'sciipTest18730_StreamBackpressureAnalysisProcessor',
    result: result
  }));
  return result;
}
