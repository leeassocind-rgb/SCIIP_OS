const freeze=v=>Object.freeze(v);

export function createExecutiveScenarioCommand({scenarios={},forecasts={},simulation={},comparison={},approvals=[]}={}) {
  const attention=[
    ...(scenarios.scenarios||[]).filter(s=>s.status==='ASSUMPTIONS_MISSING').map(s=>freeze({type:'SCENARIO',id:s.scenarioId})),
    ...(forecasts.forecasts||[]).filter(f=>!f.assumptionsVisible).map(f=>freeze({type:'FORECAST',id:f.seriesId})),
    ...(simulation.assets||[]).filter(a=>a.status==='AT_RISK').map(a=>freeze({type:'ASSET',id:a.assetId})),
    ...(comparison.scenarios||[]).filter(s=>s.status==='LOW_CONFIDENCE').map(s=>freeze({type:'SCENARIO_CONFIDENCE',id:s.scenarioId})),
    ...approvals.filter(a=>a.status==='PENDING').map(a=>freeze({type:'APPROVAL',id:a.approvalId}))
  ];

  return freeze({
    scenarios:freeze({...scenarios}),
    forecasts:freeze({...forecasts}),
    simulation:freeze({...simulation}),
    comparison:freeze({...comparison}),
    approvals:freeze([...approvals]),
    attention:freeze(attention),
    attentionCount:attention.length,
    executiveScenarioCommandReady:true,
    executiveApprovalRequired:true,
    autonomousScenarioSelectionAllowed:false,
    autonomousReallocationAllowed:false
  });
}
