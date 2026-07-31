import assert from'node:assert/strict';
import{
  createExecutiveCertificationMonitoringEngine,
  createExecutiveCertificationBaseline,
  createExecutiveCertificationSnapshot,
  detectExecutiveCertificationDrift,
  classifyExecutiveCertificationDrift,
  createExecutiveCertificationMonitoringLedger
}from'../src/executive-actions/certification-monitoring/index.js';

let tests=0;
const t=(condition,message)=>{tests++;assert.ok(condition,message||`Assertion ${tests} failed`)};

const baselineInput={
  id:'BASE-20-1',
  subjectId:'INITIATIVE-1',
  certificationId:'CERT-19-1',
  certificationStatus:'CERTIFIED',
  certifiedAt:'2026-07-31T20:00:00.000Z',
  policyVersions:{'POL-GOV':'1.0.0','POL-AUDIT':'1.0.0'},
  evidenceChecksums:{E1:'sha-1',E2:'sha-2'},
  controlStatuses:{C1:'PASSED',C2:'PASSED'},
  readinessScore:100,
  exceptions:[],
  waivers:[],
  sourceSignalIds:['SIG-19']
};

const engine=createExecutiveCertificationMonitoringEngine({maxEntries:3});
const registration=engine.registerBaseline(baselineInput);
t(!registration.duplicate);
t(registration.baseline.id==='BASE-20-1');
t(registration.baseline.certificationStatus==='CERTIFIED');
t(Object.isFrozen(registration.baseline));
t(engine.getBaselines().length===1);
t(engine.registerBaseline(baselineInput).duplicate);
t(engine.getStatus().status==='OPERATIONAL');
t(engine.getStatus().appendOnly);
t(engine.getStatus().readOnly);
t(engine.getStatus().advisoryOnly);
t(engine.getStatus().humanReviewRequired);
t(!engine.getStatus().certificationRevocationAllowed);
t(!engine.getStatus().workflowMutationAllowed);
t(!engine.getStatus().autonomousExecutionAllowed);

const stable=engine.monitor({
  id:'MON-20-1',
  baselineId:'BASE-20-1',
  snapshot:{
    id:'SNAP-1',
    subjectId:'INITIATIVE-1',
    policyVersions:{'POL-GOV':'1.0.0','POL-AUDIT':'1.0.0'},
    evidenceChecksums:{E1:'sha-1',E2:'sha-2'},
    controlStatuses:{C1:'PASSED',C2:'PASSED'},
    readinessScore:98,
    exceptions:[],
    waivers:[],
    sourceSignalIds:['SIG-20']
  }
}).assessment;
t(stable.detection.driftCount===0);
t(!stable.detection.hasDrift);
t(stable.detection.maxSeverity==='NONE');
t(stable.classification.status==='STABLE');
t(!stable.classification.recertificationRecommended);
t(!stable.classification.humanReviewRequired);
t(stable.alert.driftCount===0);
t(stable.alert.status==='STABLE');
t(stable.scorecard.monitoringScore===100);
t(stable.scorecard.monitoringStatus==='STABLE');
t(!stable.scorecard.recertificationRecommended);
t(!stable.scorecard.humanReviewRequired);
t(stable.scorecard.readOnly);
t(stable.scorecard.advisoryOnly);
t(!stable.scorecard.certificationRevocationAllowed);
t(!stable.scorecard.workflowMutationAllowed);
t(!stable.scorecard.autonomousExecutionAllowed);
t(stable.scorecard.decisionTraceability);
t(Object.isFrozen(stable));
t(Object.isFrozen(stable.scorecard));

const drifted=engine.monitor({
  id:'MON-20-2',
  baselineId:'BASE-20-1',
  readinessTolerance:5,
  snapshot:{
    id:'SNAP-2',
    subjectId:'INITIATIVE-1',
    policyVersions:{'POL-GOV':'2.0.0','POL-AUDIT':'1.0.0'},
    evidenceChecksums:{E1:'sha-changed',E2:'sha-2'},
    controlStatuses:{C1:'FAILED',C2:'PASSED'},
    readinessScore:82,
    exceptions:[{id:'EX-NEW'}],
    waivers:[{id:'W-NEW'}],
    sourceSignalIds:['SIG-20-DRIFT']
  }
}).assessment;
t(drifted.detection.hasDrift);
t(drifted.detection.driftCount===6);
t(drifted.detection.maxSeverity==='CRITICAL');
t(drifted.detection.readinessDelta===-18);
t(drifted.detection.drifts.some(item=>item.type==='POLICY_VERSION_DRIFT'));
t(drifted.detection.drifts.some(item=>item.type==='EVIDENCE_DRIFT'));
t(drifted.detection.drifts.some(item=>item.type==='CONTROL_STATUS_DRIFT'));
t(drifted.detection.drifts.some(item=>item.type==='READINESS_SCORE_DRIFT'));
t(drifted.detection.drifts.some(item=>item.type==='NEW_EXCEPTION'));
t(drifted.detection.drifts.some(item=>item.type==='NEW_WAIVER'));
t(drifted.classification.status==='CERTIFICATION_AT_RISK');
t(drifted.classification.counts.CRITICAL===1);
t(drifted.classification.counts.HIGH===4);
t(drifted.classification.counts.MEDIUM===1);
t(drifted.classification.recertificationRecommended);
t(drifted.classification.humanReviewRequired);
t(!drifted.classification.certificationRevocationAllowed);
t(drifted.alert.status==='CERTIFICATION_AT_RISK');
t(drifted.alert.severity==='CRITICAL');
t(drifted.alert.recertificationRecommended);
t(drifted.alert.humanReviewRequired);
t(!drifted.alert.certificationRevocationAllowed);
t(!drifted.alert.workflowMutationAllowed);
t(!drifted.alert.autonomousExecutionAllowed);
t(drifted.alert.sourceSignalIds.includes('SIG-19'));
t(drifted.alert.sourceSignalIds.includes('SIG-20-DRIFT'));
t(drifted.scorecard.monitoringScore===3);
t(drifted.scorecard.readinessDelta===-18);
t(drifted.scorecard.monitoringStatus==='CERTIFICATION_AT_RISK');
t(drifted.scorecard.recertificationRecommended);
t(drifted.scorecard.humanReviewRequired);
t(!drifted.scorecard.certificationRevocationAllowed);

const duplicate=engine.monitor({
  id:'MON-20-2',
  baselineId:'BASE-20-1',
  snapshot:{id:'SNAP-X',subjectId:'INITIATIVE-1'}
});
t(duplicate.duplicate);
t(duplicate.assessment===drifted);
t(engine.getAssessments().length===2);
t(engine.getAssessments()[0].sequence===1);
t(engine.getAssessments()[1].sequence===2);

const baseline=createExecutiveCertificationBaseline(baselineInput);
t(baseline.subjectId==='INITIATIVE-1');
const snapshot=createExecutiveCertificationSnapshot({
  id:'SNAP-DIRECT',
  subjectId:'INITIATIVE-1',
  controlStatuses:{C1:'failed'}
});
t(snapshot.controlStatuses.C1==='FAILED');
const detection=detectExecutiveCertificationDrift({baseline,snapshot,readinessTolerance:5});
t(detection.hasDrift);
const classification=classifyExecutiveCertificationDrift(detection);
t(classification.humanReviewRequired);

const ledger=createExecutiveCertificationMonitoringLedger({maxEntries:1});
t(!ledger.append({id:'L1'}).duplicate);
t(ledger.append({id:'L1'}).duplicate);
t(!ledger.append({id:'L2'}).duplicate);
t(ledger.list().length===1);
t(ledger.list()[0].id==='L2');
t(ledger.getStatus().appendOnly);

let mismatch=false;
try{
  engine.monitor({
    id:'MON-BAD',
    baselineId:'BASE-20-1',
    snapshot:{id:'BAD',subjectId:'OTHER'}
  });
}catch{mismatch=true}
t(mismatch);

engine.stop();
t(engine.getStatus().status==='STOPPED');
let stopped=false;
try{
  engine.monitor({
    id:'MON-STOP',
    baselineId:'BASE-20-1',
    snapshot:{id:'STOP',subjectId:'INITIATIVE-1'}
  });
}catch{stopped=true}
t(stopped);
engine.start();
t(engine.getStatus().status==='OPERATIONAL');

console.log(JSON.stringify({
  framework:'SCIIP_PHASE2_SPRINT20_EXECUTIVE_CERTIFICATION_MONITORING_DRIFT_INTELLIGENCE',
  status:'PASSED',
  testsRun:tests,
  result:{
    baselines:engine.getBaselines().length,
    monitoringAssessments:engine.getAssessments().length,
    stableStatus:stable.scorecard.monitoringStatus,
    driftStatus:drifted.scorecard.monitoringStatus,
    driftsDetected:drifted.scorecard.driftCount,
    recertificationRecommended:drifted.scorecard.recertificationRecommended,
    certificationRevocationAllowed:false,
    readOnly:true,
    advisoryOnly:true,
    humanReviewRequired:true,
    workflowMutationAllowed:false,
    autonomousExecutionAllowed:false,
    decisionTraceability:true
  }
},null,2));
