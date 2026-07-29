export const COPILOT_POLICY=Object.freeze({
 version:'release-1-sprint-6.0',
 mode:'EVIDENCE_GROUNDED',
 consequentialActions:'BROKER_APPROVAL_REQUIRED',
 unsupportedClaims:'BLOCKED',
 minimumConfidence:0.35,
 maxEvidenceItems:12,
 supportedIntents:Object.freeze(['PROPERTY_SEARCH','ASSIGNMENT_SUMMARY','COMPARABLE_SUPPORT','EXPLAIN_RANKING','MARKET_SUMMARY','GRAPH_QUESTION'])
});
export function confidenceBand(score){if(score>=.8)return'HIGH';if(score>=.55)return'MEDIUM';return'LOW'}
export function assertCopilotPolicy(){const errors=[];if(COPILOT_POLICY.mode!=='EVIDENCE_GROUNDED')errors.push('Copilot must be evidence grounded');if(COPILOT_POLICY.consequentialActions!=='BROKER_APPROVAL_REQUIRED')errors.push('Broker approval is required');if(COPILOT_POLICY.unsupportedClaims!=='BLOCKED')errors.push('Unsupported claims must be blocked');return{valid:errors.length===0,errors}}
