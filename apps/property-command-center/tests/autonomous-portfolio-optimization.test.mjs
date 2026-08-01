import assert from 'node:assert/strict';
import { optimizeEnterprisePortfolio } from '../src/enterprise-intelligence/portfolio-optimization/index.js';

let tests=0;
const t=(condition,message)=>{tests++;assert.ok(condition,message||`Assertion ${tests} failed`)};

const result=optimizeEnterprisePortfolio({
  capitalAvailable:100,
  maximumSelections:2,
  assets:[
    {id:'P1',fitScore:95,marketScore:90,returnScore:92,strategicScore:88,riskScore:20,requiredCapital:60},
    {id:'P2',fitScore:80,marketScore:85,returnScore:90,strategicScore:75,riskScore:30,requiredCapital:40},
    {id:'P3',fitScore:70,marketScore:60,returnScore:65,strategicScore:55,riskScore:70,requiredCapital:50}
  ]
});

t(result.ranked[0].id==='P1');
t(result.selectedCount===2);
t(result.capitalAllocated===100);
t(result.capitalRemaining===0);
t(result.selected[0].recommendation==='SELECT_FOR_REVIEW');
t(result.multiObjective);
t(result.autonomousRecommendation);
t(result.approvalRequired);
t(!result.executionAuthorized);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE11_SPRINT115_AUTONOMOUS_PORTFOLIO_OPTIMIZATION',
  status:'PASSED',
  testsRun:tests,
  result:{
    selected:result.selected.map(item=>item.id),
    capitalAllocated:result.capitalAllocated,
    capitalRemaining:result.capitalRemaining,
    multiObjective:result.multiObjective,
    executionAuthorized:result.executionAuthorized
  }
},null,2));
