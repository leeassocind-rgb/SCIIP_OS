const freeze=value=>Object.freeze(value);
const safe=value=>Array.isArray(value)?value:[];

export function createCopilotExperience({response=null,history=[],selectedEvidence=null}={}){
  const evidence=safe(response?.evidence).map(item=>freeze({
    id:item.id,
    type:item.type||'Evidence',
    label:item.label||item.id,
    reason:item.reason||'Governed evidence',
    attributes:freeze({...item.attributes})
  }));
  const recommendations=safe(response?.recommendations).map(item=>freeze({
    rank:Number(item.rank||0),
    nodeId:item.nodeId,
    label:item.label||item.nodeId,
    score:Number(item.score||0),
    explanation:item.explanation||'Evidence-backed recommendation'
  }));
  const confidence=Number(response?.confidence||0);
  return freeze({
    ready:Boolean(response),
    requestId:response?.requestId||null,
    intent:response?.intent||'UNCLASSIFIED',
    answer:response?.answer||'Grounded intelligence is ready.',
    confidence,
    confidencePct:Math.round(confidence*100),
    confidenceBand:response?.confidenceBand||'LOW',
    grounded:Boolean(response?.grounded),
    approvalRequired:Boolean(response?.approvalRequired),
    evidence:freeze(evidence),
    recommendations:freeze(recommendations),
    evidenceCount:evidence.length,
    recommendationCount:recommendations.length,
    selectedEvidenceId:selectedEvidence?.id||evidence[0]?.id||null,
    historyCount:safe(history).length,
    policyVersion:response?.policyVersion||null,
    generatedAt:response?.generatedAt||null,
    explainable:true,
    brokerControlled:true,
    autonomousConsequentialActions:'BLOCKED'
  });
}
