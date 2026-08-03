const freeze=v=>Object.freeze(v);
export function optimizeCrossPortfolio({portfolios=[],constraints={}}={}){
 const rows=portfolios.map(x=>{const risk=Number(x.riskScore||0),capacity=Number(x.capacityFit||0),score=Number((Number(x.expectedValue||0)*.40+capacity*.25+Number(x.strategicFit||0)*.25-risk*.20).toFixed(2)),eligible=(!constraints.maximumRisk||risk<=constraints.maximumRisk)&&(!constraints.minimumCapacityFit||capacity>=constraints.minimumCapacityFit);return freeze({...x,score,eligible,status:eligible?'OPTIMIZATION_CANDIDATE':'CONSTRAINED',approvalRequired:true})}).sort((a,b)=>b.score-a.score);
 return freeze({portfolios:freeze(rows),candidates:freeze(rows.filter(x=>x.eligible)),candidateCount:rows.filter(x=>x.eligible).length,topCandidate:rows.find(x=>x.eligible)||null,constraintsApplied:true,assumptionsVisible:true,executiveApprovalRequired:true,autonomousReallocationAllowed:false});
}
