import{freezeDeep,uniq}from'./_shared.js';

export function createExecutiveCertificationAlert({id,baseline,snapshot,detection,classification}={}){
  if(!id)throw new Error('Certification alert id is required');
  return freezeDeep({
    id:String(id),
    subjectId:baseline.subjectId,
    certificationId:baseline.certificationId,
    snapshotId:snapshot.id,
    status:classification.status,
    severity:detection.maxSeverity,
    driftCount:detection.driftCount,
    driftTypes:uniq(detection.drifts.map(item=>item.type)),
    recertificationRecommended:classification.recertificationRecommended,
    humanReviewRequired:classification.humanReviewRequired,
    certificationRevocationAllowed:false,
    workflowMutationAllowed:false,
    autonomousExecutionAllowed:false,
    sourceSignalIds:detection.sourceSignalIds
  });
}
