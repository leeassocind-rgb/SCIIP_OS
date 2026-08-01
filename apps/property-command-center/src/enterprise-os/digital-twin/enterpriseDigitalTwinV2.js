const freeze=value=>Object.freeze(value);
const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));

export function createEnterpriseDigitalTwinV2({
  enterpriseId='SCIIP-ENTERPRISE',
  initialState={}
}={}) {
  let revision=0;
  let state=freeze({
    enterpriseId,
    portfolio:freeze(clone(initialState.portfolio||[])),
    markets:freeze(clone(initialState.markets||[])),
    workflows:freeze(clone(initialState.workflows||[])),
    decisions:freeze(clone(initialState.decisions||[])),
    capital:freeze(clone(initialState.capital||{})),
    risks:freeze(clone(initialState.risks||[])),
    opportunities:freeze(clone(initialState.opportunities||[])),
    synchronizedAt:new Date().toISOString()
  });
  const history=[freeze({revision,state})];

  const synchronize=patch=>{
    revision+=1;
    state=freeze({
      ...clone(state),
      ...clone(patch),
      enterpriseId,
      synchronizedAt:new Date().toISOString()
    });
    history.push(freeze({revision,state}));
    return freeze({status:'SYNCHRONIZED',revision,state});
  };

  const simulate=({scenarioId,changes={}}={})=>{
    if(!scenarioId)throw new Error('scenarioId is required');
    const projected=freeze({...clone(state),...clone(changes)});
    const riskDelta=Number(changes.riskDelta||0);
    const valueDelta=Number(changes.valueDelta||0);
    return freeze({
      simulationId:`TWIN-SIM-${history.length}`,
      scenarioId,
      baseRevision:revision,
      projected,
      riskDelta,
      valueDelta,
      status:'SIMULATED',
      productionMutation:false
    });
  };

  const forecast=({horizonDays=90}={})=>freeze({
    enterpriseId,
    horizonDays,
    portfolioAssets:state.portfolio.length,
    activeWorkflows:state.workflows.filter(item=>item.status!=='COMPLETED').length,
    openRisks:state.risks.filter(item=>item.status!=='CLOSED').length,
    activeOpportunities:state.opportunities.filter(item=>item.status!=='CLOSED').length,
    synchronized:true,
    productionExecutionAuthorized:false
  });

  return freeze({
    synchronize,
    simulate,
    forecast,
    getSnapshot:()=>freeze(clone(state)),
    history:()=>freeze([...history]),
    snapshot:()=>freeze({
      status:'SYNCHRONIZED',
      enterpriseId,
      revision,
      historyEntries:history.length,
      scenarioReady:true,
      forecastReady:true,
      productionExecutionAuthorized:false
    })
  });
}
