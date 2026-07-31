import assert from'node:assert/strict';
import{
  createExecutiveGovernanceCertificationEngine,
  createExecutiveGovernancePolicy,
  evaluateExecutiveGovernanceRule,
  createExecutiveGovernanceEvidence,
  createExecutiveGovernanceException,
  createExecutiveCertificationLedger
}from'../src/executive-actions/governance/index.js';

let tests=0;
const t=(condition,message)=>{tests++;assert.ok(condition,message||`Assertion ${tests} failed`)};

const policies=[
  {
    id:'POL-GOV',
    name:'Executive Governance Baseline',
    version:'1.0.0',
    rules:[
      {id:'R1',severity:'CRITICAL',evidenceTypes:['READINESS_CERTIFICATION']},
      {id:'R2',severity:'HIGH',evidenceTypes:['HUMAN_APPROVAL']},
      {id:'R3',severity:'HIGH',evidenceTypes:['CONTROL_RESULTS']},
      {id:'R4',severity:'MEDIUM',evidenceTypes:['SOURCE_LINEAGE']}
    ]
  },
  {
    id:'POL-AUDIT',
    name:'Enterprise Auditability',
    version:'1.0.0',
    rules:[
      {id:'R5',severity:'HIGH',evidenceTypes:['CHECKSUM']},
      {id:'R6',severity:'HIGH',evidenceTypes:['IDENTIFIED_ACTOR']},
      {id:'R7',severity:'MEDIUM',evidenceTypes:['TIMESTAMP']},
      {id:'R8',severity:'MEDIUM',evidenceTypes:['DECISION_TRACE']}
    ]
  },
  {
    id:'POL-EXEC',
    name:'Execution Governance',
    version:'1.0.0',
    rules:[
      {id:'R9',severity:'CRITICAL',evidenceTypes:['NO_AUTONOMOUS_EXECUTION']},
      {id:'R10',severity:'CRITICAL',evidenceTypes:['NO_WORKFLOW_MUTATION']},
      {id:'R11',severity:'HIGH',evidenceTypes:['EXPLICIT_SIGNOFF']},
      {id:'R12',severity:'MEDIUM',evidenceTypes:['RETENTION_POLICY']}
    ]
  }
];

const evidenceTypes=[
  'READINESS_CERTIFICATION','HUMAN_APPROVAL','CONTROL_RESULTS','SOURCE_LINEAGE',
  'CHECKSUM','IDENTIFIED_ACTOR','TIMESTAMP','DECISION_TRACE',
  'NO_AUTONOMOUS_EXECUTION','NO_WORKFLOW_MUTATION','EXPLICIT_SIGNOFF','RETENTION_POLICY'
];
const evidence=evidenceTypes.map((type,index)=>({
  id:`E${index+1}`,
  type,
  status:'VERIFIED',
  source:'SPRINT18',
  checksum:`sha-${index+1}`,
  verifiedBy:'AUDITOR-1',
  verifiedAt:'2026-07-31T19:00:00.000Z',
  sourceSignalIds:['SIG-18']
}));

const engine=createExecutiveGovernanceCertificationEngine({policies,maxEntries:3});
t(engine.getPolicies().length===3);
t(engine.getStatus().status==='OPERATIONAL');
t(engine.getStatus().appendOnly);
t(engine.getStatus().readOnly);
t(engine.getStatus().advisoryOnly);
t(engine.getStatus().humanReviewRequired);
t(!engine.getStatus().workflowMutationAllowed);
t(!engine.getStatus().autonomousExecutionAllowed);

const result=engine.certify({
  id:'CERT-19-1',
  subjectId:'INITIATIVE-1',
  policyIds:['POL-GOV','POL-AUDIT','POL-EXEC'],
  evidence,
  humanApproval:{approved:true,actorId:'EXEC-1'},
  sourceSignalIds:['SIG-19']
});
const c=result.certification;
t(!result.duplicate);
t(c.id==='CERT-19-1');
t(c.subjectId==='INITIATIVE-1');
t(c.policyEvaluations.length===3);
t(c.policyEvaluations.every(item=>item.passed));
t(c.policyEvaluations.reduce((sum,item)=>sum+item.rulesEvaluated,0)===12);
t(c.policyEvaluations.reduce((sum,item)=>sum+item.rulesPassed,0)===12);
t(c.evidenceChain.evidence.length===12);
t(c.evidenceChain.verifiedEvidenceIds.length===12);
t(c.evidenceChain.complete);
t(c.exceptionResult.exceptions.length===0);
t(c.exceptionResult.waivers.length===0);
t(c.exceptionResult.unresolvedRuleIds.length===0);
t(c.scorecard.policiesEvaluated===3);
t(c.scorecard.rulesEvaluated===12);
t(c.scorecard.rulesPassed===12);
t(c.scorecard.rulesFailed===0);
t(c.scorecard.complianceScore===100);
t(c.scorecard.exceptions===0);
t(c.scorecard.waivers===0);
t(c.scorecard.unresolvedRules.length===0);
t(c.scorecard.evidenceComplete);
t(c.scorecard.certificationStatus==='CERTIFIED');
t(c.certificationStatus==='CERTIFIED');
t(c.scorecard.humanApprovalRequired);
t(c.scorecard.humanApprovedBy==='EXEC-1');
t(c.scorecard.sourceSignalIds.includes('SIG-18'));
t(c.scorecard.sourceSignalIds.includes('SIG-19'));
t(c.scorecard.appendOnly);
t(c.scorecard.readOnly);
t(c.scorecard.advisoryOnly);
t(!c.scorecard.workflowMutationAllowed);
t(!c.scorecard.autonomousExecutionAllowed);
t(c.scorecard.decisionTraceability);
t(Object.isFrozen(c));
t(Object.isFrozen(c.scorecard));
t(Object.isFrozen(c.evidenceChain));

const duplicate=engine.certify({
  id:'CERT-19-1',
  subjectId:'INITIATIVE-1',
  policyIds:['POL-GOV'],
  evidence,
  humanApproval:{approved:true,actorId:'EXEC-1'}
});
t(duplicate.duplicate);
t(duplicate.certification===c);
t(engine.getLedger().length===1);
t(engine.getLedger()[0].sequence===1);

const blocked=engine.certify({
  id:'CERT-19-2',
  subjectId:'INITIATIVE-2',
  policyIds:['POL-GOV'],
  evidence:evidence.filter(item=>item.type!=='CONTROL_RESULTS'),
  humanApproval:{approved:false},
  sourceSignalIds:['SIG-BLOCK']
}).certification;
t(blocked.certificationStatus==='CERTIFICATION_BLOCKED');
t(blocked.scorecard.rulesFailed===1);
t(blocked.scorecard.unresolvedRules.includes('R3'));
t(blocked.scorecard.evidenceComplete);
t(blocked.scorecard.humanApprovedBy===null);
t(engine.getLedger().length===2);
t(engine.getLedger()[1].sequence===2);

const waiver=engine.certify({
  id:'CERT-19-3',
  subjectId:'INITIATIVE-3',
  policyIds:['POL-GOV'],
  evidence:evidence.filter(item=>item.type!=='CONTROL_RESULTS'),
  exceptions:[{
    id:'W1',
    ruleId:'R3',
    type:'WAIVER',
    reason:'Time-bound executive waiver',
    approvedBy:'RISK-OFFICER-1',
    approvedAt:'2026-07-31T19:15:00.000Z'
  }],
  humanApproval:{approved:true,actorId:'EXEC-2'}
}).certification;
t(waiver.exceptionResult.waivers.length===1);
t(waiver.exceptionResult.coveredRuleIds.includes('R3'));
t(waiver.exceptionResult.unresolvedRuleIds.length===0);
t(waiver.scorecard.waivers===1);
t(waiver.scorecard.unresolvedRules.length===0);
t(waiver.certificationStatus==='CERTIFIED');
t(engine.getLedger().length===3);

const policy=createExecutiveGovernancePolicy({id:'P-X',rules:[{id:'RX'}]});
t(policy.id==='P-X');
t(policy.rules.length===1);
const evalResult=evaluateExecutiveGovernanceRule({rule:policy.rules[0],evidence:[]});
t(evalResult.passed);
const ev=createExecutiveGovernanceEvidence({id:'E-X',type:'CHECKSUM'});
t(ev.status==='VERIFIED');
const ex=createExecutiveGovernanceException({id:'EX-X',ruleId:'RX',type:'EXCEPTION',reason:'Approved exception',approvedBy:'EXEC-3'});
t(ex.type==='EXCEPTION');

const ledger=createExecutiveCertificationLedger({maxEntries:1});
t(!ledger.append({id:'L1'}).duplicate);
t(ledger.append({id:'L1'}).duplicate);
t(!ledger.append({id:'L2'}).duplicate);
t(ledger.list().length===1);
t(ledger.list()[0].id==='L2');
t(ledger.getStatus().appendOnly);

engine.stop();
t(engine.getStatus().status==='STOPPED');
let stoppedError=false;
try{
  engine.certify({id:'CERT-X',subjectId:'X',policyIds:['POL-GOV'],evidence,humanApproval:{approved:true,actorId:'X'}})
}catch{
  stoppedError=true;
}
t(stoppedError);
engine.start();
t(engine.getStatus().status==='OPERATIONAL');

console.log(JSON.stringify({
  framework:'SCIIP_PHASE2_SPRINT19_EXECUTIVE_GOVERNANCE_CERTIFICATION_INTELLIGENCE',
  status:'PASSED',
  testsRun:tests,
  result:{
    policiesEvaluated:c.scorecard.policiesEvaluated,
    rulesPassed:c.scorecard.rulesPassed,
    certificationLedgerEntries:engine.getLedger().length,
    exceptions:c.scorecard.exceptions,
    waivers:c.scorecard.waivers,
    certificationStatus:c.scorecard.certificationStatus,
    blockedCertificationStatus:blocked.scorecard.certificationStatus,
    readOnly:true,
    advisoryOnly:true,
    humanReviewRequired:true,
    workflowMutationAllowed:false,
    autonomousExecutionAllowed:false,
    decisionTraceability:true
  }
},null,2));
