import assert from 'node:assert/strict';
import { certifyEnterpriseIntelligence } from '../src/enterprise-intelligence/certification/index.js';

let tests=0;
const t=(condition,message)=>{tests++;assert.ok(condition,message||`Assertion ${tests} failed`)};

const result=certifyEnterpriseIntelligence({
  search:{graphNative:true,evidenceBacked:true,productionExecutionAuthorized:false},
  reasoning:{explainable:true,productionExecutionAuthorized:false},
  recommendations:{
    evidenceRequired:true,approvalRequired:true,autonomousExecutionAllowed:false
  },
  copilot:{grounded:true,unsupportedClaimsAllowed:false,executionAuthority:false},
  opportunities:{autonomousDetection:true,autonomousExecutionAllowed:false}
});

t(result.status==='CERTIFIED');
t(result.checksRun===6);
t(result.checksPassed===6);
t(result.checksFailed===0);
t(result.graphNative);
t(result.evidenceBacked);
t(result.autonomousDetection);
t(!result.autonomousExecutionAllowed);
t(!result.productionExecutionAuthorized);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE6_SPRINT81_ENTERPRISE_INTELLIGENCE_CERTIFICATION',
  status:'PASSED',testsRun:tests,result
},null,2));
