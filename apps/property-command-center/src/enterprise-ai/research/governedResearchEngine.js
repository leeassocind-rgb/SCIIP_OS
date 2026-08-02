const freeze=value=>Object.freeze(value);

export function runGovernedResearch({
  question,
  sources=[],
  minimumConfidence=.65
}={}) {
  if(!question) throw new Error('question is required');

  const validSources=sources.filter(source=>source.verified&&source.citation);
  const weightedConfidence=validSources.length
    ? validSources.reduce((sum,source)=>sum+Number(source.confidence||0),0)/validSources.length
    : 0;

  const confidence=Number(weightedConfidence.toFixed(2));
  const claims=validSources.map((source,index)=>freeze({
    claimId:`CLAIM-${String(index+1).padStart(4,'0')}`,
    text:source.claim,
    citation:source.citation,
    confidence:Number(source.confidence||0),
    sourceId:source.sourceId
  }));

  return freeze({
    question,
    claims:freeze(claims),
    citations:freeze(claims.map(claim=>claim.citation)),
    evidenceCount:claims.length,
    confidence,
    status:claims.length&&confidence>=minimumConfidence?'RESEARCH_READY':'INSUFFICIENT_EVIDENCE',
    sourceValidationRequired:true,
    unsupportedClaimsAllowed:false,
    approvalRequired:true,
    autonomousExecutionAllowed:false
  });
}
