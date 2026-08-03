const freeze=v=>Object.freeze(v);
export function assessAIRisk({signals=[],weights={severity:1,likelihood:1,exposure:1}}={}){
 const risks=signals.map((s,i)=>{const score=(Number(s.severity||0)*Number(weights.severity||1))+(Number(s.likelihood||0)*Number(weights.likelihood||1))+(Number(s.exposure||0)*Number(weights.exposure||1));return freeze({riskId:s.riskId||`AI-RISK-${String(i+1).padStart(4,'0')}`,category:s.category||'UNKNOWN',score:Number(score.toFixed(2)),status:score>=12?'CRITICAL':score>=8?'HIGH':score>=4?'MEDIUM':'LOW',evidence:freeze([...(s.evidence||[])])})}).sort((a,b)=>b.score-a.score);
 return freeze({risks:freeze(risks),total:risks.length,critical:risks.filter(r=>r.status==='CRITICAL').length,high:risks.filter(r=>r.status==='HIGH').length,topRisk:risks[0]||null,evidenceBacked:true,approvalRequired:true,autonomousExecutionAllowed:false});
}
