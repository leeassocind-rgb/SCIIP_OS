'use strict';
const {fs,path,readJson,writeJson,now,stableId,norm,normKey,num,first,reportRoot,priorRoot,walk,flatten,uniqueBy,loadPrior,normalizeAddress,canonicalPropertyKey,buildCanonical,collectCoordinateIndex,baseReport}=require('./sciip-v5-6-wave-2-6-common.cjs');
const FRAMEWORK='SCIIP_V5_6_COORDINATE_ALIAS_DISCOVERY',VERSION='196.74.0';
function run(repo){if(!repo)throw new Error('Repository path required');
const u=loadPrior(repo), c=buildCanonical(u), idx=collectCoordinateIndex(repo,u,c);
writeJson(path.join(reportRoot(repo),'coordinate-alias-index.json'),{generatedAt:now(),entries:[...idx.entries()].map(([key,value])=>({key,...value}))});
return baseReport(FRAMEWORK,VERSION,{coordinateAliases:idx.size,sourceProperties:(u.properties||[]).length});
}
if(require.main===module){const repo=process.argv[2]||process.cwd();const r=run(repo);writeJson(path.join(reportRoot(repo),VERSION+'-'+FRAMEWORK.toLowerCase()+'.json'),r);console.log(JSON.stringify(r,null,2));if(r.status!=='PASSED')process.exitCode=1}
module.exports={run,FRAMEWORK,VERSION};
