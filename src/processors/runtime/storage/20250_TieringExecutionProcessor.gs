function sciipRun20250_TieringExecutionProcessor() {
  return SCIIP_STORAGE_TIERING_BACKEND.executeTieringPlan({
    processorNumber: 20250,
    processorName: 'TieringExecution',
    statusField: 'tieringExecutionStatus',
    component: 'Storage Tiering Execution',
    backendLayer: 'Storage Tiering',
    sourceSheet: 'TIERING_PLANNING',
    targetSheet: 'TIERING_EXECUTION',
    nextAction: 'Run 20260_TieringLedgerProcessor after this processor completes.'
  });
}

function sciipTest20250_TieringExecutionProcessor() {
  var result = sciipRun20250_TieringExecutionProcessor();
  console.log(JSON.stringify({test: 'sciipTest20250_TieringExecutionProcessor', result: result}));
  return result;
}
