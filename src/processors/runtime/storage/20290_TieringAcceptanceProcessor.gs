function sciipRun20290_TieringAcceptanceProcessor() {
  return SCIIP_STORAGE_TIERING_BACKEND.executeTieringPlan({
    processorNumber: 20290,
    processorName: 'TieringAcceptance',
    statusField: 'tieringAcceptanceStatus',
    component: 'Storage Tiering Execution',
    backendLayer: 'Storage Tiering',
    sourceSheet: 'TIERING_CERTIFICATION',
    targetSheet: 'TIERING_ACCEPTANCE',
    nextAction: 'Storage Tiering Execution accepted through 20290.'
  });
}

function sciipTest20290_TieringAcceptanceProcessor() {
  var result = sciipRun20290_TieringAcceptanceProcessor();
  console.log(JSON.stringify({test: 'sciipTest20290_TieringAcceptanceProcessor', result: result}));
  return result;
}
