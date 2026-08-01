import assert from 'node:assert/strict';
import { simulateExecutiveScenarios } from '../src/enterprise-intelligence/scenario-simulation/index.js';

let tests=0;
const t=(condition,message)=>{tests++;assert.ok(condition,message||`Assertion ${tests} failed`)};

const result=simulateExecutiveScenarios({
  scenarios:[
    {
      scenarioId:'S1',
      name:'Lease First',
      type:'LEASING',
      revenueScore:90,
      strategicFitScore:85,
      timingScore:95,
      confidenceScore:90,
      capitalEfficiencyScore:92,
      riskScore:20,
      evidence:[{source:'MARKET'},{source:'KNOWLEDGE_GRAPH'}],
      assumptions:['Demand remains strong']
    },
    {
      scenarioId:'S2',
      name:'Develop First',
      type:'DEVELOPMENT',
      revenueScore:95,
      strategicFitScore:90,
      timingScore:60,
      confidenceScore:75,
      capitalEfficiencyScore:55,
      riskScore:45,
      evidence:[{source:'DIGITAL_TWIN'},{source:'GIS'}]
    }
  ]
});

t(result.total===2);
t(result.simulated===2);
t(result.winner.scenarioId==='S1');
t(result.winner.simulationScore>result.scenarios[1].simulationScore);
t(result.ranked);
t(result.evidenceBacked);
t(result.approvalRequired);
t(!result.executionAuthorized);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE11_SPRINT118_EXECUTIVE_SCENARIO_SIMULATION_ENGINE',
  status:'PASSED',
  testsRun:tests,
  result:{
    winner:result.winner,
    total:result.total,
    executionAuthorized:result.executionAuthorized
  }
},null,2));
