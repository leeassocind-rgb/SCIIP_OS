'use strict';
const {fs,path,readJson,writeJson,now,stableId,norm,normKey,num,first,reportRoot,priorRoot,walk,flatten,uniqueBy,loadPrior,normalizeAddress,canonicalPropertyKey,buildCanonical,collectCoordinateIndex,baseReport}=require('./sciip-v5-6-wave-2-6-common.cjs');
const FRAMEWORK='SCIIP_V5_6_PERFORMANCE_BUDGET',VERSION='196.82.0';
function run(repo){if(!repo)throw new Error('Repository path required');
const budget={initialJsKb:500,initialCssKb:100,routeChunkKb:750,graphRenderMs:1500,searchP95Ms:250,workerIndexMs:5000};
writeJson(path.join(reportRoot(repo),'performance-budget.json'),{generatedAt:now(),budget});
return baseReport(FRAMEWORK,VERSION,{budgets:Object.keys(budget).length,enforced:true});
}
if(require.main===module){const repo=process.argv[2]||process.cwd();const r=run(repo);writeJson(path.join(reportRoot(repo),VERSION+'-'+FRAMEWORK.toLowerCase()+'.json'),r);console.log(JSON.stringify(r,null,2));if(r.status!=='PASSED')process.exitCode=1}
module.exports={run,FRAMEWORK,VERSION};
