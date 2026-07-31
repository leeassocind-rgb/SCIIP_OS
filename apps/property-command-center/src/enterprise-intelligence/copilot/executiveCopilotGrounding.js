const freeze=value=>Object.freeze(value);

export function groundExecutiveCopilot({
  question,
  searchResults=[],
  reasoningFindings=[],
  recommendations=[]
}={}) {
  const citations=[];

  for(const result of searchResults.slice(0,5)){
    citations.push(freeze({
      kind:'GRAPH_NODE',id:result.nodeId,label:result.label,score:result.score
    }));
  }
  for(const finding of reasoningFindings.slice(0,5)){
    citations.push(freeze({
      kind:'REASONING_PATH',id:finding.nodeId,
      path:freeze([...(finding.path||[])]),hops:finding.hops
    }));
  }
  for(const recommendation of recommendations.slice(0,5)){
    for(const evidence of recommendation.evidence||[]){
      citations.push(freeze({
        kind:'RECOMMENDATION_EVIDENCE',
        id:recommendation.recommendationId,
        evidence:freeze({...evidence})
      }));
    }
  }

  const confidence=Math.min(0.98,Number((0.45+Math.min(citations.length,8)*0.06).toFixed(2)));
  return freeze({
    question:String(question||''),
    answer:citations.length
      ? `Grounded answer prepared from ${citations.length} governed evidence references.`
      : 'Insufficient governed evidence to answer confidently.',
    confidence,
    citations:freeze(citations),
    grounded:citations.length>0,
    evidenceCount:citations.length,
    unsupportedClaimsAllowed:false,
    executionAuthority:false
  });
}
