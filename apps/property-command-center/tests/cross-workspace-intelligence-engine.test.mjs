import assert from 'node:assert/strict';
import { correlateCrossWorkspaceIntelligence } from '../src/enterprise-intelligence/cross-workspace/index.js';

let tests=0;
const t=(condition,message)=>{tests++;assert.ok(condition,message||`Assertion ${tests} failed`)};

const result=correlateCrossWorkspaceIntelligence({
  marketEvents:[{subjectId:'P1',score:1,type:'VACANCY_DECLINE'}],
  graphSignals:[{subjectId:'P1',score:1,type:'TENANT_MATCH'}],
  gisSignals:[{subjectId:'P1',score:1,type:'INFRASTRUCTURE_FIT'}],
  digitalTwinSignals:[{subjectId:'P2',score:-1,type:'POWER_RISK'}],
  workflowSignals:[{subjectId:'P2',score:-1,type:'APPROVAL_DELAY'}]
});

t(result.total===2);
t(result.recommended===2);
t(result.recommendations[0].subjectId==='P1');
t(result.recommendations[0].type==='OPPORTUNITY');
t(result.recommendations.find(item=>item.subjectId==='P2').type==='RISK');
t(result.recommendations[0].sourceCount===3);
t(result.unifiedEvidenceLayer);
t(result.crossWorkspace);
t(result.approvalRequired);
t(!result.executionAuthorized);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE11_SPRINT117_CROSS_WORKSPACE_INTELLIGENCE_ENGINE',
  status:'PASSED',
  testsRun:tests,
  result:{
    total:result.total,
    recommended:result.recommended,
    top:result.recommendations[0],
    executionAuthorized:result.executionAuthorized
  }
},null,2));
