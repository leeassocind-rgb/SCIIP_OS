'use strict';
const {fs,path,readJson,writeJson,now,stableId,norm,normKey,num,first,reportRoot,priorRoot,walk,flatten,uniqueBy,loadPrior,normalizeAddress,canonicalPropertyKey,buildCanonical,collectCoordinateIndex,baseReport}=require('./sciip-v5-6-wave-2-6-common.cjs');
const FRAMEWORK='SCIIP_V5_6_FRONTEND_WORKER_INDEX_PLAN',VERSION='196.81.0';
function run(repo){if(!repo)throw new Error('Repository path required');
const plan={worker:'intelligence-index.worker.js',jobs:['BUILD_PROPERTY_INDEX','BUILD_GRAPH_INDEX','BUILD_SPATIAL_INDEX','SEARCH'],transferableResults:true,incremental:true};
writeJson(path.join(reportRoot(repo),'frontend-worker-index-plan.json'),{generatedAt:now(),plan});
return baseReport(FRAMEWORK,VERSION,{workerJobs:plan.jobs.length,incremental:true});
}
if(require.main===module){const repo=process.argv[2]||process.cwd();const r=run(repo);writeJson(path.join(reportRoot(repo),VERSION+'-'+FRAMEWORK.toLowerCase()+'.json'),r);console.log(JSON.stringify(r,null,2));if(r.status!=='PASSED')process.exitCode=1}
module.exports={run,FRAMEWORK,VERSION};
