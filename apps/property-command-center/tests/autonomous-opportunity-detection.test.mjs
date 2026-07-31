import assert from 'node:assert/strict';
import { detectAutonomousOpportunities } from '../src/enterprise-intelligence/opportunities/index.js';

let tests=0;
const t=(condition,message)=>{tests++;assert.ok(condition,message||`Assertion ${tests} failed`)};

const result=detectAutonomousOpportunities({
  properties:[
    {id:'P1',fitScore:95,marketScore:90},
    {id:'P2',fitScore:40,marketScore:45}
  ],
  marketSignals:[
    {propertyId:'P1',type:'VACANCY_DECLINE'},
    {propertyId:'P1',type:'NEW_REQUIREMENT'}
  ]
});

t(result.detected===1);
t(result.opportunities[0].propertyId==='P1');
t(result.opportunities[0].score>=70);
t(result.autonomousDetection);
t(!result.autonomousExecutionAllowed);
t(result.approvalRequired);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE6_SPRINT80_AUTONOMOUS_OPPORTUNITY_DETECTION',
  status:'PASSED',testsRun:tests,result
},null,2));
