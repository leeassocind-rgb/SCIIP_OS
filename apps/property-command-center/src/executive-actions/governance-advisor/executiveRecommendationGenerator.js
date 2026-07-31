import{freezeDeep,normalize,uniq}from'./_shared.js';

export function generateExecutiveGovernanceRecommendations({assessment,evidenceChain}={}){
  if(!assessment?.id)throw new Error('Monitoring assessment is required');
  const recommendations=[];
  for(const drift of assessment.detection?.drifts||[]){
    const type=normalize(drift.type);
    let action='REVIEW_GOVERNANCE_DRIFT';
    let domain='GOVERNANCE';
    if(type==='CONTROL_STATUS_DRIFT'){action='RETEST_CONTROL';domain='CONTROL';}
    else if(type==='POLICY_VERSION_DRIFT'){action='REVALIDATE_POLICY';domain='POLICY';}
    else if(type==='EVIDENCE_DRIFT'){action='REVERIFY_EVIDENCE';domain='EVIDENCE';}
    else if(type==='READINESS_SCORE_DRIFT'){action='REASSESS_READINESS';domain='READINESS';}
    else if(type==='NEW_EXCEPTION'||type==='NEW_WAIVER'){action='REVIEW_EXCEPTION';domain='EXCEPTION';}
    recommendations.push(freezeDeep({
      id:`REC:${assessment.id}:${type}:${drift.key}`,
      assessmentId:assessment.id,
      subjectId:assessment.baseline.subjectId,
      certificationId:assessment.baseline.certificationId,
      action,
      domain,
      title:`${action.replaceAll('_',' ')} — ${drift.key}`,
      rationale:`${type} detected between certified baseline and current snapshot.`,
      severity:normalize(drift.severity),
      evidenceIds:evidenceChain.evidenceIds,
      sourceSignalIds:uniq([
        ...(assessment.alert?.sourceSignalIds||[]),
        ...evidenceChain.sourceSignalIds
      ]),
      humanApprovalRequired:true,
      advisoryOnly:true,
      workflowMutationAllowed:false,
      autonomousExecutionAllowed:false
    }));
  }
  return recommendations;
}
