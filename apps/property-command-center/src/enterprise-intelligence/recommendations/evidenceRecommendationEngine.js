const freeze=value=>Object.freeze(value);

export function generateEvidenceBackedRecommendations({signals=[],minimumConfidence=0.65}={}) {
  const recommendations=signals.map((signal,index)=>{
    const evidence=Array.isArray(signal.evidence)?signal.evidence:[];
    const inferred=evidence.length?Math.min(0.55+evidence.length*0.1,0.95):0.35;
    const confidence=Math.max(0,Math.min(1,Number(signal.confidence??inferred)));
    const action=signal.action||(
      signal.type==='OPPORTUNITY'?'REVIEW_OPPORTUNITY':
      signal.type==='RISK'?'MITIGATE_RISK':'INVESTIGATE_SIGNAL'
    );
    return freeze({
      recommendationId:`REC-${String(index+1).padStart(4,'0')}`,
      subjectId:signal.subjectId||null,
      type:signal.type||'INFORMATION',
      action,
      rationale:signal.rationale||signal.summary||'Evidence-backed review required.',
      confidence:Number(confidence.toFixed(2)),
      evidence:freeze(evidence.map(item=>freeze({...item}))),
      status:confidence>=minimumConfidence?'RECOMMENDED':'INSUFFICIENT_CONFIDENCE',
      approvalRequired:true,
      autonomousExecutionAllowed:false
    });
  });

  return freeze({
    recommendations:freeze(recommendations),
    total:recommendations.length,
    recommended:recommendations.filter(item=>item.status==='RECOMMENDED').length,
    insufficientConfidence:recommendations.filter(item=>item.status==='INSUFFICIENT_CONFIDENCE').length,
    evidenceRequired:true,approvalRequired:true,autonomousExecutionAllowed:false
  });
}
