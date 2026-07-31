import assert from 'node:assert/strict';
import { generateEvidenceBackedRecommendations } from '../src/enterprise-intelligence/recommendations/index.js';

let tests=0;
const t=(condition,message)=>{tests++;assert.ok(condition,message||`Assertion ${tests} failed`)};

const result=generateEvidenceBackedRecommendations({signals:[
  {subjectId:'P1',type:'OPPORTUNITY',summary:'Vacancy decline',evidence:[{source:'market'},{source:'comp'}]},
  {subjectId:'P2',type:'RISK',summary:'Power constraint',evidence:[]}
]});

t(result.total===2);
t(result.recommended===1);
t(result.insufficientConfidence===1);
t(result.recommendations[0].action==='REVIEW_OPPORTUNITY');
t(result.recommendations[0].evidence.length===2);
t(result.approvalRequired);
t(!result.autonomousExecutionAllowed);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE6_SPRINT78_EVIDENCE_BACKED_RECOMMENDATION_ENGINE',
  status:'PASSED',testsRun:tests,result
},null,2));
