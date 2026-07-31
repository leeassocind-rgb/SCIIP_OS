import{freezeDeep}from'./_shared.js';
import{createExecutiveCertificationBaseline}from'./executiveCertificationBaseline.js';
import{createExecutiveCertificationSnapshot}from'./executiveCertificationSnapshot.js';
import{detectExecutiveCertificationDrift}from'./executiveCertificationDriftDetector.js';
import{classifyExecutiveCertificationDrift}from'./executiveCertificationDriftClassifier.js';
import{createExecutiveCertificationAlert}from'./executiveCertificationAlert.js';
import{createExecutiveCertificationMonitoringScorecard}from'./executiveCertificationMonitoringScorecard.js';
import{createExecutiveCertificationMonitoringLedger}from'./executiveCertificationMonitoringLedger.js';

export function createExecutiveCertificationMonitoringEngine({maxEntries=100}={}){
  const baselines=new Map();
  const ledger=createExecutiveCertificationMonitoringLedger({maxEntries});
  let started=true;
  return Object.freeze({
    registerBaseline(input){
      const baseline=createExecutiveCertificationBaseline(input);
      if(baselines.has(baseline.id))return{duplicate:true,baseline:baselines.get(baseline.id)};
      baselines.set(baseline.id,baseline);
      return{duplicate:false,baseline};
    },
    monitor(input={}){
      if(!started)throw new Error('Certification monitoring engine is stopped');
      if(!input.id)throw new Error('Monitoring assessment id is required');
      const existing=ledger.get(input.id);
      if(existing)return{duplicate:true,assessment:existing};
      const baseline=baselines.get(input.baselineId);
      if(!baseline)throw new Error('Registered certification baseline is required');
      const snapshot=createExecutiveCertificationSnapshot(input.snapshot);
      if(snapshot.subjectId!==baseline.subjectId)throw new Error('Snapshot subject does not match baseline');
      const detection=detectExecutiveCertificationDrift({
        baseline,snapshot,readinessTolerance:input.readinessTolerance
      });
      const classification=classifyExecutiveCertificationDrift(detection);
      const alert=createExecutiveCertificationAlert({
        id:`ALERT:${input.id}`,baseline,snapshot,detection,classification
      });
      const scorecard=createExecutiveCertificationMonitoringScorecard({
        id:`SCORECARD:${input.id}`,baseline,snapshot,detection,classification,alert
      });
      const assessment=freezeDeep({
        id:String(input.id),
        baseline,
        snapshot,
        detection,
        classification,
        alert,
        scorecard,
        createdAt:input.createdAt||new Date().toISOString()
      });
      const appended=ledger.append(assessment);
      return{duplicate:false,assessment:appended.entry};
    },
    getBaselines:()=>[...baselines.values()],
    getAssessments:()=>ledger.list(),
    getStatus:()=>freezeDeep({
      status:started?'OPERATIONAL':'STOPPED',
      baselines:baselines.size,
      assessments:ledger.list().length,
      appendOnly:true,
      readOnly:true,
      advisoryOnly:true,
      humanReviewRequired:true,
      certificationRevocationAllowed:false,
      workflowMutationAllowed:false,
      autonomousExecutionAllowed:false
    }),
    stop(){started=false},
    start(){started=true}
  });
}
