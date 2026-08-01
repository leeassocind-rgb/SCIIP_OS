import assert from'node:assert/strict';
import{createEnterpriseDigitalTwinV2}from'../src/enterprise-os/digital-twin/index.js';

let tests=0;const t=(c,m)=>{tests++;assert.ok(c,m||`Assertion ${tests} failed`)};
const twin=createEnterpriseDigitalTwinV2({initialState:{
 portfolio:[{id:'P1'}],
 workflows:[{id:'W1',status:'IN_PROGRESS'}],
 risks:[{id:'R1',status:'OPEN'}],
 opportunities:[{id:'O1',status:'ACTIVE'}]
}});
const sync=twin.synchronize({capital:{available:100}});
const simulation=twin.simulate({scenarioId:'S1',changes:{valueDelta:15,riskDelta:-5}});
const forecast=twin.forecast({horizonDays:180});

t(sync.status==='SYNCHRONIZED');
t(sync.revision===1);
t(simulation.status==='SIMULATED');
t(simulation.valueDelta===15);
t(!simulation.productionMutation);
t(forecast.portfolioAssets===1);
t(forecast.activeWorkflows===1);
t(forecast.openRisks===1);
t(forecast.activeOpportunities===1);
t(twin.snapshot().scenarioReady);
t(twin.snapshot().forecastReady);
t(!twin.snapshot().productionExecutionAuthorized);

console.log(JSON.stringify({
 framework:'SCIIP_PHASE12_SPRINT121_ENTERPRISE_DIGITAL_TWIN_V2',
 status:'PASSED',testsRun:tests,result:twin.snapshot()
},null,2));
