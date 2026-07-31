import{freezeDeep,round}from'./_shared.js';

export function createExecutiveCertificationMonitoringScorecard({
  id,baseline,snapshot,detection,classification,alert
}={}){
  const penalty=(classification.counts.CRITICAL*30)+(classification.counts.HIGH*15)+
    (classification.counts.MEDIUM*7)+(classification.counts.LOW*2);
  const monitoringScore=Math.max(0,round(100-penalty));
  return freezeDeep({
    id:String(id),
    subjectId:baseline.subjectId,
    certificationId:baseline.certificationId,
    baselineId:baseline.id,
    snapshotId:snapshot.id,
    driftCount:detection.driftCount,
    maxSeverity:detection.maxSeverity,
    monitoringStatus:classification.status,
    monitoringScore,
    readinessDelta:detection.readinessDelta,
    recertificationRecommended:classification.recertificationRecommended,
    alertId:alert.id,
    readOnly:true,
    advisoryOnly:true,
    humanReviewRequired:classification.humanReviewRequired,
    certificationRevocationAllowed:false,
    workflowMutationAllowed:false,
    autonomousExecutionAllowed:false,
    decisionTraceability:true
  });
}
