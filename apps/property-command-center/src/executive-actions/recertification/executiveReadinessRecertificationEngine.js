import{freezeDeep}from'./_shared.js';
import{createExecutiveRemediationEvidence}from'./executiveRemediationEvidence.js';
import{verifyExecutiveControl}from'./executiveControlVerification.js';
import{assessExecutiveResidualGaps}from'./executiveResidualGapAssessment.js';
import{rescoreExecutiveReadiness}from'./executiveReadinessRescore.js';
import{evaluateExecutiveCertificationGate}from'./executiveCertificationGate.js';
import{createExecutiveRecertificationScorecard}from'./executiveRecertificationScorecard.js';

export function createExecutiveReadinessRecertificationEngine({maxAssessments=25}={}){
  const assessments=[];
  const byId=new Map();
  let started=true;
  return Object.freeze({
    assess(input={}){
      if(!started)throw new Error('Recertification engine is stopped');
      if(!input.id)throw new Error('Recertification assessment id is required');
      if(!input.remediationPlan?.id)throw new Error('Remediation plan is required');
      if(byId.has(input.id))return{duplicate:true,assessment:byId.get(input.id)};
      const evidence=(input.evidence||[]).map(createExecutiveRemediationEvidence);
      const controls=(input.controls||[]).map(verifyExecutiveControl);
      const residualAssessment=assessExecutiveResidualGaps({
        actions:input.remediationPlan.actions||[],
        evidence,
        controls
      });
      const rescore=rescoreExecutiveReadiness({
        baselineScore:input.baselineReadinessScore,
        residualAssessment,
        controls
      });
      const gate=evaluateExecutiveCertificationGate({
        residualAssessment,
        rescore,
        humanSignoff:input.humanSignoff,
        evidence,
        controls
      });
      const scorecard=createExecutiveRecertificationScorecard({
        id:input.id,
        plan:input.remediationPlan,
        residualAssessment,
        rescore,
        gate,
        evidence,
        controls,
        sourceSignalIds:input.sourceSignalIds
      });
      const assessment=freezeDeep({
        id:String(input.id),
        createdAt:input.createdAt||new Date().toISOString(),
        remediationPlanId:input.remediationPlan.id,
        evidence,
        controls,
        residualAssessment,
        rescore,
        gate,
        scorecard,
        status:gate.status
      });
      byId.set(input.id,assessment);
      assessments.push(assessment);
      while(assessments.length>maxAssessments){
        const removed=assessments.shift();
        byId.delete(removed.id);
      }
      return{duplicate:false,assessment};
    },
    getAssessments(){return[...assessments]},
    getStatus(){return freezeDeep({
      status:started?'OPERATIONAL':'STOPPED',
      assessments:assessments.length,
      readOnly:true,
      advisoryOnly:true,
      humanReviewRequired:true,
      workflowMutationAllowed:false,
      autonomousExecutionAllowed:false
    })},
    stop(){started=false},
    start(){started=true}
  });
}
