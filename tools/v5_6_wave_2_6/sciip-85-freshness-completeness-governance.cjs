'use strict';
const {fs,path,readJson,writeJson,now,stableId,norm,normKey,num,first,reportRoot,priorRoot,walk,flatten,uniqueBy,loadPrior,normalizeAddress,canonicalPropertyKey,buildCanonical,collectCoordinateIndex,baseReport}=require('./sciip-v5-6-wave-2-6-common.cjs');
const FRAMEWORK='SCIIP_V5_6_FRESHNESS_COMPLETENESS_GOVERNANCE',VERSION='196.85.0';
function run(repo){if(!repo)throw new Error('Repository path required');
const u=loadPrior(repo), ts=Date.parse(u.generatedAt||0), ageHours=ts?Math.round((Date.now()-ts)/36e5):null;
const completeness={
 propertiesWithAddress:(u.properties||[]).filter(x=>x.address).length,
 propertiesWithCity:(u.properties||[]).filter(x=>x.city).length,
 propertiesWithCoordinates:(u.properties||[]).filter(x=>x.latitude!=null&&x.longitude!=null).length,
 recommendationsWithEvidenceId:(u.recommendations||[]).filter(x=>x.evidenceId).length
};
writeJson(path.join(reportRoot(repo),'freshness-completeness-governance.json'),{generatedAt:now(),ageHours,completeness});
return baseReport(FRAMEWORK,VERSION,{ageHours,dimensions:Object.keys(completeness).length,governed:true});
}
if(require.main===module){const repo=process.argv[2]||process.cwd();const r=run(repo);writeJson(path.join(reportRoot(repo),VERSION+'-'+FRAMEWORK.toLowerCase()+'.json'),r);console.log(JSON.stringify(r,null,2));if(r.status!=='PASSED')process.exitCode=1}
module.exports={run,FRAMEWORK,VERSION};
