/**
 * SCIIP_OS v6.0 — 16060 CapacityForecastLedger
 */
function sciipRun16060_CapacityForecastLedgerProcessor() {
  return SCIIP_STORAGE_CAPACITY_FORECASTING_BACKEND.executeCapacityForecastingPlan({
    processorNumber: 16060,
    processorName: 'CapacityForecastLedger',
    statusField: 'capacityForecastLedgerStatus',
    component: 'Storage Capacity Forecasting Execution',
    backendLayer: 'Storage Capacity Forecasting',
    sourceSheet: 'CAPACITY_FORECAST_EXECUTION',
    targetSheet: 'CAPACITY_FORECAST_LEDGER',
    nextAction: 'Run 16070_CapacityForecastValidationProcessor after this processor completes.'
  });
}

function sciipTest16060_CapacityForecastLedgerProcessor() {
  var result = sciipRun16060_CapacityForecastLedgerProcessor();
  console.log(JSON.stringify({
    test: 'sciipTest16060_CapacityForecastLedgerProcessor',
    result: result
  }));
  return result;
}
