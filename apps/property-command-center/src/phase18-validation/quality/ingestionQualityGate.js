const F=v=>Object.freeze(v);
export function evaluateIngestionQuality({batches=[],thresholds={maxErrorPct:1,maxDuplicatePct:2}}={}){
 const r=batches.map(b=>{const t=Math.max(1,Number(b.totalRows||0)),e=Number((Number(b.errorRows||0)/t*100).toFixed(2)),d=Number((Number(b.duplicateRows||0)/t*100).toFixed(2)),p=e<=thresholds.maxErrorPct&&d<=thresholds.maxDuplicatePct;return F({...b,errorPct:e,duplicatePct:d,passed:p,status:p?'QUALITY_PASSED':'QUALITY_BLOCKED'})});
 return F({batches:F(r),total:r.length,passed:r.filter(x=>x.passed).length,blocked:r.filter(x=>!x.passed).length,thresholds:F({...thresholds}),productionCommitAllowed:r.every(x=>x.passed),autonomousCommitAllowed:false});
}
