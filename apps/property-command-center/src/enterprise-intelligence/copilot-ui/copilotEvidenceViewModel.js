const freeze=value=>Object.freeze(value);

export function createCopilotEvidenceViewModel({copilot={}}={}) {
  const citations=Array.isArray(copilot.citations)?copilot.citations:[];
  return freeze({
    question:copilot.question||'',
    answer:copilot.answer||'',
    confidence:Number(copilot.confidence||0),
    grounded:Boolean(copilot.grounded),
    citations:freeze(citations.map(item=>freeze({...item}))),
    evidenceCount:citations.length,
    unsupportedClaimsAllowed:false,
    executionAuthority:false
  });
}
