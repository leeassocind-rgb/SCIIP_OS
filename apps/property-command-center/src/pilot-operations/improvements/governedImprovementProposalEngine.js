const freeze=value=>Object.freeze(value);

export function createGovernedImprovementProposals({
  feedbackThemes=[],
  adoptionAnalytics={},
  issues=[]
}={}) {
  const proposals=[];
  const push=(proposal)=>proposals.push(freeze({
    proposalId:`IMP-${String(proposals.length+1).padStart(4,'0')}`,
    status:'PROPOSED',
    approvalRequired:true,
    changesAutoApplied:false,
    productionExecutionAuthorized:false,
    ...proposal
  }));

  for(const theme of feedbackThemes){
    if(theme.priority==='HIGH'){
      push({
        source:'FEEDBACK',
        workspace:theme.workspace,
        category:theme.category,
        rationale:`High-priority feedback theme with ${theme.responseCount} responses.`,
        evidenceCount:Number(theme.evidenceCount||0),
        recommendedAction:theme.recommendedAction||'REVIEW_AND_REMEDIATE',
        impact:'USER_EXPERIENCE'
      });
    }
  }

  for(const workspace of adoptionAnalytics.workspaces||[]){
    if(Number(workspace.failureRate||0)>=0.25){
      push({
        source:'ADOPTION',
        workspace:workspace.workspace,
        category:'WORKSPACE_RELIABILITY',
        rationale:`Failure rate ${(workspace.failureRate*100).toFixed(1)}% exceeds pilot threshold.`,
        evidenceCount:Number(workspace.interactions||0),
        recommendedAction:'INVESTIGATE_AND_REMEDIATE',
        impact:'WORKFLOW_RELIABILITY'
      });
    }
  }

  for(const issue of issues){
    if(['CRITICAL','HIGH'].includes(issue.severity)&&issue.status!=='CLOSED'){
      push({
        source:'ISSUE_TRIAGE',
        workspace:issue.workspace||'ENTERPRISE',
        category:issue.category||'GENERAL',
        rationale:`${issue.severity} pilot issue requires governed remediation.`,
        evidenceCount:Number(issue.evidenceCount||0),
        recommendedAction:'REMEDIATE_BEFORE_GRADUATION',
        impact:'PILOT_READINESS'
      });
    }
  }

  return freeze({
    proposals:freeze(proposals),
    total:proposals.length,
    highImpact:proposals.filter(item=>item.impact==='PILOT_READINESS').length,
    approvalRequired:true,
    changesAutoApplied:false,
    productionExecutionAuthorized:false
  });
}
